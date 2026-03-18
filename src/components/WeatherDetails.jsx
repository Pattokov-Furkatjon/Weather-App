import React from "react";

const WeatherDetails = ({ weather }) => {
  if (!weather) return null;

  const humidity = weather.main?.humidity;
  const windSpeed = weather.wind?.speed;
  const pressure = weather.main?.pressure;
  const visibility = weather.visibility;

  return (
    <section className="card details-card glass">
      <h2 className="section-title">Today&apos;s details</h2>
      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">Humidity</span>
          <span className="detail-value">
            {humidity != null ? `${humidity}%` : "-"}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Wind</span>
          <span className="detail-value">
            {windSpeed != null ? `${Math.round(windSpeed)} m/s` : "-"}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Pressure</span>
          <span className="detail-value">
            {pressure != null ? `${pressure} hPa` : "-"}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Visibility</span>
          <span className="detail-value">
            {visibility != null ? `${Math.round(visibility / 1000)} km` : "-"}
          </span>
        </div>
      </div>
    </section>
  );
};

export default WeatherDetails;

