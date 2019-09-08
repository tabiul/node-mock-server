import * as http from "http";
import * as fs from "fs"
import args from "args"
import * as toml from "toml"

args.option("port", "port to run", 9080)
args.option("file", "path to the url matcher toml file", "")

interface KeyValue {
  [key: string]: string
}
interface RuleProperties {
  responseCode: number,
  headers?: KeyValue,
  body?: string
}
interface Rule {
  [key: string]: RuleProperties
}

const flags = args.parse(process.argv)

let rules: Rule = {}

if (flags.file) {
  console.log(`reading rules file ${flags.file}`)
  rules = toml.parse(fs.readFileSync(flags.file, 'utf8'))
}

let server = http.createServer((request, response) => {

  let path = request.url as string
  console.log('url', path)
  console.log('method', request.method)
  let requestData = ''
  request.on('data', (data) => {
    requestData += data
  })
  request.on('end', () => {
    console.log('body', requestData)
    processRequest(path, response)
  })
});

process.on('SIGINT', () => {
  process.exit();
});

let processRequest = function (requestUrl: String, response: http.ServerResponse) {
  if (rules) {
    for (let path in rules) {
      console.log(`check rule ${path}`)
      if (requestUrl.search(path) != -1) {
        console.log(`found matching rule ${path}`)
        if (rules[path].headers) {
          for (let header in rules[path].headers) {
            response.setHeader(header, rules[path].headers![header])
          }
        }
        if (rules[path].responseCode) {
          response.writeHead(rules[path].responseCode)
        } else {
          console.log('no response code, defaulting to Http 200')
          response.writeHead(200)
        }
        if (rules[path].body) response.write(rules[path].body)
        break
      } else {
        console.log("rule was not matched")
      }
    }
    response.end()
  } else {
    console.log('no rules defined, responding with Http 200')
    response.writeHead(200)
    response.end()
  }
}

console.log('starting server on port', flags.port)
server.listen(flags.port);