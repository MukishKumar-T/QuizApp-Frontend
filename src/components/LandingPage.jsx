import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center text-center mt-5">
      <h1 className="display-4 fw-bold mb-3 text-primary">Welcome to the Quiz App!</h1>
      <p className="lead mb-4">Test your knowledge across various topics and compete on the leaderboard.</p>
      <div className="d-flex gap-3">
        <Link to="/login" className="btn btn-outline-primary btn-lg">Login</Link>
        {/* <Link to="/register" className="btn btn-outline-primary btn-lg">Register</Link> */}
        {/* <Link to="/quiz" className="btn btn-success btn-lg">Start Quiz</Link> */}
      </div>
    </div>
  );
};

export default LandingPage;
