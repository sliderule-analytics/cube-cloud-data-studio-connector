var cc = DataStudioApp.createCommunityConnector();

// https://developers.google.com/datastudio/connector/reference#isadminuser
function isAdminUser() {
  return true;
}

// https://developers.google.com/datastudio/connector/reference#getconfig
function getConfig(request) {
  var config = cc.getConfig();

  config
    .newTextArea()
    .setId("securityContext")
    .setName("Security Context")
    .setHelpText("Enter your Cubejs security context. Use doubles quotes.")
    .setPlaceholder("{}");

  // TODO: pull availables cubes and turn them into a list
  config
    .newTextArea()
    .setId("useCubes")
    .setName("Use Cubes")
    .setHelpText(
      "Enter the array of cubes you'd like to include in the connector. Leave blank to use all Cubes. Use doubles quotes."
    )
    .setPlaceholder('["Orders","Customers"]');

  config
    .newTextInput()
    .setId("timeDimension")
    .setName("Time Dimension")
    .setHelpText(
      "Enter the dimension you'd like to use as the default time dimension. You can change this per chart in the report editor."
    )
    .setPlaceholder("Orders.createdAt")
    .setAllowOverride(true);

  config.setDateRangeRequired(true);
  return config.build();
}

var numberFormats = {
  percent: "PERCENT",
  currency: "CURRENCY_USD",
};

function cubejsNumberType(format) {
  if (format) {
    return numberFormats[format];
  }
  return "NUMBER";
}

function getFields(request) {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  var userProperties = PropertiesService.getUserProperties();
  var baseUrl = userProperties.getProperty("dscc.baseUrl");
  var token = userProperties.getProperty("dscc.token");
  var securityContext = getSecurityContext(request);
  var jsonResponse = cubejectApiReqest(
    baseUrl,
    token,
    "/meta",
    null,
    securityContext
  );
  var useCubes = getUseCubes(request);
  jsonResponse.cubes.forEach(function(cube) {
    if (useCubes.indexOf(cube.name) >= 0 || useCubes === "All") {
      cube.dimensions.forEach(function(dimension) {
        var dataStudioType = cubejsTypesToDataStudioTypes(dimension);
        fields
          .newDimension()
          .setId(dimension.name)
          .setName(dimension.title)
          .setType(types[dataStudioType])
          .setDescription(dimension.description);
      });
      cube.measures.forEach(function(dimension) {
        var dataStudioType = cubejsTypesToDataStudioTypes(dimension);
        fields
          .newMetric()
          .setId(dimension.name)
          .setName(dimension.title)
          .setType(types[dataStudioType])
          .setDescription(dimension.description)
          .setAggregation(aggregations.AUTO);
      });
    }
  });

  return fields;
}

// https://developers.google.com/datastudio/connector/reference#getschema
function getSchema(request) {
  var securityContext = getSecurityContext(request);
  if (securityContext) {
    var userProperties = PropertiesService.getUserProperties();
    var baseUrl = userProperties.getProperty("dscc.baseUrl");
    var key = userProperties.getProperty("dscc.key");
    var validCreds = setCubejsCredentials(baseUrl, key, null, securityContext);
    if (!validCreds) {
      return {
        errorCode: "INVALID_CREDENTIALS",
      };
    }
  }
  return { schema: getFields(request).build() };
}

// https://developers.google.com/datastudio/connector/reference#getdata
function getData(request) {
  var requestedFields = getFields(request).forIds(
    request.fields.map(function(field) {
      return field.name;
    })
  );

  var dateRange = request.dateRange;
  var timeDimension = getTimeDimension(request);
  var query = {
    dimensions: [],
    measures: [],
    timeDimensions: [
      {
        dimension: timeDimension,
        dateRange: [dateRange.startDate, dateRange.endDate],
      },
    ],
  };

  requestedFields.asArray().forEach(function(field) {
    if (field.isMetric()) {
      query.measures.push(field.getId());
    } else if (field.isDimension()) {
      query.dimensions.push(field.getId());
    }
  });

  var encParams = toHtmlQuery_(query);
  var userProperties = PropertiesService.getUserProperties();
  var baseUrl = userProperties.getProperty("dscc.baseUrl");
  var token = userProperties.getProperty("dscc.token");
  var securityContext = getSecurityContext(request);
  var jsonResponse = cubejectApiReqest(
    baseUrl,
    token,
    "/load",
    encParams,
    securityContext
  );
  log(jsonResponse);
  var data = jsonResponse.data;

  var rows = [];
  var cubeDimensions = jsonResponse.annotation.dimensions;
  for (var i = 0; i < data.length; i++) {
    var row = [];
    var cubejsRow = data[i];
    requestedFields.asArray().forEach(function(field) {
      var value = cubejsRow[field.getId()];
      if (
        field.isDimension() &&
        cubeDimensions[field.getId()].type === "time"
      ) {
        value = formatTimestamp(value);
      }
      row.push(value);
    });
    rows.push({ values: row });
  }

  return {
    schema: requestedFields.build(),
    rows: rows,
  };
}
