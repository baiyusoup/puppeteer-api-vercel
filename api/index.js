const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const disabledResourceType = [
  ["stylesheet", true],
  ["image",true],
  ["media",true],
  ["font",true],
  ["manifest",true],
];
const disabledMap = new Map(disabledResourceType);
const USER_DATA_DIR = "./node_modules/.remCache";

module.exports = async function handler(req, res) {
  const url = req.query.t;
  const wait = req.query.wait;

  const options = {
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
    userDataDir: USER_DATA_DIR
  }
  let browser = await puppeteer.launch(options);
  browser.on("disconnected", () => {
    browser = null;
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if (request._interceptionHandled) return;
    if (disabledMap.has(request.resourceType())) {
      request.abort();
    } else {
      request.continue();
    }
  })
  await page.goto(url);
  if (wait) {
    await page.waitForSelector(wait, { visible: true });
  }
  const html = await page.evaluate(() => document.body.innerHTML);
  page.close();
  browser.close();
  res.status(200).json({ name: 'John Doe', size: html.length })
}