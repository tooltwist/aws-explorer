var myAWS = require('./myAWS')
const graph = require('./graph')
const instances = require('./instances')

var loadBalancersAreLoaded = false;
var targetGroupsAreLoaded = false;
var instancesAreLoaded = false;

const debug = false;

function findTargetGroupByARN(arn) {
  // console.log('findTargetGroupByARN(' + arn + ')');
  let all = graph.nodes();
  for (var i = 0; i < all.length; i++) {
    let node = all[i];
    // if (node.type === graph.TARGETGRP) {
    //   console.log('  tg: ', node.data.TargetGroupArn);
    // }
    if (node.type === graph.TARGETGRP && node.data.TargetGroupArn === arn) {
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
    // if (node.type === graph.INSTANCE) {
    //   console.log('  instance: ', node.data.InstanceId);
    // }
    if ((node.type === graph.INSTANCE || node.type === graph.JUMPBOX) && node.data.InstanceId === id) {
      // console.log('FOUND THE INSTANCE!');
      return node;
    }
  }
  return null;
}

function downloadVpcs(callback) {
  if (debug) console.log('  downloadVpcs()');
  let describe = (node) => {
    let desc = ''
    let name = node.findTag('Name');
    if (name) {
      desc += '  Name: ' + name + '\n'
    }
    return desc
  }

  myAWS.ec2().describeVpcs({}, (err, data) => {
    if (err) return callback(err);

    // console.log('data=', data);
    data.Vpcs.forEach(rec => {
      // console.log('rec=', rec);
      graph.findNode(graph.VPC, rec.VpcId, rec, describe)
    })
    return callback(null)
  })
}

function downloadInstances(callback) {
  if (debug) console.log('  downloadInstances()');
  let describe = node => {
    let desc = ''
    let name = node.findTag('Name')
    if (name) {
      desc += '  Name: ' + name + '\n';
    }
    return desc
  }

  myAWS.ec2().describeInstances({}, (err, data) => {
    if (err) return callback(err);

    // console.log('data=', data);
    data.Reservations.forEach(res => {
      res.Instances.forEach(instance => {

        // See if it is a jumpbox
        // console.log('instance=', instance);
        let type = graph.INSTANCE;
        instance.Tags.forEach(tag => {
          if (tag.Key === 'Name' && tag.Value.indexOf('-jumpbox-') >= 0) {
            type = graph.JUMPBOX;
          }
        });
        let i = graph.findNode(type, instance.InstanceId, instance, describe)

        // ImageId
        let img = graph.findNode(graph.IMAGE, instance.ImageId, null)
        img.addChild(i)

        // Availability zone
        if (instance.Placement && instance.Placement.AvailabilityZone) {
          let az = graph.findNode(graph.AZ, instance.Placement.AvailabilityZone, null, node => {
            // Return a description
            let desc = 'Availability Zone (' + node.id + ')\n'
            return desc
          })
          az.addChild(i)
        }

        // Remember if it has a public IP
        if (instance.PublicIpAddress) {
          let ip = graph.findNode(graph.PUBLICIP, instance.PublicIpAddress)
          ip.addChild(i)
        }

        // Subnet
        //ZZZ Can an instance have multiple subnets?
        let sn = graph.findNode(graph.SUBNET, instance.SubnetId)
        sn.addChild(i)

        // VPC
        let vpc = graph.findNode(graph.VPC, instance.VpcId)
        vpc.addChild(i)

        // Security groups
        instance.SecurityGroups.forEach(sg => {
          let g = graph.findNode(graph.SECGRP, sg.GroupId)
          g.addChild(i)
          i.addChild(g)
        })
      })
    })
    instancesAreLoaded = true;
    return callback(null)
  })
}

function downloadSubnets(callback) {
  if (debug) console.log('  downloadSubnets()');
  let describe = node => {
    // Return a description
    let desc = ''

    // See if the subnet's routing table connects to an Internet Gateway
    let isPublicSubnet = false
    node.parents.forEach(parent => {
      if (parent.type === graph.ROUTETABLE && parent.hasPublicRoutes) {
        isPublicSubnet = true
      }
    })
    if (isPublicSubnet) {
      desc += 'PUBLIC SUBNET'
    }

    let name = node.findTag('Name')
    if (name) {
      desc += '\nName: ' + name
    }

    // Route table?
    let useVpcRouteTable = true
    node.parents.forEach(parent => {
      if (parent.type === graph.ROUTETABLE) {
        useVpcRouteTable = false
      }
    })
    if (useVpcRouteTable) {
      desc += '\nUse default route table for VPC'
    }
    // IP Address range
    desc += '\nCidrBlock: ' + node.data.CidrBlock
    return desc
  }

  myAWS.ec2().describeSubnets({}, (err, data) => {
    if (err) return callback(err);

    // console.log('data=', data);
    data.Subnets.forEach(rec => {
      let sn = graph.findNode(graph.SUBNET, rec.SubnetId, rec, describe)

      // Add this to it's VPC
      let v = graph.findNode(graph.VPC, rec.VpcId, null)
      v.addChild(sn)

      // Add this to it's AvailabilityZone
      let az = graph.findNode(graph.AZ, rec.AvailabilityZone, null)
      az.addChild(sn)
    })
    return callback(null)
  })
}

function downloadSecurityGroups(callback) {
  if (debug) console.log('  downloadSecurityGroups()');
  let describe = node => {
    let desc = ''
    desc += '  Name: ' + node.data.GroupName + '\n'
    desc += '  Description: ' + node.data.Description + '\n'
    return desc
  }

  myAWS.ec2().describeSecurityGroups({}, (err, data) => {
    if (err) return callback(err);
    data.SecurityGroups.forEach(grp => {
      // console.log('grp=', grp);
      let g = graph.findNode(graph.SECGRP, grp.GroupId, grp, describe)

      // Add this to it's VPC
      let v = graph.findNode(graph.VPC, grp.VpcId, null)
      v.addChild(g)
    })
    return callback(null)
  })
}

function downloadNatGateways(callback) {
  if (debug) console.log('  downloadNatGateways()');
  let describe = node => {
    let desc = ''
    desc += '  State: ' + node.data.State + '\n';
    return desc
  }

  myAWS.ec2().describeNatGateways({}, (err, data) => {
    if (err) return callback(err);

    // console.log('data=', data);
    data.NatGateways.forEach(grp => {
      let g = graph.findNode(graph.NAT, grp.NatGatewayId, grp, describe)

      if (grp.State !== 'deleted') {
        // Add this to it's subnet
        let sn = graph.findNode(graph.SUBNET, grp.SubnetId, null)
        sn.addChild(g)

        // Add this to it's VPC
        let v = graph.findNode(graph.VPC, grp.VpcId, null)
        v.addChild(g)
      }
    })
    return callback(null)
  })
}

function downloadInternetGateways(callback) {
  if (debug) console.log('  downloadInternetGateways()');
  let describe = node => {
    let desc = ''
    let name = node.findTag('Name')
    if (name) {
      desc += '  Name: ' + name + '\n'
    }
    return desc
  }

  myAWS.ec2().describeInternetGateways({}, (err, data) => {
    if (err) return callback(err);

    // console.log('data=', data);
    data.InternetGateways.forEach(rec => {
      let igw = graph.findNode(graph.IGW, rec.InternetGatewayId, rec, describe)

      // See where it is attached
      rec.Attachments.forEach(attachment => {
        if (attachment.VpcId) {
          let vpc = graph.findNode(graph.VPC, attachment.VpcId)
          vpc.addChild(igw)
        }
      })
    })
    return callback(null)
  })
}

// Elastic IPs
function downloadAddresses(callback) {
  if (debug) console.log('  downloadAddresses()');
  let describe = node => {
    // Return a description
    let desc = ''
    desc += '  IP Address: ' + node.data.PublicIp + '\n';
    return desc
  }

  myAWS.ec2().describeAddresses({}, (err, data) => {
    if (err) return callback(err);

    // console.log('data=', data);
    data.Addresses.forEach(rec => {
      let addr = graph.findNode(graph.ADDR, rec.AllocationId, rec, describe)

      // Remember if it has a public IP
      if (rec.PublicIp) {
        let ip = graph.findNode(graph.PUBLICIP, rec.PublicIp)
        ip.addChild(addr)
      }
    })
    return callback(null)
  })
}

function downloadAvailabilityZones(callback) {
  if (debug) console.log('  downloadAvailabilityZones()');
  let describe = node => {
    let desc = ''
    // desc += '  IP Address: ' + node.data.PublicIp + '\n';
    return desc
  }

  myAWS.ec2().describeAvailabilityZones({}, (err, data) => {
    if (err) return callback(err);

    // console.log('data=', data);
    data.AvailabilityZones.forEach(rec => {
      let g = graph.findNode(graph.AZ, rec.ZoneName, rec, describe)
    })
    return callback(null)
  })
}

function downloadKeyPairs(callback) {
  if (debug) console.log('  downloadKeyPairs()');
  let describe = node => {
    let desc = ''
    return desc
  }

  myAWS.ec2().describeKeyPairs({}, (err, data) => {
    if (err) return callback(err);

    // console.log('data=', data);
    data.KeyPairs.forEach(rec => {
      let g = graph.findNode(graph.KEYPAIR, rec.KeyName, rec, describe)
    })
    return callback(null)
  })
}

function downloadNetworkInterfaces(callback) {
  if (debug) console.log('  downloadNetworkInterfaces()');
  let describe = node => {
    let desc = ''
    desc += node.data.Description
    return desc
  }

  myAWS.ec2().describeNetworkInterfaces({}, (err, data) => {
    if (err) return callback(err);

    // console.log('data=', data);
    data.NetworkInterfaces.forEach(rec => {
      // console.log('\nNETWORK INTERFACE:', rec);
      let ni = graph.findNode(graph.NETIFACE, rec.NetworkInterfaceId, rec, describe)

      // Public IP via association
      if (rec.Association && rec.Association.PublicIp) {
        let ip = graph.findNode(graph.PUBLICIP, rec.Association.PublicIp)
        ip.addChild(ni)
      }

      // AvailabilityZone
      let az = graph.findNode(graph.AZ, rec.AvailabilityZone)
      az.addChild(ni)

      // Subnet
      let subnet = graph.findNode(graph.SUBNET, rec.SubnetId)
      subnet.addChild(ni)

      // VPC
      let vpc = graph.findNode(graph.VPC, rec.VpcId)
      vpc.addChild(ni)
    })
    return callback(null)
  })
}

function downloadRouteTables(callback) {
  if (debug) console.log('  downloadRouteTables()');
  let describe = node => {
    // Return a description
    let desc = ''
    if (node.hasPublicRoutes) {
      desc += '  --  HAS PUBLIC ROUTES'
    }
    let name = node.findTag('Name')
    if (name) {
      desc += '\n' + name
    }
    // See if this is a main route table
    // node.data.Associations.forEach(assoc => {
    //   if (assoc.Main) {
    //     desc += '\nMain Route table for ' + assoc.RouteTableAssociationId
    //   }
    // })

    // Routes
    let gateways = []
    desc += '\n<table class="smalltable">\n'
    node.data.Routes.forEach(route => {
      if (route.GatewayId === 'local') {
        desc += '<tr><td>' + route.DestinationCidrBlock + '</td><td>  >>>&nbsp;&nbsp;&nbsp;local</td></tr>\n'
      } else {
        let key = graph.keyForNode(graph.IGW, route.GatewayId)
        desc += '<tr><td>' + route.DestinationCidrBlock + '</td><td>  >>>&nbsp;&nbsp;&nbsp;<a href="?node=' + key + '">' + route.GatewayId + '</a></td></tr>\n'
      }
    })
    desc += '</table>'
    return desc
  }

  myAWS.ec2().describeRouteTables({}, (err, data) => {
    if (err) return callback(err);

    // console.log('routeTables=', data);
    data.RouteTables.forEach(rec => {
      // console.log('\nRoute table:', rec);
      let rt = graph.findNode(graph.ROUTETABLE, rec.RouteTableId, rec, describe)

      // Look for routes to Internet Gateways
      let gateways = [] // Only add each gateway it once
      rec.Routes.forEach(route => {
        if (route.GatewayId != 'local') {
          if (!gateways[route.GatewayId]) {
            let igw = graph.findNode(graph.IGW, route.GatewayId)
            igw.addChild(rt)
            // Having a route to an Internet Gateway is the definition of a "Public Subnet"
            rt.hasPublicRoutes = true
            gateways[route.GatewayId] = true
          }
        }
      })

      // Subnets mapped to this routing table
      rec.Associations.forEach(assoc => {
        if (assoc.SubnetId) {
          let sn = graph.findNode(graph.SUBNET, assoc.SubnetId)
          rt.addChild(sn)
        }
      })

      // VPC
      let vpc = graph.findNode(graph.VPC, rec.VpcId)
      vpc.addChild(rt)
    })
    return callback(null)
  })
}

function describeTargets(targetGroup, withHealthchecks) {
  let desc = ''
  if (withHealthchecks) {
    if (targetGroup._health && targetGroup._health.length > 0) {
      targetGroup._health.forEach(health => {
        // console.log('health=', health);
        let key = graph.keyForNode(graph.INSTANCE, health.Target.Id)
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

function downloadLoadBalancers(withHealthchecks, callback) {
  if (debug) console.log('  downloadLoadBalancers()');

  if (!targetGroupsAreLoaded) {
    console.log('ERROR: downloadLoadBalancers() called before downloadTargetGroups()');
    console.log('Links between load balancers and target groups will be missing.');
  }


  let describe = node => {
    let desc = ''
    desc += 'Status: ' + node.data.State.Code + '\n'
    let dns = node.data.DNSName
    if (dns) {
      desc += 'dns: <a href="http://' + dns + '" target="_blank">' + dns + '</a>\n'
    }
    if (node._listeners) {
      node._listeners.forEach(listener => {
        let targetGroup = listener._targetGroupNode;
        if (!targetGroup) {

          // No target group
          let link = listener.Protocol.toLowerCase() + '://' + dns + ':' + listener.Port;
          desc += '<a href="' + link + '" target="_blank">Public ' + listener.Protocol.toLowerCase() + ' / ' + listener.Port + '</a> -> NO TARGET GROUP?\n'
        } else {

          // Have a target group
          // If we have the healthcheck information, we can also show the targets
          let link = listener.Protocol.toLowerCase() + '://' + dns + ':' + listener.Port + targetGroup.data.HealthCheckPath
          desc += '<a href="' + link + '" target="_blank">Public ' + listener.Protocol.toLowerCase() + ' / ' + listener.Port + '</a> -> Target Group (<a href="?node=' + targetGroup.key + '">' + targetGroup.id + '</a>)\n'

          // Add the targets for this target group, if they have been loaded
          desc += describeTargets(targetGroup, withHealthchecks)
        }
      })
    } else {
      desc += 'INTERNAL ERROR: MISSING _LISTENERS\n'
    }
    return desc
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
    if (err) return callback(err);
    // console.log('data=', data);

    (function nextALB(index) {
      if (index >= data.LoadBalancers.length) {
        loadBalancersAreLoaded = true;
        return callback(null)
      }
      let rec = data.LoadBalancers[index]
      let alb = graph.findNode(graph.ALB, rec.LoadBalancerName, rec, describe)

      // Availability Zones and Subnets
      rec.AvailabilityZones.forEach(az => {
        let az2 = graph.findNode(graph.AZ, az.ZoneName)
        az2.addChild(alb)

        let subnet = graph.findNode(graph.SUBNET, az.SubnetId)
        subnet.addChild(alb)
      })

      // Security Groups
      rec.SecurityGroups.forEach(sgid => {
        let sg = graph.findNode(graph.SECGRP, sgid)
        sg.addChild(alb)
      })

      // VPC
      let vpc = graph.findNode(graph.VPC, rec.VpcId)
      vpc.addChild(alb)

      // Get the listeners for this load Balancer
      // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELBv2.html#describeListeners-property
      myAWS.elbv2().describeListeners({
        LoadBalancerArn: rec.LoadBalancerArn
      }, (err, data) => {
        if (err) return callback(err);

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
              if (err) return callback(err);
              listener._targetGroupNode._health = healthData.TargetHealthDescriptions
              // console.log('target health=', healthData);
              healthData.TargetHealthDescriptions.forEach(health => {
                // Instance
                // console.log('health=', health);
                let instance = graph.findNode(graph.INSTANCE, health.Target.Id)
                alb.addChild(instance)
              }) //- next health
              return nextListener(listenerIndex + 1);
            }) //- describeTargetHealth
          }) //- next action
        })(0) //- next listener
      }) //- describeListeners
    })(0) //- nextALB
  }) //- describeLoadBalancers
}

