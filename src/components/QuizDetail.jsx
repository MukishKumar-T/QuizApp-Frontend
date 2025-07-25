import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const TIMER_DURATION = 60; // Overall quiz timer in seconds

const QuizDetail = () => {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeUp, setTimeUp] = useState(false); // Track if time expired
  const timerRef = useRef();
  const submittedRef = useRef(submitted); // Track submission status
  const selectedAnswersRef = useRef(selectedAnswers);
  const [currentQuestion, setCurrentQuestion] = useState(0); // Track current question
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION); // Overall quiz timer
  const questionTimerRef = useRef();

  useEffect(() => {
    submittedRef.current = submitted;
  }, [submitted]);

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

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

  // Overall quiz timer effect
  useEffect(() => {
    if (submitted || questions.length === 0) return;
    setTimeLeft(TIMER_DURATION);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!submittedRef.current) {
            handleSubmit(true); // Only call once
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [submitted, questions.length]);

  const handleOptionChange = (questionId, answerId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId,
    });
  };

  const handleSubmit = (fromTimer = false) => {
    if (submittedRef.current) return; // Prevent double submission
    const token = localStorage.getItem("token");
    let userName = null;
    let calculatedScore = 0;

    if (token) {
      const decoded = jwtDecode(token);
      userName = decoded.sub;
    }

    // Use the latest answers if from timer
    const answersToUse = fromTimer ? selectedAnswersRef.current : selectedAnswers;

    questions.forEach((question) => {
      const selectedId = answersToUse[question.id];
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
    clearInterval(timerRef.current); // Stop timer on submit
    if (fromTimer) {
      setTimeUp(true); // Set flag to show message
    }
  };

  // Reset all state on retry
  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
    setTimeUp(false);
    setCurrentQuestion(0);
    setTimeLeft(TIMER_DURATION);
    fetchQuestions();
  };

  // Navigation handlers
  const goToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  const goToPrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  const jumpTo = (idx) => {
    setCurrentQuestion(idx);
  };

  if (questions.length === 0) {
    return <div className="container mt-5 text-center"><p>Loading questions...</p></div>;
  }

  if (submitted) {
    return (
      <div className="container mt-5">
        <div className="card text-center">
          <div className="card-body">
            <h2 className="card-title">Quiz Finished!</h2>
            {timeUp && <p className="text-danger">Time's up!</p>}
            <p className="display-4">Your score: {score} / {questions.length}</p>
            <button onClick={handleRetry} className="btn btn-primary">Retry Quiz</button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="container mt-5">
      <div className="question-card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <div className="circle-timer">{timeLeft}s</div>
        </div>
        <div className="card-body">
          <h4 className="card-title mb-4">{question.questionText}</h4>
          <div className="list-group">
            {Array.isArray(question.answers) && question.answers.map(a => (
              <button
                key={a.id}
                type="button"
                className={`list-group-item list-group-item-action quiz-option ${
                  selectedAnswers[question.id] === a.id ? 'selected' : ''
                }`}
                onClick={() => handleOptionChange(question.id, a.id)}
                style={{ color: 'var(--text-color)' }}
              >
                {a.answerText}
              </button>
            ))}
          </div>
        </div>
        <div className="card-footer d-flex justify-content-between">
          <button onClick={goToPrev} className="btn btn-secondary" disabled={currentQuestion === 0}>Previous</button>
          {
            currentQuestion === questions.length - 1 
            ? <button onClick={() => handleSubmit(false)} className="btn btn-success">Submit</button>
            : <button onClick={goToNext} className="btn btn-primary">Next</button>
          }
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;
