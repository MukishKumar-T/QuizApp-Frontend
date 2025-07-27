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
      .get("http://localhost:8080/api/quizzes", {
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
    <div className="container mt-0">
      <h2 className="text-center mb-4">Quizzes</h2>
      
      {/* Search and Filter Controls */}
      <div className="search-filter-container mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label htmlFor="filterBy" className="form-label">Filter by:</label>
            <select 
              id="filterBy"
              className="form-select"
              value={filterBy}
              onChange={(e) => {
                setFilterBy(e.target.value);
                setSearch(""); // Reset search when changing filter type
              }}
            >
              <option value="title">Title</option>
              <option value="category">Category</option>
            </select>
          </div>
          
          {filterBy === 'category' ? (
            <div className="col-md-6">
              <label htmlFor="categorySelect" className="form-label">Select Category:</label>
              <select
                id="categorySelect"
                className="form-select"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSearch(e.target.value);
                }}
              >
                <option value="">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="col-md-8">
              <label htmlFor="searchInput" className="form-label">
                {filterBy === 'title' ? 'Search by Title' : 'Search by Category'}
              </label>
              <input
                id="searchInput"
                type="text"
                placeholder={filterBy === 'title' 
                  ? 'Search by title...' 
                  : 'Search by category...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control p-3"
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Quiz Grid */}
      <div className="quiz-grid">
        {filteredQuizzes.length === 0 ? (
          <div className="col-12">
            <p className="text-center">No quizzes found. Try adjusting your search or filter.</p>
          </div>
        ) : (
          filteredQuizzes.map((quiz) => (
              <div key={quiz.id} className="quiz-card">
                <h3 className="quiz-card-title">{quiz.title}</h3>
                <p className="quiz-card-desc">Category: {quiz.category}</p>
                <button onClick={() => handleStartQuiz(quiz.id)} className="btn btn-primary quiz-card-btn">Start Quiz</button>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Quiz;
