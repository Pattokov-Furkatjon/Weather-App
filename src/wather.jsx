import React, { useState, useEffect } from "react";
import "./App.css";

const api = {
  key: "2f8f346b527f5bd1a72c2d422018f00e",
  base: "https://api.openweathermap.org/data/2.5/",
  geo: "https://api.openweathermap.org/geo/1.0/direct",
};

function Weather() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [bg, setBg] = useState("cold");
  const [language, setLanguage] = useState("uz");
  const [darkMode, setDarkMode] = useState(false);

  // 🔍 GeoCoding orqali joylashuvni olish
  const getCoordinates = async (city) => {
    const res = await fetch(`${api.geo}?q=${city}&limit=1&appid=${api.key}`);
    const data = await res.json();
    if (!data.length) throw new Error("Joy topilmadi");
    return { lat: data[0].lat, lon: data[0].lon, name: data[0].name, country: data[0].country };
  };

  // 🔄 Koordinata orqali ob-havo va prognoz
  const getWeatherByCoords = async (lat, lon, name, country) => {
    const res = await fetch(`${api.base}weather?lat=${lat}&lon=${lon}&units=metric&appid=${api.key}&lang=${language}`);
    const data = await res.json();
    const forecastRes = await fetch(`${api.base}forecast?lat=${lat}&lon=${lon}&units=metric&cnt=5&appid=${api.key}&lang=${language}`);
    const forecastData = await forecastRes.json();
    setWeather({ ...data, name, sys: { ...data.sys, country } });
    setForecast(forecastData.list || []);
  };

  // 🔍 Asosiy qidiruv
  const search = async (q) => {
    try {
      const { lat, lon, name, country } = await getCoordinates(q);
      await getWeatherByCoords(lat, lon, name, country);
      setRecentSearches((prev) => {
        const updated = [q, ...prev.filter((item) => item !== q)];
        return updated.slice(0, 5);
      });
    } catch (err) {
      console.error("Xatolik:", err.message);
      alert("Shahar yoki joy topilmadi!");
    }
  };

  // 📍 Geo-location (brauzer orqali)
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      try {
        const res = await fetch(`${api.base}weather?lat=${lat}&lon=${lon}&units=metric&appid=${api.key}&lang=${language}`);
        const data = await res.json();
        const forecastRes = await fetch(`${api.base}forecast?lat=${lat}&lon=${lon}&units=metric&cnt=5&appid=${api.key}&lang=${language}`);
        const forecastData = await forecastRes.json();
        setWeather(data);
        setForecast(forecastData.list || []);
      } catch (err) {
        console.error("Geo-location xatosi:", err);
      }
    });
  }, []);

  // 🌡 Fonga qarab rang o‘zgartirish
  useEffect(() => {
    if (!weather || !weather.main) return;
    const temp = weather.main.temp;
    if (temp > 30) setBg("hot");
    else if (temp > 15) setBg("warm");
    else setBg("cold");
  }, [weather]);

  // 🔄 Auto-refresh (har 1 daqiqada)
  useEffect(() => {
    const interval = setInterval(() => {
      if (weather?.name) {
        search(weather.name);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [weather]);

  const handleSearch = () => {
    if (query.trim()) {
      search(query);
      setQuery("");
    }
  };

  const translate = (uz, ru, en) => {
    if (language === "uz") return uz;
    if (language === "ru") return ru;
    return en;
  };

  return (
    <div className={`app ${bg} ${darkMode ? "dark" : ""}`}>
      <div className="controls">
        <input
          type="text"
          placeholder={translate("Shahar nomini kiriting...", "Введите город...", "Enter city...")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch}>{translate("Qidirish", "Поиск", "Search")}</button>

        <select onChange={(e) => setLanguage(e.target.value)} value={language}>
          <option value="uz">UZ 🇺🇿</option>
          <option value="ru">RU 🇷🇺</option>
          <option value="en">EN 🇬🇧</option>
        </select>

        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌞 Light" : "🌙 Dark"}
        </button>
      </div>

      {weather && weather.main && (
        <div className="weather-box">
          <h2>{weather.name}, {weather.sys.country}</h2>
          <p>{translate("Harorat", "Температура", "Temperature")}: {Math.round(weather.main.temp)}°C</p>
          <p>
            {translate("Holat", "Погода", "Condition")}: {weather.weather[0].description}
            {" "}
            {weather.weather[0].main === "Clear" && "☀️"}
            {weather.weather[0].main === "Rain" && "🌧️"}
            {weather.weather[0].main === "Clouds" && "☁️"}
            {weather.weather[0].main === "Snow" && "❄️"}
          </p>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="forecast">
          <h3>{translate("5 kunlik prognoz", "5-дневный прогноз", "5-day forecast")}</h3>
          <ul>
            {forecast.map((item, idx) => (
              <li key={idx}>
                <span>{new Date(item.dt_txt).toLocaleDateString()}</span> - {Math.round(item.main.temp)}°C - {item.weather[0].main}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recentSearches.length > 0 && (
        <div className="recent-searches">
          <h3>{translate("🕘 So‘nggi qidiruvlar", "Последние запросы", "Recent Searches")}</h3>
          <ul>
            {recentSearches.map((city, idx) => (
              <li key={idx} onClick={() => search(city)}>{city}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Weather;
