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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./server/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./lib/types.js":
/*!**********************!*\
  !*** ./lib/types.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

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

function descriptionFunctions(node) {
  switch (node.type) {
    case module.exports.SUBNET:
      return __webpack_require__(/*! ./types/subnet */ "./lib/types/subnet.js");

    case module.exports.ROUTETABLE:
      return __webpack_require__(/*! ./types/routeTable */ "./lib/types/routeTable.js");

    case module.exports.ALB:
      return __webpack_require__(/*! ./types/loadBalancer */ "./lib/types/loadBalancer.js");

    case module.exports.DATABASE:
      return __webpack_require__(/*! ./types/database */ "./lib/types/database.js");

    default:
      return null;
  }
}

module.exports.id = function (node) {
  if (!node.data) {
    return '-';
  }

  let fns = descriptionFunctions(node);

  if (fns && fns.id) {
    return fns.id(node, {
      findTag,
      types: module.exports
    });
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

    case this.CACHE:
      return node.key;

    default:
      return node.key;
  }
};

module.exports.label = function (node) {
  let fns = descriptionFunctions(node);

  if (fns && fns.label) {
    return fns.label(node, {
      findTag,
      types: module.exports
    });
  } // let label


  let name;

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
      return `public: ${node.data.PublicIp}`;

    case this.COSTCD:
      return node.key;

    case this.LOGICAL:
      return node.key;

    case this.PUBLICIP:
      return node.id;

    case this.KEYPAIR:
      return node.key;

    case this.NETIFACE:
      return `Private IP: ${node.data.PrivateIpAddress}`;

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

    case this.CACHE:
      return node.key;

    default:
      return node.key;
  }
};

module.exports.description = function (node) {
  let fns = descriptionFunctions(node);

  if (fns && fns.description) {
    return fns.description(node, {
      findTag,
      types: module.exports
    });
  }

  switch (node.type) {
    case this.SECGRP:
      return node.data.Description;

    case this.VPC:
      return node.data.State;

    case this.NAT:
      if (node.data) {
        return `Public IP: ${node.data.NatGatewayAddresses[0].PublicIp}`;
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
      return `private: ${node.data.PrivateIpAddress}`;

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

    case this.ALB:
      return node.data.DNSName;

    case this.TARGETGRP:
      return ' ';

    case this.LISTENER:
      return node.key;

    case this.RULE:
      return node.key;

    case this.CLUSTER:
      return `${node.data.status.toLowerCase()}, ${node.data.registeredContainerInstancesCount} instances, ${node.data.runningTasksCount} tasks`;

    case this.SERVICE:
      return `${node.data.status.toLowerCase()}, ${node.data.runningCount} running`;

    case this.TASK:
      return `version ${node.data.version}, ${node.data.lastStatus.toLowerCase()}`;

    case this.CACHE:
      return node.key;

    default:
      return `DESCRIPTION FOR ${node.key}`;
  }
};

module.exports.describe = function (node) {
  let fns = descriptionFunctions(node);

  if (fns && fns.describe) {
    return fns.describe(node, {
      findTag,
      types: module.exports
    });
  }

  switch (node.type) {
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
      return `<b>Public IP Address</b><br/>${node.id}`;

    case this.KEYPAIR:
      return node.key;

    case this.NETIFACE:
      return node.key;

    case this.ALB:
      return node.key;

    case this.TARGETGRP:
      return `
        <b>Target Group</b><br/>
        Name: ${node.data.TargetGroupName}<br>
        Healthcheck: ${node.data.HealthCheckPath}<br>
        Expected reply: ${node.data.Matcher.HttpCode}<br>`;

    case this.LISTENER:
      return node.key;

    case this.RULE:
      return node.key;

    case this.CLUSTER:
      return node.key;

    case this.SERVICE:
      return `
        <b>Service</b><br/>
        Name: ${node.data.serviceName}<br>
        Status: ${node.data.status}<br>
        Tasks: ${node.data.runningCount}<br>`;

    case this.TASK:
      return describeTask(node);

    case this.CACHE:
      return node.key;

    default:
      return node.key;
  }
};

function describeInstance(node) {
  let desc = '<b>EC2 Instance</b><br/>';
  let name = findTag(node, 'Name');

  if (name) {
    desc += '  Name: ' + name + '<br>';
  }

  let description = findTag(node, 'Description');

  if (description) {
    desc += '  Description: ' + description + '<br>';
  }

  desc += `Type: ${node.data.InstanceType}<br>`;
  desc += `Keyname: ${node.data.KeyName}<br>`;
  desc += `State: ${node.data.State.Name}<br>`;

  if (node.data.PublicIpAddress) {
    desc += '  IP addr: ' + node.data.PublicIpAddress + '<br>';
  }

  return desc;
}

function describeVpc(node) {
  let s = '<b>Virtual Private Cloud (VPC)</b><br/>';
  let name = findTag(node, 'Name');

  if (name) {
    s += '  Name: ' + name + '<br>';
  }

  s += '  Id: ' + node.data.VpcId + '<br>';
  s += `State: ${node.data.State}<br>`;
  let contact = findTag(node, 'Contact');

  if (contact) {
    s += '  Contact: ' + contact + '<br>';
  }

  return s;
}

function describeSecurityGroup(node) {
  // Return a description
  let desc = `Security Group<br/>`;
  desc += `Id: ${node.data.GroupId}<br/>`;
  let name = findTag(node, 'Name');

  if (name) {
    desc += `Name Tag: ${name}<br/>`;
  }

  desc += `Description: ${node.data.Description}<br/>`;
  desc += `GroupName: ${node.data.GroupName}<br/>`; // Route table?
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
  let desc = `<b>Task</b><br/>`;
  node.data.containers.forEach(c => {
    desc += `
      Name: ${c.name}<br>
      Ports: ${c.networkBindings.hostPort} -&gt; ${c.networkBindings.port}<br>`;
  });
  desc += `
    Version: ${node.data.version}<br>
    Status: ${node.data.lastStatus}<br>
    Desired Status: ${node.data.desiredStatus}<br>
    Memory: ${node.data.memory}<br>
    CPU: ${node.data.cpu}<br>
  `;
  return desc;
}

function findTag(node, tagname) {
  // Assumes node.data.Tags
  if (node.data && node.data.Tags) {
    for (var i = 0; i < node.data.Tags.length; i++) {
      let tag = node.data.Tags[i];

      if (tag.Key === tagname) {
        return tag.Value;
      }
    }
  }

  return '';
}

module.exports.findTag = findTag;

/***/ }),

