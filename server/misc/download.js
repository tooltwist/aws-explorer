var myAWS = require('./myAWS')
const graph = require('./graph')
const types = require('../../lib/types')

var loadBalancersAreLoaded = false;
var targetGroupsAreLoaded = false;
var instancesAreLoaded = false;

const debug = false;

function findTargetGroupByARN(arn) {
  // console.log('findTargetGroupByARN(' + arn + ')');
  let all = graph.nodes();
  for (var i = 0; i < all.length; i++) {
    let node = all[i];
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
  let all = graph.nodes();
  for (var i = 0; i < all.length; i++) {
    let node = all[i];

    if (!node) {
      console.log(`Internal error. all[${i}] is null`);
    }
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

async function downloadVpcs() {
  if (debug) console.log('  downloadVpcs()');

return new Promise((resolve, reject) => {

  myAWS.ec2().describeVpcs({}, (err, data) => {
    if (err) return reject(err);

    // console.log('data=', data);
    data.Vpcs.forEach(rec => {
      // console.log('rec=', rec);
      if (!rec) console.log(`ZUMBO 1 Missing rec`);
      
      graph.findNode(types.VPC, rec.VpcId, rec)
    })
    return resolve(null)
  })
})//- Promise
}

async function downloadInstances() {
  if (debug) console.log('  downloadInstances()');

  return new Promise((resolve, reject) => {

  myAWS.ec2().describeInstances({}, (err, data) => {
    if (err) return reject(err);

    // console.log('data=', data);
    data.Reservations.forEach(res => {
      res.Instances.forEach(instance => {
        // console.log(`yarp got an instance`, instance.ImageId);

        // See if it is a jumpbox
        // console.log('instance=', instance);
        instance.Tags.forEach(tag => {
          if (tag.Key === 'Name' && tag.Value.indexOf('-jumpbox-') >= 0) {
            instance._isJumpbox = true
          }
        });

        // Create the node
        let i = graph.findNode(types.INSTANCE, instance.InstanceId, instance)

        // ImageId
        let img = graph.findNode(types.IMAGE, instance.ImageId, null)
        i.addChild(img)

        // Availability zone
        if (instance.Placement && instance.Placement.AvailabilityZone) {
          let az = graph.findNode(types.AZ, instance.Placement.AvailabilityZone)
          az.addChild(i)
        }

        // Remember if it has a public IP
        if (instance.PublicIpAddress) {
          let ip = graph.findNode(types.PUBLICIP, instance.PublicIpAddress)
          ip.addChild(i)
        }

        // Subnet
        //ZZZ Can an instance have multiple subnets?
        let sn = graph.findNode(types.SUBNET, instance.SubnetId)
        sn.addChild(i)

        // VPC
        if (!instance) console.log(`WUMBO 2 - missing instance`);

        let vpc = graph.findNode(types.VPC, instance.VpcId)
        vpc.addChild(i)

        // Security groups
        instance.SecurityGroups.forEach(sg => {
          let g = graph.findNode(types.SECGRP, sg.GroupId)
          g.addChild(i)
          i.addChild(g)
        })
      })
    })
    instancesAreLoaded = true;
    return resolve(null)
  })

})//- Promise
}

async function downloadSubnets() {
  if (debug) console.log('  downloadSubnets()');

  // let describe = types.describe
  return new Promise((resolve, reject) => {

  myAWS.ec2().describeSubnets({}, (err, data) => {
    if (err) return reject(err);

    // console.log('data=', data);
    data.Subnets.forEach(rec => {
      let sn = graph.findNode(types.SUBNET, rec.SubnetId, rec)

      // Add this to it's VPC
      if (!rec) console.log(`ZUMBO 2 Missing rec`);
      let v = graph.findNode(types.VPC, rec.VpcId, null)
      v.addChild(sn)

      // Add this to it's AvailabilityZone
      let az = graph.findNode(types.AZ, rec.AvailabilityZone, null)
      az.addChild(sn)
    })
    return resolve(null)
  })

})//- Promise

}

async function downloadSecurityGroups() {
  if (debug) console.log('  downloadSecurityGroups()');
  // let describe = node => {
  //   let desc = ''
  //   desc += '  Name: ' + node.data.GroupName + '\n'
  //   desc += '  Description: ' + node.data.Description + '\n'
  //   return desc
  // }
return new Promise((resolve, reject) => {

  myAWS.ec2().describeSecurityGroups({}, (err, data) => {
    if (err) return reject(err);
    data.SecurityGroups.forEach(grp => {
      // console.log('grp=', grp);
      let g = graph.findNode(types.SECGRP, grp.GroupId, grp)

      // Add this to it's VPC
      if (!grp) console.log(`ZUMBO 3 Missing grp`);
      let v = graph.findNode(types.VPC, grp.VpcId, null)
      v.addChild(g)
    })

    // Add links between the security groups
    let groups = graph.nodes().filter(node => (node.type === types.SECGRP))
    // console.log(`secgrp yarp 5`, groups);
    groups.forEach(grp => {
      // console.log(`secgrp yarp 6 ${grp.id}`, JSON.stringify(grp.data, '', 2));
      if (grp.data.IpPermissions) {
        grp.data.IpPermissions.forEach(perm => {
          perm.UserIdGroupPairs.forEach(pair => {
            // console.log(`Security group ${grp.data.GroupId} <- ${pair.GroupId}`);
            const from = graph.findNode(types.SECGRP, pair.GroupId, null)
            // console.log(`   ${grp.data.GroupName} <- ${from.data.GroupName}`);
            // console.log(`GRP=`, grp);
            // console.log(`     (${from.data.GroupName})`);
            // grp.addChild(from)
            // console.log(`------------------------------------------`);
            // console.log(`  before ${grp.id}.children=`, grp.children);
            // console.log(`  before ${grp.id}.parents=`, grp.parents);
            // console.log(`  before ${from.id}.children=`, from.children);
            // console.log(`  before ${from.id}.parents=`, from.parents);
            from.addChild(grp)
            // console.log(`  after ${grp.id}.children=`, grp.children);
            // console.log(`  after ${grp.id}.parents=`, grp.parents);
            // console.log(`  after ${from.id}.children=`, from.children);
            // console.log(`  after ${from.id}.parents=`, from.parents);
          })
        })
      }
    })

    return resolve(null)
  })
})
}

async function downloadNatGateways() {
  if (debug) console.log('  downloadNatGateways()');
  // let describe = node => {
  //   let desc = ''
  //   desc += '  State: ' + node.data.State + '\n';
  //   return desc
  // }
  return new Promise((resolve, reject) => {

  myAWS.ec2().describeNatGateways({}, (err, data) => {
    if (err) return reject(err);

    // console.log('data=', data);
    data.NatGateways.forEach(grp => {
      // console.log('nat is ' + grp.NatGatewayId);
      let g = graph.findNode(types.NAT, grp.NatGatewayId, grp)

      if (grp.State !== 'deleted') {
        // Add this to it's subnet
        let sn = graph.findNode(types.SUBNET, grp.SubnetId, null)
        sn.addChild(g)

        // Add this to it's VPC
        if (!grp) console.log(`ZUMBO 4 Missing grp`);
        let v = graph.findNode(types.VPC, grp.VpcId, null)
        v.addChild(g)

        // Add it's public IPs
        grp.NatGatewayAddresses.forEach(addr => {
          if (addr.NetworkInterfaceId) {
            let iface = graph.findNode(types.NETIFACE, addr.NetworkInterfaceId, null)
            g.addChild(iface)
          }
          if (addr.PublicIp) {
            let ip = graph.findNode(types.PUBLICIP, addr.PublicIp, null)
            g.addChild(ip)
          }
        })
      }
    })
    return resolve(null)
  })

})//- Promise
}

async function downloadInternetGateways() {
  if (debug) console.log('  downloadInternetGateways()');
  // let describe = node => {
  //   let desc = ''
  //   let name = node.findTag('Name')
  //   if (name) {
  //     desc += '  Name: ' + name + '\n'
  //   }
  //   return desc
  // }
  return new Promise((resolve, reject) => {


  // An Internet Gateway provides the means by which the stuff in the
  // VPC connects to the Internet. I believe a NAT will quietly use
  // the Internet Gateway, but doesn't actually reference it.
  myAWS.ec2().describeInternetGateways({}, (err, data) => {
    if (err) return reject(err);

    data.InternetGateways.forEach(rec => {
      // console.log('\n\n\nINTERNET GATEWAY=', rec)
      let igw = graph.findNode(types.IGW, rec.InternetGatewayId, rec)

      // See where it is attached
      rec.Attachments.forEach(attachment => {
        if (!attachment) console.log(`ZUMBO 5 Missing attachment`);
        if (attachment.VpcId) {
          let vpc = graph.findNode(types.VPC, attachment.VpcId)
          vpc.addChild(igw)
        }
      })
    })
    return resolve(null)
  })
})//- Promise
}

// Elastic IPs
async function downloadAddresses() {
  if (debug) console.log('  downloadAddresses()');
  // let describe = node => {
  //   // Return a description
  //   let desc = ''
  //   desc += '  IP Address: ' + node.data.PublicIp + '\n';
  //   return desc
  // }
  return new Promise((resolve, reject) => {


  myAWS.ec2().describeAddresses({}, (err, data) => {
    if (err) return reject(err);

    // console.log('data=', data);
    data.Addresses.forEach(rec => {
      let addr = graph.findNode(types.ADDR, rec.AllocationId, rec)

      // Remember if it has a public IP
      if (rec.PublicIp) {
        let ip = graph.findNode(types.PUBLICIP, rec.PublicIp)
        ip.addChild(addr)
      }
    })
    return resolve(null)
  })
})//- Promise
}

async function downloadAvailabilityZones() {
  if (debug) console.log('  downloadAvailabilityZones()');
  // let describe = node => {
  //   let desc = ''
  //   // desc += '  IP Address: ' + node.data.PublicIp + '\n';
  //   return desc
  // }
  return new Promise((resolve, reject) => {


  myAWS.ec2().describeAvailabilityZones({}, (err, data) => {
    if (err) return reject(err);

    // console.log('data=', data);
    data.AvailabilityZones.forEach(rec => {
      let g = graph.findNode(types.AZ, rec.ZoneName, rec)
    })
    return resolve(null)
  })
})//- Promise
}

async function downloadKeyPairs() {
  if (debug) console.log('  downloadKeyPairs()');
  // let describe = node => {
  //   let desc = ''
  //   return desc
  // }
  return new Promise((resolve, reject) => {


  myAWS.ec2().describeKeyPairs({}, (err, data) => {
    if (err) return reject(err);

    // console.log('data=', data);
    data.KeyPairs.forEach(rec => {
      // This will create the node
      graph.findNode(types.KEYPAIR, rec.KeyName, rec)
    })
    return resolve(null)
  })
})//- Promise
}

// Inbound interface from the Internet
async function downloadNetworkInterfaces() {
  if (debug) console.log('  downloadNetworkInterfaces()');
  // let describe = node => {
  //   let desc = ''
  //   desc += node.data.Description
  //   return desc
  // }
  return new Promise((resolve, reject) => {


  myAWS.ec2().describeNetworkInterfaces({}, (err, data) => {
    if (err) return reject(err);

    // console.log('data=', data);
    data.NetworkInterfaces.forEach(rec => {
      // console.log('\nNETWORK INTERFACE:', rec);
      let ni = graph.findNode(types.NETIFACE, rec.NetworkInterfaceId, rec)

      // Public IP via association
      if (rec.Association && rec.Association.PublicIp) {
        let ip = graph.findNode(types.PUBLICIP, rec.Association.PublicIp)
        ip.addChild(ni)
      }

      // Attachment
      if (rec.Attachment) {
        if (rec.Attachment.InstanceId) {
          let instance = graph.findNode(types.INSTANCE, rec.Attachment.InstanceId)
          ni.addChild(instance)
        }
      }

      // AvailabilityZone
      let az = graph.findNode(types.AZ, rec.AvailabilityZone)
      az.addChild(ni)

      // Subnet
      let subnet = graph.findNode(types.SUBNET, rec.SubnetId)
      subnet.addChild(ni)

      // VPC
      if (!rec) console.log(`ZUMBO 6 Missing rec`);
      let vpc = graph.findNode(types.VPC, rec.VpcId)
      vpc.addChild(ni)
    })
    return resolve(null)
  })
})//- Promise
}

async function downloadRouteTables() {
  if (debug) console.log('  downloadRouteTables()');

  return new Promise((resolve, reject) => {


  myAWS.ec2().describeRouteTables({}, (err, data) => {
    if (err) return reject(err);

    // console.log('routeTables=', data);
    data.RouteTables.forEach(rec => {
      // console.log('\nRoute table:', rec);
      let rt = graph.findNode(types.ROUTETABLE, rec.RouteTableId, rec)

      // Look for routes to Internet Gateways
      let gateways = [] // Only add each gateway it once
      rec.Routes.forEach(route => {
        if (route.GatewayId === 'local') {
          // Routing to the local subnet
        } else if (route.NatGatewayId) {
          // Routes to a NAT
          let id = route.NatGatewayId
          if (!gateways[id]) {
            let nat = graph.findNode(types.NAT, id)
            rt.addChild(nat)
            // Having a route to the internet via a NAT is the definition of a "Public Subnet"
            rt.hasPublicRoutes = true
            gateways[id] = true
          }
        } else if (route.GatewayId) {
          // Routes to an Internet Gateway
          let id = route.GatewayId
          if (!gateways[id]) {
            let igw = graph.findNode(types.IGW, id)
            rt.addChild(igw)
            // // Having a route to an Internet Gateway is also the definition of a "Public Subnet"
            // rt.hasPublicRoutes = true
            gateways[id] = true
          }
        }
      })

      // Subnets mapped to this routing table
      rec.Associations.forEach(assoc => {
        if (assoc.SubnetId) {
          let sn = graph.findNode(types.SUBNET, assoc.SubnetId)
          rt.addChild(sn)
        }
      })

      // VPC
      if (!rec) console.log(`ZUMBO 7 Missing rec`);
      let vpc = graph.findNode(types.VPC, rec.VpcId)
      vpc.addChild(rt)
    })
    return resolve(null)
  })
})//- Promise

}

function describeTargets(targetGroup, withHealthchecks) {
  let desc = ''
  if (withHealthchecks) {
    if (targetGroup._health && targetGroup._health.length > 0) {
      targetGroup._health.forEach(health => {
        // console.log('health=', health);
        let key = graph.keyForNode(types.INSTANCE, health.Target.Id)
        desc += '    -->> Instance '
        desc += '<a href="?node=' + key + '">' + health.Target.Id + '</a>'
        desc += ', port ' + health.Target.Port + '   (' + health.TargetHealth.State + ')\n'
      })
    } else {
      desc += '    No targets\n'
    }
  } else {
    desc += 'Unknown targets (--skip-healthchecks is set)\n'
  }
  return desc
}

async function downloadLoadBalancers(withHealthchecks) {
  if (debug) console.log('  downloadLoadBalancers()');

  return new Promise((resolve, reject) => {

  if (!targetGroupsAreLoaded) {
    console.log('ERROR: downloadLoadBalancers() called before downloadTargetGroups()');
    console.log('Links between load balancers and target groups will be missing.');
  }

  // We load the Load Balancers here (into nodeIndex),
  // and Listeners into
  //    => load-balancer-node._listeners,
  // and the target group for each Listener into
  //    => load-balancer-node._listeners[x]._targetGroupNode
  // and the targets and their health into
  //    => load-balancer-node._listeners[x]._targetGroupNode._health
  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELBv2.html#describeLoadBalancers-property
  myAWS.elbv2().describeLoadBalancers({}, (err, data) => {
    if (err) return reject(err);
    // console.log('data=', data);

    (function nextALB(index) {
      if (index >= data.LoadBalancers.length) {
        loadBalancersAreLoaded = true;
        return resolve(null)
      }
      let rec = data.LoadBalancers[index]
      if (!rec) console.log(`WUMBO 5 - unknown load balancer`);

      let alb = graph.findNode(types.ALB, rec.LoadBalancerName, rec)

      // Availability Zones and Subnets
      rec.AvailabilityZones.forEach(az => {
        let az2 = graph.findNode(types.AZ, az.ZoneName)
        az2.addChild(alb)

        let subnet = graph.findNode(types.SUBNET, az.SubnetId)
        subnet.addChild(alb)
      })

      // Security Groups
      rec.SecurityGroups.forEach(sgid => {
        let sg = graph.findNode(types.SECGRP, sgid)
        sg.addChild(alb)
      })

      // VPC
      if (!rec) console.log(`ZUMBO 8 Missing rec`);
      let vpc = graph.findNode(types.VPC, rec.VpcId)
      vpc.addChild(alb)

      // Get the listeners for this load Balancer
      // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELBv2.html#describeListeners-property
      myAWS.elbv2().describeListeners({
        LoadBalancerArn: rec.LoadBalancerArn
      }, (err, data) => {
        if (err) return reject(err);

        // console.log('listener data=', data);
        alb._listeners = data.Listeners;
        // return callback(null)

        // Iterate through the listeners
        (function nextListener(listenerIndex) {
          if (listenerIndex >= data.Listeners.length) {
            return nextALB(index + 1)
          }
          let listener = data.Listeners[listenerIndex]
          // console.log('\n\nLISTENER=', listener);

          // The listener contains 'DefaultActions', which will be
          // the ARN of a target group to forward to.
          listener.DefaultActions.forEach(action => {

            // Find the Target Group for this Action
            let targetGroup = findTargetGroupByARN(action.TargetGroupArn)
            if (!targetGroup) {
              // No target group, so ignore this listener
              //ZZZZ Should check the default target group
              return nextListener(listenerIndex + 1);
            }
            listener._targetGroupNode = targetGroup
            alb.addChild(targetGroup)

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
            }, (err, healthData) => {
              if (err) return reject(err);
              listener._targetGroupNode._health = healthData.TargetHealthDescriptions
              // console.log('target health=', healthData);
              healthData.TargetHealthDescriptions.forEach(health => {
                // Instance
                // console.log('health=', health);
                let instance = graph.findNode(types.INSTANCE, health.Target.Id)
                alb.addChild(instance)
              }) //- next health
              return nextListener(listenerIndex + 1);
            }) //- describeTargetHealth
          }) //- next action
        })(0) //- next listener
      }) //- describeListeners
    })(0) //- nextALB
  }) //- describeLoadBalancers
})//- Promise
}

async function downloadTargetGroups(withHealthchecks) {
  if (debug) console.log('  downloadTargetGroups()');

  return new Promise((resolve, reject) => {

  // Load the definitions
  myAWS.elbv2().describeTargetGroups({}, (err, data) => {
    if (err) return reject(err);

    // console.log('data=', data);
    data.TargetGroups.forEach(rec => {
      // console.log('tg=', rec);
      let tg = graph.findNode(types.TARGETGRP, rec.TargetGroupName, rec)

      // VPC
      if (!rec) console.log(`ZUMBO 9 Missing rec`);
      let vpc = graph.findNode(types.VPC, rec.VpcId)
      vpc.addChild(tg)
    })
    targetGroupsAreLoaded = true;
    return resolve(null)
  })
})//- Promise

}

/*
*   Get the container instances for a cluster.
*/
function loadContainerInstancesForCluster(cluster, callback/* (err, instanceForContainer) */) {
  let clusterName = cluster.data.clusterName;
  if (debug) console.log(`  - getting list of container instances (cluster=${clusterName})`);
  let instanceForContainer = [ ]; // containerInstanceArn -> node of EC2 instance
  myAWS.ecs().listContainerInstances({
    cluster: clusterName
  }, function(err, containerInstanceList) {
    if (err) return callback(err);
    if (containerInstanceList.containerInstanceArns.length == 0) {
      return callback(null, instanceForContainer);
    }
    var params = {
      cluster: clusterName,
      containerInstances: containerInstanceList.containerInstanceArns
    };
    if (debug) console.log(`  - getting container instance details (cluster=${clusterName}, ${containerInstanceList.containerInstanceArns.length} container instances)`);
    myAWS.ecs().describeContainerInstances(params, function(err, containerDefinitions) {
      if (err) return callback(err);

      // Add the container instances to our graph
      // console.log(`containerDefinitions=`, containerDefinitions);
      containerDefinitions.containerInstances.forEach(function(containerDef) {
        let instance = findInstanceById(containerDef.ec2InstanceId)
        cluster.addChild(instance);

        // Remember this, so we can create a link between tasks and this EC2 instance
        instanceForContainer[containerDef.containerInstanceArn] = instance;
      }); // next containerInstance
      return callback(null, instanceForContainer);
    });//- describeContainerInstances
  });//- listContainerInstances
};//- function loadContainerInstancesForCluster()

/*
*   Get the services for this cluster.
*
*   https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ECS.html#describeServices-property
*/
function loadServicesForCluster(cluster, callback/* (err) */) {
  if (debug) console.log(`  - getting list of services for cluster ${cluster.data.clusterName}`);

  let clusterName = cluster.data.clusterName;
  let clusterArn = cluster.data.clusterArn;
  myAWS.ecs().listServices({
    cluster: clusterName
  }, function(err, serviceListData) {
    if (err) return callback(err);
    if (serviceListData.serviceArns.length === 0) {
      return callback(null)
    }
    if (debug) console.log('  - getting service details');
    myAWS.ecs().describeServices({
      services: serviceListData.serviceArns,
      cluster: clusterArn
    }, function(err, serviceDefinitions) {
      if (err) return callback(err);

      // console.log('serviceDefinitions=', serviceDefinitions);
      // console.log(`Got services`);
      serviceDefinitions.services.forEach(serviceDef => {

        // Next Service
        // console.log('serviceDef=', serviceDef);
        let service = graph.findNode(types.SERVICE, serviceDef.serviceName, serviceDef)
        cluster.addChild(service);

        // Find the load balancer nodes for this service.
        serviceDef.loadBalancers.forEach(lb => {
          let tg = findTargetGroupByARN(lb.targetGroupArn);
          if (tg) {
            tg.addChild(service);
            // service.addChild(tg);
          } else {
            console.log(`ERROR: Service ${service.key} refers to unknown target group ${lb.targetGroupArn}`);
          }
        }); //- next load balancer
      }); //- next service
      return callback(null);
    }); //- describeServices
  }); //- listServices
}//- loadServicesForCluster

/*
*   Get the task definitions for a cluster.
*/
function loadTasksForCluster(clusterName, callback/* (err,taskDefinitions) */) {
  if (debug) console.log(`  - getting list of tasks (cluster=${clusterName})`);
  myAWS.ecs().listTasks({
    cluster: clusterName
  }, function(err, taskList) {
    if (err) return callback(err);
    // console.log('taskList=', taskList); // successful response
    if (taskList.taskArns.length === 0) {
      return callback(null, [ ]); // No tasks
    }
    var params = {
      tasks: taskList.taskArns,
      cluster: clusterName
    };
    if (debug) console.log('- getting task details');
    myAWS.ecs().describeTasks(params, function(err, taskDefinitions) {
      if (err) return callback(err);

      // Have the task definitions
      return callback(null, taskDefinitions.tasks);
    }); //- describeTasks
  }); //- listTasks
}

async function downloadClusters() {
  if (debug) console.log('  downloadClusters()');

  return new Promise(async (resolve, reject) => {
  // Check the load balancers have been loaded already,
  // as we'll need to link to them from ECS services.
  if (!targetGroupsAreLoaded) {
    if (debug) console.log(`- downloadClusters requires targetGroups`);
    await downloadTargetGroups()
  }
  if (!loadBalancersAreLoaded) {
    if (debug) console.log(`- downloadClusters requires loadBalancers`);
    await downloadLoadBalancers()
  }
  if (!instancesAreLoaded) {
    if (debug) console.log(`- downloadClusters requires instances`);
    await downloadInstances()
  }

  let describe = (node) => {
    let desc = ''
    let name = node.findTag('Name');
    if (name) {
      desc += '  Name: ' + name + '\n'
    }
    return desc
  }

  /*
  *   Get the clusters for this region.
  *
  *   See https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ECS.html#listClusters-property
  */
  if (debug) console.log('  - getting list of clusters');
  myAWS.ecs().listClusters({ }, function(err, clusterList) {
    if (err) return reject(err);
    if (debug) console.log('  - getting cluster details');
    myAWS.ecs().describeClusters({
      clusters: clusterList.clusterArns
    }, function(err, clusterDefinitions) {
      if (err) return reject(err);

      // console.log('clusterDefinitions: ', clusterDefinitions);
      // return resolve(null)

      // Loop through the clusters.
      (function nextCluster(index) {
        // Past the last cluster?
        if (index >= clusterDefinitions.clusters.length) {
          return resolve(null)
        }

        // Next Cluster
        let clusterDef = clusterDefinitions.clusters[index]
        let cluster = graph.findNode(types.CLUSTER, clusterDef.clusterName, clusterDef)
        // console.log('Got cluster ' + clusterDef.clusterName);
        // console.log('Got cluster ' + cluster);


        /*
        *   Get the container instances for this cluster.
        */
        loadContainerInstancesForCluster(cluster, (err, instanceForContainer) => {
          if (err) return reject(err);

            loadServicesForCluster(cluster, (err) => {
              if (err) return reject(err);

                loadTasksForCluster(clusterDef.clusterName, (err, taskDefinitions) => {
                  if (err) return reject(err);

                    // Loop through the task definitions.
                    // console.log(`taskDefinitions=`, taskDefinitions);
                    taskDefinitions.forEach(taskDef => {
                      // console.log(`Task ${taskDef.taskDefinitionArn}`);
                      // console.log(`  startedBy:`, taskDef.startedBy);
                      // console.log(`  Containers:`, taskDef.containers);
                      // console.log(`  Last status ${taskDef.lastStatus}`);

                      // Get the task name from it's definition. For example, the end of:
                      // 'arn:aws:ecs:ap-southeast-1:238285074004:task-definition/nbt-trsgms1-authservice:6'
                      let pos = taskDef.taskDefinitionArn.lastIndexOf('/')
                      let taskName = taskDef.taskDefinitionArn.substring(pos + 1)
                      pos = taskName.lastIndexOf(':');
                      taskName = taskName.substring(0, pos)
                      // console.log(`task name is ${taskName}`);

                      // See if it was started by a service
                      // console.log('Looking for service parent');
                      let parentOfTask = cluster;
                      if (taskDef.startedBy) {
                        // console.log('checking services');
                        cluster.children.forEach(function(childKey) {
                          let child = graph.nodeWithKey(childKey);
                          if (!child) {
                            console.log(`Unknown cluster child ${childKey}`);
                          }
                          if (child && child.type === types.SERVICE) {
                            let service = child;
                            let deployments = service.data.deployments;
                            for (var cnt = 0; cnt < deployments.length; cnt++) {
                              if (deployments[cnt].id === taskDef.startedBy) {
                                // Yep, was started by this service.
                                // console.log('\n\nWas started by ', service);
                                parentOfTask = service;
                                break;
                              }
                            }//- next deployment
                          }//- child is a service
                        })// next child of the cluster
                      }//- startedBy != null

                      // Define the task, and add it to it's parent.
                      let task = graph.findNode(types.TASK, taskName, taskDef);
                      parentOfTask.addChild(task);

                      // Link the task to the containerInstance's EC2 instance.
                      let instance = instanceForContainer[taskDef.containerInstanceArn];
                      if (instance) {
                        task.addChild(instance);
                      } else {
                        console.log(`ERROR: task ${taskDef.taskArn} refers to unknown containerInstance ${taskDef.containerInstanceArn}`);
                      }

                    }); //- next task

                    return nextCluster(index + 1)
                }); //- loadTasksForCluster
            }); //- loadServicesForCluster
        }); //- loadContainerInstancesForCluster
      })(0); // next cluster
    }); //- describeClusters
  }); //- listClusters

})//- Promise

}

// // Get the services and tasks for clusters
// async function downloadClusterDetails() {
//   if (debug) console.log('  downloadClusterDetails()');

//   let clusters = graph.nodes().filter(node => (node.type === types.CLUSTER))

//   // Loop through the clusters.
//   (function nextCluster(index) {
//     // Past the last cluster?
//     if (index >= clusters.length) {
//       return resolve(null)
//     }

//     // Next Cluster
//     let clusterDef = clusterDefinitions.clusters[index]
//     let cluster = graph.findNode(types.CLUSTER, clusterDef.clusterName, clusterDef)
//     // console.log('Got cluster ' + clusterDef.clusterName);

//     /*
//     *   Get the container instances for this cluster.
//     */
//     loadContainerInstancesForCluster(cluster, (err, instanceForContainer) => {
//       if (err) return reject(err);

//         loadServicesForCluster(cluster, (err) => {
//           if (err) return reject(err);

//             loadTasksForCluster(clusterDef.clusterName, (err, taskDefinitions) => {
//               if (err) return reject(err);

//                 // Loop through the task definitions.
//                 // console.log(`taskDefinitions=`, taskDefinitions);
//                 taskDefinitions.forEach(taskDef => {
//                   // console.log(`Task ${taskDef.taskDefinitionArn}`);
//                   // console.log(`  startedBy:`, taskDef.startedBy);
//                   // console.log(`  Containers:`, taskDef.containers);
//                   // console.log(`  Last status ${taskDef.lastStatus}`);

//                   // Get the task name from it's definition. For example, the end of:
//                   // 'arn:aws:ecs:ap-southeast-1:238285074004:task-definition/nbt-trsgms1-authservice:6'
//                   let pos = taskDef.taskDefinitionArn.lastIndexOf('/')
//                   let taskName = taskDef.taskDefinitionArn.substring(pos + 1)
//                   pos = taskName.lastIndexOf(':');
//                   taskName = taskName.substring(0, pos)
//                   // console.log(`task name is ${taskName}`);

//                   // See if it was started by a service
//                   // console.log('Looking for service parent');
//                   let parentOfTask = cluster;
//                   if (taskDef.startedBy) {
//                     // console.log('checking services');
//                     cluster.children.forEach(function(childKey) {
//                       let child = graph.nodeWithKey(childKey);
//                       if (!child) {
//                         console.log(`Unknown cluster child ${childKey}`);
//                       }
//                       if (child && child.type === types.SERVICE) {
//                         let service = child;
//                         let deployments = service.data.deployments;
//                         for (var cnt = 0; cnt < deployments.length; cnt++) {
//                           if (deployments[cnt].id === taskDef.startedBy) {
//                             // Yep, was started by this service.
//                             // console.log('\n\nWas started by ', service);
//                             parentOfTask = service;
//                             break;
//                           }
//                         }//- next deployment
//                       }//- child is a service
//                     })// next child of the cluster
//                   }//- startedBy != null

//                   // Define the task, and add it to it's parent.
//                   let task = graph.findNode(types.TASK, taskName, taskDef);
//                   parentOfTask.addChild(task);

//                   // Link the task to the containerInstance's EC2 instance.
//                   let instance = instanceForContainer[taskDef.containerInstanceArn];
//                   if (instance) {
//                     task.addChild(instance);
//                   } else {
//                     console.log(`ERROR: task ${taskDef.taskArn} refers to unknown containerInstance ${taskDef.containerInstanceArn}`);
//                   }

//                 }); //- next task

//                 return nextCluster(index + 1)
//             }); //- loadTasksForCluster
//         }); //- loadServicesForCluster
//     }); //- loadContainerInstancesForCluster
//   })(0); // next cluster

// }//- downloadClusterDetails

async function downloadDatabases() {
  if (debug) console.log('  downloadDatabases()');

  return new Promise((resolve, reject) => {

  // Load the definitions
  myAWS.rds().describeDBInstances({}, (err, data) => {
    if (err) return reject(err);

    //console.log('data=', data);
    data.DBInstances.forEach(rec => {
      // console.log('\n\n\nDB =>', rec);
      let db = graph.findNode(types.DATABASE, rec.DBInstanceIdentifier, rec)

      rec.VpcSecurityGroups.forEach(sgDef => {
        let sg = graph.findNode(types.SECGRP, sgDef.VpcSecurityGroupId)
        sg.addChild(db)
      })
      let az = graph.findNode(types.AZ, rec.AvailabilityZone)
      az.addChild(db)

      // VPC
      // let vpc = graph.findNode(types.VPC, rec.VpcId)
      // vpc.addChild(tg)
    })
    targetGroupsAreLoaded = true;
    return resolve(null)
  })
})//- Promise
}

// See http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeSubnets-property
async function downloadEverything(region, withHealthchecks) {
  console.log('downloadEverything()');
  console.log(`Region is ${region} (${myAWS.regionDescription(region)})`);

  myAWS.checkAwsRegion(region)

  await myAWS.downloadRegions()

  // Clear existing list of nodes and reload everything
  graph.reset();
  await downloadSecurityGroups()
  await downloadVpcs()
  await downloadSubnets()
  await downloadNatGateways()
  await downloadInternetGateways()
  await downloadInstances()
  await downloadAddresses()
  await downloadAvailabilityZones()
  await downloadKeyPairs()
  await downloadNetworkInterfaces()
  await downloadRouteTables()
  await downloadTargetGroups(withHealthchecks)
  await downloadLoadBalancers(withHealthchecks)
  await downloadClusters()
  await downloadDatabases()
  if (debug) console.log('finished downloading everything');
  return null
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
module.exports.downloadSecurityGroups = downloadSecurityGroups;
module.exports.downloadEverything = downloadEverything;
module.exports.findInstanceById = findInstanceById;
