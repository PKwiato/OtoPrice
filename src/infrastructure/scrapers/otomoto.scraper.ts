import { Car } from '../../domain/car';
import { IScraper } from '../../application/ports/scraper.interface';
import { launchBrowser } from './browser-utils';

export class OtomotoScraper implements IScraper {
    async scrapeCars(brand: string, model: string, maxPages: number): Promise<Car[]> {
        const { browser, page } = await launchBrowser();
        const scrapedCars: Car[] = [];

        try {
            for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
                const listUrl = `https://www.otomoto.pl/osobowe/${brand}/${model}?page=${pageNum}`;
                console.log(`\n--- [OtomotoScraper] Scanning Page ${pageNum} ---`);

                await page.goto(listUrl, { waitUntil: 'networkidle', timeout: 60000 });
                await handleCookieConsent(page);

                // Extraction logic
                const links = await this.extractLinks(page);
                console.log(`Found ${links.length} ads.`);

                for (const adUrl of links) {
                    try {
                        console.log(`-> Fetching: ${adUrl.split('/').pop()}`);
                        await page.goto(adUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

                        const adData = await page.evaluate(() => {
                            const script = document.getElementById('__NEXT_DATA__');
                            if (!script) return null;
                            const parsed = JSON.parse(script.innerText);
                            return parsed.props?.pageProps?.ad || parsed.props?.pageProps?.advert;
                        });

                        if (adData) {
                            scrapedCars.push(this.mapToDomain(adData, adUrl));
                        }
                        await new Promise(r => setTimeout(r, 800));
                    } catch (e) {
                        continue;
                    }
                }
            }
            return scrapedCars;
        } finally {
            await browser.close();
        }
    }

    private async extractLinks(page: any): Promise<string[]> {
        const links = await page.evaluate(() => {
            const script = document.getElementById('__NEXT_DATA__');
            if (!script) return [];
            const parsed = JSON.parse(script.innerText);
            const ads = parsed.props?.pageProps?.ads?.data || parsed.props?.pageProps?.results?.data || [];
            return ads.map((ad: any) => ad.url).filter((url: string) => url);
        });

        if (links.length === 0) {
            return await page.evaluate(() => {
                return Array.from(document.querySelectorAll('article a'))
                    .map((a: any) => a.href)
                    .filter((href: string) => href.includes('/oferta/') && !href.includes('#'));
            });
        }
        return links;
    }

    private mapToDomain(ad: any, url: string): Car {
        const paramsList = ad.params || ad.details || [];
        const params: Record<string, string> = {};
        for (const p of paramsList) {
            if (p.label && p.value) params[p.label] = p.value;
        }

        return {
            id: ad.id?.toString() || "",
            title: ad.title || "",
            price: ad.price?.value || "",
            currency: ad.price?.currency || "",
            city: ad.seller?.location?.city || ad.location?.city?.name || "Brak",
            url: url,
            brand: params["Marka pojazdu"] || "",
            model: params["Model pojazdu"] || "",
            version: params["Wersja"] || "",
            year: params["Rok produkcji"] || "",
            mileage: params["Przebieg"] || "",
            fuelType: params["Rodzaj paliwa"] || "",
            engineCapacity: params["Pojemność skokowa"] || "",
            power: params["Moc"] || "",
            gearbox: params["Skrzynia biegów"] || "",
            drivetrain: params["Napęd"] || "",
            bodyStyle: params["Typ nadwozia"] || "",
            color: params["Kolor"] || "",
            condition: params["Stan"] || "",
            vin: params["VIN"] || ""
        };
    }
}
