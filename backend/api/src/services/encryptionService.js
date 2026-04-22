import { encryptJson, decryptJson } from '../utils/encryption.js';

export function encryptPatientPayload(payload) {
  return encryptJson(payload);
}

export function decryptPatientPayload(blob) {
  return decryptJson(blob);
}
