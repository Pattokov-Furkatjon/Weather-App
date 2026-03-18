import React from "react";

const SearchBar = ({ value, onChange, onSubmit, loading }) => {
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <span className="search-icon" aria-hidden="true">
          🔍
        </span>
        <input
          type="text"
          className="search-input"
          placeholder="Search for a city..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
      </div>
      <button
        type="button"
        className="search-button"
        onClick={onSubmit}
        disabled={loading}
      >
        {loading ? "Loading..." : "Search"}
      </button>
    </div>
  );
};

export default SearchBar;

