function log(data) {
  UrlFetchApp.fetch(
    "https://webhook.site/2405184b-50d6-4ca8-8cd3-c0510f551f97",
    {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(data),
    }
  );
}

function formatTimestamp(timestampString) {
  /* formats an ISO string as YYYYMMDD */
  var dateString = timestampString.slice(0, 10).replace(/-/g, "");
  return dateString.toString();
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

function addMinutes(date, minutes) {
  return new Date(date + minutes * 60000);
}
