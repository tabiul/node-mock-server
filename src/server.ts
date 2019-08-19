import * as http from "http";
import * as fs from "fs"
import args from "args"

args.option("port", "port to run", 9080)
args.option("file", "path to the url matcher json file", "")

interface KeyValue {
  key: string,
  value: string
}
interface Rule {
  path: string,
  responseCode: number,
  headers?: [KeyValue],
  body?: string
}

const flags = args.parse(process.argv)

let rules: Rule[] = []

if (flags.file) {
  console.log(`reading rules file ${flags.file}`)
  rules = JSON.parse(fs.readFileSync(flags.file, 'utf8'))
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
  if (rules.length != 0) {
    const rule = rules.find(d => {
      const match = requestUrl.search(d.path)
      if (match >= 0) {
        return d
      }
    })
    if (rule) {
      console.log(`found matching rule ${rule.path}`)
      if (rule.headers) {
        rule.headers.forEach(kv => {
          response.setHeader(kv.key, kv.value)
        })
      }
      if (rule.responseCode) {
        response.writeHead(rule.responseCode)
      } else {
        console.log('no response code, defaulting to Http 200')
        response.writeHead(200)
      }
      if (rule.body) response.write(rule.body)
    } else {
      console.log("no rule was matched")
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