import { Car } from '../../domain/car';

export interface IStorage {
    saveCars(cars: Car[]): Promise<void>;
}
