
"use strict";

const AWS = require('aws-sdk');
const fs = require('fs');

let regions = [ ] // regionCode (String) => Region (object)
let sequence = 1;
const REFRESH_TIME = 500; // ms
const PREFIX = 'nbt-';

class StackInfo {
  constructor(regionCode) {
    //this.region = new Region(region)
    this.loaded = 0
    this.regionCode = regionCode
    this.id = sequence++;

    // Environment details
    // These come from the exports of the stacks
    this._environmentsLoaded = 0; // Time they were loaded
    this._environments = null
    this._environmentIndex = null;

    // Stacks
    this._stacksLoaded = 0;
    this._stacks = null;
    this._stackIndex = null;

    let stepCnt = 0;
    this.ENV_STEP_KEYPAIR_FILE = stepCnt = 0;
    this.ENV_STEP_KEYPAIR_MODE = stepCnt++;
    this.ENV_STEP_CREDENTIALS = stepCnt++;
    this.ENV_STEP_NETWORK = stepCnt++;
    this.ENV_STEP_JUMPBOX = stepCnt++;
    this.ENV_STEP_ECS = stepCnt++;
    this.NUM_ENVIRONMENT_STEPS = stepCnt;

    this.APP_STEP_LOAD_BALANCER = stepCnt = 0;
    this.APP_STEP_ENVIRONMENT = stepCnt++;
    this.APP_STEP_DEPLOYMENT = stepCnt++;
    this.NUM_APP_STEPS = stepCnt;

  }

  stacks(callback/*(err,stacks)*/) {
    console.log('stacks()');


    // If we have a recently loaded list of environments, return it.
    if ((Date.now() - this._stacksLoaded) < REFRESH_TIME) {
      return callback(null, this._stacks);
    }

    // Load the stacks for this region
    let cloudformation = new AWS.CloudFormation({
      apiVersion: '2011-01-01',
      region: this.regionCode
    });
    // console.log('cf=', cloudformation);

    cloudformation.describeStacks({}, (err, data) => {
      if (err) return callback(err);

      // console.log('stacks:', data);
      this._stackIndex = [ ]; // Index -> stack
      this._stacks = [ ]; // [stack]
      data.Stacks.forEach(stack => {
        // console.log('stack:', stack);
        let name = stack.StackName;
        if (name === 'j8-vpc') {
          console.log(`stack ${stack.StackName}  ${stack.StackStatus}`);
        }
        this._stackIndex[name] = stack;
        this._stacks.push(stack);

        let pos = name.indexOf('-');
        let envName = (pos > 0) ? name.substring(0, pos) : name;
        console.log(`   ${name} - envname=${envName}`);

        // Look for the template name
        let template = ''
        stack.Outputs.forEach(output => {
          if (output.OutputKey == 'TemplateVersion') {
            // let env = this.findEnvironment(envName);
            // stack._vpc = true
          }
        });// next output
      });// next stack

      // Sort the stacks
      return callback(null, this._stacks);

    });//-describeStacks
  }

  environments(callback/*(err,environments)*/ ) {
    console.log('environments()');

    // If we have a recently loaded list of environments, return it.
    if ((Date.now() - this._environmentsLoaded) < REFRESH_TIME) {
      return callback(null, this._environments);
    }

    // Load, then sort our list of the environments
    this._environmentIndex = [ ]
    this._environmentsLoaded = Date.now() + 60000;
    this.loadEnvironmentsFromStackOutputs((err, environments) => {
      if (err) return callback(err);
      console.log('got ', environments);

      // Put 'em in a list
      let list = [ ];
      for (var name in this._environmentIndex) {
        let env = this._environmentIndex[name];
        list.push(env);
      }

      // Sort the list
      list = list.sort((a, b) => {
        if (a.Name < b.Name) {
          return -1;
        } else if (a.Name > b.Name) {
          return +1;
        }
        return 0;
      });
      this._environmentList = list;
      this._environmentsLoaded = Date.now();
      return callback(null, list);
    });
  }

  findEnvironment(envName) {
    let e = this._environmentIndex[envName]
    if (!e) {
      e = {
        name: envName,
        apps: [ ],
        values: [ ]
      }
      this._environmentIndex[envName] = e
    }
    return e;
  }

  findApplication(envName, appName) {
    // console.log(`add app ${appName} to ${envName}`);
    let env = this.findEnvironment(envName);
    let app = env.apps[appName];
    if (!app) {
      env.apps[appName] = app = {
        values: [ ]
      }
    }
    return app;
  }

  _addExportToEnvironment(exp, suffix, valueName) {
    // console.log(`addExportToEnvironment(${exp.Name})`);
    let name = exp.Name.substring(PREFIX.length);
    let envName = name.substring(0, name.length - suffix.length)
    this.findEnvironment(envName).values[valueName] = exp.Value
  }

  _addExportToApplication(exp, suffix, valueName) {
    let name = exp.Name.substring(PREFIX.length);
    let str = name.substring(0, name.length - suffix.length)
    let pos = str.indexOf('-')
    if (pos > 0) {
      let envName = str.substring(0, pos)
      let appName = str.substring(pos + 1)
      this.findApplication(envName, appName).values[valueName] = exp.Value
    }
  }

