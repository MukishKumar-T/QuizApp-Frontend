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
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      {/* Create Quiz */}
      <div>
        <h2>Create Quiz</h2>
        <input
          type="text"
          placeholder="Title"
          value={newQuiz.title}
          onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Category"
          value={newQuiz.category}
          onChange={(e) => setNewQuiz({ ...newQuiz, category: e.target.value })}
        />
        <button onClick={createQuiz}>Add Quiz</button>
      </div>

      {/* Quiz List */}
      <div>
        <h2>All Quizzes</h2>
        {quizzes.map((quiz) => (
          <div key={quiz.id} style={{ marginTop: "10px" }}>
            <strong>{quiz.title}</strong> ({quiz.category})
            <button
              onClick={() => {
                  const quizId = quiz.id;
                setSelectedQuizId(quizId);
                setSelectedQuestionId(null);
                fetchQuestions(quizId);
              }}
              style={{ marginLeft: "10px" }}
            >
              View Questions
            </button>
          </div>
        ))}
      </div>

      {/* Questions */}
      {selectedQuizId && (
        <div>
          <h2>Questions</h2>
          <input
            type="text"
            placeholder="Question text"
            value={newQuestion.questionText}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, questionText: e.target.value })
            }
          />
          <button onClick={addQuestion}>Add Question</button>

          {questions.map((q) => (
            <div
              key={q.id}
              style={{
                marginTop: "10px",
                padding: "10px",
                border: "1px solid #ccc",
              }}
            >
              <p>
                <strong>Q:</strong> {q.questionText}
              </p>
              <button
                onClick={() => {
                  setSelectedQuestionId(q.id);
                  fetchAnswers(q.id);
                }}
              >
                View/Add Answers
              </button>
              <button onClick={() => updateQuestion(q)} style={{ marginLeft: "10px" }}>
                Edit
              </button>
              <button onClick={() => deleteQuestion(q.id)} style={{ marginLeft: "5px" }}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Answers */}
      {selectedQuestionId && (
        <div>
          <h2>Answers</h2>
          <input
            type="text"
            placeholder="Answer text"
            value={newAnswer.answerText}
            onChange={(e) =>
              setNewAnswer({ ...newAnswer, answerText: e.target.value })
            }
          />
          <label style={{ marginLeft: "10px" }}>
            <input
              type="checkbox"
              checked={newAnswer.correct}
              onChange={(e) =>
                setNewAnswer({ ...newAnswer, correct: e.target.checked })
              }
            />
            Correct
          </label>
          <button onClick={addAnswer} style={{ marginLeft: "10px" }}>
            Add Answer
          </button>

          {answers.map((a) => (
            <div key={a.id} style={{ marginTop: "5px" }}>
              {a.answerText} - <strong>{a.correct ? "Correct" : "Wrong"}</strong>
              <button onClick={() => updateAnswer(a)} style={{ marginLeft: "10px" }}>
                Edit
              </button>
              <button onClick={() => deleteAnswer(a.id)} style={{ marginLeft: "5px" }}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
