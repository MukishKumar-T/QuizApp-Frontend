import React, { useEffect, useState } from "react";
import axios from "axios";
import { Tooltip } from 'bootstrap';

// Initialize tooltips
const initializeTooltips = () => {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new Tooltip(tooltipTriggerEl);
  });
};

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeTooltips();
    
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://quiz-backend-3ws6.onrender.com/leaderboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaderboard(response.data);
      } catch (err) {
        console.error("Error loading leaderboard", err);
        setError("Failed to load leaderboard. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary mb-3">Quiz Champions Leaderboard</h1>
        <p className="lead text-muted mb-4">
          Compete with fellow quiz enthusiasts and climb to the top of the leaderboard!
          Your knowledge is your power - see how you stack up against the best.
        </p>
      </div>
      
      <div className="app-card p-4">
        {leaderboard.length > 0 ? (
          <div className="table-responsive">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-trophy-fill text-warning me-2 fs-4"></i>
                <h2 className="h5 mb-0 fw-bold">Top Performers</h2>
              </div>
              <div className="text-muted small">
                Showing {leaderboard.length} {leaderboard.length === 1 ? 'user' : 'users'}
              </div>
            </div>
            
            <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table className="table table-hover align-middle mb-0">
                <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'white' }}>
                  <tr className="border-bottom border-2">
                    <th className="py-3 ps-4" style={{ width: '10%' }}>RANK</th>
                    <th className="py-3" style={{ width: '50%' }}>USER</th>
                    <th className="py-3 text-center" style={{ width: '20%' }}>
                      <div className="d-flex align-items-center justify-content-center">
                        <span>SCORE</span>
                        <i 
                          className="bi bi-info-circle ms-2 text-muted" 
                          data-bs-toggle="tooltip" 
                          data-bs-placement="top"
                          title="Total points from all quizzes"
                        ></i>
                      </div>
                    </th>
                    <th className="py-3 text-center" style={{ width: '20%' }}>
                      <div className="d-flex align-items-center justify-content-center">
                        <span>QUIZZES</span>
                        <i 
                          className="bi bi-info-circle ms-2 text-muted" 
                          data-bs-toggle="tooltip" 
                          data-bs-placement="top"
                          title="Total quizzes attempted"
                        ></i>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr 
                      key={entry.userId} 
                      className={`align-middle ${index < 3 ? 'fw-bold' : ''}`}
                      style={{
                        borderLeft: index < 3 ? '4px solid' : '4px solid transparent',
                        borderColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'transparent'
                      }}
                    >
                      <td className="py-3 ps-4">
                        <div className="d-flex align-items-center">
                          <span 
                            className={`d-inline-flex align-items-center justify-content-center rounded-circle me-3 ${
                              index < 3 ? 'text-white' : 'bg-light text-dark'
                            }`}
                            style={{
                              width: '32px',
                              height: '32px',
                              background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#f8f9fa'
                            }}
                          >
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle me-3" style={{ width: '40px', height: '40px' }}>
                            <i className="bi bi-person-fill text-primary"></i>
                          </div>
                          <div>
                            <div className="fw-medium">{entry.userName.charAt(0).toUpperCase() + entry.userName.slice(1)}</div>
                            <div className="text-muted small">Level {Math.floor((entry.totalScore || 0) / 100) + 1}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-3">
                        <span className="badge bg-primary bg-opacity-10 text-primary p-2 w-100">
                          {entry.totalScore || 0} pts
                        </span>
                      </td>
                      <td className="text-center py-3">
                        <div className="d-flex align-items-center justify-content-center">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          <span>{entry.quizzesAttempted || 0}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="position-relative d-inline-block mb-4">
              <i className="bi bi-trophy display-1 text-warning"></i>
              <div className="position-absolute top-0 start-100 translate-middle">
                <span className="badge bg-danger rounded-pill">New</span>
              </div>
            </div>
            <h3 className="h2 fw-bold mb-3">Be the First to Top the Leaderboard!</h3>
            <p className="text-muted mb-4 fs-5">
              The leaderboard is waiting for champions like you to take the lead.
              Complete quizzes, earn points, and see your name rise to the top!
            </p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <button 
                className="app-btn-primary" 
                onClick={() => window.location.href = '/quizzes'}
              >
                <i className="bi bi-play-circle me-2"></i>Start Quizzing
              </button>
              <button 
                className="app-btn-outline" 
                onClick={() => window.location.href = '/contribute-quiz'}
              >
                <i className="bi bi-plus-circle me-2"></i>Contribute a Quiz
              </button>
            </div>
          </div>
        )}
      </div>
      
      
      <div className="app-card p-4 mt-4">
        <div className="text-center">
          <h3 className="h4 mb-3">Ready to Claim Your Spot?</h3>
          <p className="text-muted mb-4">
            Every quiz brings you closer to the top. Challenge yourself, learn something new, and become a quiz master!
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => window.location.href = '/quiz'}>
            <i className="bi bi-lightning-charge-fill me-2"></i>Start Quiz Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
