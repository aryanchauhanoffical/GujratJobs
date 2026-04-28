import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE_ERROR:', err.message, err.stack));

  await page.goto('http://localhost:3000/login', { waitUntil: 'load' });
  
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
