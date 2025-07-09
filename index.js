const express = require("express");
const puppeteer = require("puppeteer");
const app = express();

app.get("/descargar", async (req, res) => {
  const fileId = req.query.id;
  if (!fileId) return res.status(400).send("ID no especificado");

  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const confirmBtn = await page.$('form[action*="uc"] input[name="confirm"]');
    if (confirmBtn) {
      const form = await page.$('form[action*="uc"]');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        form.evaluate(f => f.submit())
      ]);
    }

    const finalUrl = page.url();
    await browser.close();

    res.json({ downloadUrl: finalUrl });

  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
