import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { FiUser, FiAward, FiPlus, FiEdit2, FiBarChart2 } from "react-icons/fi";

const UserDashboard = () => {
  const [user, setUser] = useState({ userName: "", name: "", role: "" });
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const decoded = jwtDecode(token);
    const userName = decoded.sub || decoded.userName || "";

    axios
      .get(`http://localhost:8080/api/users/${userName}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
      });

    axios
      .get(`http://localhost:8080/quizAttempt/user/${userName}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAttempts(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalQuizzes = attempts.length;
  const averageScore = totalQuizzes > 0 
    ? (attempts.reduce((sum, attempt) => sum + (parseFloat(attempt.score) || 0), 0) / totalQuizzes).toFixed(1)
    : 0;


  return (
    <div className="container">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name || user.userName}!</p>
      </header>

      {/* Stats Cards - Single Row */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-8 overflow-x-auto">
        <div className="flex flex-row flex-wrap sm:flex-nowrap" style={{ display: "flex", justifyContent: "space-around" }}>
          {/* Role */}
          <div className="flex-1 p-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors border-r border-gray-100">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <FiUser className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">User Information</p>

              <p className="text-lg font-semibold text-gray-900 capitalize">Name: {user.name}</p>
            </div>
          </div>

          {/* Quizzes Attempted */}
          <div className="flex-1 p-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors border-r border-gray-100">
            <div className="p-2 rounded-lg bg-green-50 text-green-600">
              <FiAward className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quizzes</p>
              <p className="text-lg font-semibold text-gray-900">{totalQuizzes} Attempted</p>
            </div>
          </div>

          {/* Average Score */}
          <div className="flex-1 p-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FiBarChart2 className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Average</p>
              <p className="text-lg font-semibold text-gray-900">{averageScore}% Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Admin Only */}
      {user.role === 'ADMIN' && (
        <div className="flex flex-wrap gap-4 mb-8">
          <button className="btn btn-primary">
            <FiPlus className="mr-2" /> Create New Quiz
          </button>
          <button className="btn btn-outline">
            <FiEdit2 className="mr-2" /> Manage Quizzes
          </button>
        </div>
      )}

      {/* Quiz History */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-center">Quiz History</h2>
          <p className="text-sm text-gray-500">Your recent quiz attempts</p>
        </div>
        <div className="overflow-x-auto overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading your quiz history...</div>
          ) : attempts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>You haven't taken any quizzes yet.</p>
              <button className="btn btn-primary mt-4">
                Take Your First Quiz
              </button>
            </div>
          ) : (
            <div className="flex justify-center ">
              <table className="w-full max-w-3xl">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase">Quiz Title</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase">Category</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 uppercase">Your Score</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 uppercase">Avg. Score</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium">{attempt.quizTitle || 'Untitled Quiz'}</td>
                    <td className="py-4 px-4 text-gray-600">
                      {attempt.quizCategory}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        parseFloat(attempt.score) >= 70 ? 'bg-green-100 text-green-800' : 
                        parseFloat(attempt.score) >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {attempt.score}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        attempt.averageScore >= 70 ? 'bg-green-100 text-green-800' : 
                        attempt.averageScore >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {attempt.averageScore !== null ? `${Math.round(attempt.averageScore)}%` : '--'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        className="btn btn-sm btn-outline"
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
        {attempts.length > 0 && (
          <div className="card-footer">
            <button className="btn btn-outline btn-sm">
              View All Attempts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