/***/ "./lib/types/database.js":
/*!*******************************!*\
  !*** ./lib/types/database.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {
  id: (node, helpers) => {
    // return node.key
    return node.data.DBInstanceIdentifier;
  },
  label: (node, {
    findTag
  }) => {
    return node.data.DBInstanceIdentifier;
  },
  description: (node, helpers) => {
    if (node.data.Endpoint) {
      return `${node.data.Endpoint.Address}:${node.data.Endpoint.Port}`;
    }

    return ``;
  },
  describe: (node, {
    findTag
  }) => {
    // return ''
    let desc = '';
    desc += 'DATABASE ' + node.DBInstanceIdentifier; // desc += 'From: ' + node.data.Protocol.toLowerCase() + ' / ' + node.data.Port + '\n'
    // desc += 'Healthcheck: ' + node.data.HealthCheckPath + '\n'
    // Add the targets for this target group, if they have been loaded
    // desc += describeTargets(node, withHealthchecks)

    return desc;
  }
};

/***/ }),

/***/ "./lib/types/loadBalancer.js":
/*!***********************************!*\
  !*** ./lib/types/loadBalancer.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {
  id: node => {
    return node.id;
  },
  label: (node, {
    findTag
  }) => {
    return ``; // return node.data.LoadBalancerName
  },
  description: node => {
    return node.data.DNSName;
  },
  describe: (node, {
    findTag,
    types
  }) => {
    let withHealthchecks = false; // return node.key

    let desc = '';
    desc += 'Status: ' + node.data.State.Code + '\n';
    let dns = node.data.DNSName;

    if (dns) {
      desc += 'dns: <a href="http://' + dns + '" target="_blank">' + dns + '</a>\n';
    }

    if (node._listeners) {
      node._listeners.forEach(listener => {
        let targetGroup = listener._targetGroupNode;

        if (!targetGroup) {
          // No target group
          let link = listener.Protocol.toLowerCase() + '://' + dns + ':' + listener.Port;
          desc += '<a href="' + link + '" target="_blank">Public ' + listener.Protocol.toLowerCase() + ' / ' + listener.Port + '</a> -> NO TARGET GROUP?\n';
        } else {
          // Have a target group
          // If we have the healthcheck information, we can also show the targets
          let link = listener.Protocol.toLowerCase() + '://' + dns + ':' + listener.Port + targetGroup.data.HealthCheckPath;
          desc += '<a href="' + link + '" target="_blank">Public ' + listener.Protocol.toLowerCase() + ' / ' + listener.Port + '</a> -> Target Group (<a href="?node=' + targetGroup.key + '">' + targetGroup.id + '</a>)\n'; // Add the targets for this target group, if they have been loaded

          desc += describeTargets(targetGroup, withHealthchecks, types);
        }
      });
    } else {
      desc += 'INTERNAL ERROR: MISSING _LISTENERS\n';
    }

    return desc;
  }
};

function describeTargets(targetGroup, withHealthchecks, types) {
  let desc = '';

  if (withHealthchecks) {
    if (targetGroup._health && targetGroup._health.length > 0) {
      targetGroup._health.forEach(health => {
        // console.log('health=', health);
        let key = `${types.INSTANCE}::${health.Target.Id}`;
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

/***/ }),

/***/ "./lib/types/routeTable.js":
/*!*********************************!*\
  !*** ./lib/types/routeTable.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports.id = (node, helpers) => {
  return ``;
};

module.exports.label = (node, {
  findTag
}) => {
  if (node.hasPublicRoutes) {
    return `${node.data.RouteTableId} (public)`;
  }

  return `${node.data.RouteTableId} (private)`;
};

module.exports.description = (node, helpers) => {
  return ``;
};

module.exports.describe = (node, {
  findTag,
  types
}) => {
  // Return a description
  let desc = '';

  if (node.hasPublicRoutes) {
    desc += '  --  HAS PUBLIC ROUTES';
  }

  let name = node.findTag('Name');

  if (name) {
    desc += '\n' + name;
  } // See if this is a main route table
  // node.data.Associations.forEach(assoc => {
  //   if (assoc.Main) {
  //     desc += '\nMain Route table for ' + assoc.RouteTableAssociationId
  //   }
  // })
  // Routes


  desc += '\n<table class="smalltable">\n';
  node.data.Routes.forEach(route => {
    if (route.GatewayId === 'local') {
      desc += '<tr><td>' + route.DestinationCidrBlock + '</td><td>  >>>&nbsp;&nbsp;&nbsp;local</td></tr>\n';
    } else {
      let key = `${types.NAT}::${route.GatewayId}`;
      desc += '<tr><td>' + route.DestinationCidrBlock + '</td><td>  >>>&nbsp;&nbsp;&nbsp;<a href="?node=' + key + '">' + route.GatewayId + '</a></td></tr>\n';
    }
  });
  desc += '</table>';
  return desc;
};

/***/ }),

/***/ "./lib/types/subnet.js":
/*!*****************************!*\
  !*** ./lib/types/subnet.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports.id = (node, helpers) => {
  return node.data.SubnetId;
};

module.exports.label = (node, {
  findTag
}) => {
  let name = findTag(node, 'Name');
  return name || node.data.SubnetId;
};

module.exports.description = (node, helpers) => {
  return node.data.CidrBlock;
};

module.exports.describe = (node, {
  findTag
}) => {
  // Return a description
  let desc = `Id: ${node.data.SubnetId}<br/>`; // // See if the subnet's routing table connects to an Internet Gateway
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

  let name = findTag(node, 'Name');

  if (name) {
    desc += `Name ${name}<br/>`;
  }

  let description = findTag(node, 'Description');

  if (description) {
    desc += `Description: ${description}<br/>`;
  } // Route table?


  let useVpcRouteTable = true;
  node.parents.forEach(parent => {
    if (parent.type === this.ROUTETABLE) {
      useVpcRouteTable = false;
    }
  });

  if (useVpcRouteTable) {
    desc += 'Use default route table for VPC<br/>';
  } // IP Address range


  desc += `CidrBlock: ${node.data.CidrBlock}<br/>`;
  return desc;
};

/***/ }),

