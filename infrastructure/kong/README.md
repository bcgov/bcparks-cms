# KONG API Service Portal Setup

The public API is accessible at https://bcparks.api.gov.bc.ca (PROD) or
https://bcparks-api-gov-bc-ca.test.api.gov.bc.ca (TEST). Dev does not have a corresponding API Gateway.

API access is controlled via Kong, administered via the BC Gov API Programme Services API Gateway.
**Kong configuration is not updated via Github Actions, and must be updated manually when there are changes.**

For an overview of the API Gateway update process, see:
https://api-gov-bc-ca.test.api.gov.bc.ca/docs/platform-api-owner-user-journey

Access to the web UI for creating service accounts can be requested in the `#aps-ops` rocketchat channel.

## Kong Config Update

**The update to Strapi4 is currently outputting documentation that won't work properly. This may be fixed with Strapi updates, so check first, and update these docs as required. Two things need to be addressed**
1. The operationId field in `public-documentation.json` needs to be changed to scrub non-alphanumeric characters (ie. `/` and `{}`). 
2. The paths need to have `/api` prepended to them. (ie. `/urgencies` shoud be `/api/urgencies`). 

If there have been changes to the API endpoints available on Strapi, the following steps need to be taken.

The important thing thing to note is in step #6 - once you run through the steps, you **will need to revert changes** or publishing the gateway will fail.

1. Visit [Strapi admin](http://localhost:1337/admin/plugins/documentation) and under Plugins -> Documentation,
   click the circular arrow icon which says "Regenerate 1.0.0".
2. Copy the content of `src/cms/src/extensions/documentation/documentation/1.0.0/full_documentation.json` (the
   generated OpenAPI spec) to `infrastructure/kong/public-documentation.json` (overwriting the existing content).
3. Run `node clean.js` to remove any private API endpoints from the file.
4. Download the GWA CLI from https://github.com/bcgov/gwa-cli/releases
5. In the infrastructure/kong directory, run (for TEST):

   ```sh
   gwa new public-documentation.json --route-host=bcparks.api.gov.bc.ca --service-url=main-cms.c1643c-test.svc --plugins rate-limiting cors  --outfile=public-test.yaml
   ```

   (for PROD):

   ```sh
   gwa new public-documentation.json --route-host=bcparks.api.gov.bc.ca --service-url=main-cms.c1643c-prod.svc --plugins rate-limiting cors  --outfile=public-prod.yaml
   ```

6. Diff the `public-test.yaml` or `public-prod.yaml` file against the committed version. Only routes
   should be changed. **If any host, port, rate limiting, etc setting have changed, revert those changes.**
7. Commit the resulting file. Note that committing does not ensure the changes will be picked up. They must
   be manually published per the instructions below.

## TEST Environment Publication

1. Log into https://api-gov-bc-ca.test.api.gov.bc.ca/
2. Select the BC Parks namespace
3. Create a service account with `GatewayConfig.Publish` scope and note down the client id and client secret
4. Download the GWA CLI from https://github.com/bcgov/gwa-cli/releases
5. In command prompt run the following commands (the first command create a .env file locally, which will need to be deleted if you need to create one for the other environment):

   ```sh
   gwa init -T --api-version=2 --namespace=bcparks --client-id=<ClientID> --client-secret=<ClientSecret>
   gwa pg public-test.yaml
   ```

6. Check the Gateway in the API Service Portal to make sure that the routes have been published

## PROD Environment Publication

1. Log into https://api.gov.bc.ca/
2. Select the BC Parks namespace
3. Create a service account with `GatewayConfig.Publish` scope and note down the client id and client secret
4. Download the GWA CLI from https://github.com/bcgov/gwa-cli/releases
5. In command prompt run the following commands (the first command create a .env file locally, which will need to be deleted if you need to create one for the other environment):

   ```sh
   gwa init -P --api-version=2 --namespace=bcparks --client-id=<ClientID> --client-secret=<ClientSecret>
   gwa pg public-prod.yaml
   ```

6. Check the Gateway in the API Service Portal to make sure that the routes have been published
