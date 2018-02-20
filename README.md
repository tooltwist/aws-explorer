[![DeepScan grade](https://deepscan.io/api/projects/1949/branches/8880/badge/grade.svg)](https://deepscan.io/dashboard#view=project&pid=1949&bid=8880)

# Visualize the relationships between your AWS assets

Aws-explorer provides a web based interface for exploring your AWS assets.

The AWS Console is great in many ways, but has one serious failing - it is difficult to work out the relationships between the various computing assets. For example, it's hard to determine everything that uses a security group... or a routing table... or a _whatever_.

Using `aws-explorer` you can jump from one asset (we call them nodes) to another and quickly visualize the relationships.

![aws-explorer](https://user-images.githubusercontent.com/848697/31441873-1724e03e-aec7-11e7-9cd2-5b3e9ae226ef.gif)


### Installation
To use the explorer you will need your AWS credentials defined in `~/.aws/credentials`. If you have used the AWS CLI you will already have this file. If not, you can create it following the
instructions [here](http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html).

If you have nodeJS and npm installed, you can install aws-explorer with

    $ npm install -g aws-explorer
    
and run it with 

    $ aws-explorer
    ...
    Listening now on port 3000...

One running, open your browser at http://localhost:3000.

The command needs to download a lot of information from AWS, and the target group healthchecks
in particular take a long time. If you don't need the target details the `--skip-healthchecks`
option will improve startup times. You might also find the `--region <regionCode>` option useful.

### Configuration Profiles
If your AWS configuration in `~/.aws/credentials` has multiple profiles (profile names are surrounded by square brackets) then you can specify the profile to be used with the following form:

    AWS_PROFILE=twisttest aws-explorer ...
    
Or you can change the profile for all commands using

    export AWS_PROFILE=twisttest


### Troubleshooting
Any errors should be reported by the command you run above.

If you have a need to troubleshoot `aws-explorer`, keep in mind:

- You _must_ have working AWS credentials for `aws-explorer` to work. If you are having authentication problems, then follow the steps to get `AWS CLI` working on your machine, and the problems here will almost certainly be resolved at the same time.
- `aws-explorer` uses the Amazon AWS SDK for Javascript. Most error messages will come from that library, ang Google may provide answers.
- `aws-explorer` communicates with your Amazon AWS account over the Internet. If you have connectivity problems, it will effect this command.

### License
This code is made available under the [MIT](https://en.wikipedia.org/wiki/MIT_License) license, so feel free to modify it for your own purposes, or send a pull request.

There's nothing proprietary or especially interesting in this code. (Actually it is horrible code, hacked together over a spare 6 hours).
