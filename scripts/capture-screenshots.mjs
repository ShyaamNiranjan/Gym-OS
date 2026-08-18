import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../images");
const baseUrl = process.env.GYMOS_URL ?? "http://127.0.0.1:3010";
const adminEmail = process.env.GYMOS_ADMIN_EMAIL ?? "admin@gym.com";
const adminPassword = process.env.GYMOS_ADMIN_PASSWORD ?? "Admin@123";

const shots = [
  { name: "admin-console", path: "/admin", wait: 2500 },
  { name: "analytics", path: "/admin/analytics", wait: 2500 },
  { name: "devices", path: "/admin/devices", wait: 2500 },
  { name: "security-audit", path: "/admin/security", wait: 2500 },
  { name: "member-home", path: "/member", wait: 2500, member: true },
  { name: "entry-pass", path: "/member/access", wait: 2500, member: true },
];

async function login(page, email, password) {
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2000);

  if (!page.url().includes("/login")) {
    console.log("Already signed in.");
    return;
  }

  await page.waitForSelector('input[name="email"]', { timeout: 30000 });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30000 });
  await page.waitForTimeout(1500);
}

async function switchToMember(page) {
  const trigger = page.locator('button[aria-haspopup="menu"]').first();
  if (!(await trigger.count())) return false;
  await trigger.click();
  await page.waitForTimeout(700);
  const memberOption = page
    .locator('button[role="menuitem"]')
    .filter({ hasText: /member/i })
    .first();
  if (!(await memberOption.count())) return false;
  await memberOption.click();
  await page.waitForURL((url) => url.pathname.startsWith("/member"), { timeout: 30000 });
  await page.waitForTimeout(1500);
  return true;
}

async function capture(page, shot) {
  await page.goto(`${baseUrl}${shot.path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(shot.wait);
  await page.screenshot({
    path: path.join(outDir, `${shot.name}.png`),
    fullPage: false,
  });
  console.log(`Saved ${shot.name}.png`);
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await login(page, adminEmail, adminPassword);

  for (const shot of shots.filter((item) => !item.member)) {
    await capture(page, shot);
  }

  const switched = await switchToMember(page);
  if (switched) {
    for (const shot of shots.filter((item) => item.member)) {
      await capture(page, shot);
    }
  } else {
    console.warn("Could not switch to member profile; skipping member screenshots.");
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
