import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Quiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token"); // Get JWT from localStorage

    axios
      .get("http://localhost:8080/api/quizzes", {
        headers: {
          Authorization: `Bearer ${token}`, // Proper Authorization header
        },
      })
      .then((response) => {
        setQuizzes(response.data);
      })
      .catch((error) => {
        console.error("Error fetching quizzes:", error);
        if (error.response?.status === 403 || error.response?.status === 401) {
          alert("Unauthorized! Please login again.");
          navigate("/login");
        }
      });
  }, [navigate]);

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Quizzes</h2>

      {quizzes.length === 0 ? (
        <p>No quizzes found.</p>
      ) : (
        quizzes.map((quiz, index) => (
          <div key={quiz.id} style={{ marginBottom: "20px" }}>
            <h3>
              {index + 1}. {quiz.title}
            </h3>
            <p>{quiz.description}</p>
            <button onClick={() => handleStartQuiz(quiz.id)}>Start Quiz</button>
          </div>
        ))
      )}
    </div>
  );
};

export default Quiz;
