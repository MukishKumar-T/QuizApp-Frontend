import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2, FiArrowLeft } from "react-icons/fi";

const ContributeQuiz = () => {
  const [quizData, setQuizData] = useState({
    title: "",
    category: "",
    questions: [
      {
        questionText: "",
        options: ["", "", "", ""],
        correctOption: 0,
      },
    ],
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuizData({
      ...quizData,
      [name]: value,
    });
  };

  const handleQuestionChange = (index, e) => {
    const { name, value } = e.target;
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [name]: name === "correctOption" ? parseInt(value) : value,
    };
    setQuizData({
      ...quizData,
      questions: updatedQuestions,
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuizData({
      ...quizData,
      questions: updatedQuestions,
    });
  };

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          questionText: "",
          options: ["", "", "", ""],
          correctOption: 0,
        },
      ],
    });
  };

  const removeQuestion = (index) => {
    if (quizData.questions.length > 1) {
      const updatedQuestions = [...quizData.questions];
      updatedQuestions.splice(index, 1);
      setQuizData({
        ...quizData,
        questions: updatedQuestions,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!quizData.title.trim() || !quizData.category.trim()) {
      setMessage("Please fill in all required fields");
      return;
    }

    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      if (!q.questionText.trim() || q.options.some(opt => !opt.trim())) {
        setMessage("Please fill in all question fields and options");
        return;
      }
    }

    setIsSubmitting(true);
    setMessage("");
    
    try {
      // Transform the data to match the backend's expected format
      const submissionData = {
        title: quizData.title,
        category: quizData.category,
        questions: quizData.questions.map(question => ({
          questionText: question.questionText,
          answers: question.options.map((option, index) => ({
            answerText: option,
            correct: index === question.correctOption
          }))
        }))
      };

      const token = localStorage.getItem("token");
      await axios.post(
        "https://quiz-backend-3ws6.onrender.com/api/quizzes/submit",
        submissionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      setMessage("Quiz submitted for approval! Thank you for your contribution.");
      // Reset form
      setQuizData({
        title: "",
        category: "",
        questions: [
          {
            questionText: "",
            options: ["", "", "", ""],
            correctOption: 0,
          },
        ],
      });
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
      
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setMessage(
        error.response?.data?.message || "Failed to submit quiz. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-4">
        <button 
          onClick={() => navigate(-1)}
          className="btn btn-outline-secondary me-3 d-flex align-items-center"
        >
          <FiArrowLeft className="me-1" /> Back
        </button>
        <h2 className="mb-0">Contribute a Quiz</h2>
      </div>
      
      <div className="app-card p-4 mb-4">
        {message && (
          <div 
            className={`alert ${
              message.includes('success') ? 'alert-success' : 'alert-danger'
            } mb-4`}
            role="alert"
          >
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-bold text-dark mb-2 fs-5">Quiz Title *</label>
            <input
              type="text"
              className="form-control app-form-control p-3 fs-5"
              name="title"
              value={quizData.title}
              onChange={handleChange}
              placeholder="Enter quiz title"
              style={{ color: 'black' }}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="form-label fw-bold text-dark mb-2 fs-5">Category *</label>
            <input
              type="text"
              className="form-control app-form-control p-3 fs-5"
              name="category"
              value={quizData.category}
              onChange={handleChange}
              placeholder="e.g., Science, History, General Knowledge"
              style={{ color: 'black' }}
              required
            />
          </div>
          
          <div className="mb-4">
            <h5 className="mb-3 text-primary">Questions</h5>
            {quizData.questions.map((question, qIndex) => (
              <div key={qIndex} className="app-card p-4 mb-4 position-relative">
                {quizData.questions.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger position-absolute"
                    style={{ top: '10px', right: '10px' }}
                    onClick={() => removeQuestion(qIndex)}
                  >
                    <FiTrash2 />
                  </button>
                )}
                
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark mb-2 fs-5">
                    Question {qIndex + 1} *
                  </label>
                  <input
                    type="text"
                    className="form-control app-form-control p-3 mb-3 fs-5"
                    name="questionText"
                    value={question.questionText}
                    onChange={(e) => handleQuestionChange(qIndex, e)}
                    placeholder="Enter your question here"
                    style={{ color: 'black' }}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-2 fs-5">
                    Options * (Select the correct answer)
                  </label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="d-flex align-items-center mb-3">
                      <div className="form-check me-3">
                        <input
                          type="radio"
                          name={`correctOption-${qIndex}`}
                          className="form-check-input"
                          style={{ width: '20px', height: '20px' }}
                          checked={question.correctOption === oIndex}
                          onChange={() => {
                            const e = {
                              target: { name: "correctOption", value: oIndex },
                            };
                            handleQuestionChange(qIndex, e);
                          }}
                          required
                        />
                      </div>
                      <input
                        type="text"
                        className="form-control app-form-control p-3 fs-5"
                        placeholder={`Option ${oIndex + 1}`}
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(qIndex, oIndex, e.target.value)
                        }
                        style={{ color: 'black' }}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="d-flex justify-content-between align-items-center mt-4">
              <button
                type="button"
                className="btn btn-outline-primary d-flex align-items-center"
                onClick={addQuestion}
              >
                <FiPlus className="me-1" /> Add Another Question
              </button>
              
              <div>
                <button
                  type="submit"
                  className="app-btn-primary px-4 py-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContributeQuiz;
