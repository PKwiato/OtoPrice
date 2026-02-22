<script setup lang="ts">
import { ref } from 'vue';
import ScrapeForm from './components/ScrapeForm.vue';
import ResultsTable from './components/ResultsTable.vue';
import ScrapeSummary from './components/ScrapeSummary.vue';
import type { Car } from '../../src/domain/car';

const isLoading = ref(false);
const results = ref<Car[]>([]);
const error = ref<string | null>(null);

const handleScrape = async ({ brand, model, pages, yearFrom, yearTo }: { brand: string; model: string; pages: number; yearFrom?: number; yearTo?: number }) => {
  isLoading.value = true;
  error.value = null;
  results.value = [];

  try {
    const url = new URL('http://localhost:3000/api/scrape');
    url.searchParams.append('brand', brand);
    url.searchParams.append('model', model);
    url.searchParams.append('pages', pages.toString());
    if (yearFrom) url.searchParams.append('yearFrom', yearFrom.toString());
    if (yearTo) url.searchParams.append('yearTo', yearTo.toString());

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Scrape failed with status: ${response.status}`);
    }

    const data = await response.json();
    results.value = data;
  } catch (err: any) {
    error.value = err.message || 'An unknown error occurred';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const removeResult = (id: string) => {
  results.value = results.value.filter(car => car.id !== id);
};
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 font-sans p-6">
    <div class="max-w-6xl mx-auto">
      
      <header class="text-center mb-10 mt-8 gap-4 flex flex-col items-center justify-center">
        <h1 class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          OtoPrice Scraper
        </h1>
        <p class="text-gray-400 mt-2 max-w-xl">
          Instantly gather the latest car data. Enter a brand and model below to analyze Otomoto listings.
        </p>
      </header>
      
      <ScrapeForm @submit="handleScrape" />

      <div v-if="error" class="mt-6 mb-4 max-w-lg mx-auto bg-red-900/50 border border-red-500 text-red-100 px-4 py-3 rounded relative" role="alert">
        <strong class="font-bold">Error:</strong>
        <span class="block sm:inline ml-2">{{ error }}</span>
      </div>

      <ScrapeSummary v-if="!isLoading && results.length > 0" :results="results" />
      <ResultsTable :results="results" :is-loading="isLoading" @remove="removeResult" />
      
    </div>
  </div>
</template>
