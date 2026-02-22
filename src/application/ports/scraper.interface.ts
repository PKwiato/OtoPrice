import { Car } from '../../domain/car';

export interface IScraper {
    scrapeCars(brand: string, model: string, maxPages: number, yearFrom?: number, yearTo?: number): Promise<Car[]>;
}
