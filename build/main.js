require('source-map-support/register')
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var myAWS = __webpack_require__(2);
var types = __webpack_require__(3);

var nodeIndex = []; // key -> AWSNode


var AWSNode = function () {
  function AWSNode(type, id) {
    _classCallCheck(this, AWSNode);

    // console.log('AWSNode.constructor()');
    this.type = type;
    this.id = id;
    this.key = keyForNode(type, id);
    this.data = null;
    this.children = [];
    this.parents = [];
    this.describeFn = null;
  }

  _createClass(AWSNode, [{
    key: 'setData',
    value: function setData(data) {
      this.data = data;
    }
  }, {
    key: 'setDescribe',
    value: function setDescribe(fn) {
      // this.describeFn = fn
    }
  }, {
    key: 'addChild',
    value: function addChild(childNode) {
      if (childNode != null) {
        // console.log('WOOP ' + this.key + ' => ' + childNode.key)
        this.children.push(childNode.key);
        childNode.parents.push(this.key);
      }
    }
  }, {
    key: 'findTag',
    value: function findTag(tagname) {
      // Assumes this.data.Tags
      if (this.data && this.data.Tags) {
        for (var i = 0; i < this.data.Tags.length; i++) {
          var tag = this.data.Tags[i];
          if (tag.Key === tagname) {
            return tag.Value;
          }
        }
      }
      return null;
    }
  }, {
    key: 'awsLink',
    value: function awsLink() {
      var ec2Home = 'https://' + myAWS.region() + '.console.aws.amazon.com/ec2/v2/home?region=' + myAWS.region();
      var vpcHome = 'https://' + myAWS.region() + '.console.aws.amazon.com/vpc/home?region=' + myAWS.region();
      switch (this.type) {
        case types.SUBNET:
          return vpcHome + '#subnets:filter=' + this.id;
        case types.SECGRP:
          return ec2Home + '#SecurityGroups:groupId=' + this.id;
        case types.VPC:
          return vpcHome + '#vpcs:filter=' + this.id;
        case types.NAT:
          return vpcHome + '#NatGateways:search=' + this.id + ';sort=natGatewayId';
        case types.IGW:
          return vpcHome + '#igws:filter=' + this.id;
        case types.INSTANCE:
          return ec2Home + '#Instances:search=' + this.id;
        // case types.IMAGE = 'AMI Image'
        // case types.AZ = 'Availability Zone'
        case types.ADDR:
          return ec2Home + '#Addresses:search=' + this.id;
        // case types.COSTCD = 'Cost Code'
        // case types.LOGICAL = 'Logical Grouping'
        // case types.PUBLICIP = 'Public IP Address'
        case types.KEYPAIR:
          return ec2Home + '#KeyPairs:search=' + this.id;
        case types.NETIFACE:
          return ec2Home + '#NIC:networkInterfaceId=' + this.id;
        case types.ROUTETABLE:
          return vpcHome + '#routetables:filter=' + this.id;
        case types.ALB:
          return ec2Home + '#LoadBalancers:search=' + this.id;
        case types.TARGETGRP:
          return ec2Home + '#TargetGroups:search=' + this.id;
        default:
          return null;
      }
    }
  }, {
    key: 'dump',
    value: function dump() {
      if (this.describeFn) {
        var desc = this.describeFn(this);
        if (desc) {
          console.log(desc);
        }
      } else {
        console.log('Id: ' + this.id);
      }
      // console.log(' - children:', this.children)
      this.children.forEach(function (child) {
        // console.log('  ->', child)
        console.log('  - ' + child.id);
      });
    }
  }, {
    key: 'findEnvironment',
    value: function findEnvironment() {
      var environment = null;
      if (this.data && this.data.Tags) {
        this.data.Tags.forEach(function (tag) {
          if (tag.Key.toLowerCase() === 'environment') {
            environment = tag.Value;
            // console.log(`environment is [${environment}]`);
          }
        });
      }
      return environment;
    }
  }, {
    key: 'label',
    value: function label() {
      var label = null;
      if (this.data) {
        if (this.data.Tags) {
          this.data.Tags.forEach(function (tag) {
            if (tag.Key.toLowerCase() === 'name') {
              label = tag.Value;
            }
          });
        }
        if (!label && this.data['Key']) {
          label = this.data['Key'];
        }
      }
      if (!label) {
        label = this.id;
      }
      return label;
    } //- label()

  }]);

  return AWSNode;
}(); //- class AWSNode

function reset() {
  nodeIndex = [];
}

function keyForNode(type, id) {
  return type + '::' + id;
}

function nodeWithKey(key) {
  var node = nodeIndex[key];
  return node;
}

function findNode(type, id, data, describeFn) {
  // if (type === types.INSTANCE) {
  //   console.log(`****** INSTANCE ${id}, data=`, data);
  // }

  var key = keyForNode(type, id);
  var node = nodeIndex[key];
  if (!node) {
    node = new AWSNode(type, id);
    nodeIndex[key] = node;
  }
  if (data) {
    node.setData(data);
  }
  if (describeFn) {
    console.log('\n\nWARNING: findNode(' + type + ') called with describeFn');
    node.setDescribe(describeFn);
  }
  return node;
}

function dumpAll() {
  console.log('dumpAll');
  // console.log('nodeIndex=', nodeIndex);
  for (var key in nodeIndex) {
    console.log('');
    // console.log('key: ' + key);
    var node = nodeIndex[key];
    node.dump();
  }
}

function getIndex() {
  return nodeIndex;
}

function getKeys() {
  var keys = [];
  for (var key in nodeIndex) {
    keys.push(key);
  }
  return keys;
}

function getNodes() {
  var nodes = [];
  for (var key in nodeIndex) {
    var node = nodeIndex[key];
    nodes.push(node);
  }
  return nodes;
}

function nodesByType(type) {
  // console.log('nodesByType(' + type + ')');
  var arr = getNodes().filter(function (node) {
    return node.type === type;
  });
  return sortAlphabetic(arr);
}

function sortAlphabetic(arr) {
  var sorted = arr.sort(function (a, b) {

    // Sort by environment first
    var env1 = a.findEnvironment();
    if (!env1) env1 = 'zzzzzzzzzz';
    var env2 = b.findEnvironment();
    if (!env2) env2 = 'zzzzzzzzzz';
    if (env1 < env2) {
      return -1;
    } else if (env1 > env2) {
      return 1;
    }

    // Sort by name
    if (a.id < b.id) {
      return -1;
    } else if (a.id > b.id) {
      return 1;
    }
    return 0;
  });
  return sorted;
}

// function downloadRegion(region, withHealthchecks, callback) {
//   console.log(`graph.downloadRegion(${region}, ${withHealthchecks})`);
//   download.downloadEverything(region, withHealthchecks, callback);
// }

/*
 *  Return a list of environments
 */
function environments() {
  // Get unique environments
  var map = [];
  getNodes().forEach(function (node) {
    var environment = node.findEnvironment();
    if (environment) {
      map[environment] = environment;
    }
  });
  // Create a list
  var list = [];
  for (var key in map) {
    list.push(key);
  }
  // Sort the list
  list.sort(function (a, b) {
    if (a < b) {
      return -1;
    } else if (a > b) {
      return +1;
    } else {
      return 0;
    }
  });
  return list;
}

// Constants
// module.exports.SUBNET = SUBNET;
// module.exports.SECGRP = types.SECGRP;
// module.exports.VPC = types.VPC;
// module.exports.NAT = types.NAT;
// module.exports.IGW = types.IGW;
// module.exports.INSTANCE = types.INSTANCE;
// module.exports.JUMPBOX = types.JUMPBOX;
// module.exports.IMAGE = types.IMAGE;
// module.exports.AZ = types.AZ;
// module.exports.ADDR = types.ADDR;
// module.exports.COSTCD = types.COSTCD;
// module.exports.LOGICAL = types.LOGICAL;
// module.exports.PUBLICIP = types.PUBLICIP;
// module.exports.KEYPAIR = types.KEYPAIR;
// module.exports.NETIFACE = types.NETIFACE;
// module.exports.ROUTETABLE = types.ROUTETABLE;
// module.exports.ALB = types.ALB;
// module.exports.TARGETGRP = types.TARGETGRP;
// module.exports.LISTENER = types.LISTENER;
// module.exports.RULE = types.RULE;
// module.exports.CLUSTER = types.CLUSTER;
// module.exports.SERVICE = types.SERVICE;
// module.exports.TASK = types.TASK;

