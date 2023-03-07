const setup = require('../browser');

const disabledResourceType = [
  ["stylesheet", true],
  ["image",true],
  ["media",true],
  ["font",true],
  ["manifest",true],
];
const disabledMap = new Map(disabledResourceType);

module.exports = async function handler(req, res) {
  const url = req.query.t;
  const wait = req.query.wait;
  const browser = await setup();
  console.log("testID=>", browser.__test_id__);
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
  const html = await page.evaluate(() => {
    const target = document.body.querySelector(wait) || {};
    return target.innerHTML;
  });
  page.close();
  res.status(200).json({ html });
}