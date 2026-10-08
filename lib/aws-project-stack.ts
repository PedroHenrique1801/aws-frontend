import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class AwsProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Cognito
    const userPool = new cognito.UserPool(this, 'MeuUserPool', {
      userPoolName: 'MeuAppUserPool',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8, requireLowercase: true, requireUppercase: true, requireDigits: true, requireSymbols: false,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY, 
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'MeuUserPoolClient', {
      userPool,
      generateSecret: false,
    });

    // 2. Bucket S3 
    const websiteBucket = new s3.Bucket(this, 'FrontendBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // 3. Criando identidade de acesso (OAI) explícita e dando permissão de leitura no Bucket
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'FrontendOAI');
    websiteBucket.grantRead(originAccessIdentity);

    // 4. CloudFront com tratamento de erros para React
    const distribution = new cloudfront.Distribution(this, 'FrontendDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, { originAccessIdentity }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      // Redireciona erros do S3 para o index.html, permitindo que o React gerencie a tela
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    // 5. Deploy dos arquivos
    new s3deploy.BucketDeployment(this, 'DeployFrontend', {
      sources: [s3deploy.Source.asset('./frontend/dist')],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'], 
    });

    // 6. Outputs
    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: `https://${distribution.distributionDomainName}`,
    });
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
  }
}