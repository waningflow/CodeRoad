const Koa = require('koa')
const compress = require('koa-compress')
const Router = require('koa-router')
const cors = require('@koa/cors')
const serve = require('koa-static')
const { getDepcruise } = require('../util')
const fs = require('fs')
const path = require('path')
const ProjectList = require('./projectList')

const ProjectDir = path.resolve(__dirname, '../../github/')

function up(params) {
  const { dir, alias, exclude, port } = params
  const app = new Koa()
  const router = new Router()

  app.use(cors())
  app.use(compress())

  let depData
  let fileData = {}
  router.get('/depcruise', (ctx, next) => {
    try {
      if (ctx.query && ctx.query.name) {
        ctx.body = handleDep(ctx.query.name)
      } else {
        depData =
          depData ||
          getDepcruise({
            rootPath: dir,
            aliasPath: alias,
            excludePattern: exclude
          })
        ctx.body = depData
      }
    } catch (e) {
      console.log(e)
      next(e)
    }
  })

  router.get('/file', (ctx, next) => {
    try {
      let filePath = ctx.query.filepath
      let content
      if (fileData[filePath]) {
        content = fileData[filePath]
      } else {
        content = fs.readFileSync(filePath)
        fileData[filePath] = content
      }
      ctx.body = content
    } catch (e) {
      next(e)
    }
  })

  router.get('/projectlist', (ctx, next) => {
    try {
      ctx.body = ProjectList
    } catch (e) {
      next(e)
    }
  })

  app.use(serve(path.resolve(__dirname, '../client/dist/')))
  app.use(router.routes())

  app.listen(port)
  return app
}

const CachedDepData = {}

function handleDep(name) {
  let project = ProjectList.find(v => v.name === name)
  if (project) {
    if (!CachedDepData.hasOwnProperty(name)) {
      let options = {
        rootPath: path.resolve(ProjectDir, project.name, project.src || ''),
        aliasPath: project.alias
          ? path.resolve(ProjectDir, project.name, project.alias)
          : '',
        excludePattern: project.exclude || []
      }
      console.log(options)
      let data = getDepcruise(options)
      CachedDepData[name] = data
    }
    return CachedDepData[name]
  } else {
    throw new Error('project not found')
  }
}

module.exports = {
  up
}

if (!module.parent) {
  up({ dir: '', alias: '', exclude: [], port: 3450 })
}
