<script setup lang="ts">
import { ref } from 'vue';

const brand = ref('');
const model = ref('');
const pages = ref(1);

const emits = defineEmits<{
  (e: 'submit', payload: { brand: string; model: string; pages: number }): void;
}>();

const onSubmit = () => {
  if (!brand.value || !model.value || pages.value < 1) return;
  emits('submit', { brand: brand.value, model: model.value, pages: pages.value });
};
</script>

<template>
  <form @submit.prevent="onSubmit" class="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 w-full max-w-lg mx-auto">
    <div class="mb-4">
      <label for="brand" class="block text-sm font-medium text-gray-300 mb-2">Car Brand</label>
      <input 
        id="brand" 
        v-model="brand" 
        type="text" 
        placeholder="e.g. audi" 
        class="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        required
      />
    </div>
    <div class="mb-6">
      <label for="model" class="block text-sm font-medium text-gray-300 mb-2">Car Model</label>
      <input 
        id="model" 
        v-model="model" 
        type="text" 
        placeholder="e.g. a3" 
        class="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        required
      />
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
      class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Search Otomoto
    </button>
  </form>
</template>
