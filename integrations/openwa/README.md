# WhatsApp for Vanessa — OpenWA setup walkthrough

This is the step-by-step for Steven's Mac. It was written 2026-09-28 from OpenWA's own source (commit
`2552557`) and from this package. The package was **tested in a cloud sandbox**: install, health,
admin-key bootstrap, chat-scoped key and scope enforcement (`SECURITY-REVIEW.md`, last section). It
**has not run on a Mac yet**, and nothing here is installed until you run it.

## What you get, and the two things to know first

You message yourself in WhatsApp's **"Message Yourself"** chat. Vanessa reads that one chat and answers
there. She has no access to any other chat, and she never messages anyone else.

1. **OpenWA is unofficial.** It drives WhatsApp Web the way a linked computer does. WhatsApp can
   restrict a number that uses unofficial clients, and OpenWA's maintainers recommend a dedicated number
   for any gateway. On 2026-09-23 you chose your personal number plus the self-chat
   (`context/decisions.md`). That choice stands unless you change it. The risk is lowest in exactly this
   shape: Vanessa only ever writes to your own chat.
2. **Never use it for clients.** OpenWA says it is not approved for regulated work such as finance, and
   your own rule is that nothing sends to a client. This channel is you ↔ Vanessa only.

**You need:**
- the Mac that runs Vanessa;
- Docker Desktop;
- about 2 GB of free memory;
- your iPhone;
- about 30 minutes. The first build takes 10–15 of them.

## The fast way — one command (after Steps 1 and 2)

Once Docker Desktop is running and you have pulled the Repo:

```bash
bash integrations/openwa/setup-phone.sh
```

It does Steps 3 to 6 for you, and it is safe to run again if anything stops it halfway:
1. installs and starts OpenWA;
2. stores the admin key in your Keychain;
3. creates the `steven-selfchat` session;
4. **opens a QR code in your browser that refreshes itself**. Scan it with WhatsApp → Settings → Linked
   Devices → Link a Device;
5. reads your own number from the linked phone, so you never type it;
6. creates Vanessa's key, fenced to your "Message Yourself" chat;
7. finishes with five PASS lines proving the fence.

You'll see a `[V] Vanessa is linked…` message in your self-chat. Prefer typing a code to scanning? Run
`bash integrations/openwa/setup-phone.sh --code` and enter the 8 characters under **Link with phone number
instead**.

Steps 3–6 below are the same thing done by hand.

## Step 1 — Docker Desktop (skip it if `docker info` already works)

1. Download **Docker Desktop for Mac (Apple silicon)** from docker.com, drag it to Applications, and open
   it. Wait until it says **Engine running**.
2. In Terminal: `docker info`. It should print a server section, not "Cannot connect".

*Docker Desktop has a free tier for personal use and small businesses; check docker.com's current
terms for your business.*

## Step 2 — Get this package onto the Mac

In Terminal, go to your copy of the Repo (the folder `mac-sync` keeps current) and pull:

```bash
cd <your Repo folder>
git pull
ls integrations/openwa      # you should see install.sh and provision-keys.sh
```

If they are not there, your copy is on another branch. Run
`git fetch origin claude/stoic-cori-pvn3f8 && git checkout claude/stoic-cori-pvn3f8`, then `git pull`.

## Step 3 — Install and start OpenWA

```bash
bash integrations/openwa/install.sh
```

What it does:
- clones OpenWA to `~/Applications/openwa` at the reviewed commit;
- writes its settings: SQLite, the `whatsapp-web.js` engine, and Swagger/MCP/dev keys off;
- builds it;
- starts **only** the API. The Docker-socket helper never starts. The API is bound to **127.0.0.1:2785**,
  so nothing outside your Mac can reach it.

Check it:

```bash
curl -s http://127.0.0.1:2785/api/health        # → {"status":"ok",...}
```

## Step 4 — Put the keys in your Keychain

```bash
bash integrations/openwa/provision-keys.sh
```

- It copies the **admin key** OpenWA created on first start into the Keychain item `openwa-admin-key`.
  That key is yours; it has full control.
- It asks for your **self-chat id**: your number with the country code, no `+`, no spaces, then `@c.us`.
  For a US number that is `1` + your 10 digits + `@c.us`. It is used for one request and never saved to
  a file.
- It creates **Vanessa's key** in the Keychain item `openwa-vanessa-operator-key`. That key can reach
  **only** that one chat.
- Neither key is printed or written anywhere else.

## Step 5 — Link your phone (the QR code)

1. Copy your admin key: `security find-generic-password -a "$USER" -s openwa-admin-key -w | pbcopy`
2. Open **http://127.0.0.1:2785** in Safari or Chrome and paste the key (⌘V) where the dashboard asks for
   an API key.
