const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const SKILL_DIR = __dirname;
const PROFILE_DIR = path.join(SKILL_DIR, "chrome-profile");
const command = process.argv[2]; // "open" or "record"
const recordUrl = process.argv[3]; // URL for record mode
const label = process.argv[4] || "recording"; // label for the video file
const outputDir = process.argv[5] || process.cwd(); // where to save recordings

async function openBrowser() {
  console.log("Launching browser with persistent profile...");
  console.log("Log in and navigate to the page you want to record.");
  console.log("When ready, close the browser window.");

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: { width: 1280, height: 720 },
  });

  const page = context.pages()[0] || (await context.newPage());
  await page.goto("http://localhost:3002", { waitUntil: "networkidle" });

  await new Promise((resolve) => {
    page.on("close", resolve);
    context.on("close", resolve);
  });

  await context.close().catch(() => {});
  console.log("Browser closed. Profile saved.");
}

async function recordBrowser() {
  if (!recordUrl) {
    console.error("Usage: node browser.js record <url> [label] [outputDir]");
    process.exit(1);
  }

  const recordingsDir = path.resolve(outputDir, "recordings");
  fs.mkdirSync(recordingsDir, { recursive: true });

  // Extract session from persistent profile
  console.log("Loading saved session...");
  const persistentContext = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
  });
  const storageState = await persistentContext.storageState();
  await persistentContext.close();

  console.log("Launching browser with video recording...");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    storageState,
    recordVideo: { dir: recordingsDir, size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();
  const loadStart = Date.now();
  await page.goto(recordUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const loadSeconds = ((Date.now() - loadStart) / 1000).toFixed(1);

  console.log(`Recording at ${recordUrl} — page loaded (${loadSeconds}s load time).`);
  console.log("Perform your actions, then close the browser window.");

  await new Promise((resolve) => {
    page.on("close", resolve);
    browser.on("disconnected", resolve);
  });

  // Save video — saveAs waits for the file to be fully written
  const timestamp = new Date()
    .toISOString()
    .replace(/T/g, "_")
    .replace(/:/g, "-")
    .slice(0, 19);
  const baseName = `${label}_${timestamp}`;
  const webmPath = path.join(recordingsDir, `${baseName}.webm`);
  await page.video().saveAs(webmPath);
  await context.close().catch(() => {});
  await browser.close().catch(() => {});
  console.log(`Video saved: ${webmPath}`);

  // Convert to mp4, trimming the initial white screen
  await convertToMp4(webmPath, recordingsDir, baseName, loadSeconds);
}

async function convertToMp4(webmPath, outputDirPath, baseName, trimSeconds) {
  console.log(`Converting to mp4 (trimming first ${trimSeconds}s)...`);
  const ffmpegPath = require(path.join(SKILL_DIR, "node_modules", "@ffmpeg-installer", "ffmpeg")).path;
  const ffmpeg = require(path.join(SKILL_DIR, "node_modules", "fluent-ffmpeg"));
  ffmpeg.setFfmpegPath(ffmpegPath);

  const mp4Path = path.join(outputDirPath, `${baseName}.mp4`);

  await new Promise((resolve, reject) => {
    ffmpeg(webmPath)
      .outputOptions([
        "-ss", trimSeconds,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-an",
      ])
      .output(mp4Path)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });

  // Clean up webm
  fs.unlinkSync(webmPath);
  console.log(`Converted and saved: ${mp4Path}`);
  console.log(`Cleaned up: ${path.basename(webmPath)}`);
}

async function main() {
  switch (command) {
    case "open":
      await openBrowser();
      break;
    case "record":
      await recordBrowser();
      break;
    default:
      console.error("Usage:");
      console.error("  node browser.js open              - Launch browser to log in");
      console.error("  node browser.js record <url> [label] [outputDir] - Record video");
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
