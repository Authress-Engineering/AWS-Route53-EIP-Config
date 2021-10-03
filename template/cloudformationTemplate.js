module.exports = {
  getTemplate(lambdaFunctionString) {
    return {
      AWSTemplateFormatVersion: '2010-09-09',
      Transform: 'AWS::Serverless-2016-10-31',
      Description: 'Route53 Config rule for EIP',
      Parameters: {},

      Resources: {
        ConfigRule: {
          Type: 'AWS::Config::ConfigRule',
          Properties: {
            ConfigRuleName: { 'Fn::Sub': '${AWS::StackName}-${AWS::Region}' },
            Description: 'Route53 Config rule for EIP',
            Source: {
              Owner: 'CUSTOM_LAMBDA',
              SourceDetails: [{
                EventSource: 'aws.config',
                MaximumExecutionFrequency: 'TwentyFour_Hours',
                MessageType: 'ScheduledNotification'
              }],
              SourceIdentifier: { 'Fn::Sub': '${LambdaFunction.Arn}' }
            }
          }
        },

        PermissionForConfigToInvokeLambda: {
          Type: 'AWS::Lambda::Permission',
          Properties: {
            FunctionName: { 'Fn::Sub': '${LambdaFunction.Arn}' },
            Action: 'lambda:InvokeFunction',
            Principal: 'config.amazonaws.com',
            SourceArn: { 'Fn::Sub': '${ConfigRule.Arn}' },
            SourceAccount: { Ref: 'AWS::AccountId' }
          },
          DependsOn: 'LambdaFunction'
        },

        LambdaFunction: {
          Type: 'AWS::Lambda::Function',
          Properties: {
            Description: 'Triggered by the Config Rule',
            FunctionName: { 'Fn::Sub': '${AWS::StackName}-${AWS::Region}' },
            Handler: 'index.handler',
            Role: { 'Fn::GetAtt': ['AWSLambdaExecutionRole', 'Arn'] },
            Timeout: 900,
            Runtime: 'nodejs14.x',
            Code: {
              ZipFile: lambdaFunctionString
            }
          }
        },

        AWSLambdaExecutionRole: {
          Type: 'AWS::IAM::Role',
          Properties: {
            AssumeRolePolicyDocument: {
              Statement: [
                {
                  Action: ['sts:AssumeRole'],
                  Effect: 'Allow',
                  Principal: {
                    Service: ['lambda.amazonaws.com']
                  }
                }
              ],
              Version: '2012-10-17'
            },
            Path: '/',
            Policies: [
              {
                PolicyDocument: {
                  Statement: [
                    {
                      Action: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
                      Effect: 'Allow',
                      Resource: 'arn:aws:logs:*:*:*'
                    }
                  ],
                  Version: '2012-10-17'
                },
                PolicyName: { 'Fn::Sub': '${AWS::StackName}-${AWS::Region}-AWSLambda-CW' }
              },
              {
                PolicyDocument: {
                  Statement: [
                    {
                      Action: ['route53:ListHostedZones', 'route53:ListResourceRecordSets', 'ec2:describeRegions', 'ec2:DescribeAddresses', 'config:PutEvaluations'],
                      Effect: 'Allow',
                      Resource: '*'
                    }
                  ],
                  Version: '2012-10-17'
                },
                PolicyName: { 'Fn::Sub': '${AWS::StackName}-${AWS::Region}-AWSLambda-Access' }
              }
            ],
            RoleName: { 'Fn::Sub': '${AWS::StackName}-${AWS::Region}' }
          }
        }
      },

      Outputs: {
        ConfigRuleId: {
          Description: 'Config Rule ID',
          Value: { 'Fn::Sub': '${ConfigRule.ConfigRuleId}' }
        }
      }
    };
  }
};
