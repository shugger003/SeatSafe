import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = createInterface({ input, output });
const password = await rl.question("Administrator password: ");
rl.close();
if (password.length < 10) {
  console.error("Use at least 10 characters.");
  process.exit(1);
}
const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");
console.log(`ADMIN_PASSWORD_HASH=${salt}:${hash}`);
