import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_VALID_TIME = 3600;
// const secret = crypto.randomBytes(256);
const secret = 'abc';


interface DataStoredInToken {
  username: string;
  userId: number
};

export const signJwt = (username: string, userId: number) => {
  return {
    token: jwt.sign(
      {
        username,
        userId: userId
      },
      secret,
      {
        expiresIn: ACCESS_TOKEN_VALID_TIME
      }
    ),
    validTo: Math.round((Date.now() / 1000) + ACCESS_TOKEN_VALID_TIME)
  }
}

export const decodeJwt = (token: string): DataStoredInToken => {
  return jwt.verify(token, secret) as DataStoredInToken; // Add ignoreExpiration option here later?
}
