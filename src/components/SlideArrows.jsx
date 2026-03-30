export default function SlideArrows({ current, total, onPrev, onNext }) {
  return (
    <div className="slide-arrows" aria-label="Navigation">
      <button
        className="nav-arrow left"
        id="prevBtn"
        aria-label="Vorheriger Slide"
        onClick={onPrev}
        disabled={current === 0}
      >
        ❮
      </button>
      <button
        className="nav-arrow right"
        id="nextBtn"
        aria-label="Nächster Slide"
        onClick={onNext}
        disabled={current === total - 1}
      >
        ❯
      </button>
    </div>
  );
}
