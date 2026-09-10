import { chromium } from "playwright";

async function runLiveWorkflowVisualTests() {
  console.log("\n============================================================");
  console.log("🖥️  LAUNCHING LIVE WORKFLOW TEST IN BROWSER ON YOUR SCREEN");
  console.log("============================================================\n");
  
  // Launch browser in HEADED mode (visible window) with slowMo for clear visual tracking
  const browser = await chromium.launch({
    headless: false,
    slowMo: 750, // 750ms delay between actions so you can watch everything live
    args: ["--start-maximized"],
  });
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const baseUrl = "http://localhost:3000";

  let passed = 0;
  let failed = 0;

  async function testStep(name, fn) {
    try {
      console.log(`\n▶️  [TEST STEP] ${name}`);
      await fn();
      console.log(`   ✅ PASSED`);
      passed++;
      await page.waitForTimeout(600);
    } catch (err) {
      console.log(`   ❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  // 1. Workflow Dashboard Overview
  await testStep("Navigate to /workflows & verify Dashboard KPIs (Total Documents, Active Workflows, Pending Approvals)", async () => {
    await page.goto(`${baseUrl}/workflows?tab=overview`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=Workflow Dashboard", { timeout: 8000 });
    await page.waitForSelector("text=Total Documents");
    await page.waitForSelector("text=Active Workflows");
    await page.waitForSelector("text=Pending Approvals");
    await page.waitForTimeout(1000);
  });

  // 2. Workflow Rules / State Machine List
  await testStep("Navigate to Workflow Rules & Open '+ New Workflow' Modal", async () => {
    await page.goto(`${baseUrl}/workflows?tab=rules`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("button:has-text('New Workflow')");
    await page.click("button:has-text('New Workflow')");
    await page.waitForSelector("text=New Workflow");
    await page.waitForTimeout(600);

    // Fill form
    await page.fill("input[placeholder='e.g. Contract Approval Flow']", "Procure-to-Pay Automation Flow");
    await page.fill("input[placeholder='e.g. Contract']", "Purchase Order");
    await page.waitForTimeout(600);

    // Submit workflow
    await page.click("form button:has-text('Create')");
    await page.waitForTimeout(800);
  });

  // 3. Workflow States Builder
  await testStep("Navigate to Workflow States & Open '+ New State' Modal", async () => {
    await page.goto(`${baseUrl}/workflows?tab=states`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("button:has-text('New State')");
    await page.click("button:has-text('New State')");
    await page.waitForSelector("text=New State");
    await page.waitForTimeout(600);

    // Fill state info
    await page.fill("input[placeholder='e.g. DRAFT']", "UNDER_AUDIT_REVIEW");
    await page.fill("input[placeholder='#000000']", "#3B82F6");
    await page.waitForTimeout(600);

    // Close/Cancel modal
    await page.click("form button:has-text('Cancel')");
    await page.waitForTimeout(600);
  });

  // 4. State Transitions Builder
  await testStep("Navigate to Workflow Transitions & inspect Role permissions", async () => {
    await page.goto(`${baseUrl}/workflows?tab=transitions`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("button:has-text('New Transition')");
    await page.click("button:has-text('New Transition')");
    await page.waitForSelector("text=New Transition");
    await page.waitForTimeout(600);

    await page.fill("input[placeholder='e.g. Approve']", "Audit Approve");
    await page.waitForTimeout(500);

    await page.click("form button:has-text('Cancel')");
    await page.waitForTimeout(600);
  });

  // 5. Document Templates
  await testStep("Navigate to Document Templates & Open '+ New Template' Modal", async () => {
    await page.goto(`${baseUrl}/workflows?tab=templates`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("button:has-text('New Template')");
    await page.click("button:has-text('New Template')");
    await page.waitForTimeout(700);

    if (await page.$("form button:has-text('Cancel')")) {
      await page.click("form button:has-text('Cancel')");
    }
  });

  // 6. Documents Listing & Modal Creation
  await testStep("Navigate to Documents list & Open '+ Add Document' Modal", async () => {
    await page.goto(`${baseUrl}/workflows?tab=documents`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("table");
    await page.waitForTimeout(800);

    // Click Add Document in header
    await page.click("button:has-text('Add Document')");
    await page.waitForSelector("text=New Document");
    await page.waitForTimeout(600);

    // Fill document details
    await page.fill("input[placeholder='e.g. Acme Corp Contract']", "Enterprise Cloud SLA 2026");
    await page.selectOption("select >> nth=1", { label: "Contract" });
    await page.fill("input[placeholder='e.g. 5000']", "75000");
    await page.waitForTimeout(800);

    // Create Document
    await page.click("form button:has-text('Create')");
    await page.waitForTimeout(1000);
    await page.waitForSelector("text=Enterprise Cloud SLA 2026");
  });

  // 7. Role Switching & Manager Approvals Queue
  await testStep("Switch Role to HR_MANAGER and test Approvals Inbox", async () => {
    // Switch role in header selector
    await page.selectOption("select >> nth=0", { value: "hr_manager" });
    await page.waitForTimeout(800);

    // Navigate to Approvals
    await page.goto(`${baseUrl}/workflows?tab=approvals`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=Action Required");
    await page.waitForTimeout(1000);
  });

  // 8. Roles & Settings Tabs
  await testStep("Navigate to System Roles & Workflow Settings (Toggle Notifications)", async () => {
    await page.goto(`${baseUrl}/workflows?tab=roles`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=System Roles & Permissions");
    await page.waitForTimeout(800);

    await page.goto(`${baseUrl}/workflows?tab=settings`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=Workflow Settings");
    await page.waitForTimeout(600);

    // Toggle Email Notifications and Audit Trail
    const toggles = await page.$$("div.cursor-pointer");
    if (toggles.length >= 2) {
      await toggles[0].click();
      await page.waitForTimeout(500);
      await toggles[1].click();
      await page.waitForTimeout(500);
    }
  });

  // 9. Document Detail & History Inspection
  await testStep("Click on Document row to inspect Document Lifecycle & Audit Trail", async () => {
    await page.goto(`${baseUrl}/workflows?tab=documents`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("table tbody tr");
    
    // Click first document
    await page.click("table tbody tr >> nth=0");
    await page.waitForTimeout(1500);
  });

  console.log(`\n======================================================`);
  console.log(`🎉 Live Visual Test Completed: ${passed} Passed | ${failed} Failed`);
  console.log(`======================================================\n`);

  console.log("👀 Keeping browser open for 4 seconds for your review...");
  await page.waitForTimeout(4000);
  await browser.close();
}

runLiveWorkflowVisualTests().catch((err) => {
  console.error("Live test encountered an error:", err);
  process.exit(1);
});
