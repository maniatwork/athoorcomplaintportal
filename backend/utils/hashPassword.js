import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.log("Usage: node hashPassword.js <password>");
  process.exit(1);
}

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log("\n----------------------------------------");
console.log("Password:", password);
console.log("Hash:    ", hash);
console.log("----------------------------------------\n");
console.log("Copy this hash into your backend/.env under ADMIN_PASSWORD_HASH");
