# AWS Route53 EIP Config Rule

<p align="center">
    <a href="./LICENSE" alt="apache 2.0 license">
      <img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg">
    </a>
    <a href="https://eu-west-1.console.aws.amazon.com/lambda/home?region=eu-west-1#/create/app?applicationId=arn:aws:serverlessrepo:eu-west-1:922723803004:applications/S3-Explorer" alt="AWS Serverless Application">
        <img src="https://img.shields.io/badge/AWS%20Serverless%20Application-S3%20Explorer-blue">
    </a>
</p>


Creates an AWS Config rule to detect route53 records pointing at ip addresses that are no longer in use. Deploy using the AWS Service application repository. Designed to detect records pointing at removed EIPs which would allow for a domain takeover.

Route 53 EIP config rule in [AWS Service application repository]()

## Contribution

### Development
This project uses Vue 3, and as this is much different from Vue 2, recommend reading is available:
* [General Updates](https://v3.vuejs.org/guide/computed.html)
* [Script Setup tags](https://v3.vuejs.org/api/sfc-script-setup.html)
