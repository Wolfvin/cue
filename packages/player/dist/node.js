import { e as p } from "./export.js";
async function u(e) {
  const {
    outputPath: n,
    scaleFactor: i = 2,
    timeout: a = 1e4
  } = e, s = p({ ...e, playerJsInline: !0 });
  let r;
  try {
    r = await import("puppeteer");
  } catch {
    throw new Error(
      "[cue] exportToPng requires puppeteer as a peer dependency. Install it with: npm install puppeteer"
    );
  }
  const o = await r.launch({
    headless: !0,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  try {
    const t = await o.newPage();
    await t.setViewport({
      width: e.width ?? 840,
      height: e.height ?? 520,
      deviceScaleFactor: i
    }), await t.setContent(s, {
      waitUntil: "load",
      timeout: a
    }), await t.waitForSelector("cue-embed", { timeout: a });
    const l = await t.screenshot({
      type: "png",
      path: n,
      fullPage: !1
    });
    return Buffer.from(l);
  } finally {
    await o.close();
  }
}
export {
  p as exportToHtml,
  u as exportToPng
};
