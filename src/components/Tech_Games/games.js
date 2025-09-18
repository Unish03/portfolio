import React, { useState, useEffect, useRef, useCallback } from 'react';
import './games.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const wordList = [
  { scrambled: 'otcerRa', answer: 'React' },
  { scrambled: 'iNojtsx', answer: 'JSX' },
  { scrambled: 'gnodroA', answer: 'Android' },
  { scrambled: 'tSvicperi', answer: 'TypeScript' },
  { scrambled: 'dBgoMo', answer: 'MongoDB' },
];

const TOTAL_LIVES = 3;
const WORD_TIME_LIMIT = 20; // seconds

function Games() {
  const [index, setIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState(wordList[0]);
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(TOTAL_LIVES);
  const [timer, setTimer] = useState(WORD_TIME_LIMIT);
  const [hint, setHint] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState(() => {
    return JSON.parse(localStorage.getItem('tech-anagram-leaderboard')) || [];
  });

  const intervalRef = useRef(null);

  // Set word and reset state on index change
  useEffect(() => {
    setCurrentWord(wordList[index]);
    setGuess('');
    setMessage('');
    setLives(TOTAL_LIVES);
    setHint('');
    setTimer(WORD_TIME_LIMIT);
  }, [index]);

  // End game, store score in leaderboard
  const endGame = useCallback(() => {
    const newEntry = { score, date: new Date().toLocaleString() };
    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    localStorage.setItem('tech-anagram-leaderboard', JSON.stringify(updatedLeaderboard));
    setLeaderboard(updatedLeaderboard);
    setShowLeaderboard(true);
  }, [leaderboard, score]);

  // Move to next word
  const handleNext = useCallback(() => {
    if (index + 1 < wordList.length) {
      setIndex(index + 1);
    } else {
      endGame();
    }
  }, [index, endGame]);

  // Skip word due to time or attempts
  const handleSkip = useCallback((skipMessage) => {
    toast.warn(skipMessage);
    setMessage(skipMessage);
    clearInterval(intervalRef.current);

    setTimeout(() => {
      setMessage('');
      handleNext();
    }, 2500);
  }, [handleNext]);

  // Countdown timer effect
  useEffect(() => {
    if (index >= wordList.length) return;

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          //handleSkip('⏰ Time’s up!');
          return WORD_TIME_LIMIT;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [index, handleSkip]);

  // Check user guess submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (guess.trim().toLowerCase() === currentWord.answer.toLowerCase()) {
      setMessage('✅ Correct!');
      setScore(score + 1);
      toast.success('✅ Correct!');
      clearInterval(intervalRef.current);
      setTimeout(() => handleNext(), 1000);
    } else {
      const updatedLives = lives - 1;
      setLives(updatedLives);
      setMessage(`❌ Wrong! ${updatedLives} lives left.`);
      toast.error(`❌ Wrong! ${updatedLives} lives left.`);
      if (updatedLives <= 0) {
        handleSkip('💀 Out of attempts!');
      }
    }
  };

  // Show hint - first letter of answer
  const handleHint = () => {
    const firstLetter = currentWord.answer.charAt(0);
    const reversedWord = currentWord.answer.split('').reverse().join('');
    const hintMsg = `💡 Hint: Starts with "${firstLetter}"`;
    setHint(`💡 Starts with "${firstLetter}" | Reversed: "${reversedWord}"`);
    toast.info(hintMsg);
  };

return (
  <div className="Games">
    <h1>🧠 Tech Game</h1>

    {showLeaderboard && (
      <h2>🎉 Game Over! Your Score: {score}</h2>
        )}
      <>
        <h3>🏅 Top Scores</h3>
        <ul className="leaderboard">
          {leaderboard.map((entry, i) => (
            <li key={i}>
              {entry.score} pts - <span>{entry.date}</span>
            </li>
          ))}
        </ul>
      </>

    {!showLeaderboard && (
      <>
        <h2>🔀 Scrambled: <span className="scrambled">{currentWord.scrambled}</span></h2>
        <h3>⏱ Time Left: {timer}s | ❤️ Lives: {lives} | 🏆 Score: {score}</h3>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Your guess..."
            autoFocus
          />
          <button type="submit">Check</button>
        </form>

        <p>{message}</p>
        {hint && <p className="hint">{hint}</p>}
        <button type="button" onClick={handleHint}>💡 Hint</button>
      </>
    )}

    <ToastContainer position="top-center" autoClose={2000} />
  </div>
);
}

export default Games;
