import crypto from 'crypto';

// Generate a secure random password
export function generateSecurePassword(length = 12) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each category
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  // Add one character from each category
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += symbols[crypto.randomInt(0, symbols.length)];
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += charset[crypto.randomInt(0, charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => crypto.randomInt(0, 2) - 1).join('');
}

// Generate a more user-friendly password (no special characters)
export function generateUserFriendlyPassword(length = 10) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  
  // Ensure at least one uppercase, one lowercase, and one number
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  
  // Add one character from each category
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  
  // Fill the rest with random characters
  for (let i = 3; i < length; i++) {
    password += charset[crypto.randomInt(0, charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => crypto.randomInt(0, 2) - 1).join('');
}

// Generate a memorable password with words
export function generateMemorablePassword() {
  const adjectives = [
    'Bright', 'Swift', 'Golden', 'Silver', 'Royal', 'Noble', 'Prime', 'Elite',
    'Super', 'Ultra', 'Mega', 'Pro', 'Max', 'Star', 'Moon', 'Sun', 'Sky'
  ];
  
  const nouns = [
    'Tiger', 'Eagle', 'Lion', 'Wolf', 'Bear', 'Fox', 'Hawk', 'Falcon',
    'Ocean', 'River', 'Mountain', 'Forest', 'Desert', 'Valley', 'Peak', 'Summit'
  ];
  
  const numbers = crypto.randomInt(100, 9999);
  
  const adjective = adjectives[crypto.randomInt(0, adjectives.length)];
  const noun = nouns[crypto.randomInt(0, nouns.length)];
  
  return `${adjective}${noun}${numbers}`;
}

// Default password generator (user-friendly)
export function generateVendorPassword() {
  return generateUserFriendlyPassword(10);
}
