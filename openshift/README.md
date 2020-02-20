# Common Logging Service on Openshift

This application is deployed on Openshift. This readme will outline how to setup and configure an Openshift project to get the application to a deployable state. There are also some historical notes on how to bootstrap from nothing to fully deployed on Openshift. This document assumes a working knowledge of Kubernetes/Openshift container orchestration concepts (i.e. buildconfigs, deployconfigs, imagestreams, secrets, configmaps, routes, etc)

Our builds and deployments are orchestrated with Jenkins as part of the devops tools ecosystem (see [nr-showcase-devops-tools](https://github.com/bcgov/nr-showcase-devops-tools)). Refer to [Jenkinsfile](../Jenkinsfile) and [Jenkinsfile.cicd](../Jenkinsfile.cicd) to see how the Openshift templates are used for building and deploying in our CI/CD pipeline.

## Environment Setup - ConfigMaps and Secrets

There are some requirements in the target Openshift namespace/project which are **outside** of the CI/CD pipeline process. This application requires that a few Secrets as well as Config Maps be already present in the environment before it is able to function as intended. Otherwise the Jenkins pipeline will fail the deployment by design.

In order to prepare an environment, you will need to ensure that all of the following configmaps and secrets are populated. This is achieved by executing the following commands as a project administrator of the targeted environment. Note that this must be repeated on *each* of the target deployment namespace/projects (i.e. `dev`, `test` and `prod`) as that they are independent of each other. Deployment will fail otherwise. Refer to [custom-environment-variables](../app/config/custom-environment-variables.json) for the direct mapping of environment variables for the backend.

### Config Maps

*Note: Replace anything in angle brackets with the appropriate value!*

```sh

oc create -n <namespace> configmap clogs-keycloak-config \
  --from-literal=KC_REALM=jbd6rnxw \
  --from-literal=KC_SERVERURL=https://sso-dev.pathfinder.gov.bc.ca/auth
```

*Note: Change KC_SERVERURL's sso-dev to sso-test or sso depending on the environment!*

```sh
oc create -n <namespace> configmap clogs-server-config \
  --from-literal=SERVER_ATTACHMENTLIMIT=20mb \
  --from-literal=SERVER_BODYLIMIT=100mb \
  --from-literal=SERVER_LOGLEVEL=info \
  --from-literal=SERVER_MORGANFORMAT=combined \
  --from-literal=SERVER_PORT=3000
```

```sh
oc create -n <namespace> configmap clogs-elk-config \
  --from-literal=ELKSTACK_LOGSTASHURL=<elk stack logstash url>
```

### Secrets

Replace anything in angle brackets with the appropriate value!

```sh
oc create -n <namespace> secret generic clogs-keycloak-secret \
  --type=kubernetes.io/basic-auth \
  --from-literal=username=<clogs client id> \
  --from-literal=password=<clogs client secret>
```

## Build Config & Deployment

This application is a Node.js standalone microservice. We are currently leveraging basic Openshift Routes to expose and foward incoming traffic to the right pods.

### Application

The application is a standard [Node](https://nodejs.org)/[Express](https://expressjs.com) server. It handles the JWT based authentication via OIDC authentication flow, and exposes the API to authorized users. This deployment container is built up using a custom Dockerfile strategy. The resulting container after build is what is deployed.

## Templates

The Jenkins pipeline heavily leverages Openshift Templates in order to ensure that all of the environment variables, settings, and contexts are pushed to Openshift correctly. Files ending with `.bc.yaml` specify the build configurations, while files ending with `.dc.yaml` specify the components required for deployment.

### Build Configurations

Build configurations will emit and handle the chained builds or standard builds as necessary. They take in the following parameters:

| Name | Required | Description |
| --- | --- | --- |
| REPO_NAME | yes | Application repository name |
| JOB_NAME | yes | Job identifier (i.e. 'pr-5' OR 'master') |
| SOURCE_REPO_REF | yes | Git Pull Request Reference (i.e. 'pull/CHANGE_ID/head') |
| SOURCE_REPO_URL | yes | Git Repository URL |

The template can be manually invoked and deployed via Openshift CLI. For example:

```sh
oc -n <namespace> process -f openshift/app.bc.yaml -p REPO_NAME=common-logging -p JOB_NAME=master -p SOURCE_REPO_URL=https://github.com/bcgov/common-logging.git -p SOURCE_REPO_REF=master -o yaml | oc -n <namespace> create -f -
```

Note that these build configurations do not have any triggers defined. They will be invoked by the Jenkins pipeline, started manually in the console, or by an equivalent oc command for example:

```sh
oc -n <namespace> start-build <repo-name>-app-<job-name> --follow
```

Finally, we generally tag the resultant image so that the deployment config will know which exact image to use. This is also handled by the Jenkins pipeline. The equivalent oc command for example is:

```sh
oc -n <namespace> tag <repo-name>-app:latest <repo-name>-app:<job-name>
```

*Note: Remember to swap out the bracketed values with the appropriate values!*

### Deployment Configurations

Deployment configurations will emit and handle the deployment lifecycles of running containers based off of the previously built images. They generally contain a deploymentconfig, a service, and a route. They take in the following parameters:

| Name | Required | Description |
| --- | --- | --- |
| REPO_NAME | yes | Application repository name |
| JOB_NAME | yes | Job identifier (i.e. 'pr-5' OR 'master') |
| NAMESPACE | yes | which namespace/"environment" are we deploying to? dev, test, prod? |
| APP_NAME | yes | short name for the application |
| HOST_ROUTE | yes | used to set the publicly accessible url |

The Jenkins pipeline will handle deployment invocation automatically. However should you need to run it manually, you can do so with the following for example:

```sh
oc -n <namespace> process -f openshift/app.dc.yaml -p REPO_NAME=common-logging -p JOB_NAME=master -p NAMESPACE=<namespace> -p APP_NAME=clogs -p HOST_ROUTE=<app-name>-<job-name>-<namespace>.pathfinder.gov.bc.ca -o yaml | oc -n <namespace> apply -f -
```

Due to the triggers that are set in the deploymentconfig, the deployment will begin automatically. However, you can deploy manually by use the following command for example:

```sh
oc -n <namespace> rollout latest dc/<app-name>-app-<job-name>
```

*Note: Remember to swap out the bracketed values with the appropriate values!*

## Pull Request Cleanup

As of this time, we do not automatically clean up resources generated by a Pull Request once it has been accepted and merged in. This is still a manual process. Our PR deployments are all named in the format "pr-###", where the ### is the number of the specific PR. In order to clear all resources for a specific PR, run the following two commands to delete all relevant resources from the Openshift project (replacing `PRNUMBER` with the appropriate number):

```sh
oc delete all -n <namespace> --selector app=<app-name>-<job-name>
```
