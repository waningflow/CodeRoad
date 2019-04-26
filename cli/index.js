#!/usr/bin/env node

const program = require('commander')
const { up } = require('../server/index')

program
  .option('-p, --port [value]')
  .parse(process.argv, 'Sepcific a port number', 6789)

console.log('run')
console.log(program.port)

up()

let url = 'http://localhost:3450'
let start = (process.platform === 'darwin'? 'open': process.platform === 'win32'? 'start': 'xdg-open')
require('child_process').exec(start + ' ' + url)
