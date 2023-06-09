import { KJUR } from 'jsrsasign';

interface JWTPayload {
  [key: string]: any;
  iat?: number;
  exp?: number;
}

const createJWTToken = (
  payload: JWTPayload,
  secret: string,
  duration: number,
): string => {
  const jwtHeader = { alg: 'HS256', typ: 'JWT' };

  const tNow = KJUR.jws.IntDate.get('now');
  const tEnd = tNow + duration;
  payload.iat = tNow;
  payload.exp = tEnd;

  return KJUR.jws.JWS.sign('HS256', jwtHeader, payload, { utf8: secret });
};

export { createJWTToken };
