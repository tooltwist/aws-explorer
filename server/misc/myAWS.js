const AWS = require('aws-sdk')
const awsRegions = require('aws-regions')
const pad = require('./util').pad

const INITIAL_REGION = 'ap-northeast-1'
let regions = [ ]
let currentRegion = INITIAL_REGION
// let currentRegion = null
let awsRegion = null // Region we are currently looking at

let cloudformation = null
let ec2 = null
let elbv2 = null
let autoscaling = null
let ecs = null
let rds = null

function downloadRegions (callback) {
  console.log('  downloadRegions()')
  ec2.describeRegions({}, (err, data) => {
    if (err) return callback(err)

    regions = data.Regions // Global variable
    // console.log('regions=', regions);
    regions = regions.sort((r1, r2) => {
      if (r1.RegionName < r2.RegionName) {
        return -1
      } else if (r1.RegionName > r2.RegionName) {
        return +1
      }
      return 0
    })
    return callback(null)
  })
}

// Return the name of an AWS regions
// e.g. us-east-1 -> (n-virginia)
function regionDescription (regionCode) {
  // console.log('regionDescription(' + regionCode + ')')
  let region = awsRegions.lookup({ code: regionCode })
  if (region) {
    // return '(' + region.name + ')'
    return region.name
  }
  return ''
}

function showRegions () {
  for (let name in awsRegions.regions) {
    let r = awsRegions.regions[name]
    if (r.public) {
      console.log(`${pad(name, 15)}  ${r.code}`)
    }
  }
}

function checkAwsRegion (region) {
  // console.log(`checkAwsRegion(${region})`)

  if (!region) {
    // Default region
    region = INITIAL_REGION
  }

  // Perhaps we are asking for a region list
  // console.log('regions = ', awsRegions);
  if (region === '?' || region === 'list' || region === 'unknown') {
    showRegions()
    process.exit(0)
  }

  // See if a place name is used
  for (let name in awsRegions.regions) {
    if (region.toLowerCase() === name.substring(0, region.length)) {
      region = awsRegions.regions[name].code
      break
    }
  }

  // Check the code.
  let r = awsRegions.lookup({ code: region })
  if (!r) {
    console.log('ERROR: Unknown region ' + region)
    process.exit(1)
  }

  if (awsRegion !== region) {
    // console.log('switching to region ' + region);
    // Access the different region
    awsRegion = currentRegion = region
    cloudformation = new AWS.CloudFormation({
      apiVersion: '2011-01-01',
      region: currentRegion
    })
    ec2 = new AWS.EC2({
      apiVersion: '2016-11-15',
      region: currentRegion
    })
    elbv2 = new AWS.ELBv2({
      apiVersion: '2015-12-01',
      region: currentRegion
    })
    autoscaling = new AWS.AutoScaling({
      apiVersion: '2011-01-01',
      region: currentRegion
    })
    ecs = new AWS.ECS({
      apiVersion: '2014-11-13',
      region: currentRegion
    })
    rds = new AWS.RDS({
      apiVersion: '2014-10-31',
      region: currentRegion
    })
  }

  return currentRegion
}

module.exports.cloudformation = function () {
  return cloudformation
}

module.exports.ec2 = function () {
  return ec2
}

module.exports.ecs = function () {
  return ecs
}

module.exports.rds = function () {
  return rds
}

module.exports.elbv2 = function () {
  return elbv2
}

module.exports.autoscaling = function () {
  return autoscaling
}

module.exports.region = function () {
  return currentRegion
}

module.exports.regions = function () {
  return regions
}
module.exports.checkAwsRegion = checkAwsRegion
module.exports.regionDescription = regionDescription
module.exports.downloadRegions = downloadRegions

module.exports.INITIAL_REGION = INITIAL_REGION
