import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { FiUser, FiAward, FiPlus, FiEdit2, FiBarChart2, FiBookOpen, FiCheckCircle, FiClock, FiUploadCloud } from "react-icons/fi";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ userName: "", name: "", role: "", userId: null });
  const [attempts, setAttempts] = useState([]);
  const [contributedQuizzes, setContributedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const decoded = jwtDecode(token);
    const userName = decoded.sub || decoded.userName || "";

    // Fetch user data
    axios
      .get(`https://quiz-backend-3ws6.onrender.com/api/users/${userName}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        // Fetch contributed quizzes after getting user data
        if (res.data && res.data.userId) {
          axios
            .get(`https://quiz-backend-3ws6.onrender.com/api/quizzes/contributor/${res.data.userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((quizRes) => {
              setContributedQuizzes(quizRes.data);
            })
            .catch((error) => {
              console.error("Error fetching contributed quizzes:", error);
            });
        }
      });

    // Fetch quiz attempts
    axios
      .get(`https://quiz-backend-3ws6.onrender.com/quizAttempt/user/${userName}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("Quiz attempts data:", res.data);
        setAttempts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalQuizzes = attempts.length;
  const averageScore = totalQuizzes > 0 
    ? (attempts.reduce((sum, attempt) => sum + (parseFloat(attempt.score) || 0), 0) / totalQuizzes).toFixed(1)
    : 0;

  const handleStartQuiz = (quizId) => {
    console.log("Attempting to start quiz with ID:", quizId);
    if (quizId) {
      navigate(`/quiz/${quizId}`);
    } else {
      console.error("Quiz ID is missing");
      alert("Quiz ID is missing. Cannot start quiz.");
    }
  };


  return (
    <div className="container py-4">
      <div className="mb-6">
        <h1 className="display-5 fw-bold text-primary mb-3">Dashboard</h1>
        <p className="fs-5 text-gray-600">Welcome back, <span className="fw-medium">{(user.name && user.name[0].toUpperCase() + user.name.slice(1)) || user.userName}</span>!</p>
      </div>

      {/* Stats Cards */}
      <div className="app-card p-4 mb-6">
        <div className="row g-4">
          {/* User Info */}
          <div className="col-md-6 col-lg-3">
            <div className="app-card p-3 h-100">
              <div className="d-flex align-items-center">
                <div className="bg-indigo-100 p-3 rounded-circle me-3">
                  <FiUser className="text-indigo-600" size={24} />
                </div>
                <div>
                  <p className="fs-6 text-muted mb-1">User Information</p>
                  <h5 className="mb-0 fw-medium">
                    {(user.name && user.name[0].toUpperCase() + user.name.slice(1)) || user.userName}
                  </h5>
                  <span className="text-muted">{user.role || 'User'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quizzes Attempted */}
          <div className="col-md-6 col-lg-3">
            <div className="app-card p-3 h-100">
              <div className="d-flex align-items-center">
                <div className="bg-green-100 p-3 rounded-circle me-3">
                  <FiAward className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="fs-6 text-muted mb-1">Quizzes Attempted</p>
                  <h3 className="mb-0 fw-bold">{totalQuizzes}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="col-md-6 col-lg-3">
            <div className="app-card p-3 h-100">
              <div className="d-flex align-items-center">
                <div className="bg-blue-100 p-3 rounded-circle me-3">
                  <FiBarChart2 className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="fs-6 text-muted mb-1">Average Score</p>
                  <h3 className="mb-0 fw-bold">{averageScore}%</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Quizzes Contributed */}
          <div className="col-md-6 col-lg-3">
            <div className="app-card p-3 h-100">
              <div className="d-flex align-items-center">
                <div className="bg-amber-100 p-3 rounded-circle me-3">
                  <FiUploadCloud className="text-amber-600" size={24} />
                </div>
                <div>
                  <p className="fs-6 text-muted mb-1">Quizzes Contributed</p>
                  <h3 className="mb-0 fw-bold">{contributedQuizzes.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      {user.role === 'ADMIN' && (
        <div className="d-flex gap-3 mb-5">
          <button className="app-btn-primary d-flex align-items-center">
            <FiPlus className="me-2" /> Create New Quiz
          </button>
          <button className="app-btn-outline d-flex align-items-center">
            <FiEdit2 className="me-2" /> Manage Quizzes
          </button>
        </div>
      )}

      {/* Quiz History */}
      <div className="app-card p-4 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1">Quiz History</h4>
            <p className="fs-5 text-muted mb-0">Your recent quiz attempts</p>
          </div>
          {attempts.length > 0 && (
            <button className="btn btn-sm btn-outline-secondary">
              View All
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : attempts.length === 0 ? (
          <div className="text-center py-5">
            <FiBookOpen className="text-muted mb-3" size={48} />
            <h4 className="mb-3">No quiz history yet</h4>
            <p className="fs-5 text-muted mb-4">Take a quiz to see your results here</p>
            <button 
              className="app-btn-primary"
              onClick={() => navigate('/quizzes')}
            >
              Browse Quizzes
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table app-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Category</th>
                  <th className="text-center">Your Score</th>
                  <th className="text-center">Avg. Score</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td className="fw-medium">{attempt.quizTitle || 'Untitled Quiz'}</td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {attempt.quizCategory || 'General'}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${
                        parseFloat(attempt.score) >= 70 ? 'bg-success bg-opacity-10 text-success' : 
                        parseFloat(attempt.score) >= 50 ? 'bg-warning bg-opacity-10 text-warning' : 
                        'bg-danger bg-opacity-10 text-danger'
                      }`}>
                        {attempt.score}%
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark">
                        {attempt.averageScore !== null ? `${Math.round(attempt.averageScore)}%` : '--'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button 
                        className="btn btn-sm app-btn-outline"
                        onClick={() => handleStartQuiz(attempt.quizId)}
                      >
                        Retake Quiz
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contributed Quizzes */}
      <div className="app-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1">My Contributed Quizzes</h4>
            <p className="fs-5 text-muted mb-0">Quizzes you've created and submitted</p>
          </div>
          {contributedQuizzes.length > 0 && (
            <button 
              className="btn btn-sm app-btn-primary"
              onClick={() => navigate('/contribute')}
            >
              <FiPlus className="me-1" /> New Quiz
            </button>
          )}
        </div>

        {contributedQuizzes.length === 0 ? (
          <div className="text-center py-5">
            <FiBookOpen className="text-muted mb-3" size={48} />
            <h4 className="mb-3">No quizzes contributed yet</h4>
            <p className="fs-5 text-muted mb-4">Create your first quiz and share it with the community</p>
            <button 
              className="app-btn-primary"
              onClick={() => navigate('/contribute-quiz')}
            >
              Contribute a Quiz
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table app-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Category</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Questions</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contributedQuizzes.map((quiz) => (
                  <tr key={quiz.id}>
                    <td className="fw-medium">{quiz.title}</td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {quiz.category || 'General'}
                      </span>
                    </td>
                    <td className="text-center">
                      {quiz.approved ? (
                        <span className="badge bg-success bg-opacity-10 text-success">
                          <FiCheckCircle className="me-1" /> Approved
                        </span>
                      ) : (
                        <span className="badge bg-warning bg-opacity-10 text-warning">
                          <FiClock className="me-1" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark">
                        {quiz.questions ? quiz.questions.length : 0}
                      </span>
                    </td>
                    <td className="text-end">
                      {quiz.approved ? (
                        <button 
                          className="btn btn-sm app-btn-outline"
                          onClick={() => navigate(`/quiz/${quiz.id}`)}
                        >
                          View Quiz
                        </button>
                      ) : (
                        <span className="text-muted small">Pending approval</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
