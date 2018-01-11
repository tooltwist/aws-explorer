<template lang="pug">
.page
  h2 Help Topics
  h3 Overview of AWS
  | &nbsp;&nbsp;&nbsp;
  a(href="https://aws.amazon.com/ecs/getting-started/" target="_blank") Getting Started
  br

  h3 Security
  | &nbsp;&nbsp;&nbsp;
  a(href="https://cloudacademy.com/blog/aws-security-groups-instance-level-security/" target="_blank")
    | Instance level security (Security groups)
  br
  | &nbsp;&nbsp;&nbsp;
  a(href="https://cloudacademy.com/blog/aws-network-acl-vpc-subnets-network-security/" target="_blank")
    | Network level security (Routing tables and Network ACLs)
  br
  | &nbsp;&nbsp;&nbsp;
  a(href="https://cloudacademy.com/blog/how-to-build-hipaa-compliant-applications-on-aws/" target="_blank")
    | How to build HIPAA compliant applications on AWS
  br

  h3 Load Balancing
  | &nbsp;&nbsp;&nbsp;
  a(href="https://cloudacademy.com/blog/application-load-balancer-vs-classic-load-balancer/" target="_blank")
    | Application Load Balancer vs Classic Load Balancer
  br

  h3 Containers
  | &nbsp;&nbsp;&nbsp;
  a(href="https://cloudacademy.com/blog/amazon-ec2-container-service-docker-aws/" target="_blank")
    | Amazon EC2 Container Service and Elastic Beanstalk: Docker on AWS
  br

  h3 Cloudformation
  | &nbsp;&nbsp;&nbsp;
  a(href="https://cloudacademy.com/blog/cloudformation-deployment-tool/" target="_blank")
    | CloudFormation: the perfect Cloud Deployment tool for AWS?
  br

  h3 Deployment
  | &nbsp;&nbsp;&nbsp;
  a(href="https://aws.amazon.com/blogs/compute/continuous-deployment-to-amazon-ecs-using-aws-codepipeline-aws-codebuild-amazon-ecr-and-aws-cloudformation/" target="_blank")
    | Continuous Deployment to Amazon ECS using AWS CodePipeline, AWS CodeBuild, Amazon ECR, and AWS CloudFormation
  br
  | &nbsp;&nbsp;&nbsp;
  a(href="https://github.com/awslabs/ecs-refarch-continuous-deployment" target="_blank")
    | ECS Reference Architecture: Continuous Deployment
  br
  | &nbsp;&nbsp;&nbsp;
  a(href="https://github.com/awslabs/golang-deployment-pipeline" target="_blank")
    | Deployment Pipeline for Go Applications on AWS
  br
  | &nbsp;&nbsp;&nbsp;
  a(href="http://docs.aws.amazon.com/devops/latest/gsg/welcome.html" target="_blank")
    | Introducing the AWS for DevOps Walkthrough
  br
  | &nbsp;&nbsp;&nbsp;
  a(href="http://docs.aws.amazon.com/devops/latest/gsg/welcome.html" target="_blank")
    | Introducing the AWS for DevOps Walkthrough
  br
  | &nbsp;&nbsp;&nbsp;
  a(href="http://docs.aws.amazon.com/devops/latest/gsg/welcome.html" target="_blank")
    | Introducing the AWS for DevOps Walkthrough
  br

  h3 Tooltwist
  | &nbsp;&nbsp;&nbsp;
  a(href="http://tooltwist.com" target="_blank")
    | Tooltwist website
  br
  | &nbsp;&nbsp;&nbsp;
  a(href="https://github.com/tooltwist/aws-explorer/wiki" target="_blank")
    | aws-explorer wiki
  br
  | &nbsp;&nbsp;&nbsp;
  a(href="https://github.com/tooltwist/aws-explorer/wiki/Tooltwist-Cloudformation-Templates" target="_blank")
    | Tooltwist Cloudformation Templates

  br
  br
  br
  br
</template>

<script>

export default {
  components: {
  },
  data: function () {
    return {

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
