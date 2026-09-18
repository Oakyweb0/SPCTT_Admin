import React from 'react';
import { Link } from 'react-router-dom';

const ComingSoon = ({ moduleName = 'This Module', description }) => {
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-icon-box">
        <i className="fa-solid fa-clock-rotate-left"></i>
      </div>
      <h2 className="coming-soon-title">{moduleName} Coming Soon</h2>
      {description && (
        <p className="coming-soon-desc">
          {description}
        </p>
      )}
      <div className="d-flex gap-2">
        <Link to="/admin/dashboard" className="coming-soon-back-btn">
          <i className="fa-solid fa-arrow-left"></i>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;
