---
name: demo-video
description: "Make a short product demo video (zooms, on-screen callouts, captions, optional AI voice-over, MP4) of any web or desktop app with OpenScreen and its MCP tools, for colleagues, leaders, customers or a pull request. Works for non-developers. Use when the user says \"make a demo video\", \"record a demo\", \"screen recording\", \"product video\", \"录 demo\", \"做演示视频\", \"录屏\", \"录个视频给老板看\"."
---

# Demo video (OpenScreen)

You make one MP4 that shows one story clearly: zooms on the result, short callouts, captions, and a voice when needed. OpenScreen (free, open source, MIT) records and edits on this machine; nothing leaves it until the user shares the file.

This skill adds the company's way of working on top of OpenScreen's official skill `openscreen-demo` (repo `getopenscreen/openscreen`, `plugin/skills/openscreen-demo/SKILL.md`). Use that skill for the exact tool calls; follow this one for the process and the lessons. First used for the Argo v3 demo on 2026-10-28 (3:18, 1080p, voice + captions).

## 1. Set up (once per machine)

1. **App:** OpenScreen **v2.1.2 or later** from https://github.com/getopenscreen/openscreen/releases/latest (macOS: `Openscreen-macOS-Apple-Silicon-<version>.dmg` or `-Intel-`). The older `siddharthvaddem/openscreen` build has no MCP; replace it.
2. **Plugin (Claude Code):** `claude plugin marketplace add getopenscreen/openscreen`, then `claude plugin install openscreen@openscreen`.
3. **macOS permissions** (System Settings → Privacy & Security): **Screen Recording** for the app that runs the agent; **Accessibility** for OpenScreen (it records clicks and draws the cursor and auto-zooms).
4. **MCP tools in this session:** the plugin registers `openscreen mcp`, which loads in the NEXT session. To work in the current session instead, call the server over stdio with `scripts/osmcp.mjs` (`npm install @modelcontextprotocol/sdk` next to it; `node osmcp.mjs list | call <tool> '<json>'`). Keep OpenScreen running.

## 2. Plan

1. Ask: who watches (leader, customer, colleague, reviewer), what they must remember, where it is shown (Feishu, PR, X), length, language, voice or silent.
2. Write 3–10 beats. Each beat: what is on screen, the action, one callout (6 words or fewer), the narration line, seconds.
3. Honesty: separate what really works from what is design only or simulated. Say simulated or mock data once, in plain words. Never show a fake result as real.

## 3. Make the flow demo-ready, then freeze

1. Rehearse the whole flow once before recording. "The service is up" is not "the flow works".
2. Look for what a viewer would notice: wrong or implausible numbers (an AI assistant in the app will point them out on camera), internal jargon or IDs on screen, slow steps, leftover test data, private data (emails, tokens, customer names).
3. Fix what matters, rehearse again.
4. **Freeze** when it is good enough: from then on, write problems down and do not fix them. Endless fixing was the biggest time sink in the first run.
5. Clean state: empty or tidy lists, a believable name, light theme, notifications off (Do Not Disturb), one window of about 1600×1000.

## 4. Record

- **Non-developers (default):** drive the app with the real mouse, yourself or with a computer-use agent. OpenScreen then zooms on clicks and draws a clean cursor. Move slowly; pause 1 s after each result.
- **Developers who need repeatable takes:** drive a browser with a script (Playwright or CDP). Log every click (`Date.now()`, x and y as fractions of the window) and pass the log to `setPointerTrack`, or the take has no cursor and no auto-zoom.
- **Before you start, confirm the recording is really running** (timer or red dot). One full take was lost because it was not.
- Keep the agent's or app's text replies from the take; check every number in them before you narrate.

## 5. Voice and captions

Choose one:
- **Your own voice:** record with the microphone on; `transcribe` makes the captions.
- **AI voice, all local:** write one narration line per beat, synthesize with Kokoro (`scripts/kokoro_tts.py`, voice `af_heart`; model files `kokoro-v1.0.onnx` and `voices-v1.0.bin` from the kokoro-onnx release `model-files-v1.0`):
  `uv run -q --with kokoro-onnx --with soundfile python -I kokoro_tts.py <model_dir> af_heart line.txt line.wav`
  Place each clip at the moment its beat appears ON SCREEN (find that frame; do not trust script logs or the first scene change). No overlaps; shorten text rather than speed it up. Mix to one track (about -16 LUFS) and mux it into the recording (`ffmpeg -c:v copy`) **before** `createProject`, so `transcribe` gives captions identical to the narration.
- If `transcribe` fails with "fetch failed" behind a proxy, download the pinned Whisper models into OpenScreen's `stt-models` folder by hand and check their SHA-256.

## 6. Edit and export (OpenScreen MCP)

1. `createProject` with the (voiced) video, `setAspectRatio` 16:9.
2. `addTrims` for setup and tail; `addSpeed` 2–3x only on silent waits (speed changes the voice too).
3. `addZooms` on each result, held at least 1.5 s; one `addAnnotation` callout per beat, clear of the action; a blur annotation over anything private (address bar, emails, tokens).
4. Captions: `transcribe`, `setCaptionSettings` (enabled, readable style, clear of callouts), `setWordText` for product names.
5. `exportVideo` to an absolute path (1080p).
6. For Feishu or chat, make a small copy: `ffmpeg -i demo.mp4 -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 128k -movflags +faststart demo-small.mp4` (258 MB became 15 MB with no visible loss).

## 7. Verify and hand over

1. Look at frames at every beat (`getFrames`, or ffmpeg on the export): right screen, zoom on the change, callout readable, captions match the voice, no private data, no black frames.
2. Check that every spoken or written claim is true for this take.
3. Show the user. Share or post only after the user says yes.
4. Free what you started: browsers, background jobs, temp files.
