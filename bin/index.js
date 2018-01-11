#! /usr/bin/env node
const path = require('path')
const execSh = require('exec-sh')

// CLI - Command Line Interface
const CLI = require('../cli/CLI')



console.log('HERE WE ARE, IN aws-explorer-nuxt')


CLI.parseCommandLine((unknownCommand, useDefault) => {
  if (unknownCommand) {

    program.help() // Exits

  } else if (useDefault) {


    // Start the web server
    // startWebServer()

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

      // // collect streams output
      // var child = execSh(["bash -c id", "echo lorem >&2"], true,
      //   function(err, stdout, stderr){
      //     console.log("error: ", err);
      //     console.log("stdout: ", stdout);
      //     console.log("stderr: ", stderr);
      //   });
    });
  }
})
