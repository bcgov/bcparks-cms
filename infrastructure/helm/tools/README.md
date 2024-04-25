# Deploying and Upgrading ther Tools Project

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
