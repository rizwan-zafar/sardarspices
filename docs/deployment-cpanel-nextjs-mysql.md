# Deploy Next.js + MySQL (Prisma) to cPanel

Reusable playbook based on the **Agmoo** setup: **Next.js (App Router)**, **Prisma + MySQL/MariaDB**, **custom `server.js`**, and **GitHub Actions → SSH → cPanel**. Adapt names and paths for each new project.

---

## Architecture at a glance

```mermaid
flowchart LR
  subgraph dev [Developer]
    Git[Git push main]
  end
  subgraph gha [GitHub Actions]
    Build[npm ci + prisma generate + next build]
    Pack[tar.gz release]
    SSH[scp + ssh]
  end
  subgraph cpanel [cPanel server]
    AppRoot["/home/USER/appname"]
    NodeApp[Setup Node.js App]
    MySQL[(MySQL 127.0.0.1)]
    Public["public_html domain root"]
  end
  Git --> Build --> Pack --> SSH --> AppRoot
  AppRoot --> NodeApp
  Public -->|Passenger / proxy| NodeApp
  NodeApp --> MySQL
```

| Piece | Role |
| --- | --- |
| **Application root** | Full app lives outside `public_html`, e.g. `/home/YOURUSER/agmoo` |
| **Document root** | Stays `/home/YOURUSER/public_html` — cPanel/Passenger proxies to Node |
| **Startup file** | `server.js` (custom HTTP server; see below) |
| **Database** | MySQL on the server only via `127.0.0.1:3306` in production |
| **Build** | On **GitHub Actions** (or your PC), **not** on the shared host (`npm ci` on server is avoided) |

---

## One-time cPanel setup

### 1. MySQL

1. **MySQL Databases** → create database and user (names are usually prefixed, e.g. `cpaneluser_mydb`).
2. Add the user to the database with **All Privileges**.
3. Import schema/data manually (phpMyAdmin, or `prisma migrate deploy` / SQL dump). Deploy workflow **does not** auto-create tables on the server.

**Production `DATABASE_URL` (on server only):**

```env
DATABASE_URL="mysql://CPANEL_USER:URL_ENCODED_PASSWORD@127.0.0.1:3306/cpaneluser_mydb"
```

- Use **`127.0.0.1`**, not the server’s public IP.
- **URL-encode** special characters in the password (`&` → `%26`, `#` → `%23`, etc.).

**Local dev against live DB:** cPanel blocks remote MySQL by default. Either enable **Remote MySQL** for your IP, use an **SSH tunnel**, or use a **local** MySQL copy for development.

### 2. Node.js application

**Setup Node.js App** (CloudLinux Node.js Selector):

| Setting | Value |
| --- | --- |
| Node.js version | **20** (match CI) |
| Application mode | Production |
| Application root | `/home/YOURUSER/YOURAPP` |
| Application URL | Your domain (`/`) |
| Application startup file | **`server.js`** |

After save, cPanel may inject Passenger rules into `public_html/.htaccess` and set **`PORT`** for the app.

### 3. Folder layout

```
/home/YOURUSER/
├── public_html/          ← domain document root (do not put the Next app here)
└── yourapp/              ← git/tar deploy target (CPANEL_APP_PATH)
    ├── .env
    ├── server.js
    ├── .next/            ← built on CI, uploaded in tarball
    ├── node_modules/     ← from CI build
    └── ...
```

**Do not** deploy the app inside `public_html`. WordPress or other sites in `public_html` can break `/_next/` static assets if paths overlap.

### 4. SSH for GitHub Actions

1. **SSH Access → Manage SSH Keys** → generate or import key.
2. **Authorize** the public key.
3. Store the **private** key in GitHub: `CPANEL_SSH_KEY`.
4. If cPanel required a passphrase on the key, add `CPANEL_SSH_PASSPHRASE`.

Test from your machine:

```bash
ssh -p 22 YOURUSER@YOUR_HOST "echo SSH_OK"
```

