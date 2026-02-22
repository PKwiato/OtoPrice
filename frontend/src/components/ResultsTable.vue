<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Car } from '../../../src/domain/car';

const props = defineProps<{
  results: Car[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'remove', id: string): void;
}>();

const sortKey = ref<keyof Car | ''>('');
const sortOrder = ref<'asc' | 'desc'>('asc');

const setSort = (key: keyof Car) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const sortedResults = computed(() => {
  let filtered = props.results;

  // Sort
  if (sortKey.value) {
    filtered = [...filtered].sort((a: any, b: any) => {
      let valA = a[sortKey.value as keyof Car];
      let valB = b[sortKey.value as keyof Car];

      // Handle numeric values hidden in strings
      if (sortKey.value === 'price' || sortKey.value === 'year' || sortKey.value === 'mileage') {
        const parseNum = (s: any) => {
            if (typeof s === 'number') return s;
            return parseFloat(s?.toString().replace(/\D/g, '') || '0');
        };
        valA = parseNum(valA);
        valB = parseNum(valB);
      }

      const safeValA = valA ?? '';
      const safeValB = valB ?? '';

      if (safeValA < safeValB) return sortOrder.value === 'asc' ? -1 : 1;
      if (safeValA > safeValB) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return filtered;
});
</script>

<template>
  <div class="mt-8">

    <div class="w-full overflow-x-auto rounded-xl shadow-lg border border-gray-700">
      <div v-if="isLoading" class="p-12 text-center text-gray-400 bg-gray-800">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
        <p>Scraping data from Otomoto... this might take a moment.</p>
      </div>
      
      <div v-else-if="results.length === 0" class="p-12 text-center text-gray-400 bg-gray-800">
        <p>No results to display. Try searching for a car above.</p>
      </div>

      <div v-else-if="sortedResults.length === 0" class="p-12 text-center text-gray-400 bg-gray-800">
        <p>No results match your filter.</p>
      </div>

      <table v-else class="min-w-full divide-y divide-gray-700 bg-gray-800">
        <thead class="bg-gray-900">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Photo</th>
            <th @click="setSort('title')" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-400 transition-colors">
              Car
              <span v-if="sortKey === 'title'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th @click="setSort('price')" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-400 transition-colors">
              Price
              <span v-if="sortKey === 'price'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Details
            </th>
            <th @click="setSort('city')" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-400 transition-colors">
              Location
              <span v-if="sortKey === 'city'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-700">
          <tr v-for="car in sortedResults" :key="car.id" class="group hover:bg-gray-750 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
              <div v-if="car.imageUrl" class="h-12 w-20 flex-shrink-0">
                <img :src="car.imageUrl" :alt="car.title" class="h-full w-full object-cover rounded-md shadow-sm border border-gray-700 hover:scale-110 transition-transform cursor-pointer" />
              </div>
              <div v-else class="h-12 w-20 flex-shrink-0 bg-gray-900 rounded-md flex items-center justify-center border border-gray-700 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </td>
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
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
              <a :href="car.url" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 transition-colors">
                View
              </a>
              <button 
                @click="emit('remove', car.id)"
                class="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                title="Remove from listed results"
              >
                Remove
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.hover\:bg-gray-750:hover {
    background-color: rgba(55, 65, 81, 0.5);
}
</style>
