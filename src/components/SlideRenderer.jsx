import PropTypes from 'prop-types';

function ActionButtons({ actions, extraClass = '', onAction }) {
  if (!actions?.length) return null;
  return (
    <div className={`hero-actions reveal ${extraClass}`.trim()}>
      {actions.map((action, idx) => (
        <button
          key={idx}
          className={`btn ${action.variant === 'secondary' ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => onAction(action.action, action.target)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

ActionButtons.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      action: PropTypes.string.isRequired,
      target: PropTypes.number,
      variant: PropTypes.string,
    })
  ).isRequired,
  extraClass: PropTypes.string,
  onAction: PropTypes.func.isRequired,
};

function renderMarkup(text) {
  return { __html: text };
}

function renderSectionBody(section) {
  return (
    <div className="section-body">
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      {section.bullets?.length ? (
        <ul className="check-list compact">
          {section.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}

      {section.cards?.length ? (
        <div className="mini-grid">
          {section.cards.map((card) => (
            <article className="mini-card glass" key={card.title}>
              <h4>{card.title}</h4>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      ) : null}

      {section.comparison?.length ? (
        <div className="comparison comparison-inline">
          {section.comparison.map((item) => (
            <article className="panel glass" key={item.title}>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      ) : null}

      {section.columns?.length ? (
        <div className="dual-list-grid">
          {section.columns.map((column) => (
            <article className="mini-card glass" key={column.title}>
              <h4>{column.title}</h4>
              <ul className="check-list compact">
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      ) : null}

      {section.note ? <div className="section-note">{section.note}</div> : null}
    </div>
  );
}

renderSectionBody.propTypes = {
  section: PropTypes.object,
};

export default function SlideRenderer({
  slide,
  isActive,
  accordionOpen,
  setAccordionOpen,
  onAction,
  onQuizAnswer,
  quizAnswers,
  quizScore,
  totalQuizQuestions,
}) {
  return (
    <section
      className={`slide${isActive ? ' active' : ''}`}
      data-title={slide.navTitle}
    >
      <div className="slide-scroll">
        <div className={`slide-inner${slide.type === 'hero' ? ' hero' : ''}`}>
          <div className="section-head reveal">
            {slide.type === 'hero' ? null : (
              <span className="eyebrow">{slide.eyebrow}</span>
            )}
            {slide.type === 'hero' ? (
              <>
                <div className="eyebrow reveal">{slide.eyebrow}</div>
                <h1
                  className="reveal"
                  dangerouslySetInnerHTML={renderMarkup(slide.title)}
                />
                <p className="lead reveal">{slide.lead}</p>

                <div className="hero-overview reveal">
                  {slide.overview?.map((item) => (
                    <span className="hero-pill" key={item}>
                      {item}
                    </span>
                  ))}
                </div>

                <ActionButtons
                  actions={slide.actions}
                  extraClass="restart-space"
                  onAction={onAction}
                />
              </>
            ) : (
              <>
                <h2>{slide.title}</h2>
                {slide.intro ? <p className="lead section-lead">{slide.intro}</p> : null}
              </>
            )}
          </div>

          {slide.type === 'content' && (
            <>
              <div className="content-top-grid">
                <div className="stat-grid content-stats">
                  {slide.keyFacts?.map((stat) => (
                    <article className="stat glass reveal" key={stat.value}>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </article>
                  ))}
                </div>

                {slide.media ? (
                  <aside className="media-placeholder glass reveal">
                    <div className="media-icon" aria-hidden="true">
                      IMG
                    </div>
                    <span className="media-eyebrow">{slide.media.eyebrow}</span>
                    <h3>{slide.media.title}</h3>
                    <p>{slide.media.caption}</p>
                  </aside>
                ) : null}
              </div>

              <div className="content-accordion reveal">
                {slide.sections?.map((section) => {
                  const accordionKey = `${slide.id}:${section.id}`;
                  const open = accordionOpen === accordionKey;

                  return (
                    <section
                      key={section.id}
                      className={`content-section${open ? ' open' : ''}`}
                      data-anchor={section.id}
                    >
                      <button
                        className={`accordion-item content-trigger${open ? ' active' : ''}`}
                        onClick={() =>
                          setAccordionOpen(open ? null : accordionKey)
                        }
                      >
                        <span>{section.title}</span>
                        <span className="accordion-icon">{open ? '−' : '+'}</span>
                      </button>

                      <div className={`accordion-content rich${open ? ' open' : ''}`}>
                        {renderSectionBody(section)}
                      </div>
                    </section>
                  );
                })}
              </div>
            </>
          )}

          {slide.type === 'quiz' && (
            <>
              <div className="quiz-grid quiz-grid-4">
                {slide.questions.map((question, questionIndex) => {
                  const selected = quizAnswers[questionIndex];
                  const answered = selected != null;
                  return (
                    <article
                      className={`quiz-card glass reveal${answered ? ' answered' : ''}`}
                      key={question.title}
                    >
                      <h3>{question.title}</h3>
                      <p>{question.question}</p>
                      <div className="quiz-actions quiz-actions-stack">
                        {question.answers.map((answer, answerIndex) => {
                          const isSelected = selected === answerIndex;
                          const selectionClass =
                            answered && isSelected
                              ? answer.correct
                                ? ' selected-correct'
                                : ' selected-wrong'
                              : answered
                                ? ' is-disabled'
                                : '';
                          return (
                            <button
                              key={answer.label}
                              className={`btn btn-secondary quiz-answer${selectionClass}`}
                              disabled={answered}
                              onClick={() =>
                                onQuizAnswer(
                                  questionIndex,
                                  answerIndex,
                                  question
                                )
                              }
                            >
                              {answer.label}
                            </button>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="score-box glass reveal">
                <strong>Punkte:</strong>{' '}
                <span id="scoreValue">{quizScore}</span> / {totalQuizQuestions}
              </div>
            </>
          )}

          {slide.type === 'summary' && (
            <>
              <div className="grid cols-3">
                {slide.summaryCards.map((card) => (
                  <article className="panel glass reveal" key={card.title}>
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                  </article>
                ))}
              </div>
              <ActionButtons
                actions={slide.actions}
                extraClass="restart-space"
                onAction={onAction}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

const sectionShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  paragraphs: PropTypes.arrayOf(PropTypes.string),
  bullets: PropTypes.arrayOf(PropTypes.string),
  note: PropTypes.string,
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })
  ),
  comparison: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })
  ),
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      items: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ),
});

SlideRenderer.propTypes = {
  slide: PropTypes.shape({
    id: PropTypes.string.isRequired,
    navTitle: PropTypes.string,
    type: PropTypes.string.isRequired,
    eyebrow: PropTypes.string,
    title: PropTypes.string,
    lead: PropTypes.string,
    intro: PropTypes.string,
    overview: PropTypes.arrayOf(PropTypes.string),
    actions: PropTypes.array,
    keyFacts: PropTypes.array,
    sections: PropTypes.arrayOf(sectionShape),
    media: PropTypes.shape({
      eyebrow: PropTypes.string,
      title: PropTypes.string,
      caption: PropTypes.string,
    }),
    questions: PropTypes.array,
    summaryCards: PropTypes.array,
  }).isRequired,
  isActive: PropTypes.bool,
  accordionOpen: PropTypes.string,
  setAccordionOpen: PropTypes.func,
  onAction: PropTypes.func,
  onQuizAnswer: PropTypes.func,
  quizAnswers: PropTypes.array,
  quizScore: PropTypes.number,
  totalQuizQuestions: PropTypes.number,
};
