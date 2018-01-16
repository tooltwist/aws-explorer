#! /usr/bin/env node
const path = require('path')
const execSh = require('exec-sh')
const startWebServer = require('./startWebServer')

// CLI - Command Line Interface
var program = require('commander');
const CLI = require('../cli/CLI')

CLI.parseCommandLine((unknownCommand, useDefault) => {
  if (unknownCommand) {

    program.help() // Exits

  } else if (useDefault) {


    // Start the web server
    startWebServer()
  }
})
