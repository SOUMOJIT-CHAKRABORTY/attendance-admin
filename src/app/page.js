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
    pin: "", // Added pin
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // State to track selected employee for viewing details
  const [showEmployeeModal, setShowEmployeeModal] = useState(false); // State to control employee details modal

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
          id: emp._id,
          name: emp.employeeName,
          position: emp.designation,
          checkInLocation: emp.checkInLocation || "",
          mobileDetails: emp.mobileDetails || "",
          checkoutLocation: emp.checkoutLocation || "", // Added checkoutLocation
          checkoutMobileDetails: emp.checkoutMobileDetails || "", // Added checkoutMobileDetails
          attendance: "Absent",
          isAttendanceChanged: false,
        }));

        // Fetch attendance status for each employee
        const attendancePromises = formattedData.map((employee) =>
          fetch(
            `https://attendancemaker.onrender.com/attendanceStatus?employeeId=${employee.id}`
          )
            .then((response) => response.json())
            .then((attendanceData) => {
              console.log(attendanceData);
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
                  : "No location", // Added checkOutLocation
                checkOutMobileDetails: attendanceData.checkOutMobileDetails
                  ? `IMEI: ${attendanceData.checkOutMobileDetails.imei}, Model: ${attendanceData.checkOutMobileDetails.model}`
                  : "No mobile details", // Added checkOutMobileDetails
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
        joiningDate: newEmployee.joiningDate,
        activeEmployee: newEmployee.activeEmployee,
        salary: newEmployee.salary,
        address: newEmployee.address,
        basicSalary: newEmployee.basicSalary,
        houseRent: newEmployee.houseRent,
        medicalAllowance: newEmployee.medicalAllowance,
        providentFund: newEmployee.providentFund,
        pin: newEmployee.pin, // Include PIN
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Employee saved successfully") {
          const newEmployeeData = data.employee;
          setEmployees([
            ...employees,
            {
              id: newEmployeeData._id,
              name: newEmployeeData.employeeName,
              position: newEmployeeData.designation,
              attendance: "Absent",
              isAttendanceChanged: false,
            },
          ]);
          setNewEmployee({
            employeeName: "",
            designation: "",
            phoneNumber: "",
            dateOfBirth: "",
            joiningDate: "",
            activeEmployee: true,
            salary: 0,
            address: "",
            basicSalary: 0,
            houseRent: 0,
            medicalAllowance: 0,
            providentFund: 0,
            pin: "", // Reset PIN
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
            emp.id === id ? { ...emp, isAttendanceChanged: false } : emp
          );
          setEmployees(updatedEmployees);
        } else {
          console.error("Failed to update attendance");
        }
      })
      .catch((error) => console.error("Error updating attendance:", error));
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
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
                  <button
                    onClick={() => handleViewDetails(employee)}
                    className="bg-blue-500 text-white p-2 rounded"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal to add new employee */}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <h2 className="text-2xl mb-4">Add Employee</h2>
        {/* Add employee form */}
        <button onClick={handleAddEmployee} className="bg-green-500 text-white p-2 rounded">
          Add Employee
        </button>
      </Modal>

      {/* Modal to view employee details */}
      <Modal show={showEmployeeModal} onClose={() => setShowEmployeeModal(false)}>
        {selectedEmployee && (
          <div>
            <h2 className="text-2xl mb-4">Employee Details</h2>
            <p><strong>ID:</strong> {selectedEmployee.id}</p>
            <p><strong>Name:</strong> {selectedEmployee.name}</p>
            <p><strong>Position:</strong> {selectedEmployee.position}</p>
            <p><strong>Check-In Location:</strong> {selectedEmployee.checkInLocation}</p>
            <p><strong>Mobile Details:</strong> {selectedEmployee.mobileDetails}</p>
            <p><strong>Check-Out Location:</strong> {selectedEmployee.checkOutLocation}</p>
            <p><strong>Check-Out Mobile Details:</strong> {selectedEmployee.checkOutMobileDetails}</p>
          </div>
        )}
      </Modal>
    </main>
  );
}
