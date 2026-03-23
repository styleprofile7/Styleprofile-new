'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { quizQuestions, archetypes } from '../../utils/quizData';

export default function QuizPage() {
  const router = useRouter();
  const [stage, setStage] = useState('intro'); // 'intro' | 'quiz' | 'result'
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [scores, setScores] = useState({});
  const [animating, setAnimating] = useState(false);

  const progress = ((currentQ + 1) / quizQuestions.length) * 100;
  const q = quizQuestions[currentQ];
  const selected = answers[currentQ] !== undefined ? answers[currentQ] : null;

  const selectOption = (index) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = index;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (selected === null) return;
    if (currentQ < quizQuestions.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentQ(currentQ + 1);
        setAnimating(false);
      }, 200);
    } else {
      calculateResult();
    }
  };

  const prevQuestion = () => {
    if (currentQ > 0) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentQ(currentQ - 1);
        setAnimating(false);
      }, 200);
    }
  };

  const calculateResult = () => {
    const tally = {};
    Object.keys(archetypes).forEach(k => { tally[k] = 0; });
    answers.forEach((answerIndex, qIndex) => {
      if (answerIndex === undefined) return;
      const opt = quizQuestions[qIndex].options[answerIndex];
      Object.keys(opt.scores).forEach(archetype => {
        tally[archetype] = (tally[archetype] || 0) + opt.scores[archetype];
      });
    });
    const sorted = Object.keys(tally).sort((a, b) => tally[b] - tally[a]);
    const winner = sorted[0];
    setScores(tally);
    setResult({ winner, archetype: archetypes[winner], allScores: tally, sorted });
    setStage('result');
  };

  const retake = () => {
    setAnswers([]);
    setCurrentQ(0);
    setResult(null);
    setScores({});
    setStage('intro');
  };

  // Animate trait bars after result mounts
  useEffect(() => {
    if (stage === 'result') {
      setTimeout(() => {
        const fills = document.querySelectorAll('.trait-fill[data-pct]');
        fills.forEach(el => {
          el.style.width = el.getAttribute('data-pct') + '%';
        });
      }, 400);
    }
  }, [stage]);

  // INTRO
  if (stage === 'intro') {
    return (
      <div className="quiz-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem', fontWeight: '400', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '3rem' }}>
          StyleProfile
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(3rem,8vw,6.5rem)', fontWeight: '300', lineHeight: '1.05', letterSpacing: '-0.02em', marginBottom: '1.5rem', color: '#F5F3EE' }}>
          Your Fashion<br /><em style={{ fontStyle: 'italic', color: '#E2C47A' }}>Identity</em> Quiz
        </h1>
        <p style={{ fontSize: '1rem', color: 'rgba(245,243,238,0.45)', fontWeight: '300', maxWidth: '420px', lineHeight: '1.7', marginBottom: '3.5rem' }}>
          10 categories. Precise questions. A result that actually reflects how you think about clothes — not just what you wear.
        </p>
        <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center', marginBottom: '3rem' }}>
          {[['10', 'Categories'], ['~4', 'Minutes'], ['8', 'Archetypes']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: '300', color: '#C9A84C', display: 'block' }}>{num}</span>
              <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,243,238,0.45)', marginTop: '0.3rem', display: 'block' }}>{label}</span>
            </div>
          ))}
        </div>
        <button className="btn-cta-primary" onClick={() => setStage('quiz')}>Begin Quiz</button>
      </div>
    );
  }

  // RESULT
  if (stage === 'result' && result) {
    const { archetype, sorted, allScores } = result;
    const maxScore = allScores[sorted[0]] || 1;
    const nameParts = archetype.name.split(' ');
    const lastName = nameParts[nameParts.length - 1];
    const firstName = nameParts.slice(0, nameParts.length - 1).join(' ');

    return (
      <div className="quiz-screen">
        <div className="quiz-layout">
          <div className="result-eyebrow">Your Fashion Identity</div>
          <h2 className="result-title">{firstName} <em>{lastName}</em></h2>
          <p className="result-archetype">{archetype.sub}</p>
          <div className="result-divider" />
          <p className="result-desc">{archetype.desc}</p>

          <div style={{ marginBottom: '3rem' }}>
            <div className="traits-title">Dominant Style Traits</div>
            {archetype.traits.map((t) => (
              <div key={t.name} className="trait-row">
                <span className="trait-name">{t.name}</span>
                <div className="trait-track">
                  <div className="trait-fill" data-pct={t.pct} style={{ width: '0%' }} />
                </div>
                <span className="trait-pct">{t.pct}%</span>
              </div>
            ))}
          </div>

          <div className="scores-grid">
            {sorted.map((key) => {
              const pct = Math.round((allScores[key] / maxScore) * 100);
              const shortName = archetypes[key].name.replace('The ', '');
              return (
                <div key={key} className={`score-card${key === result.winner ? ' dominant' : ''}`}>
                  <div className="score-archetype">{shortName}</div>
                  <div className="score-value">{pct}%</div>
                </div>
              );
            })}
          </div>

          <div className="result-cta">
            <button className="btn-cta-primary" onClick={() => router.push('/signup')}>
              Join as {archetype.name} 🚀
            </button>
            <button className="btn-cta-secondary" onClick={retake}>Retake Quiz</button>
          </div>
          <p style={{ color: 'rgba(245,243,238,0.45)', fontSize: '0.85rem', marginTop: '1rem' }}>
            Already have an account?{' '}
            <span onClick={() => router.push('/login')} style={{ color: '#C9A84C', cursor: 'pointer' }}>Login here</span>
          </p>
        </div>
      </div>
    );
  }

  // QUIZ
  return (
    <div className="quiz-screen">
      <div className="quiz-layout">
        <div className="quiz-topbar">
          <span className="quiz-brand">SP</span>
          <span className="quiz-counter">{currentQ + 1} / {quizQuestions.length}</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div style={{ opacity: animating ? 0 : 1, transition: 'opacity 0.2s ease' }}>
          <div className="category-label">{q.category}</div>
          <h2 className="question-text">{q.question}</h2>
          <p className="question-sub">{q.sub}</p>

          <div className={`options-grid ${q.layout}`}>
            {q.options.map((opt, i) => (
              <button
                key={i}
                className={`option-btn${selected === i ? ' selected' : ''}`}
                onClick={() => selectOption(i)}
              >
                <div className="option-indicator" />
                <div>
                  <span className="option-label">{opt.label}</span>
                  <span className="option-desc">{opt.desc}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="quiz-nav">
            <button
              className="btn-quiz-prev"
              onClick={prevQuestion}
              style={{ visibility: currentQ === 0 ? 'hidden' : 'visible' }}
            >← Back</button>
            <button
              className="btn-quiz-next"
              onClick={nextQuestion}
              disabled={selected === null}
            >
              {currentQ === quizQuestions.length - 1 ? 'See Result ✨' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
