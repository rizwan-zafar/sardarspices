#!/bin/bash
set -euo pipefail

APP_PATH="${1:?App path is required}"
NODEVENV="${2:-}"

cd "$APP_PATH"

is_cloudlinux_wrapper() {
  local first
  [ -f "$1" ] || return 1
  first="$(head -c 512 "$1" 2>/dev/null | tr -d '\000' | head -n 1 || true)"
  case "$first" in
    *bash*|*/bin/sh*) return 0 ;;
  esac
  return 1
}

if [ -z "$NODEVENV" ]; then
  echo "ERROR: CPANEL_NODEVENV was empty."
  echo "Expected: /home/YOURUSER/nodevenv/sardarstore/20/bin/activate"
  exit 1
fi

if [ -d "$NODEVENV" ]; then
  NODEVENV_BIN="$NODEVENV"
elif [ -f "$NODEVENV" ]; then
  NODEVENV_BIN="$(cd "$(dirname "$NODEVENV")" && pwd)"
else
  echo "ERROR: CPANEL_NODEVENV does not exist on the server: $NODEVENV"
  exit 1
fi

NODE_VERSION="$(basename "$(cd "$NODEVENV_BIN/.." && pwd)")"

find_real_toolchain() {
  local version="$1"
  local d
  local candidates=(
    "/opt/alt/alt-nodejs${version}/root/usr/bin"
    "/opt/alt/alt-nodejs${version}/bin"
    "/opt/cpanel/ea-nodejs${version}/bin"
  )
  for d in /opt/alt/alt-nodejs*/root/usr/bin /opt/alt/alt-nodejs*/bin /opt/cpanel/ea-nodejs*/bin; do
    [ -d "$d" ] && candidates+=("$d")
  done
  for d in "${candidates[@]}"; do
    [ -x "$d/node" ] || continue
    [ -e "$d/npm" ] || continue
    is_cloudlinux_wrapper "$d/node" && continue
    is_cloudlinux_wrapper "$d/npm" && continue
    printf '%s\n' "$d"
    return 0
  done
  return 1
}

REAL_BIN="$(find_real_toolchain "$NODE_VERSION" || true)"
if [ -z "$REAL_BIN" ]; then
  echo "ERROR: Could not find a real Node.js toolchain (not the CloudLinux wrapper)."
  echo "nodevenv wrappers: $NODEVENV_BIN"
  ls -la /opt/alt 2>/dev/null || true
  ls -la "$NODEVENV_BIN" || true
  exit 1
fi

export CL_APP_ROOT="$APP_PATH"
export CL_VIRTUAL_ENV="$(cd "$NODEVENV_BIN/.." && pwd)"
export PATH="$APP_PATH/node_modules/.bin:$REAL_BIN:$PATH"
hash -r

if is_cloudlinux_wrapper "$(command -v node)"; then
  echo "ERROR: PATH still points at a CloudLinux node wrapper"
  exit 1
fi

echo "Using $(command -v node) $(node -v)"

if [ ! -d node_modules ] || [ ! -d .next ]; then
  echo "ERROR: Release is missing node_modules or .next."
  echo "GitHub Actions must install and build before upload. This server cannot run npm ci."
  exit 1
fi

if [ -f .env ]; then
  set -a
  set +u
  # shellcheck disable=SC1091
  source .env
  set -u
  set +a
fi

export JWT_SECRET="${JWT_SECRET:-${AUTH_SECRET:-}}"
if [ -z "${DATABASE_URL:-}" ] || [ -z "${JWT_SECRET:-}" ] || [ -z "${NEXT_PUBLIC_SITE_URL:-}" ]; then
  echo "ERROR: $APP_PATH/.env must contain DATABASE_URL, JWT_SECRET (or AUTH_SECRET), and NEXT_PUBLIC_SITE_URL"
  exit 1
fi

export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=384"

mkdir -p public/uploads tmp

if [ ! -d node_modules/.prisma/client ] && [ ! -d node_modules/@prisma/client ]; then
  echo "ERROR: Prisma client is missing from the release. GitHub must run prisma generate before upload."
  exit 1
fi

echo "Skipping automatic schema migration. Run prisma migrate deploy on the server when needed."

mkdir -p tmp
touch tmp/restart.txt

if command -v cloudlinux-selector >/dev/null 2>&1; then
  cloudlinux-selector restart --json --interpreter=nodejs --app-root="$APP_PATH" || true
fi

echo "Deploy finished. App restarted."
