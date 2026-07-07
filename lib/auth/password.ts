import bcrypt from "bcryptjs";

const DEFAULT_SALT_ROUNDS = 12;
const MIN_SALT_ROUNDS = 4;
const MAX_SALT_ROUNDS = 31;

function hashWithBcrypt(password: string, saltRounds: number): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (error, hashedPassword) => {
      if (error) {
        reject(error);
        return;
      }

      if (hashedPassword === undefined) {
        reject(new Error("bcrypt hash returned no value"));
        return;
      }

      resolve(hashedPassword);
    });
  });
}

function compareWithBcrypt(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hashedPassword, (error, isMatch) => {
      if (error) {
        reject(error);
        return;
      }

      if (isMatch === undefined) {
        reject(new Error("bcrypt compare returned no value"));
        return;
      }

      resolve(isMatch);
    });
  });
}

function parseSaltRounds(value: string | undefined): number {
  if (!value?.trim()) {
    return DEFAULT_SALT_ROUNDS;
  }

  const rounds = Number.parseInt(value, 10);

  if (
    !Number.isInteger(rounds) ||
    rounds < MIN_SALT_ROUNDS ||
    rounds > MAX_SALT_ROUNDS
  ) {
    return DEFAULT_SALT_ROUNDS;
  }

  return rounds;
}

function getSaltRounds(): number {
  return parseSaltRounds(process.env.BCRYPT_SALT_ROUNDS);
}

export async function hashPassword(password: string): Promise<string> {
  return hashWithBcrypt(password, getSaltRounds());
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return compareWithBcrypt(password, hashedPassword);
}
