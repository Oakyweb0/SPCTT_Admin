import React from 'react';

const StatCard = ({ stat }) => {
  const { title, value, icon, theme, trend, trendType, subtext } = stat;

  return (
    <div className={`stat-card-wrapper stat-theme-${theme}`}>
      <div className="stat-card-top">
        <div className="stat-card-info">
          <span className="stat-card-label">{title}</span>
          <span className="stat-card-value">{typeof value === 'number' ? value.toLocaleString() : value}</span>
        </div>
        <div className="stat-icon-box">
          <i className={icon}></i>
        </div>
      </div>
      
      <div className="stat-card-bottom">
        <span className="text-muted text-truncate me-2" title={subtext}>
          {subtext}
        </span>
        {trend && (
          <span className={`stat-trend-badge ${trendType === 'positive' ? 'positive' : 'neutral'}`}>
            {trendType === 'positive' && <i className="fa-solid fa-arrow-trend-up"></i>}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
