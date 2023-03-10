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
  try {
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
    page.goto(url);
    await page.waitForSelector(wait, { visible: true, timeout: 5000 });
    const html = await page.evaluate(() => {
      const target = document.body.querySelector(wait) || {};
      return target.innerHTML;
    });
    page.close();
    res.status(200).json({ html });
  } catch (e) {
    console.log(e);
    res.status(200).json({ error: e });
  }
}