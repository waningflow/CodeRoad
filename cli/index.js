#!/usr/bin/env node

const program = require('commander')

program
  .option('-p, --port [value]')
  .parse(process.argv, 'Sepcific a port number', 6789)

console.log('run')
console.log(program.port)
