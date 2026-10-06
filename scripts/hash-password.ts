import { hashPassword } from "../src/lib/server/password";

/** Membuat hash password (scrypt) untuk kolom "passwordHash": `npm run hash-password -- <password>` */
const password = process.argv[2];
if (!password) {
  console.error("Pemakaian: npm run hash-password -- <password>");
  process.exit(1);
}
hashPassword(password).then((hash) => console.log(hash));
