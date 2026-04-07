---
name: record-video
description: Record browser videos at localhost:3002 for PR demos. Analyses the diff, writes custom Playwright scripts to demonstrate changes, and saves recordings.
---

Record videos of the app at localhost:3002 to demonstrate PR changes.

## Process

1. **Analyse the changes**: Run `git diff main...HEAD` to understand what was changed and which pages/flows are affected.
2. **Plan recordings**: Decide what videos to record (e.g. before/after, a walkthrough of new behaviour). Tell the user the plan before proceeding.
3. **Write a Playwright script**: For each recording, write a temporary script to `./recordings/record_tmp.js` that:
   - Launches headed Chromium with video recording enabled
   - Navigates to the relevant page(s) on `http://localhost:3002`
   - Performs whatever actions demonstrate the change (clicks, form fills, scrolls, waits, file uploads, etc.)
   - Closes the context and browser so the video is saved
   - Renames the output file to a descriptive name
4. **Run the script**: Execute it with `node ./recordings/record_tmp.js`
5. **Report**: Tell the user where the video files are saved.

## Script template

Use this as a starting point — adapt freely for each recording:

```js
const { chromium } = require("C:/Users/danwil/.claude/skills/record-video/node_modules/playwright");
const path = require("path");
const fs = require("fs");

async function main() {
  const outputDir = path.resolve(process.cwd(), "recordings");
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    recordVideo: { dir: outputDir, size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  // --- Navigate and perform actions ---
  await page.goto("http://localhost:3002/some-route", { waitUntil: "networkidle" });
  // await page.click("button#submit");
  // await page.fill("input[name='search']", "example");
  // await page.waitForTimeout(2000);
  // --- End actions ---

  const videoPath = await page.video().path();
  await context.close();
  await browser.close();

  // Rename to something descriptive
  const finalName = "descriptive_name.webm";
  fs.renameSync(videoPath, path.join(outputDir, finalName));
  console.log(`Video saved: recordings/${finalName}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
```

## Notes

- Playwright is installed at `C:/Users/danwil/.claude/skills/record-video/node_modules/playwright` — require it from there.
- Save all videos to `./recordings/` in the current working directory.
- Use descriptive filenames like `before_search_loading.webm`, `after_search_loading.webm`.
- Add `recordings/` to `.gitignore` if it isn't already.
- Keep recordings short and focused — one behaviour per video.
- Clean up `./recordings/record_tmp.js` after use.
