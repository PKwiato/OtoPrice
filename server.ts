import Fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

// SOLID Imports
import { OtomotoScraper } from './src/infrastructure/scrapers/otomoto.scraper';
import { CsvStorage } from './src/infrastructure/storage/csv.storage';
import { ScrapeCarsUseCase } from './src/application/use-cases/scrape-cars.use-case';

const startServer = async () => {
    const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

    // Dependency Injection Setup
    const scraper = new OtomotoScraper();
    const storage = new CsvStorage();
    const scrapeCarsUseCase = new ScrapeCarsUseCase(scraper, storage);

    // Add schema validator and serializer
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    // Register CORS to allow requests from the Vue frontend
    await app.register(cors, {
        origin: [/localhost:\d+$/], // Allow any port on localhost
    });

    const ScrapeSchema = z.object({
        brand: z.string().min(1),
        model: z.string().min(1),
        pages: z.number().int().min(1).default(1),
    });

    app.post(
        '/api/scrape',
        {
            schema: {
                body: ScrapeSchema,
            },
        },
        async (request, reply) => {
            const { brand, model, pages } = request.body;

            try {
                request.log.info(`Starting scrape for ${brand} ${model} up to ${pages} pages`);
                const results = await scrapeCarsUseCase.execute(brand, model, pages);
                return reply.send(results);
            } catch (err) {
                request.log.error(err);
                return reply.status(500).send({ error: 'Failed to scrape data.' });
            }
        }
    );

    const close = async (signal: string) => {
        app.log.info({ signal }, "shutting down");
        await app.close();
        process.exit(0);
    };

    process.on("SIGINT", () => void close("SIGINT"));
    process.on("SIGTERM", () => void close("SIGTERM"));

    try {
        await app.listen({ host: '0.0.0.0', port: 3000 });
        console.log('🚀 API Server ready at http://localhost:3000');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

startServer();
