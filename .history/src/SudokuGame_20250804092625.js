import React, { useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Lightbulb, Trophy, Clock, Zap } from 'lucide-react';
import './SudokuGame.scss';

const SudokuGame = () => {
  // (Same code as your original, minus the <style jsx> block)
  // ... [PASTE YOUR JAVASCRIPT LOGIC HERE, REMOVING THE <style jsx>{...}</style> PART!] ...
  // See below for the cleaned-up version!

  // Game state
  const [board, setBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [solution, setSolution] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [initialBoard, setInitialBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [selectedCell, setSelectedCell] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hints, setHints] = useState(3);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isPlaying && !isCompleted) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isCompleted]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if number is valid at position
  const isValidMove = (board, row, col, num) => {
    // Check row
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num) return false;
    }
    // Check column
    for (let i = 0; i < 9; i++) {
      if (board[i][col] === num) return false;
    }
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = boxRow; i < boxRow + 3; i++) {
      for (let j = boxCol; j < boxCol + 3; j++) {
        if (board[i][j] === num) return false;
      }
    }
    return true;
  };

  // Generate complete solved board
  const generateSolvedBoard = () => {
    const board = Array(9).fill().map(() => Array(9).fill(0));
    const solve = (board) => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] === 0) {
            const numbers = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
            for (let num of numbers) {
              if (isValidMove(board, row, col, num)) {
                board[row][col] = num;
                if (solve(board)) return true;
                board[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };
    solve(board);
    return board;
  };

  // Create puzzle by removing numbers
  const createPuzzle = (solvedBoard, difficulty) => {
    const puzzle = solvedBoard.map(row => [...row]);
    const cellsToRemove = { easy: 35, medium: 45, hard: 55 };
    const positions = [];
    for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) positions.push([i, j]);
    positions.sort(() => Math.random() - 0.5);
    for (let i = 0; i < cellsToRemove[difficulty]; i++) {
      const [row, col] = positions[i];
      puzzle[row][col] = 0;
    }
    return puzzle;
  };

  // Start new game
  const startNewGame = useCallback(() => {
    const solvedBoard = generateSolvedBoard();
    const puzzleBoard = createPuzzle(solvedBoard, difficulty);
    setSolution(solvedBoard);
    setBoard(puzzleBoard);
    setInitialBoard(puzzleBoard.map(row => [...row]));
    setSelectedCell(null);
    setMistakes(0);
    setIsCompleted(false);
    setTime(0);
    setIsPlaying(true);
    setHints(difficulty === 'easy' ? 5 : difficulty === 'medium' ? 3 : 1);
  }, [difficulty]);

  // Check if puzzle is completed
  const checkCompletion = (currentBoard) => {
    for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if (currentBoard[i][j] === 0) return false;
    return true;
  };

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (initialBoard[row][col] === 0 && !isCompleted) setSelectedCell([row, col]);
  };

  // Handle number input
  const handleNumberInput = (num) => {
    if (!selectedCell || isCompleted) return;
    const [row, col] = selectedCell;
    if (initialBoard[row][col] !== 0) return;
    const newBoard = board.map(r => [...r]);
    if (num === 0) {
      newBoard[row][col] = 0;
    } else {
      newBoard[row][col] = num;
      if (solution[row][col] !== num) setMistakes(prev => prev + 1);
    }
    setBoard(newBoard);
    if (checkCompletion(newBoard)) {
      setIsCompleted(true);
      setIsPlaying(false);
    }
  };

  // Get hint
  const getHint = () => {
    if (hints <= 0 || !selectedCell || isCompleted) return;
    const [row, col] = selectedCell;
    if (initialBoard[row][col] !== 0) return;
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = solution[row][col];
    setBoard(newBoard);
    setHints(prev => prev - 1);
    if (checkCompletion(newBoard)) {
      setIsCompleted(true);
      setIsPlaying(false);
    }
  };

  // Reset board
  const resetBoard = () => {
    setBoard(initialBoard.map(row => [...row]));
    setSelectedCell(null);
    setMistakes(0);
    setTime(0);
    setIsCompleted(false);
    setIsPlaying(true);
  };

  // Keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedCell || isCompleted) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) handleNumberInput(num);
      else if (e.key === 'Backspace' || e.key === 'Delete') handleNumberInput(0);
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedCell, board, solution, initialBoard, isCompleted]);

  // Get cell classes
  const getCellClasses = (row, col, value) => {
    let classes = 'sudoku-cell';
    if (initialBoard[row][col] !== 0) classes += ' given';
    if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) classes += ' selected';
    if (selectedCell && (selectedCell[0] === row || selectedCell[1] === col)) classes += ' highlighted';
    if (selectedCell && Math.floor(selectedCell[0] / 3) === Math.floor(row / 3) && Math.floor(selectedCell[1] / 3) === Math.floor(col / 3)) classes += ' box-highlighted';
    if (value !== 0 && selectedCell && board[selectedCell[0]][selectedCell[1]] === value) classes += ' same-number';
    if (value !== 0 && solution[row][col] !== value) classes += ' incorrect';
    return classes;
  };

  // Start new game on mount
  useEffect(() => {
    startNewGame();
    // eslint-disable-next-line
  }, [startNewGame]);

  return (
    <div className="sudoku-container">
      <div className="game-header">
        <h1 className="game-title">🧩 LEGENDARY SUDOKU</h1>
      </div>

      <div className="game-stats">
        <div className="stat-item">
          <Clock size={20} />
          {formatTime(time)}
        </div>
        <div className="stat-item">
          <Zap size={20} />
          Mistakes: {mistakes}
        </div>
        <div className="stat-item">
          <Lightbulb size={20} />
          Hints: {hints}
        </div>
      </div>

      <div className="difficulty-selector">
        {['easy', 'medium', 'hard'].map(level => (
          <button
            key={level}
            className={`difficulty-btn ${difficulty === level ? 'active' : ''}`}
            onClick={() => setDifficulty(level)}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      <div className="sudoku-board">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClasses(rowIndex, colIndex, cell)}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell !== 0 ? cell : ''}
            </div>
          ))
        )}
      </div>

      <div className="number-pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            className="number-btn"
            onClick={() => handleNumberInput(num)}
          >
            {num}
          </button>
        ))}
        <button
          className="number-btn"
          onClick={() => handleNumberInput(0)}
        >
          ❌
        </button>
      </div>

      <div className="control-buttons">
        <button className="control-btn" onClick={startNewGame}>
          <Play size={20} />
          New Game
        </button>
        <button className="control-btn" onClick={resetBoard}>
          <RotateCcw size={20} />
          Reset
        </button>
        <button 
          className="control-btn" 
          onClick={getHint}
          disabled={hints <= 0 || !selectedCell}
        >
          <Lightbulb size={20} />
          Hint ({hints})
        </button>
        <button className="control-btn">
          <Trophy size={20} />
          Score: {Math.max(0, 1000 - mistakes * 50 - Math.floor(time / 10))}
        </button>
      </div>

      {isCompleted && (
        <div className="completion-modal">
          <div className="completion-content">
            <div className="completion-title">🎉 LEGENDARY! 🎉</div>
            <div className="completion-stats">
              <div>Time: {formatTime(time)}</div>
              <div>Mistakes: {mistakes}</div>
              <div>Difficulty: {difficulty}</div>
              <div>Score: {Math.max(0, 1000 - mistakes * 50 - Math.floor(time / 10))}</div>
            </div>
            <button className="control-btn" onClick={startNewGame}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SudokuGame;