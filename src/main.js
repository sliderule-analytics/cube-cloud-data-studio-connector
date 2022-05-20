var cc = DataStudioApp.createCommunityConnector();

// https://developers.google.com/datastudio/connector/reference#isadminuser
function isAdminUser() {
  return true;
}

// https://developers.google.com/datastudio/connector/reference#getconfig
function getConfig(request) {
  var config = cc.getConfig();
  config
    .newInfo()
    .setId("generalInfo")
    .setText(
      "This is the template connector created by https://github.com/googledatastudio/dscc-gen"
    );

  config
    .newTextInput()
    .setId("securityContext")
    .setName("Security Context")
    .setHelpText("Enter your Cubejs security context")
    .setPlaceholder("{}");

  // config
  //   .newTextInput()
  //   .setId("token")
  //   .setName("Cubejs Token")
  //   .setHelpText("Enter your Cubejs token")
  //   .setPlaceholder("123....");

  config.setDateRangeRequired(true);
  log("getConfig");
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
  log("getFields");
  var userProperties = PropertiesService.getUserProperties();
  var url = userProperties.getProperty("dscc.path");
  var token = userProperties.getProperty("dscc.token");
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;
  var jsonResponse = cubejectApiReqest(url, token, "/meta");
  var useCubes = ["Orders", "Customers"];
  jsonResponse.cubes.forEach(function(cube) {
    if (useCubes.indexOf(cube.name) >= 0) {
      cube.dimensions.forEach(function(dimension) {
        var dataStudioType = cubejsTypesToDataStudioTypes(dimension);
        fields
          .newDimension()
          .setId(dimension.name)
          .setName(dimension.shortTitle)
          .setType(types[dataStudioType])
          .setDescription(dimension.description);
      });
      cube.measures.forEach(function(dimension) {
        var dataStudioType = cubejsTypesToDataStudioTypes(dimension);
        fields
          .newMetric()
          .setId(dimension.name)
          .setName(dimension.shortTitle)
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
  log("getSchema");

  var securityContext;
  if (request.configParams.securityContext) {
    securityContext =
      request.configParams.securityContext === "{}"
        ? undefined
        : JSON.parse(request.configParams.securityContext);
  }
  if (securityContext) {
    var userProperties = PropertiesService.getUserProperties();
    var path = userProperties.getProperty("dscc.path");
    var key = userProperties.getProperty("dscc.key");
    var validCreds = setCubejsCredentials(path, key, null, securityContext);
    if (!validCreds) {
      return {
        errorCode: "INVALID_CREDENTIALS",
      };
    }
    log("securityContext updated");
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
  var query = {
    dimensions: [],
    measures: [],
    timeDimensions: [
      {
        dimension: "Orders.createdAt",
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
  var url = userProperties.getProperty("dscc.path");
  var token = userProperties.getProperty("dscc.token");
  var jsonResponse = cubejectApiReqest(url, token, "/load", encParams);
  var data = jsonResponse.data;

  var rows = [];
  for (var i = 0; i < data.length; i++) {
    var row = [];
    var cubejsRow = data[i];
    requestedFields.asArray().forEach(function(field) {
      var value = cubejsRow[field.getId()];
      row.push(value);
    });
    rows.push({ values: row });
  }

  return {
    schema: requestedFields.build(),
    rows: rows,
  };
}