/***/ "./nuxt.config.js":
/*!************************!*\
  !*** ./nuxt.config.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'starter',
    meta: [{
      charset: 'utf-8'
    }, {
      'http-equiv': 'X-UA-Compatible',
      content: 'IE=edge'
    }, // From https://github.com/nuxt/nuxt.js/issues/1395
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1'
    }, {
      hid: 'description',
      name: 'description',
      content: 'Nuxt.js project'
    }],
    css: [// '~/node_modules/bulma/css/bulma.css'
    ],
    link: [{
      rel: 'icon',
      type: 'image/png',
      href: '/favicon.png'
    }, {
      rel: 'stylesheet',
      href: '//fonts.googleapis.com/css?family=Lato|Open+Sans'
    }],
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
    extend(config, ctx) {
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
  modules: [// '@nuxtjs/bulma'
  'nuxt-buefy']
};

/***/ }),

/***/ "./server/api/graphApi.js":
/*!********************************!*\
  !*** ./server/api/graphApi.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _misc_graph__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../misc/graph */ "./server/misc/graph.js");
/* harmony import */ var _misc_graph__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_misc_graph__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lru_cache__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lru-cache */ "lru-cache");
/* harmony import */ var lru_cache__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lru_cache__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _misc_download__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../misc/download */ "./server/misc/download.js");
/* harmony import */ var _misc_download__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_misc_download__WEBPACK_IMPORTED_MODULE_3__);

 // import types from '../misc/types'


 // , options = { max: 500
//             , length: function (n, key) { return n * 2 + key.length }
//             , dispose: function (key, n) { n.close() }
//             , maxAge: 1000 * 60 * 60 }
// , cache = LRU(options)

let cache = lru_cache__WEBPACK_IMPORTED_MODULE_2___default()(10); // sets just the max size to 10 items (actually size, but default size is 1)

const router = Object(express__WEBPACK_IMPORTED_MODULE_0__["Router"])();
/* GET user by ID. */

router.get('/graph/:region', function (req, res, next) {
  console.log('API /graph/:region', req.params);
  let region = req.params.region;
  console.log(`API: Region is ${region}`); // See if we can use the value in the cache.

  let cacheKey = region;
  let value = cache.get(cacheKey); // "value"

  if (req.query.reload) {
    console.log('Reloading cache');
    value = null;
  }

  if (value) {
    res.json(value);
    return;
  } // Download all we need from AWS


  _misc_download__WEBPACK_IMPORTED_MODULE_3___default.a.downloadEverything(region, false, err => {
    if (err) {
      console.log(`Error downloading region ${region}`, err, err.stack);
      res.sendStatus(500);
      return;
    }

    let index = _misc_graph__WEBPACK_IMPORTED_MODULE_1___default.a.index(); // console.log('Have index:', index)

    let obj = {};

    for (var key in index) {
      obj[key] = index[key];
    }

    console.log('Setting value in the cache');
    cache.set(cacheKey, obj);
    res.json(obj);
  });
});
/* harmony default export */ __webpack_exports__["default"] = (router);

/***/ }),

/***/ "./server/api/index.js":
/*!*****************************!*\
  !*** ./server/api/index.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _users__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./users */ "./server/api/users.js");
/* harmony import */ var _graphApi__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./graphApi */ "./server/api/graphApi.js");



const router = Object(express__WEBPACK_IMPORTED_MODULE_0__["Router"])(); // Add USERS Routes

router.use(_users__WEBPACK_IMPORTED_MODULE_1__["default"]);
router.use(_graphApi__WEBPACK_IMPORTED_MODULE_2__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (router);

/***/ }),

/***/ "./server/api/users.js":
/*!*****************************!*\
  !*** ./server/api/users.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);

const router = Object(express__WEBPACK_IMPORTED_MODULE_0__["Router"])(); // Mock Users

const users = [{
  name: 'Alexandre',
  stuff: 'Chicken shit'
}, {
  name: 'Pooya',
  stuff: 'Likes frisbee'
}, {
  name: 'Sébastien',
  stuff: 'Sleeps a lot'
}, {
  name: 'Phil',
  stuff: 'Likes VueJS'
}];
/* GET users listing. */

router.get('/users', function (req, res, next) {
  console.log('API /users');
  res.json(users);
});
/* GET user by ID. */

router.get('/users/:id', function (req, res, next) {
  const id = parseInt(req.params.id);

  if (id >= 0 && id < users.length) {
    res.json(users[id]);
  } else {
    res.sendStatus(404);
  }
});
/* harmony default export */ __webpack_exports__["default"] = (router);

/***/ }),

/***/ "./server/index.js":
/*!*************************!*\
  !*** ./server/index.js ***!
  \*************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var nuxt__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! nuxt */ "nuxt");
/* harmony import */ var nuxt__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(nuxt__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./api */ "./server/api/index.js");



const app = express__WEBPACK_IMPORTED_MODULE_0___default()();
const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3001;
app.set('port', port); // Import API Routes

app.use('/api', _api__WEBPACK_IMPORTED_MODULE_2__["default"]); // Import and Set Nuxt.js options

let config = __webpack_require__(/*! ../nuxt.config.js */ "./nuxt.config.js");

config.dev = !("development" === 'production'); // Init Nuxt.js

const nuxt = new nuxt__WEBPACK_IMPORTED_MODULE_1__["Nuxt"](config); // Build only in dev mode

if (config.dev) {
  const builder = new nuxt__WEBPACK_IMPORTED_MODULE_1__["Builder"](nuxt);
  builder.build();
} // Give nuxt middleware to express


app.use(nuxt.render); // Listen the server

app.listen(port, host);
console.log('Server listening on ' + host + ':' + port); // eslint-disable-line no-console

/***/ }),

/***/ "./server/misc/download.js":
/*!*********************************!*\
  !*** ./server/misc/download.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var myAWS = __webpack_require__(/*! ./myAWS */ "./server/misc/myAWS.js");

const graph = __webpack_require__(/*! ./graph */ "./server/misc/graph.js");

const types = __webpack_require__(/*! ../../lib/types */ "./lib/types.js");

var loadBalancersAreLoaded = false;
var targetGroupsAreLoaded = false;
var instancesAreLoaded = false;
const debug = false;

