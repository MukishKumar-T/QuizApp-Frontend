import React, { useEffect, useState } from "react";
import axios from "axios";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8080/leaderboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setLeaderboard(res.data))
      .catch((err) => console.error("Error loading leaderboard", err));
  }, []);

  return (
    <div className="container mt-5 leaderboard-wrapper">
      <div className="leaderboard-card">
        <div className="card-header">
          <h2 className="card-title text-center mb-0">Leaderboard</h2>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="leaderboard-table table table-striped table-dark mb-0">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Username</th>
                  <th scope="col">Total Score</th>
                  <th scope="col">Quizzes Attempted</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, index) => (
                  <tr key={user.userName}>
                    <th scope="row">{index + 1}</th>
                    <td>{user.userName}</td>
                    <td>{user.totalScore}</td>
                    <td>{user.quizzesAttempted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
