import { chromium } from "playwright";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const CHROME_PATH = process.env.CHROME_PATH;
  const PROFILE = process.env.PLAYWRIGHT_PROFILE || "human-session";

  if (!CHROME_PATH) {
    console.error("ERRO: Defina CHROME_PATH no arquivo .env");
    process.exit(1);
  }

  // Inicia browser real com perfil persistente
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

  // Desabilita webdriver
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  // User Agent humano
  await page.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
  });

  const query = "designer são caetano instagram"; // ajuste sua query
  const results = [];

  console.log("Iniciando scraping...\n");

  for (let pageIndex = 0; pageIndex < 3; pageIndex++) {
    const start = pageIndex * 10;
    const url = `https://www.google.com/search?q=${encodeURIComponent(
      query,
    )}&start=${start}`;

    console.log(`📄 Página ${pageIndex + 1}: ${url}`);

    await page.goto(url, { waitUntil: "domcontentloaded" });

    try {
      // Aguarda resultados
      await page.waitForSelector(".tF2Cxc", { timeout: 10000 });
    } catch {
      console.log("Nenhum resultado encontrado nesta página.");
      continue;
    }

    // Delay humano
    await delay(1000 + Math.random() * 1500);

    // Extrair resultados
    const items = await page.$$eval(".tF2Cxc", (nodes) =>
      nodes.map((n) => {
        const link = n.querySelector("a.zReHs")?.href || "";
        const title = n.querySelector("h3.LC20lb")?.innerText || "";
        const snippet = n.querySelector("div.VwiC3b")?.innerText || "";

        const raw = n.querySelector("span.VuuXrf")?.innerText || "";
        let username = raw.includes("·") ? raw.split("·")[1].trim() : "";

        return { title, link, username, snippet };
      }),
    );

    // Filtro: apenas links do Instagram
    const filtered = items.filter((r) => r.link.includes("instagram.com"));

    results.push(...filtered);
  }

  console.log(
    `\nDone! ${results.length} resultados filtrados (Instagram apenas).`,
  );

  // Salva JSON
  fs.writeFileSync("./output.json", JSON.stringify(results, null, 2), "utf-8");

  // Salva CSV
  const csv = [
    "title,link,username,snippet",
    ...results.map(
      (r) =>
        `"${r.title.replace(/"/g, "'")}",` +
        `"${r.link}",` +
        `"${r.username}",` +
        `"${r.snippet.replace(/"/g, "'")}"`,
    ),
  ].join("\n");

  fs.writeFileSync("./output.csv", csv, "utf-8");

  console.log("→ output.json salvo");
  console.log("→ output.csv salvo");

  await browser.close();
})();
