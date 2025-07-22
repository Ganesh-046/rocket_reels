// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Phone number validation
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Required field validation
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

// Minimum length validation
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

// Maximum length validation
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

// Number validation
export const isValidNumber = (value: any): boolean => {
  return !isNaN(Number(value)) && isFinite(Number(value));
};

// Date validation
export const isValidDate = (date: any): boolean => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

// Future date validation
export const isFutureDate = (date: any): boolean => {
  const dateObj = new Date(date);
  const now = new Date();
  return dateObj > now;
};

// Past date validation
export const isPastDate = (date: any): boolean => {
  const dateObj = new Date(date);
  const now = new Date();
  return dateObj < now;
};

// Age validation
export const isValidAge = (birthDate: any, minAge: number = 13): boolean => {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= minAge;
  }
  
  return age >= minAge;
};

// Credit card validation (Luhn algorithm)
export const isValidCreditCard = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  if (!/^\d+$/.test(cleanNumber)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// File size validation
export const isValidFileSize = (fileSize: number, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return fileSize <= maxSizeInBytes;
};

// File type validation
export const isValidFileType = (fileName: string, allowedTypes: string[]): boolean => {
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  return fileExtension ? allowedTypes.includes(fileExtension) : false;
};

// Image file validation
export const isValidImageFile = (fileName: string): boolean => {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  return isValidFileType(fileName, imageTypes);
};

// Video file validation
export const isValidVideoFile = (fileName: string): boolean => {
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
  return isValidFileType(fileName, videoTypes);
}; 