/*
 * based on https://www.labnol.org/code/json-web-token-201128
 * Use https://jwt.io/#debugger-io to verify
 */

function createJwt(privateKey, expiresInMinutes, data) {
  // Sign token using HMAC with SHA-256 algorithm
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Date.now();
  const expires = addMinutes(now, expiresInMinutes);

  // iat = issued time, exp = expiration time
  const payload = {
    exp: Math.round(expires.getTime() / 1000),
    iat: Math.round(now / 1000),
  };

  // add user payload
  Object.keys(data).forEach(function(key) {
    payload[key] = data[key];
  });
  // TODO: cleanup
  json = true;
  function base64Encode(text, json) {
    const data = json ? JSON.stringify(text) : text;
    return Utilities.base64EncodeWebSafe(data).replace(/=+$/, "");
  }
  const toSign =
    Utilities.base64Encode(
      JSON.stringify(header),
      Utilities.Charset.UTF_8
    ).replace(/=+$/, "") +
    "." +
    Utilities.base64Encode(
      JSON.stringify(payload),
      Utilities.Charset.UTF_8
    ).replace(/=+$/, "");
  const signatureBytes = Utilities.computeHmacSha256Signature(
    toSign,
    privateKey
  );
  const signature = base64Encode(signatureBytes, false);
  return toSign + "." + signature;
}

function generateAccessToken(privateKey, data, duration) {
  // Your super secret private key
  // duration in minutes
  const accessToken = createJwt(
    privateKey,
    duration, // expires in 6 hours
    data || {}
  );
  return accessToken;
}
