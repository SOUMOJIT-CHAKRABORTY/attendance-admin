"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    employeeName: "",
    designation: "",
    phoneNumber: "",
    dateOfBirth: "",
    joiningDate: "",
    checkInLocation: "",
    mobileDetails: "",
    activeEmployee: true,
    salary: 0,
    address: "",
    basicSalary: 0,
    houseRent: 0,
    medicalAllowance: 0,
    providentFund: 0,
    pin: "",
  });
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [inputPassword, setInputPassword] = useState("");

  const router = useRouter();

  // Define a hardcoded password
  const hardcodedPassword = "adminpass";

  // Check if user is already authenticated
  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleViewUser = (employee) => {
    const employeeData = JSON.stringify(employee);
    router.push(
      `/employee/${employee.id}?data=${encodeURIComponent(employeeData)}`
    );
  };

  const handleAddEmployee = () => {
    router.push("/add-employee");
  };

  const handlePasswordSubmit = () => {
    if (inputPassword === hardcodedPassword) {
      localStorage.setItem("isAuthenticated", "true"); // Save authentication status
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  const handleDeleteEmployee = (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      fetch(`https://attendancemaker.onrender.com/deleteEmployee/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Employee deleted successfully") {
            // Remove the deleted employee from the state
            const updatedEmployees = employees.filter(
              (employee) => employee.id !== id
            );
            setEmployees(updatedEmployees);
          } else {
            console.error("Failed to delete employee");
          }
        })
        .catch((error) => console.error("Error deleting employee:", error));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
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
            id: emp._id,
            name: emp.employeeName,
            position: emp.designation,
            checkInLocation: emp.checkInLocation || "",
            mobileDetails: emp.mobileDetails || "",
            checkoutLocation: emp.checkoutLocation || "",
            checkoutMobileDetails: emp.checkoutMobileDetails || "",
            attendance: "Absent",
            isAttendanceChanged: false,
            activeEmployee: emp.activeEmployee,
            phoneNumber: emp.phoneNumber,
            address: emp.address,
            dateOfBirth: emp.dateOfBirth,
            joiningDate: emp.joiningDate,
            salary: emp.salary,
            pin: emp.pin,
          }));
          console.log("Formatted data:", formattedData);

          // Fetch attendance status for each employee
          const attendancePromises = formattedData.map((employee) =>
            fetch(
              `https://attendancemaker.onrender.com/attendanceStatus?employeeId=${employee.id}`
            )
              .then((response) => response.json())
              .then((attendanceData) => {
                return {
                  ...employee,
                  attendance: attendanceData.status,
                  checkInLocation: attendanceData.location
                    ? `(${attendanceData.location.latitude}, ${attendanceData.location.longitude})`
                    : "No location",
                  mobileDetails: attendanceData.mobileDetails
                    ? `IMEI: ${attendanceData.mobileDetails.imei}, Model: ${attendanceData.mobileDetails.model}`
                    : "No mobile details",
                  checkOutLocation: attendanceData.checkOutLocation
                    ? `(${attendanceData.checkOutLocation.latitude}, ${attendanceData.checkOutLocation.longitude})`
                    : "No location",
                  checkOutMobileDetails: attendanceData.checkOutMobileDetails
                    ? `IMEI: ${attendanceData.checkOutMobileDetails.imei}, Model: ${attendanceData.checkOutMobileDetails.model}`
                    : "No mobile details",
                };
              })
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
    }
  }, [isAuthenticated]);

  const handleAttendanceChange = (id, newStatus) => {
    const updatedEmployees = employees.map((employee) =>
      employee.id === id
        ? { ...employee, attendance: newStatus, isAttendanceChanged: true }
        : employee
    );
    setEmployees(updatedEmployees);
  };

  const handleSaveAttendance = (id) => {
    const employee = employees.find((emp) => emp.id === id);

    fetch(`https://attendancemaker.onrender.com/updateAttendance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeId: id,
        status: employee.attendance,
        name: employee.name,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Attendance updated successfully") {
          const updatedEmployees = employees.map((emp) =>
            emp.id === id ? { ...emp, isAttendanceChanged: false } : emp
          );
          setEmployees(updatedEmployees);
        } else {
          console.error("Failed to update attendance");
        }
      })
      .catch((error) => console.error("Error updating attendance:", error));
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
  };

  const handleRedirectToSalaryPage = (employeeId) => {
    router.push(`/empsalarycal?employeeId=${employeeId}`);
  };

  if (!isAuthenticated) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Password Protected</h2>
          <input
            type="password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
          />
          <button
            onClick={handlePasswordSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-gray-800">Admin View</h1>
        <button
          onClick={handleAddEmployee}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
        >
          Add Employee
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition duration-200"
        >
          Logout
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead className="bg-gray-200 text-gray-600 uppercase text-xs">
              <tr>
                <th className="py-3 px-4 border-b">Name</th>
                <th className="py-3 px-4 border-b">Position</th>
                <th className="py-3 px-4 border-b">Check-in Location</th>
                <th className="py-3 px-4 border-b">Checkout Location</th>
                <th className="py-3 px-4 border-b">Attendance</th>
                <th className="py-3 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-gray-50 transition duration-200"
                >
                  <td className="py-3 px-4 border-b">{employee.name}</td>
                  <td className="py-3 px-4 border-b">{employee.position}</td>
                  <td className="py-3 px-4 border-b">
                    {employee.checkInLocation}
                  </td>
                  <td className="py-3 px-4 border-b">
                    {employee.checkOutLocation}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <select
                      value={employee.attendance}
                      onChange={(e) =>
                        handleAttendanceChange(employee.id, e.target.value)
                      }
                      className="p-1 border border-gray-300 rounded-md"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Checked In">Checked In</option>
                      <option value="Checked Out">Checked Out</option>
                    </select>
                  </td>
                  {/* <td className="py-3 px-4 border-b flex space-x-2">
                    <button
                      onClick={() => handleViewUser(employee)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleSaveAttendance(employee.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td> */}
                  <td className="py-3 px-4 border-b flex space-x-2">
                    <button
                      onClick={() => handleViewUser(employee)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleSaveAttendance(employee.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleRedirectToSalaryPage(employee.id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                    >
                      Salary & Attendance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
