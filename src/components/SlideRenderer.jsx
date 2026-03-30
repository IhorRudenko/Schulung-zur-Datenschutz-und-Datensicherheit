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

function renderMarkup(text) {
  return { __html: text };
}

export default function SlideRenderer({
  slide,
  index,
  isActive,
  accordionOpen,
  setAccordionOpen,
  onAction,
  onScenarioChoice,
  onQuizAnswer,
  quizAnswers,
  quizScore,
  totalQuizQuestions,
}) {
  const quizOffset = 0;

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
                <ActionButtons
                  actions={slide.actions}
                  extraClass="restart-space"
                  onAction={onAction}
                />
              </>
            ) : (
              <h2>{slide.title}</h2>
            )}
          </div>

          {slide.type === 'grid_two' && (
            <>
              <div className="grid cols-2">
                {slide.cards.map((card) => (
                  <article className="panel glass reveal" key={card.title}>
                    <h3>{card.title}</h3>
                    <ul className="check-list">
                      {card.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>

              <div className="image-placeholder glass reveal">
                <img className="image" src={slide.image} alt={slide.imageAlt} />
              </div>
            </>
          )}

          {slide.type === 'comparison' && (
            <>
              <div className="comparison">
                {slide.comparison.map((item) => (
                  <article className="panel glass reveal tilt" key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    <div className="tag-row">
                      {item.tags.map((tag) => (
                        <span className="tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>

              <div className="fact-strip glass reveal">
                <strong>{slide.factTitle}</strong>
                <span>{slide.factText}</span>
              </div>
            </>
          )}

          {slide.type === 'cards_timeline' && (
            <>
              <div className="cards-3">
                {slide.cards.map((card) => (
                  <article className="panel glass reveal" key={card.title}>
                    <div className="icon">{card.icon}</div>
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                  </article>
                ))}
              </div>

              <div className="timeline reveal">
                {slide.timeline.map((item, idx) => (
                  <div className="timeline-item" key={item}>
                    <span>{idx + 1}</span>
                    {item}
                  </div>
                ))}
              </div>
            </>
          )}

          {slide.type === 'accordion_stats' && (
            <>
              <div className="accordion reveal">
                {slide.accordion.map((item, idx) => {
                  const open = accordionOpen === idx;
                  return (
                    <div key={item.title}>
                      <button
                        className={`accordion-item${open ? ' active' : ''}`}
                        onClick={() => setAccordionOpen(open ? -1 : idx)}
                      >
                        <span>{item.title}</span>
                        <span className="accordion-icon">+</span>
                      </button>
                      <div
                        className={`accordion-content${open ? ' open' : ''}`}
                      >
                        {item.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="stat-grid">
                {slide.stats.map((stat) => (
                  <article className="stat glass reveal" key={stat.value}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </article>
                ))}
              </div>
            </>
          )}

          {slide.type === 'scenario' && (
            <>
              <div className="scenario glass reveal">
                <h3>{slide.scenarioTitle}</h3>
                <p>{slide.scenarioText}</p>
                <div className="scenario-actions">
                  {slide.choices.map((choice) => (
                    <button
                      key={choice.label}
                      className={`choice ${choice.type}`}
                      onClick={() => onScenarioChoice(choice)}
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="image-placeholder glass reveal">
                <img className="image" src={slide.image} alt={slide.imageAlt} />
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
                      <div className="quiz-actions">
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
                              className={`btn ${answerIndex === 0 ? 'btn-secondary' : 'btn-primary'} quiz-answer${selectionClass}`}
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
