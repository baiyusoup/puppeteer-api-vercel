const puppeteer = require("puppeteer-core");
const chrome = require("chrome-aws-lambda");

// const disabledResourceType = [
//   ["stylesheet", true],
//   ["image", true],
//   ["media", true],
//   ["font", true],
// ];
// const disabledMap = new Map(disabledResourceType);

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 * @returns
 */
module.exports = async function handler(req, res) {
  try {
    const { target_url, pick_selectors, wait_eval } = req.body;
    console.log("log ==> ", req.body);
    if (!target_url) {
      res.json({ success: false, msg: "无效参数" });
      return;
    }

    const browser = await puppeteer.launch(
      process.env.NODE_ENV === "production"
        ? {
            args: chrome.args,
            executablePath: await chrome.executablePath,
            headless: chrome.headless,
          }
        : {}
    );
    const page = await browser.newPage();

    // await page.setRequestInterception(true);
    // page.on("request", (req) => {
    //   const isHandled =
    //     typeof req.isInterceptResolutionHandled === "function"
    //       ? req.isInterceptResolutionHandled()
    //       : req._interceptionHandled;
    //   if (isHandled) {
    //     return;
    //   }
    //   if (disabledMap.has(req.resourceType())) {
    //     req.abort();
    //   } else {
    //     req.continue();
    //   }
    // });

    await page.goto(target_url);
    if (wait_eval) {
      await page.waitForFunction(wait_eval);
    }

    const html = await page.evaluate(
      ({ pick_selectors }) => {
        function getAttributeStr(el) {
          const attrs = [];
          const list = el.getAttributeNames();
          list.forEach((key) => {
            const value = el.getAttribute(key);
            attrs.push(`${key}="${value}"`);
          });
          return attrs.join(" ");
        }
        if (pick_selectors?.length) {
          const html = pick_selectors.map((selector) => {
            const section = document.body.querySelector(selector);
            if (section) {
              const tag = section.tagName.toLowerCase();
              const attrs = getAttributeStr(section);
              return `<${tag} ${attrs}>${section.innerHTML}</${tag}>`;
            }
            return "";
          });
          if (!html.length) {
            return document.body.innerHTML;
          }
          return `<div id="__remAppFetchHtml__">${html.join("")}</div>`;
        }
        return document.body.innerHTML;
      },
      { pick_selectors }
    );

    res.json({ success: true, data: html });
  } catch (e) {
    console.log(e);
    res.json({ success: false, msg: "服务端错误" });
  }
};
