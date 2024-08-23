"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Modal Component
function Modal({ show, onClose, children }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
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

  const router = useRouter();
  const handleViewUser = (employee) => {
    const employeeData = JSON.stringify(employee);
    router.push(
      `/employee/${employee.id}?data=${encodeURIComponent(employeeData)}`
    );
  };

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
        console.log(employeeData);
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
          activeEmployee: emp.activeEmployee,
          phoneNumber: emp.phoneNumber,
          address: emp.address,
          dateOfBirth: emp.dateOfBirth,
          joiningDate: emp.joiningDate,
          pin: emp.pin, // Added pin
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

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-gray-800">Admin View</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
        >
          Add Employee
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
                <th className="py-3 px-4 border-b">Mobile Details</th>
                <th className="py-3 px-4 border-b">Checkout Location</th>
                <th className="py-3 px-4 border-b">Checkout Mobile Details</th>
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
                    {employee.mobileDetails}
                  </td>
                  <td className="py-3 px-4 border-b">
                    {employee.checkOutLocation}
                  </td>
                  <td className="py-3 px-4 border-b">
                    {employee.checkOutMobileDetails}
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
                  <td className="py-3 px-4 border-b">
                    <button
                      onClick={() => handleViewUser(employee)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleSaveAttendance(employee.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 ml-2"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <h2 className="text-xl font-semibold mb-4">Add New Employee</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={newEmployee.employeeName}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, employeeName: e.target.value })
            }
            placeholder="Name"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            value={newEmployee.designation}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, designation: e.target.value })
            }
            placeholder="Position"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            value={newEmployee.phoneNumber}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, phoneNumber: e.target.value })
            }
            placeholder="Phone Number"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <label className="flex items-center space-x-4">Date of Birth</label>
          <input
            type="date"
            value={newEmployee.dateOfBirth}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, dateOfBirth: e.target.value })
            }
            placeholder="Date of Birth"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <label className="flex items-center space-x-4">Date of Joining</label>
          <input
            type="date"
            value={newEmployee.joiningDate}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, joiningDate: e.target.value })
            }
            placeholder="Joining Date"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {/* <input
            type="text"
            value={newEmployee.checkInLocation}
            onChange={(e) =>
              setNewEmployee({
                ...newEmployee,
                checkInLocation: e.target.value,
              })
            }
            placeholder="Check-in Location"
            className="w-full p-2 border border-gray-300 rounded-md"
          /> */}
          {/* <input
            type="text"
            value={newEmployee.mobileDetails}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, mobileDetails: e.target.value })
            }
            placeholder="Mobile Details"
            className="w-full p-2 border border-gray-300 rounded-md"
          /> */}
          <input
            type="text"
            value={newEmployee.address}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, address: e.target.value })
            }
            placeholder="Address"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {/* <input
            type="number"
            value={newEmployee.basicSalary}
            onChange={(e) =>
              setNewEmployee({
                ...newEmployee,
                basicSalary: Number(e.target.value),
              })
            }
            placeholder="Basic Salary"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input
            type="number"
            value={newEmployee.houseRent}
            onChange={(e) =>
              setNewEmployee({
                ...newEmployee,
                houseRent: Number(e.target.value),
              })
            }
            placeholder="House Rent"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input
            type="number"
            value={newEmployee.medicalAllowance}
            onChange={(e) =>
              setNewEmployee({
                ...newEmployee,
                medicalAllowance: Number(e.target.value),
              })
            }
            placeholder="Medical Allowance"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input
            type="number"
            value={newEmployee.providentFund}
            onChange={(e) =>
              setNewEmployee({
                ...newEmployee,
                providentFund: Number(e.target.value),
              })
            }
            placeholder="Provident Fund"
            className="w-full p-2 border border-gray-300 rounded-md"
          /> */}
          <input
            type="text"
            value={newEmployee.pin}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, pin: e.target.value })
            }
            placeholder="PIN"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={() => setShowModal(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleAddEmployee}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Employee
          </button>
        </div>
      </Modal>
    </main>
  );
}
