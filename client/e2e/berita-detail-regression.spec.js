import { test, expect } from "@playwright/test";
import { SLUGS } from "./helpers";

// REGRESI: bug "gap di atas gambar artikel" + "radius tidak boleh ada" di Berita Detail.
// Buat berita kosong tidak mungkin; maka tes ini jalan terhadap berita manapun yang
// ditunjuk TEST_BERITA_SLUG dan berisi figure (gambar+figcaption).
test.describe("BERITA DETAIL — regresi gambar artikel", () => {
  const slug = SLUGS.berita;

  test("RG-10/RG-10b: gambar tanpa gap di atasnya & tanpa radius (semua viewport)", async ({ page }) => {
    await page.goto(`/berita/${slug}`);
    await page.waitForLoadState("networkidle");

    const figure = page.locator(".prose figure").first();
    const hasFigure = (await figure.count()) > 0;
    // Jika berita tidak punya gambar ber-caption, tandai SKIP (screencast info)
    test.skip(!hasFigure, "Berita ini tidak punya figure (gambar ber-caption) — ubah TEST_BERITA_SLUG");

    const img = page.locator(".prose figure > div > img").first();
    await expect(img).toBeVisible();

    for (const width of [340, 360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      // pastikan img tidak punya margin-top
      const mt = await img.evaluate((el) => getComputedStyle(el).marginTop);
      const mtFig = await img.evaluate(() => {
        const f = document.querySelector(".prose figure");
        return f ? getComputedStyle(f).marginTop : "";
      });
      const radius = await img.evaluate((el) => getComputedStyle(el).borderRadius);
      const radiusWrap = await page.locator(".prose figure > div").first().evaluate((el) => getComputedStyle(el).borderRadius);

      console.log(`[${width}px] img.marginTop=${mt} figure.marginTop=${mtFig} img.radius=${radius} wrap.radius=${radiusWrap}`);
      expect(parseFloat(mt)).toBe(0);
      expect(radius).toBe("0px");
      expect(radiusWrap).toBe("0px");
    }
  });
});
