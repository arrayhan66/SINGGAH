#!/usr/bin/env bash
#
# Render seluruh diagram use case SINGGAH menjadi PNG.
#
# Kebutuhan:
#   - Java 8 atau lebih baru
#   - plantuml.jar (unduh sekali dari https://github.com/plantuml/plantuml/releases)
#
# Pemakaian:
#   ./render.sh              -> render ke folder png/
#   ./render.sh svg          -> render ke folder svg/
#
set -euo pipefail

cd "$(dirname "$0")"

FORMAT="${1:-png}"
JAR="plantuml.jar"
OUT_DIR="$FORMAT"

if ! command -v java >/dev/null 2>&1; then
  echo "ERROR: java tidak ditemukan. Pasang Java 8 atau lebih baru." >&2
  exit 1
fi

if [ ! -f "$JAR" ]; then
  echo "ERROR: $JAR tidak ditemukan." >&2
  echo "Unduh dari: https://github.com/plantuml/plantuml/releases" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

# -tpng / -tsvg   : format keluaran
# -o              : folder tujuan relatif terhadap file .puml
# -charset UTF-8  : teks Indonesia tetap terbaca benar
# -failfast2      : berhenti pada file pertama yang gagal
java -jar "$JAR" \
  -t"$FORMAT" \
  -o "$OUT_DIR" \
  -charset UTF-8 \
  -failfast2 \
  ./*.puml

echo ""
echo "Selesai. Hasil tersimpan di $(pwd)/$OUT_DIR/"
ls -1 "$OUT_DIR"
