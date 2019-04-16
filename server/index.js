const Koa = require('koa')
const Router = require('koa-router')
const cors = require('@koa/cors')
const dirTree = require('directory-tree')

const app = new Koa()
const router = new Router()

const tree = dirTree('/Users/waning/Pinssible/github/vue/src')
// console.log(tree)
app.use(cors())

router.get('/data', (ctx, next) => {
  ctx.body = tree
})

app.use(router.routes())

app.listen(3450)