---

## Application requirements (every project)

### Custom `server.js`

cPanel/Passenger expects a Node entry file. Use a small wrapper around Next’s request handler:

```js
import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";

const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOST || process.env.HOSTNAME || "127.0.0.1";
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  }).listen(port, hostname, () => {
    console.log(`Ready on ${hostname}:${port}`);
  });
});
```

`package.json` **start** script: `"start": "node server.js"`.

### Prisma + MySQL on cPanel

- Use **`@prisma/adapter-mariadb`** + **`mariadb`** driver when the host is MariaDB/MySQL (common on shared hosting).
- In `next.config.mjs`, externalize server-only packages so they are not bundled for the browser:

```js
serverExternalPackages: [
  "@prisma/client",
  "@prisma/adapter-mariadb",
  "mariadb",
],
```

- Parse `DATABASE_URL` with URL decoding for user/password (handles encoded special characters).

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | MySQL connection (server: `127.0.0.1`) |
| `AUTH_SECRET` | Session/JWT signing (long random string) |
| `JWT_SECRET` | Same value as `AUTH_SECRET` if your code reads both |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, e.g. `https://yourdomain.com` |
| `NODE_ENV` | `production` on server |
| Optional | SMTP, admin email, etc. |

Never commit `.env`. GitHub Actions writes `.env` on the server during deploy.

---

## Automated deploy (GitHub Actions)

Workflow pattern: `.github/workflows/deploy.yml`

**Trigger:** push to `main` (or `workflow_dispatch`).

**Build job (ubuntu-latest, Node 20):**

1. `npm ci`
2. `npx prisma generate`
3. `NODE_ENV=production npx next build` (with `DATABASE_URL` from secrets only for generate/build if needed; use `SKIP_DB_BUILD=1` if pages must not hit DB at build time)
4. Pack repo into `tar.gz` (exclude `.git`, `.github`, `.env`, local uploads, SSH keys)
5. SSH: upload `.env`, stream-extract tarball into `CPANEL_APP_PATH`
6. Run `scripts/cpanel-build.sh` on the server (restart Node app)

### Required GitHub secrets

