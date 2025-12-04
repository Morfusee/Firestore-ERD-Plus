import crypto from "crypto";

const IV_LENGTH = 12; // Recommended IV length for AES-GCM
const SALT_LENGTH = 16;
const PASS_PHRASE_LENGTH = 32;

const generateRandomPassphrase = (): string => {
  return crypto.randomBytes(PASS_PHRASE_LENGTH).toString("hex");
};

export const encrypt = (text: string) => {
  try {
    // Auto-generated passphrase
    const passphrase = generateRandomPassphrase();

    // Generate a salt for key generation
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Generate encryption key from passphrase and salt using PBKDF2
    const ENCRYPTION_KEY = crypto.pbkdf2Sync(
      passphrase,
      salt,
      100000,
      32,
      "sha256"
    );

    // Generate a random IV (Initialization Vector)
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher instance for AES-GCM
    const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);

    // Encrypt the data
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");

    // Get the authentication tag (used to verify integrity of data during decryption)
    const authTag = cipher.getAuthTag().toString("base64");

    // Return encrypted data along with IV, salt, authTag, and the passphrase (for later decryption)
    return JSON.stringify({
      encryptedData: encrypted,
      iv: iv.toString("base64"),
      salt: salt.toString("base64"),
      authTag,
      passphrase, // This will be auto-generated and should be securely stored or shared
    });
  } catch (error: any) {
    throw new Error("Encryption failed: " + error.message);
  }
};

// Decryption function (requires the passphrase to decrypt)
export const decrypt = (encryptedObject: {
  encryptedData: string;
  iv: string;
  salt: string;
  authTag: string;
  passphrase: string;
}) => {
  try {
    // Extract components from the encrypted object
    const { encryptedData, iv, salt, authTag, passphrase } = encryptedObject;

    // Convert salt, iv, and authTag from base64 to Buffer
    const saltBuffer = Buffer.from(salt, "base64");
    const ivBuffer = Buffer.from(iv, "base64");
    const authTagBuffer = Buffer.from(authTag, "base64");

    // Generate the encryption key using PBKDF2 from passphrase and salt
    const ENCRYPTION_KEY = crypto.pbkdf2Sync(
      passphrase,
      saltBuffer,
      100000,
      32,
      "sha256"
    );

    // Create decipher instance for AES-GCM
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      ENCRYPTION_KEY,
      ivBuffer
    );

    // Set the authentication tag to ensure data integrity during decryption
    decipher.setAuthTag(authTagBuffer);

    // Decrypt the data
    let decrypted = decipher.update(encryptedData, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted; // Return decrypted data
  } catch (error: any) {
    throw new Error("Decryption failed: " + error.message);
  }
};
