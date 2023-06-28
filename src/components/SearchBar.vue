<script lang="ts">
import { ref } from 'vue';
import { OWM_APIService } from '../services/OpenWeatherMapAPI.service';
import { WeatherDataResponse } from '../types/WeatherDataResponse';

let searchQuery = ref('');
let searchError: Error | null = null;

export default {
    name: 'SearchBar',
    props: {
        weatherData: {
            type: Object as () => WeatherDataResponse,
            required: true,
        }
    },
    data() {
        return {
            searchQuery,
            searchError,
        };
    },
    methods: {
        updateSearchQuery(event: Event) {
            this.$emit("update:weatherData", (event.target as HTMLInputElement).value);
        },
        search() {
            OWM_APIService.getWeatherDataByCity(searchQuery.value).then((data) => {
                this.$emit("update:weatherData", data);
                this.searchError = null;
            })
            .catch((error: Error) => {
                this.searchError = error;
            });
        }
    }
}
</script>
<template>
    <div class="w-3/4 flex flex-col items-center">
        <form class="flex flex-row w-full " v-on:submit.prevent="search">
            <input
                type="text"
                placeholder="Search..."
                :class="`
                    flex-grow
                    p-2
                    text-lg
                    text-left
                    rounded-l-lg
                    focus:bg-zinc-700
                    transition-colors
                    ${searchError ? 'text-red-500 bg-red-200' : 'text-white bg-zinc-600'}
                `"
                v-model="searchQuery"
            />
            <button
                type="submit"
                class="p-2 text-lg text-white bg-green-600 rounded-r-lg rounded-l-none"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 drop-shadow-md">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
            </button>
        </form>
        <p v-if="searchError" class="text-red-500 italic transition-all bg-zinc-700 rounded-xl w-fit text-center p-2 mt-2">{{ searchError.message }}</p>
    </div>
</template>