| Secret | Example / notes |
| --- | --- |
| `CPANEL_HOST` | Server IP or hostname |
| `CPANEL_USERNAME` | cPanel account username (not email) |
| `CPANEL_PORT` | `22` |
| `CPANEL_SSH_KEY` | Full **private** key PEM/OpenSSH |
| `CPANEL_SSH_PASSPHRASE` | Only if the key is encrypted |
| `CPANEL_APP_PATH` | `/home/YOURUSER/yourapp` (must start with `/home/`) |
| `CPANEL_NODEVENV` | Path to nodevenv **activate** or **bin** dir from Setup Node.js App, e.g. `/home/YOURUSER/nodevenv/yourapp/20/bin/activate` |
| `ENV_DATABASE_URL` | Production DB URL (`127.0.0.1`) |
| `ENV_AUTH_SECRET` | Random secret; workflow also sets `JWT_SECRET` to the same value |
| `ENV_NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |
| Optional | `ENV_SMTP_*`, `ENV_ADMIN_NOTIFY_EMAIL`, … |

**Important:** `CPANEL_APP_PATH` must be under `/home/USERNAME/...`. Paths like `/subdomains/...` at filesystem root will fail with permission errors.

### Server script: `scripts/cpanel-build.sh`

After extract, this script:

- Resolves **real** Node binaries (avoids CloudLinux wrapper traps)
- Verifies `node_modules` and `.next` exist (built artifact deploy)
- Sources `.env`, sets `NODE_ENV=production`, low memory `NODE_OPTIONS`
- Touches `tmp/restart.txt`, calls `cloudlinux-selector restart` when available

It **does not** run `npm ci` on the server (by design).

---

## Manual deploy (without Actions)

From the project root on a machine with enough RAM to build:

```bash
npm ci
export CPANEL_SITE_URL="https://yourdomain.com"
./scripts/cpanel-pack.sh
```

Upload `agmoo-cpanel.tar.gz` (rename per project) via **File Manager**, extract into `/home/YOURUSER/yourapp`.

Create `.env` on the server (see variables above).

In **Setup Node.js App**, set startup file `server.js` and **Restart**.

Optional: run on server via SSH:

```bash
chmod +x /home/YOURUSER/yourapp/scripts/cpanel-build.sh
/home/YOURUSER/yourapp/scripts/cpanel-build.sh /home/YOURUSER/yourapp /home/YOURUSER/nodevenv/yourapp/20/bin/activate
```

---

## Database workflow

| Environment | Command | When |
| --- | --- | --- |
| Local dev | `npx prisma migrate dev` | Schema changes on your machine |
| Production | `npx prisma migrate deploy` | After backup, via SSH on server (or import SQL) |
| Seed | `npm run db:seed` | Once, or when you need default admin data |

Production deploy in this repo **skips** automatic schema import; plan migrations or dumps explicitly.

---

## Checklist for a new project

Copy this list and replace `YOURAPP` / domain names.

- [ ] Add `server.js` and `"start": "node server.js"`.
- [ ] Configure Prisma + MariaDB adapter + `next.config.mjs` `serverExternalPackages`.
- [ ] Create cPanel MySQL DB + user; note prefixed names.
- [ ] Create folder `/home/USER/YOURAPP` (not inside `public_html`).
- [ ] **Setup Node.js App**: Node 20, root = app folder, startup = `server.js`.
- [ ] Authorize SSH key; add GitHub secrets (or manual pack upload).
- [ ] Copy `.github/workflows/deploy.yml` and `scripts/cpanel-build.sh`, `scripts/cpanel-pack.sh`; rename tarball excludes/app paths if needed.
- [ ] Set `ENV_DATABASE_URL` with `127.0.0.1` and URL-encoded password.
- [ ] Run migrations / import DB once on production.
- [ ] Push to `main` and confirm workflow green + site loads.
- [ ] Confirm `/_next/static/...` loads (no conflict with WordPress in `public_html`).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Pool timeout / P1001 from **local** PC | Remote MySQL blocked or wrong host/port | Use local DB for dev, or Remote MySQL + IP allowlist / SSH tunnel |
| `Permission denied (publickey)` | Key not authorized or wrong user | Authorize public key in cPanel; match private key in `CPANEL_SSH_KEY` |
| App path permission denied | `CPANEL_APP_PATH` not under `/home/user/` | Use full home path |
| Missing `node_modules` / `.next` on server | Uploaded source only | Build on CI/PC before tar; include both in archive |
| 500 on DB pages | Wrong `DATABASE_URL`, password not encoded | Fix `.env` on server; restart app |
| Broken styles / 404 on `/_next` | App in wrong folder or `.htaccess` conflict | Keep app outside `public_html`; review Passenger/htaccess |
| Save/Restart locked in Node selector | Another process holds lock | Wait and retry |

---

## Files to copy to another repo

| File | Purpose |
| --- | --- |
| `server.js` | cPanel entry |
| `scripts/cpanel-build.sh` | Post-deploy restart on server |
| `scripts/cpanel-pack.sh` | Local manual tarball build |
| `.github/workflows/deploy.yml` | CI build + SSH deploy |
| `next.config.mjs` (Prisma externals) | Prevent bundling DB driver |
| `lib/db.js` (or equivalent) | MariaDB adapter + `DATABASE_URL` parsing |

Adjust workflow tarball name, `CPANEL_APP_PATH`, and exclude patterns per project.

---

## Related docs in this repo

- Root [README.md](../README.md) — quick start and env vars  
- Implemented files: `server.js`, `scripts/cpanel-build.sh`, `scripts/cpanel-pack.sh`, `.github/workflows/deploy.yml`  