// Functions
// module.exports.downloadRegion = downloadRegion;
module.exports.findNode = findNode;
module.exports.nodeWithKey = nodeWithKey;
module.exports.dumpAll = dumpAll;
module.exports.keyForNode = keyForNode;
module.exports.reset = reset;
module.exports.index = getIndex;
module.exports.keys = getKeys;
module.exports.nodes = getNodes;
module.exports.nodesByType = nodesByType;
module.exports.environments = environments;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var AWS = __webpack_require__(9);
var awsRegions = __webpack_require__(10);
var pad = __webpack_require__(11).pad;

var INITIAL_REGION = 'ap-northeast-1';
var regions = [];
var currentRegion = INITIAL_REGION;
// var currentRegion = null
var awsRegion = null; // Region we are currently looking at

var cloudformation = null;
var ec2 = null;
var elbv2 = null;
var autoscaling = null;
var ecs = null;
var rds = null;

function downloadRegions(callback) {
  console.log('  downloadRegions()');
  ec2.describeRegions({}, function (err, data) {
    if (err) return callback(err);

    regions = data.Regions; // Global variable
    // console.log('regions=', regions);
    regions = regions.sort(function (r1, r2) {
      if (r1.RegionName < r2.RegionName) {
        return -1;
      } else if (r1.RegionName > r2.RegionName) {
        return +1;
      }
      return 0;
    });
    return callback(null);
  });
}

// Return the name of an AWS regions
// e.g. us-east-1 -> (n-virginia)
function regionDescription(regionCode) {
  console.log('regionDescription(' + regionCode + ')');
  var region = awsRegions.get(regionCode);
  if (region) {
    // return '(' + region.name + ')'
    return region.name;
  }
  return '';
}

function showRegions() {
  for (var name in awsRegions.regions) {
    var r = awsRegions.regions[name];
    if (r.public) {
      console.log(pad(name, 15) + '  ' + r.code);
    }
  }
}

function checkAwsRegion(region) {
  // console.log(`checkAwsRegion(${region})`)

  if (!region) {
    // Default region
    region = INITIAL_REGION;
  }

  // Perhaps we are asking for a region list
  // console.log('regions = ', awsRegions);
  if (region === '?' || region === 'list' || region === 'unknown') {
    showRegions();
    process.exit(0);
  }

  // See if a place name is used
  for (var name in awsRegions.regions) {
    if (region.toLowerCase() === name.substring(0, region.length)) {
      region = awsRegions.regions[name].code;
      break;
    }
  }

  // Check the code.
  var r = awsRegions.get(region);
  if (!r) {
    console.log('ERROR: Unknown region ' + region);
    process.exit(1);
  }

  if (awsRegion !== region) {
    // console.log('switching to region ' + region);
    // Access the different region
    awsRegion = currentRegion = region;
    cloudformation = new AWS.CloudFormation({
      apiVersion: '2011-01-01',
      region: currentRegion
    });
    ec2 = new AWS.EC2({
      apiVersion: '2016-11-15',
      region: currentRegion
    });
    elbv2 = new AWS.ELBv2({
      apiVersion: '2015-12-01',
      region: currentRegion
    });
    autoscaling = new AWS.AutoScaling({
      apiVersion: '2011-01-01',
      region: currentRegion
    });
    ecs = new AWS.ECS({
      apiVersion: '2014-11-13',
      region: currentRegion
    });
    rds = new AWS.RDS({
      apiVersion: '2014-10-31',
      region: currentRegion
    });
  }

  return currentRegion;
}

module.exports.cloudformation = function () {
  return cloudformation;
};

module.exports.ec2 = function () {
  return ec2;
};

module.exports.ecs = function () {
  return ecs;
};

module.exports.rds = function () {
  return rds;
};

module.exports.elbv2 = function () {
  return elbv2;
};

module.exports.autoscaling = function () {
  return autoscaling;
};

module.exports.region = function () {
  return currentRegion;
};

module.exports.regions = function () {
  return regions;
};
module.exports.checkAwsRegion = checkAwsRegion;
module.exports.regionDescription = regionDescription;
module.exports.downloadRegions = downloadRegions;

module.exports.INITIAL_REGION = INITIAL_REGION;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

// AWS Node types
module.exports.SUBNET = 'Subnet';
module.exports.SECGRP = 'Security Group';
module.exports.VPC = 'Virtual Private Cloud';
module.exports.NAT = 'NAT Gateway';
module.exports.IGW = 'Internet Gateway';
module.exports.INSTANCE = 'EC2 Instance'; // may have node.data._isJumpbox set
module.exports.IMAGE = 'AMI Image';
module.exports.AZ = 'Availability Zone';
module.exports.ADDR = 'Elastic IP';
module.exports.COSTCD = 'Cost Code';
module.exports.LOGICAL = 'Logical Grouping';
module.exports.PUBLICIP = 'Public IP Address';
module.exports.KEYPAIR = 'Key Pair';
module.exports.NETIFACE = 'Network Interface';
module.exports.ROUTETABLE = 'Route Table';
module.exports.ALB = 'Load Balancer';
module.exports.TARGETGRP = 'Target Group';
module.exports.LISTENER = 'Listener';
module.exports.RULE = 'Rule';
module.exports.CLUSTER = 'Cluster';
module.exports.SERVICE = 'Service';
module.exports.TASK = 'Task';
module.exports.DATABASE = 'Database';
module.exports.CACHE = 'Cache';

module.exports.id = function (node) {
  if (!node.data) {
    return '-';
  }
  switch (node.type) {
    case this.SUBNET:
      return node.data.SubnetId;

    case this.SECGRP:
      return node.data.GroupId;

    case this.VPC:
      return node.data.VpcId;

    case this.NAT:
      return node.data ? node.data.NatGatewayId : '?';

    case this.IGW:
      return node.data.InternetGatewayId;

    case this.INSTANCE:
      return node.data.InstanceId;

    case this.IMAGE:
      return node.id;

    case this.AZ:
      return node.id;

    case this.ADDR:
      return node.data.AllocationId;

    case this.COSTCD:
      return node.key;

    case this.LOGICAL:
      return node.key;

    case this.PUBLICIP:
      return node.id;

    case this.KEYPAIR:
      return node.key;

    case this.NETIFACE:
      return node.id;

    case this.ROUTETABLE:
      return node.key + '\n--' + node.hasPublicRoutes;

    case this.ALB:
      return node.id;

    case this.TARGETGRP:
      return node.data.TargetGroupName;

    case this.LISTENER:
      return node.key;

    case this.RULE:
      return node.key;

    case this.CLUSTER:
      return node.data.clusterName;

    case this.SERVICE:
      return node.data.serviceName;

    case this.TASK:
      return node.id;

    case this.DATABASE:
      return node.key;

    case this.CACHE:
      return node.key;

    default:
      return node.key;
  }
};

