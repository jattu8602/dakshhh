'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import {
  getSchoolById,
  getClassById,
  addStudent,
  getStudentsByClassId
} from '../../../../../lib/firestore';
import { generateRollNumbers } from '../../../../../lib/utils';

export default function ClassDetailPage({ params }) {
  // Properly unwrap params using React.use()
  const unwrappedParams = use(params);
  const schoolId = unwrappedParams.id;
  const classId = unwrappedParams.classId;

  const [school, setSchool] = useState(null);
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({
    name: '',
    rollNumber: '',
  });

  // Fetch school, class, and student data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch school details
        const schoolData = await getSchoolById(schoolId);
        if (!schoolData) {
          setError('School not found');
          return;
        }
        setSchool(schoolData);

        // Fetch class details
        const classDetails = await getClassById(schoolId, classId);
        if (!classDetails) {
          setError('Class not found');
          return;
        }
        setClassData(classDetails);

        // Fetch students for this class
        const studentsData = await getStudentsByClassId(schoolId, classId);
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId, classId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!newStudent.name || !newStudent.rollNumber) {
      setError('All fields are required');
      return;
    }

    try {
      // Add student to Firestore
      const studentData = await addStudent(schoolId, classId, {
        name: newStudent.name,
        rollNumber: newStudent.rollNumber
      });

      // Update local state
      setStudents(prev => [...prev, studentData]);

      // Close modal and reset form
      setIsModalOpen(false);
      setNewStudent({
        name: '',
        rollNumber: ''
      });
      setError('');
    } catch (error) {
      console.error('Error adding student:', error);
      setError('Failed to add student. Please try again.');
    }
  };

  // Show QR code modal
  const showQRCode = (student) => {
    setSelectedStudent(student);
    setIsQRModalOpen(true);
  };

  // Generate available roll numbers
  const getAvailableRollNumbers = () => {
    if (!classData) return [];

    // Generate all roll numbers for the class
    const allRollNumbers = generateRollNumbers(
      classData.startingRollNumber,
      classData.numberOfStudents
    );

    // Filter out roll numbers that are already assigned
    const usedRollNumbers = students.map(student => student.rollNumber);
    return allRollNumbers.filter(rollNumber => !usedRollNumbers.includes(rollNumber));
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Error state
  if (error && (!school || !classData)) {
    return (
      <div className="p-6 bg-red-50 rounded-md text-red-500">
        <p>{error}</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-500"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm flex-wrap">
        <Link
          href="/dashboard"
          className="text-gray-500 hover:text-gray-700"
        >
          Dashboard
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <Link
          href={`/dashboard/schools/${schoolId}`}
          className="text-gray-500 hover:text-gray-700"
        >
          {school?.name || 'School'}
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <span className="text-gray-900 font-medium">
          {classData?.name || 'Class'}
        </span>
      </nav>

      {/* Class header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Class: {classData?.name}
          </h1>
          <div className="mt-1 text-sm text-gray-500 space-y-1">
            <p>Number of Students: {classData?.numberOfStudents}</p>
            <p>Roll Number Range: {classData?.startingRollNumber} - {classData?.endingRollNumber}</p>
          </div>
        </div>
        {getAvailableRollNumbers().length > 0 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-3 sm:mt-0 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Student
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {/* Students list */}
      {students.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Password
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.rollNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.password}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => showQRCode(student)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View QR Code
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-md">
          <p className="text-gray-500">No students found in this class.</p>
          <p className="text-gray-400 text-sm mt-2">
            Add students to get started.
          </p>
        </div>
      )}

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Student</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setError('');
                  setNewStudent({
                    name: '',
                    rollNumber: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Student Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newStudent.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700">
                    Roll Number
                  </label>
                  <select
                    id="rollNumber"
                    name="rollNumber"
                    value={newStudent.rollNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Select Roll Number</option>
                    {getAvailableRollNumbers().map(rollNumber => (
                      <option key={rollNumber} value={rollNumber}>
                        {rollNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError('');
                    setNewStudent({
                      name: '',
                      rollNumber: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {isQRModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Student QR Code</h3>
              <button
                onClick={() => {
                  setIsQRModalOpen(false);
                  setSelectedStudent(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-center">
              <div className="mb-4">
                <p className="font-medium text-gray-900">{selectedStudent.name}</p>
                <p className="text-sm text-gray-500">Roll Number: {selectedStudent.rollNumber}</p>
              </div>

              {selectedStudent.qrCode ? (
                <div className="flex justify-center">
                  <img
                    src={selectedStudent.qrCode}
                    alt="QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              ) : (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                  QR code not available
                </div>
              )}

              <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-500">
                <p className="mb-1">Username: <span className="font-medium text-gray-700">{selectedStudent.username}</span></p>
                <p>Password: <span className="font-medium text-gray-700">{selectedStudent.password}</span></p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setIsQRModalOpen(false);
                  setSelectedStudent(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}