// const fs = require('fs')
// const flow = require('flow-parser')
// const _ = require('lodash')
const { removeKeys } = require('./utils.js')
const babelParser = require('@babel/parser')
const dependencyTree = require('dependency-tree')
const madge = require('madge')
const depcruise = require('dependency-cruiser').cruise
const path = require('path')

const alias = require('/Users/waning/Pinssible/github/vue/scripts/alias')
console.log(alias)

let dependencies = depcruise(['/Users/waning/Pinssible/github/vue/src'],{
  exclude: /node_modules/
})

let aliasModules = []
dependencies.modules = dependencies.modules.map(v => {
  if (v.source.startsWith('.')) {
    v.source = path.resolve(__dirname, '../', v.source)
  }
  v.dependencies = v.dependencies.map(dv => {
    if (dv.resolved.startsWith('.')) {
      dv.resolved = path.resolve(__dirname, '../', dv.resolved)
    }
    if (dv.dependencyTypes && dv.dependencyTypes[0] === 'unknown') {
      let aliasName = dv.module.split(path.sep)[0]
      let aliasValue = alias[aliasName]
      if (aliasValue) {
        dv.resolved = path.resolve(
          aliasValue,
          dv.module.slice(aliasName.length + 1)
        )
        dv.dependencyTypes[0] = 'local_alias'
        aliasModules.push(dv.module)
      }
    }
    return dv
  })
  return v
})
dependencies.modules = dependencies.modules.filter(
  v => aliasModules.indexOf(v.source) === -1
)
console.log(JSON.stringify(dependencies))

// madge('/Users/waning/Pinssible/github/react/packages/react', {
//   baseDir: '/Users/waning/Pinssible/github/react/packages/',
//   excludeRegExp: ['node_modules', 'dist', 'test'],
//   // webpackConfig: '/Users/waning/Pinssible/github/'
//   // webpackConfig: {
//   //   resolve: {
//   //     alias: {
//   //       'shared/*': '/Users/waning/Pinssible/github/react/packages/shared/*'
//   //     }
//   //   }
//   // }
// }).then(res => {
//   console.log(res.obj())
// })

// const list = dependencyTree.toList({
//   filename: '/Users/waning/Pinssible/github/vue/src/core/index.js',
//   directory: '/Users/waning/Pinssible/github/vue/src/core'
// })

// console.log(list.length)
// console.log(list)

// const tree = dependencyTree({
//   filename: '/Users/waning/Pinssible/github/vue/src/core/index.js',
//   directory: '/Users/waning/Pinssible/github/vue',
//   // requireConfig: '/Users/waning/Pinssible/github/vue/scripts/config.js'
// })
// console.log(tree)
// const code = `
// import {
//   no,
//   noop,
//   identity
// } from 'shared/util'
// export default {}
// `

// const ast = babelParser.parse(code, {
//   sourceType: 'module',
//   sourceFilename: true,
//   plugins: [
//     // enable jsx and flow syntax
//     "jsx",
//     "flow"
//   ]
// })
// removeKeys(ast, ['loc', 'start', 'end'])
// console.log(JSON.stringify(ast))
// const ast = espree.parse(code)

// let ast_flow = flow.parse(code)
// removeKeys(ast_flow, ['loc', 'range'])

// console.log()
// console.log(JSON.stringify(ast_flow))
