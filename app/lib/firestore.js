import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  orderBy
} from 'firebase/firestore';
import { generateQRCode, generatePassword, generateUsername } from './utils';

// Schools Collection
const schoolsCollection = collection(db, 'schools');

// Add a new school
export const addSchool = async (schoolData) => {
  const docRef = await addDoc(schoolsCollection, {
    ...schoolData,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return { id: docRef.id, ...schoolData };
};

// Get all schools
export const getAllSchools = async () => {
  const schoolsSnapshot = await getDocs(query(schoolsCollection, orderBy('createdAt', 'desc')));
  return schoolsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Search schools by name or ID
export const searchSchools = async (searchTerm) => {
  // We'll do a client-side search since Firestore doesn't support
  // complex text search without Cloud Functions or additional services
  const schoolsSnapshot = await getDocs(schoolsCollection);
  const schools = schoolsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (school.schoolId && school.schoolId.toLowerCase().includes(searchTerm.toLowerCase()))
  );
};

// Get a school by ID
export const getSchoolById = async (schoolId) => {
  const docRef = doc(db, 'schools', schoolId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

// Classes Collection (subcollection of schools)
// Add a class to a school
export const addClass = async (schoolId, classData) => {
  const classesCollection = collection(db, 'schools', schoolId, 'classes');
  const docRef = await addDoc(classesCollection, {
    ...classData,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return { id: docRef.id, ...classData };
};

// Get all classes for a school
export const getClassesBySchoolId = async (schoolId) => {
  const classesCollection = collection(db, 'schools', schoolId, 'classes');
  const classesSnapshot = await getDocs(classesCollection);

  return classesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Get a class by ID
export const getClassById = async (schoolId, classId) => {
  const docRef = doc(db, 'schools', schoolId, 'classes', classId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

// Students Collection (subcollection of classes)
// Add a student to a class
export const addStudent = async (schoolId, classId, studentData) => {
  const studentsCollection = collection(db, 'schools', schoolId, 'classes', classId, 'students');

  // Generate student details
  const password = generatePassword();
  const username = generateUsername(
    studentData.name,
    studentData.rollNumber,
    classId,
    schoolId
  );
  const qrCode = await generateQRCode(username, password);

  // Combine data
  const completeStudentData = {
    ...studentData,
    username,
    password,
    qrCode,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Save to Firestore
  const docRef = await addDoc(studentsCollection, completeStudentData);

  return { id: docRef.id, ...completeStudentData };
};

// Get all students in a class
export const getStudentsByClassId = async (schoolId, classId) => {
  const studentsCollection = collection(db, 'schools', schoolId, 'classes', classId, 'students');
  const studentsSnapshot = await getDocs(studentsCollection);

  return studentsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Get a student by ID
export const getStudentById = async (schoolId, classId, studentId) => {
  const docRef = doc(db, 'schools', schoolId, 'classes', classId, 'students', studentId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

// Update a student
export const updateStudent = async (schoolId, classId, studentId, updatedData) => {
  const docRef = doc(db, 'schools', schoolId, 'classes', classId, 'students', studentId);
  await updateDoc(docRef, {
    ...updatedData,
    updatedAt: new Date()
  });

  const updatedStudent = await getStudentById(schoolId, classId, studentId);
  return updatedStudent;
};

// Student Authentication Functions

// Authenticate student by username and password
export const authenticateStudent = async (username, password) => {
  try {
    // We need to search through all schools and classes to find the student
    const schoolsSnapshot = await getDocs(schoolsCollection);
    const matchingStudents = [];

    for (const schoolDoc of schoolsSnapshot.docs) {
      const schoolId = schoolDoc.id;
      const schoolData = schoolDoc.data();
      const classesCollection = collection(db, 'schools', schoolId, 'classes');
      const classesSnapshot = await getDocs(classesCollection);

      for (const classDoc of classesSnapshot.docs) {
        const classId = classDoc.id;
        const classData = classDoc.data();
        const studentsCollection = collection(db, 'schools', schoolId, 'classes', classId, 'students');

        // Query for student with matching username
        const q = query(studentsCollection, where('username', '==', username));
        const studentSnapshot = await getDocs(q);

        if (!studentSnapshot.empty) {
          for (const studentDoc of studentSnapshot.docs) {
            const studentData = { id: studentDoc.id, ...studentDoc.data() };

            // Check if password matches (in a real app, you'd compare hashed passwords)
            if (studentData.password === password) {
              matchingStudents.push({
                ...studentData,
                schoolId,
                schoolName: schoolData.name,
                classId,
                className: classData.name
              });
            }
          }
        }
      }
    }

    if (matchingStudents.length > 0) {
      return {
        authenticated: true,
        students: matchingStudents,
        multipleMatches: matchingStudents.length > 1
      };
    }

    // No matching student found
    return { authenticated: false };
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

// Authenticate student by QR code data
export const authenticateStudentByQR = async (qrData) => {
  try {
    let parsedData;
    // Try to parse the QR data
    try {
      parsedData = JSON.parse(qrData);
    } catch (parseError) {
      console.error('QR data parsing error:', parseError);
      throw new Error('Invalid QR code format. Please try again.');
    }

    // Validate required fields
    const { username, password } = parsedData;
    if (!username || !password) {
      throw new Error('Invalid QR code content. Missing required data.');
    }

    // Authenticate with the parsed data
    return await authenticateStudent(username, password);
  } catch (error) {
    console.error('QR authentication error:', error);
    throw error;
  }
};