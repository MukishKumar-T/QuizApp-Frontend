import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import QuizSelection from "./components/QuizSelection";
import Quiz from "./components/Quiz";
import QuizDetail from "./components/QuizDetail";
import Leaderboard from "./components/Leaderboard";
import AdminDashboard from "./components/AdminDashboard";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Header /> {/* This renders on all pages */}
      <div className="container mt-4">
        <Routes>

          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/select" element={<QuizSelection />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quiz/:id" element={<QuizDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
