const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const weatherCard = document.getElementById("weatherCard");
const loading = document.getElementById("loading");
const message = document.getElementById("message");

const weatherCodes = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Depositing rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Moderate drizzle", "🌦️"],
  55: ["Dense drizzle", "🌧️"],
  61: ["Slight rain", "🌦️"],
  63: ["Moderate rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  71: ["Slight snow", "🌨️"],
  73: ["Moderate snow", "🌨️"],
  75: ["Heavy snow", "❄️"],
  80: ["Slight rain showers", "🌦️"],
  81: ["Moderate rain showers", "🌧️"],
  82: ["Violent rain showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️"],
  99: ["Thunderstorm with heavy hail", "⛈️"]
};

function showError(text) {
  message.textContent = text;
  message.classList.remove("hidden");
  weatherCard.classList.add("hidden");
}

function setLoading(isLoading) {
  loading.classList.toggle("hidden", !isLoading);
  if (isLoading) message.classList.add("hidden");
}

async function getWeather(city) {
  setLoading(true);

  try {
    const geoUrl =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) throw new Error("Unable to connect to the location service.");

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Please check the spelling and try again.");
    }

    const place = geoData.results[0];

    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code` +
      `&timezone=auto`;

    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) throw new Error("Unable to fetch weather data.");

    const weatherData = await weatherResponse.json();
    displayWeather(place, weatherData.current);
  } catch (error) {
    showError(error.message || "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
}

function displayWeather(place, current) {
  const [condition, icon] = weatherCodes[current.weather_code] || ["Unknown", "🌡️"];

  document.getElementById("cityName").textContent = place.name;
  document.getElementById("countryName").textContent =
    `${place.country || ""}${place.admin1 ? " • " + place.admin1 : ""}`;
  document.getElementById("weatherIcon").textContent = icon;
  document.getElementById("temperature").textContent = Math.round(current.temperature_2m);
  document.getElementById("tempDetail").textContent = `${Math.round(current.temperature_2m)}°C`;
  document.getElementById("feelsLike").textContent = Math.round(current.apparent_temperature);
  document.getElementById("condition").textContent = condition;
  document.getElementById("humidity").textContent = `${current.relative_humidity_2m}%`;
  document.getElementById("wind").textContent = `${Math.round(current.wind_speed_10m)} km/h`;

  const updatedTime = new Date(current.time);
  document.getElementById("updated").textContent =
    updatedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  message.classList.add("hidden");
  weatherCard.classList.remove("hidden");
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    showError("Please enter a city name.");
    cityInput.focus();
    return;
  }

  if (city.length < 2) {
    showError("Please enter at least 2 characters.");
    cityInput.focus();
    return;
  }

  getWeather(city);
});

getWeather("Karachi");
