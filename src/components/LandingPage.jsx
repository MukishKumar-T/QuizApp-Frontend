import React from 'react';
import { Link } from 'react-router-dom';
import { FaTrophy, FaBrain, FaUsers, FaChartLine } from 'react-icons/fa';

const LandingPage = () => {
  const features = [
    {
      icon: <FaTrophy className="display-4 text-primary mb-3" />,
      title: 'Compete',
      description: 'Test your knowledge and climb the leaderboard'
    },
    {
      icon: <FaBrain className="display-4 text-primary mb-3" />,
      title: 'Learn',
      description: 'Challenge yourself with a variety of topics'
    },
    {
      icon: <FaUsers className="display-4 text-primary mb-3" />,
      title: 'Contribute',
      description: 'Add your own questions and help others learn'
    },
    {
      icon: <FaChartLine className="display-4 text-primary mb-3" />,
      title: 'Track Progress',
      description: 'Monitor your improvement over time'
    }
  ];

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section py-5 bg-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">Test Your Knowledge with Our Quiz App</h1>
              <p className="lead mb-4">Join thousands of users who are improving their knowledge daily. Challenge yourself with our curated quizzes across various topics.</p>
              <div className="d-flex gap-3">
                <Link to="/login" className="btn btn-primary btn-lg px-4">Get Started</Link>
                <Link to="/leaderboard" className="btn btn-outline-primary btn-lg px-4">View Leaderboard</Link>
                
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <div className="p-4">
                <div className="ratio ratio-16x9">
                  <div className="bg-primary bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center">
                    <FaTrophy className="display-1 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Why Choose Our Quiz App?</h2>
            <p className="text-muted">Discover what makes our platform stand out</p>
          </div>
          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-md-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm p-4 text-center">
                  <div className="card-body">
                    {feature.icon}
                    <h5 className="card-title">{feature.title}</h5>
                    <p className="card-text text-muted">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container text-center">
          <h2 className="fw-bold mb-4">Ready to Start Your Quiz Journey?</h2>
          <p className="lead mb-4">Join our community of knowledge seekers today</p>
          <Link to="/register" className="btn btn-light btn-lg px-4">Create Free Account</Link>
        </div>
      </section>

      <style jsx>{`
        .hero-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        .card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
        .btn-primary {
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
