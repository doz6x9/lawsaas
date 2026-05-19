import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const urls = [
    { name: 'Landing', url: 'http://localhost:5173' },
    { name: 'Intake', url: 'http://localhost:5173/intake' },
    { name: 'Services', url: 'http://localhost:5173/services' },
    { name: 'Privacy', url: 'http://localhost:5173/privacy' },
    { name: 'Terms', url: 'http://localhost:5173/terms' },
    { name: 'Contact', url: 'http://localhost:5173/contact' }
    {name : 'Dashboard', url: 'http://localhost:5173/#usecases' }
  ];
  
  for (const {name, url} of urls) {
    console.log('=== ' + name + ' Page ===');
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
      
      // Check for console errors  
      const images = await page.locator('img').count();
      const buttons = await page.locator('button').count();
      const inputs = await page.locator('input, textarea').count();
      
      console.log('Page loaded. Images: ' + images + ', Buttons: ' + buttons + ', Inputs: ' + inputs);
      
      // Take screenshot
      await page.screenshot({ path: 'test-' + name.toLowerCase() + '.png' });
      
    } catch (e) {
      console.log('Error: ' + e.message);
    }
  }
  
  await browser.close();
})();
