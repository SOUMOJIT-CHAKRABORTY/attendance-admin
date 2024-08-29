"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function EmpSalaryCalComponent() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employee, setEmployee] = useState({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("employeeId");

  useEffect(() => {
    // Fetch employee details
    fetch(`https://attendancemaker.onrender.com/employee/${employeeId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setEmployee(data.employee);
      })
      .catch((error) => {
        console.error("Error fetching employee data:", error);
      });

    // Fetch employee attendance records
    fetch(
      `https://attendancemaker.onrender.com/attendanceHistory?employeeId=${employeeId}`
    )
      .then((response) => response.json())
      .then((attendanceData) => {
        console.log(attendanceData);
        setAttendanceRecords(attendanceData.attendanceRecords);
      })
      .catch((error) => {
        console.error("Error fetching attendance records:", error);
      });
  }, [employeeId]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">
        Attendance Records for {employee.employeeName}
      </h1>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
        <thead className="bg-gray-200 text-gray-600 uppercase text-xs">
          <tr>
            <th className="py-3 px-4 border-b">Date</th>
            <th className="py-3 px-4 border-b">Status</th>
            <th className="py-3 px-4 border-b">Check-in Time</th>
            <th className="py-3 px-4 border-b">Check-out Time</th>
            <th className="py-3 px-4 border-b">Location</th>
          </tr>
        </thead>
        <tbody>
          {attendanceRecords.map((record, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="py-3 px-4 border-b">{record.date}</td>
              <td className="py-3 px-4 border-b">{record.status}</td>
              <td className="py-3 px-4 border-b">{record.checkInTime}</td>
              <td className="py-3 px-4 border-b">{record.checkOutTime}</td>
              <td className="py-3 px-4 border-b">
                {record.location.latitude}, {record.location.longitude}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={() => router.push("/")}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Back to Admin View
      </button>
    </div>
  );
}

export default function EmpSalaryCal() {
  return (
    <Suspense fallback={<div>Loading employee data...</div>}>
      <EmpSalaryCalComponent />
    </Suspense>
  );
}
