# School Management System

A comprehensive school management system built with Next.js, Firebase, and NextAuth, featuring a super admin dashboard for managing schools, classes, and students.

## Features

- **Super Admin Dashboard**
  - Secure login system
  - School management (add, view, search)
  - Class management (add, view)
  - Student management (add, view)
  - QR code generation for student authentication

- **Authentication Methods**
  - Username/Password login
  - QR code-based login
  - Secure session management

## Tech Stack

- **Frontend**: Next.js
- **Authentication**: NextAuth.js
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Deployment**: Vercel

## Project Structure

```
/
├── app/
│   ├── api/
│   │   ├── dashboard/
│   │   │   ├── schools/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── [classId]/
│   │   │   │   │   │   └── page.js
│   │   │   │   │   └── page.js
│   │   │   │   └── page.js
│   │   │   └── page.js
│   │   └── page.js
│   └── page.js
├── components/
├── lib/
│   ├── firestore.js
│   └── utils.js
├── public/
└── styles/
```

## Database Structure

### Collections

1. **Users**
   - Document ID: User's UID
   - Fields:
     - `username`: String
     - `password`: String (hashed)
     - `qrCode`: String (URL)
     - `schoolId`: String
     - `classId`: String
     - `rollNumber`: String

2. **Schools**
   - Document ID: School ID
   - Fields:
     - `name`: String
     - `email`: String
     - `mobileNumber`: String

3. **Classes**
   - Document ID: Class ID
   - Fields:
     - `name`: String
     - `numberOfStudents`: Number
     - `startingRollNumber`: String
     - `endingRollNumber`: String
     - `schoolId`: String

4. **Students**
   - Document ID: Student ID
   - Fields:
     - `name`: String
     - `rollNumber`: String
     - `classId`: String
     - `schoolId`: String
     - `username`: String
     - `password`: String (hashed)
     - `qrCode`: String (URL)

## Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Allow authenticated users to read public data
    match /public/{document=**} {
      allow read: if request.auth != null;
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
FIREBASE_APP_ID=your-app-id
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables
4. Run the development server:
   ```bash
   npm run dev
   ```

## Mobile App Integration

The system supports two authentication methods for the mobile app:

1. **Username/Password Login**
   - Use Firebase Authentication's `signInWithEmailAndPassword` method
   - Implement secure password hashing

2. **QR Code Login**
   - Generate unique QR codes for each student
   - Implement custom authentication flow using Firebase Custom Authentication

## Security Considerations

- All passwords are hashed before storage
- Firebase Authentication handles user credentials
- Implement proper error handling for authentication failures
- Use secure session management
- Follow Firebase security best practices

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
