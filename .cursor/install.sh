#!/usr/bin/env bash
# Idempotent Cloud Agent bootstrap for Financy.
# Prepares Node.js 24 (see .nvmrc), pnpm, local env files, dependencies,
# the Prisma client and the SQLite dev database. Safe to run repeatedly.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

NODE_VERSION="$(tr -d ' \t\r\n' < .nvmrc)"
PNPM_VERSION="11.19.0"

# --- Node.js 24 via nvm -------------------------------------------------------
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo "Installing nvm..."
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"

nvm install "$NODE_VERSION"
NODE_BIN="$(dirname "$(nvm which "$NODE_VERSION")")"

# The Cloud Agent base image ships another `node` earlier on PATH. Put the
# project's Node 24 first for this script and for every future shell so
# pnpm's engine-strict check is satisfied everywhere.
export PATH="$NODE_BIN:$PATH"
MARKER="# financy-node-path"
for RC in "$HOME/.bashrc" "$HOME/.profile"; do
  if [ -f "$RC" ] && ! grep -qF "$MARKER" "$RC"; then
    {
      echo ""
      echo "$MARKER"
      echo "export NVM_DIR=\"\${NVM_DIR:-\$HOME/.nvm}\""
      echo "[ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\""
      echo "if [ -x \"$NODE_BIN/node\" ]; then export PATH=\"$NODE_BIN:\$PATH\"; fi"
    } >> "$RC"
  fi
done

corepack enable
corepack prepare "pnpm@${PNPM_VERSION}" --activate

echo "Using node $(node -v) / pnpm $(pnpm -v)"

# --- Local environment files --------------------------------------------------
# .env files are git-ignored, so create them from the checked-in examples and
# inject a strong development JWT secret when missing.
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  SECRET="$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"
  # Portable in-place edit (works with both GNU and BSD sed).
  tmp="$(mktemp)"
  sed "s|^JWT_SECRET=.*|JWT_SECRET=${SECRET}|" backend/.env > "$tmp" && mv "$tmp" backend/.env
  echo "Created backend/.env with a generated JWT secret."
fi
if [ ! -f frontend/.env ]; then
  cp frontend/.env.example frontend/.env
  echo "Created frontend/.env."
fi

# --- Dependencies, Prisma client and database --------------------------------
pnpm install --frozen-lockfile
pnpm db:generate
pnpm db:migrate

# --- Playwright browser for e2e journeys (best effort) -----------------------
if ! pnpm --filter frontend exec playwright install --with-deps chromium; then
  echo "warning: 'playwright install --with-deps' failed; retrying without system deps." >&2
  pnpm --filter frontend exec playwright install chromium || \
    echo "warning: Playwright chromium install failed; e2e browser tests may not run." >&2
fi

echo "Financy environment is ready."
