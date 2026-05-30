# MondoPizza Print Agent

A small Node.js service that prints receipts via QZ Tray **without needing the admin dashboard to be open in a browser**.

It runs in the background on each shop machine, subscribes to your Convex deployment, and sends every pending+unprinted order to the local QZ Tray instance over its websocket. Survives reboots; restarts itself on crashes.

---

## How it works

```
Convex (cloud) ──reactive query──▶ print-agent (local Node) ──ws://localhost:8182──▶ QZ Tray ──▶ printer
```

The agent uses a shared-secret token (`PRINT_AGENT_TOKEN`) to authenticate with Convex, signs each QZ message with your private RSA key, and is gated by Convex's own admin-only `printAgent.*` functions. No admin login session is involved.

---

## One-time setup (do this once per shop machine)

### 1. Prerequisites
- **Node.js LTS** (≥ 18) installed: https://nodejs.org/
- **QZ Tray** installed and running: https://qz.io/download/
- Your `override.crt` (matching the cert in `public/qz-digital-certificate.txt`) copied into QZ Tray's install directory and QZ Tray restarted — see the main repo README for that step.
- This repo cloned/copied locally; `npm install` run once.

### 2. Generate the shared agent token
Pick a long random string (anything ≥ 32 chars). For example, on macOS/Linux:
```bash
openssl rand -hex 32
```
On Windows PowerShell:
```powershell
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
```
Copy the output; you'll use it in two places.

### 3. Tell Convex about the token
```bash
npx convex env set PRINT_AGENT_TOKEN <paste-the-token>
# Plus on production:
npx convex env set --prod PRINT_AGENT_TOKEN <paste-the-token>
```

### 4. Install as a background service

#### macOS (launchd)
1. Open `print-agent/install/macos/com.mondopizza.printagent.plist` in a text editor.
2. Replace the placeholders:
   - `/ABSOLUTE/PATH/TO/MondoPizza` → your repo path (`pwd` in the repo gives you this)
   - `/usr/local/bin/node` → output of `which node`
   - `https://YOUR-DEPLOYMENT.convex.cloud` → your Convex URL (`grep CONVEX_URL .env.local`)
   - `YOUR_SHARED_SECRET_HERE` → the token from step 2
   - `/Users/YOU/qz-cert/...` → wherever your `private-key.pem` and `digital-certificate.txt` live
3. Install:
   ```bash
   cp print-agent/install/macos/com.mondopizza.printagent.plist ~/Library/LaunchAgents/
   launchctl load -w ~/Library/LaunchAgents/com.mondopizza.printagent.plist
   ```
4. Watch the logs:
   ```bash
   tail -F /tmp/mondopizza-print-agent.out.log /tmp/mondopizza-print-agent.err.log
   ```
5. To stop / uninstall:
   ```bash
   launchctl unload -w ~/Library/LaunchAgents/com.mondopizza.printagent.plist
   ```

#### Windows (NSSM)
1. Install NSSM: download from https://nssm.cc/download, extract `nssm.exe`, place it on your `PATH` (e.g., `C:\Windows\System32\`).
2. Open `print-agent\install\windows\install-service.bat` in Notepad.
3. Edit the `SET` lines at the top — same fields as macOS above.
4. **Right-click the .bat → Run as administrator.**
5. Logs land in `print-agent\logs\out.log` and `err.log`. Service name: `MondoPizzaPrintAgent`.
6. Useful commands:
   ```cmd
   nssm status MondoPizzaPrintAgent
   nssm stop MondoPizzaPrintAgent
   nssm restart MondoPizzaPrintAgent
   nssm remove MondoPizzaPrintAgent confirm
   ```

### 5. Verify it's printing
1. Open `/admin/orders` to confirm settings — provider must be **QZ Tray** and a printer must be selected.
2. Place a test cash order from `/checkout`.
3. Receipt should print within ~2 seconds, **even with the admin browser closed**.
4. The order row in Convex now has `printedAt` set.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `Missing required env var` on startup | Forgot to edit the .plist / .bat | Re-edit, reload |
| `Invalid print-agent token` from Convex | Token mismatch between agent env and Convex env | Re-set both with the same value |
| Connects to Convex but never prints | QZ Tray not running, or wrong printer name saved in settings | Open QZ Tray, fix printer in `/admin/settings` |
| "Cannot verify trust" in QZ Tray UI | `override.crt` missing or wrong on this machine | See repo README cert-install section |
| Prints same order twice | Two agents pointing at the same Convex with the same token (e.g., one on Mac + one on Windows) | The `claim` mutation prevents duplicates atomically; if you still see this, check QZ Tray logs for retry storms |

---

## Run manually (for debugging)

```bash
cd /path/to/MondoPizza
CONVEX_URL=https://YOUR.convex.cloud \
PRINT_AGENT_TOKEN=your-token \
QZ_PRIVATE_KEY_PATH=/Users/you/qz-cert/private-key.pem \
QZ_CERT_PATH=/Users/you/qz-cert/digital-certificate.txt \
node print-agent/index.mjs
```

You'll see `[print-agent] started; watching ...` and per-order logs.
