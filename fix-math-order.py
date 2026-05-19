#!/usr/bin/env python3
with open('lib/generator.js', 'r') as f:
    lines = f.readlines()

# Lines are 0-indexed. Lines 152-164 (1-indexed) = lines 151-163 (0-indexed)
# Lines 153: '    );\n'
# Lines 154-159: math inline block  
# Lines 160-164: citation block
# Lines 165: '\n'
# Lines 166: processShortcodes

print("Before:")
for i in range(151, 166):
    print(f"{i+1}: {repr(lines[i])}")

# Replace lines 154-165 (0-indexed: 153-164)
new_lines = [
    "    // $key$ citations: must run BEFORE math so dollar keys are stripped first\n",
    "    bodyHtml = bodyHtml.replace(\n",
    "      /\\$([^$]{4,})\\$/g,\n",
    "      function(_, key) { return '<cite>' + key + '</cite>'; }\n",
    "    );\n",
    "    // Inline $...$ math — keep $ delimiters so MathJax finds them in the DOM\n",
    "    bodyHtml = bodyHtml.replace(\n",
    "      /\\$([^$\\n]+?)\\$/g,\n",
    "      function(_, latex) {\n",
    "        return '<span class=\"math-inline\">$' + latex + '$</span>';\n",
    "      }\n",
    "    );\n",
    "\n",
]

# Replace lines 154-165 (0-indexed 153-164 inclusive = 12 lines)
lines[153:165] = new_lines

print("\nAfter:")
for i in range(151, 170):
    print(f"{i+1}: {repr(lines[i])}")

with open('lib/generator.js', 'w') as f:
    f.writelines(lines)
print("\nDone!")
