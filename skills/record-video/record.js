const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const [label = "recording", route = "/"] = process.argv.slice(2);
const baseUrl = "http://localhost:3002";

const timestamp = new Date()
  .toISOString()
  .replace(/[T]/g, "_")
  .replace(/[:]/g, "-")
  .slice(0, 19);
const filename = `${label}_${timestamp}`;

async function main() {
  const outputDir = path.resolve(process.cwd(), "recordings");
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 },
    },
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();
  const url = `${baseUrl}${route.startsWith("/") ? route : "/" + route}`;
  console.log(`Navigating to ${url}`);
  console.log("Recording... close the browser window when done.");

  await page.goto(url, { waitUntil: "networkidle" });

  // Wait until the user closes the browser window
  await new Promise((resolve) => {
    page.on("close", resolve);
    browser.on("disconnected", resolve);
  });

  await context.close().catch(() => {});
  await browser.close().catch(() => {});

  // Playwright saves video with a random name; rename it
  const files = fs
    .readdirSync(outputDir)
    .filter((f) => f.endsWith(".webm"))
    .map((f) => ({
      name: f,
      time: fs.statSync(path.join(outputDir, f)).mtimeMs,
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length > 0) {
    const latest = files[0].name;
    const finalName = `${filename}.webm`;
    const from = path.join(outputDir, latest);
    const to = path.join(outputDir, finalName);
    fs.renameSync(from, to);
    console.log(`Video saved: recordings/${finalName}`);
  } else {
    console.log("Warning: no video file found in output directory.");
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
