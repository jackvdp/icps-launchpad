#!/bin/zsh
# Start / list / stop Claude Code sessions with Remote Control enabled,
# so they are reachable from the Claude app on a phone.
#
#   remote-session.sh                 start one in the current directory
#   remote-session.sh <dir>           start one in <dir>
#   remote-session.sh <repo-name>     start one in ~/Repos/<repo-name>
#   remote-session.sh <dir> <name>    ...and label it <name> on the phone
#   remote-session.sh list            list running remote sessions
#   remote-session.sh stop <id>       stop one
#   remote-session.sh stop all        stop all of them

set -uo pipefail

export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
REPOS="$HOME/Repos"
SCRIPT_DIR="${0:A:h}"

if ! command -v claude >/dev/null 2>&1; then
  print -u2 "error: 'claude' not found on PATH"
  exit 1
fi

list_sessions() {
  claude agents --json 2>/dev/null | python3 "$SCRIPT_DIR/list-sessions.py"
}

case "${1:-}" in
  list|ls)
    list_sessions
    exit 0
    ;;
  stop|kill)
    target="${2:-}"
    if [ -z "$target" ]; then
      print -u2 "error: which session? try: remote-session.sh stop <id>   (or 'stop all')"
      list_sessions
      exit 1
    fi
    if [ "$target" = "all" ]; then
      ids=$(claude agents --json 2>/dev/null | python3 "$SCRIPT_DIR/list-sessions.py" --ids)
      if [ -z "$ids" ]; then echo "no remote sessions running"; exit 0; fi
      for id in ${=ids}; do echo "stopping $id"; claude stop "$id"; done
      exit 0
    fi
    claude stop "$target"
    exit $?
    ;;
  -h|--help|help)
    sed -n '2,11p' "$0" | sed 's/^# \{0,1\}//'
    exit 0
    ;;
esac

# --- resolve the target directory -------------------------------------------
arg="${1:-$PWD}"
arg="${arg/#\~/$HOME}"

if [ -d "$arg" ]; then
  target_dir="$arg"
elif [ -d "$REPOS/$arg" ]; then
  target_dir="$REPOS/$arg"
else
  print -u2 "error: no such directory '$arg', and no ~/Repos/$arg either"
  print -u2 "\navailable repos:"
  ls -1 "$REPOS" 2>/dev/null | sed 's/^/  /' >&2
  exit 1
fi
target_dir="${target_dir:A}"   # absolute, symlinks resolved

# --- start it ----------------------------------------------------------------
# The name is what labels this session in the Claude app, so make it
# identifiable: an explicit second argument, else the directory name.
session_name="${2:-${target_dir:t}}"

cd "$target_dir" || exit 1
out=$(claude --bg --remote-control "$session_name" 2>&1)
rc=$?

if [ $rc -ne 0 ]; then
  print -u2 "failed to start session:"
  print -u2 "$out"
  exit $rc
fi

id=$(echo "$out" | grep -oE 'backgrounded · [0-9a-f]{8}' | awk '{print $3}')
pretty="${target_dir/#$HOME/~}"

if [ -n "$id" ]; then
  echo "Started remote session $id in $pretty"
  echo "  shows on your phone as \"$session_name\""
  echo "  claude attach $id    open it here"
  echo "  claude logs $id      show recent output"
  echo "  claude stop $id      stop it"
else
  echo "Session started in $pretty, but could not parse its id:"
  echo "$out"
fi
