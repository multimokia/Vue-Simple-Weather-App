<script lang="ts">
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
import { WeatherDataResponse } from '../types/WeatherDataResponse';
import { DateTime } from 'luxon';

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
    name: 'TemperatureGraph',
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
    methods: {
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
                                // We need to check how far we can bleed as to not go over 1
                                let bleedAmt = 0.2;

                                if (1 - prevPercentage - bleedAmt < 0) {
                                    bleedAmt = 1 - prevPercentage;
                                }

                                gradient.addColorStop(
                                    1 - prevPercentage - bleedAmt,
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
</template>
