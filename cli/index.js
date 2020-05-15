#!/usr/bin/env node

const program = require('commander')
const { up } = require('../server/index')

program
  .version('1.0.11')
  .option('-d, --dir [path]', 'The directory where the code locates', '')
  .option('-a, --alias [path]', 'The alias config file', '')
  .option(
    '-x, --exclude [string]',
    'Exclude some directory',
    val => val.split(','),
    []
  )
  .option('-p, --port [value]', 'The port of server', 3450)
  .parse(process.argv)

const { dir, alias, exclude, port } = program
up({ dir, alias, exclude, port })

let url = `http://localhost:${port}`
console.log(url)
let start =
  process.platform === 'darwin'
    ? 'open'
    : process.platform === 'win32'
    ? 'start'
    : 'xdg-open'
require('child_process').exec(start + ' ' + url)
