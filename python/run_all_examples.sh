#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

EXAMPLES=$(find "$SCRIPT_DIR" -name "examples.py" -type f | sort)

count=0
total=$(echo "$EXAMPLES" | wc -l)

for example in $EXAMPLES; do
  count=$((count + 1))
  rel_path="${example#$SCRIPT_DIR/}"
  echo "[$count/$total] Running: $rel_path"
  PYTHONPATH="$SCRIPT_DIR" python3 "$example"
  echo ""
done

echo "All Python examples completed."