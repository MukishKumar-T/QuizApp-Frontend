import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [newQuiz, setNewQuiz] = useState({ title: "", category: "" });
  const [newQuestion, setNewQuestion] = useState({ questionText: "" });
  const [newAnswer, setNewAnswer] = useState({ answerText: "", correct: false });
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);

  const axiosAuth = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // Fetch all quizzes
  const fetchQuizzes = async () => {
    try {
      const res = await axiosAuth.get("/api/quizzes");
      setQuizzes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      alert("Failed to fetch quizzes");
    }
  };

  useEffect(() => {
    fetchQuizzes();
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
      await axiosAuth.post(`/api/questions/quiz/${selectedQuizId}`, newQuestion);
      alert("Question added!");
      setNewQuestion({ questionText: "" });
      fetchQuestions(selectedQuizId);
    } catch {
      alert("Failed to add question");
    }
  };

  const addAnswer = async () => {
    try {
      await axiosAuth.post(`/api/answers/question/${selectedQuestionId}`, newAnswer);
      alert("Answer added!");
      setNewAnswer({ answerText: "", correct: false });
      fetchAnswers(selectedQuestionId);
    } catch {
      alert("Failed to add answer");
    }
  };

  const updateQuestion = async (question) => {
    const updatedText = prompt("Edit question text", question.questionText);
    if (updatedText !== null) {
      try {
        await axiosAuth.put(`/questions/${question.id}`, {
          ...question,
          questionText: updatedText,
        });
        fetchQuestions(selectedQuizId);
      } catch {
        alert("Failed to update question");
      }
    }
  };

  const deleteQuestion = async (questionId) => {
    if (window.confirm("Delete this question?")) {
      try {
        await axiosAuth.delete(`/questions/${questionId}`);
        fetchQuestions(selectedQuizId);
      } catch {
        alert("Failed to delete question");
      }
    }
  };

  const updateAnswer = async (answer) => {
    const updatedText = prompt("Edit answer text", answer.answerText);
    if (updatedText !== null) {
      try {
        await axiosAuth.put(`/answers/${answer.id}`, {
          ...answer,
          answerText: updatedText,
        });
        fetchAnswers(selectedQuestionId);
      } catch {
        alert("Failed to update answer");
      }
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

  return (
    <div className="container-fluid mt-4">
      <h1 className="mb-4">Admin Dashboard</h1>

      {/* Create Quiz Card */}
      <div className="card mb-4">
        <div className="card-header">
          <h4 className="mb-0">Create New Quiz</h4>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="Quiz Title"
                value={newQuiz.title}
                onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
              />
            </div>
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="Quiz Category"
                value={newQuiz.category}
                onChange={(e) => setNewQuiz({ ...newQuiz, category: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <button onClick={createQuiz} className="btn btn-primary w-100">Add Quiz</button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Quiz List Column */}
        <div className="col-md-5">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">Manage Quizzes</h4>
            </div>
            <div className="list-group list-group-flush">
              {quizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  type="button"
                  className={`list-group-item list-group-item-action ${selectedQuizId === quiz.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedQuizId(quiz.id);
                    setSelectedQuestionId(null); // Reset question selection
                    setAnswers([]); // Clear old answers
                    fetchQuestions(quiz.id);
                  }}
                >
                  {quiz.title} <span className="text-muted">({quiz.category})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Questions and Answers Column */}
        <div className="col-md-7">
          {selectedQuizId && (
            <div className="card mb-4">
              <div className="card-header">
                <h4 className="mb-0">Questions</h4>
              </div>
              <div className="card-body">
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="New question text"
                    value={newQuestion.questionText}
                    onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                  />
                  <button onClick={addQuestion} className="btn btn-primary">Add Question</button>
                </div>
                <ul className="list-group">
                  {questions.map((q) => (
                    <li key={q.id} className="list-group-item d-flex justify-content-between align-items-center">
                      {q.questionText}
                      <div className="btn-group">
                        <button onClick={() => { setSelectedQuestionId(q.id); fetchAnswers(q.id); }} className={`btn btn-sm ${selectedQuestionId === q.id ? 'btn-primary' : 'btn-outline-primary'}`}>Answers</button>
                        <button onClick={() => updateQuestion(q)} className="btn btn-sm btn-outline-secondary">Edit</button>
                        <button onClick={() => deleteQuestion(q.id)} className="btn btn-sm btn-outline-danger">Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {selectedQuestionId && (
            <div className="card">
              <div className="card-header">
                <h4 className="mb-0">Answers</h4>
              </div>
              <div className="card-body">
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="New answer text"
                    value={newAnswer.answerText}
                    onChange={(e) => setNewAnswer({ ...newAnswer, answerText: e.target.value })}
                  />
                  <div className="input-group-text">
                    <input
                      type="checkbox"
                      className="form-check-input mt-0"
                      checked={newAnswer.correct}
                      onChange={(e) => setNewAnswer({ ...newAnswer, correct: e.target.checked })}
                    />
                    <label className="ms-2">Correct</label>
                  </div>
                  <button onClick={addAnswer} className="btn btn-primary">Add Answer</button>
                </div>
                <ul className="list-group">
                  {answers.map((ans) => (
                    <li key={ans.id} className={`list-group-item d-flex justify-content-between align-items-center ${ans.correct ? 'list-group-item-success' : ''}`}>
                      {ans.answerText}
                      <div className="btn-group">
                        <button onClick={() => updateAnswer(ans)} className="btn btn-sm btn-outline-secondary">Edit</button>
                        <button onClick={() => deleteAnswer(ans.id)} className="btn btn-sm btn-outline-danger">Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
