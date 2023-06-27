<script lang="ts">
import { OWM_APIService } from '../services/OpenWeatherMapAPI.service';
import { WeatherDataResponse } from '../types/WeatherDataResponse';

export default {
    name: 'SimpleCurrentWeatherInfo',
    props: {
        weatherData: {
            type: Object as () => WeatherDataResponse,
            required: true,
        }
    },
    methods: {
        getIconUrl(icon: string, forceDay: boolean = false) {
            return OWM_APIService.getIconUrl(icon, forceDay);
        },
    },
}
</script>
<template>
    <div class="flex flex-row flex-grow">
        <div class="flex flex-col flex-grow text-left pt-8">
            <h1 class="font-bold text-2xl lg:text-6xl">{{ weatherData.currentWeather.name }}, {{ weatherData.currentWeather.sys.country }}</h1>
            <h1 class="text-4xl font-bold">{{ weatherData.currentWeather.main?.temp.toFixed() }}°C</h1>
            <h2 class="text-3xl text-zinc-400">{{ weatherData.currentWeather.weather?.[0].description }}</h2>
        </div>
        <div class="flex flex-col items-center">
            <img
                :src="getIconUrl(weatherData.currentWeather.weather?.[0].icon)"
                :alt="weatherData.currentWeather.weather?.[0].description"
                class="w-full self-center"
            />
        </div>
    </div>
</template>
