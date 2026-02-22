import * as fs from 'fs';
import { Car } from '../../domain/car';
import { IStorage } from '../../application/ports/storage.interface';

export class CsvStorage implements IStorage {
    private readonly filePath = 'ogloszenia.csv';

    async saveCars(cars: Car[]): Promise<void> {
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, this.getHeader(), 'utf8');
        }

        for (const car of cars) {
            fs.appendFileSync(this.filePath, this.toCsvRow(car), 'utf8');
        }
    }

    private getHeader(): string {
        return "ID;TYTUL;CENA;WALUTA;MIASTO;URL;MARKA;MODEL;WERSJA;ROK;PRZEBIEG;PALIWO;POJEMNOSC;MOC;SKRZYNIA;NAPED;NADWOZIE;KOLOR;STAN;VIN\n";
    }

    private toCsvRow(car: Car): string {
        const sanitize = (val: any) => (val?.toString() || "").replace(/;/g, ' ');
        return [
            car.id,
            car.title,
            car.price,
            car.currency,
            car.city,
            car.url,
            car.brand,
            car.model,
            car.version,
            car.year,
            car.mileage,
            car.fuelType,
            car.engineCapacity,
            car.power,
            car.gearbox,
            car.drivetrain,
            car.bodyStyle,
            car.color,
            car.condition,
            car.vin
        ].map(sanitize).join(';') + '\n';
    }
}
