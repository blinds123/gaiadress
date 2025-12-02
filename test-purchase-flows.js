const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://gaiadress.netlify.app';
const STATE_DIR = '/Users/nelsonchan/Downloads/secretjeans TEMPLATE SMALL v8 copy/state';
const SCREENSHOT_DIR = path.join(STATE_DIR, 'screenshots');

if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
}
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const results = {
    test: "playwright_vision",
    timestamp: new Date().toISOString(),
    test_59_direct: {
        passed: false,
        final_url: "",
        redirected_to_simpleswap: false,
        screenshot: "",
        errors: []
    },
    test_19_decline: {
        passed: false,
        popup_appeared: false,
        final_url: "",
        redirected_to_simpleswap: false,
        screenshot: "",
        errors: []
    },
    test_29_accept: {
        passed: false,
        popup_appeared: false,
        final_url: "",
        redirected_to_simpleswap: false,
        screenshot: "",
        errors: []
    }
};

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function test59DirectPurchase(browser) {
    console.log('\n=== TEST 1: $59 Direct Purchase Flow ===');
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('Console Error:', msg.text());
                results.test_59_direct.errors.push(msg.text());
            }
        });

        page.on('pageerror', error => {
            console.log('Page Error:', error.message);
            results.test_59_direct.errors.push(error.message);
        });

        console.log('1. Navigating to site...');
        await page.goto(SITE_URL, { waitUntil: 'networkidle' });

        console.log('2. Taking screenshot of landing page...');
        const landingScreenshot = path.join(SCREENSHOT_DIR, 'test1-01-landing.png');
        await page.screenshot({ path: landingScreenshot, fullPage: true });
        console.log('   Screenshot saved:', landingScreenshot);

        console.log('3. Clicking size button...');
        await page.click('.size-btn');
        await wait(500);

        console.log('4. Clicking "Get Yours Now - $59" button...');
        const beforeClickScreenshot = path.join(SCREENSHOT_DIR, 'test1-02-before-click.png');
        await page.screenshot({ path: beforeClickScreenshot, fullPage: true });

        const [response] = await Promise.all([
            page.waitForNavigation({ timeout: 15000, waitUntil: 'networkidle' }).catch(e => {
                console.log('Navigation timeout or error:', e.message);
                return null;
            }),
            page.click('#primaryCTA')
        ]);

        await wait(2000);

        const finalUrl = page.url();
        console.log('5. Final URL:', finalUrl);
        results.test_59_direct.final_url = finalUrl;

        const resultScreenshot = path.join(SCREENSHOT_DIR, 'test1-03-result.png');
        await page.screenshot({ path: resultScreenshot, fullPage: true });
        results.test_59_direct.screenshot = resultScreenshot;
        console.log('   Screenshot saved:', resultScreenshot);

        const isSimpleSwap = finalUrl.includes('simpleswap.io');
        results.test_59_direct.redirected_to_simpleswap = isSimpleSwap;
        results.test_59_direct.passed = isSimpleSwap;

        console.log('   Redirected to SimpleSwap:', isSimpleSwap);
        console.log('   Test PASSED:', results.test_59_direct.passed);

    } catch (error) {
        console.error('Test 1 Error:', error.message);
        results.test_59_direct.errors.push(error.message);

        try {
            const errorScreenshot = path.join(SCREENSHOT_DIR, 'test1-error.png');
            await page.screenshot({ path: errorScreenshot, fullPage: true });
            results.test_59_direct.screenshot = errorScreenshot;
        } catch (e) {
            console.error('Could not take error screenshot:', e.message);
        }
    } finally {
        await context.close();
    }
}

async function test19PreOrderDecline(browser) {
    console.log('\n=== TEST 2: $19 Pre-Order Flow (Decline Bump) ===');
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('Console Error:', msg.text());
                results.test_19_decline.errors.push(msg.text());
            }
        });

        page.on('pageerror', error => {
            console.log('Page Error:', error.message);
            results.test_19_decline.errors.push(error.message);
        });

        console.log('1. Navigating to site...');
        await page.goto(SITE_URL, { waitUntil: 'networkidle' });

        console.log('2. Clicking size button...');
        await page.click('.size-btn');
        await wait(500);

        console.log('3. Clicking "Pre-Order Now - $19" button...');
        await page.click('#secondaryCTA');
        await wait(1000);

        console.log('4. Checking for popup...');
        const popupVisible = await page.isVisible('#orderBumpPopup');
        results.test_19_decline.popup_appeared = popupVisible;
        console.log('   Popup appeared:', popupVisible);

        const popupScreenshot = path.join(SCREENSHOT_DIR, 'test2-01-popup.png');
        await page.screenshot({ path: popupScreenshot, fullPage: true });
        console.log('   Screenshot saved:', popupScreenshot);

        console.log('5. Clicking "No thanks, just $19 pre-order"...');
        const [response] = await Promise.all([
            page.waitForNavigation({ timeout: 15000, waitUntil: 'networkidle' }).catch(e => {
                console.log('Navigation timeout or error:', e.message);
                return null;
            }),
            page.click('#popupDecline')
        ]);

        await wait(2000);

        const finalUrl = page.url();
        console.log('6. Final URL:', finalUrl);
        results.test_19_decline.final_url = finalUrl;

        const resultScreenshot = path.join(SCREENSHOT_DIR, 'test2-02-result.png');
        await page.screenshot({ path: resultScreenshot, fullPage: true });
        results.test_19_decline.screenshot = resultScreenshot;
        console.log('   Screenshot saved:', resultScreenshot);

        const isSimpleSwap = finalUrl.includes('simpleswap.io');
        results.test_19_decline.redirected_to_simpleswap = isSimpleSwap;
        results.test_19_decline.passed = isSimpleSwap && popupVisible;

        console.log('   Redirected to SimpleSwap:', isSimpleSwap);
        console.log('   Test PASSED:', results.test_19_decline.passed);

    } catch (error) {
        console.error('Test 2 Error:', error.message);
        results.test_19_decline.errors.push(error.message);

        try {
            const errorScreenshot = path.join(SCREENSHOT_DIR, 'test2-error.png');
            await page.screenshot({ path: errorScreenshot, fullPage: true });
            results.test_19_decline.screenshot = errorScreenshot;
        } catch (e) {
            console.error('Could not take error screenshot:', e.message);
        }
    } finally {
        await context.close();
    }
}