module.exports.label = function (node) {
  // let label
  var name = void 0;
  switch (node.type) {
    case this.SUBNET:
      name = findTag(node, 'Name');
      return name || node.data.SubnetId;

    case this.SECGRP:
      // if (node.data.GroupName === 'default') {
      //   // Default for the VPC
      //   return node.data.Description
      // }
      name = findTag(node, 'Name');
      return name || node.data.GroupName;

    case this.VPC:
      name = findTag(node, 'Name');
      return name || node.key;

    case this.NAT:
      name = findTag(node, 'Name');
      if (name) {
        return name;
      }
      if (node.data) {
        return node.data.NatGatewayId;
      }
      return '?';

    case this.IGW:
      return node.key;

    case this.INSTANCE:
      name = findTag(node, 'Name');
      return name || node.key;

    case this.IMAGE:
      return node.key;

    case this.AZ:
      return node.id;

    case this.ADDR:
      return 'public: ' + node.data.PublicIp;

    case this.COSTCD:
      return node.key;

    case this.LOGICAL:
      return node.key;

    case this.PUBLICIP:
      return node.id;

    case this.KEYPAIR:
      return node.key;

    case this.NETIFACE:
      return 'Private IP: ' + node.data.PrivateIpAddress;

    case this.ROUTETABLE:
      return node.key + '\n--' + node.hasPublicRoutes;

    case this.ALB:
      return node.data.LoadBalancerName;

    case this.TARGETGRP:
      return node.data.TargetGroupName;

    case this.LISTENER:
      return node.key;

    case this.RULE:
      return node.key;

    case this.CLUSTER:
      return node.data.clusterName;

    case this.SERVICE:
      return node.data.serviceName;

    case this.TASK:
      if (node.data.containers && node.data.containers.length > 0) {
        return node.data.containers[0].name;
      }
      return ' ';

    case this.DATABASE:
      return node.key;

    case this.CACHE:
      return node.key;

    default:
      return node.key;
  }
};

module.exports.description = function (node) {
  switch (node.type) {
    case this.SUBNET:
      return node.data.CidrBlock;

    case this.SECGRP:
      return node.data.Description;

    case this.VPC:
      return node.data.State;

    case this.NAT:
      if (node.data) {
        return 'Public IP: ' + node.data.NatGatewayAddresses[0].PublicIp;
      }
      console.log('Strange, NAT node does not have data:', node);
      return '?';

    case this.IGW:
      return node.key;

    case this.INSTANCE:
      return '';

    case this.IMAGE:
      return node.key;

    case this.AZ:
      return ' ';

    case this.ADDR:
      return 'private: ' + node.data.PrivateIpAddress;

    case this.COSTCD:
      return node.key;

    case this.LOGICAL:
      return node.key;

    case this.PUBLICIP:
      return '';

    case this.KEYPAIR:
      return node.key;

    case this.NETIFACE:
      return ' ';

    case this.ROUTETABLE:
      return node.key;

    case this.ALB:
      return node.data.DNSName;

    case this.TARGETGRP:
      return ' ';

    case this.LISTENER:
      return node.key;

    case this.RULE:
      return node.key;

    case this.CLUSTER:
      return node.data.status.toLowerCase() + ', ' + node.data.registeredContainerInstancesCount + ' instances, ' + node.data.runningTasksCount + ' tasks';

    case this.SERVICE:
      return node.data.status.toLowerCase() + ', ' + node.data.runningCount + ' running';

    case this.TASK:
      return 'version ' + node.data.version + ', ' + node.data.lastStatus.toLowerCase();

    case this.DATABASE:
      return node.key;

    case this.CACHE:
      return node.key;

    default:
      return 'DESCRIPTION FOR ' + node.key;
  }
};

module.exports.describe = function (node) {
  switch (node.type) {
    case this.SUBNET:
      return describeSubnet(node);

    case this.SECGRP:
      return describeSecurityGroup(node);

    case this.VPC:
      return describeVpc(node);

    case this.NAT:
      return node.key;

    case this.IGW:
      return node.key;

    case this.INSTANCE:
      return describeInstance(node);

    case this.IMAGE:
      return node.key;

    case this.AZ:
      return node.key;

    case this.ADDR:
      return node.key;

    case this.COSTCD:
      return node.key;

    case this.LOGICAL:
      return node.key;

    case this.PUBLICIP:
      return '<b>Public IP Address</b><br/>' + node.id;

    case this.KEYPAIR:
      return node.key;

    case this.NETIFACE:
      return node.key;

    case this.ROUTETABLE:
      return node.key;

    case this.ALB:
      return node.key;

    case this.TARGETGRP:
      return '\n        <b>Target Group</b><br/>\n        Name: ' + node.data.TargetGroupName + '<br>\n        Healthcheck: ' + node.data.HealthCheckPath + '<br>\n        Expected reply: ' + node.data.Matcher.HttpCode + '<br>';

    case this.LISTENER:
      return node.key;

    case this.RULE:
      return node.key;

    case this.CLUSTER:
      return node.key;

    case this.SERVICE:
      return '\n        <b>Service</b><br/>\n        Name: ' + node.data.serviceName + '<br>\n        Status: ' + node.data.status + '<br>\n        Tasks: ' + node.data.runningCount + '<br>';

    case this.TASK:
      return describeTask(node);

    case this.DATABASE:
      return node.key;

    case this.CACHE:
      return node.key;

    default:
      return node.key;
  }
};

function describeInstance(node) {
  var desc = '<b>EC2 Instance</b><br/>';
  var name = findTag(node, 'Name');
  if (name) {
    desc += '  Name: ' + name + '<br>';
  }
  var description = findTag(node, 'Description');
  if (description) {
    desc += '  Description: ' + description + '<br>';
  }
  desc += 'Type: ' + node.data.InstanceType + '<br>';
  desc += 'Keyname: ' + node.data.KeyName + '<br>';
  desc += 'State: ' + node.data.State.Name + '<br>';
  if (node.data.PublicIpAddress) {
    desc += '  IP addr: ' + node.data.PublicIpAddress + '<br>';
  }
  return desc;
}

function describeVpc(node) {
  var s = '<b>Virtual Private Cloud (VPC)</b><br/>';
  var name = findTag(node, 'Name');
  if (name) {
    s += '  Name: ' + name + '<br>';
  }
  s += '  Id: ' + node.data.VpcId + '<br>';
  s += 'State: ' + node.data.State + '<br>';
  var contact = findTag(node, 'Contact');
  if (contact) {
    s += '  Contact: ' + contact + '<br>';
  }
  return s;
}

function describeSubnet(node) {
  var _this = this;

  // Return a description
  var desc = 'Id: ' + node.data.SubnetId + '<br/>';

  // // See if the subnet's routing table connects to an Internet Gateway
  // let isPublicSubnet = false
  // node.parents.forEach(parent => {
  //   if (parent.type === module.exports.ROUTETABLE && parent.hasPublicRoutes) {
  //     isPublicSubnet = true
  //   }
  // })
  // if (isPublicSubnet) {
  //   desc += 'PUBLIC SUBNET<br/>'
  // } else {
  //   desc += 'PRIVATE SUBNET<br/>'
  // }

  var name = findTag(node, 'Name');
  if (name) {
    desc += 'Name ' + name + '<br/>';
  }

  var description = findTag(node, 'Description');
  if (description) {
    desc += 'Description: ' + description + '<br/>';
  }

  // Route table?
  var useVpcRouteTable = true;
  node.parents.forEach(function (parent) {
    if (parent.type === _this.ROUTETABLE) {
      useVpcRouteTable = false;
    }
  });
  if (useVpcRouteTable) {
    desc += 'Use default route table for VPC<br/>';
  }
  // IP Address range
  desc += 'CidrBlock: ' + node.data.CidrBlock + '<br/>';
  return desc;
}

function describeSecurityGroup(node) {
  // Return a description
  var desc = 'Security Group<br/>';
  desc += 'Id: ' + node.data.GroupId + '<br/>';
  var name = findTag(node, 'Name');
  if (name) {
    desc += 'Name Tag: ' + name + '<br/>';
  }
  desc += 'Description: ' + node.data.Description + '<br/>';
  desc += 'GroupName: ' + node.data.GroupName + '<br/>';

  // Route table?
  // let useVpcRouteTable = true
  // node.parents.forEach(parent => {
  //   if (parent.type === this.ROUTETABLE) {
  //     useVpcRouteTable = false
  //   }
  // })
  // if (useVpcRouteTable) {
  //   desc += 'Use default route table for VPC<br/>'
  // }
  // // IP Address range
  // desc += `CidrBlock: ${node.data.CidrBlock}<br/>`
  return desc;
}

