var rimraf = require('rimraf')
  , browserify = require('browserify')
  , path = require('path')
  , fs = require('fs')
  , insertGlobals = require('insert-module-globals')

var bundleDir = path.join(__dirname, 'bundle')
  , bundleJsDir = path.join(bundleDir, 'js')
  , nativeDir = path.join(bundleJsDir, 'build')

// modules with browser-specific version overrides that we want to ignore
var IGNORED_BROWSER_VERSIONS = [
  'cuid',
  'ws'
].reduce(function(obj, cur) {
  obj[cur] = require.resolve(cur)
  return obj
}, {})

function createBrowserify() {
  var opts = {
    // equivalent to --bare, with custom built-ins
    commondir: false,
    detectGlobals: false,
    insertGlobalVars: {
      __filename: insertGlobals.__filename,
      __dirname: insertGlobals.__dirname
    },
    builtins: IGNORED_BROWSER_VERSIONS,
    // ignore missing modules to counteract stuff like ws that expects to fail some require's
    ignoreMissing: true,
    // TODO(tec27): utilize the 'missing' event from module_deps (submit PR to browserify to expose
    // it?) to find missing modules that are actually .node modules and copy them up to the build
    // dir, then write a shim module to load them
  }

  var b = browserify(opts)
  return b
}

function packageFilter(info, pkgdir) {
  var filter = filters[path.basename(pkgdir)]
  return filter ? filter(info) : info
}

var binaries = [
    ['../node-bw/Release/bw.node', path.join(nativeDir, 'bw.node')],
    ['../node-psi/Release/psi.node', path.join(nativeDir, 'psi.node')],
    ['../forge/Release/forge.node',  path.join(nativeDir, 'forge.node')],
    ['../Release/psi.exe', path.join(bundleDir, 'psi.exe')],
    ['../Release/psi-emitter.exe', path.join(bundleDir, 'psi-emitter.exe')],
    ['../Release/shieldbattery.dll', path.join(bundleDir, 'shieldbattery.dll')],
    ['../Release/shieldbat.snp', path.join(bundleDir, 'shieldbat.snp')]
]

function checkPrereqs() {
  console.log('Checking prerequisites...')
  binaries.forEach(function(prereq) {
    try {
      require.resolve(prereq[0])
    } catch (err) {
      console.log('Error resolving prerequisite: ' + prereq[0])
      console.log('Please run vcbuild.bat before bundling')
      throw err
    }
  })

  console.log('Done!\n')
  removePrevious()
}

function removePrevious() {
  console.log('Removing previous bundle...')
  rimraf(bundleDir, function(err) {
    if (err) throw err

    console.log('Done!\n')
    console.log('Creating bundle directory...')
    fs.mkdir(bundleDir, dirCreated)
  })
}

function dirCreated(err) {
  if (err) throw err

  console.log('Done!\n')
  console.log('Creating js directory...')
  fs.mkdir(bundleJsDir, jsDirCreated)
}

function jsDirCreated(err) {
  if (err) throw err

  console.log('Done!\n')
  console.log('Bundling JS...')

  var b = createBrowserify()
  b.add(require.resolve('../js/index.js'))
  b.bundle().pipe(fs.createWriteStream(path.join(bundleJsDir, 'index.js')))
    .on('finish', function() {
      console.log('JS bundle written!')
      console.log('Done!\n')
      console.log('Creating native module dir...')
      fs.mkdir(nativeDir, nativeDirCreated)
    })
}

function nativeDirCreated(err) {
  if (err) throw err

  console.log('Done!\n')
  copyBinaries()
}

function copyBinaries() {
  console.log('Copying binaries...')

  var copying = Object.create(null)
  binaries.forEach(function(binary) {
    var input = binary[0]
      , output = binary[1]

    fs.createReadStream(input).pipe(fs.createWriteStream(output))
      .on('finish', function() {
        console.log(input + ' => ' + output)
        delete copying[input]
        maybeDone()
      })
    copying[input] = true
  })

  function maybeDone() {
    if (Object.keys(copying).length) return

    console.log('Done!\n')
  }
}

checkPrereqs()