3. Create a session named `steven-selfchat` and **Start** it. A QR code appears.
4. On your iPhone: **WhatsApp → Settings → Linked Devices → Link a Device**, then scan it. The session
   turns connected.

**No dashboard?** The same thing from Terminal: it saves the QR as a picture and opens it. QR codes
expire in about a minute; if it says "not ready", wait 5 seconds and run the last line again.

```bash
KEY="$(security find-generic-password -a "$USER" -s openwa-admin-key -w)"
SID=$(printf 'header = "X-API-Key: %s"\n' "$KEY" | curl -s -K - -X POST http://127.0.0.1:2785/api/sessions \
  -H 'Content-Type: application/json' -d '{"name":"steven-selfchat"}' | python3 -c 'import json,sys;print(json.load(sys.stdin)["id"])')
printf 'header = "X-API-Key: %s"\n' "$KEY" | curl -s -K - -X POST http://127.0.0.1:2785/api/sessions/$SID/start >/dev/null; sleep 10
printf 'header = "X-API-Key: %s"\n' "$KEY" | curl -s -K - http://127.0.0.1:2785/api/sessions/$SID/qr \
  | python3 -c 'import json,sys,base64;q=json.load(sys.stdin)["qrCode"];open("/tmp/openwa-qr.png","wb").write(base64.b64decode(q.split(",",1)[1]))' \
  && open /tmp/openwa-qr.png
echo "session id: $SID"; unset KEY
```

## Step 6 — Test it: two minutes, and it proves the fence works

In WhatsApp, send yourself a message in **Message Yourself**, for example `test`. Then, in Terminal:

```bash
OP="$(security find-generic-password -a "$USER" -s openwa-vanessa-operator-key -w)"
ME="<your number>@c.us"; SID="<session id from step 5>"
# 1. Vanessa's key can read your self-chat — your "test" should be in the output:
printf 'header = "X-API-Key: %s"\n' "$OP" | curl -s -K - "http://127.0.0.1:2785/api/sessions/$SID/messages/$ME/history" | head -c 600; echo
# 2. …and can write there — this lands in your Message Yourself chat:
printf 'header = "X-API-Key: %s"\n' "$OP" | curl -s -K - -X POST "http://127.0.0.1:2785/api/sessions/$SID/messages/send-text" \
  -H 'Content-Type: application/json' -d "{\"chatId\":\"$ME\",\"text\":\"[V] Vanessa test — setup check\"}"; echo
# 3. …and CANNOT list sessions or manage keys (expect 403 both times):
printf 'header = "X-API-Key: %s"\n' "$OP" | curl -s -o /dev/null -w '%{http_code}\n' -K - http://127.0.0.1:2785/api/sessions
printf 'header = "X-API-Key: %s"\n' "$OP" | curl -s -o /dev/null -w '%{http_code}\n' -K - http://127.0.0.1:2785/api/auth/api-keys
unset OP
```

If 1 and 2 work and 3 prints `403` twice, WhatsApp is set up. **Tell Vanessa "OpenWA linked"** in a
Claude session and she will record it.

## Step 7 — Have it come back after a restart (optional)

```bash
sed "s#__HOME__#$HOME#g" integrations/openwa/launchd/com.stevenshearrill.openwa.plist \
  > ~/Library/LaunchAgents/com.stevenshearrill.openwa.plist
launchctl load ~/Library/LaunchAgents/com.stevenshearrill.openwa.plist
```

Docker Desktop must itself start at login: **Docker Desktop → Settings → General → Start Docker Desktop
when you sign in**.

## What is not done yet

WhatsApp is linked, but **Vanessa does not answer there yet.** The bridge comes next:
- OpenWA's webhook for your self-chat;
- local n8n;
- Vanessa's inbox;
- her reply back through her key.

That is being built and tested now. It will arrive as one more `git pull` and one more script.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Health check fails | `docker compose -f ~/Applications/openwa/docker-compose.yml logs openwa-api --tail 60` |
| "port is already allocated" | Something else uses 2785. Set `API_PORT=2786` in `~/Applications/openwa/.env`, re-run `install.sh`, and use 2786 everywhere above |
| QR keeps expiring | Use the dashboard; it refreshes the code for you |
| Linked, then logged out by itself | WhatsApp → Linked Devices shows why. Re-link. If it repeats, stop and tell Vanessa, because repeated forced logouts can come before a restriction |

## How to undo all of it

1. WhatsApp → **Linked Devices** → tap the OpenWA device → **Log out**.
2. `launchctl unload ~/Library/LaunchAgents/com.stevenshearrill.openwa.plist` and delete that file.
3. `cd ~/Applications/openwa && docker compose down -v`. The `-v` also deletes its stored data.
4. `security delete-generic-password -s openwa-admin-key` and
   `security delete-generic-password -s openwa-vanessa-operator-key`.