function describeTask(node) {
  var desc = '<b>Task</b><br/>';
  node.data.containers.forEach(function (c) {
    desc += '\n      Name: ' + c.name + '<br>\n      Ports: ' + c.networkBindings.hostPort + ' -&gt; ' + c.networkBindings.port + '<br>';
  });
  desc += '\n    Version: ' + node.data.version + '<br>\n    Status: ' + node.data.lastStatus + '<br>\n    Desired Status: ' + node.data.desiredStatus + '<br>\n    Memory: ' + node.data.memory + '<br>\n    CPU: ' + node.data.cpu + '<br>\n  ';
  return desc;
}

function findTag(node, tagname) {
  // Assumes node.data.Tags
  if (node.data && node.data.Tags) {
    for (var i = 0; i < node.data.Tags.length; i++) {
      var tag = node.data.Tags[i];
      if (tag.Key === tagname) {
        return tag.Value;
      }
    }
  }
  return '';
}
module.exports.findTag = findTag;

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_express__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_express___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_express__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_nuxt__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_nuxt___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_nuxt__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__api__ = __webpack_require__(6);





var app = __WEBPACK_IMPORTED_MODULE_0_express___default()();
var host = process.env.HOST || '127.0.0.1';
var port = process.env.PORT || 3001;

app.set('port', port);

// Import API Routes
app.use('/api', __WEBPACK_IMPORTED_MODULE_2__api__["a" /* default */]);

// Import and Set Nuxt.js options
var config = __webpack_require__(14);
config.dev = !("development" === 'production');

// Init Nuxt.js
var nuxt = new __WEBPACK_IMPORTED_MODULE_1_nuxt__["Nuxt"](config);

// Build only in dev mode
if (config.dev) {
  var builder = new __WEBPACK_IMPORTED_MODULE_1_nuxt__["Builder"](nuxt);
  builder.build();
}

// Give nuxt middleware to express
app.use(nuxt.render);

// Listen the server
app.listen(port, host);
console.log('Server listening on ' + host + ':' + port); // eslint-disable-line no-console

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("nuxt");

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_express__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_express___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_express__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__users__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__graphApi__ = __webpack_require__(8);





var router = Object(__WEBPACK_IMPORTED_MODULE_0_express__["Router"])();

// Add USERS Routes
router.use(__WEBPACK_IMPORTED_MODULE_1__users__["a" /* default */]);
router.use(__WEBPACK_IMPORTED_MODULE_2__graphApi__["a" /* default */]);

/* harmony default export */ __webpack_exports__["a"] = (router);

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_express__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_express___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_express__);


var router = Object(__WEBPACK_IMPORTED_MODULE_0_express__["Router"])();

// Mock Users
var users = [{ name: 'Alexandre', stuff: 'Chicken shit' }, { name: 'Pooya', stuff: 'Likes frisbee' }, { name: 'Sébastien', stuff: 'Sleeps a lot' }, { name: 'Phil', stuff: 'Likes VueJS' }];

/* GET users listing. */
router.get('/users', function (req, res, next) {
  console.log('API /users');
  res.json(users);
});

/* GET user by ID. */
router.get('/users/:id', function (req, res, next) {
  var id = parseInt(req.params.id);
  if (id >= 0 && id < users.length) {
    res.json(users[id]);
  } else {
    res.sendStatus(404);
  }
});

/* harmony default export */ __webpack_exports__["a"] = (router);

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_express__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_express___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_express__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__misc_graph__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__misc_graph___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__misc_graph__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_lru_cache__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_lru_cache___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_lru_cache__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__misc_download__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__misc_download___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__misc_download__);


// import types from '../misc/types'



// , options = { max: 500
//             , length: function (n, key) { return n * 2 + key.length }
//             , dispose: function (key, n) { n.close() }
//             , maxAge: 1000 * 60 * 60 }
// , cache = LRU(options)
var cache = __WEBPACK_IMPORTED_MODULE_2_lru_cache___default()(10); // sets just the max size to 10 items (actually size, but default size is 1)

var router = Object(__WEBPACK_IMPORTED_MODULE_0_express__["Router"])();

/* GET user by ID. */
router.get('/graph/:region', function (req, res, next) {
  console.log('API /graph/:region', req.params);
  var region = req.params.region;
  console.log('API: Region is ' + region);

  // See if we can use the value in the cache.
  var cacheKey = region;
  var value = cache.get(cacheKey); // "value"
  if (req.query.reload) {
    console.log('Reloading cache');
    value = null;
  }
  if (value) {
    res.json(value);
    return;
  }

  // Download all we need from AWS
  __WEBPACK_IMPORTED_MODULE_3__misc_download___default.a.downloadEverything(region, false, function (err) {
    if (err) {
      console.log('Error downloading region ' + region, err, err.stack);
      res.sendStatus(500);
      return;
    }
    var index = __WEBPACK_IMPORTED_MODULE_1__misc_graph___default.a.index();
    // console.log('Have index:', index)
    var obj = {};
    for (var key in index) {
      obj[key] = index[key];
    }

    console.log('Setting value in the cache');
    cache.set(cacheKey, obj);

    res.json(obj);
  });
});

/* harmony default export */ __webpack_exports__["a"] = (router);

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("aws-sdk");

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("aws-regions");

