# Cube-Cloud-Data-Studio-Connector

This is a generic [Google Data Studio](https://datastudio.google.com/overview)
[Community Connector](https://developers.google.com/datastudio/connector) for
[Cube Cloud](https://cube.dev/cloud) created by
[SlideRule Analytics](https://www.slideruleanalytics.com/open-source/cube-cloud-data-studio-connector?utm_campaign=cube-cloud-data-studio-connector&utm_medium=readme&utm_source=github&utm_content=sliderule-analytics).

The connector is available in the
[Data Studio Connector Gallery](https://datastudio.google.com/data?search=Cube)

With it, you connect any [Cube](https://cube.dev/) instance to Google Data
Studio and use your Cube defined dimensions and measures as Data Studio
dimensions and metrics just like you would in any other BI platform.

Read more
[here](https://www.slideruleanalytics.com/open-source/cube-cloud-data-studio-connector?utm_campaign=cube-cloud-data-studio-connector&utm_medium=readme&utm_source=github&utm_content=open-source-repo)

## How to use

Here is a [video](https://youtu.be/ID-el4zeD3A) on how to use the connector.

## How to dev

To make changes to the connector, you must create a Community Connector for
local development as documented
[here](https://developers.google.com/datastudio/connector/local-development).

### Create a new connector

First Clone this repo.

```bash
git clone git@github.com:sliderule-analytics/cube-cloud-data-studio-connector.git
```

The dscc gen library only works with node version 14.19 or earlier. Use nvm to
install and switch node versions.

```bash
nvm install 14.19.3
```

Install Google App Script's
[clasp](https://developers.google.com/apps-script/guides/clasp) globally

```bash
npm install @google/clasp -g
```

Then install the npm packages:

```bash
cd ./cube-cloud-data-studio-connector
npm install
```

The
[dscc-gen](https://developers.google.com/datastudio/connector/local-development)
tool and instructions from Google work but are garbage. To actually use them to
create a new connector you must:

1. Create a temporary directory outside of the repo's directory

```bash
cd ../
mkdir temp
```

2. cd to the temp directory and run `clasp login` and login as what ever gmail
   account you want to use to test the local conenctor with.
3. run `clasp create` to create a temporary projects
4. select `standalone`
5. run `npx @google/dscc-gen connector` to create the connector app script. It
   will create this in a new connector directory. Name it `Cube_Cloud`, select
   `None`
6. cd to your connector directory
7. move the `.clasp` file in the `src` directory to the root of the
   cube-cloud-data-studio-connector repo's directory
8. cd back to the repo's directory
9. run `npm run push`
10. run `npm run open` to open the project in Google App Script.
11. go to the project overview and find the deployment id like so:

```bash
https://script.google.com/home/projects/[SCRIPT_ID]/deployments/[DEPLOYMENT_ID]
```

Use that deploymentment id to create a test connector like so:

```bash
https://datastudio.google.com/u/0/datasources/create?connectorId=[DEPLOYMENT_ID]
```

## Testing

The dscc gen library only works with node version 14.19 or earlier. Use nvm to
install and switch node versions.

```bash
nvm install 14.19.3
```

Note that `npm run try_latest` doesn't work at first because it uses the wrong
deployment id. Get the correct deploy id from
[here](https://script.google.com/home/projects/1xEDsQ9o0cLXwXIgfAulqmFktZoioqJX3duxO_CcWEkoNMeVNBIOtswyk/deployments/AKfycbwL55nncAn_tchr2b3OOsliPmNblexiEJvCMBz7Og4)

```bash
AKfycbwL55nncAn_tchr2b3OOsliPmNblexiEJvCMBz7Og4
```

Then update the `latest` field `package.json` to the correct deployment id.

## Tips

If you're using the connector with a cube endpoint that's in dev mode, wait for
the API to finish deploying after making a change before updating the connector.
Otherwise, you'll have to reauthenticate the connector.
