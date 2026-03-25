import { chromium } from "playwright";
import fs from "fs";
import dotenv from "dotenv";
import { QUERIES } from "./query.js";
dotenv.config();

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function extractFollowers(snippet) {
  const match = snippet.match(/([\d,.]+[KkMm]?)\+?\s*followers/i);
  return match ? match[1] : null;
}

(async () => {
  const CHROME_PATH = process.env.CHROME_PATH;
  const PROFILE = process.env.PLAYWRIGHT_PROFILE || "human-session";
  const MAX_PAGES = parseInt(process.env.MAX_PAGES || "1", 10);
  const DELAY_BETWEEN_QUERIES = parseInt(
    process.env.DELAY_BETWEEN_QUERIES || "6000",
    10
  );

  if (!CHROME_PATH) {
    console.error("ERRO: Defina CHROME_PATH no arquivo .env");
    process.exit(1);
  }

  const browser = await chromium.launchPersistentContext(`./${PROFILE}`, {
    headless: false,
    executablePath: CHROME_PATH,
    viewport: { width: 1280, height: 900 },
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-infobars",
      "--start-maximized",
    ],
  });

  const page = await browser.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });
  await page.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
  });

  const results = [];
  const seenUrls = new Set();
  let totalDuplicates = 0;

  console.log(`Iniciando scraping...`);
  console.log(`→ ${QUERIES.length} queries | ${MAX_PAGES} página(s) cada\n`);

  for (let qi = 0; qi < QUERIES.length; qi++) {
    const query = QUERIES[qi];
    console.log(`\n🔍 Query ${qi + 1}/${QUERIES.length}: "${query}"`);

    for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex++) {
      const start = pageIndex * 10;
      const url = `https://www.google.com/search?q=${encodeURIComponent(
        query
      )}&start=${start}`;
      console.log(`  📄 Página ${pageIndex + 1}: ${url}`);

      await page.goto(url, { waitUntil: "domcontentloaded" });

      try {
        await page.waitForSelector(".tF2Cxc", { timeout: 10000 });
      } catch {
        console.log("  ⚠️  Nenhum resultado encontrado nesta página.");
        continue;
      }

      await delay(1000 + Math.random() * 1500);

      const items = await page.$$eval(".tF2Cxc", (nodes) =>
        nodes.map((n) => {
          const link = n.querySelector("a.zReHs")?.href || "";
          const title = n.querySelector("h3.LC20lb")?.innerText || "";
          const snippet = n.querySelector("div.VwiC3b")?.innerText || "";
          const raw = n.querySelector("span.VuuXrf")?.innerText || "";
          let username = raw.includes("·") ? raw.split("·")[1].trim() : "";
          return { title, link, username, snippet };
        })
      );

      const instagramItems = items.filter((r) =>
        r.link.includes("instagram.com")
      );

      let newCount = 0;
      let dupCount = 0;

      for (const item of instagramItems) {
        if (seenUrls.has(item.link)) {
          dupCount++;
          totalDuplicates++;
        } else {
          seenUrls.add(item.link);
          results.push({
            ...item,
            followers: extractFollowers(item.snippet),
            query_origin: query,
          });
          newCount++;
        }
      }

      console.log(`  ✓ ${newCount} novos | ${dupCount} duplicados ignorados`);
    }

    if (qi < QUERIES.length - 1) {
      const wait = DELAY_BETWEEN_QUERIES + Math.random() * 3000;
      console.log(
        `\n⏳ Aguardando ${(wait / 1000).toFixed(1)}s antes da próxima query...`
      );
      await delay(wait);
    }
  }

  console.log(`\nDone!`);
  console.log(`→ ${results.length} leads únicos`);
  console.log(`→ ${totalDuplicates} duplicados ignorados no total`);

  fs.writeFileSync("./output.json", JSON.stringify(results, null, 2), "utf-8");

  const csv = [
    "title,link,username,snippet,followers,query_origin",
    ...results.map(
      (r) =>
        `"${r.title.replace(/"/g, "'")}",` +
        `"${r.link}",` +
        `"${r.username}",` +
        `"${r.snippet.replace(/"/g, "'")}",` +
        `"${r.followers ?? ""}",` +
        `"${r.query_origin}"`
    ),
  ].join("\n");

  fs.writeFileSync("./output.csv", csv, "utf-8");
  console.log("→ output.json salvo");
  console.log("→ output.csv salvo");

  await browser.close();
})();
