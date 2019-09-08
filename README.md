## Mock Node Server

A simple node server that can run in a docker container that can be used for simple testing.

It `console.log` all requests received including the body. An optional rules file can be specified to inidcate how any request should be handled. If not provided it responds with `Http 200`

### Rule File

Two types of rules file is supported

* json (v1.0.0)
* [toml](https://github.com/toml-lang/toml) (v2.0.0)

The advantage of using **toml** is that it support multilines without escaping. It is recommened to use **toml** format unless you love json and escaping too much :).

#### Toml format (Supported in v2.0.0)

```
  ["/a/b/c"] # the path
  body = '''
     {"text": "I love toml"}
  '''
  headers = {content-type = "application/json"}
  responseCode = 200

  ["a/b/d"] # another path    
```


#### Json Format (Only supported in v1.0.0)
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

`docker pull tabiul/node-mock-server:v1.0.0` (json)
`docker pull tabiul/node-mock-server:v2.0.0` (toml)

The server takes the following arguments

* -p : specify port, defaults to 9080
* -f : path to rules file, default no file

#### Running in docker

`docker run -it -p 9080:9080 -v /path/to/rules.json:/rules.json node-mock-server:v1.0.0 -f /rules.json` (json)

`docker run -it -p 9080:9080 -v /path/to/rules.toml:/rules.toml node-mock-server:v2.0.0 -f /rules.toml` (toml)