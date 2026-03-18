import React, { useEffect, useMemo, useState } from "react";
import Forecast from "./Forecast";
import SearchBar from "./SearchBar";
import WeatherCard from "./WeatherCard";
import WeatherDetails from "./WeatherDetails";

const API = {
  key: "2f8f346b527f5bd1a72c2d422018f00e", // for production, move to environment variables
  base: "https://api.openweathermap.org/data/2.5/",
  geo: "https://api.openweathermap.org/geo/1.0/direct",
};

const getBackgroundClass = (condition) => {
  if (!condition) return "bg-default";
  const main = condition.toLowerCase();
  if (main.includes("clear")) return "bg-clear";
  if (main.includes("rain") || main.includes("drizzle") || main.includes("thunder"))
    return "bg-rain";
  if (main.includes("snow")) return "bg-snow";
  if (main.includes("cloud")) return "bg-clouds";
  return "bg-default";
};

const normalizeForecast = (list = []) => {
  const byDay = {};

  list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const hour = date.getHours();
    const existing = byDay[dayKey];

    if (!existing || Math.abs(hour - 12) < Math.abs(existing.hour - 12)) {
      byDay[dayKey] = { ...item, hour };
    }
  });

  return Object.values(byDay)
    .slice(0, 5)
    .map((item) => ({
      dt: item.dt,
      temp: item.main?.temp,
      icon: item.weather?.[0]?.icon,
      main: item.weather?.[0]?.main,
    }));
};

const WeatherApp = () => {
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const backgroundClass = useMemo(
    () => getBackgroundClass(current?.weather?.[0]?.main),
    [current]
  );

  const fetchByCoords = async (lat, lon) => {
    setError("");
    setLoading(true);
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(
          `${API.base}weather?lat=${lat}&lon=${lon}&units=metric&appid=${API.key}`
        ),
        fetch(
          `${API.base}forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API.key}`
        ),
      ]);

      if (!weatherRes.ok || !forecastRes.ok) {
        throw new Error("Unable to fetch weather data.");
      }

      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();

      setCurrent(weatherData);
      setForecast(normalizeForecast(forecastData.list));
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching weather data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchByCity = async (city) => {
    if (!city) return;
    setError("");
    setLoading(true);
    try {
      const geoRes = await fetch(
        `${API.geo}?q=${encodeURIComponent(city)}&limit=1&appid=${API.key}`
      );
      if (!geoRes.ok) {
        throw new Error("City lookup failed.");
      }
      const geoData = await geoRes.json();
      if (!geoData.length) {
        setError("City not found. Please try another search.");
        setLoading(false);
        return;
      }
      const { lat, lon } = geoData[0];
      await fetchByCoords(lat, lon);
    } catch (err) {
      console.error(err);
      setError("City not found. Please try another search.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchByCoords(latitude, longitude);
      },
      () => {
        fetchByCity("Tashkent");
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = () => {
    if (!query.trim()) return;
    fetchByCity(query.trim());
  };

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <div
      className={`weather-app ${
        darkMode ? "theme-dark" : "theme-light"
      } ${backgroundClass}`}
    >
      <div className="weather-shell">
        <header className="weather-header">
          <div className="brand">
            <div className="brand-mark" />
            <div className="brand-text">
              <span className="brand-name">SkyCast</span>
              <span className="brand-tagline">Premium Weather Insights</span>
            </div>
          </div>

          <div className="header-actions">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={handleSearchSubmit}
              loading={loading}
            />

            <button
              className="theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark and light mode"
            >
              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>
              <span className="toggle-label">
                {darkMode ? "Dark" : "Light"}
              </span>
            </button>
          </div>
        </header>

        <main className="weather-main">
          {error && <div className="error-banner">{error}</div>}

          {loading && (
            <div className="loading-overlay">
              <div className="spinner" />
              <p>Fetching the latest weather...</p>
            </div>
          )}

          {!current && !loading && !error && (
            <div className="empty-state">
              <h2>Search any city worldwide</h2>
              <p>Or allow location access to see the weather where you are.</p>
            </div>
          )}

          {current && (
            <section className="layout-grid">
              <div className="layout-main-card">
                <WeatherCard weather={current} />
                <WeatherDetails weather={current} />
              </div>
              <aside className="layout-forecast">
                <Forecast items={forecast} />
              </aside>
            </section>
          )}
        </main>

        <footer className="weather-footer">
          <span>Powered by OpenWeather</span>
        </footer>
      </div>
    </div>
  );
};

export default WeatherApp;

