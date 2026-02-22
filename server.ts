import Fastify from 'fastify';
import cors from '@fastify/cors';
import { z } from 'zod';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

// SOLID Imports
import { OtomotoScraper } from './src/infrastructure/scrapers/otomoto.scraper';
import { OtomotoMetadataScraper } from './src/infrastructure/scrapers/otomoto-metadata.scraper';

const startServer = async () => {
    const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

    // Dependency Injection Setup
    const scraper = new OtomotoScraper();
    const metadataScraper = new OtomotoMetadataScraper();

    // Add schema validator and serializer
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    // Register CORS to allow requests from the Vue frontend
    await app.register(cors, {
        origin: [/localhost:\d+$/], // Allow any port on localhost
    });

    app.get('/api/otomoto/brands', async (request, reply) => {
        try {
            const brands = await metadataScraper.fetchBrands();
            return reply.send(brands);
        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({ error: 'Failed to fetch brands.' });
        }
    });

    app.get('/api/otomoto/models', {
        schema: {
            querystring: z.object({
                brand: z.string().min(1)
            })
        }
    }, async (request, reply) => {
        const { brand } = request.query;
        try {
            const models = await metadataScraper.fetchModels(brand);
            return reply.send(models);
        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({ error: 'Failed to fetch models.' });
        }
    });

    app.get('/api/scrape', {
        schema: {
            querystring: z.object({
                brand: z.string().min(1),
                model: z.string().min(1),
                pages: z.coerce.number().min(1).max(5),
                yearFrom: z.coerce.number().optional(),
                yearTo: z.coerce.number().optional()
            })
        }
    }, async (request, reply) => {
        const { brand, model, pages, yearFrom, yearTo } = request.query;
        try {
            request.log.info(`Starting scrape for ${brand} ${model} up to ${pages} pages, from ${yearFrom || 'any'} to ${yearTo || 'any'}`);
            const cars = await scraper.scrapeCars(brand, model, pages, yearFrom, yearTo);
            return reply.send(cars);
        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({ error: 'Scraping failed.' });
        }
    });

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
