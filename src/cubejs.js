/**
 * Checks if the path/key provided by the user is valid
 * @param {String} path
 * @param {String} key
 * @return {Boolean}
 */
function checkForValidCreds(path, token) {
  try {
    var response = UrlFetchApp.fetch(path + "/meta", {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    if (response.getResponseCode() == 200) {
      return true;
    } else {
      log(response.getResponseCode());
      resetAuth();
      return false;
    }
  } catch (error) {
    log(error);
    resetAuth();
    return false;
  }
}

function setCubejsCredentials(path, key, token, securityContext) {
  if (!token) {
    token = generateAccessToken(key, securityContext);
  }
  var validCreds = checkForValidCreds(path, token);
  if (!validCreds) {
    return validCreds;
  }
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty("dscc.path", path);
  userProperties.setProperty("dscc.key", key);
  userProperties.setProperty("dscc.token", token);
  return validCreds;
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

function cubejectApiReqest(url, token, path, parameters) {
  var endpoint;
  if (parameters) {
    endpoint = url + path + parameters;
  } else {
    endpoint = url + path;
  }
  var response = UrlFetchApp.fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  });
  return JSON.parse(response.getContentText());
}
