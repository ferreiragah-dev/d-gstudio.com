import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";

function derive(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(
      password,
      salt,
      64,
      { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 },
      (error, key) => (error ? reject(error) : resolve(key)),
    ),
  );
}
export async function hashPassword(password: string) {
  const salt = randomBytes(24).toString("hex");
  return `scrypt:${salt}:${(await derive(password, salt)).toString("hex")}`;
}
export async function verifyPassword(password: string, hash: string) {
  const [algorithm, salt, encoded] = hash.split(":");
  if (algorithm !== "scrypt" || !salt || !encoded || encoded.length !== 128)
    return false;
  return timingSafeEqual(
    await derive(password, salt),
    Buffer.from(encoded, "hex"),
  );
}
export const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export const randomToken = () => randomBytes(32).toString("hex");
