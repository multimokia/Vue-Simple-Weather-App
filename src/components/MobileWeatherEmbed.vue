<script lang="ts">
import { WeatherDataResponse } from '../types/WeatherDataResponse';
import { DateTime } from 'luxon';

import TemperatureGraph from './TemperatureGraph.vue';
import SimpleCurrentWeatherInfo from './SimpleCurrentWeatherInfo.vue';
import FiveDayForecast from './FiveDayForecast.vue';

export default {
    name: "MobileWeatherEmbed",
    props: {
        weatherData: {
            type: Object as () => WeatherDataResponse,
            required: true,
        }
    },
    data() {
        return {
            DateTime,
        };
    },
    components: {
        TemperatureGraph,
        SimpleCurrentWeatherInfo,
        FiveDayForecast,
    }
}
</script>

<template>
    <div class="flex flex-col bg-zinc-800 rounded-xl bg-opacity-80 backdrop-blur-sm drop-shadow-lg transition-all">
        <div class="flex flex-col flex-grow overflow-scroll">
            <div class="bg-zinc-900 rounded-xl flex flex-col flex-grow p-10 bg-opacity-80 backdrop-blur-sm drop-shadow-lg">
                <SimpleCurrentWeatherInfo
                    :weatherData="weatherData"
                    class="flex-grow"
                />
                <div class="flex flex-row justify-between text-zinc-400 text-left">
                    <div class="flex flex-col">
                        <h2><em class="font-bold">Feels like</em> {{ weatherData.currentWeather.main?.feels_like.toFixed() }}°C</h2>
                        <h2><em class="font-bold">Humidity</em> {{ weatherData.currentWeather.main?.humidity }}%</h2>
                    </div>
                    <div class="flex flex-col">
                        <h2><em class="font-bold">Min</em> {{ weatherData.currentWeather.main?.temp_min.toFixed() }}°C</h2>
                        <h2><em class="font-bold">Max</em> {{ weatherData.currentWeather.main?.temp_max.toFixed() }}°C</h2>
                    </div>
                    <div class="text-right">
                        <h2>
                            <em class="font-bold">Sunrise</em>
                            {{ DateTime.fromSeconds(weatherData.currentWeather.sys.sunrise, {zone: 'utc' }).toLocal().toFormat("hh:mm a ZZZZ") }}
                        </h2>
                        <h2>
                            <em class="font-bold">Sunset</em>
                            {{ DateTime.fromSeconds(weatherData.currentWeather.sys.sunset, {zone: 'utc' }).toLocal().toFormat("hh:mm a ZZZZ") }}
                        </h2>
                    </div>
                </div>
                <div class="flex flex-col flex-grow text-zinc-400 text-left">
                    <!-- Optional params (rain/wind speed/cloud cover) -->
                    <div class="flex flex-col text-zinc-400 text-left flex-grow">
                        <h2><em class="font-bold">Wind</em> {{ weatherData.currentWeather.wind?.speed }}m/s</h2>
                        <h2><em class="font-bold">Clouds</em> {{ weatherData.currentWeather.clouds?.all }}%</h2>
                    </div>
                    <div class="flex flex-col text-zinc-400 text-left">
                        <h2 v-if="weatherData.currentWeather.rain"><em class="font-bold">Rain</em> {{ weatherData.currentWeather.rain['1h'] }}mm</h2>
                        <h2 v-if="weatherData.currentWeather.snow"><em class="font-bold">Snow</em> {{ weatherData.currentWeather.snow['1h'] }}mm</h2>
                    </div>
                </div>
            </div>
        </div>
        <div class="p-2">
            <div class="flex flex-row space-x-2 overflow-x-scroll scrollbar-thin max-w-full p-2">
                <FiveDayForecast
                    :forecastData="weatherData.forecast"
                />
            </div>
        </div>
    </div>
</template>
