<script lang="ts">
import { WeatherData } from '../types/WeatherData';
import { OWM_APIService } from '../services/OpenWeatherMapAPI.service';
import { DateTime } from 'luxon';

export default {
    name: 'WeatherEmbed',
    props: {
        weatherData: {
            type: Object as () => WeatherData,
            required: true,
        }
    },
    data() {
        return {
            DateTime,
            OWM_APIService,
        };
    },
}
</script>

<template>
    <div class="w-3/4 bg-zinc-800 rounded-xl flex flex-col p-10">
        <div class="flex flex-row">
            <div class="flex flex-col flex-grow text-left">
                <h1 class="font-bold">{{ weatherData.name }}, {{ weatherData.sys.country }}</h1>
                <h1 class="text-4xl font-bold">{{ weatherData.main?.temp.toFixed() }}°C</h1>
                <h2 class="text-3xl text-zinc-400">{{ weatherData.weather?.[0].description }}</h2>
            </div>
            <div class="flex flex-col items-center">
                <img
                    :src="OWM_APIService.getIconUrl(weatherData.weather?.[0].icon)"
                    :alt="weatherData.weather?.[0].description"
                    class="w-full self-center"
                />
            </div>
        </div>
        <div class="flex flex-row justify-between text-zinc-400 text-left">
            <div class="flex flex-col">
                <h2><em class="font-bold">Feels like</em> {{ weatherData.main?.feels_like.toFixed() }}°C</h2>
                <h2><em class="font-bold">Humidity</em> {{ weatherData.main?.humidity }}%</h2>
            </div>
            <div class="flex flex-col">
                <h2><em class="font-bold">Min</em> {{ weatherData.main?.temp_min.toFixed() }}°C</h2>
                <h2><em class="font-bold">Max</em> {{ weatherData.main?.temp_max.toFixed() }}°C</h2>
            </div>
            <div class="text-left">
                <h2><em class="font-bold">Sunrise</em> {{ DateTime.fromSeconds(weatherData.sys.sunrise, {zone: 'utc' }).toLocal().toFormat("hh:mm ZZZZ") }}</h2>
                <h2><em class="font-bold">Sunset</em> {{ DateTime.fromSeconds(weatherData.sys.sunset, {zone: 'utc' }).toLocal().toFormat("hh:mm ZZZZ") }}</h2>
            </div>
        </div>
    </div>
</template>
