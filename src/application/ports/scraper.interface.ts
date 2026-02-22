import { Car } from '../../domain/car';

export interface IScraper {
    scrapeCars(brand: string, model: string, maxPages: number): Promise<Car[]>;
}
