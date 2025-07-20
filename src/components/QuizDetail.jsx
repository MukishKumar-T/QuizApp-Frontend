import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const QuizDetail = () => {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Fetch quiz questions on mount
  const fetchQuestions = () => {
    const token = localStorage.getItem("token");
    axios
      .get(`http://localhost:8080/api/quizzes/quizId/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const data = response.data;
        const loadedQuestions = Array.isArray(data)
          ? data
          : data.questions;
        console.log("Loaded questions:", loadedQuestions);
        setQuestions(loadedQuestions || []);
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
      });
  };

  useEffect(() => {
    fetchQuestions();
  }, [id]);

  const handleOptionChange = (questionId, answerId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId,
    });
  };

  const handleSubmit = () => {
    const token = localStorage.getItem("token");
    let userName = null;
    let calculatedScore = 0;

    if (token) {
      const decoded = jwtDecode(token);
      console.log("Decoded token:", decoded);
      userName = decoded.sub;
    }

    questions.forEach((question) => {
      const selectedId = selectedAnswers[question.id];
      const correctAnswer = Array.isArray(question.answers)
        ? question.answers.find((a) => a.correct)
        : null;

      if (correctAnswer && selectedId === correctAnswer.id) {
        calculatedScore++;
      }
    });

    axios
      .post(
        `http://localhost:8080/quizAttempt/updateScore/${userName}/${id}/${calculatedScore}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => console.log("Score saved successfully"))
      .catch((err) => console.error("Error saving score:", err));

    setScore(calculatedScore);
    setSubmitted(true);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
    fetchQuestions(); // optional: reload fresh questions
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Quiz</h2>

      {questions.length === 0 ? (
        <p>Loading questions or no questions available.</p>
      ) : (
        questions.map((q, index) => (
          <div key={q.id} style={{ marginBottom: "20px" }}>
            <h4>
              {index + 1}. {q.questionText}
            </h4>
            {Array.isArray(q.answers) &&
              q.answers.map((a) => {
                const isChecked = selectedAnswers[q.id] === a.id;
                const correctAnswer = q.answers.find((ans) => ans.correct);

                let style = {};
                if (submitted) {
                  if (a.id === correctAnswer?.id) {
                    style = { color: "green" };
                  } else if (isChecked && a.id !== correctAnswer?.id) {
                    style = { color: "red" };
                  }
                }

                return (
                  <div key={a.id}>
                    <label style={style}>
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={a.id}
                        disabled={submitted}
                        checked={isChecked}
                        onChange={() => handleOptionChange(q.id, a.id)}
                      />
                      {a.answerText}
                    </label>
                  </div>
                );
              })}
          </div>
        ))
      )}

      {questions.length > 0 && !submitted && (
        <button onClick={handleSubmit}>Submit Quiz</button>
      )}

      {submitted && (
        <div style={{ marginTop: "20px" }}>
          <h3>
            Your Score: {score} / {questions.length}
          </h3>
          <button onClick={handleRetry}>Retry Quiz</button>
        </div>
      )}
    </div>
  );
};

export default QuizDetail;
