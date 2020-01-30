# Common Logging

CLOGS - A common logging API for writing logs to the hosted ELK stack service called HALPAS.

## Application

The application is a node server which serves the Common Logging Service API. It uses the following dependencies from NPM:

Authentication & Password Management

* `keycloak-connect` - Node adapter for Keycloak OIDC

Networking

* `api-problem` - RFC 7807 problem details
* `express` - Server middleware

Logging

* `morgan` - HTTP request logger
* `npmlog` - General log framework

Message Pattern Parsing

* `grok` - Node implementation of GROK

### General Code Layout

The codebase is separated into a few discrete layers:

* `components` - Business logic layer - the majority of useful functionality resides here
* `docs` - Contains OpenAPI 3.0 Yaml specification and ReDoc renderer
* `grok` - Contains code for GROK patterns, **note**: this is a copy of []() with modifications to remove `collectionsjs` dependency that breaks `keycloak-connect`.
* `routes` - Express middleware routing

## Quickstart Guide

In order for the application to run correctly, you will need to ensure that the following have been addressed:

1. All node dependencies have been installed and resolved
2. Environment configurations have been set up

### Install

As this is a Node application, please ensure that you have all dependencies installed as needed. This can be done by running `npm install`.

#### Windows

If you are installing on Windows, you will likely encounter a node-gyp installation failure when running `npm install`. To avoid this, you need to have Visual Studio Windows Build Tools installed, as well as Python 2.7.

Run `npm install --global --production windows-build-tools` in a PowerShell in Admin mode. This command will install Python 2.7 and a few other build chain components and may take a few minutes to complete. If everything installs correctly, you should be able to try `npm install` again and it should succeed.

### Configuration

Configuration management is done using the [config](https://www.npmjs.com/package/config) library. There are two ways to configure:

1. Look at [custom-environment-variables.json](/backend/config/custom-environment-variables.json) and ensure you have the environment variables locally set.
2. Create a `local.json` file in the config folder. This file should never be added to source control.
3. Consider creating a `local-test.json` file in the config folder if you want to use different configurations while running unit tests.

For more details, please consult the config library [documentation](https://github.com/lorenwest/node-config/wiki/Configuration-Files).

#### Environment Variables

| Environment Variable | Description |
| --- | --- |
| `ELKSTACK_LOGSTASHURL` | URL to Logstash, where logging messages are delivered |
| `KC_CLIENTID` | Keycloak Client username |
| `KC_CLIENTSECRET` | Keycloak Client password |
| `KC_REALM` | Associated Keycloak realm |
| `KC_SERVERURL` | Base authentication url for Keycloak |
| `SERVER_BODYLIMIT` | Maximum body length the API will accept |
| `SERVER_LOGLEVEL` | Server log verbosity. Options: `silly`, `verbose`, `debug`, `info`, `warn`, `error` |
| `SERVER_MORGANFORMAT` | Morgan format style. Options: `dev`, `combined` |
| `SERVER_PORT` | Port server is listening to |

## Commands

After addressing the prerequisites, the following are common commands that are used for this application.

### Run the server with hot-reloads for development

``` sh
npm run serve
```

### Run the server

``` sh
npm run start
```

### Run your tests

``` sh
npm run test
```

### Lints files

``` sh
npm run lint
```

## API Usage

This API is defined and described in OpenAPI 3.0 specification. When the API is running, you should be able to view the specification through ReDoc at <http://localhost:3000/api/v1/docs> (assuming you are running this microservice locally). Otherwise, the general API can usually be found under the `/api/v1/docs` path.

### General Design

The `/log` endpoint request body is composed of 2 main parts.

1. The **message** field (string with optional GROK **pattern**)
2. or the **data** field (JSON object)

The functionality of this endpoint is relatively simple, we accept a message or data, massage to a CLOGS object and deliver it to the ELK stack for searching/reporting/visualizations/etc.  Whatever is passed to CLOGS as message or data will become the data part of the clogs payload.  If pattern is provided, then the parsed fields become data.  Level can be provided as part of the payload or it can be parsed from the beginning of a message.

#### Examples

In the following examples, our client is named __LOGGING\_DEMO\_SERVICE\_CLIENT__.  This client has been authorized to use **CLOGS** service and has the role **CLOGS:LOGGER**.

```
POST api/v1/log
{
    "message": "debug we are testing out parsing level from the message"
}

Sends this to ElK Logstash
{
    "clogs": {
        "client": "LOGGING_DEMO_SERVICE_CLIENT",
        "timestamp": 1580249952932,
        "level": "debug",
        "data": {
            "message": "we are testing out parsing level from the message"
        }
    }
}
```
```
POST api/v1/log
{
    "message": "we are just testing out passing level in as a field",
    "level: "severe"
}

Sends this to ElK Logstash
{
    "clogs": {
        "client": "LOGGING_DEMO_SERVICE_CLIENT",
        "timestamp": 1580256805128,
        "level": "severe",
        "data": {
            "message": "we are just testing out passing level in as a field"
        }
    }
}
```

```
POST api/v1/log
{
    "message": "203.35.135.165 [2016-03-15T12:42:04+11:00] \"GET memz.co/cloud/\" 304 962 0 - 0.003 [MISS] \"-\" \"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36\"",
    "pattern": "%{IP:client} \\[%{TIMESTAMP_ISO8601:timestamp}\\] \"%{WORD:method} %{URIHOST:site}%{URIPATHPARAM:url}\" %{INT:code} %{INT:request} %{INT:response} - %{NUMBER:took} \\[%{DATA:cache}\\] \"%{DATA:mtag}\" \"%{DATA:agent}\""
}

Sends this to ElK Logstash
{
    "clogs": {
        "client": "LOGGING_DEMO_SERVICE_CLIENT",
        "timestamp": 1580249952932,
        "level": "info",
        "data": {
            "client": "203.35.135.165",
            "timestamp": "2016-03-15T12:42:04+11:00",
            "method": "GET",
            "site": "memz.co",
            "url": "/cloud/",
            "code": "304",
            "request": "962",
            "response": "0",
            "took": "0.003",
            "cache": "MISS",
            "mtag": "-",
            "agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36"
        }
    }
}
```

```
POST api/v1/log
{
    "data": {
        "who": "we",
        "did": "built",
        "what": "this city",
        "level": "fatal",
        "sub": {
            "obj": "data"
        }
    }
}

Sends this to ElK Logstash
{
    "clogs": {
        "client": "LOGGING_DEMO_SERVICE_CLIENT",
        "timestamp": 1580250003232,
        "level": "fatal",
        "data": {
            "who": "we",
            "did": "built",
            "what": "this city",
            "level": "fatal",
            "sub": {
                "obj": "data"
            }
        }
    }
}
```
