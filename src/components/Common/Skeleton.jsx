import React from 'react';

/**
 * Reusable Skeleton placeholder element with shimmer animation
 */
export const Skeleton = ({
  width = '100%',
  height = '14px',
  circle = false,
  pill = false,
  className = '',
  style = {}
}) => {
  const inlineStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style
  };

  const classes = [
    'spctt-skeleton',
    circle ? 'spctt-skeleton-circle' : '',
    pill ? 'spctt-skeleton-pill' : '',
    className
  ].filter(Boolean).join(' ');

  return <span className={classes} style={inlineStyle} aria-hidden="true" />;
};

export default Skeleton;
