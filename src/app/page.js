"use client";
import { useState, useEffect } from "react";

// Modal Component
function Modal({ show, onClose, children }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    employeeName: "",
    designation: "",
    basicSalary: "",
    houseRent: "",
    joiningDate: "",
    phoneNumber: "",
    dateOfBirth: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    // Fetch employee data
    fetch("https://attendancemaker.onrender.com/employees")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((employeeData) => {
        const formattedData = employeeData.map((emp) => ({
          id: emp._id, // Ensure the ID is correctly formatted
          name: emp.employeeName,
          position: emp.designation,
          basicSalary: emp.basicSalary,
          houseRent: emp.houseRent,
          joiningDate: emp.joiningDate,
          attendance: "Absent", // Default value for attendance
        }));

        // Fetch attendance status for each employee
        const attendancePromises = formattedData.map((employee) =>
          fetch(
            `https://attendancemaker.onrender.com/attendanceStatus?employeeId=${employee.id}`
          )
            .then((response) => response.json())
            .then((attendanceData) => ({
              ...employee,
              attendance: attendanceData.status,
            }))
        );

        Promise.all(attendancePromises)
          .then((updatedEmployees) => {
            setEmployees(updatedEmployees);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching attendance status:", error);
            setLoading(false);
          });
      })
      .catch((error) => {
        console.error("Error fetching employee data:", error);
        setLoading(false);
      });
  }, []);

  const handleAddEmployee = () => {
    fetch("https://attendancemaker.onrender.com/addEmployee", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeName: newEmployee.employeeName,
        designation: newEmployee.designation,
        phoneNumber: newEmployee.phoneNumber,
        dateOfBirth: newEmployee.dateOfBirth,
        joiningDate: newEmployee.joiningDate,
        activeEmployee: true,
        basicSalary: newEmployee.basicSalary,
        houseRent: newEmployee.houseRent,
        medicalAllowance: 0,
        providentFund: 0,
        salary:
          parseFloat(newEmployee.basicSalary) +
          parseFloat(newEmployee.houseRent),
        address: "",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Employee saved successfully") {
          const newEmployeeData = data.employee; // Use the newly created employee data from the response
          setEmployees([
            ...employees,
            {
              id: newEmployeeData._id.$oid, // Ensure the ID is correctly formatted
              name: newEmployeeData.employeeName,
              position: newEmployeeData.designation,
              basicSalary: newEmployeeData.basicSalary,
              houseRent: newEmployeeData.houseRent,
              joiningDate: newEmployeeData.joiningDate,
              attendance: "Absent", // Default value for new employee
            },
          ]);
          setNewEmployee({
            employeeName: "",
            designation: "",
            basicSalary: "",
            houseRent: "",
            joiningDate: "",
            phoneNumber: "",
            dateOfBirth: "",
          });
          setShowModal(false);
        } else {
          console.error("Failed to add an employee");
        }
      })
      .catch((error) => console.error("Error adding employee:", error));
  };

  return (
    <main className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-bold">Admin View</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Add Employee
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <div className="loader"></div>
        </div>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 border">ID</th>
              <th className="py-2 border">Name</th>
              <th className="py-2 border">Position</th>
              <th className="py-2 border">Basic Pay</th>
              <th className="py-2 border">HRA</th>
              <th className="py-2 border">Joining Date</th>
              <th className="py-2 border">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="py-2 border text-center">{employee.id}</td>
                <td className="py-2 border">{employee.name}</td>
                <td className="py-2 border">{employee.position}</td>
                <td className="py-2 border text-right">
                  {employee.basicSalary}
                </td>
                <td className="py-2 border text-right">{employee.houseRent}</td>
                <td className="py-2 border text-center">
                  {employee.joiningDate}
                </td>
                <td className="py-2 border text-center">
                  {employee.attendance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <h2 className="text-2xl font-bold mb-4">Add New Employee</h2>
        <input
          type="text"
          placeholder="Name"
          value={newEmployee.employeeName}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, employeeName: e.target.value })
          }
          className="border p-2 mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Position"
          value={newEmployee.designation}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, designation: e.target.value })
          }
          className="border p-2 mb-2 w-full"
        />
        <input
          type="number"
          placeholder="Basic Pay"
          value={newEmployee.basicSalary}
          onChange={(e) =>
            setNewEmployee({
              ...newEmployee,
              basicSalary: e.target.value,
            })
          }
          className="border p-2 mb-2 w-full"
        />
        <input
          type="number"
          placeholder="HRA"
          value={newEmployee.houseRent}
          onChange={(e) =>
            setNewEmployee({
              ...newEmployee,
              houseRent: e.target.value,
            })
          }
          className="border p-2 mb-2 w-full"
        />
        <label className="block mb-2 text-gray-500">Joining Date</label>
        <input
          type="date"
          value={newEmployee.joiningDate}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, joiningDate: e.target.value })
          }
          className="border p-2 mb-2 w-full"
        />
        <label className="block mb-2 text-gray-500">Date of Birth</label>
        <input
          type="date"
          value={newEmployee.dateOfBirth}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, dateOfBirth: e.target.value })
          }
          className="border p-2 mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={newEmployee.phoneNumber}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, phoneNumber: e.target.value })
          }
          className="border p-2 mb-4 w-full"
        />
        <button
          onClick={handleAddEmployee}
          className="bg-blue-500 text-white p-2 w-full rounded"
        >
          Add Employee
        </button>
      </Modal>
    </main>
  );
}
