import React from "react";
import "./styles.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-text">
          © {new Date().getFullYear()} Axolove · Plataforma descentralizada de
          registro científico
        </p>
      </div>
    </footer>
  );
}

export default Footer;
