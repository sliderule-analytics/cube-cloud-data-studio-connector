# Cubejs-Datastudio

This is a generic cubejs to data studio connector

You must use a Chrome browser logged in as dev@slideruleanalytics.com to test
the connector.

You must also be logged into clasp as dev@slideruleanalytics.com

## Testing

Note that `npm run try_latest` doesn't work at first because it uses the wrong
deployment id. Get the correct deploy id from
[here](https://script.google.com/home/projects/1xEDsQ9o0cLXwXIgfAulqmFktZoioqJX3duxO_CcWEkoNMeVNBIOtswyk/deployments/AKfycbwL55nncAn_tchr2b3OOsliPmNblexiEJvCMBz7Og4)

```bash
AKfycbwL55nncAn_tchr2b3OOsliPmNblexiEJvCMBz7Og4
```

Then update the `latest` field `package.json` to the correct deployment id.

### Create a new connector

The
[dscc-gen](https://developers.google.com/datastudio/connector/local-development)
tool and instructions from Google work but are garbage. To actually use them to
create a new connector you must:

1. Create a temporary directory
2. cd to the temp directory and run `clasp login` and login as
   dev@slideruleanalytics.com
3. run `clasp create` to create a temporary projects
4. run `npx @google/dscc-gen connector` to create the connector app script. It
   will create this in a new connector directory.
5. cd to your connector directory
6. move the `.clasp` file in the `src` directory to the root of your connector
   directory
7. run `npm run push`
8. run `npm run open` to open the project in Google App Script.
9. go to the project overview and find the deployment id like so:

```bash
https://script.google.com/home/projects/[SCRIPT_ID]/deployments/[DEPLOYMENT_ID]
```

Use that deploymentment id to create a test connector like so:

```bash
https://datastudio.google.com/u/0/datasources/create?connectorId=[DEPLOYMENT_ID]
```

Make sure you use that link in the dev@slideruleanalytics.com Chrome browser.
