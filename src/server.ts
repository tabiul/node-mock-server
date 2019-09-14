import * as http from "http";
import * as fs from "fs"
import args from "args"
import * as toml from "toml"
import chalk from "chalk"
import ansiEscapes from "ansi-escapes"

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
const info = chalk.green
const error = chalk.red.bold
const warn = chalk.yellow
const nestedNextLine = ansiEscapes.cursorNextLine + ansiEscapes.cursorForward(2)

let rules: Rule = {}

if (flags.file) {
  console.log(info(`reading rules file ${flags.file}`))
  rules = toml.parse(fs.readFileSync(flags.file, 'utf8'))
}

let server = http.createServer((request, response) => {

  let path = request.url as string
  console.log(ansiEscapes.cursorNextLine)
  console.log(chalk.blue.bold("request:"))
  console.log(info(nestedNextLine + 'url: %s'), path)
  console.log(info(nestedNextLine + 'method: %s'), request.method)
  let requestData = ''
  request.on('data', (data) => {
    requestData += data
  })
  request.on('end', () => {
    console.log(info(nestedNextLine + 'body: %s'), requestData)
    processRequest(path, response)
  })
});

process.on('SIGINT', () => {
  process.exit();
});

let processRequest = function (requestUrl: String, response: http.ServerResponse) {
  if (rules) {
    console.log(ansiEscapes.cursorNextLine)
    for (let path in rules) {
      console.log(info(`check rule ${path}`))
      if (requestUrl.search(path) != -1) {
        console.log(nestedNextLine + info(`found matching rule ${path}`))
        if (rules[path].headers) {
          for (let header in rules[path].headers) {
            response.setHeader(header, rules[path].headers![header])
          }
        }
        if (rules[path].responseCode) {
          response.writeHead(rules[path].responseCode)
        } else {
          console.log(nestedNextLine + warn('no response code, defaulting to Http 200'))
          response.writeHead(200)
        }
        if (rules[path].body) response.write(rules[path].body)
        break
      } else {
        console.log(nestedNextLine + warn("rule was not matched"))
      }
      console.log(ansiEscapes.cursorNextLine)
    }
    response.end()
  } else {
    console.log(warn('no rules defined, responding with Http 200'))
    response.writeHead(200)
    response.end()
  }
}

console.log(chalk.green('starting server on port: %d'), flags.port)
server.listen(flags.port);