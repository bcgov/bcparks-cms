# Image Tag Pruner

A simple Node utility to help prune imagestream tagsin OpenShift tools namespace. 

This is needed because each git commit triggers a new build and creates a new container image tag. Overtime we will end up with a large amount of imagestream tags without clean up.

## Build and Push Container Image

Currently the build process isn't part of the pipeline because it shouldn't need to be rebuilt very often.  It can be added to the pipeline later on if desired.  Note, you will need to log into the OpenShift registry with `oc registry login` first to push the image.

`oc login --token=sha256~xxxxxxxxxxxxxxxxxxxxxxxx --server=https://api.gold.devops.gov.bc.ca:6443` 
`docker login -u unused -p $(oc whoami -t) image-registry.apps.gold.devops.gov.bc.ca`

### Build
`docker build -t image-registry.apps.gold.devops.gov.bc.ca/c1643c-tools/imagetag-pruner .`

`docker push image-registry.apps.gold.devops.gov.bc.ca/c1643c-tools/imagetag-pruner`

## Cronjob
The cron job will be created by the helm chart for the tools project