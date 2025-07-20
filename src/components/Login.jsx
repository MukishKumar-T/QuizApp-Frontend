import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        userName,
        password,
      });
      console.log("Login Response:", response.data);

          //Extracting the token from response
          const token = response.data.token;

          if (!token) {
            alert("Login failed: No token received");
            return;
          }

          //Save the token in local storage
          localStorage.setItem("token", token);
          alert("Login Successful");
        } catch (e) {
          console.error("Login Error", e.response?.data || e.message);
          alert("Invalid Credentials");
        }
//       console.log("Token:", response.data);
//       localStorage.setItem("token", response.data.token);
//       alert("Login Successful");
//     } catch (e) {
//       console.error("Login Error", e);
//       alert("Invalid Credentials");
//     }
//     console.log("Form Submitted");
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label htmlFor="userName">User Name</label>
        <input
          id="userName"
          name="userName"
          value={userName}
          type="text"
          onChange={(e) => setUserName(e.target.value)}
        />
        <br /> <br />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <br />
        <button type="submit">Login</button>
        <Link to="/register" style={{ marginLeft: "10px" }}>
          Register
        </Link>
      </form>
    </div>
  );
};

export default Login;
