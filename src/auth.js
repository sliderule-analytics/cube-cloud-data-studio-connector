var cc = DataStudioApp.createCommunityConnector();

/**
 * Returns the Auth Type of this connector.
 * @return {object} The Auth type.
 */
function getAuthType() {
  var cc = DataStudioApp.createCommunityConnector();
  return cc
    .newAuthTypeResponse()
    .setAuthType(cc.AuthType.PATH_KEY)
    .setHelpUrl(
      "https://www.slideruleanalytics.com/documentation/shopify-data-studio-connector"
    )
    .build();
}

/**
 * Resets the auth service.
 */
function resetAuth() {
  var user_keyProperties = PropertiesService.getUserProperties();
  user_keyProperties.deleteProperty("dscc.baseUrl");
  user_keyProperties.deleteProperty("dscc.key");
  user_keyProperties.deleteProperty("dscc.token");
}

/**
 * Returns true if the auth service has access.
 * @return {boolean} True if the auth service has access.
 */
function isAuthValid() {
  var userProperties = PropertiesService.getUserProperties();
  var baseUrl = userProperties.getProperty("dscc.baseUrl");
  var token = userProperties.getProperty("dscc.token");
  var response = checkForValidCreds(baseUrl, token);
  if (response) {
    return true;
  }
  return response;
}

/**
 * Sets the credentials.
 * @param {Request} request The set credentials request.
 * @return {object} An object with an errorCode.
 */
function setCredentials(request) {
  var creds = request.pathKey;
  var baseUrl = creds.path;
  var key = creds.key;
  var validCreds = setCubejsCredentials(baseUrl, key);
  if (!validCreds) {
    return {
      errorCode: "INVALID_CREDENTIALS",
    };
  }
  return {
    errorCode: "NONE",
  };
}
