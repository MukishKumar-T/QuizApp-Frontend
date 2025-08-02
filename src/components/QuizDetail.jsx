import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FiClock, FiCheck, FiX, FiChevronLeft, FiChevronRight, FiSave, FiShare2, FiBookmark, FiRefreshCw } from "react-icons/fi";

const TIMER_DURATION = 60; // Overall quiz timer in seconds

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState({ title: '', description: '' });
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const timerRef = useRef();
  const submittedRef = useRef(submitted);
  const selectedAnswersRef = useRef(selectedAnswers);

  useEffect(() => {
    submittedRef.current = submitted;
  }, [submitted]);

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  // Fetch quiz data and questions
  const fetchQuizData = () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    
    axios
      .get(`https://quiz-backend-3ws6.onrender.com/api/quizzes/quizId/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const data = response.data;
        if (Array.isArray(data)) {
          setQuestions(data);
          setQuiz({ title: 'Quiz', description: '' });
        } else {
          setQuiz({
            title: data.title || 'Untitled Quiz',
            description: data.description || '',
            category: data.category,
            difficulty: data.difficulty,
            timeLimit: data.timeLimit
          });
          setQuestions(data.questions || []);
        }
      })
      .catch((error) => {
        console.error("Error fetching quiz data:", error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuizData();
  }, [id]);

  // Start quiz timer when quiz begins
  const startQuizTimer = () => {
    setQuizStarted(true);
    setTimeLeft(quiz.timeLimit * 60 || TIMER_DURATION); // Convert minutes to seconds if timeLimit exists
    
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!submittedRef.current) {
            handleSubmit(true); // Auto-submit when time's up
          }
          setTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const handleOptionChange = (questionId, answerId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId,
    });
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Submit quiz
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
    let correctCount = 0;

    questions.forEach((question) => {
      const selectedId = answersToUse[question.id];
      const correctAnswer = question.answers ? question.answers.find((a) => a.correct) : null;
      if (correctAnswer && selectedId === correctAnswer.id) {
        calculatedScore++;
      }
    });

    axios
      .post(
        `https://quiz-backend-3ws6.onrender.com/quizAttempt/updateScore/${userName}/${id}/${calculatedScore}`,
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
    fetchQuizData();
  };

  // Navigation handlers
  const goToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };
  
  const goToPrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
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
            <h1 className="card-title">Your score: {score} / {questions.length}</h1>
            <br />
            <p className="display-8">Question Answered: {currentQuestion + 1} / {questions.length}</p>
            <p className="display-8">Questions Correct: {score} / {questions.length}</p>
            <p className="display-8">Questions Incorrect: {currentQuestion + 1 - score} / {questions.length}</p>
            <button onClick={handleRetry} className="btn btn-primary">Retry Quiz</button>
            <p></p>
            <button onClick={() => navigate(-1)} className="btn btn-primary">Back to Quizzes</button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz intro screen
  if (!quizStarted) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="app-card p-4 mb-4">
              <h1 className="display-5 fw-bold text-primary mb-3">{quiz.title}</h1>
              {quiz.description && <p className="lead text-muted mb-4">{quiz.description}</p>}
              
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="app-card p-3 h-100">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                        <i className="bi bi-question-circle text-primary fs-4"></i>
                      </div>
                      <div>
                        <div className="text-muted small">Questions</div>
                        <div className="h4 fw-bold">{questions.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {quiz.timeLimit && (
                  <div className="col-md-6">
                    <div className="app-card p-3 h-100">
                      <div className="d-flex align-items-center">
                        <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                          <i className="bi bi-clock-history text-warning fs-4"></i>
                        </div>
                        <div>
                          <div className="text-muted small">Time Limit</div>
                          <div className="h4 fw-bold">{quiz.timeLimit} minutes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {quiz.difficulty && (
                  <div className="col-md-6">
                    <div className="app-card p-3 h-100">
                      <div className="d-flex align-items-center">
                        <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                          <i className={`bi bi-${quiz.difficulty === 'easy' ? 'emoji-smile' : quiz.difficulty === 'medium' ? 'emoji-neutral' : 'emoji-frown'} text-info fs-4`}></i>
                        </div>
                        <div>
                          <div className="text-muted small">Difficulty</div>
                          <div className="h4 fw-bold text-capitalize">{quiz.difficulty}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {quiz.category && (
                  <div className="col-md-6">
                    <div className="app-card p-3 h-100">
                      <div className="d-flex align-items-center">
                        <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                          <i className="bi bi-tag text-success fs-4"></i>
                        </div>
                        <div>
                          <div className="text-muted small">Category</div>
                          <div className="h4 fw-bold">{quiz.category}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="app-card p-4 mb-4">
                <h3 className="h5 fw-bold mb-3">
                  <i className="bi bi-info-circle me-2 text-primary"></i>
                  Instructions
                </h3>
                <ul className="">
                  <li className="mb-2 list-group-item">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Answer all questions to the best of your ability
                  </li>
                  <li className="mb-2 list-group-item">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    The timer will start when you begin the quiz
                  </li>
                  <li className="mb-2 list-group-item">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Once submitted, you cannot change your answers
                  </li>
                </ul>
              </div>
              
              <div className="d-flex justify-content-between pt-3">
                <button 
                  onClick={() => navigate(-1)} 
                  className="app-btn-outline"
                >
                  <i className="bi bi-arrow-left me-2"></i>Go Back
                </button>
                <button 
                  onClick={startQuizTimer}
                  className="app-btn-primary"
                >
                  Start Quiz <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz review screen
  if (showReview) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="app-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h2 className="h3 fw-bold mb-1">Review Your Answers</h2>
                  <p className="text-muted mb-0">Click on a question to review or change your answer</p>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary bg-opacity-10 text-primary me-2">
                    {Object.keys(selectedAnswers).length} / {questions.length} answered
                  </span>
                </div>
              </div>
              
              <div className="row g-3 mb-4">
                {questions.map((_, index) => (
                  <div key={index} className="col-6 col-md-4 col-lg-3">
                    <button
                      onClick={() => {
                        setCurrentQuestion(index);
                        setShowReview(false);
                      }}
                      className={`w-100 p-3 text-center app-card ${
                        selectedAnswers[questions[index]?.id]
                          ? 'border-2 border-success bg-success bg-opacity-5'
                          : 'border-2 border-light'
                      }`}
                    >
                      <div className="d-flex align-items-center justify-content-center">
                        {selectedAnswers[questions[index]?.id] ? (
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                        ) : (
                          <i className="bi bi-circle text-muted me-2"></i>
                        )}
                        <span className="fw-medium">Question {index + 1}</span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="d-flex justify-content-between border-top pt-4">
                <button 
                  onClick={() => setShowReview(false)} 
                  className="app-btn-outline"
                >
                  <i className="bi bi-arrow-left me-2"></i>Back to Quiz
                </button>
                <div>
                  <button 
                    onClick={() => handleSubmit()}
                    className={`app-btn-${Object.keys(selectedAnswers).length === 0 ? 'secondary' : 'success'}`}
                    disabled={Object.keys(selectedAnswers).length === 0}
                  >
                    <i className="bi bi-send-check me-2"></i>
                    {Object.keys(selectedAnswers).length === 0 ? 'No Answers Yet' : 'Submit Quiz'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz results screen
  if (submitted) {
    const correctCount = Math.round((score / 100) * questions.length);
    const incorrectCount = questions.length - correctCount;
    
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="app-card p-4 text-center">
              <div className="mb-4">
                <div className="position-relative d-inline-block">
                  <div className="position-relative">
                    <div className="d-flex align-items-center justify-content-center" style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)',
                      margin: '0 auto 1.5rem',
                      boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
                    }}>
                      <div className="text-white">
                        <div className="display-4 fw-bold">{score}%</div>
                        <div className="small">Score</div>
                      </div>
                    </div>
                    {score >= 70 ? (
                      <div className="position-absolute top-0 end-0 bg-success rounded-circle p-2" style={{
                        width: '50px',
                        height: '50px',
                        transform: 'translate(10px, -10px)'
                      }}>
                        <i className="bi bi-trophy-fill text-white fs-4"></i>
                      </div>
                    ) : null}
                  </div>
                </div>
                
                <h2 className="h1 fw-bold text-primary mb-3">Quiz Completed!</h2>
                <p className="lead text-muted mb-4">
                  You scored {score}% on <span className="fw-bold">{quiz.title}</span>
                </p>
              </div>
              
              <div className="row g-4 mb-5">
                <div className="col-md-4">
                  <div className="app-card h-100 p-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                        <i className="bi bi-check-circle-fill text-success fs-4"></i>
                      </div>
                      <div>
                        <div className="text-muted small">Correct</div>
                        <div className="h4 fw-bold text-success">{correctCount}/{questions.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="app-card h-100 p-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                        <i className="bi bi-x-circle-fill text-danger fs-4"></i>
                      </div>
                      <div>
                        <div className="text-muted small">Incorrect</div>
                        <div className="h4 fw-bold text-danger">{incorrectCount}/{questions.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-4">


                  <div className="app-card h-100 p-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                        <i className="bi bi-clock-history text-info fs-4"></i>
                      </div>
                      <div>
                        <div className="text-muted small">Time Taken</div>
                        <div className="h4 fw-bold">{formatTime(TIMER_DURATION - timeLeft)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <button 
                  onClick={() => window.location.reload()} 
                  className="app-btn-primary"
                >
                  <i className="bi bi-arrow-repeat me-2"></i>Retake Quiz
                </button>
                <button className="app-btn-outline">
                  <i className="bi bi-share me-2"></i>Share Results
                </button>
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="app-btn-outline"
                >
                  <i className="bi bi-speedometer2 me-2"></i>Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No questions state
  if (questions.length === 0) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="app-card p-5 text-center">
              <div className="mb-4">
                <i className="bi bi-question-circle display-1 text-muted"></i>
              </div>
              <h2 className="h3 fw-bold mb-3">No Questions Available</h2>
              <p className="text-muted mb-4">
                This quiz doesn't have any questions yet. Please check back later or try another quiz.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <button 
                  onClick={() => navigate(-1)} 
                  className="app-btn-outline"
                >
                  <i className="bi bi-arrow-left me-2"></i>Go Back
                </button>
                <button 
                  onClick={() => navigate('/quizzes')} 
                  className="app-btn-primary"
                >
                  <i className="bi bi-collection me-2"></i>Browse Quizzes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  
  return (
    <div className="quiz-container">
      <div className="quiz-content">
        {/* Quiz Header */}
        <div className="quiz-header">
          <h1 className="quiz-title">{quiz.title}</h1>
        </div>
        
        {/* Progress Bar */}
        <div className="quiz-progress">
          <div 
            className="quiz-progress-bar" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        
        {/* Question Card */}
        <div className="quiz-card">
          <div className="quiz-card-body">
            <div className="quiz-question-header">
              <div className="quiz-question-content">
                <div className="quiz-question-meta">
                  <span className="quiz-question-number">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <div className="quiz-timer">
                    <FiClock className="quiz-timer-icon" />
                    <span className="quiz-timer-text">{formatTime(timeLeft)}</span>
                  </div>
                </div>
                <h2 className="quiz-question-text">{currentQ.questionText}</h2>
              </div>
              {currentQ.points > 0 && (
                <span className="quiz-points">
                  {currentQ.points} {currentQ.points === 1 ? 'point' : 'points'}
                </span>
              )}
            </div>
            
            {/* Options */}
            <div className="quiz-options">
              {currentQ.answers.map((answer) => (
                <div 
                  key={answer.id}
                  onClick={() => handleOptionChange(currentQ.id, answer.id)}
                  className={`quiz-option ${selectedAnswers[currentQ.id] === answer.id ? 'selected' : ''}`}
                >
                  <div className="quiz-option-content">
                    <div className={`quiz-option-radio ${selectedAnswers[currentQ.id] === answer.id ? 'selected' : ''}`}>
                      {selectedAnswers[currentQ.id] === answer.id && <FiCheck />}
                    </div>
                    <div className="quiz-option-text">{answer.answerText}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Navigation Buttons */}
            <div className="quiz-navigation">
              <div className="quiz-nav-buttons">
                <button 
                  onClick={() => setShowReview(true)}
                  className="btn btn-outline"
                >
                  Review Quiz
                </button>
                
                <div className="quiz-nav-controls">
                  <button 
                    onClick={goToPrev}
                    disabled={currentQuestion === 0}
                    className="btn btn-outline"
                  >
                    <FiChevronLeft className="icon-left" /> Previous
                  </button>
                  
                  {currentQuestion < questions.length - 1 ? (
                    <button 
                      onClick={goToNext}
                      disabled={!selectedAnswers[currentQ.id]}
                      className="btn btn-primary"
                    >
                      Next <FiChevronRight className="icon-right" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleSubmit()}
                      disabled={!selectedAnswers[currentQ.id]}
                      className="btn btn-success"
                    >
                      Submit Quiz
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Question Progress */}
        <div className="quiz-progress-text">
          {currentQuestion + 1} of {questions.length} questions • {Object.keys(selectedAnswers).length} answered
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;
