import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Header from "./components/Header";
import Employees from "./components/Employees";
import AddEmployee from "./components/AddEmployee";

function App() {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Login />} />
          <Route path="/employee" element={<Employees/>} />
          <Route path="/addEmployee" element={<AddEmployee/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
