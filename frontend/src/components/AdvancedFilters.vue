<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Car } from '../../../src/domain/car';

const props = defineProps<{
  results: Car[];
}>();

const emit = defineEmits<{
  (e: 'update:filters', filters: any): void;
}>();

const filters = ref({
  search: '',
  priceMin: null as number | null,
  priceMax: null as number | null,
  yearMin: null as number | null,
  yearMax: null as number | null,
  mileageMax: null as number | null,
  fuelType: [] as string[],
  gearbox: [] as string[],
  engineCapacityMin: null as number | null,
  engineCapacityMax: null as number | null,
  powerMin: null as number | null,
  powerMax: null as number | null,
  city: '',
  bodyStyle: [] as string[],
  color: [] as string[],
  condition: [] as string[],
});

watch(filters, (newVal) => {
  emit('update:filters', { ...newVal });
}, { deep: true });

const clearFilters = () => {
  filters.value = {
    search: '',
    priceMin: null,
    priceMax: null,
    yearMin: null,
    yearMax: null,
    mileageMax: null,
    fuelType: [],
    gearbox: [],
    engineCapacityMin: null,
    engineCapacityMax: null,
    powerMin: null,
    powerMax: null,
    city: '',
    bodyStyle: [],
    color: [],
    condition: [],
  };
};

const getUniqueOptions = (key: keyof Car) => {
  const options = new Set<string>();
  props.results.forEach(car => {
    const val = car[key];
    if (val && typeof val === 'string') options.add(val);
  });
  return Array.from(options).sort();
};

const fuelTypeOptions = computed(() => getUniqueOptions('fuelType'));
const gearboxOptions = computed(() => getUniqueOptions('gearbox'));
const bodyStyleOptions = computed(() => getUniqueOptions('bodyStyle'));
const colorOptions = computed(() => getUniqueOptions('color'));
const conditionOptions = computed(() => getUniqueOptions('condition'));

const isAdvancedOpen = ref(false);

const hasActiveFilters = computed(() => {
  return filters.value.search !== '' ||
    filters.value.priceMin !== null ||
    filters.value.priceMax !== null ||
    filters.value.yearMin !== null ||
    filters.value.yearMax !== null ||
    filters.value.mileageMax !== null ||
    filters.value.fuelType.length > 0 ||
    filters.value.gearbox.length > 0 ||
    filters.value.engineCapacityMin !== null ||
    filters.value.engineCapacityMax !== null ||
    filters.value.powerMin !== null ||
    filters.value.powerMax !== null ||
    filters.value.city !== '' ||
    filters.value.bodyStyle.length > 0 ||
    filters.value.color.length > 0 ||
    filters.value.condition.length > 0;
});
</script>

<template>
  <div class="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden mt-8 mb-8">
    <div class="p-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div class="flex-1 relative">
          <input 
            v-model="filters.search"
            type="text" 
            placeholder="Search by title, brand, model..." 
            class="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <div class="absolute left-3 top-3 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button 
            @click="isAdvancedOpen = !isAdvancedOpen"
            class="flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all"
            :class="isAdvancedOpen ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Advanced Filters
          </button>
          
          <button 
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div v-if="isAdvancedOpen" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-700">
          <!-- Price Range -->
          <div class="space-y-2">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Price Range (PLN)</label>
            <div class="flex items-center gap-2">
              <input v-model.number="filters.priceMin" type="number" placeholder="Min" class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <input v-model.number="filters.priceMax" type="number" placeholder="Max" class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>

          <!-- Year Range -->
          <div class="space-y-2">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Year Range</label>
            <div class="flex items-center gap-2">
              <input v-model.number="filters.yearMin" type="number" placeholder="From" class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <input v-model.number="filters.yearMax" type="number" placeholder="To" class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>

          <!-- Mileage Max -->
          <div class="space-y-2">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Max Mileage (km)</label>
            <input v-model.number="filters.mileageMax" type="number" placeholder="Max km" class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <!-- Fuel Type -->
          <div class="space-y-2">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fuel Type</label>
            <select v-model="filters.fuelType" multiple class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 h-24">
              <option v-for="opt in fuelTypeOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>

          <!-- Gearbox -->
          <div class="space-y-2">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gearbox</label>
            <select v-model="filters.gearbox" multiple class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 h-24">
              <option v-for="opt in gearboxOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>

          <!-- Body Style -->
          <div class="space-y-2">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Body Style</label>
            <select v-model="filters.bodyStyle" multiple class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 h-24">
              <option v-for="opt in bodyStyleOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>

          <!-- Engine Capacity -->
          <div class="space-y-2">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Engine Capacity (cm³)</label>
            <div class="flex items-center gap-2">
              <input v-model.number="filters.engineCapacityMin" type="number" placeholder="Min" class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <input v-model.number="filters.engineCapacityMax" type="number" placeholder="Max" class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>

          <!-- Power -->
          <div class="space-y-2">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Power (KM)</label>
            <div class="flex items-center gap-2">
              <input v-model.number="filters.powerMin" type="number" placeholder="Min" class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <input v-model.number="filters.powerMax" type="number" placeholder="Max" class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>

          <!-- City -->
          <div class="space-y-2">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">City</label>
            <input v-model="filters.city" type="text" placeholder="Search city..." class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <!-- Color -->
          <div class="space-y-2">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Color</label>
            <select v-model="filters.color" multiple class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 h-24">
              <option v-for="opt in colorOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>

          <!-- Condition -->
          <div class="space-y-2">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Condition</label>
            <select v-model="filters.condition" multiple class="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 h-24">
              <option v-for="opt in conditionOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>
