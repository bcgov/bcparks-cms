# Deploying and Upgrading the Tools Project

## Prerequisite

Install `helm` CLI from https://helm.sh/docs/intro/install/

## Deploying

Run the following commands from the `infrastructure/helm/tools` directory.

### Installing

`helm -n c1643c-tools install bcparks-tools .`

### Upgrading

`helm -n c1643c-tools upgrade  bcparks-tools .`

### Teardown

`helm -n c1643c-tools uninstall bcparks-tools`


## Allow service accounts to pull images from tools.

`oc policy add-role-to-group system:image-puller system:serviceaccounts:c1643c-dev --namespace=c1643c-tools`

`oc policy add-role-to-group system:image-puller system:serviceaccounts:c1643c-prod --namespace=c1643c-tools`

`oc policy add-role-to-group system:image-puller system:serviceaccounts:c1643c-test --namespace=c1643c-tools`


## Allow service account in tools to trigger deployments

`oc policy add-role-to-user edit system:serviceaccount:c1643c-tools:builder -n c1643c-dev`

`oc policy add-role-to-user edit system:serviceaccount:c1643c-tools:builder -n c1643c-test`

`oc policy add-role-to-user edit system:serviceaccount:c1643c-tools:builder -n c1643c-prod`