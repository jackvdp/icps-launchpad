---
name: remote-session
description: Start, list or stop a Claude Code session on this Mac with Remote Control enabled, so it is reachable from the Claude app on Jack's phone. Use when Jack says "start a remote session", "open a session on my laptop", "new session in <repo>", "what sessions are running", "stop that remote session", or asks to spin up a session he can pick up from his phone.
argument-hint: [repo name or directory | list | stop <id>]
allowed-tools: Bash
---

# Remote Session

Wraps a single script. Everything this skill does is one command.

```bash
.claude/skills/remote-session/scripts/remote-session.sh $ARGUMENTS
```

Run it, then report what it printed. Do not reimplement the logic inline.

## Usage

| Jack says | Run |
|---|---|
| "start a remote session" | `remote-session.sh` (uses current directory) |
| "start one in bespoke-cars" | `remote-session.sh bespoke-cars` |
| "start one in ~/Desktop/foo" | `remote-session.sh ~/Desktop/foo` |
| "what's running?" | `remote-session.sh list` |
| "stop 0cfcc894" | `remote-session.sh stop 0cfcc894` |
| "stop them all" | `remote-session.sh stop all` |

A bare name resolves against `~/Repos/`, so `remote-session.sh rninterview` starts one in `~/Repos/rninterview`. An unknown name prints the available repos rather than guessing.

## Notes

- Sessions start **idle**, waiting for a first prompt. Starting one costs nothing until it is used.
- Each is detached (`bg-pty-host` under `launchd`), so it survives quitting VS Code and closing terminals.
- The Mac must be awake and online to be reachable. Amphetamine currently prevents sleep.
- `stop` keeps the conversation — `claude attach <id>` reopens it later.

## When Jack is messaging from his phone

This is the main use. He is talking to an already-running remote session and asking it to spawn another. Just run the script and report back the id and directory; he cannot see the terminal, so the reply needs to stand on its own.

Do not stop sessions other than the one asked for. One session is kept alive as the always-on entry point — stopping every session from the phone can leave nothing to connect back to, and it needs the laptop to recover.
