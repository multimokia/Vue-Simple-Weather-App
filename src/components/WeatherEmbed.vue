<script lang="ts">
import { OWM_APIService } from '../services/OpenWeatherMapAPI.service';
import { DateTime } from 'luxon';
import { WeatherDataResponse } from '../types/WeatherDataResponse';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default {
    name: 'WeatherEmbed',
    props: {
        weatherData: {
            type: Object as () => WeatherDataResponse,
            required: true,
        }
    },
    data() {
        return {
            DateTime,
            OWM_APIService,
            data: {
                labels: this.weatherData.forecast.list.map(
                    (forecastItem) => DateTime.fromSeconds(forecastItem.dt, {zone: 'utc' }).toLocal().toFormat("ccc, h a")
                ),
                datasets: [
                    {
                        label: 'Temperature',
                        data: this.weatherData.forecast.list.map((forecastItem) => forecastItem.main?.temp.toFixed()),
                        borderColor: "#16a34a",
                        tension: 0.3,
                    },
                ],
            },
        };
    },
    components: {
        Line,
    },
}
</script>

<template>
    <div class="w-3/4 bg-zinc-800 rounded-xl flex flex-col bg-opacity-80 backdrop-blur-sm drop-shadow-lg">
        <div class="bg-zinc-900 rounded-xl flex flex-col p-10 bg-opacity-80 backdrop-blur-sm">
            <div class="flex flex-row">
                <div class="flex flex-col flex-grow text-left">
                    <h1 class="font-bold">{{ weatherData.currentWeather.name }}, {{ weatherData.currentWeather.sys.country }}</h1>
                    <h1 class="text-4xl font-bold">{{ weatherData.currentWeather.main?.temp.toFixed() }}°C</h1>
                    <h2 class="text-3xl text-zinc-400">{{ weatherData.currentWeather.weather?.[0].description }}</h2>
                </div>
                <div class="flex flex-col items-center">
                    <img
                        :src="OWM_APIService.getIconUrl(weatherData.currentWeather.weather?.[0].icon)"
                        :alt="weatherData.currentWeather.weather?.[0].description"
                        class="w-full self-center"
                    />
                </div>
            </div>
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
        </div>
        <div class="flex flex-row overflow-x-scroll space-x-2 m-10 scrollbar-thin">
            <!-- <div v-for="forecastItem in weatherData.forecast.list" class="p-2 min-w-max">
                <div class="flex flex-col items-center w-full">
                    <h2 class="text-zinc-400" v-html="DateTime.fromSeconds(forecastItem.dt, {zone: 'utc' }).toLocal().toFormat(`ccc<br/>h a`)"></h2>
                    <img
                        :src="OWM_APIService.getIconUrl(forecastItem.weather?.[0].icon)"
                        :alt="forecastItem.weather?.[0].description"
                        class="w-10 self-center"
                    />
                    <h2 class="text-zinc-400">{{ forecastItem.main?.temp.toFixed() }}°C</h2>
                </div>
            </div> -->
            <div class="w-full">
                <Line :data="data" :options="{responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }}}" />
            </div>
        </div>
    </div>
</template>
