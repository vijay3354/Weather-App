const apiKey = '6abb975398125fee8071a0409efa9b3c';
const weatherDiv = document.getElementById("weather");
const forecastDiv = document.getElementById("forecast");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const recentCities = document.getElementById("recentCities");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
    saveRecentCity(city);
  } else {
    alert("Please enter a city name.");
  }
  cityInput.value = "";
});

locationBtn.addEventListener("click", () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(pos => {
      fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
    }, () => {
      alert("Unable to get location.");
    });
  }
});

recentCities.addEventListener("change", () => {
  const selected = recentCities.value;
  if (selected) fetchWeather(selected);
});

function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.cod === 200) {
        displayWeather(data);
        fetchForecast(city);
      } else {
        weatherDiv.innerHTML = `<p class="text-red-500">${data.message}</p>`;
        forecastDiv.innerHTML = `<p class="text-red-500">${data.message}</p>`;
      }
    });
}

function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.cod === 200) {
        displayWeather(data);
        fetchForecast(data.name);
        saveRecentCity(data.name);
      }
    });
}

function fetchForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      let html = '';
      for (let i = 0; i < data.list.length; i += 8) { 
        const d =data.list[i];    
        html += `
          <div class="bg-gray-200 p-4 rounded-lg shadow-md shadow-red-700 transition ease-in-out  hover:scale-105 ">
            <p class="font-bold">${new Date(d.dt_txt).toDateString()}</p>
            <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png" class="mx-auto">
            <p>${d.main.temp} °C</p>
            <p>Wind: ${d.wind.speed} m/s</p>
            <p>Humidity: ${d.main.humidity}%</p>
          </div>
        `;
      }
      forecastDiv.innerHTML = html;
    });
}

function displayWeather(data) {
  weatherDiv.innerHTML =  `
    <div class="text-center bg-green-100 mb-6 rounded-xl p-6 shadow-md shadow-red-700 transition ease-in-out  hover:scale-105">
    <h1 class="text-xl font-semibold">${data.name}</h1>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" class="mx-auto">
    <p class="text-lg">${data.weather[0].main} - ${data.weather[0].description}</p>
    <p>Temperature: ${data.main.temp} °C</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
    </div>
  `;
}

function saveRecentCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!cities.includes(city)) {
    cities.unshift(city);
    if (cities.length > 5) cities.pop();
    localStorage.setItem("recentCities", JSON.stringify(cities));
    renderRecentCities();
  }
}

function renderRecentCities() {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (cities.length) {
    recentCities.innerHTML = `<option value="">Select Recent City</option>` + cities.map(c => `<option value="${c}">${c}</option>`).join('');
    recentCities.classList.remove("hidden");
  } else {
    recentCities.classList.add("hidden");
  }
}

renderRecentCities();
