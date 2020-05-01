#! /usr/bin/env node
const path = require('path')
const execSh = require('exec-sh')
const startWebServer = require('./startWebServer')

// CLI - Command Line Interface
var program = require('commander');
const CLI = require('../cli/CLI')

CLI.parseCommandLine()
  .then((result) => {

    if (result && result.unknownCommand) {

      program.help() // Exits

    } else if (result && result.useDefault) {


      // Start the web server
      startWebServer()
    }
  }).catch(e => {
    console.log(`Error in parseCommandLine:`, e);
  })
