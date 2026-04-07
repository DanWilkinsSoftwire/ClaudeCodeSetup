const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const PROFILE_DIR = path.join(__dirname, "chrome-profile");
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

  // Playwright's recordVideo requires a non-persistent context, so we:
  // 1. Launch persistent context to get cookies/storage
  // 2. Extract state
  // 3. Close it
  // 4. Relaunch a normal context with that state + video recording
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
  await page.goto(recordUrl, { waitUntil: "networkidle" });
  console.log(`Recording at ${recordUrl}...`);
  console.log("Perform your actions, then close the browser window.");

  await new Promise((resolve) => {
    page.on("close", resolve);
    browser.on("disconnected", resolve);
  });

  const videoPath = await page.video().path();
  await context.close().catch(() => {});
  await browser.close().catch(() => {});

  // Rename to descriptive name
  const timestamp = new Date()
    .toISOString()
    .replace(/T/g, "_")
    .replace(/:/g, "-")
    .slice(0, 19);
  const webmName = `${label}_${timestamp}.webm`;
  const webmPath = path.join(recordingsDir, webmName);
  fs.renameSync(videoPath, webmPath);
  console.log(`Video saved: ${webmPath}`);

  // Convert to mp4
  await convertToMp4(webmPath, recordingsDir, `${label}_${timestamp}`);
}

async function convertToMp4(webmPath, outputDir, baseName) {
  console.log("Converting to mp4...");
  const { FFmpeg } = require("@ffmpeg/ffmpeg");
  const { fetchFile } = require("@ffmpeg/util");

  const ffmpeg = new FFmpeg();
  await ffmpeg.load();

  const inputData = fs.readFileSync(webmPath);
  await ffmpeg.writeFile("input.webm", new Uint8Array(inputData));
  await ffmpeg.exec(["-i", "input.webm", "-c:v", "libx264", "-preset", "fast", "-crf", "23", "output.mp4"]);

  const outputData = await ffmpeg.readFile("output.mp4");
  const mp4Path = path.join(outputDir, `${baseName}.mp4`);
  fs.writeFileSync(mp4Path, Buffer.from(outputData));

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
