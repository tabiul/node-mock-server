## Mock Node Server

A simple node server that can run in a docker container that can be used for simple testing.

It `console.log` all requests received including the body. An optional rules file can be specified to inidcate how any request should be handled. If not provided it responds with `Http 200`

### Rule File

The rule file is a simple json file that has the following fields.

* path - specify the path for the rule. The mock server will use simple `String.find` to see if the request path matches and if it does then the specific entry will be used. No fancy regex at the moment.
* body - response body
* headers - response headers
* responseCode - Http Response code

No validation is done for the rules file. Sample rule file

```
[
  {
    "path": "/abc",
    "body": "hello world",
    "headers": [{"key": "content-type", "value": "text"}, {"key" : "abc", "value": "def"}],
    "responseCode" : 200
  },
  {
    "path": "/def",
    "body": "hello world 2",
    "headers": [{"key": "content-type", "value": "text"}, {"key" : "abc", "value": "def"}],
    "responseCode" : 400
  }
]
```
### Creating image locally

`docker build -t "node-mock-server" .`


### Running

`docker pull tabiul/node-mock-server:latest`

The server takes the following arguments

* -p : specify port, defaults to 9080
* -f : path to rules file, default no file

#### Running in docker

`docker run -it -p 9080:9080 -v /path/to/rules.json:/rules.json node-mock-server:latest -f /rules.json`