function downloadTargetGroups(withHealthchecks, callback) {
  if (debug) console.log('  downloadTargetGroups()');

  // Function to describe node
  let describe = node => {
    let desc = ''
    desc += 'From: ' + node.data.Protocol.toLowerCase() + ' / ' + node.data.Port + '\n'
    desc += 'Healthcheck: ' + node.data.HealthCheckPath + '\n'

    // Add the targets for this target group, if they have been loaded
    desc += describeTargets(node, withHealthchecks)
    return desc
  }

  // Load the definitions
  myAWS.elbv2().describeTargetGroups({}, (err, data) => {
    if (err) return callback(err);

    // console.log('data=', data);
    data.TargetGroups.forEach(rec => {
      // console.log('tg=', rec);
      let tg = graph.findNode(graph.TARGETGRP, rec.TargetGroupName, rec, describe)

      // VPC
      let vpc = graph.findNode(graph.VPC, rec.VpcId)
      vpc.addChild(tg)
    })
    targetGroupsAreLoaded = true;
    return callback(null)
  })
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
  if (debug) console.log('- getting list of clusters');
  myAWS.ecs().listClusters({ }, function(err, clusterList) {
    if (err) return callback(err);
    if (debug) console.log('- getting cluster details');
    myAWS.ecs().describeClusters({
      clusters: clusterList.clusterArns
    }, function(err, clusterDefinitions) {
      if (err) return callback(err);

      // console.log('clusterDefinitions: ', clusterDefinitions);

      // Loop through the clusters.
      (function nextCluster(index) {
        // Past the last cluster?
        if (index >= clusterDefinitions.clusters.length) {
          return callback(null)
        }

        // Next Cluster
        let clusterDef = clusterDefinitions.clusters[index]
        let cluster = graph.findNode(graph.CLUSTER, clusterDef.clusterName, clusterDef)
        // console.log('Got cluster ' + clusterDef.clusterName);

        /*
        *   Get the container instances for this cluster.
        */
        if (debug) console.log(`- getting list of container instances (cluster=${clusterDef.clusterName})`);
        myAWS.ecs().listContainerInstances({
          cluster: clusterDef.clusterName
        }, function(err, containerInstanceList) {
          if (err) return callback(err);
          var params = {
            cluster: clusterDef.clusterName,
            containerInstances: containerInstanceList.containerInstanceArns
          };
          if (debug) console.log(`- getting container instance details (cluster=${clusterDef.clusterName}, ${containerInstanceList.containerInstanceArns.length} container instances)`);
          myAWS.ecs().describeContainerInstances(params, function(err, containerDefinitions) {
            if (err) return callback(err);

            // Add the container instances to our graph
            // console.log(`containerDefinitions=`, containerDefinitions);
            let instanceForContainer = [ ]; // containerInstanceArn -> node of EC2 instance
            containerDefinitions.containerInstances.forEach(function(containerDef) {
              let instance = findInstanceById(containerDef.ec2InstanceId)
              cluster.addChild(instance);

              // Remember this, so we can create a link between tasks and this EC2 instance
              instanceForContainer[containerDef.containerInstanceArn] = instance;
            })

            /*
            *   Get the services for this cluster.
            *
            *   https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ECS.html#describeServices-property
            */
            if (debug) console.log('- getting list of services');
            myAWS.ecs().listServices({
              cluster: clusterDef.clusterName
            }, function(err, serviceListData) {
              if (err) return callback(err);
              if (debug) console.log('- getting service details');
              myAWS.ecs().describeServices({
                services: serviceListData.serviceArns,
                cluster: clusterDef.clusterArn
              }, function(err, serviceDefinitions) {
                if (err) return callback(err);

                // console.log('serviceDefinitions=', serviceDefinitions);
                // console.log(`Got services`);
                serviceDefinitions.services.forEach(serviceDef => {

                  // Next Service
                  // console.log('serviceDef=', serviceDef);
                  let service = graph.findNode(graph.SERVICE, serviceDef.serviceName, serviceDef)
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

                /*
                *   Get the tasks for this cluster.
                */
                // console.log(`Getting tasks for cluster ${clusterDef.clusterName}`);
                if (debug) console.log(`- getting list of tasks (cluster=${clusterDef.clusterName})`);
                myAWS.ecs().listTasks({
                  cluster: clusterDef.clusterName
                }, function(err, taskList) {
                  if (err) return callback(err);
                  // console.log('taskList=', taskList); // successful response
                  var params = {
                    tasks: taskList.taskArns,
                    cluster: clusterDef.clusterName
                  };
                  if (debug) console.log('- getting task details');
                  myAWS.ecs().describeTasks(params, function(err, taskDefinitions) {
                    if (err) return callback(err);

                    // Loop through the task definitions.
                    // console.log(`taskDefinitions=`, taskDefinitions);
                    taskDefinitions.tasks.forEach(taskDef => {
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
                          if (child.type === graph.SERVICE) {
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
                      let task = graph.findNode(graph.TASK, taskName, taskDef);
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
                  }); //- describeTasks
                }); //- listTasks
              }); //- describeServices
            }); //- listServices
          }); //- describeContainerInstances
        }); //- listContainerInstances
      })(0); // next cluster
    }); //- describeClusters
  }); //- listClusters
}

// See http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeSubnets-property
function downloadEverything(region, withHealthchecks, callback/* (err) */) {
  console.log('downloadEverything()');
  console.log(`Region is ${region} (${myAWS.regionDescription(region)})`);

  myAWS.checkAwsRegion(region)

  // Clear existing list of nodes and reload everything
  graph.reset();
  downloadSecurityGroups(err => {
    if (err) return callback(err)
    downloadVpcs(err => {
      if (err) return callback(err)
      downloadSubnets(err => {
        if (err) return callback(err)
        downloadNatGateways(err => {
          if (err) return callback(err)
          downloadInternetGateways(err => {
            if (err) return callback(err)
            downloadInstances(err => {
              if (err) return callback(err)
              downloadAddresses(err => {
                if (err) return callback(err)
                downloadAvailabilityZones(err => {
                  if (err) return callback(err)
                  downloadKeyPairs(err => {
                    if (err) return callback(err)
                    downloadNetworkInterfaces(err => {
                      if (err) return callback(err)
                      myAWS.downloadRegions(err => {
                        if (err) return callback(err)
                        downloadRouteTables(err => {
                          if (err) return callback(err)
                          downloadTargetGroups(withHealthchecks, err => { // Must be before load balancers
                            if (err) return callback(err)
                            downloadLoadBalancers(withHealthchecks, err => {
                              if (err) return callback(err)
                              downloadClusters(err => {
                                if (err) return callback(err)

                                console.log('finished downloading everything');
                                return callback(null)
                              })
                            })
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
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
module.exports.downloadEverything = downloadEverything;
