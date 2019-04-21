const depcruise = require('dependency-cruiser').cruise
const dirtree = require('directory-tree')
const path = require('path')

function getFileList(tree) {
  let rtn = []
  if (tree.type === 'file') {
    rtn.push(tree)
  } else if (tree.type === 'directory') {
    tree.children.forEach(v => {
      rtn = rtn.concat(getFileList(v))
    })
  }
  return rtn
}

function attachDep(tree, modules) {
  if (tree.type === 'file') {
    tree.dependencies = modules[tree.path].dependencies.map(v => v.resolved)
  }else if(tree.type === 'directory'){
    let deps = tree.children.reduce((pre, cur) => {
      attachDep(cur, modules)
      pre = pre.concat(cur.dependencies)
      return pre
    }, [])
    tree.dependencies = deps.filter(v => !v.startsWith(tree.path))
  }
}

function getDepcruise(params) {
  const { rootPath, aliasPath } = params
  const alias = require(aliasPath) || {}
  console.log(alias)

  let dependencies = depcruise([rootPath], {
    exclude: '(node_modules)'
  })

  let dirtrees = dirtree(rootPath)
  let fileList = getFileList(dirtrees)

  let aliasModules = []
  dependencies.modules = dependencies.modules.map(v => {
    if (v.source.startsWith('.')) {
      v.source = path.resolve(__dirname, '../', v.source)
    }
    v.dependencies = v.dependencies
      .filter(dv => !dv.coreModule)
      .map(dv => {
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
            let file = fileList.find(fv => fv.path.startsWith(dv.resolved))
            dv.resolved = file.path
            dv.dependencyTypes[0] = 'local_alias'
            aliasModules.push(dv.module)
          }
        }
        return dv
      })
    return v
  })
  dependencies.modules = dependencies.modules.filter(
    v => aliasModules.indexOf(v.source) === -1 && !v.coreModule
  )
  dependencies.modules = dependencies.modules.reduce((pre, cur) => {
    pre[cur.source] = cur
    return pre
  }, {})
  dependencies.fileList = fileList
  attachDep(dirtrees, dependencies.modules)
  dependencies.dirtrees = dirtrees
  // console.log(JSON.stringify(dependencies.fileList.map(v => v.path).sort()))
  // console.log('')
  // console.log(JSON.stringify(dependencies.modules.map(v => v.source).sort()))
  return dependencies
}

module.exports = {
  getDepcruise
}
