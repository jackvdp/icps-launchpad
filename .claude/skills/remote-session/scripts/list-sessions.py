"""Print the running background (Remote Control) Claude sessions.

Reads `claude agents --json` on stdin. With --ids, prints just the ids,
space-separated, for scripting.
"""
import json
import os
import sys
import time

ids_only = "--ids" in sys.argv

try:
    agents = json.load(sys.stdin)
except Exception:
    if not ids_only:
        print("  (could not read session list)")
    raise SystemExit(0)

bg = [a for a in agents if a.get("kind") == "background" and a.get("id")]

if ids_only:
    print(" ".join(a["id"] for a in bg))
    raise SystemExit(0)

if not bg:
    print("  no remote sessions running")
    raise SystemExit(0)

home = os.path.expanduser("~")

# `name` is only set once a session has been renamed in the Claude app; the
# --remote-control argument does not populate it. Fall back to the directory.
def label(a):
    name = (a.get("name") or "").strip()
    if name and name != a.get("id"):
        return name
    return "(" + os.path.basename(a.get("cwd", "")) + ")"

width = max([len(label(a)) for a in bg] + [4])
row = "  %-12s %-" + str(width) + "s %-10s %-14s %s"
print(row % ("id", "name", "status", "started", "directory"))
for a in bg:
    started = time.strftime("%d %b %H:%M", time.localtime(a["startedAt"] / 1000))
    cwd = a.get("cwd", "")
    if cwd.startswith(home):
        cwd = "~" + cwd[len(home):]
    print(row % (a.get("id", "?"), label(a), a.get("status", ""), started, cwd))
