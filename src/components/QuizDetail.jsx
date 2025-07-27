import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FiClock, FiCheck, FiX, FiChevronLeft, FiChevronRight, FiSave, FiShare2, FiBookmark, FiRefreshCw } from "react-icons/fi";

const TIMER_DURATION = 3600; // Overall quiz timer in seconds

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
      .get(`http://localhost:8080/api/quizzes/quizId/${id}`, {
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
          </div>
        </div>
      </div>
    );
  }

  // Quiz intro screen
  if (!quizStarted) {
    return (
      <div className="container py-4">
        <div className="max-w-3xl mx-auto">
          <div className="card shadow-sm">
            <div className="card-header">
              <h1 className="text-2xl font-bold">Title: {quiz.title}</h1>
              <h1 className="text-2xl font-bold">Category: {quiz.category}</h1>
              {quiz.description && <p className="text-gray-600 mt-2">{quiz.description}</p>}
            </div>
            <div className="card-body space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Questions</div>
                  <div className="text-xl font-semibold">{questions.length}</div>
                </div>
                {quiz.timeLimit && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Time Limit</div>
                    <div className="text-xl font-semibold">{quiz.timeLimit} minutes</div>
                  </div>
                )}
                {quiz.difficulty && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Difficulty</div>
                    <div className="text-xl font-semibold capitalize">{quiz.difficulty}</div>
                  </div>
                )}
                {quiz.category && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Category</div>
                    <div className="text-xl font-semibold">{quiz.category}</div>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-medium mb-3">Instructions:</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Answer all questions to the best of your ability</li>
                  <li>The timer will start when you begin the quiz</li>
                  <li>Once submitted, you cannot change your answers</li>
                </ul>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  onClick={() => navigate(-1)} 
                  className="btn btn-outline"
                >
                  Go Back
                </button>
                <button 
                  onClick={startQuizTimer}
                  className="btn btn-primary"
                >
                  Start Quiz
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
      <div className="max-w-4xl mx-auto">
        <div className="card shadow-sm">
          <div className="card-body p-4 sm:p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Review Your Answers</h2>
              <p className="text-sm text-gray-500">Click on a question to review or change your answer</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentQuestion(index);
                      setShowReview(false);
                    }}
                    className={`p-3 rounded-lg text-center ${
                      selectedAnswers[questions[index]?.id]
                        ? 'bg-green-50 border-2 border-green-200 text-green-700'
                        : 'bg-gray-50 border-2 border-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">Q{index + 1}</div>
                    <div className="text-xs mt-1">
                      {selectedAnswers[questions[index]?.id] ? 'Answered' : 'Not answered'}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between border-t border-gray-200 pt-4">
                <button 
                  onClick={() => setShowReview(false)} 
                  className="btn btn-outline"
                >
                  Back to Quiz
                </button>
                <button 
                  onClick={() => handleSubmit()}
                  className="btn btn-success"
                  disabled={Object.keys(selectedAnswers).length === 0}
                >
                  Submit Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz results screen
  if (submitted) {
    return (
      <div className="container py-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card shadow-sm">
            <div className="card-body space-y-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <div className="text-3xl font-bold text-green-600">{score}%</div>
              </div>
              <h2 className="text-2xl font-bold">Quiz Submitted Successfully!</h2>
              <p className="text-gray-600">
                You scored {score}% on {quiz.title}
              </p>
              
              <div className="grid grid-cols-3 gap-4 my-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600">Correct</div>
                  <div className="text-2xl font-bold">
                    {Math.round((score / 100) * questions.length)}/{questions.length}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600">Score</div>
                  <div className="text-2xl font-bold">{score}%</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-600">Time Taken</div>
                  <div className="text-2xl font-bold">{formatTime(TIMER_DURATION - timeLeft)}</div>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <button 
                  onClick={() => window.location.reload()} 
                  className="btn btn-primary"
                >
                  <FiRefreshCw className="mr-2" /> Retake Quiz
                </button>
                <button className="btn btn-outline">
                  <FiShare2 className="mr-2" /> Share Results
                </button>
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className="btn btn-outline"
                >
                  Back to Dashboard
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
      <div className="container py-6">
        <div className="max-w-md mx-auto text-center">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="text-xl font-semibold mb-4">No Questions Found</h2>
              <p className="text-gray-600 mb-6">This quiz doesn't have any questions yet.</p>
              <button 
                onClick={() => navigate(-1)} 
                className="btn btn-primary"
              >
                Go Back
              </button>
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
