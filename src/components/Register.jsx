import { useState } from "react";
import axios from "axios";
import './Register.css';

const Register = () => {
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const handleRegister = async (event) => {                            //ROLL NO: 23CS097
      event.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/auth/register", {
        name,
        userName,
        email,
        password,
        roleNames: [role],
      });
      alert("Registration successful!");
      setName("");
      setUserName("");
      setEmail("");
      setPassword("");
      setRole("");
    } catch (error) {
      console.error("Registration failed", error);
      alert("Registration failed");
    }
  };

  return (
    <div className="container">
      <h1 className="register-heading">Create New Account</h1>
      <form onSubmit={handleRegister} className="register-form">

        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />

        <label htmlFor="userName">Username</label>
        <input
          id="userName"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Enter username"
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
        />

        <label>User Role</label>
        <div>
          <input
            type="radio"
            name="role"
            value="ROLE_ADMIN"
            checked={role === "ROLE_ADMIN"}
            onChange={(e) => setRole(e.target.value)}
          /> Admin
          <input
            type="radio"
            name="role"
            value="ROLE_USER"
            checked={role === "ROLE_USER"}
            onChange={(e) => setRole(e.target.value)}
          /> User
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
