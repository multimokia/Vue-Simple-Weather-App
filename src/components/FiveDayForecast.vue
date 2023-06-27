<script lang="ts">
import { DateTime } from 'luxon';
import { FiveDayForecastData } from '../types/5DayForecastData';
import { OWM_APIService } from '../services/OpenWeatherMapAPI.service';

export default {
    props: {
        forecastData: {
            type: Object as () => FiveDayForecastData,
            required: true,
        }
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
    }
}
</script>
<template>
    <div
        v-for="[ weekday, prediction ] of processForecastToDaily(forecastData)"
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
</template>
