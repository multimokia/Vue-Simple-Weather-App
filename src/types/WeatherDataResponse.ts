import { FiveDayForecastData } from "./5DayForecastData";
import { WeatherData } from "./WeatherData";

export type WeatherDataResponse = {
    currentWeather: WeatherData,
    forecast: FiveDayForecastData
};
