const depcruise = require('dependency-cruiser').cruise
const path = require('path')

function getDepcruise() {
  const alias = require('/Users/waning/Pinssible/github/vue/scripts/alias')
  console.log(alias)

  let dependencies = depcruise(['/Users/waning/Pinssible/github/vue/src'], {
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
          ) + '.js'
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
  return dependencies
}

module.exports = {
  getDepcruise
}
