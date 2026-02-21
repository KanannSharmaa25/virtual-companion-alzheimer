import React, { useState } from 'react';
import { Brain, Play, CheckCircle, RefreshCw, Clock, Trophy, Star, ChevronRight, Grid, ArrowRight } from 'lucide-react';
import { useData } from '../../context/AppContext';
import './PatientCognitiveExercises.css';

interface Exercise {
  id: string;
  type: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
  color?: string;
}

interface Question {
  id: string;
  question: string;
  correctAnswer: string;
  image?: string;
  options?: string[];
}

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EXERCISES: Exercise[] = [
  {
    id: 'memory-match',
    type: 'memory_match',
    name: 'Memory Match',
    description: 'Find matching pairs of emoji cards',
    icon: <Grid size={28} />,
    color: '#8B5CF6',
  },
  {
    id: 'identify-objects',
    type: 'identify_objects',
    name: 'Identify Objects',
    description: 'Identify everyday objects shown on screen',
    icon: <span style={{ fontSize: '28px' }}>👀</span>,
    color: '#10B981',
  },
  {
    id: 'recall-names',
    type: 'recall_names',
    name: 'Recall Names',
    description: 'Remember and recall the names shown',
    icon: <span style={{ fontSize: '28px' }}>📝</span>,
    color: '#F59E0B',
  },
  {
    id: 'sequence-memory',
    type: 'sequence_memory',
    name: 'Sequence Memory',
    description: 'Remember and repeat the sequence',
    icon: <span style={{ fontSize: '28px' }}>🔢</span>,
    color: '#3B82F6',
  },
  {
    id: 'word-recall',
    type: 'word_recall',
    name: 'Word Recall',
    description: 'Recall words from a category',
    icon: <Brain size={28} />,
    color: '#EC4899',
  },
];

const OBJECT_QUESTIONS = [
  { id: '1', question: 'What is this?', options: ['Phone', 'Tablet', 'Laptop', 'Monitor'], correctAnswer: 'Phone', image: '📱' },
  { id: '2', question: 'What is this?', options: ['Clock', 'Watch', 'Compass', 'Timer'], correctAnswer: 'Watch', image: '⌚' },
  { id: '3', question: 'What is this?', options: ['Key', 'Lock', 'Door', 'Handle'], correctAnswer: 'Key', image: '🔑' },
  { id: '4', question: 'What is this?', options: ['Chair', 'Table', 'Desk', 'Stool'], correctAnswer: 'Chair', image: '🪑' },
  { id: '5', question: 'What is this?', options: ['Book', 'Magazine', 'Newspaper', 'Notebook'], correctAnswer: 'Book', image: '📖' },
];

const NAME_QUESTIONS = [
  { id: '1', question: 'Remember this name: Alexander', correctAnswer: 'Alexander' },
  { id: '2', question: 'Remember this name: Benjamin', correctAnswer: 'Benjamin' },
  { id: '3', question: 'Remember this name: Christopher', correctAnswer: 'Christopher' },
  { id: '4', question: 'Remember this name: Elizabeth', correctAnswer: 'Elizabeth' },
  { id: '5', question: 'Remember this name: Victoria', correctAnswer: 'Victoria' },
];

const SEQUENCE_QUESTIONS = [
  { id: '1', question: 'Remember this sequence: 2, 4', correctAnswer: '2,4' },
  { id: '2', question: 'Remember this sequence: 1, 3, 5', correctAnswer: '1,3,5' },
  { id: '3', question: 'Remember this sequence: 2, 6, 8', correctAnswer: '2,6,8' },
  { id: '4', question: 'Remember this sequence: 1, 4, 7, 9', correctAnswer: '1,4,7,9' },
  { id: '5', question: 'Remember this sequence: 3, 5, 7, 9, 11', correctAnswer: '3,5,7,9,11' },
];

const WORD_QUESTIONS = [
  { id: '1', question: 'Name a fruit', options: ['Apple', 'Carrot', 'Potato', 'Lettuce'], correctAnswer: 'Apple' },
  { id: '2', question: 'Name a color', options: ['Blue', 'Stone', 'Cloud', 'Water'], correctAnswer: 'Blue' },
  { id: '3', question: 'Name an animal', options: ['Dog', 'Tree', 'Flower', 'Rock'], correctAnswer: 'Dog' },
  { id: '4', question: 'Name a vehicle', options: ['Car', 'House', 'Chair', 'Table'], correctAnswer: 'Car' },
  { id: '5', question: 'Name a drink', options: ['Water', 'Bread', 'Rice', 'Meat'], correctAnswer: 'Water' },
];

