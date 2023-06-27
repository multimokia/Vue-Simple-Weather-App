<script lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { OWM_APIService } from './services/OpenWeatherMapAPI.service';
import { ref } from 'vue';
import { WeatherDataResponse } from './types/WeatherDataResponse';

import WeatherEmbed from './components/WeatherEmbed.vue';
import SearchBar from './components/SearchBar.vue';
import MobileWeatherEmbed from './components/MobileWeatherEmbed.vue';

let searchQuery = ref('');
let weatherData = ref<WeatherDataResponse>({} as WeatherDataResponse);

const isMobile = useMediaQuery('(max-width: 900px)');

export default {
    name: 'App',
    data() {
        return {
            searchQuery,
            weatherData,
            isMobile,
        };
    },
    setup() {
        OWM_APIService.getWeatherDataByCity('London').then((data) => {
            weatherData.value = data;
        });

        return {
            weatherData,
        };
    },
    methods: {
        async search() {
            weatherData.value = await OWM_APIService.getWeatherDataByCity(searchQuery.value);
        }
    },
    components: {
        WeatherEmbed,
        SearchBar,
        MobileWeatherEmbed,
    },
}
</script>

<template>
    <div class="flex flex-col items-center space-y-4 rounded-xl">
        <SearchBar
            :searchQuery="searchQuery"
            @update:searchQuery="searchQuery = $event"
            @submit="search"
            class="self-center animate-fade-down"
        />
        <WeatherEmbed
            v-if="!isMobile"
            :weatherData="weatherData"
            class="self-center animate-fade-up xl:w-[90vw]"
        />
        <MobileWeatherEmbed
            v-else
            :weatherData="weatherData"
            class="self-center animate-fade-up w-[90vw]"
        />
    </div>
</template>
