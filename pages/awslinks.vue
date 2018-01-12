<template lang="pug">
.page
  br
  h2 AWS Links
  br
  p
    a(:href="'https://'+region+'.console.aws.amazon.com/console/home?region='+region+'#'" target="_blank")
      strong AWS Services
      | &nbsp;&nbsp;&nbsp;(region {{region}})
  br

  p
    a(:href="'https://'+region+'.console.aws.amazon.com/vpc/home?region='+region+'#vpcs:'" target="_blank")
      strong VPC
      | &nbsp;- Networks
  p
    a(:href="'https://'+region+'.console.aws.amazon.com/ec2/v2/home?region='+region+'#instances'" target="_blank")
      strong EC2
      | &nbsp;- Servers
  p
    a(:href="'https://'+region+'.console.aws.amazon.com/ecs/home?region='+region+'#/clusters'" target="_blank")
      strong ECS
      | - Containers
  p
    a(:href="'https://'+region+'.console.aws.amazon.com/rds/home?region='+region+'#dbinstances:'" target="_blank")
      strong RDS
      | - Databases
  p
    a(:href="'https://'+region+'.console.aws.amazon.com/elasticache/home?region='+region+'#redis:'" target="_blank")
      strong RDS
      | - REDIS
  p
    a(:href="'https://s3.console.aws.amazon.com/s3/home?region='+region+'#'" target="_blank")
      strong S3
      | &nbsp;- Storage
  p
    a(:href="'https://'+region+'.console.aws.amazon.com/cloudformation/home?region='+region+'#/stacks?filter=active'" target="_blank")
      strong CloudFormation
      | - Provisioning
  p
    a(:href="'https://'+region+'.console.aws.amazon.com/codepipeline/home?region='+region+'#/dashboard'" target="_blank")
      strong CodePipeline
      | - Build / Deploy

  br
  p
    a(href="http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/top-level-namespace.html" target="_blank")
      strong AWS Javascript SDK
  br
  br
</template>

<script>
export default {
  components: {
  },
  data: function () {
    return {
      region: 'ap-southeast-1'
    }
  },
  head () {
    return {
      title: 'Help'
    }
  }
}
</script>

<style scoped>

h3 {
  margin-top: 10px;
  font-weight: bold;
}
</style>
