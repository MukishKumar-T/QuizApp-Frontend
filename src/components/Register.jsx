import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      setError("You must accept the Terms of Service and Privacy Policy");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      await axios.post("https://quiz-backend-3ws6.onrender.com/api/auth/register", {
        name,
        userName,
        password,
      });
      
      // Redirect to login page after successful registration
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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
              <h2 className="h3 fw-bold text-primary">Create Account</h2>
              <p className="text-muted">Fill in your details to get started</p>
            </div>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label fw-medium text-muted">Full Name</label>
                <input
                  type="text"
                  className="form-control p-3"
                  placeholder="Enter your full name"
                  value={name}
                  required
                  onChange={(e) => setName(e.target.value)}
                  style={{ height: '48px' }}
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-medium text-muted">Username</label>
                <input
                  type="text"
                  className="form-control p-3"
                  placeholder="Choose a username"
                  value={userName}
                  required
                  onChange={(e) => setUserName(e.target.value)}
                  style={{ height: '48px' }}
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label fw-medium text-muted">Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control p-3"
                    placeholder="Create a password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ height: '48px' }}
                  />
                  <button 
                    className="btn btn-outline-secondary border-start-0 bg-light" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ width: '80px' }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="form-text">Use 6 or more characters with a mix of letters, numbers & symbols</div>
              </div>
              
              <div className="form-check mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="termsCheck"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <label className="form-check-label text-muted small" htmlFor="termsCheck">
                  I agree to the <a href="#" className="text-primary text-decoration-none">Terms of Service</a> and{' '}
                  <a href="#" className="text-primary text-decoration-none">Privacy Policy</a>
                </label>
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
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
              
              <div className="text-center">
                <p className="mb-0 text-muted">
                  Already have an account?{' '}
                  <Link to="/login" className="fw-medium text-primary text-decoration-none">
                    Sign In
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

export default Register;
