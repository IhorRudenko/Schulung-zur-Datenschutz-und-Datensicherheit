export default function FeedbackModal({ modal, onClose }) {
  return (
    <div
      className={`modal-backdrop${modal.open ? ' open' : ''}`}
      id="modalBackdrop"
      aria-hidden={modal.open ? 'false' : 'true'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitle"
      >
        <button
          className="modal-close"
          id="modalClose"
          aria-label="Fenster schließen"
          onClick={onClose}
        >
          ×
        </button>
        <div
          className="modal-icon"
          id="modalIcon"
          style={{
            background:
              modal.type === 'success'
                ? 'linear-gradient(135deg, var(--success), var(--primary))'
                : modal.type === 'danger'
                  ? 'linear-gradient(135deg, var(--danger), var(--primary-2))'
                  : 'linear-gradient(135deg, var(--primary), var(--primary-2))',
          }}
        >
          {modal.type === 'success' ? '✓' : modal.type === 'danger' ? '!' : 'i'}
        </div>
        <h3 id="modalTitle">{modal.title || 'Hinweis'}</h3>
        <p id="modalText">
          {modal.text || 'Hier erscheint deine Rückmeldung.'}
        </p>
        <button className="btn btn-primary" id="modalAction" onClick={onClose}>
          Verstanden
        </button>
      </div>
    </div>
  );
}
