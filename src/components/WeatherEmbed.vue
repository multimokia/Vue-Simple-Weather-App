<script lang="ts">
import { OWM_APIService } from '../services/OpenWeatherMapAPI.service';
import { DateTime } from 'luxon';
import { WeatherDataResponse } from '../types/WeatherDataResponse';
import { FiveDayForecastData } from '../types/5DayForecastData';
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
        };
    },
    methods: {
        getIconUrl(icon: string, forceDay: boolean = false) {
            return OWM_APIService.getIconUrl(icon, forceDay);
        },
        processForecastToDaily(forecastData: FiveDayForecastData) {
            // We need to group the forecast data by day, so we can display the min and max temperatures for each day.
            // We should also display an icon for the weather for each day.
            const rvOrg = new Map<string, FiveDayForecastData['list']>();
            forecastData.list.map((data) => {
                const dayOfWeek = DateTime.fromSeconds(data.dt, { zone: 'utc' }).toFormat('cccc');

                if (!rvOrg.has(dayOfWeek)) {
                    rvOrg.set(dayOfWeek, []);
                }

                // Above enforces the creation of the list, so we can push to it
                rvOrg.get(dayOfWeek)!.push(data);
            });

            // Now with organized data, we need to get the min and max temperatures for each day, calculate averages, and determine the image
            const rv = new Map<string, { minTemp: number, maxTemp: number, avgTemp: number, icon: string }>();
            for (const [ k, v ] of rvOrg.entries()) {
                const minTemp = Math.min(...v.map((data) => data.main?.temp_min));
                const maxTemp = Math.max(...v.map((data) => data.main?.temp_max));
                const avgTemp = v.reduce((acc, data) => acc + data.main?.temp, 0) / v.length;
                const icon = v[0].weather?.[0].icon;

                rv.set(k, {
                    minTemp,
                    maxTemp,
                    avgTemp,
                    icon,
                });
            }

            return rv;
        }
    },
    components: {
        Line,
    },
}
</script>

<template>
    <div class="flex flex-row bg-zinc-800 rounded-xl bg-opacity-80 backdrop-blur-sm drop-shadow-lg transition-all max-h-[80vh]">
        <div class="flex flex-col flex-grow overflow-hidden">
            <div class="bg-zinc-900 rounded-tl-xl rounded-br-lg flex flex-col flex-grow p-10 bg-opacity-80 backdrop-blur-sm drop-shadow-lg">
                <div class="flex flex-row flex-grow">
                    <div class="flex flex-col flex-grow text-left pt-8">
                        <h1 class="font-bold">{{ weatherData.currentWeather.name }}, {{ weatherData.currentWeather.sys.country }}</h1>
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
                <div class="flex flex-row flex-grow">
                    <!-- Optional params (rain/wind speed/cloud cover) -->
                    <div class="flex flex-col text-zinc-400 text-left flex-grow">
                        <h2><em class="font-bold">Wind</em> {{ weatherData.currentWeather.wind?.speed }}m/s</h2>
                        <h2><em class="font-bold">Clouds</em> {{ weatherData.currentWeather.clouds?.all }}%</h2>
                    </div>
                    <div class="flex flex-col text-zinc-400 text-left">
                        <h2 v-if="weatherData.currentWeather.rain"><em class="font-bold">Rain</em> {{ weatherData.currentWeather.rain['1h'] }}mm</h2>
                        <h2 v-if="weatherData.currentWeather.snow"><em class="font-bold">Snow</em> {{ weatherData.currentWeather.snow['1h'] }}mm</h2>
                    </div>
                    <div class="flex flex-col text-zinc-400 text-left">
                        <h2><em class="font-bold">Pressure</em> {{ weatherData.currentWeather.main?.pressure }}hPa</h2>
                        <h2><em class="font-bold">Visibility</em> {{ weatherData.currentWeather.visibility }}m</h2>
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
            <div class="w-full max-h-full flex-grow p-4 h-1">
                <Line
                    width="4"
                    height="2"
                    :data="{
                        labels: weatherData.forecast.list.slice(0, 7).map(
                            (forecastItem) => DateTime.fromSeconds(
                                forecastItem.dt,
                                {zone: 'utc' }
                            ).toLocal().toFormat('ccc, h a')
                        ),
                        datasets: [
                            {
                                label: 'Temperature',
                                data: weatherData.forecast.list.slice(0, 7).map(
                                    (forecastItem) => forecastItem.main?.temp
                                ),
                                borderColor: '#16a34a',
                                tension: 0.3,
                            },
                        ],
                    }"
                    :options="{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        }
                    }"
                />
            </div>
        </div>
        <div class="p-2">
            <div class="flex flex-col space-y-2 overflow-y-scroll scrollbar-thin max-h-full p-2">
                <div
                    v-for="[ weekday, prediction ] of processForecastToDaily(weatherData.forecast)"
                    class="
                        p-2
                        bg-zinc-700
                        rounded-xl
                        bg-opacity-80
                        backdrop-blur-sm
                        h-full
                        flex-grow
                    "
                >
                    <div class="flex flex-col items-center">
                        <h1 class="text-center font-bold text-2xl">{{ weekday }}</h1>
                        <img
                            :src="getIconUrl(prediction.icon, true)"
                            class="max-w-1/2 self-center flex-grow drop-shadow-lg"
                        />
                        <h1 class="text-center font-bold text-2xl">{{ prediction.avgTemp.toFixed() }}°C</h1>
                        <div class="flex flex-row">
                            <h2 class="text-center text-zinc-400">{{ prediction.maxTemp.toFixed() }}°C | {{ prediction.minTemp.toFixed() }}°C</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
