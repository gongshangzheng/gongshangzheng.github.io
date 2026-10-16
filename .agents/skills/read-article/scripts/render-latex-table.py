#!/usr/bin/env python3
"""Render a selected LaTeX table fragment, preserving its source and build log.

This compiles reviewed TeX; it does not extract tables from an entire paper or
convert LaTeX into Markdown. Run in the paper's source directory when the
fragment uses relative inputs. TeX is executable input, not sandboxed by this tool.
"""

import argparse
import hashlib
import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Selected table .tex fragment")
    parser.add_argument("-o", "--output", required=True, type=Path, help="Output .webp")
    parser.add_argument("--preamble", type=Path, help="Reviewed packages/macros, no document environment")
    parser.add_argument("--source-root", type=Path, help="Working directory for relative TeX inputs")
    parser.add_argument("--engine", choices=("pdflatex", "xelatex"), default="pdflatex")
    parser.add_argument("--width-mm", type=float, default=180, help="Page width, default 180 mm")
    parser.add_argument("--height-mm", type=float, default=240, help="Page height, default 240 mm")
    parser.add_argument("--dpi", type=int, default=300)
    parser.add_argument("--padding", type=float, default=0.02, help="Whitespace crop padding ratio")
    parser.add_argument("--table-number", type=int, help="Original table number for the caption")
    parser.add_argument("--force", action="store_true", help="Replace existing output files")
    args = parser.parse_args()

    source = args.source.expanduser().resolve()
    output = args.output.expanduser().resolve()
    root = args.source_root.expanduser().resolve() if args.source_root else source.parent
    if not source.is_file() or not root.is_dir():
        parser.error("Source must be a file and source root must be a directory")
    if output.suffix.lower() != ".webp":
        parser.error("Output must end in .webp")
    if args.width_mm <= 20 or args.height_mm <= 20 or args.dpi <= 0 or not 0 <= args.padding <= 0.2:
        parser.error("Page dimensions must exceed 20 mm, DPI must be positive, padding must be 0..0.2")
    if args.table_number is not None and args.table_number < 1:
        parser.error("Table number must be positive")
    engine = shutil.which(args.engine)
    if not engine:
        parser.error(f"{args.engine} is unavailable; install TeX or use the manual Markdown/Org route")

    products = {"image": output, "pdf": output.with_suffix(".pdf"),
                "tex": output.with_suffix(".tex"), "log": output.with_suffix(".log"),
                "metadata": output.with_suffix(".json")}
    reserved_paths = {p.resolve() for p in products.values()}
    reserved_paths.update((output.with_suffix(".failed.tex").resolve(), output.with_suffix(".failed.log").resolve()))
    if source in reserved_paths or (args.preamble and args.preamble.expanduser().resolve() in reserved_paths):
        parser.error("Output paths must not overwrite source or preamble")
    existing = [str(p) for p in products.values() if p.exists()]
    if existing and not args.force:
        parser.error("Outputs already exist; choose another output or pass --force: " + ", ".join(existing))

    body = source.read_text(encoding="utf-8")
    if "\\documentclass" in body or "\\begin{document}" in body:
        parser.error("Provide a table fragment, not a complete paper")
    preamble = args.preamble.expanduser().resolve().read_text(encoding="utf-8") if args.preamble else ""
    counter = f"\\setcounter{{table}}{{{args.table_number - 1}}}\n" if args.table_number else ""
    wrapper = (
        "\\documentclass{article}\n"
        f"\\usepackage[paperwidth={args.width_mm}mm,paperheight={args.height_mm}mm,margin=5mm]{{geometry}}\n"
        "\\usepackage{booktabs,array,multirow,tabularx,graphicx,amsmath,amssymb,xcolor}\n"
        "\\pagestyle{empty}\n\\setlength{\\parindent}{0pt}\n"
        + preamble + "\n\\begin{document}\n" + counter + body
        + "\n\\clearpage\n\\end{document}\n"
    )
    output.parent.mkdir(parents=True, exist_ok=True)
    # A unique build directory avoids stale PDFs and leaves the source tree intact.
    with tempfile.TemporaryDirectory(prefix="latex-table-") as temp:
        work = Path(temp)
        tex = work / "table.tex"
        tex.write_text(wrapper, encoding="utf-8")
        # Keep diagnostics separate until success; --force must not mix a failed
        # attempt's TeX/log with an earlier successful image and metadata.
        attempt_tex = output.with_suffix(".failed.tex")
        attempt_log = output.with_suffix(".failed.log")
        attempt_tex.write_text(wrapper, encoding="utf-8")
        command = [engine, "-no-shell-escape", "-interaction=nonstopmode", "-halt-on-error",
                   "-file-line-error", "-output-directory=" + str(work), str(tex)]
        try:
            result = subprocess.run(command, cwd=root, capture_output=True, text=True,
                                    errors="replace", timeout=120)
        except subprocess.TimeoutExpired as exc:
            attempt_log.write_text("Compilation timed out after 120 seconds\n", encoding="utf-8")
            raise RuntimeError(f"Compilation timed out; inspect {attempt_tex}") from exc
        log = work / "table.log"
        log_text = log.read_text(encoding="utf-8", errors="replace") if log.exists() else result.stdout + result.stderr
        attempt_log.write_text(log_text, encoding="utf-8")
        pdf = work / "table.pdf"
        if result.returncode or not pdf.exists():
            raise RuntimeError(f"Compilation failed; inspect {attempt_log}. Supply missing macros via --preamble.")
        import fitz
        with fitz.open(pdf) as doc:
            if len(doc) != 1:
                raise RuntimeError("Expected one page. Select one table or increase --height-mm; inspect the TeX/log.")
        if "Overfull \\hbox" in log_text or "Overfull \\vbox" in log_text or "Float too large" in log_text:
            raise RuntimeError(f"Table may overflow. Adjust page dimensions or fragment; inspect {attempt_log}.")

        converter_path = Path(__file__).resolve().parents[4] / "scripts" / "convert-figures.py"
        spec = importlib.util.spec_from_file_location("paper_figure_converter", converter_path)
        converter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(converter)
        staged_image = work / "table.webp"
        if not converter.convert_one(pdf, staged_image, dpi=args.dpi, padding_pct=args.padding):
            raise RuntimeError("Image conversion failed; no new image was published")
        products["tex"].write_text(wrapper, encoding="utf-8")
        products["log"].write_text(log_text, encoding="utf-8")
        shutil.copyfile(pdf, products["pdf"])
        shutil.copyfile(staged_image, output)
        attempt_tex.unlink(missing_ok=True)
        attempt_log.unlink(missing_ok=True)

    metadata = {"source": str(source), "source_sha256": hashlib.sha256(body.encode()).hexdigest(),
                "source_root": str(root), "preamble": str(args.preamble.resolve()) if args.preamble else None,
                "engine": engine, "table_number": args.table_number, "dpi": args.dpi,
                "padding": args.padding, "page_mm": [args.width_mm, args.height_mm],
                "kind": "latex-source-render", "visual_review": "pending"}
    products["metadata"].write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Created {output}; visually check headings, values, footnotes and crop before inserting.")


if __name__ == "__main__":
    try:
        main()
    except (OSError, RuntimeError, ValueError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)
