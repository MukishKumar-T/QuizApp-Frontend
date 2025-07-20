import React from 'react';
import { Link } from 'react-router-dom';    
import './Header.css';

const Header = () => {
  return (
    <div className="header">
      <h1 className="title">Welcome to Employee Management System</h1>
      <nav className="nav">
        <ul className="li-list">
          <li className="li-item"><Link to="/">Home</Link></li>
          <li className="li-item"><Link to="/login">Login</Link></li>
          <li className="li-item"><Link to="/register">Register</Link></li>
          <li className="li-item"><Link to="/employee">View Employees</Link></li>
          <li className="li-item"><Link to="/addEmployee">Add Employee</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Header;
