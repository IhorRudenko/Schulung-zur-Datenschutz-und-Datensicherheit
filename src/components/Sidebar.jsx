export default function Sidebar({
  slides,
  current,
  sidebarOpen,
  onToggle,
  onNavigate,
  lightTheme,
  onToggleTheme,
}) {
  return (
    <>
      <button
        className="sidebar-toggle floating"
        id="sidebarToggle"
        aria-label="Navigation einblenden"
        onClick={onToggle}
      >
        ☰
      </button>

      <aside className="sidebar glass" id="sidebar" aria-label="Seitennavigation">
        <div className="sidebar-top">
          <div className="brand">
            <img src="/images/main-icon.png" width="60" alt="Icon" />
            <div>
              <strong>Security Training</strong>
            </div>
          </div>

          <button
            className="sidebar-toggle inside"
            id="sidebarToggleInside"
            aria-label="Navigation schließen"
            onClick={onToggle}
          >
            ←
          </button>
        </div>

        <nav className="dot-nav" id="dotNav">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              className={`dot-link${index === current ? ' active' : ''}`}
              onClick={() => onNavigate(index)}
            >
              <span className="dot"></span>
              <span>{slide.navTitle}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" id="themeToggle" aria-label="Design umschalten" onClick={onToggleTheme}>
            <span>{lightTheme ? '☀️' : '🌙'}</span>
            <span>Theme</span>
          </button>
        </div>
      </aside>
    </>
  )
}