function findTargetGroupByARN(arn) {
  // console.log('findTargetGroupByARN(' + arn + ')');
  let all = graph.nodes();

  for (var i = 0; i < all.length; i++) {
    let node = all[i]; // if (node.type === types.TARGETGRP) {
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
  let all = graph.nodes();

  for (var i = 0; i < all.length; i++) {
    let node = all[i]; // if (node.type === types.INSTANCE) {
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
  myAWS.ec2().describeVpcs({}, (err, data) => {
    if (err) return callback(err); // console.log('data=', data);

    data.Vpcs.forEach(rec => {
      // console.log('rec=', rec);
      graph.findNode(types.VPC, rec.VpcId, rec);
    });
    return callback(null);
  });
}

function downloadInstances(callback) {
  // if (debug) console.log('  downloadInstances()');
  myAWS.ec2().describeInstances({}, (err, data) => {
    if (err) return callback(err); // console.log('data=', data);

    data.Reservations.forEach(res => {
      res.Instances.forEach(instance => {
        // See if it is a jumpbox
        // console.log('instance=', instance);
        instance.Tags.forEach(tag => {
          if (tag.Key === 'Name' && tag.Value.indexOf('-jumpbox-') >= 0) {
            instance._isJumpbox = true;
          }
        }); // Create the node

        let i = graph.findNode(types.INSTANCE, instance.InstanceId, instance); // ImageId

        let img = graph.findNode(types.IMAGE, instance.ImageId, null);
        i.addChild(img); // Availability zone

        if (instance.Placement && instance.Placement.AvailabilityZone) {
          let az = graph.findNode(types.AZ, instance.Placement.AvailabilityZone);
          az.addChild(i);
        } // Remember if it has a public IP


        if (instance.PublicIpAddress) {
          let ip = graph.findNode(types.PUBLICIP, instance.PublicIpAddress);
          ip.addChild(i);
        } // Subnet
        //ZZZ Can an instance have multiple subnets?


        let sn = graph.findNode(types.SUBNET, instance.SubnetId);
        sn.addChild(i); // VPC

        let vpc = graph.findNode(types.VPC, instance.VpcId);
        vpc.addChild(i); // Security groups

        instance.SecurityGroups.forEach(sg => {
          let g = graph.findNode(types.SECGRP, sg.GroupId);
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
  if (debug) console.log('  downloadSubnets()'); // let describe = types.describe

  myAWS.ec2().describeSubnets({}, (err, data) => {
    if (err) return callback(err); // console.log('data=', data);

    data.Subnets.forEach(rec => {
      let sn = graph.findNode(types.SUBNET, rec.SubnetId, rec); // Add this to it's VPC

      let v = graph.findNode(types.VPC, rec.VpcId, null);
      v.addChild(sn); // Add this to it's AvailabilityZone

      let az = graph.findNode(types.AZ, rec.AvailabilityZone, null);
      az.addChild(sn);
    });
    return callback(null);
  });
}

function downloadSecurityGroups(callback) {
  if (debug) console.log('  downloadSecurityGroups()'); // let describe = node => {
  //   let desc = ''
  //   desc += '  Name: ' + node.data.GroupName + '\n'
  //   desc += '  Description: ' + node.data.Description + '\n'
  //   return desc
  // }

  myAWS.ec2().describeSecurityGroups({}, (err, data) => {
    if (err) return callback(err);
    data.SecurityGroups.forEach(grp => {
      // console.log('grp=', grp);
      let g = graph.findNode(types.SECGRP, grp.GroupId, grp); // Add this to it's VPC

      let v = graph.findNode(types.VPC, grp.VpcId, null);
      v.addChild(g);
    });
    return callback(null);
  });
}

function downloadNatGateways(callback) {
  if (debug) console.log('  downloadNatGateways()'); // let describe = node => {
  //   let desc = ''
  //   desc += '  State: ' + node.data.State + '\n';
  //   return desc
  // }

  myAWS.ec2().describeNatGateways({}, (err, data) => {
    if (err) return callback(err); // console.log('data=', data);

    data.NatGateways.forEach(grp => {
      console.log('nat is ' + grp.NatGatewayId);
      let g = graph.findNode(types.NAT, grp.NatGatewayId, grp);

      if (grp.State !== 'deleted') {
        // Add this to it's subnet
        let sn = graph.findNode(types.SUBNET, grp.SubnetId, null);
        sn.addChild(g); // Add this to it's VPC

        let v = graph.findNode(types.VPC, grp.VpcId, null);
        v.addChild(g); // Add it's public IPs

        grp.NatGatewayAddresses.forEach(addr => {
          if (addr.NetworkInterfaceId) {
            let iface = graph.findNode(types.NETIFACE, addr.NetworkInterfaceId, null);
            g.addChild(iface);
          }

          if (addr.PublicIp) {
            let ip = graph.findNode(types.PUBLICIP, addr.PublicIp, null);
            g.addChild(ip);
          }
        });
      }
    });
    return callback(null);
  });
}

function downloadInternetGateways(callback) {
  if (debug) console.log('  downloadInternetGateways()'); // let describe = node => {
  //   let desc = ''
  //   let name = node.findTag('Name')
  //   if (name) {
  //     desc += '  Name: ' + name + '\n'
  //   }
  //   return desc
  // }
  // An Internet Gateway provides the means by which the stuff in the
  // VPC connects to the Internet. I believe a NAT will quietly use
  // the Internet Gateway, but doesn't actually reference it.

  myAWS.ec2().describeInternetGateways({}, (err, data) => {
    if (err) return callback(err);
    data.InternetGateways.forEach(rec => {
      // console.log('\n\n\nINTERNET GATEWAY=', rec)
      let igw = graph.findNode(types.IGW, rec.InternetGatewayId, rec); // See where it is attached

      rec.Attachments.forEach(attachment => {
        if (attachment.VpcId) {
          let vpc = graph.findNode(types.VPC, attachment.VpcId);
          vpc.addChild(igw);
        }
      });
    });
    return callback(null);
  });
} // Elastic IPs


function downloadAddresses(callback) {
  if (debug) console.log('  downloadAddresses()'); // let describe = node => {
  //   // Return a description
  //   let desc = ''
  //   desc += '  IP Address: ' + node.data.PublicIp + '\n';
  //   return desc
  // }

  myAWS.ec2().describeAddresses({}, (err, data) => {
    if (err) return callback(err); // console.log('data=', data);

    data.Addresses.forEach(rec => {
      let addr = graph.findNode(types.ADDR, rec.AllocationId, rec); // Remember if it has a public IP

      if (rec.PublicIp) {
        let ip = graph.findNode(types.PUBLICIP, rec.PublicIp);
        ip.addChild(addr);
      }
    });
    return callback(null);
  });
}

function downloadAvailabilityZones(callback) {
  if (debug) console.log('  downloadAvailabilityZones()'); // let describe = node => {
  //   let desc = ''
  //   // desc += '  IP Address: ' + node.data.PublicIp + '\n';
  //   return desc
  // }

  myAWS.ec2().describeAvailabilityZones({}, (err, data) => {
    if (err) return callback(err); // console.log('data=', data);

    data.AvailabilityZones.forEach(rec => {
      let g = graph.findNode(types.AZ, rec.ZoneName, rec);
    });
    return callback(null);
  });
}

function downloadKeyPairs(callback) {
  if (debug) console.log('  downloadKeyPairs()'); // let describe = node => {
  //   let desc = ''
  //   return desc
  // }

  myAWS.ec2().describeKeyPairs({}, (err, data) => {
    if (err) return callback(err); // console.log('data=', data);

    data.KeyPairs.forEach(rec => {
      // This will create the node
      graph.findNode(types.KEYPAIR, rec.KeyName, rec);
    });
    return callback(null);
  });
} // Inbound interface from the Internet


function downloadNetworkInterfaces(callback) {
  if (debug) console.log('  downloadNetworkInterfaces()'); // let describe = node => {
  //   let desc = ''
  //   desc += node.data.Description
  //   return desc
  // }

  myAWS.ec2().describeNetworkInterfaces({}, (err, data) => {
    if (err) return callback(err); // console.log('data=', data);

    data.NetworkInterfaces.forEach(rec => {
      // console.log('\nNETWORK INTERFACE:', rec);
      let ni = graph.findNode(types.NETIFACE, rec.NetworkInterfaceId, rec); // Public IP via association

      if (rec.Association && rec.Association.PublicIp) {
        let ip = graph.findNode(types.PUBLICIP, rec.Association.PublicIp);
        ip.addChild(ni);
      } // Attachment


      if (rec.Attachment) {
        if (rec.Attachment.InstanceId) {
          let instance = graph.findNode(types.INSTANCE, rec.Attachment.InstanceId);
          ni.addChild(instance);
        }
      } // AvailabilityZone


      let az = graph.findNode(types.AZ, rec.AvailabilityZone);
      az.addChild(ni); // Subnet

      let subnet = graph.findNode(types.SUBNET, rec.SubnetId);
      subnet.addChild(ni); // VPC

      let vpc = graph.findNode(types.VPC, rec.VpcId);
      vpc.addChild(ni);
    });
    return callback(null);
  });
}

function downloadRouteTables(callback) {
  if (debug) console.log('  downloadRouteTables()');
  myAWS.ec2().describeRouteTables({}, (err, data) => {
    if (err) return callback(err); // console.log('routeTables=', data);

    data.RouteTables.forEach(rec => {
      // console.log('\nRoute table:', rec);
      let rt = graph.findNode(types.ROUTETABLE, rec.RouteTableId, rec); // Look for routes to Internet Gateways

      let gateways = []; // Only add each gateway it once

      rec.Routes.forEach(route => {
        if (route.GatewayId === 'local') {// Routing to the local subnet
        } else if (route.NatGatewayId) {
          // Routes to a NAT
          let id = route.NatGatewayId;

          if (!gateways[id]) {
            let nat = graph.findNode(types.NAT, id);
            rt.addChild(nat); // Having a route to the internet via a NAT is the definition of a "Public Subnet"

            rt.hasPublicRoutes = true;
            gateways[id] = true;
          }
        } else if (route.GatewayId) {
          // Routes to an Internet Gateway
          let id = route.GatewayId;

          if (!gateways[id]) {
            let igw = graph.findNode(types.IGW, id);
            rt.addChild(igw); // // Having a route to an Internet Gateway is also the definition of a "Public Subnet"
            // rt.hasPublicRoutes = true

            gateways[id] = true;
          }
        }
      }); // Subnets mapped to this routing table

      rec.Associations.forEach(assoc => {
        if (assoc.SubnetId) {
          let sn = graph.findNode(types.SUBNET, assoc.SubnetId);
          rt.addChild(sn);
        }
      }); // VPC

      let vpc = graph.findNode(types.VPC, rec.VpcId);
      vpc.addChild(rt);
    });
    return callback(null);
  });
}

function describeTargets(targetGroup, withHealthchecks) {
  let desc = '';

  if (withHealthchecks) {
    if (targetGroup._health && targetGroup._health.length > 0) {
      targetGroup._health.forEach(health => {
        // console.log('health=', health);
        let key = graph.keyForNode(types.INSTANCE, health.Target.Id);
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
  } // We load the Load Balancers here (into nodeIndex),
  // and Listeners into
  //    => load-balancer-node._listeners,
  // and the target group for each Listener into
  //    => load-balancer-node._listeners[x]._targetGroupNode
  // and the targets and their health into
  //    => load-balancer-node._listeners[x]._targetGroupNode._health
  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELBv2.html#describeLoadBalancers-property


  myAWS.elbv2().describeLoadBalancers({}, (err, data) => {
    if (err) return callback(err); // console.log('data=', data);

    (function nextALB(index) {
      if (index >= data.LoadBalancers.length) {
        loadBalancersAreLoaded = true;
        return callback(null);
      }

      let rec = data.LoadBalancers[index];
      let alb = graph.findNode(types.ALB, rec.LoadBalancerName, rec); // Availability Zones and Subnets

      rec.AvailabilityZones.forEach(az => {
        let az2 = graph.findNode(types.AZ, az.ZoneName);
        az2.addChild(alb);
        let subnet = graph.findNode(types.SUBNET, az.SubnetId);
        subnet.addChild(alb);
      }); // Security Groups

      rec.SecurityGroups.forEach(sgid => {
        let sg = graph.findNode(types.SECGRP, sgid);
        sg.addChild(alb);
      }); // VPC

      let vpc = graph.findNode(types.VPC, rec.VpcId);
      vpc.addChild(alb); // Get the listeners for this load Balancer
      // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELBv2.html#describeListeners-property

      myAWS.elbv2().describeListeners({
        LoadBalancerArn: rec.LoadBalancerArn
      }, (err, data) => {
        if (err) return callback(err); // console.log('listener data=', data);

        alb._listeners = data.Listeners; // return callback(null)
        // Iterate through the listeners

        (function nextListener(listenerIndex) {
          if (listenerIndex >= data.Listeners.length) {
            return nextALB(index + 1);
          }

          let listener = data.Listeners[listenerIndex]; // console.log('\n\nLISTENER=', listener);
          // The listener contains 'DefaultActions', which will be
          // the ARN of a target group to forward to.

          listener.DefaultActions.forEach(action => {
            // Find the Target Group for this Action
            let targetGroup = findTargetGroupByARN(action.TargetGroupArn);

            if (!targetGroup) {
              // No target group, so ignore this listener
              //ZZZZ Should check the default target group
              return nextListener(listenerIndex + 1);
            }

            listener._targetGroupNode = targetGroup;
            alb.addChild(targetGroup); // Load the health of the targets, if required
            // console.log('target group=', targetGroup);

            if (!withHealthchecks) {
              // We are skipping health check, to load faster
              return nextListener(listenerIndex + 1);
            } // See if the healthcheck info is already loaded for this target group


            if (listener._targetGroupNode._health) {
              return nextListener(listenerIndex + 1);
            } // Load the health of the targets in the target group
            // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELBv2.html#describeTargetHealth-property
            // console.log('load health for ' + targetGroup.data.TargetGroupArn);


            myAWS.elbv2().describeTargetHealth({
              TargetGroupArn: targetGroup.data.TargetGroupArn
            }, (err, healthData) => {
              if (err) return callback(err);
              listener._targetGroupNode._health = healthData.TargetHealthDescriptions; // console.log('target health=', healthData);

              healthData.TargetHealthDescriptions.forEach(health => {
                // Instance
                // console.log('health=', health);
                let instance = graph.findNode(types.INSTANCE, health.Target.Id);
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
  if (debug) console.log('  downloadTargetGroups()'); // Load the definitions

  myAWS.elbv2().describeTargetGroups({}, (err, data) => {
    if (err) return callback(err); // console.log('data=', data);

    data.TargetGroups.forEach(rec => {
      // console.log('tg=', rec);
      let tg = graph.findNode(types.TARGETGRP, rec.TargetGroupName, rec); // VPC

      let vpc = graph.findNode(types.VPC, rec.VpcId);
      vpc.addChild(tg);
    });
    targetGroupsAreLoaded = true;
    return callback(null);
  });
}
/*
*   Get the container instances for a cluster.
*/


function loadContainerInstancesForCluster(cluster, callback
/* (err, instanceForContainer) */
) {
  let clusterName = cluster.data.clusterName;
  if (debug) console.log(`  - getting list of container instances (cluster=${clusterName})`);
  let instanceForContainer = []; // containerInstanceArn -> node of EC2 instance

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
    if (debug) console.log(`  - getting container instance details (cluster=${clusterName}, ${containerInstanceList.containerInstanceArns.length} container instances)`);
    myAWS.ecs().describeContainerInstances(params, function (err, containerDefinitions) {
      if (err) return callback(err); // Add the container instances to our graph
      // console.log(`containerDefinitions=`, containerDefinitions);

      containerDefinitions.containerInstances.forEach(function (containerDef) {
        let instance = findInstanceById(containerDef.ec2InstanceId);
        cluster.addChild(instance); // Remember this, so we can create a link between tasks and this EC2 instance

        instanceForContainer[containerDef.containerInstanceArn] = instance;
      }); // next containerInstance

      return callback(null, instanceForContainer);
    }); //- describeContainerInstances
  }); //- listContainerInstances
}

; //- function loadContainerInstancesForCluster()

/*
*   Get the services for this cluster.
*
*   https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ECS.html#describeServices-property
*/

function loadServicesForCluster(cluster, callback
/* (err) */
) {
  if (debug) console.log(`  - getting list of services for cluster ${cluster.data.clusterName}`);
  let clusterName = cluster.data.clusterName;
  let clusterArn = cluster.data.clusterArn;
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
      if (err) return callback(err); // console.log('serviceDefinitions=', serviceDefinitions);
      // console.log(`Got services`);

      serviceDefinitions.services.forEach(serviceDef => {
        // Next Service
        // console.log('serviceDef=', serviceDef);
        let service = graph.findNode(types.SERVICE, serviceDef.serviceName, serviceDef);
        cluster.addChild(service); // Find the load balancer nodes for this service.

        serviceDef.loadBalancers.forEach(lb => {
          let tg = findTargetGroupByARN(lb.targetGroupArn);

          if (tg) {
            tg.addChild(service); // service.addChild(tg);
          } else {
            console.log(`ERROR: Service ${service.key} refers to unknown target group ${lb.targetGroupArn}`);
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


function loadTasksForCluster(clusterName, callback
/* (err,taskDefinitions) */
) {
  if (debug) console.log(`  - getting list of tasks (cluster=${clusterName})`);
  myAWS.ecs().listTasks({
    cluster: clusterName
  }, function (err, taskList) {
    if (err) return callback(err); // console.log('taskList=', taskList); // successful response

    if (taskList.taskArns.length === 0) {
      return callback(null, []); // No tasks
    }

    var params = {
      tasks: taskList.taskArns,
      cluster: clusterName
    };
    if (debug) console.log('- getting task details');
    myAWS.ecs().describeTasks(params, function (err, taskDefinitions) {
      if (err) return callback(err); // Have the task definitions

      return callback(null, taskDefinitions.tasks);
    }); //- describeTasks
  }); //- listTasks
}

function downloadClusters(callback) {
  if (debug) console.log('  downloadClusters()'); // Check the load balancers have been loaded already,
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

  let describe = node => {
    let desc = '';
    let name = node.findTag('Name');

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
      if (err) return callback(err); // console.log('clusterDefinitions: ', clusterDefinitions);
      // Loop through the clusters.

      (function nextCluster(index) {
        // Past the last cluster?
        if (index >= clusterDefinitions.clusters.length) {
          return callback(null);
        } // Next Cluster


        let clusterDef = clusterDefinitions.clusters[index];
        let cluster = graph.findNode(types.CLUSTER, clusterDef.clusterName, clusterDef);
        console.log('Got cluster ' + clusterDef.clusterName);
        /*
        *   Get the container instances for this cluster.
        */

        loadContainerInstancesForCluster(cluster, (err, instanceForContainer) => {
          if (err) return callback(err);
          loadServicesForCluster(cluster, err => {
            if (err) return callback(err);
            loadTasksForCluster(clusterDef.clusterName, (err, taskDefinitions) => {
              if (err) return callback(err); // Loop through the task definitions.
              // console.log(`taskDefinitions=`, taskDefinitions);

              taskDefinitions.forEach(taskDef => {
                // console.log(`Task ${taskDef.taskDefinitionArn}`);
                // console.log(`  startedBy:`, taskDef.startedBy);
                // console.log(`  Containers:`, taskDef.containers);
                // console.log(`  Last status ${taskDef.lastStatus}`);
                // Get the task name from it's definition. For example, the end of:
                // 'arn:aws:ecs:ap-southeast-1:238285074004:task-definition/nbt-trsgms1-authservice:6'
                let pos = taskDef.taskDefinitionArn.lastIndexOf('/');
                let taskName = taskDef.taskDefinitionArn.substring(pos + 1);
                pos = taskName.lastIndexOf(':');
                taskName = taskName.substring(0, pos); // console.log(`task name is ${taskName}`);
                // See if it was started by a service
                // console.log('Looking for service parent');

                let parentOfTask = cluster;

                if (taskDef.startedBy) {
                  // console.log('checking services');
                  cluster.children.forEach(function (childKey) {
                    let child = graph.nodeWithKey(childKey);

                    if (child.type === types.SERVICE) {
                      let service = child;
                      let deployments = service.data.deployments;

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


                let task = graph.findNode(types.TASK, taskName, taskDef);
                parentOfTask.addChild(task); // Link the task to the containerInstance's EC2 instance.

                let instance = instanceForContainer[taskDef.containerInstanceArn];

                if (instance) {
                  task.addChild(instance);
                } else {
                  console.log(`ERROR: task ${taskDef.taskArn} refers to unknown containerInstance ${taskDef.containerInstanceArn}`);
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
  if (debug) console.log('  downloadDatabases()'); // Load the definitions

  myAWS.rds().describeDBInstances({}, (err, data) => {
    if (err) return callback(err); //console.log('data=', data);

    data.DBInstances.forEach(rec => {
      // console.log('\n\n\nDB =>', rec);
      let db = graph.findNode(types.DATABASE, rec.DBInstanceIdentifier, rec);
      rec.VpcSecurityGroups.forEach(sgDef => {
        let sg = graph.findNode(types.SECGRP, sgDef.VpcSecurityGroupId);
        sg.addChild(db);
      });
      let az = graph.findNode(types.AZ, rec.AvailabilityZone);
      az.addChild(db); // VPC
      // let vpc = graph.findNode(types.VPC, rec.VpcId)
      // vpc.addChild(tg)
    });
    targetGroupsAreLoaded = true;
    return callback(null);
  });
} // See http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeSubnets-property


function downloadEverything(region, withHealthchecks, callback
/* (err) */
) {
  console.log('downloadEverything()');
  console.log(`Region is ${region} (${myAWS.regionDescription(region)})`);
  myAWS.checkAwsRegion(region); // Clear existing list of nodes and reload everything

  graph.reset();
  downloadSecurityGroups(err => {
    if (err) return callback(err);
    downloadVpcs(err => {
      if (err) return callback(err);
      downloadSubnets(err => {
        if (err) return callback(err);
        downloadNatGateways(err => {
          if (err) return callback(err);
          downloadInternetGateways(err => {
            if (err) return callback(err);
            downloadInstances(err => {
              if (err) return callback(err);
              downloadAddresses(err => {
                if (err) return callback(err);
                downloadAvailabilityZones(err => {
                  if (err) return callback(err);
                  downloadKeyPairs(err => {
                    if (err) return callback(err);
                    downloadNetworkInterfaces(err => {
                      if (err) return callback(err);
                      myAWS.downloadRegions(err => {
                        if (err) return callback(err);
                        downloadRouteTables(err => {
                          if (err) return callback(err);
                          downloadTargetGroups(withHealthchecks, err => {
                            // Must be before load balancers
                            if (err) return callback(err);
                            downloadLoadBalancers(withHealthchecks, err => {
                              if (err) return callback(err);
                              downloadClusters(err => {
                                if (err) return callback(err);
                                downloadDatabases(err => {
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

/***/ "./server/misc/graph.js":
/*!******************************!*\
  !*** ./server/misc/graph.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const myAWS = __webpack_require__(/*! ./myAWS */ "./server/misc/myAWS.js");

const types = __webpack_require__(/*! ../../lib/types */ "./lib/types.js");

var nodeIndex = []; // key -> AWSNode

class AWSNode {
  constructor(type, id) {
    // console.log('AWSNode.constructor()');
    this.type = type;
    this.id = id;
    this.key = keyForNode(type, id);
    this.data = null;
    this.children = [];
    this.parents = [];
    this.describeFn = null;
  }

  setData(data) {
    this.data = data;
  }

  setDescribe(fn) {// this.describeFn = fn
  }

  addChild(childNode) {
    if (childNode != null) {
      // console.log('WOOP ' + this.key + ' => ' + childNode.key)
      this.children.push(childNode.key);
      childNode.parents.push(this.key);
    }
  }

  findTag(tagname) {
    // Assumes this.data.Tags
    if (this.data && this.data.Tags) {
      for (var i = 0; i < this.data.Tags.length; i++) {
        let tag = this.data.Tags[i];

        if (tag.Key === tagname) {
          return tag.Value;
        }
      }
    }

    return null;
  }

  awsLink() {
    let ec2Home = 'https://' + myAWS.region() + '.console.aws.amazon.com/ec2/v2/home?region=' + myAWS.region();
    let vpcHome = 'https://' + myAWS.region() + '.console.aws.amazon.com/vpc/home?region=' + myAWS.region();

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

  dump() {
    if (this.describeFn) {
      let desc = this.describeFn(this);

      if (desc) {
        console.log(desc);
      }
    } else {
      console.log('Id: ' + this.id);
    } // console.log(' - children:', this.children)


    this.children.forEach(child => {
      // console.log('  ->', child)
      console.log('  - ' + child.id);
    });
  }

  findEnvironment() {
    let environment = null;

    if (this.data && this.data.Tags) {
      this.data.Tags.forEach(tag => {
        if (tag.Key.toLowerCase() === 'environment') {
          environment = tag.Value; // console.log(`environment is [${environment}]`);
        }
      });
    }

    return environment;
  }

  label() {
    let label = null;

    if (this.data) {
      if (this.data.Tags) {
        this.data.Tags.forEach(tag => {
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


} //- class AWSNode


function reset() {
  nodeIndex = [];
}

function keyForNode(type, id) {
  return type + '::' + id;
}

function nodeWithKey(key) {
  let node = nodeIndex[key];
  return node;
}

function findNode(type, id, data, describeFn) {
  // if (type === types.INSTANCE) {
  //   console.log(`****** INSTANCE ${id}, data=`, data);
  // }
  let key = keyForNode(type, id);
  let node = nodeIndex[key];

  if (!node) {
    node = new AWSNode(type, id);
    nodeIndex[key] = node;
  }

  if (data) {
    node.setData(data);
  }

  if (describeFn) {
    console.log(`\n\nWARNING: findNode(${type}) called with describeFn`);
    node.setDescribe(describeFn);
  }

  return node;
}

function dumpAll() {
  console.log('dumpAll'); // console.log('nodeIndex=', nodeIndex);

  for (var key in nodeIndex) {
    console.log(''); // console.log('key: ' + key);

    let node = nodeIndex[key];
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
    let node = nodeIndex[key];
    nodes.push(node);
  }

  return nodes;
}

function nodesByType(type) {
  // console.log('nodesByType(' + type + ')');
  let arr = getNodes().filter(node => node.type === type);
  return sortAlphabetic(arr);
}

function sortAlphabetic(arr) {
  let sorted = arr.sort((a, b) => {
    // Sort by environment first
    let env1 = a.findEnvironment();
    if (!env1) env1 = 'zzzzzzzzzz';
    let env2 = b.findEnvironment();
    if (!env2) env2 = 'zzzzzzzzzz';

    if (env1 < env2) {
      return -1;
    } else if (env1 > env2) {
      return 1;
    } // Sort by name


    if (a.id < b.id) {
      return -1;
    } else if (a.id > b.id) {
      return 1;
    }

    return 0;
  });
  return sorted;
} // function downloadRegion(region, withHealthchecks, callback) {
//   console.log(`graph.downloadRegion(${region}, ${withHealthchecks})`);
//   download.downloadEverything(region, withHealthchecks, callback);
// }

/*
 *  Return a list of environments
 */


function environments() {
  // Get unique environments
  var map = [];
  getNodes().forEach(node => {
    var environment = node.findEnvironment();

    if (environment) {
      map[environment] = environment;
    }
  }); // Create a list

  var list = [];

  for (var key in map) {
    list.push(key);
  } // Sort the list


  list.sort((a, b) => {
    if (a < b) {
      return -1;
    } else if (a > b) {
      return +1;
    } else {
      return 0;
    }
  });
  return list;
} // Constants
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

/***/ "./server/misc/myAWS.js":
/*!******************************!*\
  !*** ./server/misc/myAWS.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const AWS = __webpack_require__(/*! aws-sdk */ "aws-sdk");

const awsRegions = __webpack_require__(/*! aws-regions */ "aws-regions");

const pad = __webpack_require__(/*! ./util */ "./server/misc/util.js").pad;

const INITIAL_REGION = 'ap-northeast-1';
var regions = [];
var currentRegion = INITIAL_REGION; // var currentRegion = null

var awsRegion = null; // Region we are currently looking at

var cloudformation = null;
var ec2 = null;
var elbv2 = null;
var autoscaling = null;
var ecs = null;
var rds = null;

function downloadRegions(callback) {
  console.log('  downloadRegions()');
  ec2.describeRegions({}, (err, data) => {
    if (err) return callback(err);
    regions = data.Regions; // Global variable
    // console.log('regions=', regions);

    regions = regions.sort((r1, r2) => {
      if (r1.RegionName < r2.RegionName) {
        return -1;
      } else if (r1.RegionName > r2.RegionName) {
        return +1;
      }

      return 0;
    });
    return callback(null);
  });
} // Return the name of an AWS regions
// e.g. us-east-1 -> (n-virginia)


function regionDescription(regionCode) {
  // console.log('regionDescription(' + regionCode + ')')
  let region = awsRegions.get(regionCode);

  if (region) {
    // return '(' + region.name + ')'
    return region.name;
  }

  return '';
}

function showRegions() {
  for (let name in awsRegions.regions) {
    let r = awsRegions.regions[name];

    if (r.public) {
      console.log(`${pad(name, 15)}  ${r.code}`);
    }
  }
}

function checkAwsRegion(region) {
  // console.log(`checkAwsRegion(${region})`)
  if (!region) {
    // Default region
    region = INITIAL_REGION;
  } // Perhaps we are asking for a region list
  // console.log('regions = ', awsRegions);


  if (region === '?' || region === 'list' || region === 'unknown') {
    showRegions();
    process.exit(0);
  } // See if a place name is used


  for (var name in awsRegions.regions) {
    if (region.toLowerCase() === name.substring(0, region.length)) {
      region = awsRegions.regions[name].code;
      break;
    }
  } // Check the code.


  let r = awsRegions.get(region);

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

/***/ "./server/misc/util.js":
/*!*****************************!*\
  !*** ./server/misc/util.js ***!
  \*****************************/
/*! no static exports found */
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

/***/ "aws-regions":
/*!******************************!*\
  !*** external "aws-regions" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("aws-regions");

/***/ }),

/***/ "aws-sdk":
/*!**************************!*\
  !*** external "aws-sdk" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("aws-sdk");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),

/***/ "lru-cache":
/*!****************************!*\
  !*** external "lru-cache" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("lru-cache");

/***/ }),

/***/ "nuxt":
/*!***********************!*\
  !*** external "nuxt" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("nuxt");

/***/ })

/******/ });
//# sourceMappingURL=main.map