import { useCallback, useEffect, useMemo, useState } from 'react';
import slides from './data/slides.json';
import Sidebar from './components/Sidebar';
import ProgressBar from './components/ProgressBar';
import SlideRenderer from './components/SlideRenderer';
import SlideArrows from './components/SlideArrows';
import FeedbackModal from './components/FeedbackModal';

const initialAnswers = slides
  .filter((slide) => slide.type === 'quiz')
  .flatMap((slide) => slide.questions.map(() => null));

export default function App() {
  const [current, setCurrent] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1100);
  const [lightTheme, setLightTheme] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState({});
  const [pendingAnchor, setPendingAnchor] = useState(null);
  const [activeAnchor, setActiveAnchor] = useState(null);
  const [modal, setModal] = useState({
    open: false,
    title: '',
    text: '',
    type: 'info',
  });
  const [quizAnswers, setQuizAnswers] = useState(initialAnswers);

  const scrollToTarget = useCallback((targetId = null) => {
    const activeSlide = document.querySelector('.slide.active');
    const scrollArea = activeSlide?.querySelector('.slide-scroll');
    if (!scrollArea) return;

    if (targetId) {
      const target = activeSlide.querySelector(`[data-anchor="${targetId}"]`);
      if (target) {
        const top = Math.max(target.offsetTop - 12, 0);
        scrollArea.scrollTo({ top, behavior: 'smooth' });
        return;
      }
    }

    scrollArea.scrollTop = 0;
  }, []);

  const goToSlide = useCallback(
    (index, targetId = null) => {
      if (index < 0 || index >= slides.length) return;
      const slide = slides[index];
      const accordionKey =
        slide?.type === 'content' && targetId ? `${slide.id}:${targetId}` : null;

      if (accordionKey) {
        setAccordionOpen((prev) => ({
          ...prev,
          [accordionKey]: true,
        }));
      }

      setActiveAnchor(targetId);
      setPendingAnchor(targetId ? { targetId, accordionKey } : null);
      if (index === current) {
        requestAnimationFrame(() => {
          window.setTimeout(() => scrollToTarget(targetId), 170);
        });
        return;
      }
      setCurrent(index);
    },
    [current, scrollToTarget]
  );

  useEffect(() => {
    document.body.classList.toggle('light', lightTheme);
    document.body.classList.toggle('sidebar-collapsed', !sidebarOpen);
  }, [lightTheme, sidebarOpen]);

  useEffect(() => {
    if (!pendingAnchor) return undefined;

    if (
      pendingAnchor.accordionKey &&
      !accordionOpen[pendingAnchor.accordionKey]
    ) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      scrollToTarget(pendingAnchor.targetId);
      setPendingAnchor(null);
    }, 170);

    return () => window.clearTimeout(timer);
  }, [current, pendingAnchor, accordionOpen, scrollToTarget]);

  useEffect(() => {
    const activeSlide = document.querySelector('.slide.active');
    if (!activeSlide) return undefined;

    const reveals = [...activeSlide.querySelectorAll('.reveal')];
    const timers = reveals.map((element, idx) => {
      element.classList.remove('in');
      return window.setTimeout(
        () => {
          element.classList.add('in');
        },
        70 + idx * 70
      );
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [current]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (modal.open && e.key === 'Escape') {
        setModal((m) => ({ ...m, open: false }));
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown')
        goToSlide(current + 1);
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') goToSlide(current - 1);
      if (e.key.toLowerCase() === 'm') setSidebarOpen((s) => !s);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [current, modal.open, goToSlide]);

  const progress = useMemo(
    () => ((current + 1) / slides.length) * 100,
    [current]
  );
  const quizScore = useMemo(
    () =>
      slides
        .filter((slide) => slide.type === 'quiz')
        .flatMap((slide) => slide.questions)
        .reduce((sum, question, index) => {
          const selected = quizAnswers[index];
          if (selected == null) return sum;
          return sum + (question.answers[selected]?.correct ? 1 : 0);
        }, 0),
    [quizAnswers]
  );

  const totalQuizQuestions = initialAnswers.length;

  const handleAction = (action, target) => {
    if (action === 'next') goToSlide(current + 1);
    if (action === 'jump') goToSlide(target);
    if (action === 'restart') {
      setQuizAnswers(initialAnswers);
      setAccordionOpen({});
      setActiveAnchor(null);
      setPendingAnchor(null);
      setCurrent(0);
      setModal({ open: false, title: '', text: '', type: 'info' });
      requestAnimationFrame(() => scrollToTarget());
    }
  };

  const handleScenarioChoice = (choice) => {
    setModal({
      open: true,
      title: choice.modalTitle,
      text: choice.modalText,
      type: choice.type === 'good' ? 'success' : 'danger',
    });
  };

  const handleQuizAnswer = (questionIndex, answerIndex, question) => {
    if (quizAnswers[questionIndex] != null) return;

    const next = [...quizAnswers];
    next[questionIndex] = answerIndex;
    setQuizAnswers(next);

    const correct = question.answers[answerIndex]?.correct;
    setModal({
      open: true,
      title: correct ? 'Richtig beantwortet' : 'Leider nicht richtig',
      text: correct
        ? 'Sehr gut. Genau diese Entscheidung stärkt Datenschutz und Datensicherheit.'
        : 'Nicht ganz. Denk daran: sichere Passwörter und gezielte Zugriffsrechte sind essenziell.',
      type: correct ? 'success' : 'danger',
    });
  };

  return (
    <>
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      <ProgressBar progress={progress} />

      <Sidebar
        slides={slides}
        current={current}
        activeAnchor={activeAnchor}
        sidebarOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((s) => !s)}
        onNavigate={(index, targetId) => {
          goToSlide(index, targetId);
          if (window.innerWidth <= 1100) setSidebarOpen(false);
        }}
        lightTheme={lightTheme}
        onToggleTheme={() => setLightTheme((t) => !t)}
      />

      <main className="slides" id="slides" aria-live="polite">
        {slides.map((slide, index) => (
          <SlideRenderer
            key={slide.id}
            slide={slide}
            index={index}
            isActive={index === current}
            accordionOpen={accordionOpen}
            setAccordionOpen={setAccordionOpen}
            onAction={handleAction}
            onScenarioChoice={handleScenarioChoice}
            onQuizAnswer={handleQuizAnswer}
            quizAnswers={quizAnswers}
            quizScore={quizScore}
            totalQuizQuestions={totalQuizQuestions}
          />
        ))}
      </main>

      <SlideArrows
        current={current}
        total={slides.length}
        onPrev={() => goToSlide(current - 1)}
        onNext={() => goToSlide(current + 1)}
      />

      <FeedbackModal
        modal={modal}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
      />
    </>
  );
}
