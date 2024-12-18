const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const hashedPassword = '$2a$10$/3h.oWSGp.8eGAEWli5v3OPbnDMY5rUhDm7.e7IIpXUb9wSeTkciO';
const plaintextPassword = process.env.ADMIN_PASSWORD;

// const hashedPass = bcrypt.hashSync(plaintextPassword);
// console.log(`Hashed Password: ${hashedPass}`);

bcrypt.compare(plaintextPassword, hashedPassword, (err, result) => {
  if (err) {
    console.error('Error comparing passwords:', err);
  } else {
    console.log('Passwords match:', result);
  }
});
