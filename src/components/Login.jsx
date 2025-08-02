import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("https://quiz-backend-3ws6.onrender.com/api/auth/login", {
        userName,
        password,
      });

      const token = res.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("userName", userName);

      const decoded = jwtDecode(token);
      const role = decoded.role;

      // Redirect based on role
      navigate(role === "ROLE_ADMIN" ? "/admin" : "/quiz");
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <div className="w-100" style={{ maxWidth: '500px' }}>
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="p-4 p-md-5">
            <div className="text-center mb-4">
              <h2 className="h3 fw-bold text-primary">Sign In</h2>
              <p className="text-muted">Enter your credentials to access your account</p>
            </div>
            
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="form-label fw-medium text-muted">Username</label>
                <input
                  type="text"
                  className="form-control p-3"
                  placeholder="Enter your username"
                  value={userName}
                  required
                  onChange={(e) => setUserName(e.target.value)}
                  style={{ height: '48px' }}
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label fw-medium text-muted">Password</label>
                <input
                  type="password"
                  className="form-control p-3"
                  placeholder="Enter your password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ height: '48px' }}
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-100 py-3 mb-3 fw-medium"
                disabled={isLoading}
                style={{
                  height: '48px',
                  background: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
                  border: 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
              
              <div className="text-center mt-4">
                <p className="mb-0 text-muted">
                  Don't have an account?{' '}
                  <Link to="/register" className="fw-medium text-primary text-decoration-none">
                    Create an account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
        
        <div className="text-center mt-4">
          <p className="small text-muted">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
