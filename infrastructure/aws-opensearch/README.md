# AWS OpenSearch Setup

OpenSearch is Amazon's community-driven, 100% open-source version of Elastisearch. It is used by the BC Parks website to power advanced searching features.

## Prereqesites

* Install the AWS cli
* Install terragrunt and terraform

## Updating DEV

* Connect to the BC Government AWS login application and get your credentials to paste into a terminal
* `cd infrastructure/aws-opensearch/dev`
* `terragrunt apply`
* Update the main-elasticsearch-secret and alpha-elasticsearch-secret on DEV and TEST OpenShift environments to ensure that the settings match AWS.

## Updating TEST

* There is no TEST environment on AWS. Dev is used for DEV, TEST, ALPHA-DEV and ALPHA-TEST to reduce hosting costs.

## Updating PROD

* Connect to the BC Government AWS login application and get your credentials to paste into a terminal
* `cd infrastructure/aws-opensearch/prod`
* `terragrunt apply`
* Update the main-elasticsearch-secret on the PROD OpenShift environments to ensure that the settings match AWS.

## Tearing down an environment

* Connect to the BC Government AWS login application and get your credentials to paste into a terminal
* `cd infrastructure/aws-opensearch/<ENVIRONMENT>`
* `terragrunt destroy` should work, but you might need to use `terragrunt run-all destroy`