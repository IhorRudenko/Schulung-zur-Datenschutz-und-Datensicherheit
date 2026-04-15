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

function getOpenSectionsForSlide(slide) {
  if (slide?.type !== 'content' || !slide.sections?.length) {
    return {};
  }

  return slide.sections.reduce((acc, section) => {
    acc[`${slide.id}:${section.id}`] = true;
    return acc;
  }, {});
}

export default function App() {
  const [current, setCurrent] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1100);
  const [openSidebarGroup, setOpenSidebarGroup] = useState(
    slides[0]?.children?.length ? slides[0].id : null
  );
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
        slide?.type === 'content' && targetId
          ? `${slide.id}:${targetId}`
          : null;

      if (accordionKey) {
        setAccordionOpen((prev) => ({
          ...prev,
          [accordionKey]: true,
        }));
      }

      const autoOpenSections = getOpenSectionsForSlide(slide);
      if (Object.keys(autoOpenSections).length) {
        setAccordionOpen((prev) => ({
          ...prev,
          ...autoOpenSections,
        }));
      }

      setOpenSidebarGroup(slide?.children?.length ? slide.id : null);

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
    const slide = slides[current];

    if (slide?.type !== 'content' || !slide.sections?.length) {
      return undefined;
    }

    const activeSlide = document.querySelector('.slide.active');
    const scrollArea = activeSlide?.querySelector('.slide-scroll');
    if (!activeSlide || !scrollArea) return undefined;

    const sections = slide.sections
      .map((section) => ({
        id: section.id,
        element: activeSlide.querySelector(`[data-anchor="${section.id}"]`),
      }))
      .filter((section) => section.element);

    if (!sections.length) {
      return undefined;
    }

    const updateActiveSection = () => {
      const threshold = scrollArea.scrollTop + 36;
      let nextActive = sections[0].id;

      sections.forEach((section) => {
        if (section.element.offsetTop <= threshold) {
          nextActive = section.id;
        }
      });

      setActiveAnchor((prev) => (prev === nextActive ? prev : nextActive));
    };

    updateActiveSection();
    scrollArea.addEventListener('scroll', updateActiveSection, {
      passive: true,
    });

    return () => {
      scrollArea.removeEventListener('scroll', updateActiveSection);
    };
  }, [current, accordionOpen]);

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
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToSlide(current + 1);
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToSlide(current - 1);
      }
      if (e.key.toLowerCase() === 'm') {
        setSidebarOpen((s) => !s);
      }
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
      setAccordionOpen(getOpenSectionsForSlide(slides[0]));
      setActiveAnchor(null);
      setPendingAnchor(null);
      setCurrent(0);
      setOpenSidebarGroup(slides[0]?.children?.length ? slides[0].id : null);
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

  const handleQuizAnswer = (questionIndex, answerIndex) => {
    if (quizAnswers[questionIndex] != null) return;

    const next = [...quizAnswers];
    next[questionIndex] = answerIndex;
    setQuizAnswers(next);

    const answeredCount = next.filter((answer) => answer != null).length;
    const nextScore = slides
      .filter((slide) => slide.type === 'quiz')
      .flatMap((slide) => slide.questions)
      .reduce((sum, item, index) => {
        const selected = next[index];
        if (selected == null) return sum;
        return sum + (item.answers[selected]?.correct ? 1 : 0);
      }, 0);

    if (answeredCount === totalQuizQuestions) {
      const passedStrongly = nextScore >= Math.ceil(totalQuizQuestions * 0.8);
      const passedSolid = nextScore >= Math.ceil(totalQuizQuestions * 0.6);

      setModal({
        open: true,
        title: 'Testergebnis',
        text: passedStrongly
          ? `Sehr stark: ${nextScore} von ${totalQuizQuestions} richtig. Du hast die wichtigsten Inhalte sicher verstanden.`
          : passedSolid
            ? `Gutes Ergebnis: ${nextScore} von ${totalQuizQuestions} richtig. Die Grundlagen sitzen, einzelne Punkte kannst du noch vertiefen.`
            : `Ergebnis: ${nextScore} von ${totalQuizQuestions} richtig. Geh die wichtigsten Abschnitte noch einmal durch und versuche den Test danach erneut.`,
        type: passedSolid ? 'success' : 'info',
      });
      return;
    }
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
        openGroup={openSidebarGroup}
        setOpenGroup={setOpenSidebarGroup}
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
