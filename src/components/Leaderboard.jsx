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
    <div style={{ padding: "20px" }}>
      <h2>Leaderboard</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Total Score</th>
            <th>Quizzes Attempted</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((user, index) => (
            <tr key={user.userName}>
              <td>{index + 1}</td>
              <td>{user.userName}</td>
              <td>{user.totalScore}</td>
              <td>{user.quizzesAttempted}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
