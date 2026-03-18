import React from "react";

const Forecast = ({ items }) => {
  if (!items || !items.length) return null;

  return (
    <section className="card forecast-card glass">
      <h2 className="section-title">5-day forecast</h2>
      <div className="forecast-row">
        {items.map((item) => {
          const date = new Date(item.dt * 1000);
          const dayName = date.toLocaleDateString(undefined, {
            weekday: "short",
          });
          const temp = Math.round(item.temp);
          const iconUrl = item.icon
            ? `https://openweathermap.org/img/wn/${item.icon}.png`
            : null;

          return (
            <div className="forecast-item" key={item.dt}>
              <span className="forecast-day">{dayName}</span>
              {iconUrl && (
                <img
                  src={iconUrl}
                  alt={item.main || "Weather"}
                  className="forecast-icon"
                />
              )}
              <span className="forecast-temp">{temp}°C</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Forecast;

