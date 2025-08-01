import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role || "");
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg m-2">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">Quiz App</Link>
        <Link className="navbar-brand fw-bold" to="/dashboard">{userName ? `Welcome ${userName[0].toUpperCase() + userName.slice(1)}!` : 'Welcome!'}</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto p-2">

            {!token && (
              <li className="nav-item">
                <Link 
                  className="nav-link position-relative px-3" 
                  to="/"
                  style={{
                  transition: 'color 0.3s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#0d6efd'}
                onMouseOut={(e) => e.currentTarget.style.color = ''}
              >
                Home
                <span className="position-absolute bottom-0 start-0 w-100 bg-primary" 
                      style={{
                        height: '2px',
                        transform: 'scaleX(0)',
                        transition: 'transform 0.3s ease',
                        transformOrigin: 'left'
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'scaleX(1)'}
                      onMouseOut={(e) => e.target.style.transform = 'scaleX(0)'}
                ></span>
              </Link>
            </li>
            )}
            {token ? (
              <>
                <li className="nav-item">
                  <Link 
                    className="nav-link position-relative px-3" 
                    to="/quiz"
                    style={{
                      transition: 'color 0.3s ease',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#0d6efd'}
                    onMouseOut={(e) => e.currentTarget.style.color = ''}
                  >
                    Quiz
                    <span className="position-absolute bottom-0 start-0 w-100 bg-primary" 
                          style={{
                            height: '2px',
                            transform: 'scaleX(0)',
                            transition: 'transform 0.3s ease',
                            transformOrigin: 'left'
                          }}
                          onMouseOver={(e) => e.target.style.transform = 'scaleX(1)'}
                          onMouseOut={(e) => e.target.style.transform = 'scaleX(0)'}
                    ></span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className="nav-link position-relative px-3" 
                    to="/leaderboard"
                    style={{
                      transition: 'color 0.3s ease',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#0d6efd'}
                    onMouseOut={(e) => e.currentTarget.style.color = ''}
                  >
                    LeaderBoard
                    <span className="position-absolute bottom-0 start-0 w-100 bg-primary" 
                          style={{
                            height: '2px',
                            transform: 'scaleX(0)',
                            transition: 'transform 0.3s ease',
                            transformOrigin: 'left'
                          }}
                          onMouseOver={(e) => e.target.style.transform = 'scaleX(1)'}
                          onMouseOut={(e) => e.target.style.transform = 'scaleX(0)'}
                    ></span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className="nav-link position-relative px-3" 
                    to="/dashboard"
                    style={{
                      transition: 'color 0.3s ease',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#0d6efd'}
                    onMouseOut={(e) => e.currentTarget.style.color = ''}
                  >
                    Dashboard
                    <span className="position-absolute bottom-0 start-0 w-100 bg-primary" 
                          style={{
                            height: '2px',
                            transform: 'scaleX(0)',
                            transition: 'transform 0.3s ease',
                            transformOrigin: 'left'
                          }}
                          onMouseOver={(e) => e.target.style.transform = 'scaleX(1)'}
                          onMouseOut={(e) => e.target.style.transform = 'scaleX(0)'}
                    ></span>
                  </Link>
                </li>
                {userRole !== "admin" && (
                  <li className="nav-item">
                    <Link 
                      className="nav-link position-relative px-3" 
                      to="/contribute"
                      style={{
                        transition: 'color 0.3s ease',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = '#0d6efd'}
                      onMouseOut={(e) => e.currentTarget.style.color = ''}
                    >
                      Contribute a Quiz
                      <span className="position-absolute bottom-0 start-0 w-100 bg-primary" 
                            style={{
                              height: '2px',
                              transform: 'scaleX(0)',
                              transition: 'transform 0.3s ease',
                              transformOrigin: 'left'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'scaleX(1)'}
                            onMouseOut={(e) => e.target.style.transform = 'scaleX(0)'}
                      ></span>
                    </Link>
                  </li>
                )}
                {userRole === "ROLE_ADMIN" && (
                  <li className="nav-item">
                    <Link 
                      className="nav-link position-relative px-3" 
                      to="/admin"
                      style={{
                        transition: 'color 0.3s ease',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = '#0d6efd'}
                      onMouseOut={(e) => e.currentTarget.style.color = ''}
                    >
                      Admin Dashboard
                      <span className="position-absolute bottom-0 start-0 w-100 bg-primary" 
                            style={{
                              height: '2px',
                              transform: 'scaleX(0)',
                              transition: 'transform 0.3s ease',
                              transformOrigin: 'left'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'scaleX(1)'}
                            onMouseOut={(e) => e.target.style.transform = 'scaleX(0)'}
                      ></span>
                    </Link>
                  </li>

                )}
                <li className="nav-item ms-2">
                  <button 
                    className="btn btn-primary" 
                    onClick={handleLogout}
                    style={{
                      transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link 
                    className="nav-link position-relative px-3" 
                    to="/login"
                    style={{
                      transition: 'color 0.3s ease',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#0d6efd'}
                    onMouseOut={(e) => e.currentTarget.style.color = ''}
                  >
                    Login
                    <span className="position-absolute bottom-0 start-0 w-100 bg-primary" 
                          style={{
                            height: '2px',
                            transform: 'scaleX(0)',
                            transition: 'transform 0.3s ease',
                            transformOrigin: 'left'
                          }}
                          onMouseOver={(e) => e.target.style.transform = 'scaleX(1)'}
                          onMouseOut={(e) => e.target.style.transform = 'scaleX(0)'}
                    ></span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className="nav-link position-relative px-3" 
                    to="/register"
                    style={{
                      transition: 'color 0.3s ease',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#0d6efd'}
                    onMouseOut={(e) => e.currentTarget.style.color = ''}
                  >
                    Register
                    <span className="position-absolute bottom-0 start-0 w-100 bg-primary" 
                          style={{
                            height: '2px',
                            transform: 'scaleX(0)',
                            transition: 'transform 0.3s ease',
                            transformOrigin: 'left'
                          }}
                          onMouseOver={(e) => e.target.style.transform = 'scaleX(1)'}
                          onMouseOut={(e) => e.target.style.transform = 'scaleX(0)'}
                    ></span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