  loadEnvironmentsFromStackOutputs(callback/*(err)*/) {

    console.log('loadEnvironmentsFromStackOutputs() 0');
    // checkAwsRegion(this.)

    let cloudformation = new AWS.CloudFormation({
      apiVersion: '2011-01-01',
      region: this.regionCode
    });
    // console.log('cf=', cloudformation);

    cloudformation.listExports({}, (err, data) => {
      if (err) return callback(err);

      data.Exports.forEach(e => {
        // console.log(`\nE: ${e.Name} ${e.Value}`);
        let name = e.Name
        if (!name.startsWith(PREFIX)) {
          console.log('-------- wrong prefix');
          return;// move on to the next export...
        }

        if (name.indexOf('j7-network') >= 0) {
          console.log('\n\nDUD=', e);
          console.log();
        }
        // name = name.substring(PREFIX.length)
        if (name.endsWith('-VPCID')) {
          this._addExportToEnvironment(e, '-VPCID', 'vpc')
        } else if (name.endsWith('-Cluster')) {
          this._addExportToEnvironment(e, '-Cluster', 'cluster')
        } else if (name.endsWith('-Contact')) {
          this._addExportToEnvironment(e, '-Contact', 'contact')
        } else if (name.endsWith('-ApplicationSecurityGroup')) {
          this._addExportToEnvironment(e, '-ApplicationSecurityGroup', 'ApplicationSecurityGroup')
        } else if (name.endsWith('-ConfigS3')) {
          this._addExportToEnvironment(e, '-ConfigS3', 'ConfigS3')
        } else if (name.endsWith('-CostCode')) {
          this._addExportToEnvironment(e, '-CostCode', 'CostCode')
        } else if (name.endsWith('-KeyName')) {
          this._addExportToEnvironment(e, '-KeyName', 'KeyName')
        } else if (name.endsWith('-LoadBalancerSecurityGroup')) {
          this._addExportToEnvironment(e, '-LoadBalancerSecurityGroup', 'LoadBalancerSecurityGroup')
        } else if (name.endsWith('-PrivateSubnet1')) {
          this._addExportToEnvironment(e, '-PrivateSubnet1', 'PrivateSubnet1')
        } else if (name.endsWith('-PrivateSubnet2')) {
          this._addExportToEnvironment(e, '-PrivateSubnet2', 'PrivateSubnet2')
        } else if (name.endsWith('-PublicSubnet1')) {
          this._addExportToEnvironment(e, '-PublicSubnet1', 'PublicSubnet1')
        } else if (name.endsWith('-PublicSubnet2')) {
          this._addExportToEnvironment(e, '-PublicSubnet2', 'PublicSubnet2')
        } else if (name.endsWith('-Jumpbox1')) {
          this._addExportToEnvironment(e, '-Jumpbox1', 'Jumpbox1')
        } else if (name.endsWith('-Jumpbox2')) {
          this._addExportToEnvironment(e, '-Jumpbox2', 'Jumpbox2')
        } else if (name.endsWith('-TemplateName')) {
          this._addExportToEnvironment(e, '-TemplateName', 'TemplateName')
          console.log(`\nTEMPLATE: ${e.Value}\n`);
        } else if (name.endsWith('-TemplateVersion')) {
          this._addExportToEnvironment(e, '-TemplateVersion', 'TemplateVersion')
        }

        // Now application settings
        else if (name.endsWith('-AssetsS3')) {
          this._addExportToApplication(e, '-AssetsS3', 'AssetsS3')
        } else if (name.endsWith('-HealthCheckPath')) {
          this._addExportToApplication(e, '-HealthCheckPath', 'HealthCheckPath')
        } else if (name.endsWith('-HealthCheckUrl')) {
          this._addExportToApplication(e, '-HealthCheckUrl', 'HealthCheckUrl')
        } else if (name.endsWith('-Pipeline')) {
          this._addExportToApplication(e, '-Pipeline', 'Pipeline')
        } else if (name.endsWith('-ServiceUrl')) {
          this._addExportToApplication(e, '-ServiceUrl', 'ServiceUrl')
        } else if (name.endsWith('-TargetGroup')) {
          this._addExportToApplication(e, '-TargetGroup', 'TargetGroup')
        } else if (name.endsWith('-AssetsS3')) {
          this._addExportToApplication(e, '-AssetsS3', 'AssetsS3')
        } else if (name.endsWith('-AssetsS3')) {
          this._addExportToApplication(e, '-AssetsS3', 'AssetsS3')
        } else if (name.endsWith('-AssetsS3')) {
          this._addExportToApplication(e, '-AssetsS3', 'AssetsS3')
        } else if (name.endsWith('-AssetsS3')) {
          this._addExportToApplication(e, '-AssetsS3', 'AssetsS3')
        } else {
          console.log('??? ' + name);
        }

      });// next export
      return callback(null);
    }); //-listExports
  }//- loadEnvironmentsFromStackOutputs
}//- StackInfo







