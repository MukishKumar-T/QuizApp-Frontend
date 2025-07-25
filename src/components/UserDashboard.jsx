import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const UserDashboard = () => {
  const [user, setUser] = useState({ userName: "", name: "", role: "" });
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const decoded = jwtDecode(token);
    const userName = decoded.sub || decoded.userName || "";

    // Fetch user info
    axios
      .get(`http://localhost:8080/api/users/${userName}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
      });

    // Fetch quiz attempts
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

  return (
    <div className="container mt-5">
      <div className="user-dashboard-grid">
        <div className="col-md-4">
          <div className="user-info-card">
            <div className="card-body text-center">
              <h5 className="card-title">{user.name || user.userName}</h5>
              <p className="text-muted">{user.role}</p>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="history-card">
            <div className="history-card-header">
              <h4 className="card-title mb-0">Quiz History</h4>
            </div>
            <div className="history-card-body">
              {loading ? (
                <p>Loading...</p>
              ) : attempts.length === 0 ? (
                <p>No quiz attempts found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th scope="col">Quiz Title</th>
                        <th scope="col">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.map((a) => (
                        <tr key={a.id}>
                          <td>{a.quizTitle || "-"}</td>
                          <td>{a.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;