/***/ }),
/* 11 */
/***/ (function(module, exports) {


function pad(str, len) {
  if (str == null) {
    str = '';
  }
  while (str.length < len) {
    str = str + ' ';
  }
  return str.substring(0, len);
}

function capitalize(str) {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
}

module.exports.pad = pad;
module.exports.capitalize = capitalize;

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("lru-cache");

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var myAWS = __webpack_require__(2);
var graph = __webpack_require__(1);
var types = __webpack_require__(3);

var loadBalancersAreLoaded = false;
var targetGroupsAreLoaded = false;
var instancesAreLoaded = false;

var debug = true;

function findTargetGroupByARN(arn) {
  // console.log('findTargetGroupByARN(' + arn + ')');
  var all = graph.nodes();
  for (var i = 0; i < all.length; i++) {
    var node = all[i];
    // if (node.type === types.TARGETGRP) {
    //   console.log('  tg: ', node.data.TargetGroupArn);
    // }
    if (node.type === types.TARGETGRP && node.data.TargetGroupArn === arn) {
      // console.log('FOUND THE TARGET GROUP!');
      return node;
    }
  }
  return null;
}

function findInstanceById(id) {
  // console.log(`findInstanceById(${id})`);
  var all = graph.nodes();
  for (var i = 0; i < all.length; i++) {
    var node = all[i];
    // if (node.type === types.INSTANCE) {
    //   console.log('  instance: ', node.data.InstanceId);
    // }
    if ((node.type === types.INSTANCE || node.type === types.JUMPBOX) && node.data.InstanceId === id) {
      // console.log('FOUND THE INSTANCE!');
      return node;
    }
  }
  return null;
}

function downloadVpcs(callback) {
  if (debug) console.log('  downloadVpcs()');
  myAWS.ec2().describeVpcs({}, function (err, data) {
    if (err) return callback(err);

    // console.log('data=', data);
    data.Vpcs.forEach(function (rec) {
      // console.log('rec=', rec);
      graph.findNode(types.VPC, rec.VpcId, rec);
    });
    return callback(null);
  });
}

function downloadInstances(callback) {
  if (debug) console.log('  downloadInstances()');

  myAWS.ec2().describeInstances({}, function (err, data) {
    if (err) return callback(err);

    // console.log('data=', data);
    data.Reservations.forEach(function (res) {
      res.Instances.forEach(function (instance) {

        // See if it is a jumpbox
        // console.log('instance=', instance);
        instance.Tags.forEach(function (tag) {
          if (tag.Key === 'Name' && tag.Value.indexOf('-jumpbox-') >= 0) {
            instance._isJumpbox = true;
          }
        });

        // Create the node
        var i = graph.findNode(types.INSTANCE, instance.InstanceId, instance);

        // ImageId
        var img = graph.findNode(types.IMAGE, instance.ImageId, null);
        i.addChild(img);

        // Availability zone
        if (instance.Placement && instance.Placement.AvailabilityZone) {
          var az = graph.findNode(types.AZ, instance.Placement.AvailabilityZone, null, function (node) {
            // Return a description
            var desc = 'Availability Zone (' + node.id + ')\n';
            return desc;
          });
          az.addChild(i);
        }

        // Remember if it has a public IP
        if (instance.PublicIpAddress) {
          var ip = graph.findNode(types.PUBLICIP, instance.PublicIpAddress);
          ip.addChild(i);
        }

        // Subnet
        //ZZZ Can an instance have multiple subnets?
        var sn = graph.findNode(types.SUBNET, instance.SubnetId);
        sn.addChild(i);

        // VPC
        var vpc = graph.findNode(types.VPC, instance.VpcId);
        vpc.addChild(i);

        // Security groups
        instance.SecurityGroups.forEach(function (sg) {
          var g = graph.findNode(types.SECGRP, sg.GroupId);
          g.addChild(i);
          i.addChild(g);
        });
      });
    });
    instancesAreLoaded = true;
    return callback(null);
  });
}

function downloadSubnets(callback) {
  if (debug) console.log('  downloadSubnets()');

  // let describe = types.describe

  myAWS.ec2().describeSubnets({}, function (err, data) {
    if (err) return callback(err);

    // console.log('data=', data);
    data.Subnets.forEach(function (rec) {
      var sn = graph.findNode(types.SUBNET, rec.SubnetId, rec);

      // Add this to it's VPC
      var v = graph.findNode(types.VPC, rec.VpcId, null);
      v.addChild(sn);

      // Add this to it's AvailabilityZone
      var az = graph.findNode(types.AZ, rec.AvailabilityZone, null);
      az.addChild(sn);
    });
    return callback(null);
  });
}

function downloadSecurityGroups(callback) {
  if (debug) console.log('  downloadSecurityGroups()');
  var describe = function describe(node) {
    var desc = '';
    desc += '  Name: ' + node.data.GroupName + '\n';
    desc += '  Description: ' + node.data.Description + '\n';
    return desc;
  };

  myAWS.ec2().describeSecurityGroups({}, function (err, data) {
    if (err) return callback(err);
    data.SecurityGroups.forEach(function (grp) {
      // console.log('grp=', grp);
      var g = graph.findNode(types.SECGRP, grp.GroupId, grp, describe);

      // Add this to it's VPC
      var v = graph.findNode(types.VPC, grp.VpcId, null);
      v.addChild(g);
    });
    return callback(null);
  });
}

function downloadNatGateways(callback) {
  if (debug) console.log('  downloadNatGateways()');
  var describe = function describe(node) {
    var desc = '';
    desc += '  State: ' + node.data.State + '\n';
    return desc;
  };

  myAWS.ec2().describeNatGateways({}, function (err, data) {
    if (err) return callback(err);

    // console.log('data=', data);
    data.NatGateways.forEach(function (grp) {
      console.log('nat is ' + grp.NatGatewayId);
      var g = graph.findNode(types.NAT, grp.NatGatewayId, grp, describe);

      if (grp.State !== 'deleted') {
        // Add this to it's subnet
        var sn = graph.findNode(types.SUBNET, grp.SubnetId, null);
        sn.addChild(g);

        // Add this to it's VPC
        var v = graph.findNode(types.VPC, grp.VpcId, null);
        v.addChild(g);

        // Add it's public IPs
        grp.NatGatewayAddresses.forEach(function (addr) {
          if (addr.NetworkInterfaceId) {
            var iface = graph.findNode(types.NETIFACE, addr.NetworkInterfaceId, null);
            g.addChild(iface);
          }
          if (addr.PublicIp) {
            var ip = graph.findNode(types.PUBLICIP, addr.PublicIp, null);
            g.addChild(ip);
          }
        });
      }
    });
    return callback(null);
  });
}

function downloadInternetGateways(callback) {
  if (debug) console.log('  downloadInternetGateways()');
  var describe = function describe(node) {
    var desc = '';
    var name = node.findTag('Name');
    if (name) {
      desc += '  Name: ' + name + '\n';
    }
    return desc;
  };

  // An Internet Gateway provides the means by which the stuff in the
  // VPC connects to the Internet. I believe a NAT will quietly use
  // the Internet Gateway, but doesn't actually reference it.
  myAWS.ec2().describeInternetGateways({}, function (err, data) {
    if (err) return callback(err);

    data.InternetGateways.forEach(function (rec) {
      // console.log('\n\n\nINTERNET GATEWAY=', rec)
      var igw = graph.findNode(types.IGW, rec.InternetGatewayId, rec, describe);

      // See where it is attached
      rec.Attachments.forEach(function (attachment) {
        if (attachment.VpcId) {
          var vpc = graph.findNode(types.VPC, attachment.VpcId);
          vpc.addChild(igw);
        }
      });
    });
    return callback(null);
  });
}

// Elastic IPs
function downloadAddresses(callback) {
  if (debug) console.log('  downloadAddresses()');
  var describe = function describe(node) {
    // Return a description
    var desc = '';
    desc += '  IP Address: ' + node.data.PublicIp + '\n';
    return desc;
  };

  myAWS.ec2().describeAddresses({}, function (err, data) {
    if (err) return callback(err);

    // console.log('data=', data);
    data.Addresses.forEach(function (rec) {
      var addr = graph.findNode(types.ADDR, rec.AllocationId, rec, describe);

      // Remember if it has a public IP
      if (rec.PublicIp) {
        var ip = graph.findNode(types.PUBLICIP, rec.PublicIp);
        ip.addChild(addr);
      }
    });
    return callback(null);
  });
}

function downloadAvailabilityZones(callback) {
  if (debug) console.log('  downloadAvailabilityZones()');
  var describe = function describe(node) {
    var desc = '';
    // desc += '  IP Address: ' + node.data.PublicIp + '\n';
    return desc;
  };

  myAWS.ec2().describeAvailabilityZones({}, function (err, data) {
    if (err) return callback(err);

    // console.log('data=', data);
    data.AvailabilityZones.forEach(function (rec) {
      var g = graph.findNode(types.AZ, rec.ZoneName, rec, describe);
    });
    return callback(null);
  });
}

function downloadKeyPairs(callback) {
  if (debug) console.log('  downloadKeyPairs()');
  var describe = function describe(node) {
    var desc = '';
    return desc;
  };

  myAWS.ec2().describeKeyPairs({}, function (err, data) {
    if (err) return callback(err);

    // console.log('data=', data);
    data.KeyPairs.forEach(function (rec) {
      // This will create the node
      graph.findNode(types.KEYPAIR, rec.KeyName, rec, describe);
    });
    return callback(null);
  });
}

// Inbound interface from the Internet
function downloadNetworkInterfaces(callback) {
  if (debug) console.log('  downloadNetworkInterfaces()');
  var describe = function describe(node) {
    var desc = '';
    desc += node.data.Description;
    return desc;
  };

  myAWS.ec2().describeNetworkInterfaces({}, function (err, data) {
    if (err) return callback(err);

    // console.log('data=', data);
    data.NetworkInterfaces.forEach(function (rec) {
      // console.log('\nNETWORK INTERFACE:', rec);
      var ni = graph.findNode(types.NETIFACE, rec.NetworkInterfaceId, rec, describe);

      // Public IP via association
      if (rec.Association && rec.Association.PublicIp) {
        var ip = graph.findNode(types.PUBLICIP, rec.Association.PublicIp);
        ip.addChild(ni);
      }

      // Attachment
      if (rec.Attachment) {
        if (rec.Attachment.InstanceId) {
          var instance = graph.findNode(types.INSTANCE, rec.Attachment.InstanceId);
          ni.addChild(instance);
        }
      }

      // AvailabilityZone
      var az = graph.findNode(types.AZ, rec.AvailabilityZone);
      az.addChild(ni);

      // Subnet
      var subnet = graph.findNode(types.SUBNET, rec.SubnetId);
      subnet.addChild(ni);

      // VPC
      var vpc = graph.findNode(types.VPC, rec.VpcId);
      vpc.addChild(ni);
    });
    return callback(null);
  });
}

function downloadRouteTables(callback) {
  if (debug) console.log('  downloadRouteTables()');
  var describe = function describe(node) {
    // Return a description
    var desc = '';
    if (node.hasPublicRoutes) {
      desc += '  --  HAS PUBLIC ROUTES';
    }
    var name = node.findTag('Name');
    if (name) {
      desc += '\n' + name;
    }
    // See if this is a main route table
    // node.data.Associations.forEach(assoc => {
    //   if (assoc.Main) {
    //     desc += '\nMain Route table for ' + assoc.RouteTableAssociationId
    //   }
    // })

    // Routes
    var gateways = [];
    desc += '\n<table class="smalltable">\n';
    node.data.Routes.forEach(function (route) {
      if (route.GatewayId === 'local') {
        desc += '<tr><td>' + route.DestinationCidrBlock + '</td><td>  >>>&nbsp;&nbsp;&nbsp;local</td></tr>\n';
      } else {
        var key = graph.keyForNode(types.NAT, route.GatewayId);
        desc += '<tr><td>' + route.DestinationCidrBlock + '</td><td>  >>>&nbsp;&nbsp;&nbsp;<a href="?node=' + key + '">' + route.GatewayId + '</a></td></tr>\n';
      }
    });
    desc += '</table>';
    return desc;
  };

  myAWS.ec2().describeRouteTables({}, function (err, data) {
    if (err) return callback(err);

    // console.log('routeTables=', data);
    data.RouteTables.forEach(function (rec) {
      // console.log('\nRoute table:', rec);
      var rt = graph.findNode(types.ROUTETABLE, rec.RouteTableId, rec, describe);

      // Look for routes to Internet Gateways
      var gateways = []; // Only add each gateway it once
      rec.Routes.forEach(function (route) {
        if (route.GatewayId === 'local') {
          // Routing to the local subnet
        } else if (route.NatGatewayId) {
          // Routes to a NAT
          var id = route.NatGatewayId;
          if (!gateways[id]) {
            var nat = graph.findNode(types.NAT, id);
            rt.addChild(nat);
            // Having a route to the internet via a NAT is the definition of a "Public Subnet"
            rt.hasPublicRoutes = true;
            gateways[id] = true;
          }
        } else if (route.GatewayId) {
          // Routes to an Internet Gateway
          var _id = route.GatewayId;
          if (!gateways[_id]) {
            var igw = graph.findNode(types.IGW, _id);
            rt.addChild(igw);
            // // Having a route to an Internet Gateway is also the definition of a "Public Subnet"
            // rt.hasPublicRoutes = true
            gateways[_id] = true;
          }
        }
      });

      // Subnets mapped to this routing table
      rec.Associations.forEach(function (assoc) {
        if (assoc.SubnetId) {
          var sn = graph.findNode(types.SUBNET, assoc.SubnetId);
          rt.addChild(sn);
        }
      });

      // VPC
      var vpc = graph.findNode(types.VPC, rec.VpcId);
      vpc.addChild(rt);
    });
    return callback(null);
  });
}

function describeTargets(targetGroup, withHealthchecks) {
  var desc = '';
  if (withHealthchecks) {
    if (targetGroup._health && targetGroup._health.length > 0) {
      targetGroup._health.forEach(function (health) {
        // console.log('health=', health);
        var key = graph.keyForNode(types.INSTANCE, health.Target.Id);
        desc += '    -->> Instance ';
        desc += '<a href="?node=' + key + '">' + health.Target.Id + '</a>';
        desc += ', port ' + health.Target.Port + '   (' + health.TargetHealth.State + ')\n';
      });
    } else {
      desc += '    No targets\n';
    }
  } else {
    desc += 'Unknown targets (--skip-healthchecks is set)\n';
  }
  return desc;
}

function downloadLoadBalancers(withHealthchecks, callback) {
  if (debug) console.log('  downloadLoadBalancers()');

  if (!targetGroupsAreLoaded) {
    console.log('ERROR: downloadLoadBalancers() called before downloadTargetGroups()');
    console.log('Links between load balancers and target groups will be missing.');
  }

  var describe = function describe(node) {
    var desc = '';
    desc += 'Status: ' + node.data.State.Code + '\n';
    var dns = node.data.DNSName;
    if (dns) {
      desc += 'dns: <a href="http://' + dns + '" target="_blank">' + dns + '</a>\n';
    }
    if (node._listeners) {
      node._listeners.forEach(function (listener) {
        var targetGroup = listener._targetGroupNode;
        if (!targetGroup) {

          // No target group
          var link = listener.Protocol.toLowerCase() + '://' + dns + ':' + listener.Port;
          desc += '<a href="' + link + '" target="_blank">Public ' + listener.Protocol.toLowerCase() + ' / ' + listener.Port + '</a> -> NO TARGET GROUP?\n';
        } else {

          // Have a target group
          // If we have the healthcheck information, we can also show the targets
          var _link = listener.Protocol.toLowerCase() + '://' + dns + ':' + listener.Port + targetGroup.data.HealthCheckPath;
          desc += '<a href="' + _link + '" target="_blank">Public ' + listener.Protocol.toLowerCase() + ' / ' + listener.Port + '</a> -> Target Group (<a href="?node=' + targetGroup.key + '">' + targetGroup.id + '</a>)\n';

          // Add the targets for this target group, if they have been loaded
          desc += describeTargets(targetGroup, withHealthchecks);
        }
      });
    } else {
      desc += 'INTERNAL ERROR: MISSING _LISTENERS\n';
    }
    return desc;
  };

  // We load the Load Balancers here (into nodeIndex),
  // and Listeners into
  //    => load-balancer-node._listeners,
  // and the target group for each Listener into
  //    => load-balancer-node._listeners[x]._targetGroupNode
  // and the targets and their health into
  //    => load-balancer-node._listeners[x]._targetGroupNode._health
  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELBv2.html#describeLoadBalancers-property
  myAWS.elbv2().describeLoadBalancers({}, function (err, data) {
    if (err) return callback(err);
    // console.log('data=', data);

    (function nextALB(index) {
      if (index >= data.LoadBalancers.length) {
        loadBalancersAreLoaded = true;
        return callback(null);
      }
      var rec = data.LoadBalancers[index];
      var alb = graph.findNode(types.ALB, rec.LoadBalancerName, rec, describe);

      // Availability Zones and Subnets
      rec.AvailabilityZones.forEach(function (az) {
        var az2 = graph.findNode(types.AZ, az.ZoneName);
        az2.addChild(alb);

        var subnet = graph.findNode(types.SUBNET, az.SubnetId);
        subnet.addChild(alb);
      });

      // Security Groups
      rec.SecurityGroups.forEach(function (sgid) {
        var sg = graph.findNode(types.SECGRP, sgid);
        sg.addChild(alb);
      });

      // VPC
      var vpc = graph.findNode(types.VPC, rec.VpcId);
      vpc.addChild(alb);

      // Get the listeners for this load Balancer
      // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELBv2.html#describeListeners-property
      myAWS.elbv2().describeListeners({
        LoadBalancerArn: rec.LoadBalancerArn
      }, function (err, data) {
        if (err) return callback(err);

        // console.log('listener data=', data);
        alb._listeners = data.Listeners;
        // return callback(null)

        // Iterate through the listeners
        (function nextListener(listenerIndex) {
          if (listenerIndex >= data.Listeners.length) {
            return nextALB(index + 1);
          }
          var listener = data.Listeners[listenerIndex];
          // console.log('\n\nLISTENER=', listener);

          // The listener contains 'DefaultActions', which will be
          // the ARN of a target group to forward to.
          listener.DefaultActions.forEach(function (action) {

            // Find the Target Group for this Action
            var targetGroup = findTargetGroupByARN(action.TargetGroupArn);
            if (!targetGroup) {
              // No target group, so ignore this listener
              //ZZZZ Should check the default target group
              return nextListener(listenerIndex + 1);
            }
            listener._targetGroupNode = targetGroup;
            alb.addChild(targetGroup);

            // Load the health of the targets, if required
            // console.log('target group=', targetGroup);
            if (!withHealthchecks) {
              // We are skipping health check, to load faster
              return nextListener(listenerIndex + 1);
            }
            // See if the healthcheck info is already loaded for this target group
            if (listener._targetGroupNode._health) {
              return nextListener(listenerIndex + 1);
            }

            // Load the health of the targets in the target group
            // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELBv2.html#describeTargetHealth-property
            // console.log('load health for ' + targetGroup.data.TargetGroupArn);
            myAWS.elbv2().describeTargetHealth({
              TargetGroupArn: targetGroup.data.TargetGroupArn
            }, function (err, healthData) {
              if (err) return callback(err);
              listener._targetGroupNode._health = healthData.TargetHealthDescriptions;
              // console.log('target health=', healthData);
              healthData.TargetHealthDescriptions.forEach(function (health) {
                // Instance
                // console.log('health=', health);
                var instance = graph.findNode(types.INSTANCE, health.Target.Id);
                alb.addChild(instance);
              }); //- next health
              return nextListener(listenerIndex + 1);
            }); //- describeTargetHealth
          }); //- next action
        })(0); //- next listener
      }); //- describeListeners
    })(0); //- nextALB
  }); //- describeLoadBalancers
}

function downloadTargetGroups(withHealthchecks, callback) {
  if (debug) console.log('  downloadTargetGroups()');

  // Function to describe node
  var describe = function describe(node) {
    var desc = '';
    desc += 'From: ' + node.data.Protocol.toLowerCase() + ' / ' + node.data.Port + '\n';
    desc += 'Healthcheck: ' + node.data.HealthCheckPath + '\n';

    // Add the targets for this target group, if they have been loaded
    desc += describeTargets(node, withHealthchecks);
    return desc;
  };

  // Load the definitions
  myAWS.elbv2().describeTargetGroups({}, function (err, data) {
    if (err) return callback(err);

    // console.log('data=', data);
    data.TargetGroups.forEach(function (rec) {
      // console.log('tg=', rec);
      var tg = graph.findNode(types.TARGETGRP, rec.TargetGroupName, rec, describe);

      // VPC
      var vpc = graph.findNode(types.VPC, rec.VpcId);
      vpc.addChild(tg);
    });
    targetGroupsAreLoaded = true;
    return callback(null);
  });
}

/*
*   Get the container instances for a cluster.
*/
function loadContainerInstancesForCluster(cluster, callback /* (err, instanceForContainer) */) {
  var clusterName = cluster.data.clusterName;
  if (debug) console.log('  - getting list of container instances (cluster=' + clusterName + ')');
  var instanceForContainer = []; // containerInstanceArn -> node of EC2 instance
  myAWS.ecs().listContainerInstances({
    cluster: clusterName
  }, function (err, containerInstanceList) {
    if (err) return callback(err);
    if (containerInstanceList.containerInstanceArns.length == 0) {
      return callback(null, instanceForContainer);
    }
    var params = {
      cluster: clusterName,
      containerInstances: containerInstanceList.containerInstanceArns
    };
    if (debug) console.log('  - getting container instance details (cluster=' + clusterName + ', ' + containerInstanceList.containerInstanceArns.length + ' container instances)');
    myAWS.ecs().describeContainerInstances(params, function (err, containerDefinitions) {
      if (err) return callback(err);

      // Add the container instances to our graph
      // console.log(`containerDefinitions=`, containerDefinitions);
      containerDefinitions.containerInstances.forEach(function (containerDef) {
        var instance = findInstanceById(containerDef.ec2InstanceId);
        cluster.addChild(instance);

        // Remember this, so we can create a link between tasks and this EC2 instance
        instanceForContainer[containerDef.containerInstanceArn] = instance;
      }); // next containerInstance
      return callback(null, instanceForContainer);
    }); //- describeContainerInstances
  }); //- listContainerInstances
}; //- function loadContainerInstancesForCluster()

/*
*   Get the services for this cluster.
*
*   https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ECS.html#describeServices-property
*/
function loadServicesForCluster(cluster, callback /* (err) */) {
  if (debug) console.log('  - getting list of services for cluster ' + cluster.data.clusterName);

  var clusterName = cluster.data.clusterName;
  var clusterArn = cluster.data.clusterArn;
  myAWS.ecs().listServices({
    cluster: clusterName
  }, function (err, serviceListData) {
    if (err) return callback(err);
    if (serviceListData.serviceArns.length === 0) {
      return callback(null);
    }
    if (debug) console.log('  - getting service details');
    myAWS.ecs().describeServices({
      services: serviceListData.serviceArns,
      cluster: clusterArn
    }, function (err, serviceDefinitions) {
      if (err) return callback(err);

      // console.log('serviceDefinitions=', serviceDefinitions);
      // console.log(`Got services`);
      serviceDefinitions.services.forEach(function (serviceDef) {

        // Next Service
        // console.log('serviceDef=', serviceDef);
        var service = graph.findNode(types.SERVICE, serviceDef.serviceName, serviceDef);
        cluster.addChild(service);

        // Find the load balancer nodes for this service.
        serviceDef.loadBalancers.forEach(function (lb) {
          var tg = findTargetGroupByARN(lb.targetGroupArn);
          if (tg) {
            tg.addChild(service);
            // service.addChild(tg);
          } else {
            console.log('ERROR: Service ' + service.key + ' refers to unknown target group ' + lb.targetGroupArn);
          }
        }); //- next load balancer
      }); //- next service
      return callback(null);
    }); //- describeServices
  }); //- listServices
} //- loadServicesForCluster

/*
*   Get the task definitions for a cluster.
*/
function loadTasksForCluster(clusterName, callback /* (err,taskDefinitions) */) {
  if (debug) console.log('  - getting list of tasks (cluster=' + clusterName + ')');
  myAWS.ecs().listTasks({
    cluster: clusterName
  }, function (err, taskList) {
    if (err) return callback(err);
    // console.log('taskList=', taskList); // successful response
    if (taskList.taskArns.length === 0) {
      return callback(null, []); // No tasks
    }
    var params = {
      tasks: taskList.taskArns,
      cluster: clusterName
    };
    if (debug) console.log('- getting task details');
    myAWS.ecs().describeTasks(params, function (err, taskDefinitions) {
      if (err) return callback(err);

      // Have the task definitions
      return callback(null, taskDefinitions.tasks);
    }); //- describeTasks
  }); //- listTasks
}

function downloadClusters(callback) {
  if (debug) console.log('  downloadClusters()');

  // Check the load balancers have been loaded already,
  // as we'll need to link to them from ECS services.
  if (!loadBalancersAreLoaded) {
    console.log('ERROR: downloadClusters() called before downloadLoadBalancers()');
    console.log('Links between services and load balancers will be unknown.');
  }
  if (!targetGroupsAreLoaded) {
    console.log('ERROR: downloadClusters() called before downloadTargetGroups()');
    console.log('Links between services and target groups will be unknown.');
  }
  if (!instancesAreLoaded) {
    console.log('ERROR: downloadClusters() called before downloadInstances()');
    console.log('Links between services and instances will be unknown.');
  }

  var describe = function describe(node) {
    var desc = '';
    var name = node.findTag('Name');
    if (name) {
      desc += '  Name: ' + name + '\n';
    }
    return desc;
  };

  /*
  *   Get the clusters for this region.
  *
  *   See https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ECS.html#listClusters-property
  */
  if (debug) console.log('  - getting list of clusters');
  myAWS.ecs().listClusters({}, function (err, clusterList) {
    if (err) return callback(err);
    if (debug) console.log('  - getting cluster details');
    myAWS.ecs().describeClusters({
      clusters: clusterList.clusterArns
    }, function (err, clusterDefinitions) {
      if (err) return callback(err);

      // console.log('clusterDefinitions: ', clusterDefinitions);

      // Loop through the clusters.
      (function nextCluster(index) {
        // Past the last cluster?
        if (index >= clusterDefinitions.clusters.length) {
          return callback(null);
        }

        // Next Cluster
        var clusterDef = clusterDefinitions.clusters[index];
        var cluster = graph.findNode(types.CLUSTER, clusterDef.clusterName, clusterDef);
        console.log('Got cluster ' + clusterDef.clusterName);

        /*
        *   Get the container instances for this cluster.
        */
        loadContainerInstancesForCluster(cluster, function (err, instanceForContainer) {
          if (err) return callback(err);

          loadServicesForCluster(cluster, function (err) {
            if (err) return callback(err);

            loadTasksForCluster(clusterDef.clusterName, function (err, taskDefinitions) {
              if (err) return callback(err);

              // Loop through the task definitions.
              // console.log(`taskDefinitions=`, taskDefinitions);
              taskDefinitions.forEach(function (taskDef) {
                // console.log(`Task ${taskDef.taskDefinitionArn}`);
                // console.log(`  startedBy:`, taskDef.startedBy);
                // console.log(`  Containers:`, taskDef.containers);
                // console.log(`  Last status ${taskDef.lastStatus}`);

                // Get the task name from it's definition. For example, the end of:
                // 'arn:aws:ecs:ap-southeast-1:238285074004:task-definition/nbt-trsgms1-authservice:6'
                var pos = taskDef.taskDefinitionArn.lastIndexOf('/');
                var taskName = taskDef.taskDefinitionArn.substring(pos + 1);
                pos = taskName.lastIndexOf(':');
                taskName = taskName.substring(0, pos);
                // console.log(`task name is ${taskName}`);

                // See if it was started by a service
                // console.log('Looking for service parent');
                var parentOfTask = cluster;
                if (taskDef.startedBy) {
                  // console.log('checking services');
                  cluster.children.forEach(function (childKey) {
                    var child = graph.nodeWithKey(childKey);
                    if (child.type === types.SERVICE) {
                      var service = child;
                      var deployments = service.data.deployments;
                      for (var cnt = 0; cnt < deployments.length; cnt++) {
                        if (deployments[cnt].id === taskDef.startedBy) {
                          // Yep, was started by this service.
                          // console.log('\n\nWas started by ', service);
                          parentOfTask = service;
                          break;
                        }
                      } //- next deployment
                    } //- child is a service
                  }); // next child of the cluster
                } //- startedBy != null

                // Define the task, and add it to it's parent.
                var task = graph.findNode(types.TASK, taskName, taskDef);
                parentOfTask.addChild(task);

                // Link the task to the containerInstance's EC2 instance.
                var instance = instanceForContainer[taskDef.containerInstanceArn];
                if (instance) {
                  task.addChild(instance);
                } else {
                  console.log('ERROR: task ' + taskDef.taskArn + ' refers to unknown containerInstance ' + taskDef.containerInstanceArn);
                }
              }); //- next task

              return nextCluster(index + 1);
            }); //- loadTasksForCluster
          }); //- loadServicesForCluster
        }); //- loadContainerInstancesForCluster
      })(0); // next cluster
    }); //- describeClusters
  }); //- listClusters
}

function downloadDatabases(callback) {
  if (debug) console.log('  downloadDatabases()');

  // Function to describe node
  var describe = function describe(node) {
    var desc = '';
    desc += 'DATABASE ' + node.DBInstanceIdentifier;
    // desc += 'From: ' + node.data.Protocol.toLowerCase() + ' / ' + node.data.Port + '\n'
    // desc += 'Healthcheck: ' + node.data.HealthCheckPath + '\n'

    // Add the targets for this target group, if they have been loaded
    // desc += describeTargets(node, withHealthchecks)
    return desc;
  };

  // Load the definitions
  myAWS.rds().describeDBInstances({}, function (err, data) {
    if (err) return callback(err);

    //console.log('data=', data);
    data.DBInstances.forEach(function (rec) {
      // console.log('\n\n\nDB =>', rec);
      var db = graph.findNode(types.DATABASE, rec.DBInstanceIdentifier, rec, describe);

      rec.VpcSecurityGroups.forEach(function (sgDef) {
        var sg = graph.findNode(types.SECGRP, sgDef.VpcSecurityGroupId);
        sg.addChild(db);
      });
      var az = graph.findNode(types.AZ, rec.AvailabilityZone);
      az.addChild(db);

      // VPC
      // let vpc = graph.findNode(types.VPC, rec.VpcId)
      // vpc.addChild(tg)
    });
    targetGroupsAreLoaded = true;
    return callback(null);
  });
}

// See http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeSubnets-property
function downloadEverything(region, withHealthchecks, callback /* (err) */) {
  console.log('downloadEverything()');
  console.log('Region is ' + region + ' (' + myAWS.regionDescription(region) + ')');

  myAWS.checkAwsRegion(region);

  // Clear existing list of nodes and reload everything
  graph.reset();
  downloadSecurityGroups(function (err) {
    if (err) return callback(err);
    downloadVpcs(function (err) {
      if (err) return callback(err);
      downloadSubnets(function (err) {
        if (err) return callback(err);
        downloadNatGateways(function (err) {
          if (err) return callback(err);
          downloadInternetGateways(function (err) {
            if (err) return callback(err);
            downloadInstances(function (err) {
              if (err) return callback(err);
              downloadAddresses(function (err) {
                if (err) return callback(err);
                downloadAvailabilityZones(function (err) {
                  if (err) return callback(err);
                  downloadKeyPairs(function (err) {
                    if (err) return callback(err);
                    downloadNetworkInterfaces(function (err) {
                      if (err) return callback(err);
                      myAWS.downloadRegions(function (err) {
                        if (err) return callback(err);
                        downloadRouteTables(function (err) {
                          if (err) return callback(err);
                          downloadTargetGroups(withHealthchecks, function (err) {
                            // Must be before load balancers
                            if (err) return callback(err);
                            downloadLoadBalancers(withHealthchecks, function (err) {
                              if (err) return callback(err);
                              downloadClusters(function (err) {
                                if (err) return callback(err);
                                downloadDatabases(function (err) {
                                  if (err) return callback(err);

                                  console.log('finished downloading everything');
                                  return callback(null);
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

module.exports.downloadInstances = downloadInstances;
module.exports.downloadVpcs = downloadVpcs;
module.exports.downloadSubnets = downloadSubnets;
module.exports.downloadNatGateways = downloadNatGateways;
module.exports.downloadInternetGateways = downloadInternetGateways;
module.exports.downloadAddresses = downloadAddresses;
module.exports.downloadAvailabilityZones = downloadAvailabilityZones;
module.exports.downloadKeyPairs = downloadKeyPairs;
module.exports.downloadNetworkInterfaces = downloadNetworkInterfaces;
module.exports.downloadRouteTables = downloadRouteTables;
module.exports.downloadLoadBalancers = downloadLoadBalancers;
module.exports.downloadTargetGroups = downloadTargetGroups;
module.exports.downloadClusters = downloadClusters;
module.exports.downloadDatabases = downloadDatabases;
module.exports.downloadEverything = downloadEverything;

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'starter',
    meta: [{ charset: 'utf-8' }, { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' }, // From https://github.com/nuxt/nuxt.js/issues/1395
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }, { hid: 'description', name: 'description', content: 'Nuxt.js project' }],
    css: [
      // '~/node_modules/bulma/css/bulma.css'
    ],
    link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }, { rel: 'stylesheet', href: '//fonts.googleapis.com/css?family=Lato|Open+Sans' }],
    build: {
      extractCSS: true
    }
  },
  /*
  ** Global CSS
  */
  css: ['~/assets/css/main.scss', '~/node_modules/vis/dist/vis-network.min.css'],
  loading: {
    color: '#41b883'
  },
  /*
  ** Add axios globally
  */
  build: {
    vendor: ['axios', 'vis', 'lodash'],
    /*
    ** Run ESLINT on save
    */
    extend: function extend(config, ctx) {
      if (ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        });
      }
    },

    postcss: {
      plugins: {
        'postcss-custom-properties': false
      }
    }
  },
  modules: [
  // '@nuxtjs/bulma'
  'nuxt-buefy']
};

/***/ })
/******/ ]);
//# sourceMappingURL=main.map