import QRCode from 'qrcode';

// Generate a random password
export const generatePassword = () => {
  const length = 8;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
};

// Generate a unique username based on student name, roll number, class, and school
export const generateUsername = (name, rollNumber, classId, schoolId) => {
  // Remove spaces and special characters from name
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/gi, '');

  // Take first 3 characters of name (or fewer if name is shorter)
  const namePrefix = cleanName.substring(0, Math.min(3, cleanName.length));

  // Generate a unique username
  const username = `${namePrefix}${rollNumber}${classId.substring(0, 2)}${schoolId.substring(0, 2)}`;

  return username;
};

// Generate a QR code for student login
export const generateQRCode = async (username, password) => {
  try {
    // Create a JSON string with login credentials
    const loginData = JSON.stringify({
      username,
      password
    });

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(loginData);
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};

// Format date for display
export const formatDate = (date) => {
  if (!date) return '';

  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Generate incremental roll numbers
export const generateRollNumbers = (startingRoll, count) => {
  const rollNumbers = [];
  let currentRoll;

  // Check if starting roll contains letters (e.g., AD23)
  const match = startingRoll.match(/^([A-Za-z]*)(\d+)$/);

  if (match) {
    // If the starting roll has a letter prefix and number suffix
    const prefix = match[1];
    let numericPart = parseInt(match[2], 10);

    for (let i = 0; i < count; i++) {
      currentRoll = `${prefix}${numericPart + i}`;
      rollNumbers.push(currentRoll);
    }
  } else {
    // If it's just a number
    let numericRoll = parseInt(startingRoll, 10);

    for (let i = 0; i < count; i++) {
      currentRoll = (numericRoll + i).toString();
      rollNumbers.push(currentRoll);
    }
  }

  return rollNumbers;
};