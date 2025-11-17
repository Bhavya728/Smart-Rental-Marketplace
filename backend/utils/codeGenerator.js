/**
 * Generate a random verification code
 * @param {number} length - Length of the code (default: 6)
 * @returns {string} The generated code
 */
function generateVerificationCode(length = 6) {
  // Generate a random 6-digit number
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const code = Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Convert to string and pad with leading zeros if needed
  return code.toString().padStart(length, '0');
}

module.exports = {
  generateVerificationCode
};