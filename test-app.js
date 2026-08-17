const puppeteer = require('puppeteer');
const handler = require('serve-handler');
const http = require('http');

const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: 'dist/store-hub/browser'
  });
});

server.listen(3000, async () => {
  console.log('Running at http://localhost:3000');
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await browser.close();
  } catch (err) {
    console.error(err);
  }
  server.close();
});
