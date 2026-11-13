#!/bin/bash
# Build a cPanel upload tarball on this machine.
# Does not include .env or ssh keys. Create .env on the server after extract.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OUT="${ROOT}/sardarstore-cpanel.tar.gz"
SITE_URL="${CPANEL_SITE_URL:-https://example.com}"

if [ ! -d node_modules ]; then
  echo "Run npm ci first."
  exit 1
fi

echo "Generating Prisma client..."
npx prisma generate

echo "Building Next.js for ${SITE_URL}..."
export NODE_ENV=production
export SKIP_DB_BUILD=1
export NEXT_PUBLIC_SITE_URL="$SITE_URL"
npx next build

echo "Packing ${OUT}..."
rm -f "$OUT"
COPYFILE_DISABLE=1 tar -czf "$OUT" \
  --exclude='./.git' \
  --exclude='./.github' \
  --exclude='./.env' \
  --exclude='./.env.*' \
  --exclude='./.next/cache' \
  --exclude='./.vercel' \
  --exclude='./sshkey' \
  --exclude='./sshkey.pub' \
  --exclude='./public/uploads' \
  --exclude='./sardarstore-cpanel.tar.gz' \
  --exclude='./sardarstore-release.tar.gz' \
  --exclude='./*.tar.gz' \
  --exclude='./.DS_Store' \
  -C "$ROOT" \
  .

BYTES="$(wc -c < "$OUT" | tr -d ' ')"
echo "Done: ${OUT} (${BYTES} bytes)"
echo
echo "On cPanel:"
echo "1. File Manager → app folder (e.g. /home/YOURUSER/sardarstore)"
echo "2. Upload and Extract sardarstore-cpanel.tar.gz"
echo "3. Create .env in that folder (see .env.example)"
echo "4. Setup Node.js App: Node 20, startup file = server.js, then Restart"
