const chrome = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

let browser;

module.exports = async function setup() {
  if (!browser) {
    const options = {
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
    }
    browser = await puppeteer.launch(options);
    browser.on('disconnected', () => {
      browser = null;
    })
    browser.__test_id__ = Date.now();
  }
  return browser;
}