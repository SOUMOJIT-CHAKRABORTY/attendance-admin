"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EmployeeDetails() {
  const searchParams = useSearchParams();
  const [employee, setEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    joiningDate: "",
    pin: "",
  });

  useEffect(() => {
    const employeeData = searchParams.get("data");
    if (employeeData) {
      const parsedData = JSON.parse(employeeData);
      setEmployee(parsedData);
      setFormData({
        phoneNumber: parsedData.phoneNumber || "",
        address: parsedData.address || "",
        dateOfBirth: parsedData.dateOfBirth
          ? new Date(parsedData.dateOfBirth).toISOString().split("T")[0]
          : "",
        joiningDate: parsedData.joiningDate
          ? new Date(parsedData.joiningDate).toISOString().split("T")[0]
          : "",
        pin: parsedData.pin || "",
      });
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSave = async () => {
    const updatedEmployee = {
      ...employee,
      ...formData,
    };

    try {
      const response = await fetch(
        `https://attendancemaker.onrender.com/updateEmployee/${employee.id}`,
        {
          method: "PUT", // Use "POST" or "PUT" depending on your backend
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedEmployee),
        }
      );

      if (response.ok) {
        const updatedData = await response.json();
        setEmployee(updatedData);
        setIsEditing(false);
        alert("Employee details updated successfully!");
      } else {
        alert("Failed to update employee details.");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("An error occurred while updating employee details.");
    }
  };

  if (!employee) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{employee.name}</h1>
      <p className="text-lg text-gray-600 mb-6">
        Position: {employee.position}
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* Contact Information */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold">Contact Information</h3>
          {isEditing ? (
            <div>
              <label className="block">
                <span>Phone:</span>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="block w-full mt-1 p-2 border rounded"
                />
              </label>
              <label className="block mt-4">
                <span>Address:</span>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="block w-full mt-1 p-2 border rounded"
                />
              </label>
            </div>
          ) : (
            <div>
              <p>
                <strong>Phone:</strong> {employee.phoneNumber || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {employee.address || "N/A"}
              </p>
            </div>
          )}
        </div>

        {/* Employee Status */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold">Employee Status</h3>
          <p>
            <strong>Active:</strong> {employee.activeEmployee ? "Yes" : "No"}
          </p>
          <p>
            <strong>Attendance:</strong> {employee.attendance}
          </p>
        </div>

        {/* Location Information */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold">Location Information</h3>
          <p>
            <strong>Check-in Location:</strong>{" "}
            {employee.checkInLocation || "N/A"}
          </p>
          <p>
            <strong>Checkout Location:</strong>{" "}
            {employee.checkOutLocation || "N/A"}
          </p>
        </div>

        {/* Mobile Details */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold">Mobile Details</h3>
          <p>
            <strong>Check-in Mobile:</strong> {employee.mobileDetails || "N/A"}
          </p>
          <p>
            <strong>Checkout Mobile:</strong>{" "}
            {employee.checkOutMobileDetails || "N/A"}
          </p>
        </div>

        {/* Personal Information */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold">Personal Information</h3>
          {isEditing ? (
            <div>
              <label className="block">
                <span>Date of Birth:</span>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="block w-full mt-1 p-2 border rounded"
                />
              </label>
              <label className="block mt-4">
                <span>Joining Date:</span>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  className="block w-full mt-1 p-2 border rounded"
                />
              </label>
            </div>
          ) : (
            <div>
              <p>
                <strong>Date of Birth:</strong>{" "}
                {new Date(employee.dateOfBirth).toLocaleDateString()}
              </p>
              <p>
                <strong>Joining Date:</strong>{" "}
                {new Date(employee.joiningDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Security */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold">Security</h3>
          {isEditing ? (
            <label className="block">
              <span>PIN:</span>
              <input
                type="number"
                name="pin"
                value={formData.pin}
                onChange={handleInputChange}
                className="block w-full mt-1 p-2 border rounded"
              />
            </label>
          ) : (
            <p>
              <strong>PIN:</strong> {employee.pin}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6">
        {isEditing ? (
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={handleSave}
          >
            Save
          </button>
        ) : (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
