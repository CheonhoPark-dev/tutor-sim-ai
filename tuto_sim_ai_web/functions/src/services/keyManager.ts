import { db } from '../config/firebase';
import { encrypt, decrypt } from '../utils/encryption';

export class KeyManager {
  private static instance: KeyManager;
  private keyCache: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): KeyManager {
    if (!KeyManager.instance) {
      KeyManager.instance = new KeyManager();
    }
    return KeyManager.instance;
  }

  async storeKey(keyName: string, keyValue: string): Promise<void> {
    const encrypted = encrypt(keyValue);
    await db.collection('api_keys').doc(keyName).set({
      value: encrypted,
      createdAt: new Date(),
      lastUsed: new Date()
    });
    this.keyCache.set(keyName, keyValue);
  }

  async getKey(keyName: string): Promise<string> {
    if (this.keyCache.has(keyName)) {
      return this.keyCache.get(keyName)!;
    }

    const doc = await db.collection('api_keys').doc(keyName).get();
    if (!doc.exists) {
      throw new Error(`API key '${keyName}' not found`);
    }

    const decrypted = decrypt(doc.data()!.value);
    this.keyCache.set(keyName, decrypted);
    return decrypted;
  }

  async rotateKey(keyName: string, newValue: string): Promise<void> {
    await this.storeKey(keyName, newValue);
    // 이전 키 백업
    const doc = await db.collection('api_keys').doc(keyName).get();
    if (doc.exists) {
      await db.collection('api_keys_history').add({
        keyName,
        value: doc.data()!.value,
        rotatedAt: new Date()
      });
    }
  }
} 