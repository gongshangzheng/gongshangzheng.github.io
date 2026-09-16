Research brief written (23 KB). Here's the condensed result.

## Highlights from the brief

**The core strategic finding:** this direction is structurally different from "AI for medical diagnosis." Diagnosis has public benchmarks (HAM10000, ISIC, cephalometric challenges); **outcome-appearance prediction has no public benchmark, no standard metric, and almost no public data** — because the required training signal is *paired same-patient pre/post treatment imaging*, which is institutional and private everywhere. That single fact explains why the line has run 20+ years without consolidating into a field.

**Timeline is unusually clean:**
- ~1990s 2D cephalometric VTO (Ricketts) → ~1998-2003 patient-specific FEM face models (Chabanas/Luboz/Payan at Grenoble; Gladilin/Zachow at ZIB Berlin) → ~2004-2008 clinical validation + commercialization (Mollemans/Suetens at KU Leuven/Medicim → Materialise **ProPlan CMF**) → ~2006-2016 statistical shape models + 3D photogrammetry (GOSH/UCL) → ~2017-2022 GAN I2I + face-aging models (Lifespan, SAM) → ~2022-2025 diffusion/ControlNet + 3D-native generation. **The GAN/diffusion wave has largely not reached the clinical side yet.**

**Clinical reality vs academic state:** what hospitals actually use is ~20-year-old finite-element/biomechanical software (ProPlan CMF, Dolphin, ClinCheck), not deep learning. Deep learning's genuine wins are all **pre-processing**: segmentation, cephalometric landmark detection, automatic tooth/crown generation. Much of the "orthodontic AI" literature is landmark detection misread as outcome prediction.

**The specific gap that matches your upstream question:** I could not identify *any* paper on predicting skin appearance after acne clearance, nor post-treatment scar appearance, nor convincing GAN/diffusion rhinoplasty-outcome papers. Post-acne work clusters entirely around **severity grading/counting** (ACNE04 etc.), not synthesis of the cleared state. I flagged these as falsification queries (#9, #27, #40) rather than padding them.

**Three things I deliberately did not do,** per your instruction: no citation counts, no URLs, no confident years where I was unsure. The table has an empty `—` column for OpenAlex to fill, and I gave 13 exact title-reverse-lookup strings for that.

The brief ends with a **40-query executable plan** tagged by channel (`[OA]`/`[arXiv]`/`[WEB]`) with each query mapped to the specific hypothesis it validates, plus the 13 DOI-lookup titles.

## Two things worth your attention

**1. I was unable to execute a single web search.** Tools exposed to me were `read`, `write`, `contact_supervisor`, `intercom` — no shell, no `web_search`, no `web_fetch`. The `web-search` skill's entire channel set depends on running `search.py`/`openalex.py`, and `read` rejects URLs (verified: `https://arxiv.org/abs/...` → ENOENT). I raised this with you and am executing the A+B plan you chose. **Consequence: the parent must actually run the 40 queries** — this brief is a hypothesis list, not verified research.

**2. On scope of edits:** the task said "只做调研，不修改任何文件." I wrote only to the runtime-designated artifact path outside the repo. No repo source files were touched.