import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function Sidebar({
  slides,
  current,
  activeAnchor,
  onToggle,
  onNavigate,
  lightTheme,
  onToggleTheme,
}) {
  const [openGroup, setOpenGroup] = useState(null);
  const currentSlide = slides[current];

  useEffect(() => {
    if (currentSlide?.children?.length) {
      setOpenGroup(currentSlide.id);
      return;
    }

    setOpenGroup(null);
  }, [currentSlide]);

  return (
    <>
      <button
        className="sidebar-toggle floating"
        id="sidebarToggle"
        aria-label="Navigation einblenden"
        onClick={onToggle}
      >
        ≡
      </button>

      <aside
        className="sidebar glass"
        id="sidebar"
        aria-label="Seitennavigation"
      >
        <div className="sidebar-top">
          <button
            className="sidebar-toggle inside"
            id="sidebarToggleInside"
            aria-label="Navigation schließen"
            onClick={onToggle}
          >
            ←
          </button>

          <div className="brand">
            <div>
              <strong>Security Training</strong>
            </div>
            <img src="/images/main-icon.png" width="60" alt="Icon" />
          </div>
        </div>

        <nav className="dot-nav" id="dotNav">
          {slides.map((slide, index) => {
            const isExpanded =
              Boolean(slide.children?.length) && openGroup === slide.id;

            return (
              <div
                key={slide.id}
                className={`nav-group${index === current ? ' active' : ''}${
                  isExpanded ? ' expanded' : ''
                }`}
              >
                <button
                  className={`dot-link${index === current ? ' active' : ''}`}
                  onClick={() => {
                    if (slide.children?.length) {
                      setOpenGroup((group) =>
                        group === slide.id ? null : slide.id
                      );
                    }
                    onNavigate(index);
                  }}
                >
                  <span className="dot"></span>
                  <span>{slide.navTitle}</span>
                  {slide.children?.length ? (
                    <span className="nav-caret" aria-hidden="true">
                      {isExpanded ? '−' : '+'}
                    </span>
                  ) : null}
                </button>

                {slide.children?.length ? (
                  <div className="sub-nav">
                    {slide.children.map((child) => (
                      <button
                        key={child.id}
                        className={`sub-link${
                          index === current && child.id === activeAnchor
                            ? ' active'
                            : ''
                        }`}
                        onClick={() => onNavigate(index, child.id)}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            className="theme-toggle"
            id="themeToggle"
            aria-label="Design umschalten"
            onClick={onToggleTheme}
          >
            <span className="theme-icon" aria-hidden="true">
              {lightTheme ? '☀' : '☾'}
            </span>
            <span>{lightTheme ? 'Light Theme' : 'Dark Theme'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  slides: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      navTitle: PropTypes.string.isRequired,
      children: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        })
      ),
    })
  ).isRequired,
  current: PropTypes.number.isRequired,
  activeAnchor: PropTypes.string,
  onToggle: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  lightTheme: PropTypes.bool.isRequired,
  onToggleTheme: PropTypes.func.isRequired,
};
