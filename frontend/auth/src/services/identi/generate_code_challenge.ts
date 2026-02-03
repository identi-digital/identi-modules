// import crypto from 'crypto';

function generateRandomString() {
  const array = new Uint32Array(56 / 2);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec2hex).join('');
}

function dec2hex(dec: any) {
  return ('0' + dec.toString(16)).substr(-2);
}

function sha256(plain: any) {
  // returns promise ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

// function base64urlencode(a: any) {
//   // Convert the ArrayBuffer to string using Uint8 array.
//   // btoa takes chars from 0-255 and base64 encodes.
//   // Then convert the base64 encoded to base64url encoded.
//   // (replace + with -, replace / with _, trim trailing =)
//   return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_')
//     .replace(/=+$/, '');
// }

function base64urlencode(a: ArrayBuffer): string {
  const byteArray = Array.from(new Uint8Array(a)); // Convierte a number[]
  return btoa(String.fromCharCode.apply(null, byteArray)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function pkce_challenge_from_verifier(v: any) {
  const hashed = await sha256(v);
  const base64encoded = base64urlencode(hashed);
  return base64encoded;
}

export { generateRandomString, pkce_challenge_from_verifier };
