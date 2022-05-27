var TOKEN_EXPIRATION_MINUTES = 10080; // 1 week

function createCubejsUrl(baseUrl, endpoint, parameters) {
  var url;
  if (parameters) {
    url = baseUrl + endpoint + parameters;
  } else {
    url = baseUrl + endpoint;
  }
  return url;
}

/**
 * Checks if the baseUrl/key provided by the user is valid
 * @param {String} baseUrl
 * @param {String} key
 * @return {Boolean}
 */
function checkForValidCreds(baseUrl, token, endpoint, parameters) {
  endpoint = endpoint || "/meta";
  var url = createCubejsUrl(baseUrl, endpoint, parameters);
  // need try catch for before user enters auth base url and key
  try {
    var response = UrlFetchApp.fetch(url, {
      method: "GET",
      headers: {
        Authorization: token,
      },
      muteHttpExceptions: true,
    });

    if (response.getResponseCode() == 200) {
      return response;
    } else {
      resetAuth();
      return false;
    }
  } catch (error) {
    resetAuth();
    return false;
  }
}

function getUseCubes(request) {
  var useCubes;
  if (request.configParams.useCubes) {
    useCubes =
      request.configParams.securityContext === "[]"
        ? "All"
        : JSON.parse(request.configParams.useCubes);
  }
  return useCubes;
}

function getTimeDimension(request) {
  var timeDimension;
  if (request.configParams.timeDimension) {
    timeDimension = request.configParams.timeDimension;
  } else {
    throw new Error("You must select a time dimension.");
  }
  return timeDimension;
}

function getSecurityContext(request) {
  var securityContext;
  if (request.configParams.securityContext) {
    securityContext =
      request.configParams.securityContext === "{}"
        ? undefined
        : JSON.parse(request.configParams.securityContext);
  }
  return securityContext;
}

function setCubejsCredentials(
  baseUrl,
  key,
  token,
  securityContext,
  endpoint,
  parameter
) {
  if (!token) {
    token = generateAccessToken(key, securityContext, TOKEN_EXPIRATION_MINUTES);
  }
  var validCreds = checkForValidCreds(baseUrl, token, endpoint, parameter);
  if (!validCreds) {
    return validCreds;
  }
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty("dscc.baseUrl", baseUrl);
  userProperties.setProperty("dscc.key", key);
  userProperties.setProperty("dscc.token", token);
  return validCreds;
}

function cubejectApiReqest(
  baseUrl,
  token,
  endpoint,
  parameters,
  securityContext
) {
  var url = createCubejsUrl(baseUrl, endpoint, parameters);
  var response = UrlFetchApp.fetch(url, {
    method: "GET",
    headers: {
      Authorization: token,
    },
    muteHttpExceptions: true,
  });
  var responseCode = response.getResponseCode();
  var responseBody = response.getContentText();
  if (responseCode === 403) {
    // if response is 403, try reauth token one time
    var userProperties = PropertiesService.getUserProperties();
    var key = userProperties.getProperty("dscc.key");
    response = setCubejsCredentials(
      baseUrl,
      key,
      null,
      securityContext,
      endpoint,
      parameters
    );
    if (response) {
      responseCode = response.getResponseCode();
      responseBody = response.getContentText();
    } else {
      throw new Error(
        "Check your cubejs credentials. Could not generate a valid token."
      );
    }
  }
  if (responseCode === 200) {
    return JSON.parse(responseBody);
  } else {
    throw new Error(responseCode + ": " + responseBody);
  }
}

function cubejsTypesToDataStudioTypes(cubejsField) {
  var types = {
    number: function(cubejsField) {
      return cubejsNumberType(cubejsField.format);
    },
    count: function(cubejsField) {
      return cubejsNumberType(cubejsField.format);
    },
    countDistinct: function(cubejsField) {
      return cubejsNumberType(cubejsField.format);
    },
    countDistinctApprox: function(cubejsField) {
      return cubejsNumberType(cubejsField.format);
    },
    sum: function(cubejsField) {
      return cubejsNumberType(cubejsField.format);
    },
    avg: function(cubejsField) {
      return cubejsNumberType(cubejsField.format);
    },
    countDistinctApprox: function(cubejsField) {
      return cubejsNumberType(cubejsField.format);
    },
    min: function(cubejsField) {
      return cubejsNumberType(cubejsField.format);
    },
    max: function(cubejsField) {
      return cubejsNumberType(cubejsField.format);
    },
    runningTotal: function() {
      return cubejsNumberType(cubejsField.format);
    },
    time: function() {
      return "YEAR_MONTH_DAY";
    },
    string: function() {
      return "TEXT";
    },
    boolean: function() {
      return "BOOLEAN";
    },
    imageUrl: function() {
      return "URL";
    },
    link: function() {
      return "URL";
    },
    id: function() {
      return "TEXT";
    },
    geo: function() {
      return "LATITUDE_LONGITUDE";
    },
  };
  return types[cubejsField.type](cubejsField);
}
