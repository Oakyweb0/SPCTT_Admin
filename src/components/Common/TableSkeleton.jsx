import React from 'react';
import Skeleton from './Skeleton';

/**
 * TableSkeleton renders shimmer placeholder rows within a <tbody>
 *
 * @param {number} rows - Number of skeleton rows to display (default: 5)
 * @param {number|Array} columns - Number of columns or array of column configurations
 */
export const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  // Normalize columns configuration
  const colConfigs = React.useMemo(() => {
    if (Array.isArray(columns)) {
      return columns;
    }
    const count = typeof columns === 'number' ? columns : 5;
    return Array.from({ length: count }, (_, i) => {
      if (i === 0) return { type: 'number', width: '32px', align: 'center' };
      if (i === 1) return { type: 'code', width: '70px', align: 'center', pill: true };
      if (i === 2) return { type: 'double-text' };
      if (i === count - 1) return { type: 'action', width: '65px', align: 'center' };
      if (i === count - 2) return { type: 'badge', width: '70px', align: 'center', pill: true };
      return { type: 'text', width: `${60 + (i % 3) * 15}%` };
    });
  }, [columns]);

  const renderCellContent = (col, rowIndex, colIndex) => {
    const type = col.type || 'text';

    // Variations across rows to look organic
    const widthVariation = (rowIndex % 3 === 1 ? '85%' : rowIndex % 3 === 2 ? '70%' : '100%');

    switch (type) {
      case 'avatar-text':
        return (
          <div className="d-flex align-items-center gap-2">
            <Skeleton width="32px" height="32px" circle={true} />
            <div className="d-flex flex-column gap-1 flex-grow-1" style={{ maxWidth: '160px' }}>
              <Skeleton width="90%" height="13px" />
              <Skeleton width="60%" height="10px" />
            </div>
          </div>
        );

      case 'double-text':
        return (
          <div className="d-flex flex-column gap-1" style={{ maxWidth: '180px' }}>
            <Skeleton width={widthVariation} height="13px" />
            <Skeleton width="55%" height="10px" />
          </div>
        );

      case 'badge':
      case 'code':
        return (
          <div className={`d-flex ${col.align === 'center' ? 'justify-content-center' : col.align === 'end' ? 'justify-content-end' : 'justify-content-start'}`}>
            <Skeleton
              width={col.width || '65px'}
              height={col.height || '22px'}
              pill={col.pill !== false}
            />
          </div>
        );

      case 'action':
      case 'actions':
        return (
          <div className="d-flex align-items-center justify-content-center gap-1.5">
            <Skeleton width="28px" height="28px" style={{ borderRadius: '6px' }} />
            <Skeleton width="28px" height="28px" style={{ borderRadius: '6px' }} />
          </div>
        );

      case 'number':
        return (
          <div className="d-flex justify-content-center">
            <Skeleton width={col.width || '28px'} height={col.height || '13px'} />
          </div>
        );

      case 'text':
      default: {
        const alignClass = col.align === 'center' ? 'justify-content-center' : col.align === 'end' ? 'justify-content-end' : '';
        return (
          <div className={`d-flex ${alignClass}`}>
            <Skeleton
              width={col.width || widthVariation}
              height={col.height || '13px'}
              pill={Boolean(col.pill)}
            />
          </div>
        );
      }
    }
  };

  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={`skeleton-row-${rIdx}`} className="spctt-skeleton-row">
          {colConfigs.map((col, cIdx) => (
            <td
              key={`skeleton-cell-${rIdx}-${cIdx}`}
              className={`py-3 px-2 align-middle ${
                col.align === 'center' ? 'text-center' : col.align === 'end' ? 'text-end' : ''
              }`}
              style={col.style}
            >
              {renderCellContent(col, rIdx, cIdx)}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default TableSkeleton;
