import CryptoJS from "crypto-js";

const ITERATIONS = 120000;
const FORMAT_VERSION = 1;

type EncryptedBackupEnvelope = {
  format: "shopmate-encrypted-backup";
  version: number;
  algorithm: "AES-256-CBC";
  kdf: "PBKDF2-SHA256";
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
  createdAt: string;
};

function assertPassword(password: string) {
  if (password.trim().length < 8) throw new Error("Backup password must contain at least 8 characters.");
}

export function encryptBackupPayload(payload: unknown, password: string, createdAt = new Date().toISOString()) {
  assertPassword(password);
  const salt = CryptoJS.lib.WordArray.random(16);
  const iv = CryptoJS.lib.WordArray.random(16);
  const key = CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32, iterations: ITERATIONS, hasher: CryptoJS.algo.SHA256 });
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  const envelope: EncryptedBackupEnvelope = { format: "shopmate-encrypted-backup", version: FORMAT_VERSION, algorithm: "AES-256-CBC", kdf: "PBKDF2-SHA256", iterations: ITERATIONS, salt: salt.toString(CryptoJS.enc.Base64), iv: iv.toString(CryptoJS.enc.Base64), ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Base64), createdAt };
  return JSON.stringify(envelope);
}

export function decryptBackupPayload<T = unknown>(serialized: string, password: string): T {
  assertPassword(password);
  try {
    const envelope = JSON.parse(serialized) as Partial<EncryptedBackupEnvelope>;
    if (envelope.format !== "shopmate-encrypted-backup" || envelope.version !== FORMAT_VERSION || envelope.algorithm !== "AES-256-CBC" || envelope.kdf !== "PBKDF2-SHA256" || envelope.iterations !== ITERATIONS || !envelope.salt || !envelope.iv || !envelope.ciphertext) throw new Error("Unsupported backup format.");
    const salt = CryptoJS.enc.Base64.parse(envelope.salt);
    const iv = CryptoJS.enc.Base64.parse(envelope.iv);
    const key = CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32, iterations: envelope.iterations, hasher: CryptoJS.algo.SHA256 });
    const decrypted = CryptoJS.AES.decrypt(CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Base64.parse(envelope.ciphertext) }), key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString(CryptoJS.enc.Utf8);
    if (!decrypted) throw new Error("Backup could not be decrypted.");
    return JSON.parse(decrypted) as T;
  } catch {
    throw new Error("Incorrect backup password or corrupted backup file.");
  }
}

export function isEncryptedBackup(serialized: string) {
  try {
    const candidate = JSON.parse(serialized) as Partial<EncryptedBackupEnvelope>;
    return candidate.format === "shopmate-encrypted-backup" && candidate.version === FORMAT_VERSION;
  } catch {
    return false;
  }
}
