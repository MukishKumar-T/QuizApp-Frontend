import React from "react";
import { useNavigate } from "react-router-dom";

const QuizSelection = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/quiz/sample-id"); // Hardcoded route
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Select a Quiz</h2>

      <div style={{ marginBottom: "20px" }}>
        <label>Category: </label>
        <select>
          <option>General</option>
          <option>Science</option>
          <option>History</option>
        </select>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>Quiz: </label>
        <select>
          <option>General Knowledge Quiz</option>
          <option>Basic Science Quiz</option>
          <option>World History Quiz</option>
        </select>
      </div>

      <button onClick={handleStart}>Start Quiz</button>
    </div>
  );
};

export default QuizSelection;
