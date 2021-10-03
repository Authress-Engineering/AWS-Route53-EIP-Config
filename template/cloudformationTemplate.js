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
            ConfigRuleName: { 'Fn::Sub': '${AWS::StackName}' },
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
          },
          DependsOn: 'PermissionForConfigToInvokeLambda'
        },

        PermissionForConfigToInvokeLambda: {
          Type: 'AWS::Lambda::Permission',
          Properties: {
            FunctionName: { 'Fn::Sub': '${LambdaFunction.Arn}' },
            Action: 'lambda:InvokeFunction',
            Principal: 'config.amazonaws.com',
            SourceAccount: { Ref: 'AWS::AccountId' }
          }
        },

        LambdaFunction: {
          Type: 'AWS::Lambda::Function',
          Properties: {
            Description: 'Triggered by the Config Rule',
            FunctionName: { 'Fn::Sub': '${AWS::StackName}' },
            Handler: 'index.handler',
            Role: { 'Fn::GetAtt': ['AWSLambdaExecutionRole', 'Arn'] },
            Timeout: 900,
            Runtime: 'nodejs12.x',
            Code: {
              ZipFile: lambdaFunctionString
            }
          }
        },

        CloudWatchLambdaLogGroup: {
          Type: 'AWS::Logs::LogGroup',
          Properties: {
            LogGroupName: { 'Fn::Sub': '/aws/lambda/${AWS::StackName}' },
            RetentionInDays: 365
          }
        },

        AWSLambdaExecutionRole: {
          Type: 'AWS::IAM::Role',
          Properties: {
            RoleName: { 'Fn::Sub': '${AWS::StackName}-${AWS::Region}' },
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
            ManagedPolicyArns: [
              'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
            ],
            Policies: [
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
                PolicyName: { 'Fn::Sub': 'AWSLambda-Access' }
              },
              {
                PolicyDocument: {
                  Statement: [
                    {
                      Action: ['config:GetComplianceDetailsByConfigRule'],
                      Effect: 'Allow',
                      Resource: { 'Fn::Sub': 'arn:aws:config:${AWS::Region}:${AWS::AccountId}:config-rule/*' }
                    }
                  ],
                  Version: '2012-10-17'
                },
                PolicyName: { 'Fn::Sub': 'ConfigRuleAccess' }
              }
            ]
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
