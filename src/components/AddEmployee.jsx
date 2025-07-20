import { useState } from "react";
import axios from "axios";
// import './Register.css';

const AddEmployee = () => {
  const [empID, setEmpID] = useState("");
  const [name, setName] = useState("");
  const [job, setJob] = useState("");

  const handleAddEmployee = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post("http://localhost:8080/employee", {
        empId: Number(empID),
        name,
        job,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert("Employee Added Successfully!");
      setEmpID("");
      setName("");
      setJob("");
    } catch (error) {
      console.error("Failed Adding Employee", error);
      alert("Adding Employee Failed");
    }
  };

  return (
    <div className="container">
      <h1 className="register-heading">Add Employee</h1>
      <form onSubmit={handleAddEmployee} className="register-form">

        <label htmlFor="empID">Employee ID</label>
        <input
          id="empID"
          type="number"
          value={empID}
          onChange={(e) => setEmpID(e.target.value)}
          placeholder="Enter Employee Id"
          required
        />

        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter Employee Name"
          required
        />

        <label htmlFor="job">Job</label>
        <input
          id="job"
          type="text"
          value={job}
          onChange={(e) => setJob(e.target.value)}
          placeholder="Enter Job"
          required
        />

        <button type="submit">Add Employee</button>
      </form>
    </div>
  );
};

export default AddEmployee;
