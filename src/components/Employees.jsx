import { useEffect, useState } from "react";
import axios from "axios";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [editEmpId, setEditEmpId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    job: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("https://quiz-backend-3ws6.onrender.com/employee", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setEmployees(response.data);
      })
      .catch((error) => {
        console.error("Error fetching employees:", error);
        setError("Failed to fetch employee data");
      });
  }, []);

  const handleEditClick = (emp) => {
    setEditEmpId(emp.empId);
    setEditFormData({ name: emp.name, job: emp.job });
  };

  const handleCancelClick = () => {
    setEditEmpId(null);
    setEditFormData({ name: "", job: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = (empId) => {
    const token = localStorage.getItem("token");

    // Optimistically update UI
    setEmployees((prevEmployees) =>
      prevEmployees.map((emp) =>
        emp.empId === empId ? { ...emp, ...editFormData } : emp
      )
    );
    setEditEmpId(null);
    setEditFormData({ name: "", job: "" });

    // Then send the API request
    axios
      .put(
        `https://quiz-backend-3ws6.onrender.com/employee/${empId}`,
        {
          name: editFormData.name,
          job: editFormData.job,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .catch((error) => {
        console.error("Error updating employee:", error);
        setError("Error Updating Employee");
        // Optionally: revert optimistic update here or refetch employees
      });
  };


  return (
    <div>
      <h2>Employee List</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Job</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.empId}>
                <td>{emp.empId}</td>
                <td>
                  {editEmpId === emp.empId ? (
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    emp.name
                  )}
                </td>
                <td>
                  {editEmpId === emp.empId ? (
                    <input
                      type="text"
                      name="job"
                      value={editFormData.job}
                      onChange={handleInputChange}
                    />
                  ) : (
                    emp.job
                  )}
                </td>
                <td>
                  {editEmpId === emp.empId ? (
                    <>
                      <button onClick={() => handleSaveClick(emp.empId)}>
                        Save
                      </button>
                      <button onClick={handleCancelClick}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => handleEditClick(emp)}>Edit</button>
                  )}
                </td>
                <td>
                  <button>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EmployeeList;
