const Koa = require('koa')
const Router = require('koa-router')
const cors = require('@koa/cors')
// const dirTree = require('directory-tree')
const { getDepcruise } = require('../util')

const app = new Koa()
const router = new Router()

// const tree = dirTree('/Users/waning/Pinssible/github/vue/src')
// console.log(tree)
app.use(cors())

// router.get('/dirtree', (ctx, next) => {
//   ctx.body = tree
// })

router.get('/depcruise', (ctx, next) => {
  ctx.body = getDepcruise({
    rootPath: '/Users/waning/Pinssible/github/vue/src',
    aliasPath: '/Users/waning/Pinssible/github/vue/scripts/alias'
  })
  // ctx.body = getDepcruise({
  //   rootPath: '/Users/waning/Pinssible/github/react/packages'
  // })
})

app.use(router.routes())

app.listen(3450)
