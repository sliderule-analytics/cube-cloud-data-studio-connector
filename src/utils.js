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
