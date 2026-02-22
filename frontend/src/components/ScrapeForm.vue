<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const brand = ref('');
const model = ref('');
const pages = ref(1);
const yearFrom = ref<number | null>(null);
const yearTo = ref<number | null>(null);

const brands = ref<{ id: string; label: string }[]>([]);
const models = ref<{ id: string; label: string }[]>([]);
const isLoadingBrands = ref(false);
const isLoadingModels = ref(false);
const showBrandDropdown = ref(false);
const showModelDropdown = ref(false);

const emits = defineEmits<{
  (e: 'submit', payload: { brand: string; model: string; pages: number; yearFrom?: number; yearTo?: number }): void;
}>();

const fetchBrands = async () => {
  if (brands.value.length > 0) return;
  isLoadingBrands.value = true;
  try {
    const response = await fetch('http://localhost:3000/api/otomoto/brands');
    if (response.ok) {
      brands.value = await response.json();
    }
  } catch (e) {
    console.error('Failed to fetch brands', e);
  } finally {
    isLoadingBrands.value = false;
  }
};

const fetchModels = async () => {
  if (!brand.value) return;
  isLoadingModels.value = true;
  models.value = [];
  try {
    const response = await fetch(`http://localhost:3000/api/otomoto/models?brand=${brand.value}`);
    if (response.ok) {
      models.value = await response.json();
    }
  } catch (e) {
    console.error('Failed to fetch models', e);
  } finally {
    isLoadingModels.value = false;
  }
};

watch(brand, () => {
  model.value = '';
  fetchModels();
});

const selectBrand = (b: { id: string; label: string }) => {
  brand.value = b.id;
  showBrandDropdown.value = false;
};

const selectModel = (m: { id: string; label: string }) => {
  model.value = m.id;
  showModelDropdown.value = false;
};

const onSubmit = () => {
  if (!brand.value || !model.value || pages.value < 1) return;
  emits('submit', { 
    brand: brand.value, 
    model: model.value, 
    pages: pages.value,
    yearFrom: yearFrom.value || undefined,
    yearTo: yearTo.value || undefined
  });
};

onMounted(() => {
  fetchBrands();
});
</script>

<template>
  <form @submit.prevent="onSubmit" class="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 w-full max-w-lg mx-auto relative">
    <!-- Brand Input -->
    <div class="mb-4 relative">
      <label for="brand" class="block text-sm font-medium text-gray-300 mb-2">Car Brand</label>
      <div class="relative">
        <input 
          id="brand" 
          :value="brands.find(b => b.id === brand)?.label || brand" 
          type="text" 
          placeholder="Select brand..." 
          class="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          readonly
          @click="showBrandDropdown = !showBrandDropdown; showModelDropdown = false"
        />
        <div class="absolute right-3 top-2.5 text-gray-500 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      <!-- Brand Dropdown -->
      <div v-if="showBrandDropdown" class="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
        <div v-if="isLoadingBrands" class="p-4 text-center text-gray-400">
          <div class="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent text-blue-500 rounded-full mr-2"></div>
          Loading brands...
        </div>
        <div v-else-if="brands.length === 0" class="p-4 text-center text-gray-500">No brands found</div>
        <div 
          v-for="b in brands" 
          :key="b.id" 
          @click="selectBrand(b)"
          class="px-4 py-2 hover:bg-blue-600 cursor-pointer text-gray-200 transition-colors border-b border-gray-800 last:border-0"
        >
          {{ b.label }}
        </div>
      </div>
    </div>

    <!-- Model Input -->
    <div class="mb-6 relative">
      <label for="model" class="block text-sm font-medium text-gray-300 mb-2">Car Model</label>
      <div class="relative">
        <input 
          id="model" 
          :value="models.find(m => m.id === model)?.label || model" 
          type="text" 
          placeholder="Select model..." 
          class="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!brand"
          readonly
          @click="brand && (showModelDropdown = !showModelDropdown); showBrandDropdown = false"
        />
        <div class="absolute right-3 top-2.5 text-gray-500 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <!-- Model Dropdown -->
      <div v-if="showModelDropdown" class="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
        <div v-if="isLoadingModels" class="p-4 text-center text-gray-400">
          <div class="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent text-blue-500 rounded-full mr-2"></div>
          Loading models...
        </div>
        <div v-else-if="models.length === 0" class="p-4 text-center text-gray-500">No models found</div>
        <div 
          v-for="m in models" 
          :key="m.id" 
          @click="selectModel(m)"
          class="px-4 py-2 hover:bg-blue-600 cursor-pointer text-gray-200 transition-colors border-b border-gray-800 last:border-0"
        >
          {{ m.label }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div>
        <label for="yearFrom" class="block text-sm font-medium text-gray-300 mb-2">Year From</label>
        <input 
          id="yearFrom" 
          v-model="yearFrom" 
          type="number" 
          placeholder="e.g. 2010"
          class="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
      <div>
        <label for="yearTo" class="block text-sm font-medium text-gray-300 mb-2">Year To</label>
        <input 
          id="yearTo" 
          v-model="yearTo" 
          type="number" 
          placeholder="e.g. 2020"
          class="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
    </div>

    <div class="mb-6">
      <label for="pages" class="block text-sm font-medium text-gray-300 mb-2">Number of Pages to Scrape</label>
      <input 
        id="pages" 
        v-model="pages" 
        type="number" 
        min="1"
        class="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        required
      />
    </div>

    <button 
      type="submit" 
      :disabled="!brand || !model"
      class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Search Otomoto
    </button>
  </form>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 10px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}
</style>
