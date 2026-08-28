import { chromium } from "playwright";

async function probe() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:8082/login");
  await page.fill("#login_email", "Administrator");
  await page.fill("#login_password", "admin");
  await page.press("#login_password", "Enter");
  await page.waitForURL(/\/app/);

  await page.goto("http://localhost:8082/app/selling");
  await page.waitForTimeout(3000);

  const links = await page.locator("a").evaluateAll((els) =>
    els.map((e) => ({
      text: e.innerText.trim(),
      href: e.getAttribute("href"),
      className: e.className,
    }))
  );
  console.log("All links on /app/selling:", links.filter((l) => l.text && (l.text.includes("Customer") || l.text.includes("Quotation") || l.text.includes("Order"))));
  await browser.close();
}

probe().catch(console.error);
