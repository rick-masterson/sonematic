# CLAUDE.md

Guidance for Claude Code sessions working in this repo.

## What this is

Sonematic is a binaural-beat "neural entrainment engine": a web app with no build step, published by GitHub
Pages from the root of `main` at <https://rick-masterson.github.io/sonematic/>. The repo is **public**, and
every push to `main` goes live within a minute or so.

It installs as a standalone app (PWA) and runs offline. Opened straight from disk (`file://`) it still works as
a single page, just without offline caching.

## Files

- `index.html`: the whole app, with the CSS, markup and script inline. Keep it that way: no frameworks, no
  bundler, no external requests.
- `manifest.webmanifest`, `icons/`: install metadata. `icons/*.png` are rendered from the SVGs with
  `inkscape icons/icon.svg -w 512 -h 512 -o icons/icon-512.png` (and so on).
- `sw.js`: service worker. It serves from cache and refreshes in the background.
- `tests/`: browser tests (see below).

## How the engine works

Everything is Web Audio, built in `start()` and held in the `graph` object for one session:

- **Binaural pair:** sine at the carrier in the left ear, carrier + beat in the right. The beat is the
  entrainment frequency (Delta 0.5, Theta 6, Alpha 10, Beta 20 Hz). It only works on headphones.
- **Harmonics:** 3×, 6× and 9× the carrier in both ears, at `harm × 0.15/(i+1)`.
- **Sub:** carrier / 2 in both ears.
- **Noise:** white, pink or brown, generated once per context into an 8 s buffer and looped, with a crossfaded
  seam so brown noise doesn't click. It runs on the audio thread; don't go back to `ScriptProcessorNode`.
- **Output chain:** merger → fade (3 s in, 2 s out) → master (`vol × 0.4`) → speakers, plus an analyser for
  the waveform canvas.

Sessions are the `.session-card` elements. Their `data-*` attributes (carrier, beat, noise, noise-gain, harm,
sub, vol) are the presets, so edit a preset there, not in the JS.

Rules that fixed real bugs; keep them:
- `stop()` captures its own context and graph before fading, because a new session can start during the
  2 s fade-out. Never touch `audioCtx`/`graph` from a delayed callback.
- Live changes use `setTargetAtTime` (no clicks). Any new parameter must also be retuned in `updateParams()`
  (the sub used to stay at the starting carrier).
- Beat buttons are `.abtn[data-beat]`. Session cards also carry `data-beat`, so never select bare
  `[data-beat]`.
- `busy` blocks BEGIN while a session is starting (double taps used to start two engines).

## Ship a change

1. Edit, then run the tests: `tests/run.sh` (headless Firefox, about 30 s; it exits non-zero on any FAIL).
   Firefox is the only browser on this machine, so Chrome/Safari install behaviour is untested.
2. If `index.html`, the manifest or icons changed, bump `CACHE` in `sw.js` (`sonematic-vN`) and the version in
   the `.adv-footer` to match, or installed copies keep the old files.
3. Commit, then push. Pushing goes live, so confirm with the user first. If plain `git push` fails, use
   `git -c credential.helper= -c "credential.helper=!gh auth git-credential" push`.

## Wording

The copy uses wellness claims ("repair freq", "Tesla 369", "Verdi A"). Keep them as the user wrote them, but
don't add new medical or health claims.