exports.stacksForRegion = function(regionCode) {
  console.log(`stacksForRegion(${regionCode})`);


  let r = regions[regionCode]
  // if (r) {
  //   console.log(`Age: ${(Date.now() - r.loaded)}`);
  // }
  // if (r && (Date.now() - r.loaded) < REFRESH_TIME) {
  if (r) {
    console.log('Same region');
    return r;
  }

  // See if we have the region already loaded
  r = new StackInfo(regionCode);
  regions[regionCode] = r
  return r;
};

exports.environmentCompletion = function(stacks, regionCode, callback/*(err,envlist,otherstacks)*/) {
  console.log('environmentCompletion()');
  console.log(typeof(regionCode));
  console.log(typeof(callback));

  let envlist = [ ] // env[]
  let envIndex = [ ] // name -> env
  let otherStacks = [ ] // stack[]

  stacks.forEach(stack => {
    let name = stack.StackName;
    const PREFIX = 'nbt-'
    if (name.startsWith(PREFIX)) {
      let str = name.substring(PREFIX.length);
      let pos = str.indexOf('-');
      let envName = str
      let remainder = ''
      console.log(`s=${envName}, pos=${pos}`);
      if (pos > 0) {
        envName = str.substring(0, pos);
        remainder = str.substring(pos + 1);
      }
      console.log(`envName = ${envName}`);
      console.log(`remainder = ${remainder}`);

      // Check we have the environment in the list
      let env = envIndex[envName];
      if (!env) {
        env = {
          name: envName,
          steps: [this.NUM_ENVIRONMENT_STEPS],
          step1: false, // Have keypair
          keypairMessage: '',
          step2: false, // Have credentials
          step3: null, // network (vpc)
          step4: null, // jumpbox
          step5: null, // ecs
          appIndex: [ ], // name -> app
          applist: [ ], // app[]
          nextStep: this.NUM_ENVIRONMENT_STEPS,
        };
        envIndex[envName] = env
        envlist.push(env)

        // See if we have a keypair on this machine
        // if (haveKeypair()) {
        //
        // }
        // See if the keypair exists on this machine
        try {
          // Query the entry
          let home = require('os').homedir()
          let keyfile = `${home}/.ssh/nbt-${envName}-${regionCode}.pem`
          let shortPath = `~/.ssh/nbt-${envName}-${regionCode}.pem`
          console.log(`Keyfile is ${keyfile}`);
          let stats = fs.lstatSync(keyfile);
          let mode = stats.mode & parseInt('0777', 8) // Only the user, group and other bits
          if (!stats.isFile()) {
            env.keypairMessage = `Invalid keypair file: ${keyfile}`
          } else if (mode === parseInt('0600', 8)) {
            env.keypairMessage = `${shortPath}`
          } else {
            env.keypairMessage = `Incorrect key file mode. Please run 'chmod 600 ${shortPath}'.`
          }
        }
        catch (e) {
          if (e.code === 'ENOENT') {
            env.keypairMessage = 'Keypair exists, but is not installed on this machine'
          } else {
            console.log('e=', e);
            env.keypairMessage = 'Server error, see log'
          }
        }
      }

      const ENV_NETWORK_SUFFIX = '1-network'
      const ENV_JUMPBOXES_SUFFIX = '2-jumpboxes'
      const ENV_ECS_SUFFIX = '3-ecs'
      const APP_LOAD_BALANCER_SUFFIX = '-loadbalancer'
      // const APP_PIPELINE_SUFFIX = '-loadbalancer'

      // Set flags in the environment
      if (remainder === ENV_NETWORK_SUFFIX) {
        env.steps[this.ENV_STEP_NETWORK] = stack;
        env.step3 = stack;
      } else if (remainder === ENV_JUMPBOXES_SUFFIX) {
        env.steps[this.ENV_STEP_JUMPBOX] = stack;
        env.step4 = stack;
      } else if (remainder === ENV_ECS_SUFFIX) {
        env.steps[this.ENV_STEP_ECS] = stack;
        env.step5 = stack;
      } else if (remainder.endsWith(APP_LOAD_BALANCER_SUFFIX)) {
        let appName = remainder.substring(0, remainder.length - APP_LOAD_BALANCER_SUFFIX.length)
        console.log(`appname is '${appName}'`);
        let app = env.appIndex[appName]
        if (!app) {
          app = {
            name: appName,
            steps: [],
            nextStep: this.NUM_APP_STEPS,
            step_loadBalancer: null,
            step_pipeline: null,
          }
          env.appIndex[appName] = app
          env.applist.push(app)
        }
        app.step_loadBalancer = stack;
      } else {
        console.log(`

          HUH ${remainder}

          `);
      }

    } else {
      otherStacks.push(stack);
    }
    // console.log(`Stack is ${stack.StackName}, ${stack.StackStatus}`);
  }); // next stack

  return callback(null, envlist, otherStacks)
}
