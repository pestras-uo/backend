import crypto from 'crypto';

export default {
  hash(value: string, salt?: string): Promise<[string, string]> {
    if (!value) throw "Hash: gotEmptyString";

    const len = 64;
    const iterations = 10000;
    const digest = 'sha256';

    return new Promise((resolve, reject) => {
      if (salt) {
        crypto.pbkdf2(value, salt, iterations, len, digest, (err: Error | null, derivedKey: Buffer) => {
          if (err)
            return reject(err);

          resolve([derivedKey.toString('base64'), salt as string]);
        });

      } else {
        crypto.randomBytes(16, (err: Error | null, saltBuffer: Buffer) => {
          if (err)
            return reject(err);

          salt = saltBuffer.toString('base64');
          crypto.pbkdf2(value, salt, iterations, len, digest, (err: Error | null, derivedKey: Buffer) => {
            if (err)
              return reject(err);

            resolve([derivedKey.toString('base64'), <string>salt]);
          });
        });
      }
    });
  },

  verify(value: string, hashed: string, salt: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.hash(value, salt)
        .then(hashedSrc => {
          resolve(hashedSrc[0] === hashed);
        })
        .catch(err => reject(err));
    });
  }
}