"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddEmployee() {
  const [employee, setEmployee] = useState({
    employeeName: "",
    designation: "",
    phoneNumber: "",
    dateOfBirth: "",
    joiningDate: "",
    address: "",
    basicSalary: 0,
    hra: 0,
    travelingAllowance: 0,
    grossSalary: 0,
    employeeContribution: 0,
    pf: 0,
    esicMedicalIns: 0,
    pin: "",
  });

  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  const handleSubmit = () => {
    fetch("https://attendancemaker.onrender.com/addEmployee", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(employee),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Employee saved successfully") {
          router.push("/"); // Redirect to home or any other page after adding
        } else {
          console.error("Failed to add an employee");
        }
      })
      .catch((error) => console.error("Error adding employee:", error));
  };

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">
        Add New Employee
      </h1>
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg mx-auto">
        <div className="space-y-4">
          <div>
            <label htmlFor="employeeName" className="block text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="employeeName"
              name="employeeName"
              value={employee.employeeName}
              onChange={handleInputChange}
              placeholder="Enter employee name"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="designation" className="block text-gray-700">
              Position
            </label>
            <input
              type="text"
              id="designation"
              name="designation"
              value={employee.designation}
              onChange={handleInputChange}
              placeholder="Enter position"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={employee.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="dateOfBirth" className="block text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={employee.dateOfBirth}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="joiningDate" className="block text-gray-700">
              Joining Date
            </label>
            <input
              type="date"
              id="joiningDate"
              name="joiningDate"
              value={employee.joiningDate}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={employee.address}
              onChange={handleInputChange}
              placeholder="Enter address"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="basicSalary" className="block text-gray-700">
              Basic Salary
            </label>
            <input
              type="number"
              id="basicSalary"
              name="basicSalary"
              value={employee.basicSalary}
              onChange={handleInputChange}
              placeholder="Enter basic salary"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="hra" className="block text-gray-700">
              HRA
            </label>
            <input
              type="number"
              id="hra"
              name="hra"
              value={employee.hra}
              onChange={handleInputChange}
              placeholder="Enter HRA"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="travelingAllowance" className="block text-gray-700">
              Traveling Allowance
            </label>
            <input
              type="number"
              id="travelingAllowance"
              name="travelingAllowance"
              value={employee.travelingAllowance}
              onChange={handleInputChange}
              placeholder="Enter traveling allowance"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="grossSalary" className="block text-gray-700">
              Gross Salary
            </label>
            <input
              type="number"
              id="grossSalary"
              name="grossSalary"
              value={employee.grossSalary}
              onChange={handleInputChange}
              placeholder="Enter gross salary"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="employeeContribution"
              className="block text-gray-700"
            >
              Employee Contribution
            </label>
            <input
              type="number"
              id="employeeContribution"
              name="employeeContribution"
              value={employee.employeeContribution}
              onChange={handleInputChange}
              placeholder="Enter employee contribution"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="pf" className="block text-gray-700">
              PF
            </label>
            <input
              type="number"
              id="pf"
              name="pf"
              value={employee.pf}
              onChange={handleInputChange}
              placeholder="Enter PF"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="esicMedicalIns" className="block text-gray-700">
              ESIC / Medical Ins
            </label>
            <input
              type="number"
              id="esicMedicalIns"
              name="esicMedicalIns"
              value={employee.esicMedicalIns}
              onChange={handleInputChange}
              placeholder="Enter ESIC / Medical Ins"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="pin" className="block text-gray-700">
              PIN
            </label>
            <input
              type="text"
              id="pin"
              name="pin"
              value={employee.pin}
              onChange={handleInputChange}
              placeholder="Enter PIN"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={() => router.push("/")}
            className="bg-gray-500 text-white px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Employee
          </button>
        </div>
      </div>
    </main>
  );
}
