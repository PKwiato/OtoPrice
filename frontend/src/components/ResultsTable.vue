<script setup lang="ts">
import type { Car } from '../../../src/domain/car';

defineProps<{
  results: Car [];
  isLoading: boolean;
}>();
</script>

<template>
  <div class="w-full overflow-x-auto rounded-xl shadow-lg border border-gray-700 mt-8">
    <div v-if="isLoading" class="p-12 text-center text-gray-400">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
      <p>Scraping data from Otomoto... this might take a moment.</p>
    </div>
    
    <div v-else-if="results.length === 0" class="p-12 text-center text-gray-400 bg-gray-800">
      <p>No results to display. Try searching for a car above.</p>
    </div>

    <table v-else class="min-w-full divide-y divide-gray-700 bg-gray-800">
      <thead class="bg-gray-900">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Car</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Details</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
          <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Link</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-700">
        <tr v-for="car in results" :key="car.id" class="hover:bg-gray-750 transition-colors">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-white truncate max-w-xs" :title="car.title">{{ car.title }}</div>
            <div class="text-xs text-gray-400">{{ car.year }} • {{ car.mileage }}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-bold text-green-400">{{ car.price }} {{ car.currency }}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-300">{{ car.engineCapacity }} • {{ car.power }}</div>
            <div class="text-xs text-gray-500">{{ car.fuelType }} • {{ car.gearbox }}</div>
          </td>
           <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
             {{ car.city }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <a :href="car.url" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">
              View
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.hover\:bg-gray-750:hover {
    background-color: rgba(55, 65, 81, 0.5);
}
</style>
