const depcruise = require('dependency-cruiser').cruise
const dirtree = require('directory-tree')
const path = require('path')

const defaultExcludePattern = ['node_modules', '__tests?__', 'dist', '\\/\\..*']
const defaultAllowExt = ['js', 'ts', 'jsx', 'tsx', 'vue']

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
    tree.dependencies = []
    tree.dependents = []
    if (modules[tree.path]) {
      tree.dependencies = modules[tree.path].dependencies.slice()
      tree.dependents = modules[tree.path].dependents.slice()
    }
  } else if (tree.type === 'directory') {
    let deps = tree.children.reduce(
      (pre, cur) => {
        attachDep(cur, modules)
        pre.dependencies = pre.dependencies.concat(cur.dependencies)
        pre.dependents = pre.dependents.concat(cur.dependents)
        return pre
      },
      { dependencies: [], dependents: [] }
    )
    tree.dependencies = deps.dependencies.filter(v => !v.startsWith(tree.path))
    tree.dependents = deps.dependents.filter(v => !v.startsWith(tree.path))
    tree.path += '/'
  }
}

function isExtSupport(path, exts) {
  for (let i = 0, l = exts.length; i < l; i++) {
    if (path.endsWith(exts[i])) {
      return true
    }
  }
  return false
}

function getDepcruise(params) {
  const { rootPath, aliasPath, excludePattern } = params
  const exePath = process.cwd()
  let absPath = path.resolve(exePath, rootPath)
  const alias = aliasPath ? require(path.resolve(exePath, aliasPath)) : {}
  const exts = defaultAllowExt.slice()
  const exclude = defaultExcludePattern
    .concat(excludePattern)
    .map(v => `(${v})`)
    .join('|')
  const excludeReg = new RegExp(exclude)
  const extReg = new RegExp(`\\.(${exts.join('|')})$`)
  let dependencies = depcruise([absPath], {
    exclude: excludeReg
  })

  let dirtrees = dirtree(absPath, {
    extensions: extReg,
    exclude: excludeReg
  })
  let fileList = getFileList(dirtrees)
  let aliasModules = []
  dependencies.modules = dependencies.modules.map(v => {
    v.source = path.resolve(exePath, v.source)
    v.dependencies = v.dependencies
      .filter(dv => !dv.coreModule)
      .map(dv => {
        dv.resolved = path.resolve(exePath, dv.resolved)
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
        return dv.resolved
      })
      .filter(dvr => isExtSupport(dvr, exts))
    return v
  })
  dependencies.modules = dependencies.modules.filter(
    v =>
      aliasModules.indexOf(v.source) === -1 &&
      !v.coreModule &&
      isExtSupport(v.source, exts)
  )
  let modules = dependencies.modules.reduce((pre, cur) => {
    pre[cur.source] = {
      dependencies: [],
      dependents: []
    }
    return pre
  }, {})
  dependencies.modules.forEach(v => {
    modules[v.source].dependencies = v.dependencies.slice()
    v.dependencies.forEach(dv => {
      if (modules[dv]) {
        modules[dv].dependents.push(v.source)
      }
    })
  })
  dependencies.modules = modules
  attachDep(dirtrees, modules)
  dependencies.dirtrees = dirtrees
  dependencies.basePath = absPath
  return dependencies
}

module.exports = {
  getDepcruise
}
