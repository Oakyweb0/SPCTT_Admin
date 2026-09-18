import React, { useState } from 'react';

const QuickActions = ({ actions = [] }) => {
  const [selectedAction, setSelectedAction] = useState(null);

  const handleActionClick = (e, action) => {
    e.preventDefault();
    setSelectedAction(action);
  };

  const closeModal = () => {
    setSelectedAction(null);
  };

  return (
    <>
      <div className="dashboard-card-section mb-4">
        <div className="dashboard-card-header">
          <div className="dashboard-card-title-box">
            <i className="fa-solid fa-bolt card-title-icon text-warning"></i>
            <h2 className="dashboard-card-title">Quick Actions</h2>
          </div>
          <span className="badge bg-light text-muted border">Placeholders</span>
        </div>

        <div className="dashboard-card-body">
          <div className="row g-3">
            {actions.map((action) => (
              <div key={action.id} className="col-12 col-sm-6 col-xl-3">
                <button
                  type="button"
                  onClick={(e) => handleActionClick(e, action)}
                  className={`quick-action-btn-card ${action.variant}`}
                >
                  <div className="quick-action-icon">
                    <i className={action.icon}></i>
                  </div>
                  <div className="quick-action-content">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="quick-action-name">{action.title}</span>
                    </div>
                    <p className="quick-action-desc">{action.description}</p>
                  </div>
                  <span className="quick-action-badge">Coming Soon</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clean Coming Soon Information Modal */}
      {selectedAction && (
        <div className="spctt-modal-backdrop" onClick={closeModal}>
          <div className="spctt-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="coming-soon-icon-box mx-auto">
              <i className={selectedAction.icon}></i>
            </div>
            <h3 className="fw-bold text-dark mb-2">{selectedAction.title}</h3>
            <span className="badge bg-danger-subtle text-danger px-3 py-2 mb-3 rounded-pill fw-semibold">
              <i className="fa-solid fa-lock me-1"></i>
              Phase 2 Module — Coming Soon
            </span>
            <p className="text-muted small mb-4">
              The <strong>{selectedAction.title}</strong> module is currently in preparation and will be connected to the Node.js + MySQL database in the subsequent phase.
            </p>
            <button
              type="button"
              className="btn btn-primary px-4 py-2 fw-semibold w-100"
              style={{ backgroundColor: 'var(--spctt-primary)', borderColor: 'var(--spctt-primary)' }}
              onClick={closeModal}
            >
              <i className="fa-solid fa-check me-2"></i>
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions;
