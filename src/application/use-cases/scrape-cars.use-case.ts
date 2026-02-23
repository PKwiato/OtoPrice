import { Car } from '../../domain/car';
import { IScraper } from '../ports/scraper.interface';

export class ScrapeCarsUseCase {
    constructor(
        private scraper: IScraper
    ) { }

    async execute(brand: string, model: string, pages: number): Promise<Car[]> {
        console.log(`[UseCase] Orchestrating scrape for ${brand} ${model} (${pages} pages)`);

        // 1. Trigger Scraper
        const cars = await this.scraper.scrapeCars(brand, model, pages);

        return cars;
    }
}
