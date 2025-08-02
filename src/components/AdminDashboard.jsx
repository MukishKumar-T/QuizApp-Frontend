import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

// Helper component for the pending quizzes tab
const PendingQuizzesTab = ({ pendingQuizzes, onApprove, onReject }) => (
  <div className="table-responsive">
    <table className="table table-striped">
      <thead>
        <tr>
          <th>Title</th>
          <th>Category</th>
          <th>Submitted By</th>
          <th>Questions</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {pendingQuizzes.length === 0 ? (
          <tr>
            <td colSpan="5" className="text-center">No pending quizzes</td>
          </tr>
        ) : (
          pendingQuizzes.map((quiz) => (
            <tr key={quiz.id}>
              <td>{quiz.title}</td>
              <td>{quiz.category}</td>
              <td>{quiz.contributor?.name || 'Unknown'}</td>
              <td>{quiz.questions?.length || 0}</td>
              <td>
                <button 
                  className="btn btn-success btn-sm me-2"
                  onClick={() => onApprove(quiz.id)}
                >
                  Approve
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => onReject(quiz.id)}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manage'); // 'pending', 'manage', or 'add'
  const [pendingQuizzes, setPendingQuizzes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [newQuiz, setNewQuiz] = useState({ title: "", category: "" });
  const [newQuestion, setNewQuestion] = useState({ questionText: "" });
  const [newAnswer, setNewAnswer] = useState({ answerText: "", correct: false });
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [message, setMessage] = useState('');
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  
  // Add New Quiz state
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const axiosAuth = axios.create({
    baseURL: "https://quiz-backend-3ws6.onrender.com",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // Fetch all approved quizzes
  const fetchQuizzes = async () => {
    try {
      const res = await axiosAuth.get("/api/quizzes");
      setQuizzes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setMessage("Failed to fetch approved quizzes");
    }
  };

  // Fetch pending quizzes
  const fetchPendingQuizzes = async () => {
    try {
      const res = await axiosAuth.get("/api/admin/quiz-approvals/pending");
      setPendingQuizzes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setMessage("Failed to fetch pending quizzes");
    }
  };

  // Approve a quiz
  const handleApproveQuiz = async (quizId) => {
    try {
      await axiosAuth.post(`/api/admin/quiz-approvals/${quizId}/approve`);
      setMessage("Quiz approved successfully!");
      fetchPendingQuizzes();
      fetchQuizzes();
    } catch (err) {
      setMessage("Failed to approve quiz");
    }
  };

  // Reject a quiz
  const handleRejectQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to reject this quiz? This action cannot be undone.")) {
      try {
        await axiosAuth.delete(`/api/admin/quiz-approvals/${quizId}`);
        setMessage("Quiz rejected successfully!");
        fetchPendingQuizzes();
      } catch (err) {
        setMessage("Failed to reject quiz");
      }
    }
  };

  // Delete a quiz
  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      try {
        await axiosAuth.delete(`/api/quizzes/${quizId}`);
        setMessage("Quiz deleted successfully!");
        fetchQuizzes(); // Refresh the quizzes list
      } catch (err) {
        setMessage("Failed to delete quiz");
      }
    }
  };

  useEffect(() => {
    fetchQuizzes();
    fetchPendingQuizzes();
  }, []);

  const fetchQuestions = async (quizId) => {
    try {
      const res = await axiosAuth.get(`/api/quizzes/quizId/${quizId}`);
      const questionList = Array.isArray(res.data) ? res.data : [res.data];
      setQuestions(questionList);
    } catch {
      alert("Failed to fetch questions");
    }
  };

  const fetchAnswers = async (questionId) => {
    try {
      const res = await axiosAuth.get(`/api/answers/question/${questionId}`);
      const answerList = Array.isArray(res.data) ? res.data : [res.data];
      setAnswers(answerList);
    } catch {
      alert("Failed to fetch answers");
    }
  };

  const createQuiz = async () => {
    try {
      await axiosAuth.post("/api/quizzes", newQuiz);
      alert("Quiz created!");
      setNewQuiz({ title: "", category: "" });
      fetchQuizzes();
    } catch {
      alert("Failed to create quiz");
    }
  };

  const addQuestion = async () => {
    try {
      await axiosAuth.post(`/api/questions/${selectedQuizId}`, newQuestion);
      alert("Question added!");
      setNewQuestion({ questionText: "" });
      fetchQuestions(selectedQuizId);
    } catch {
      alert("Failed to add question");
    }
  };

  const addAnswer = async () => {
    try {
      await axiosAuth.post(`/api/answers/${selectedQuestionId}`, newAnswer);
      alert("Answer added!");
      setNewAnswer({ answerText: "", correct: false });
      fetchAnswers(selectedQuestionId);
    } catch {
      alert("Failed to add answer");
    }
  };

  const updateQuestion = async (question) => {
    try {
      await axiosAuth.put(`/api/questions/${question.id}`, question);
      alert("Question updated!");
      fetchQuestions(selectedQuizId);
    } catch {
      alert("Failed to update question");
    }
  };

  const deleteQuestion = async (questionId) => {
    if (window.confirm("Delete this question?")) {
      try {
        await axiosAuth.delete(`/api/questions/${questionId}`);
        fetchQuestions(selectedQuizId);
      } catch {
        alert("Failed to delete question");
      }
    }
  };

  const updateAnswer = async (answer) => {
    try {
      await axiosAuth.put(`/api/answers/${answer.id}`, answer);
      alert("Answer updated!");
      fetchAnswers(selectedQuestionId);
    } catch {
      alert("Failed to update answer");
    }
  };

  const deleteAnswer = async (answerId) => {
    if (window.confirm("Delete this answer?")) {
      try {
        await axiosAuth.delete(`/answers/${answerId}`);
        fetchAnswers(selectedQuestionId);
      } catch {
        alert("Failed to delete answer");
      }
    }
  };

  // Quiz editing functions
  const handleViewDetails = async (quizId) => {
    console.log("handleViewDetails called with quizId:", quizId);
    try {
      console.log("Making API call to:", `/api/quizzes/${quizId}`);
      const response = await axiosAuth.get(`/api/quizzes/${quizId}`);
      console.log("API response:", response.data);
      const quiz = response.data;
      setSelectedQuiz(quiz);
      setEditingQuiz({
        id: quiz.id,
        title: quiz.title,
        category: quiz.category,
        questions: quiz.questions || []
      });
      setShowEditForm(true);
      console.log("Edit form should now be visible");
    } catch (error) {
      console.error("Error fetching quiz details:", error);
      setMessage("Failed to fetch quiz details");
    }
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    if (!editingQuiz) return;

    try {
      await axiosAuth.put(`/api/quizzes/${editingQuiz.id}`, {
        title: editingQuiz.title,
        category: editingQuiz.category
      });
      setMessage("Quiz updated successfully!");
      setShowEditForm(false);
      setEditingQuiz(null);
      fetchQuizzes();
    } catch (error) {
      console.error("Error updating quiz:", error);
      setMessage("Failed to update quiz");
    }
  };

  const handleUpdateQuestion = async (questionId, updatedQuestion) => {
    try {
      await axiosAuth.put(`/api/questions/${questionId}`, updatedQuestion);
      setMessage("Question updated successfully!");
      // Refresh the editing quiz data
      if (editingQuiz) {
        const response = await axiosAuth.get(`/api/quizzes/${editingQuiz.id}`);
        setEditingQuiz({
          ...editingQuiz,
          questions: response.data.questions || []
        });
      }
    } catch (error) {
      console.error("Error updating question:", error);
      setMessage("Failed to update question");
    }
  };

  const handleUpdateAnswer = async (answerId, updatedAnswer) => {
    try {
      await axiosAuth.put(`/api/answers/${answerId}`, updatedAnswer);
      setMessage("Answer updated successfully!");
      // Refresh the editing quiz data
      if (editingQuiz) {
        const response = await axiosAuth.get(`/api/quizzes/${editingQuiz.id}`);
        setEditingQuiz({
          ...editingQuiz,
          questions: response.data.questions || []
        });
      }
    } catch (error) {
      console.error("Error updating answer:", error);
      setMessage("Failed to update answer");
    }
  };

  const handleDeleteQuestionFromQuiz = async (questionId) => {
    if (window.confirm("Delete this question?")) {
      try {
        await axiosAuth.delete(`/api/questions/${questionId}`);
        setMessage("Question deleted successfully!");
        // Refresh the editing quiz data
        if (editingQuiz) {
          const response = await axiosAuth.get(`/api/quizzes/${editingQuiz.id}`);
          setEditingQuiz({
            ...editingQuiz,
            questions: response.data.questions || []
          });
        }
      } catch (error) {
        console.error("Error deleting question:", error);
        setMessage("Failed to delete question");
      }
    }
  };

  const handleDeleteAnswerFromQuiz = async (answerId) => {
    if (window.confirm("Delete this answer?")) {
      try {
        await axiosAuth.delete(`/api/answers/${answerId}`);
        setMessage("Answer deleted successfully!");
        // Refresh the editing quiz data
        if (editingQuiz) {
          const response = await axiosAuth.get(`/api/quizzes/${editingQuiz.id}`);
          setEditingQuiz({
            ...editingQuiz,
            questions: response.data.questions || []
          });
        }
      } catch (error) {
        console.error("Error deleting answer:", error);
        setMessage("Failed to delete answer");
      }
    }
  };

  // Additional quiz management functions
  const handleEditQuiz = async (quizId) => {
    try {
      const response = await axiosAuth.get(`/api/quizzes/${quizId}`);
      const quiz = response.data;
      setSelectedQuiz(quiz);
      setEditingQuiz({
        id: quiz.id,
        title: quiz.title,
        category: quiz.category,
        questions: quiz.questions || []
      });
      setShowEditForm(true);
    } catch (error) {
      console.error("Error fetching quiz for editing:", error);
      setMessage("Failed to fetch quiz for editing");
    }
  };

  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [showAddAnswerForm, setShowAddAnswerForm] = useState(null); // questionId or null
  const [newQuestionData, setNewQuestionData] = useState({
    questionText: "",
    answers: ["", "", "", ""],
    correctOption: 0
  });
  const [newAnswerText, setNewAnswerText] = useState("");

  const handleAddQuestionToQuiz = async (quizId) => {
    if (!newQuestionData.questionText.trim()) {
      setMessage("Please enter a question text");
      return;
    }

    try {
      const newQuestion = {
        questionText: newQuestionData.questionText.trim(),
        answers: newQuestionData.answers.map((answer, index) => ({
          answerText: answer.trim(),
          correct: index === newQuestionData.correctOption
        }))
      };
      
      await axiosAuth.post(`/api/questions/quiz/${quizId}`, newQuestion);
      setMessage("Question added successfully!");
      setShowAddQuestionForm(false);
      setNewQuestionData({
        questionText: "",
        answers: ["", "", "", ""],
        correctOption: 0
      });
      // Refresh the editing quiz data
      if (editingQuiz) {
        const response = await axiosAuth.get(`/api/quizzes/${editingQuiz.id}`);
        setEditingQuiz({
          ...editingQuiz,
          questions: response.data.questions || []
        });
      }
    } catch (error) {
      console.error("Error adding question:", error);
      setMessage("Failed to add question");
    }
  };

  const handleAddAnswerToQuestion = async (questionId) => {
    if (!newAnswerText.trim()) {
      setMessage("Please enter an answer text");
      return;
    }

    try {
      const newAnswer = {
        answerText: newAnswerText.trim(),
        correct: false
      };
      
      await axiosAuth.post(`/api/answers/question/${questionId}`, newAnswer);
      setMessage("Answer added successfully!");
      setShowAddAnswerForm(null);
      setNewAnswerText("");
      // Refresh the editing quiz data
      if (editingQuiz) {
        const response = await axiosAuth.get(`/api/quizzes/${editingQuiz.id}`);
        setEditingQuiz({
          ...editingQuiz,
          questions: response.data.questions || []
        });
      }
    } catch (error) {
      console.error("Error adding answer:", error);
      setMessage("Failed to add answer");
    }
  };

  // Add New Quiz handlers
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

  const addQuestionToQuiz = () => {
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

  const removeQuestionFromQuiz = (index) => {
    if (quizData.questions.length > 1) {
      const updatedQuestions = [...quizData.questions];
      updatedQuestions.splice(index, 1);
      setQuizData({
        ...quizData,
        questions: updatedQuestions,
      });
    }
  };

  const handleSubmitQuiz = async (e) => {
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
      await axios.post("https://quiz-backend-3ws6.onrender.com/api/quizzes/submit", submissionData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Quiz submitted successfully! Waiting for admin approval.");
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
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setMessage(error.response?.data?.message || "Failed to submit quiz. Please try again.");
      setIsSubmitting(false);
    }
  };

  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const role = decoded.role;

  console.log(role);

  if (role !== "ROLE_ADMIN") {
    return <h1 style={{color: "red", textAlign: "center"}}>You are not an admin</h1>;
  }

  const renderContent = () => {
    // Edit Quiz form - check this first
    if (showEditForm && editingQuiz) {
      return (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Edit Quiz: {editingQuiz.title}</h4>
            <div>
              <button 
                className="btn btn-outline-info btn-sm me-2"
                onClick={async () => {
                  try {
                    const response = await axiosAuth.get(`/api/quizzes/${editingQuiz.id}`);
                    setEditingQuiz({
                      ...editingQuiz,
                      questions: response.data.questions || []
                    });
                    setMessage("Quiz data refreshed!");
                  } catch (error) {
                    setMessage("Failed to refresh quiz data");
                  }
                }}
              >
                Refresh
              </button>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingQuiz(null);
                }}
              >
                Back to Quizzes
              </button>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpdateQuiz}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="editTitle" className="form-label">Quiz Title</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editTitle"
                      value={editingQuiz.title}
                      onChange={(e) => setEditingQuiz({
                        ...editingQuiz,
                        title: e.target.value
                      })}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="editCategory" className="form-label">Category</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editCategory"
                      value={editingQuiz.category}
                      onChange={(e) => setEditingQuiz({
                        ...editingQuiz,
                        category: e.target.value
                      })}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <button type="submit" className="btn btn-primary">
                  Update Quiz Details
                </button>
              </div>
            </form>

            <hr />

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Questions</h5>
              <button
                type="button"
                className="btn btn-sm btn-outline-success"
                onClick={() => setShowAddQuestionForm(true)}
              >
                Add New Question
              </button>
            </div>

            {/* Add Question Form */}
            {showAddQuestionForm && (
              <div className="card mb-3 border-success">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">Add New Question</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Question Text</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newQuestionData.questionText}
                      onChange={(e) => setNewQuestionData({
                        ...newQuestionData,
                        questionText: e.target.value
                      })}
                      placeholder="Enter your question here..."
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Answer Options</label>
                    {newQuestionData.answers.map((answer, index) => (
                      <div key={index} className="input-group mb-2">
                        <div className="input-group-text">
                          <input
                            type="radio"
                            name="newCorrectOption"
                            checked={newQuestionData.correctOption === index}
                            onChange={() => setNewQuestionData({
                              ...newQuestionData,
                              correctOption: index
                            })}
                          />
                        </div>
                        <input
                          type="text"
                          className="form-control"
                          value={answer}
                          onChange={(e) => {
                            const updatedAnswers = [...newQuestionData.answers];
                            updatedAnswers[index] = e.target.value;
                            setNewQuestionData({
                              ...newQuestionData,
                              answers: updatedAnswers
                            });
                          }}
                          placeholder={`Option ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleAddQuestionToQuiz(editingQuiz.id)}
                    >
                      Add Question
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setShowAddQuestionForm(false);
                        setNewQuestionData({
                          questionText: "",
                          answers: ["", "", "", ""],
                          correctOption: 0
                        });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            {editingQuiz.questions.map((question, questionIndex) => (
              <div key={question.id || questionIndex} className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6>Question {questionIndex + 1}</h6>
                    <div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-info me-2"
                        onClick={() => setShowAddAnswerForm(question.id)}
                      >
                        Add Answer
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteQuestionFromQuiz(question.id)}
                      >
                        Delete Question
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Question Text</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={question.questionText}
                        onChange={(e) => {
                          const updatedQuestions = [...editingQuiz.questions];
                          updatedQuestions[questionIndex] = {
                            ...question,
                            questionText: e.target.value
                          };
                          setEditingQuiz({
                            ...editingQuiz,
                            questions: updatedQuestions
                          });
                        }}
                        onBlur={() => handleUpdateQuestion(question.id, {
                          ...question,
                          questionText: question.questionText
                        })}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => handleUpdateQuestion(question.id, {
                          ...question,
                          questionText: question.questionText
                        })}
                        title="Save changes"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Answers</label>
                    {question.answers && question.answers.map((answer, answerIndex) => (
                      <div key={answer.id || answerIndex} className="input-group mb-2">
                        <div className="input-group-text">
                          <input
                            type="radio"
                            name={`correctAnswer-${question.id}`}
                            checked={answer.correct}
                            onChange={() => {
                              const updatedQuestions = [...editingQuiz.questions];
                              const updatedAnswers = updatedQuestions[questionIndex].answers.map((a, idx) => ({
                                ...a,
                                correct: idx === answerIndex
                              }));
                              updatedQuestions[questionIndex] = {
                                ...updatedQuestions[questionIndex],
                                answers: updatedAnswers
                              };
                              setEditingQuiz({
                                ...editingQuiz,
                                questions: updatedQuestions
                              });
                            }}
                          />
                        </div>
                        <input
                          type="text"
                          className="form-control"
                          value={answer.answerText}
                          onChange={(e) => {
                            const updatedQuestions = [...editingQuiz.questions];
                            const updatedAnswers = [...updatedQuestions[questionIndex].answers];
                            updatedAnswers[answerIndex] = {
                              ...updatedAnswers[answerIndex],
                              answerText: e.target.value
                            };
                            updatedQuestions[questionIndex] = {
                              ...updatedQuestions[questionIndex],
                              answers: updatedAnswers
                            };
                            setEditingQuiz({
                              ...editingQuiz,
                              questions: updatedQuestions
                            });
                          }}
                          onBlur={() => handleUpdateAnswer(answer.id, {
                            ...answer,
                            answerText: answer.answerText,
                            correct: answer.correct
                          })}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleUpdateAnswer(answer.id, {
                            ...answer,
                            answerText: answer.answerText,
                            correct: answer.correct
                          })}
                          title="Save changes"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleDeleteAnswerFromQuiz(answer.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add Answer Form */}
                  {showAddAnswerForm === question.id && (
                    <div className="card mt-3 border-info">
                      <div className="card-header bg-info text-white">
                        <h6 className="mb-0">Add New Answer</h6>
                      </div>
                      <div className="card-body">
                        <div className="input-group">
                          <div className="input-group-text">
                            <input
                              type="radio"
                              name={`newCorrectAnswer-${question.id}`}
                              checked={false}
                              onChange={() => {}} // Will be handled when saving
                            />
                          </div>
                          <input
                            type="text"
                            className="form-control"
                            value={newAnswerText}
                            onChange={(e) => setNewAnswerText(e.target.value)}
                            placeholder="Enter new answer text..."
                          />
                          <button
                            type="button"
                            className="btn btn-info"
                            onClick={() => handleAddAnswerToQuestion(question.id)}
                          >
                            Add Answer
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => {
                              setShowAddAnswerForm(null);
                              setNewAnswerText("");
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'pending') {
      return (
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0">Pending Quiz Submissions</h4>
          </div>
          <div className="card-body">
            <PendingQuizzesTab
              pendingQuizzes={pendingQuizzes}
              onApprove={handleApproveQuiz}
              onReject={handleRejectQuiz}
            />
          </div>
        </div>
      );
    }
    
    if (activeTab === 'manage') {
      return (
        <div>
          <div className="card mb-4">
            <div className="card-header">
              <h4 className="mb-0">Manage Quizzes</h4>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-12">
                  {quizzes.length === 0 ? (
                    <p>No quizzes found</p>
                  ) : (
                    <div className="list-group">
                      {quizzes.map((quiz) => (
                        <div key={quiz.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <h5 className="mb-1">{quiz.title}</h5>
                            <small className="text-muted">{quiz.category}</small>
                          </div>
                          <div>
                            <button 
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => {
                                console.log("View Details button clicked for quiz:", quiz.id);
                                handleViewDetails(quiz.id);
                              }}
                            >
                              View Details
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteQuiz(quiz.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Add New Quiz tab
    return (
      <div className="card">
        <div className="card-header">
          <h4 className="mb-0">Add New Quiz</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmitQuiz}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Quiz Title</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={quizData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="category" className="form-label">Category</label>
              <input
                type="text"
                className="form-control"
                id="category"
                name="category"
                value={quizData.category}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Questions</label>
              {quizData.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6>Question {questionIndex + 1}</h6>
                      {quizData.questions.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeQuestionFromQuiz(questionIndex)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Question Text</label>
                      <input
                        type="text"
                        className="form-control"
                        name="questionText"
                        value={question.questionText}
                        onChange={(e) => handleQuestionChange(questionIndex, e)}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Options</label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="input-group mb-2">
                          <div className="input-group-text">
                            <input
                              type="radio"
                              name={`correctOption-${questionIndex}`}
                              checked={question.correctOption === optionIndex}
                              onChange={(e) => handleQuestionChange(questionIndex, {
                                target: { name: "correctOption", value: optionIndex }
                              })}
                            />
                          </div>
                          <input
                            type="text"
                            className="form-control"
                            value={option}
                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                            placeholder={`Option ${optionIndex + 1}`}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                className="btn btn-outline-primary mb-3"
                onClick={addQuestionToQuiz}
              >
                Add Question
              </button>
            </div>
            
            {message && (
              <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
                {message}
              </div>
            )}
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>
      
      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            Manage Quizzes
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Quizzes
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            Add New Quiz
          </button>
        </li>
      </ul>
      
      {renderContent()}
    </div>
  );
};

export default AdminDashboard;
