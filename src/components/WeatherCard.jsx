import React from "react";

const WeatherCard = ({ weather }) => {
  if (!weather) return null;

  const temperature = Math.round(weather.main?.temp);
  const feelsLike = Math.round(weather.main?.feels_like);
  const condition = weather.weather?.[0]?.description;
  const icon = weather.weather?.[0]?.icon;

  const iconUrl = icon
    ? `https://openweathermap.org/img/wn/${icon}@2x.png`
    : null;

  return (
    <article className="card weather-card glass">
      <div className="card-header">
        <div>
          <h1 className="city-name">
            {weather.name}
            {weather.sys?.country ? (
              <span className="country-code">{weather.sys.country}</span>
            ) : null}
          </h1>
          <p className="condition-text">{condition}</p>
        </div>
        {iconUrl && (
          <img
            src={iconUrl}
            alt={condition || "Weather icon"}
            className="weather-icon"
          />
        )}
      </div>

      <div className="temperature-row">
        <span className="temperature-main">{temperature}°C</span>
        <span className="temperature-feels">
          Feels like {feelsLike}°C
        </span>
      </div>
    </article>
  );
};

export default WeatherCard;

