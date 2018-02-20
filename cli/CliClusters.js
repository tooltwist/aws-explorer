const myAWS = require('../server/misc/myAWS')
const graph = require('../server/misc/graph')
const types = require('../lib/types')
const download = require('../server/misc/download')

function CliClusters(region) {
  // Clear existing list of nodes and reload everything
  graph.reset();
  download.downloadInstances(err => {
    download.downloadTargetGroups(false, err => {
      download.downloadLoadBalancers(false, err => {
        download.downloadClusters(err => {
          if (err) {
            console.log('Error: ', err)
          }

          // Display cluster -> service -> task -> instance
          clusterReport();

        })
      })
    })
  })
}

function clusterReport() {

  console.log();
  console.log('ECS Clusters');
  console.log('------------');
  graph.nodesByType(types.CLUSTER).forEach(cluster => {
    console.log();
    console.log(`Cluster ${cluster.id}:`);

    // Instances
    cluster.children.forEach(childKey => {
      if (childKey.startsWith(types.INSTANCE)) {
        console.log(`  ${childKey}`);
      }
    });

    // Services
    cluster.children.forEach(childKey => {
      if (childKey.startsWith(types.SERVICE)) {
        console.log(`  ${childKey}`);

        let service = graph.nodeWithKey(childKey);
        service.children.forEach(childKey => {
          if (childKey.startsWith(types.TASK)) {
            console.log(`    ${childKey}`);
          }
        });

        // Target groups
        service.parents.forEach(key => {
          if (key.startsWith(types.TARGETGRP)) {
            console.log(`    ${key}`);

            let tg = graph.nodeWithKey(key);
            tg.parents.forEach(key => {
              if (key.startsWith(types.ALB)) {
                console.log(`      ${key}`);
              }
            });
          }
        });
      }
    });

    // Other
    cluster.children.forEach(childKey => {
      if ( !childKey.startsWith(types.INSTANCE) && !childKey.startsWith(types.SERVICE)) {
        console.log(`  ${childKey}`);
      }
    });
  });
}

module.exports = CliClusters;
