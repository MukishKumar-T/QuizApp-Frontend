import React from "react";
import { useNavigate } from "react-router-dom";

const QuizSelection = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/quiz/sample-id"); // Hardcoded route
  };

  return (
    <div className="container py-4">
      <div className="app-card p-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 className="text-center mb-4 text-primary">Select a Quiz</h2>
        <div className="mb-4">
          <label className="form-label fw-medium text-muted mb-2">Category:</label>
          <select className="form-select app-form-control p-3">
            <option>General</option>
            <option>Science</option>
            <option>History</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="form-label fw-medium text-muted mb-2">Quiz:</label>
          <select className="form-select app-form-control p-3">
            <option>General Knowledge Quiz</option>
            <option>Basic Science Quiz</option>
            <option>World History Quiz</option>
          </select>
        </div>
        <button 
          onClick={handleStart} 
          className="app-btn-primary w-100 py-3 mt-2"
          style={{ fontSize: '1.1rem' }}
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizSelection;
