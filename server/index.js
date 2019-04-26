const Koa = require('koa')
const Router = require('koa-router')
const cors = require('@koa/cors')
const serve = require('koa-static')
// const dirTree = require('directory-tree')
const { getDepcruise } = require('../util')
const fs = require('fs')
const path = require('path')

function up() {
  const app = new Koa()
  const router = new Router()

  // const tree = dirTree('/Users/waning/Pinssible/github/vue/src')
  // console.log(tree)
  app.use(cors())

  // router.get('/dirtree', (ctx, next) => {
  //   ctx.body = tree
  // })

  router.get('/depcruise', (ctx, next) => {
    try {
      ctx.body = getDepcruise({
        rootPath: '/Users/waning/Pinssible/github/vue/src',
        aliasPath: '/Users/waning/Pinssible/github/vue/scripts/alias'
      })
      // ctx.body = getDepcruise({
      //   rootPath: '/Users/waning/Pinssible/github/react/packages'
      // })
    } catch (e) {
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

  app.use(serve(path.resolve(__dirname, '../client/dist/')) )
  app.use(router.routes())

  app.listen(3450)
}

module.exports = {
  up
}

if (!module.parent) {
  up()
}
