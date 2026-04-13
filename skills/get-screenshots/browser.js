const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const SKILL_DIR = __dirname;
const PROFILE_DIR = path.join(SKILL_DIR, "chrome-profile");
const command = process.argv[2]; // "open" or "screenshot"
const screenshotUrl = process.argv[3]; // URL for screenshot mode
const label = process.argv[4] || "screenshot"; // label for the image file
const outputDir = process.argv[5] || process.cwd(); // where to save screenshots
const viewportWidth = parseInt(process.argv[6], 10) || 1280; // viewport width
const viewportHeight = parseInt(process.argv[7], 10) || 720; // viewport height
const clickSelector = process.argv[8] || null; // optional: CSS selector to click before screenshot
const clickCount = parseInt(process.argv[9], 10) || 1; // optional: how many times to click it

async function openBrowser() {
  console.log("Launching browser with persistent profile...");
  console.log("Log in and navigate to the page you want to screenshot.");
  console.log("When ready, close the browser window.");

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: { width: viewportWidth, height: viewportHeight },
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

async function takeScreenshot() {
  if (!screenshotUrl) {
    console.error("Usage: node browser.js screenshot <url> [label] [outputDir]");
    process.exit(1);
  }

  const screenshotsDir = path.resolve(outputDir, "screenshots");
  fs.mkdirSync(screenshotsDir, { recursive: true });

  // Extract session from persistent profile
  console.log("Loading saved session...");
  const persistentContext = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
  });
  const storageState = await persistentContext.storageState();
  await persistentContext.close();

  console.log("Taking screenshot...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState,
    viewport: { width: viewportWidth, height: viewportHeight },
  });

  const page = await context.newPage();
  await page.goto(screenshotUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  if (clickSelector) {
    for (let i = 0; i < clickCount; i++) {
      await page.locator(clickSelector).click();
      await page.waitForTimeout(300);
    }
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/T/g, "_")
    .replace(/:/g, "-")
    .slice(0, 19);
  const pngPath = path.join(screenshotsDir, `${label}_${timestamp}.png`);

  await page.screenshot({ path: pngPath, fullPage: true });
  await context.close().catch(() => {});
  await browser.close().catch(() => {});

  console.log(`Screenshot saved: ${pngPath}`);
}

async function main() {
  switch (command) {
    case "open":
      await openBrowser();
      break;
    case "screenshot":
      await takeScreenshot();
      break;
    default:
      console.error("Usage:");
      console.error("  node browser.js open                    - Launch browser to log in");
      console.error("  node browser.js screenshot <url> [label] [outputDir] [width] [height] - Take screenshot");
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
