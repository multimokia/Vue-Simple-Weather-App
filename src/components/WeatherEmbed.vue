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
        },
        processLowerGradientBleed(
            gradient: CanvasGradient,
            normalizedHardstops: {
                value: number,
                color: string,
                normalizedValue: number
            }[],
            hardstops: {
                value: number,
                color: string
            }[],
            bleedingPercentage: number,
            hardstopIndex: number
        ) {
            if (hardstopIndex !== 0) {
                const lowBleed = normalizedHardstops[hardstopIndex - 1];

                // Now we need to check if the low bleed is within the bleeding range
                if (Math.abs(0 - lowBleed.normalizedValue) <= bleedingPercentage) {
                    gradient.addColorStop(
                        1,
                        lowBleed.color
                    );
                    gradient.addColorStop(
                        0.9,
                        hardstops[hardstopIndex].color
                    )
                }
            }
        },
        processHigherGradientBleed(
            gradient: CanvasGradient,
            normalizedHardstops: {
                value: number,
                color: string,
                normalizedValue: number
            }[],
            hardstops: {
                value: number,
                color: string
            }[],
            bleedingPercentage: number,
            hardstopIndex: number
        ) {
            if (hardstopIndex !== hardstops.length - 1) {
                const highBleed = normalizedHardstops[hardstopIndex + 1];

                // Now we need to check if the high bleed is within the bleeding range
                if (Math.abs(1 - highBleed.normalizedValue) <= bleedingPercentage) {
                    gradient.addColorStop(
                        0,
                        hardstops[hardstopIndex].color
                    )
                    gradient.addColorStop(
                        0.1,
                        highBleed.color
                    );
                }
            }
        },
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
                    height="4"
                    :data="{
                        labels: weatherData.forecast.list.slice(0, 7).map(
                            (forecastItem) => DateTime.fromSeconds(
                                forecastItem.dt,
                                {zone: 'utc' }
                            ).toLocal().toFormat('ccc, h a')
                        ),
                        datasets: [{
                            label: 'Temperature',
                            data: weatherData.forecast.list.slice(0, 7).map(
                                (forecastItem) => forecastItem.main?.temp
                            ),
                            fill: {
                                target: 'origin',
                                above: 'rgba(255, 0, 0, 0.5)',
                            },
                            borderColor: (line) => {
                                const canvas = line.chart.ctx;
                                const gradient = canvas.createLinearGradient(0,0,0,120);

                                // We need to use the min/max values of the chart to determine where the color stops should be
                                // Red should be anything above a value of 40
                                // Yellow should be anything between 30 and 40
                                // Green should be anything between 10 and 30
                                // Blue should be anything below 10
                                // Dark blue should be anything below 0

                                // We need to get the min and max values of the chart
                                const min = Math.min(...line.dataset.data as number[]);
                                const max = Math.max(...line.dataset.data as number[]);

                                // We now need to determine which of the hardstops are within our min/max range
                                const hardstops = [
                                    { value: 0, color: 'blue'},
                                    { value: 10, color: 'lightblue'},
                                    { value: 20, color: 'green'},
                                    { value: 30, color: 'yellow'},
                                    { value: 40, color: 'red'}
                                ];

                                // We now need to determine the percentage of the chart that each hardstop represents
                                const percentageOfChart = (value: number) => (value - min) / (max - min);

                                const normalizedHardstops = hardstops.map(
                                    (hardstop, index) => ({
                                        ...hardstop,
                                        normalizedValue: percentageOfChart(hardstop.value),
                                        index: index
                                    })
                                );

                                // First things first, we should check if any percentages will be within the values
                                const percentagesInRange = normalizedHardstops.filter(
                                    (hardstop) => {
                                        return hardstop.normalizedValue >= 0 && hardstop.normalizedValue <= 1;
                                    }
                                );

                                // Now that we know our current hardstop, let's see if we're close enough to another hardstop to need to bleed colors
                                // For now, let's take +/- 30% of 0 or 1 for the bleeding
                                const bleedingPercentage = 0.3;

                                if (percentagesInRange.length > 0) {
                                    percentagesInRange.forEach((hardstop) => {
                                        const prevPercentage = hardstop.normalizedValue;
                                        gradient.addColorStop(
                                            1 - prevPercentage,
                                            hardstop.color
                                        );

                                        if (hardstop.index !== normalizedHardstops.length - 1) {
                                            gradient.addColorStop(
                                                1 - prevPercentage - 0.2,
                                                normalizedHardstops[hardstop.index + 1].color
                                            );
                                        }
                                        // We also need to add the next color immediately after this, as
                                    });


                                    const lowestHardstopIndex = hardstops.findIndex((h) => h.value === percentagesInRange[0].value);
                                    const highestHardstopIndex = hardstops.findIndex((h) => h.value === percentagesInRange[percentagesInRange.length - 1].value);

                                    // First let's start with low bleed
                                    // Before that, we need to check if the current hardstop is the last one, if so, we can't bleed
                                    processLowerGradientBleed(
                                        gradient,
                                        normalizedHardstops,
                                        hardstops,
                                        bleedingPercentage,
                                        lowestHardstopIndex
                                    );

                                    // Now let's do high bleed
                                    // Before that, we need to check if the current hardstop is the last one, if so, we can't bleed
                                    processHigherGradientBleed(
                                        gradient,
                                        normalizedHardstops,
                                        hardstops,
                                        bleedingPercentage,
                                        highestHardstopIndex
                                    );
                                }

                                else {
                                    // If there are no percentages in range, this means we're perfectly between a range, so let's find the range we're between
                                    // Since the hardstop values are from anything below to the hardstop, we need to search for the hardstop that is above our max
                                    const hardstopAboveMaxIndex = hardstops.findIndex(
                                        (hardstop) => hardstop.value > max
                                    );

                                    // First let's start with low bleed
                                    // Before that, we need to check if the current hardstop is the last one, if so, we can't bleed
                                    processLowerGradientBleed(
                                        gradient,
                                        normalizedHardstops,
                                        hardstops,
                                        bleedingPercentage,
                                        hardstopAboveMaxIndex
                                    );

                                    // Now let's do high bleed
                                    // Before that, we need to check if the current hardstop is the last one, if so, we can't bleed
                                    processHigherGradientBleed(
                                        gradient,
                                        normalizedHardstops,
                                        hardstops,
                                        bleedingPercentage,
                                        hardstopAboveMaxIndex
                                    );

                                    // Now we just need to add the current hardstop itself
                                    gradient.addColorStop(
                                        0.5,
                                        hardstops[hardstopAboveMaxIndex].color
                                    )
                                }

                                return gradient;
                            },
                            tension: 0.3,
                        }],
                    }"
                    :options="{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                ticks: {
                                    color: 'rgba(255, 255, 255, 0.5)',
                                },
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)',
                                },
                            },
                            x: {
                                ticks: {
                                    color: 'rgba(255, 255, 255, 0.5)',
                                },
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)',
                                },
                            },
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
