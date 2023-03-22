const handleHtml = require("./html");
/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 * @returns
 */
module.exports = async function handler(req, res) {
  if (req.url.endsWith("/html")) {
    return handleHtml(req, res);
  }
  res.json({ name: "John Doe" });
};
