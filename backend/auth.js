import crypto from 'crypto';

const HASH_ALGORITHM = 'sha256';
const HASH_ITERATIONS = 310000;
const KEY_LENGTH = 32;

function base64Url(input) {
  return Buffer.from(input).toString('base64url');
}

function parseExpiration(expiresIn) {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) return 60 * 60 * 24 * 7;

  const value = Number(match[1]);
  const unit = match[2];
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * multipliers[unit];
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64url');
  const hash = crypto
    .pbkdf2Sync(password, salt, HASH_ITERATIONS, KEY_LENGTH, HASH_ALGORITHM)
    .toString('base64url');

  return `pbkdf2_${HASH_ALGORITHM}$${HASH_ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password, storedHash) {
  const [algorithm, iterationsText, salt, hash] = storedHash.split('$');
  if (algorithm !== `pbkdf2_${HASH_ALGORITHM}` || !iterationsText || !salt || !hash) {
    return false;
  }

  const candidate = crypto
    .pbkdf2Sync(password, salt, Number(iterationsText), KEY_LENGTH, HASH_ALGORITHM)
    .toString('base64url');

  const storedBuffer = Buffer.from(hash);
  const candidateBuffer = Buffer.from(candidate);

  return (
    storedBuffer.length === candidateBuffer.length &&
    crypto.timingSafeEqual(storedBuffer, candidateBuffer)
  );
}

export function signJwt(payload, options = {}) {
  const secret = process.env.JWT_SECRET || 'fintrack-dev-secret-change-me';
  const expiresIn = parseExpiration(options.expiresIn || process.env.JWT_EXPIRES_IN || '7d');
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { ...payload, iat: now, exp: now + expiresIn };
  const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(body))}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(unsignedToken)
    .digest('base64url');

  return `${unsignedToken}.${signature}`;
}

export function verifyJwt(token) {
  const secret = process.env.JWT_SECRET || 'fintrack-dev-secret-change-me';
  const [encodedHeader, encodedPayload, signature] = token.split('.');

  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error('Token inválido');
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(unsignedToken)
    .digest('base64url');

  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    throw new Error('Token inválido');
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expirado');
  }

  return payload;
}
