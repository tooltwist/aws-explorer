const myAWS = require('../server/misc/myAWS')
const graph = require('../server/misc/graph')
const pad = require('../server/misc/util').pad
const capitalize = require('../server/misc/util').capitalize
const download = require('../server/misc/download')

function CliClusters(region) {
  region = myAWS.checkAwsRegion(region)

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
  console.log('Application Load Balancers');
  console.log('--------------------------');
  graph.nodesByType(types.ALB).forEach(cluster => {
    console.log();
    console.log(`ALB ${cluster.id}:`);

    // Instances
    cluster.children.forEach(childKey => {
      if (childKey.startsWith(types.TARGETGRP)) {
        console.log(`  ${childKey}`);

        let tg = graph.nodeWithKey(childKey);
        tg.children.forEach(childKey => {
          if (childKey.startsWith(types.SERVICE)) {
            console.log(`    ${childKey}`);

            let service = graph.nodeWithKey(childKey);
            service.parents.forEach(key => {
              if (key.startsWith(types.CLUSTER)) {
                console.log(`      ${key}`);
              }
            });
            service.children.forEach(key => {
              if (key.startsWith(types.TASK)) {
                console.log(`      ${key}`);
              }
            });
          }//- service
        });
      }
    });
  });
}

module.exports = CliClusters;
