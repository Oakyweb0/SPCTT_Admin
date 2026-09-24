import React from 'react';

/**
 * Reusable Modern Pagination Component for SPCTT Data Tables
 * Styled to match Image 1 (Showing X–Y of Z label + Previous / Numbers / Next in crimson active state)
 */
const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50, 100],
  showPageSize = false,
  itemLabel = 'registrations'
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  if (totalItems === 0) {
    return null;
  }

  const startItem = (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (safeCurrentPage > 3) {
        pages.push('ellipsis-start');
      }

      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (safeCurrentPage < totalPages - 2) {
        pages.push('ellipsis-end');
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePrev = () => {
    if (safeCurrentPage > 1 && onPageChange) {
      onPageChange(safeCurrentPage - 1);
    }
  };

  const handleNext = () => {
    if (safeCurrentPage < totalPages && onPageChange) {
      onPageChange(safeCurrentPage + 1);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="spctt-pagination-container">
      {/* Left: Info Text */}
      <div className="spctt-pagination-info">
        <span className="spctt-pagination-text">
          Showing {startItem}–{endItem} of {totalItems.toLocaleString()} {itemLabel}
        </span>

        {showPageSize && onPageSizeChange && (
          <div className="d-flex align-items-center gap-1.5 ms-sm-2">
            <span className="small text-muted">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="spctt-pagination-select shadow-none"
              aria-label="Items per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Buttons */}
      <nav aria-label="Table pagination navigation">
        <ul className="spctt-pagination-nav">
          {/* Previous Page */}
          <li>
            <button
              type="button"
              onClick={handlePrev}
              disabled={safeCurrentPage <= 1}
              className="spctt-page-btn spctt-page-btn-nav"
              aria-label="Previous Page"
            >
              Previous
            </button>
          </li>

          {/* Page Numbers */}
          {pageNumbers.map((page, idx) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <li key={`ellipsis-${idx}`}>
                  <span className="spctt-page-ellipsis">…</span>
                </li>
              );
            }

            const isCurrent = page === safeCurrentPage;
            return (
              <li key={page}>
                <button
                  type="button"
                  onClick={() => onPageChange && onPageChange(page)}
                  className={`spctt-page-btn ${isCurrent ? 'active' : ''}`}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {page}
                </button>
              </li>
            );
          })}

          {/* Next Page */}
          <li>
            <button
              type="button"
              onClick={handleNext}
              disabled={safeCurrentPage >= totalPages}
              className="spctt-page-btn spctt-page-btn-nav"
              aria-label="Next Page"
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
