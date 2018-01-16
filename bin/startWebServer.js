const path = require('path')
const execSh = require('exec-sh')

function startWebServer() {
  console.log('At ' + process.cwd())
  console.log('At ' + __dirname)

  const dir = path.resolve(__dirname + '/..')
  console.log('dir=', dir)

  //process.cwd(dir)
  //const main = require('./build/main')

  // const cmd = path.resolve(__dirname + '/../build/main.js')
  // console.log('cmd=', cmd)

  // run interactive bash shell
  execSh("node build/main.js", { cwd: dir }, function(err){
    if (err) {
      console.log("Exit code: ", err.code);
      return;
    }
  });
}

module.exports = startWebServer;
