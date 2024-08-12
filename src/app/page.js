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
    phoneNumber: "",
    dateOfBirth: "",
    checkInLocation: "",
    mobileDetails: "",
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
        // console.log(employeeData);
        const formattedData = employeeData.map((emp) => ({
          id: emp._id, // Ensure the ID is correctly formatted
          name: emp.employeeName,
          position: emp.designation,
          checkInLocation: emp.checkInLocation || "", // Handle check-in location
          mobileDetails: emp.mobileDetails || "", // Handle mobile details
          attendance: "Absent", // Default value for attendance
          isAttendanceChanged: false, // New field to track attendance changes
        }));

        // Fetch attendance status for each employee
        const attendancePromises = formattedData.map((employee) =>
          fetch(
            `https://attendancemaker.onrender.com/attendanceStatus?employeeId=${employee.id}`
          )
            .then((response) => response.json())
            .then((attendanceData) => {
              console.log("Attendance Data:", attendanceData); // Debugging log

              return {
                ...employee,
                attendance: attendanceData.status,
                checkInLocation: attendanceData.location
                  ? `(${attendanceData.location.latitude}, ${attendanceData.location.longitude})`
                  : "No location", // Format location
                mobileDetails: attendanceData.mobileDetails
                  ? `IMEI: ${attendanceData.mobileDetails.imei}, Model: ${attendanceData.mobileDetails.model}`
                  : "No mobile details", // Handle mobile details
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
        checkInLocation: newEmployee.checkInLocation,
        mobileDetails: newEmployee.mobileDetails,
        activeEmployee: true,
        salary: 0, // You may need to update this field as per your requirements
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
              id: newEmployeeData._id, // Ensure the ID is correctly formatted
              name: newEmployeeData.employeeName,
              position: newEmployeeData.designation,
              checkInLocation: newEmployeeData.location || "", // Handle check-in location
              mobileDetails: newEmployeeData.mobileDetails || "", // Handle mobile details
              attendance: "Absent", // Default value for new employee
              isAttendanceChanged: false,
            },
          ]);
          setNewEmployee({
            employeeName: "",
            designation: "",
            phoneNumber: "",
            dateOfBirth: "",
            checkInLocation: "",
            mobileDetails: "",
          });
          setShowModal(false);
        } else {
          console.error("Failed to add an employee");
        }
      })
      .catch((error) => console.error("Error adding employee:", error));
  };

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
            emp.id === id
              ? { ...emp, isAttendanceChanged: false } // Reset the change flag
              : emp
          );
          setEmployees(updatedEmployees);
        } else {
          console.error("Failed to update attendance");
        }
      })
      .catch((error) => console.error("Error updating attendance:", error));
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
              <th className="py-2 border">Check-in Location</th>
              <th className="py-2 border">Mobile Details</th>
              <th className="py-2 border">Attendance</th>
              <th className="py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="py-2 border text-center">{employee.id}</td>
                <td className="py-2 border">{employee.name}</td>
                <td className="py-2 border">{employee.position}</td>
                <td className="py-2 border text-center">
                  {employee.checkInLocation}
                </td>
                <td className="py-2 border text-center">
                  {employee.mobileDetails}
                </td>
                <td className="py-2 border text-center">
                  <select
                    value={employee.attendance}
                    onChange={(e) =>
                      handleAttendanceChange(employee.id, e.target.value)
                    }
                    className="border p-2 rounded"
                  >
                    <option value="Check In">Check In</option>
                    <option value="Check Out">Check Out</option>
                    <option value="Absent">Absent</option>
                  </select>
                </td>
                <td className="py-2 border text-center">
                  <button
                    onClick={() => handleSaveAttendance(employee.id)}
                    className={`bg-green-500 text-white p-2 rounded ${
                      !employee.isAttendanceChanged &&
                      "opacity-50 cursor-not-allowed"
                    }`}
                    disabled={!employee.isAttendanceChanged} // Disable button if no changes made
                  >
                    Save
                  </button>
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
          className="border p-2 mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Check-in Location"
          value={newEmployee.checkInLocation}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, checkInLocation: e.target.value })
          }
          className="border p-2 mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Mobile Details"
          value={newEmployee.mobileDetails}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, mobileDetails: e.target.value })
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
