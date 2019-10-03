import * as http from "http";
import * as fs from "fs"
import args from "args"
import * as toml from "toml"
import chalk from "chalk"
import ansiEscapes from "ansi-escapes"

args.option("port", "port to run", 9080)
args.option("file", "path to the url matcher toml file", "")

interface KeyValue {
  readonly [key: string]: string
}

interface RuleProperties {
  readonly responseCode: number
  readonly headers?: KeyValue
  readonly body?: string
}

interface Rule {
  readonly [key: string]: RuleProperties
}

const flags = args.parse(process.argv)
const info = chalk.green
const error = chalk.red.bold
const warn = chalk.yellow
const nestedNextLine = ansiEscapes.cursorNextLine + ansiEscapes.cursorForward(2)

let rules: Rule = {}

if (flags.file) {
  console.log(info(`reading rules file ${flags.file}`))
  try {
    rules = toml.parse(fs.readFileSync(flags.file, 'utf8'))
  } catch (e) {
    console.log(error(`Parsing error on line ${e.line}:${e.column}: ${e.message}`))
  }
}

const server = http.createServer((request, response) => {

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

const processRequest = (requestUrl: String, response: http.ServerResponse) => {
  if (!rules) {
    console.log(warn('no rules defined, responding with Http 200'))
    response.writeHead(200)
    response.end()
    return
  }

  console.log(ansiEscapes.cursorNextLine)
  const path = Object.keys(rules).find(rulePath => requestUrl.search(rulePath) != -1)
  if (path) {
    console.log(nestedNextLine + info(`found matching rule ${path}`))
    const rule = rules[path]

    if (rule.headers) {
      Object.entries(rule.headers).forEach(([header, value]) => response.setHeader(header, value))
    }

    if (rule.responseCode) {
      response.writeHead(rule.responseCode)
    } else {
      console.log(nestedNextLine + warn('no response code, defaulting to Http 200'))
      response.writeHead(200)
    }

    if (rule.body) {
      response.write(rule.body)
    }
  } else {
    console.log(nestedNextLine + warn("rule was not matched"))
  }
  console.log(ansiEscapes.cursorNextLine)

  response.end()
}

console.log(info('starting server on port: %d'), flags.port)
server.listen(flags.port);