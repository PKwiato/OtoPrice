<script setup lang="ts">
import { ref, computed } from 'vue';
import ScrapeForm from './components/ScrapeForm.vue';
import ResultsTable from './components/ResultsTable.vue';
import ScrapeSummary from './components/ScrapeSummary.vue';
import AdvancedFilters from './components/AdvancedFilters.vue';
import type { Car } from '../../src/domain/car';

const isLoading = ref(false);
const results = ref<Car[]>([]);
const error = ref<string | null>(null);
const activeFilters = ref<any>({});

const parseNum = (s: any) => {
    if (typeof s === 'number') return s;
    return parseFloat(s?.toString().replace(/\D/g, '') || '0');
};

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

const filteredResults = computed(() => {
  let filtered = results.value;
  const f = activeFilters.value;
  if (!f) return filtered;

  if (f.search) {
    const q = f.search.toLowerCase();
    filtered = filtered.filter(car => 
      car.title.toLowerCase().includes(q) || 
      car.brand.toLowerCase().includes(q) ||
      car.model.toLowerCase().includes(q)
    );
  }

  if (f.priceMin != null) filtered = filtered.filter(car => parseNum(car.price) >= f.priceMin);
  if (f.priceMax != null) filtered = filtered.filter(car => parseNum(car.price) <= f.priceMax);
  if (f.yearMin != null) filtered = filtered.filter(car => parseNum(car.year) >= f.yearMin);
  if (f.yearMax != null) filtered = filtered.filter(car => parseNum(car.year) <= f.yearMax);
  if (f.mileageMax != null) filtered = filtered.filter(car => parseNum(car.mileage) <= f.mileageMax);
  
  if (f.fuelType?.length > 0) filtered = filtered.filter(car => f.fuelType.includes(car.fuelType));
  if (f.gearbox?.length > 0) filtered = filtered.filter(car => f.gearbox.includes(car.gearbox));
  if (f.bodyStyle?.length > 0) filtered = filtered.filter(car => f.bodyStyle.includes(car.bodyStyle));
  if (f.color?.length > 0) filtered = filtered.filter(car => f.color.includes(car.color));
  if (f.condition?.length > 0) filtered = filtered.filter(car => f.condition.includes(car.condition));

  if (f.engineCapacityMin != null) filtered = filtered.filter(car => parseNum(car.engineCapacity) >= f.engineCapacityMin);
  if (f.engineCapacityMax != null) filtered = filtered.filter(car => parseNum(car.engineCapacity) <= f.engineCapacityMax);
  if (f.powerMin != null) filtered = filtered.filter(car => parseNum(car.power) >= f.powerMin);
  if (f.powerMax != null) filtered = filtered.filter(car => parseNum(car.power) <= f.powerMax);

  if (f.city) {
    const q = f.city.toLowerCase();
    filtered = filtered.filter(car => car.city.toLowerCase().includes(q));
  }

  return filtered;
});
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

      <AdvancedFilters 
        v-if="results.length > 0 || isLoading" 
        :results="results" 
        @update:filters="activeFilters = $event" 
      />

      <div v-if="error" class="mt-6 mb-4 max-w-lg mx-auto bg-red-900/50 border border-red-500 text-red-100 px-4 py-3 rounded relative" role="alert">
        <strong class="font-bold">Error:</strong>
        <span class="block sm:inline ml-2">{{ error }}</span>
      </div>

      <ScrapeSummary v-if="!isLoading && filteredResults.length > 0" :results="filteredResults" />
      <ResultsTable :results="filteredResults" :is-loading="isLoading" @remove="removeResult" />
      
    </div>
  </div>
</template>
