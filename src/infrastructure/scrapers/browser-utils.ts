import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, BrowserContext, Page } from 'playwright';

chromium.use(stealthPlugin());

export async function launchBrowser(): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    return { browser, context, page };
}

export async function handleCookieConsent(page: Page) {
    try {
        const acceptBtn = page.locator('button#onetrust-accept-btn-handler');
        if (await acceptBtn.isVisible()) {
            await acceptBtn.click();
        }
    } catch (e) {
        // Ignore if button not found or already accepted
    }
}
