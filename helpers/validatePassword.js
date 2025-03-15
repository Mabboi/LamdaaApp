module.exports = function validatePassword(password, confirmPassword) {
  if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
  }
};
