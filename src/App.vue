<script lang="ts">
    import { OWM_APIService } from './services/OpenWeatherMapAPI.service';
    import { WeatherData } from './types/WeatherData';
    import { ref } from 'vue';
    import WeatherEmbed from './components/WeatherEmbed.vue';
    import SearchBar from './components/SearchBar.vue';

    let searchQuery = ref('');
    let weatherData = ref<WeatherData>({} as WeatherData);

    export default {
        name: 'App',
        data() {
            return {
                searchQuery,
                weatherData,
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
        },
    }
</script>

<template>
    <div class="flex flex-col items-center space-y-4 w-[70vw] py-32 rounded-xl">
        <SearchBar
            :searchQuery="searchQuery"
            @update:searchQuery="searchQuery = $event"
            @submit="search"
            class="self-center animate-fade-down"
        />
        <WeatherEmbed
            v-if="weatherData.name"
            :weatherData="weatherData"
            class="self-center animate-fade-up"
        />
    </div>
</template>
