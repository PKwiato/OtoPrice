<script setup lang="ts">
import { computed } from 'vue';
import type { Car } from '../../../src/domain/car';

const props = defineProps<{
  results: Car[];
}>();

const stats = computed(() => {
  if (props.results.length === 0) return null;

  const prices = props.results
    .map(car => typeof car.price === 'string' ? parseFloat(car.price.replace(/\s/g, '')) : car.price)
    .filter(p => !isNaN(p));

  const totalCount = props.results.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  const locationMap: Record<string, number> = {};
  props.results.forEach(car => {
    const loc = car.city || 'Unknown';
    locationMap[loc] = (locationMap[loc] || 0) + 1;
  });

  const locations = Object.entries(locationMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    totalCount,
    minPrice,
    maxPrice,
    avgPrice,
    locations,
    currency: props.results[0]?.currency || 'PLN'
  };
});

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(value);
};
</script>

<template>
  <div v-if="stats" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <!-- Total Volume Card -->
    <div class="stat-card group">
        <div class="icon-bg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="Storehouse" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        </div>
        <div class="mt-4">
            <h3 class="text-gray-400 text-sm font-medium">Listings Found</h3>
            <p class="text-3xl font-bold text-white mt-1">{{ stats.totalCount }}</p>
        </div>
    </div>

    <!-- Pricing Card -->
    <div class="stat-card group md:col-span-2">
        <div class="flex justify-between items-start">
            <div class="icon-bg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div class="flex gap-4 text-right">
                <div class="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold">Max: {{ formatPrice(stats.maxPrice) }} {{ stats.currency }}</div>
                <div class="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-semibold">Min: {{ formatPrice(stats.minPrice) }} {{ stats.currency }}</div>
            </div>
        </div>
        <div class="mt-4 flex items-end justify-between">
            <div>
                <h3 class="text-gray-400 text-sm font-medium">Average Market Price</h3>
                <p class="text-3xl font-bold text-emerald-400 mt-1">{{ formatPrice(stats.avgPrice) }} <span class="text-sm font-normal text-gray-400">{{ stats.currency }}</span></p>
            </div>
            <div class="w-1/2 h-2 bg-gray-700 rounded-full overflow-hidden hidden sm:block">
                <div class="h-full bg-gradient-to-r from-blue-500 to-emerald-500" :style="{ width: '70%' }"></div>
            </div>
        </div>
    </div>

    <!-- Location Distribution Card -->
    <div class="stat-card group md:col-span-3">
        <div class="flex items-center gap-3 mb-4">
            <div class="icon-bg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
            <h3 class="text-white font-semibold">Top Locations</h3>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div v-for="[city, count] in stats.locations" :key="city" class="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                <p class="text-xs text-gray-400 truncate" :title="city">{{ city }}</p>
                <p class="text-lg font-bold text-white mt-1">{{ count }} <span class="text-xs font-normal text-gray-500">ads</span></p>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
    background: rgba(31, 41, 55, 0.4);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(75, 85, 99, 0.3);
    border-radius: 1.25rem;
    padding: 1.5rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
    border-color: rgba(96, 165, 250, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.icon-bg {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.75rem;
}
</style>
