import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Quiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState(""); // Add search state
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
    <div className="container mt-5">
      <h2 className="text-center mb-4">All Quizzes</h2>
      <input
        type="text"
        placeholder="Search quizzes..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="form-control mb-4"
      />
      <div className="quiz-grid">
        {quizzes.filter(quiz =>
          quiz.title.toLowerCase().includes(search.toLowerCase()) ||
          (quiz.description && quiz.description.toLowerCase().includes(search.toLowerCase()))
        ).length === 0 ? (
          <div className="col-12">
            <p className="text-center">No quizzes found.</p>
          </div>
        ) : (
          quizzes
            .filter(quiz =>
              quiz.title.toLowerCase().includes(search.toLowerCase()) ||
              (quiz.description && quiz.description.toLowerCase().includes(search.toLowerCase()))
            )
            .map((quiz) => (
              <div key={quiz.id} className="quiz-card">
                <h3 className="quiz-card-title">{quiz.title}</h3>
                <p className="quiz-card-desc">{quiz.description}</p>
                <button onClick={() => handleStartQuiz(quiz.id)} className="btn btn-primary quiz-card-btn">Start Quiz</button>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Quiz;
