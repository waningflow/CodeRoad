const Koa = require('koa')
const Router = require('koa-router')
const cors = require('@koa/cors')
const serve = require('koa-static')
const { getDepcruise } = require('../util')
const fs = require('fs')
const path = require('path')

function up(params) {
  const { dir, alias, exclude, port } = params
  const app = new Koa()
  const router = new Router()

  app.use(cors())

  router.get('/depcruise', (ctx, next) => {
    try {
      ctx.body = getDepcruise({
        rootPath: dir,
        aliasPath: alias,
        excludePattern: exclude
      })
    } catch (e) {
      console.log(e)
      next(e)
    }
  })

  router.get('/file', (ctx, next) => {
    try {
      let content = fs.readFileSync(ctx.query.filepath)
      ctx.body = content
    } catch (e) {
      next(e)
    }
  })

  app.use(serve(path.resolve(__dirname, '../client/dist/')))
  app.use(router.routes())

  app.listen(port)
}

module.exports = {
  up
}

if (!module.parent) {
  up({ dir: '', alias: '', exclude: [], port: 3450 })
}
