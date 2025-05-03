'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSchoolById, getClassesBySchoolId, addClass } from '../../../lib/firestore';
import { generateRollNumbers } from '../../../lib/utils';

export default function SchoolDetailPage({ params }) {
  const { id: schoolId } = params;
  const [school, setSchool] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    numberOfStudents: '',
    startingRollNumber: '1',
  });
  const router = useRouter();

  // Fetch school and classes data
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

        // Fetch classes for this school
        const classesData = await getClassesBySchoolId(schoolId);
        setClasses(classesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!newClass.name || !newClass.numberOfStudents || !newClass.startingRollNumber) {
      setError('All fields are required');
      return;
    }

    try {
      // Parse number inputs
      const numberOfStudents = parseInt(newClass.numberOfStudents, 10);

      if (isNaN(numberOfStudents) || numberOfStudents <= 0) {
        setError('Number of students must be a positive number');
        return;
      }

      // Generate the ending roll number based on starting roll number and count
      const rollNumbers = generateRollNumbers(
        newClass.startingRollNumber,
        numberOfStudents
      );

      const endingRollNumber = rollNumbers[rollNumbers.length - 1];

      // Create class data
      const classData = {
        name: newClass.name,
        numberOfStudents,
        startingRollNumber: newClass.startingRollNumber,
        endingRollNumber,
        createdAt: new Date(),
      };

      // Add class to Firestore
      const newClassData = await addClass(schoolId, classData);

      // Update local state
      setClasses(prev => [...prev, newClassData]);

      // Close modal and reset form
      setIsModalOpen(false);
      setNewClass({
        name: '',
        numberOfStudents: '',
        startingRollNumber: '1',
      });
      setError('');
    } catch (error) {
      console.error('Error adding class:', error);
      setError('Failed to add class. Please try again.');
    }
  };

  // Navigate to class detail page
  const navigateToClass = (classId) => {
    router.push(`/dashboard/schools/${schoolId}/classes/${classId}`);
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
  if (error && !school) {
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
      <nav className="flex items-center text-sm">
        <Link
          href="/dashboard"
          className="text-gray-500 hover:text-gray-700"
        >
          Dashboard
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        <span className="text-gray-900 font-medium">{school?.name || 'School'}</span>
      </nav>

      {/* School header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{school?.name}</h1>
          <div className="mt-1 text-sm text-gray-500 space-y-1">
            <p>School ID: {school?.schoolId}</p>
            <p>Email: {school?.email}</p>
            <p>Phone: {school?.phone}</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-3 sm:mt-0 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Class
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {/* Classes list */}
      {classes.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Number of Students
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll Number Range
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classes.map((classItem) => (
                <tr key={classItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {classItem.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {classItem.numberOfStudents}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {classItem.startingRollNumber} - {classItem.endingRollNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigateToClass(classItem.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Manage Students
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-md">
          <p className="text-gray-500">No classes found for this school.</p>
          <p className="text-gray-400 text-sm mt-2">
            Add a class to get started.
          </p>
        </div>
      )}

      {/* Add Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Class</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setError('');
                  setNewClass({
                    name: '',
                    numberOfStudents: '',
                    startingRollNumber: '1',
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
                    Class Name (e.g. 3rd, 5thA)
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newClass.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="numberOfStudents" className="block text-sm font-medium text-gray-700">
                    Number of Students
                  </label>
                  <input
                    type="number"
                    id="numberOfStudents"
                    name="numberOfStudents"
                    min="1"
                    value={newClass.numberOfStudents}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="startingRollNumber" className="block text-sm font-medium text-gray-700">
                    Starting Roll Number (e.g. 1, AD23)
                  </label>
                  <input
                    type="text"
                    id="startingRollNumber"
                    name="startingRollNumber"
                    value={newClass.startingRollNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError('');
                    setNewClass({
                      name: '',
                      numberOfStudents: '',
                      startingRollNumber: '1',
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
                  Add Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}