export class OpenWeatherMapAPIService {
    private readonly API_KEY: string;

    constructor(api_key: string) {
        this.API_KEY = api_key;
    }

    async getLocationsOfCity(city: string) {
        const result = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${this.API_KEY}`);
        return await result.json();
    }

    async getWeatherData(lat: number, lon: number) {
        const result = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.API_KEY}`);
        return await result.json();
    }

    async get5DayForecast(lat: number, lon: number) {
        const result = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${this.API_KEY}`);
        return await result.json();
    }

    async getWeatherDataByCity(city: string) {
        const locations = await this.getLocationsOfCity(city);

        // We assume that the first location is the correct one
        const location = locations[0];

        if (!location) {
            throw new Error('City not found');
        }

        return {
            currentWeather: await this.getWeatherData(location.lat, location.lon),
            forecast: await this.get5DayForecast(location.lat, location.lon)
        };
    }

    async getWeatherDataByCoords(lat: number, lon: number) {
        return {
            currentWeather: await this.getWeatherData(lat, lon),
            forecast: await this.get5DayForecast(lat, lon)
        };
    }

    getIconUrl(icon: string, day: boolean = false) {
        return `https://openweathermap.org/img/wn/${day ? icon.replace('n', 'd') : icon}@4x.png`;
    }
}

export const OWM_APIService = new OpenWeatherMapAPIService(import.meta.env.VITE_OWM_API_KEY);
