const { chromium } = require("playwright");
const path = require("path");

const JIRA_BASE = "https://mhclgdigital.atlassian.net/browse";
const PROFILE_DIR = path.join(__dirname, "..", "..", "jira-chrome-profile");

const ticketId = process.argv[2];
if (!ticketId) {
  console.error("Usage: node fetch.js <TICKET_ID>");
  process.exit(1);
}

const url = `${JIRA_BASE}/${ticketId}`;

async function extractTicketContent(page) {
  await page.waitForSelector('[data-testid="issue.views.issue-base.foundation.summary.heading"]', { timeout: 15000 });
  // Description loads after the heading — give it a moment
  await page.waitForTimeout(2000);

  return await page.evaluate(() => {
    const title = document.querySelector('[data-testid="issue.views.issue-base.foundation.summary.heading"]')?.innerText?.trim() || "";
    const description = document.querySelector('[data-testid="issue.views.field.rich-text.description"]')?.innerText?.trim() || "";
    const status = document.querySelector('[data-testid="issue.views.issue-base.foundation.status.status-field-wrapper"] button')?.innerText?.trim() || "";
    const type = document.querySelector('[data-testid="issue.views.issue-base.foundation.change-issue-type.button"] span')?.innerText?.trim() || "";
    const assignee = document.querySelector('[data-testid="issue.views.field.user.assignee"] span')?.innerText?.trim() || "";
    const priority = document.querySelector('[data-testid="issue.views.field.priority.priority"] img')?.getAttribute("alt") || "";

    const fields = {};
    document.querySelectorAll('[data-testid^="issue.views.field"]').forEach((el) => {
      const label = el.querySelector("label, h2, [data-testid$='.label']")?.innerText?.trim();
      const value = el.querySelector("[data-testid$='.value'], [data-testid$='.read-view']")?.innerText?.trim();
      if (label && value) fields[label] = value;
    });

    return { title, description, status, type, assignee, priority, fields };
  });
}

function isLoginPage(pageUrl) {
  return pageUrl.includes("id.atlassian.com") || pageUrl.includes("/login");
}

async function launchBrowser(headless) {
  const browser = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless,
    channel: "chrome",
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const page = browser.pages()[0] || (await browser.newPage());
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

  // Wait a moment for any redirects to settle
  await page.waitForTimeout(3000);

  return { browser, page };
}

async function main() {
  // Attempt 1: headless
  let { browser, page } = await launchBrowser(true);

  if (isLoginPage(page.url())) {
    await browser.close();

    // Attempt 2: visible browser for manual login
    console.error("Login required — opening browser for manual login...");
    ({ browser, page } = await launchBrowser(false));

    if (isLoginPage(page.url())) {
      console.error("Waiting for you to log in (up to 2 minutes)...");
      await page.waitForURL(`**/browse/**`, { timeout: 120000 });
    }

    // Save session by closing gracefully
    await browser.close();

    // Attempt 3: headless with saved session
    console.error("Verifying session saved...");
    ({ browser, page } = await launchBrowser(true));

    if (isLoginPage(page.url())) {
      console.error("Login still not saved. Please try again.");
      await browser.close();
      process.exit(1);
    }
  }

  try {
    const content = await extractTicketContent(page);
    console.log(JSON.stringify(content, null, 2));
  } catch (err) {
    console.error("Failed to extract ticket content:", err.message);
    await browser.close();
    process.exit(1);
  }

  await browser.close();
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
