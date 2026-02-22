import { launchBrowser, handleCookieConsent } from './browser-utils';

export interface OtomotoBrand {
    id: string;
    label: string;
}

export interface OtomotoModel {
    id: string;
    label: string;
}

export class OtomotoMetadataScraper {
    private async getNextData(url: string) {
        const { browser, page } = await launchBrowser();
        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
            await handleCookieConsent(page);

            const nextData = await page.evaluate(() => {
                const script = document.getElementById('__NEXT_DATA__');
                return script ? JSON.parse(script.innerText) : null;
            });
            return nextData;
        } finally {
            await browser.close();
        }
    }

    async fetchBrands(): Promise<OtomotoBrand[]> {
        const data = await this.getNextData('https://www.otomoto.pl/');
        if (!data) return [];

        const extractFromFilters = (filters: any) => {
            const state = filters?.states?.find((s: any) => s.filterId === 'filter_enum_make');
            return state?.values?.[0]?.values?.map((v: any) => ({
                id: v.id,
                label: v.name
            })) || [];
        };

        // Case 1: Directly in pageProps
        let brands = extractFromFilters(data.props?.pageProps?.screenComponentsFilters);
        if (brands.length > 0) return brands;

        // Case 2: In urqlState
        const urqlState = data.props?.pageProps?.urqlState || {};
        for (const key in urqlState) {
            try {
                const innerData = JSON.parse(urqlState[key].data);
                brands = extractFromFilters(innerData.filters);
                if (brands.length > 0) return brands;
            } catch (e) { }
        }

        return [];
    }

    async fetchModels(brandId: string): Promise<OtomotoModel[]> {
        const data = await this.getNextData(`https://www.otomoto.pl/osobowe/${brandId}`);
        if (!data) return [];

        const extractFromFilters = (filters: any) => {
            // Find states that have NO conditions (global ones) OR conditions that match our brandId
            const states = filters?.states || [];

            // Look for a state where filterId is filter_enum_model
            const modelState = states.find((s: any) => {
                if (s.filterId !== 'filter_enum_model') return false;

                // If there are conditions, one of them must be the correct brandId
                if (s.conditions && s.conditions.length > 0) {
                    return s.conditions.some((c: any) => c.filterId === 'filter_enum_make' && c.value === brandId);
                }

                return true;
            });

            return modelState?.values?.[0]?.values?.map((v: any) => ({
                id: v.id,
                label: v.name
            })) || [];
        };

        // Case 1: Directly in pageProps
        let models = extractFromFilters(data.props?.pageProps?.screenComponentsFilters);
        if (models.length > 0) return models;

        // Case 2: In urqlState
        const urqlState = data.props?.pageProps?.urqlState || {};
        for (const key in urqlState) {
            try {
                if (!urqlState[key].data) continue;
                const innerData = JSON.parse(urqlState[key].data);
                models = extractFromFilters(innerData.filters);
                if (models.length > 0) return models;
            } catch (e) { }
        }

        return [];
    }
}
