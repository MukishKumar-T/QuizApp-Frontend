import React from "react";
import { useNavigate } from "react-router-dom";

const QuizSelection = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/quiz/sample-id"); // Hardcoded route
  };

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-body">
          <h2 className="text-center mb-4">Select a Quiz</h2>
          <div className="mb-3">
            <label className="form-label">Category:</label>
            <select className="form-select">
              <option>General</option>
              <option>Science</option>
              <option>History</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Quiz:</label>
            <select className="form-select">
              <option>General Knowledge Quiz</option>
              <option>Basic Science Quiz</option>
              <option>World History Quiz</option>
            </select>
          </div>
          <button onClick={handleStart} className="btn btn-primary w-100 mt-3">Start Quiz</button>
        </div>
      </div>
    </div>
  );
};

export default QuizSelection;
