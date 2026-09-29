import React from 'react';

const Footer = () => {
  const currentYear = 2026;

  return (
    <footer className="spctt-footer">
      <div className="footer-left">
        <span>
          © {currentYear} <strong>SPCTT</strong> (Society for Pediatric Cellular Therapy and Transplant). All rights reserved.
        </span>
      </div>
      <div className="footer-right">
        <span className="footer-status-indicator">
          <span className="footer-status-dot"></span>
          System Operational
        </span>
        <span className="badge bg-light text-muted border">
          Admin v1.0.0
        </span>
      </div>
    </footer>
  );
};

export default Footer;