async function test29PreOrderAccept(browser) {
    console.log('\n=== TEST 3: $29 Pre-Order Flow (Accept Bump) ===');
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('Console Error:', msg.text());
                results.test_29_accept.errors.push(msg.text());
            }
        });

        page.on('pageerror', error => {
            console.log('Page Error:', error.message);
            results.test_29_accept.errors.push(error.message);
        });

        console.log('1. Navigating to site...');
        await page.goto(SITE_URL, { waitUntil: 'networkidle' });

        console.log('2. Clicking size button...');
        await page.click('.size-btn');
        await wait(500);

        console.log('3. Clicking "Pre-Order Now - $19" button...');
        await page.click('#secondaryCTA');
        await wait(1000);

        console.log('4. Checking for popup...');
        const popupVisible = await page.isVisible('#orderBumpPopup');
        results.test_29_accept.popup_appeared = popupVisible;
        console.log('   Popup appeared:', popupVisible);

        const popupScreenshot = path.join(SCREENSHOT_DIR, 'test3-01-popup.png');
        await page.screenshot({ path: popupScreenshot, fullPage: true });
        console.log('   Screenshot saved:', popupScreenshot);

        console.log('5. Clicking "Yes, Upgrade to $29"...');
        const [response] = await Promise.all([
            page.waitForNavigation({ timeout: 15000, waitUntil: 'networkidle' }).catch(e => {
                console.log('Navigation timeout or error:', e.message);
                return null;
            }),
            page.click('#popupAccept')
        ]);

        await wait(2000);

        const finalUrl = page.url();
        console.log('6. Final URL:', finalUrl);
        results.test_29_accept.final_url = finalUrl;

        const resultScreenshot = path.join(SCREENSHOT_DIR, 'test3-02-result.png');
        await page.screenshot({ path: resultScreenshot, fullPage: true });
        results.test_29_accept.screenshot = resultScreenshot;
        console.log('   Screenshot saved:', resultScreenshot);

        const isSimpleSwap = finalUrl.includes('simpleswap.io');
        results.test_29_accept.redirected_to_simpleswap = isSimpleSwap;
        results.test_29_accept.passed = isSimpleSwap && popupVisible;

        console.log('   Redirected to SimpleSwap:', isSimpleSwap);
        console.log('   Test PASSED:', results.test_29_accept.passed);

    } catch (error) {
        console.error('Test 3 Error:', error.message);
        results.test_29_accept.errors.push(error.message);

        try {
            const errorScreenshot = path.join(SCREENSHOT_DIR, 'test3-error.png');
            await page.screenshot({ path: errorScreenshot, fullPage: true });
            results.test_29_accept.screenshot = errorScreenshot;
        } catch (e) {
            console.error('Could not take error screenshot:', e.message);
        }
    } finally {
        await context.close();
    }
}

async function runAllTests() {
    console.log('Starting Playwright Purchase Flow Tests...');
    console.log('Site URL:', SITE_URL);
    console.log('Screenshots will be saved to:', SCREENSHOT_DIR);

    const browser = await chromium.launch({
        headless: true
    });

    try {
        await test59DirectPurchase(browser);
        await test19PreOrderDecline(browser);
        await test29PreOrderAccept(browser);

        const resultsPath = path.join(STATE_DIR, 'playwright-test.json');
        fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
        console.log('\n=== RESULTS SAVED ===');
        console.log('Results file:', resultsPath);

        console.log('\n=== TEST SUMMARY ===');
        console.log('Test 1 ($59 Direct):        ' + (results.test_59_direct.passed ? 'PASSED' : 'FAILED'));
        console.log('  - Redirected to SimpleSwap:', results.test_59_direct.redirected_to_simpleswap);
        console.log('  - Final URL:', results.test_59_direct.final_url);
        if (results.test_59_direct.errors.length > 0) {
            console.log('  - Errors:', results.test_59_direct.errors.length);
        }

        console.log('\nTest 2 ($19 Decline):       ' + (results.test_19_decline.passed ? 'PASSED' : 'FAILED'));
        console.log('  - Popup appeared:', results.test_19_decline.popup_appeared);
        console.log('  - Redirected to SimpleSwap:', results.test_19_decline.redirected_to_simpleswap);
        console.log('  - Final URL:', results.test_19_decline.final_url);
        if (results.test_19_decline.errors.length > 0) {
            console.log('  - Errors:', results.test_19_decline.errors.length);
        }

        console.log('\nTest 3 ($29 Accept):        ' + (results.test_29_accept.passed ? 'PASSED' : 'FAILED'));
        console.log('  - Popup appeared:', results.test_29_accept.popup_appeared);
        console.log('  - Redirected to SimpleSwap:', results.test_29_accept.redirected_to_simpleswap);
        console.log('  - Final URL:', results.test_29_accept.final_url);
        if (results.test_29_accept.errors.length > 0) {
            console.log('  - Errors:', results.test_29_accept.errors.length);
        }

        console.log('\n=== SCREENSHOTS ===');
        console.log('All screenshots saved in:', SCREENSHOT_DIR);

    } finally {
        await browser.close();
    }
}

runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
