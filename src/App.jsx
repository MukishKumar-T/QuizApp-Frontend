import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import QuizSelection from "./components/QuizSelection";
import Quiz from "./components/Quiz";
import QuizDetail from "./components/QuizDetail";
import LandingPage from "./components/LandingPage";
import Leaderboard from "./components/Leaderboard";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import ContributeQuiz from "./components/ContributeQuiz";
import 'bootstrap/dist/css/bootstrap.min.css';
import './components/QuizApp.css';
import './styles/cardStyles.css';

function App() {
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '1rem 0'
    }}>
      <Router>
        <Header /> {/* This renders on all pages */}
        <div className="container mt-0" style={{ minHeight: 'calc(100vh - 120px)' }}>
          <Routes>

          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/select" element={<QuizSelection />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quiz/:id" element={<QuizDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/contribute" element={<ContributeQuiz />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
