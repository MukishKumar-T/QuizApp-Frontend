import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Quiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("title"); // 'title' or 'category'
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // Fetch quizzes
    axios
      .get("https://quiz-backend-3ws6.onrender.com/api/quizzes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setQuizzes(response.data);
        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.map(quiz => quiz.category).filter(Boolean))];
        setCategories(uniqueCategories);
      })
      .catch((error) => {
        console.error("Error fetching quizzes:", error);
        if (error.response?.status === 403 || error.response?.status === 401) {
          alert("Unauthorized! Please login again.");
          navigate("/login");
        }
      });
  }, [navigate]);
  
  // Filter quizzes based on search and selected filter
  const filteredQuizzes = quizzes.filter(quiz => {
    const searchLower = search.toLowerCase();
    if (filterBy === 'title') {
      return quiz.title.toLowerCase().includes(searchLower) || 
             (quiz.description && quiz.description.toLowerCase().includes(searchLower));
    } else { // category
      if (!searchLower) return true; // If no search term, show all
      return quiz.category && quiz.category.toLowerCase().includes(searchLower);
    }
  });

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  return (
    <div className="container py-4">
      {/* Hero Section */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary mb-3">Explore Our Quiz Collection</h1>
        <p className="lead text-muted mb-4">
          Test your knowledge, learn something new, and challenge yourself with our diverse range of quizzes.
          From general knowledge to specialized topics, there's something for everyone!
        </p>
      </div>
      
      {/* Search and Filter */}
      <div className="app-card p-4 mb-5">
        <div className="row g-3 align-items-end">
          <div className="col-md-6">
            <label className="form-label fw-medium mb-1">Search Quizzes</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control form-control-lg border-start-0 ps-2"
                placeholder={`Search by ${filterBy}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ height: '50px' }}
              />
            </div>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-medium mb-1">Filter By</label>
            <select
              className="form-select form-select-lg"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              style={{ height: '50px' }}
            >
              <option value="title">Title</option>
              <option value="category">Category</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-medium mb-1">Category</label>
            <select
              className={`form-select form-select-lg ${filterBy !== 'category' ? 'bg-light' : ''}`}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={filterBy !== 'category'}
              style={{
                height: '50px',
                cursor: filterBy === 'category' ? 'pointer' : 'not-allowed'
              }}
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h4 fw-bold mb-0">
            {search || selectedCategory ? 'Search Results' : 'Featured Quizzes'}
          </h2>
          <span className="text-muted">
            {filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'quiz' : 'quizzes'} found
          </span>
        </div>

        {filteredQuizzes.length > 0 ? (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {filteredQuizzes.map((quiz) => (
              <div key={quiz.id} className="col">
                <div className="app-card h-100 d-flex flex-column shadow-sm hover-shadow transition-all">
                  <div className="card-body d-flex flex-column p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title text-primary fw-bold mb-2">{quiz.title}</h5>
                      {quiz.category && (
                        <span className="badge bg-primary bg-opacity-10 text-primary">
                          {quiz.category}
                        </span>
                      )}
                    </div>
                    
                    {quiz.description && (
                      <p className="card-text text-muted mb-4 flex-grow-1">
                        {quiz.description.length > 120
                          ? `${quiz.description.substring(0, 120)}...`
                          : quiz.description}
                      </p>
                    )}
                    
                    <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-question-circle-fill text-primary me-2"></i>
                        <span className="text-muted">
                          {quiz.questions ? quiz.questions.length : 0} Questions
                        </span>
                      </div>
                      <button
                        className="app-btn-primary"
                        onClick={() => handleStartQuiz(quiz.id)}
                      >
                        <i className="bi bi-play-fill me-2"></i>Start
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="app-card p-5 text-center">
            <div className="position-relative d-inline-block mb-4">
              <i className="bi bi-search display-4 text-muted"></i>
              <div className="position-absolute top-0 start-100 translate-middle">
                <span className="badge bg-danger rounded-pill">0</span>
              </div>
            </div>
            <h3 className="h4 fw-bold mb-3">No quizzes found</h3>
            <p className="text-muted mb-4">
              We couldn't find any quizzes matching your search. Try adjusting your filters or try a different search term.
            </p>
            <button 
              className="btn btn-outline-primary" 
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setFilterBy('title');
              }}
            >
              <i className="bi bi-arrow-counterclockwise me-2"></i>Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
