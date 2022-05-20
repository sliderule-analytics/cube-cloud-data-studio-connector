function log(data) {
  UrlFetchApp.fetch(
    "https://webhook.site/f009b93c-dd7c-4c97-8464-f47863642b93",
    {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(data),
    }
  );
}

/**
 * Generate HTML query string from given object
 * Adapted from http://stackoverflow.com/a/18116302/1677912
 */
function toHtmlQuery_(obj) {
  var newObj = { query: JSON.stringify(obj) };
  return (
    "?" +
    Object.keys(newObj)
      .reduce(function(a, k) {
        a.push(k + "=" + encodeURIComponent(newObj[k]));
        return a;
      }, [])
      .join("&")
  );
}

function createJwt(privateKey, expiresInHours, data) {
  // Sign token using HMAC with SHA-256 algorithm
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Date.now();
  const expires = new Date(now);
  expires.setHours(expires.getHours() + expiresInHours);

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

function generateAccessToken(privateKey, data) {
  // Your super secret private key
  const accessToken = createJwt(
    privateKey,
    6, // expires in 6 hours
    data || {}
  );
  return accessToken;
}
