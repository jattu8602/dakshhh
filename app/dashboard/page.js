'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/authContext';
import { getAllSchools, addSchool } from '../lib/firestore';

export default function DashboardPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: '',
    email: '',
    phone: '',
    schoolId: ''
  });
  const { user } = useAuth();
  const router = useRouter();

  // Fetch schools on component mount
  useEffect(() => {
    fetchSchools();
  }, []);

  // Fetch schools data
  const fetchSchools = async () => {
    try {
      setLoading(true);
      const schoolsData = await getAllSchools();
      setSchools(schoolsData || []);
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError('Failed to load schools. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchool(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!newSchool.name || !newSchool.email || !newSchool.phone || !newSchool.schoolId) {
      setError('All fields are required');
      return;
    }

    try {
      const school = await addSchool(newSchool);
      setSchools(prev => [school, ...prev]);
      setShowAddModal(false);
      setNewSchool({ name: '', email: '', phone: '', schoolId: '' });
      setError('');
    } catch (err) {
      console.error('Error adding school:', err);
      setError('Failed to add school. Please try again.');
    }
  };

  // Navigate to school detail
  const navigateToSchool = (schoolId) => {
    router.push(`/dashboard/schools/${schoolId}`);
  };

  // Show loading state
  if (loading && schools.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Page header */}
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Schools</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add School
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Schools list */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        {schools.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {schools.map((school) => (
              <li key={school.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" onClick={() => navigateToSchool(school.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">{school.name?.charAt(0) || 'S'}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-indigo-600">{school.name}</div>
                        <div className="text-sm text-gray-500">ID: {school.schoolId}</div>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <div className="flex flex-col items-end">
                        <div className="text-sm text-gray-500">{school.email}</div>
                        <div className="text-sm text-gray-500">{school.phone}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500">No schools found. Add a school to get started.</p>
          </div>
        )}
      </div>

      {/* Add School Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative">
              {/* Close button */}
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setError('');
                  setNewSchool({ name: '', email: '', phone: '', schoolId: '' });
                }}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Add New School</h3>

                    {error && (
                      <div className="mt-2 p-2 text-sm text-red-500 bg-red-50 rounded-md">
                        {error}
                      </div>
                    )}

                    <form className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="schoolId" className="block text-sm font-medium text-gray-700">School ID</label>
                        <input
                          type="text"
                          name="schoolId"
                          id="schoolId"
                          value={newSchool.schoolId}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md p-2"
                        />
                      </div>

                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">School Name</label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={newSchool.name}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md p-2"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={newSchool.email}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md p-2"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                          type="text"
                          name="phone"
                          id="phone"
                          value={newSchool.phone}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md p-2"
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add School
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError('');
                    setNewSchool({ name: '', email: '', phone: '', schoolId: '' });
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}