import React from "react";
import "./styles.css";

export default function Banner({
  backgroundImage,
  sideImage,
  title,
  subtitle,
  variant = "blue",
}) {
  return (
    <section className={`banner banner-${variant}`}>
      {backgroundImage && (
        <img
          src={backgroundImage}
          className="banner-bg-image"
          alt="background banner"
        />
      )}

      <div className="banner-overlay" />

      <div className="banner-container">
        <div className="banner-content">
          <h1 className="banner-title">{title}</h1>
          {subtitle && <p className="banner-subtitle">{subtitle}</p>}
        </div>

        {sideImage && (
          <div className="banner-side">
            <img src={sideImage} className="banner-side-image" alt={title} />
          </div>
        )}
      </div>
    </section>
  );
}
