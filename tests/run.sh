#!/bin/sh
# Run the browser tests in headless Firefox with a throwaway profile.
# Exit status is non-zero if any check fails or no result arrives.
set -u
cd "$(dirname "$0")"
PORT=${PORT:-8931}
PROFILE=$(mktemp -d)
trap 'kill $SRV $FF 2>/dev/null; rm -rf "$PROFILE"' EXIT
cat > "$PROFILE/user.js" <<'PREFS'
user_pref("media.autoplay.default", 0);
user_pref("media.autoplay.block-webaudio", false);
user_pref("media.autoplay.blocking_policy", 0);
user_pref("datareporting.policy.dataSubmissionEnabled", false);
user_pref("toolkit.telemetry.enabled", false);
PREFS
rm -f .result.txt
python3 server.py "$PORT" & SRV=$!
sleep 1
MOZ_HEADLESS=1 firefox --headless --no-remote --profile "$PROFILE" "http://127.0.0.1:$PORT/test.html" >/dev/null 2>&1 & FF=$!
i=0; while [ ! -s .result.txt ] && [ $i -lt 90 ]; do sleep 1; i=$((i+1)); done
[ -s .result.txt ] || { echo "no result from browser"; exit 1; }
cat .result.txt; echo
! grep -qE '^(FAIL|HARNESS ERROR)' .result.txt
