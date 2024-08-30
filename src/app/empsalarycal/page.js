"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";

function EmpSalaryCalComponent() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [employee, setEmployee] = useState({});
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("employeeId");

  useEffect(() => {
    // Fetch employee details
    fetch(`https://attendancemaker.onrender.com/employee/${employeeId}`)
      .then((response) => response.json())
      .then((data) => {
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
        setAttendanceRecords(attendanceData.attendanceRecords);
        setFilteredRecords(attendanceData.attendanceRecords); // Initially, all records are shown
      })
      .catch((error) => {
        console.error("Error fetching attendance records:", error);
      });
  }, [employeeId]);

  // Filter records based on date range
  const filterRecords = () => {
    const filtered = attendanceRecords.filter((record) => {
      const recordDate = new Date(record.date);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      return (!from || recordDate >= from) && (!to || recordDate <= to);
    });
    setFilteredRecords(filtered);
  };

  // Export filtered data to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredRecords);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Records");
    XLSX.writeFile(workbook, "attendance_records.xlsx");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">
        Attendance Records for {employee.employeeName}
      </h1>

      {/* Date Range Filters */}
      <div className="mb-4">
        <label className="mr-2">From:</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border p-2 rounded-md mr-4"
        />
        <label className="mr-2">To:</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border p-2 rounded-md mr-4"
        />
        <button
          onClick={filterRecords}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Apply Filters
        </button>
      </div>

      {filteredRecords.length > 0 ? (
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
            {filteredRecords.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b">{record.date}</td>
                <td className="py-3 px-4 border-b">{record.status}</td>
                <td className="py-3 px-4 border-b">{record.checkInTime}</td>
                <td className="py-3 px-4 border-b">{record.checkOutTime}</td>
                <td className="py-3 px-4 border-b">
                  {record.location?.latitude}, {record.location?.longitude}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center text-gray-500">
          No attendance records available for this employee.
        </div>
      )}

      {/* Export to Excel Button */}
      <button
        onClick={exportToExcel}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Export to Excel
      </button>

      <button
        onClick={() => router.push("/")}
        className="mt-6 ml-4 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
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