const EMOJI_PAIRS = ['🍎', '🍌', '🍊', '🍇', '🍓', '🍒', '🥝', '🍑'];

export const PatientCognitiveExercises: React.FC = () => {
  const { cognitiveResults, addCognitiveResult } = useData();
  
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [showSequence, setShowSequence] = useState(true);
  const [sequenceNumbers, setSequenceNumbers] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [showExerciseComplete, setShowExerciseComplete] = useState(false);

  const [memoryCards, setMemoryCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [memoryMoves, setMemoryMoves] = useState(0);

  const getTodayDate = () => new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const todayResults = cognitiveResults.filter(r => r.date === getTodayDate());
  const todayExercises = new Set(todayResults.map(r => r.exerciseId));
  const completedToday = todayResults.length;
  const averageScore = todayResults.length > 0 
    ? Math.round(todayResults.reduce((acc, r) => acc + (r.score / r.totalQuestions) * 100, 0) / todayResults.length)
    : 0;

  const getQuestions = (type: string): Question[] => {
    switch(type) {
      case 'identify_objects': return OBJECT_QUESTIONS as Question[];
      case 'recall_names': return NAME_QUESTIONS as Question[];
      case 'sequence_memory': return SEQUENCE_QUESTIONS as Question[];
      case 'word_recall': return WORD_QUESTIONS as Question[];
      default: return [];
    }
  };

  const initializeMemoryGame = () => {
    const shuffled = [...EMOJI_PAIRS].sort(() => Math.random() - 0.5);
    const cards: Card[] = shuffled.flatMap((emoji, idx) => [
      { id: idx * 2, emoji, isFlipped: false, isMatched: false },
      { id: idx * 2 + 1, emoji, isFlipped: false, isMatched: false },
    ]).sort(() => Math.random() - 0.5);
    setMemoryCards(cards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMemoryMoves(0);
  };

  const startExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer('');
    setUserSequence([]);
    setStartTime(Date.now());
    setShowExerciseComplete(false);

    if (exercise.type === 'memory_match') {
      initializeMemoryGame();
      return;
    }

    const questions = getQuestions(exercise.type);
    if (exercise.type === 'sequence_memory' && questions.length > 0) {
      const q = questions[0];
      setSequenceNumbers(q.correctAnswer.split(','));
      setShowSequence(true);
      setTimeout(() => setShowSequence(false), 3000);
    }
  };

  const handleMemoryCardClick = (cardId: number) => {
    if (flippedCards.length >= 2) return;
    
    const cardIndex = memoryCards.findIndex(c => c.id === cardId);
    if (cardIndex === -1 || memoryCards[cardIndex].isMatched || memoryCards[cardIndex].isFlipped) return;

    const newCards = [...memoryCards];
    newCards[cardIndex].isFlipped = true;
    setMemoryCards(newCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves(prev => prev + 1);
      const card1 = memoryCards.find(c => c.id === newFlipped[0]);
      const card2 = memoryCards.find(c => c.id === newFlipped[1]);

      if (card1 && card2 && card1.emoji === card2.emoji) {
        const matchedCards = memoryCards.map(c => 
          c.id === newFlipped[0] || c.id === newFlipped[1] 
            ? { ...c, isMatched: true } 
            : c
        );
        setMemoryCards(matchedCards);
        setMatchedPairs(prev => prev + 1);
        setFlippedCards([]);

        if (matchedPairs + 1 === EMOJI_PAIRS.length) {
          setTimeout(() => {
            const timeTaken = Math.round((Date.now() - startTime) / 1000);
            addCognitiveResult({
              exerciseId: selectedExercise!.id,
              exerciseName: selectedExercise!.name,
              score: EMOJI_PAIRS.length,
              totalQuestions: EMOJI_PAIRS.length,
              timeTaken,
              date: getTodayDate(),
            });
            setShowExerciseComplete(true);
          }, 500);
        }
      } else {
        setTimeout(() => {
          const resetCards = memoryCards.map(c => 
            c.id === newFlipped[0] || c.id === newFlipped[1] 
              ? { ...c, isFlipped: false } 
              : c
          );
          setMemoryCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const nextQuestion = () => {
    const exercise = selectedExercise!;
    const questions = getQuestions(exercise.type);
    const question = questions[currentQuestion];
    
    let isCorrect = false;
    if (exercise.type === 'identify_objects' || exercise.type === 'word_recall') {
      isCorrect = selectedAnswer.toLowerCase() === (question.correctAnswer as string).toLowerCase();
    } else if (exercise.type === 'recall_names') {
      isCorrect = selectedAnswer.toLowerCase() === (question.correctAnswer as string).toLowerCase();
    } else if (exercise.type === 'sequence_memory') {
      const userSeq = userSequence.join(',');
      isCorrect = userSeq === question.correctAnswer;
    }

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer('');
      
      if (exercise.type === 'sequence_memory') {
        const nextQ = questions[currentQuestion + 1];
        setSequenceNumbers(nextQ.correctAnswer.split(','));
        setUserSequence([]);
        setShowSequence(true);
        setTimeout(() => setShowSequence(false), 3000);
      }
    } else {
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      addCognitiveResult({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        score: score + (isCorrect ? 1 : 0),
        totalQuestions: questions.length,
        timeTaken,
        date: getTodayDate(),
      });
      setShowExerciseComplete(true);
    }
  };

  const resetExercise = () => {
    setSelectedExercise(null);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer('');
    setUserSequence([]);
    setShowExerciseComplete(false);
    setMemoryCards([]);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMemoryMoves(0);
  };

  const handleNumberClick = (num: string) => {
    setUserSequence(prev => [...prev, num]);
  };

  const getScoreMessage = () => {
    if (selectedExercise?.type === 'memory_match') {
      const percentage = (matchedPairs / EMOJI_PAIRS.length) * 100;
      if (percentage === 100 && memoryMoves <= 8) return { message: 'Perfect! Amazing memory!', emoji: '🏆' };
      if (percentage === 100) return { message: 'Great job! You did it!', emoji: '🌟' };
      return { message: 'Good effort! Try again to improve!', emoji: '💪' };
    }
    const totalQuestions = getQuestions(selectedExercise!.type).length;
    const percentage = (score / totalQuestions) * 100;
    if (percentage === 100) return { message: 'Perfect! Amazing memory!', emoji: '🏆' };
    if (percentage >= 80) return { message: 'Great job! Keep it up!', emoji: '🌟' };
    if (percentage >= 60) return { message: 'Good effort! Practice makes perfect!', emoji: '💪' };
    return { message: 'Nice try! Keep practicing!', emoji: '🎯' };
  };

  if (showExerciseComplete && selectedExercise) {
    const { message, emoji } = getScoreMessage();
    const totalQuestions = selectedExercise.type === 'memory_match' ? EMOJI_PAIRS.length : getQuestions(selectedExercise.type).length;
    const finalScore = selectedExercise.type === 'memory_match' ? matchedPairs : score;

    return (
      <div className="cognitive-page">
        <div className="exercise-complete">
          <div className="complete-icon">{emoji}</div>
          <h2>Exercise Complete!</h2>
          <p className="complete-message">{message}</p>
          
          <div className="score-display">
            <Trophy size={48} color="#F59E0B" />
            <div className="score-text">
              <span className="score-number">{finalScore}</span>
              <span className="score-total">/ {totalQuestions}</span>
            </div>
          </div>
          
          <div className="complete-stats">
            <div className="stat">
              <Clock size={20} />
              <span>Time: {Math.round((Date.now() - startTime) / 1000)}s</span>
            </div>
            <div className="stat">
              <Star size={20} />
              <span>Score: {Math.round((finalScore / totalQuestions) * 100)}%</span>
            </div>
            {selectedExercise.type === 'memory_match' && (
              <div className="stat">
                <Grid size={20} />
                <span>Moves: {memoryMoves}</span>
              </div>
            )}
          </div>
          
          <div className="complete-actions">
            <button onClick={() => startExercise(selectedExercise)} className="btn-retry">
              <RefreshCw size={20} /> Try Again
            </button>
            <button onClick={resetExercise} className="btn-back">
              <ArrowRight size={20} /> Back to Exercises
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedExercise) {
    if (selectedExercise.type === 'memory_match') {
      return (
        <div className="cognitive-page">
          <div className="exercise-header">
            <button onClick={resetExercise} className="back-btn">
              <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} /> Back
            </button>
            <div className="exercise-progress">
              <span>Pairs: {matchedPairs} / {EMOJI_PAIRS.length}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(matchedPairs / EMOJI_PAIRS.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="score-badge">
              <Grid size={16} /> {memoryMoves} moves
            </div>
          </div>

          <div className="memory-game-container">
            <h2>Find all matching pairs!</h2>
            <div className="memory-grid">
              {memoryCards.map(card => (
                <div
                  key={card.id}
                  className={`memory-card ${card.isFlipped || card.isMatched ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
                  onClick={() => handleMemoryCardClick(card.id)}
                >
                  <div className="card-inner">
                    <div className="card-front">❓</div>
                    <div className="card-back">{card.emoji}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    const questions = getQuestions(selectedExercise.type);
    const question = questions[currentQuestion];
    
    return (
      <div className="cognitive-page">
        <div className="exercise-header">
          <button onClick={resetExercise} className="back-btn">
            <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} /> Back
          </button>
          <div className="exercise-progress">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="score-badge">
            <Star size={16} /> {score}
          </div>
        </div>

        <div className="question-container">
          {selectedExercise.type === 'sequence_memory' ? (
            <div className="sequence-question">
              <h2>
                <span style={{ fontSize: '24px' }}>🔢</span>
                {showSequence ? 'Memorize the sequence!' : 'Enter the sequence'}
              </h2>
              
              {showSequence ? (
                <div className="sequence-display">
                  {sequenceNumbers.map((num, idx) => (
                    <span key={idx} className="sequence-number">{num}</span>
                  ))}
                </div>
              ) : (
                <div className="sequence-input">
                  <p className="sequence-hint">Your sequence: {userSequence.join(', ') || 'Tap numbers below'}</p>
                  <div className="number-grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <button
                        key={num}
                        className="number-btn"
                        onClick={() => handleNumberClick(num.toString())}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className="sequence-actions">
                    <button onClick={() => setUserSequence([])} className="clear-btn">Clear</button>
                    <button 
                      onClick={nextQuestion} 
                      className="submit-btn"
                      disabled={userSequence.length === 0}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : selectedExercise.type === 'recall_names' ? (
            <div className="recall-question">
              <h2>
                <span style={{ fontSize: '24px' }}>📝</span>
                {question.question}
              </h2>
              <div className="recall-input">
                <input
                  type="text"
                  value={selectedAnswer}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Type the name..."
                  className="recall-text-input"
                />
                <button 
                  onClick={nextQuestion} 
                  className="submit-btn"
                  disabled={!selectedAnswer.trim()}
                >
                  Submit
                </button>
              </div>
            </div>
          ) : (
            <div className="choice-question">
              <h2>
                {question.image && <span className="question-image">{question.image}</span>}
                {question.question}
              </h2>
              
              <div className="options-grid">
                {question.options?.map((option, idx) => (
                  <button
                    key={idx}
                    className={`option-btn ${selectedAnswer === option ? 'selected' : ''}`}
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={nextQuestion} 
                className="next-btn"
                disabled={!selectedAnswer}
              >
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish'}
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="cognitive-page">
      <div className="cognitive-header">
        <h1><Brain size={28} /> Brain Exercises</h1>
        <p>Keep your mind sharp with daily fun exercises!</p>
      </div>

      <div className="daily-progress">
        <div className="progress-card">
          <div className="progress-icon">
            <Trophy size={32} color="#F59E0B" />
          </div>
          <div className="progress-info">
            <h3>Today's Progress</h3>
            <p>{completedToday} of {EXERCISES.length} exercises completed</p>
          </div>
          <div className="progress-circle">
            <svg viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                strokeDasharray={`${(completedToday / EXERCISES.length) * 100}, 100`}
              />
            </svg>
            <span>{Math.round((completedToday / EXERCISES.length) * 100)}%</span>
          </div>
        </div>
        
        {averageScore > 0 && (
          <div className="average-score">
            <Star size={20} color="#8B5CF6" />
            <span>Today's Average Score: {averageScore}%</span>
          </div>
        )}
      </div>

      <div className="exercises-grid">
        {EXERCISES.map(exercise => {
          const isCompleted = todayExercises.has(exercise.id);
          const result = todayResults.find(r => r.exerciseId === exercise.id);
          
          return (
            <div 
              key={exercise.id} 
              className={`exercise-card ${isCompleted ? 'completed' : ''}`}
              style={{ '--exercise-color': exercise.color } as React.CSSProperties}
            >
              <div className="exercise-icon">
                {exercise.icon}
              </div>
              <div className="exercise-info">
                <h3>{exercise.name}</h3>
                <p>{exercise.description}</p>
                {isCompleted && result && (
                  <div className="exercise-result">
                    <CheckCircle size={16} />
                    <span>Score: {result.score}/{result.totalQuestions}</span>
                  </div>
                )}
              </div>
              <button 
                className="start-btn"
                onClick={() => startExercise(exercise)}
              >
                {isCompleted ? (
                  <>
                    <RefreshCw size={18} /> Try Again
                  </>
                ) : (
                  <>
                    <Play size={18} /> Start
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
