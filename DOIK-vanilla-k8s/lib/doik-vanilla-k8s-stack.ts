import { CfnOutput, CfnParameter, Fn, Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { CfnInternetGateway } from 'aws-cdk-lib/aws-ec2';
import * as efs from 'aws-cdk-lib/aws-efs';
import { Construct } from 'constructs';
import {readFileSync} from 'fs';


export class DoikVanillaK8SStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ParametersGroups

    // "<<<<< Kubernetes >>>>>"
    const kubernetesVersion = new CfnParameter(this, 'KubernetesVersion', {
      type: 'String',
      description: 'Enter 1.23.5, 1.23.6, 1.23.7, 1.24.0, 1.24.1. Default is 1.23.6',
      default: '1.23.6',
      allowedValues: ['1.23.5', '1.23.6', '1.23.7', '1.24.0', '1.24.1']
    })
    

    // "<<<<< EC2 Node >>>>>"
    const keyName = new CfnParameter(this, 'KeyName', {
      description: 'Name of an existing EC2 KeyPair to enable SSH access to the instances. Linked to AWS Parameter',
      type: 'AWS::EC2::KeyPair::KeyName',
      constraintDescription: 'must be the name of an existing EC2 KeyPair.'
    }).valueAsString
    
    const sgIngressCidr = new CfnParameter(this, 'SgIngressCidr', {
      type: 'String',
      description: 'The IP address range that can be used to communicate to the EC2 instances',
      minLength: 9,
      maxLength: 18,
      default: '0.0.0.0/0',
      allowedPattern: '(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})/(\\d{1,2})',
      constraintDescription: 'must be a valid IP CIDR range of the form x.x.x.x/x.'
    }).valueAsString;

    const masterNodeIntanceType = ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.LARGE);
    const workerNodeInstanceType = ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM);
    
    
    const ec2EbsVolumeSize = new CfnParameter(this, 'Ec2EbsVolumeSize', {
      type: 'Number',
      description: 'EC2 EBS gp3 Volume Size (GiB)',
      default: 50
    }).valueAsNumber;

    // LatestAmiId : Ubuntu 22.04 LTS
    const latestAmiId = ec2.MachineImage.fromSsmParameter('/aws/service/canonical/ubuntu/server/22.04/stable/current/amd64/hvm/ebs-gp2/ami-id');


    // "<<<<< Region AZ >>>>>"
    const targetRegion = 'ap-northeast-2';
    const availabilityZone1 = 'ap-northeast-2a';
    const availabilityZone2 = 'ap-northeast-2c';


    // "<<<<< VPC Subnet >>>>>"
    const vpcBlock = '192.168.0.0/16';
    const publicSubnet1Block = '192.168.10.0/24';
    const publicSubnet2Block = '192.168.20.0/24';
    const privateSubnet1Block = '192.168.30.0/24';
    const privateSubnet2Block = '192.168.40.0/24';
    

    // Create new VPC
    const vpc = new ec2.CfnVPC(this, 'MyVPC', {
      cidrBlock: vpcBlock,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      tags: [{key: 'Name', value: `${props?.stackName}-VPC`}]
    });


    // PublicSubnets
    const publicSubnet1 = new ec2.CfnSubnet(this, 'PublicSubnet1', {
      availabilityZone: availabilityZone1,
      cidrBlock: publicSubnet1Block,
      vpcId: vpc.attrVpcId,
      mapPublicIpOnLaunch: true,
      tags: [{
        key: 'Name',
        value: `${props?.stackName}-PublicSubnet1`
      }, {
        key: 'kubernetes.io/role/elb',
        value: '1'
      }]
    });

    const publicSubnet2 = new ec2.CfnSubnet(this, 'PublicSubnet2', {
      availabilityZone: availabilityZone2,
      cidrBlock: publicSubnet2Block,
      vpcId: vpc.attrVpcId,
      mapPublicIpOnLaunch: true,
      tags: [{
        key: 'Name',
        value: `${props?.stackName}-PublicSubnet2`
      }, {
        key: 'kubernetes.io/role/elb',
        value: '1'
      }]
    });

    const internetGateway = new CfnInternetGateway(this, 'InternetGateway', {})

    new ec2.CfnVPCGatewayAttachment(this, 'VPCGatewayAttachment', {
      internetGatewayId: internetGateway.attrInternetGatewayId,
      vpcId: vpc.attrVpcId,
    });
    
    const publicSubnetRouteTable = new ec2.CfnRouteTable(this, `PublicSubnetRouteTable`, {
      vpcId: vpc.attrVpcId,
      tags: [{
        key: 'Name',
        value: `${props?.stackName}-PublicSubnetRouteTable`
      }]
    });

    new ec2.CfnRoute(this, `PublicSubnetRoute`, {
      routeTableId: publicSubnetRouteTable.attrRouteTableId,
      destinationCidrBlock: '0.0.0.0/0',
      gatewayId: internetGateway.attrInternetGatewayId
    })

    new ec2.CfnSubnetRouteTableAssociation(this, `PublicSubnet1RouteTableAssociation`, {
      subnetId: publicSubnet1.attrSubnetId,
      routeTableId: publicSubnetRouteTable.attrRouteTableId
    })

    new ec2.CfnSubnetRouteTableAssociation(this, `PublicSubnet2RouteTableAssociation`, {
      subnetId: publicSubnet2.attrSubnetId,
      routeTableId: publicSubnetRouteTable.attrRouteTableId
    })


    // PrivateSubnets
    const privateSubnet1 = new ec2.CfnSubnet(this, 'PrivateSubnet1', {
      availabilityZone: availabilityZone1,
      cidrBlock: privateSubnet1Block,
      vpcId: vpc.attrVpcId,
      tags: [{
        key: 'Name',
        value: `${props?.stackName}-PrivateSubnet1`
      }, {
        key: 'kubernetes.io/role/internal-elb',
        value: '1'
      }]
    });

    const privateSubnet2 = new ec2.CfnSubnet(this, 'PrivateSubnet2', {
      availabilityZone: availabilityZone2,
      cidrBlock: privateSubnet2Block,
      vpcId: vpc.attrVpcId,
      tags: [{
        key: 'Name',
        value: `${props?.stackName}-PrivateSubnet2`
      }, {
        key: 'kubernetes.io/role/internal-elb',
        value: '1'
      }]
    });

    const privateSubnetRouteTable = new ec2.CfnRouteTable(this, `PrivateSubnetRouteTable`, {
      vpcId: vpc.attrVpcId,
      tags: [{
        key: 'Name',
        value: `${props?.stackName}-PrivateSubnetRouteTable`
      }]
    });

    new ec2.CfnSubnetRouteTableAssociation(this, `PrivateSubnet1RouteTableAssociation`, {
      subnetId: privateSubnet1.attrSubnetId,
      routeTableId: privateSubnetRouteTable.attrRouteTableId
    });

    new ec2.CfnSubnetRouteTableAssociation(this, `PrivateSubnet2RouteTableAssociation`, {
      subnetId: privateSubnet2.attrSubnetId,
      routeTableId: privateSubnetRouteTable.attrRouteTableId
    });


    // Security Group
    const ec2SG = new ec2.CfnSecurityGroup(this, 'EC2-SG', {
      groupDescription: `${props?.stackName}-Ec2-SG`,
      vpcId: vpc.attrVpcId,
      tags: [{
        key: 'Name',
        value: `${props?.stackName}-EC2-SG`
      }],
      securityGroupIngress: [{
        ipProtocol: '-1',
        cidrIp: sgIngressCidr
      }, {
        ipProtocol: '-1',
        cidrIp: vpcBlock
      }, {
        ipProtocol: '-1',
        cidrIp: '172.16.0.0/16'
      }, {
        ipProtocol: '-1',
        cidrIp: '10.200.10.0/24'
      }]
    });

    const efsSG = new ec2.CfnSecurityGroup(this, 'EFSSG', {
      vpcId: vpc.attrVpcId,
      groupDescription: `${props?.stackName}-EFS-SG`,
      tags: [{
        key: 'Name',
        value: `${props?.stackName}-EFS-SG`
      }],
      securityGroupIngress: [{
        ipProtocol: 'tcp',
        fromPort: 2049,
        toPort: 2049,
        sourceSecurityGroupId: ec2SG.attrGroupId
      }]
    });
    

    // EFS
    const elasticFileSystem = new efs.CfnFileSystem(this, 'ElasticFileSystem', {
      fileSystemTags: [{key: 'Name', value: `${props?.stackName}-EFS`}]
    });

    new efs.CfnMountTarget(this, 'ElasticFileSystemMountTarget0', {
      fileSystemId: elasticFileSystem.attrFileSystemId,
      securityGroups: [efsSG.attrGroupId],
      subnetId: publicSubnet1.attrSubnetId
    });

    new efs.CfnMountTarget(this, 'ElasticFileSystemMountTarget1', {
      fileSystemId: elasticFileSystem.attrFileSystemId,
      securityGroups: [efsSG.attrGroupId],
      subnetId: publicSubnet2.attrSubnetId
    });

    // Master Node - MEC2 (Master EC2)
    const masterUserData = readFileSync('./src/master-userData.sh', 'utf8');

    const instance1ENI1 = new ec2.CfnNetworkInterface(this, 'Instance1ENI1', {
      subnetId: publicSubnet1.attrSubnetId,
      description: `${props?.stackName}-Instance1ENI1`,
      groupSet: [ec2SG.attrGroupId],
      privateIpAddress: '192.168.10.10',
      sourceDestCheck: false,
      tags: [{key: 'Name', value: `${props?.stackName}-Instance1ENI1`}]
    })
    
    const MEC2 = new ec2.CfnInstance(this, 'MEC2', {
      instanceType: masterNodeIntanceType.toString(),
      imageId: latestAmiId.getImage(this).imageId,
      keyName,
      tags: [{key: 'Name', value: `${props?.stackName}-Master`}],
      networkInterfaces: [{
        networkInterfaceId: instance1ENI1.attrId,
        deviceIndex: '0'
      }],
      blockDeviceMappings: [{
        deviceName: '/dev/sda1',
        ebs: {
          volumeType: 'gp3',
          volumeSize: ec2EbsVolumeSize,
          deleteOnTermination: true
        }
      }],
      userData: Fn.base64(Fn.sub(masterUserData))
    });

    MEC2.addDependsOn(elasticFileSystem);


    // Worker Node - W1EC2 (Worker1 EC2)
    const instance2ENI1 = new ec2.CfnNetworkInterface(this, 'Instance2ENI1', {
      subnetId: publicSubnet1.attrSubnetId,
      description: `${props?.stackName}-Instance2ENI1`,
      groupSet: [ec2SG.attrGroupId],
      privateIpAddress: '192.168.10.101',
      sourceDestCheck: false,
      tags: [{key: 'Name', value: `${props?.stackName}-Instance2ENI1`}]
    })

    const w1UserData = readFileSync('./src/w1-userData.sh', 'utf8');
    const W1EC2 = new ec2.CfnInstance(this, 'W1EC2', {
      instanceType: workerNodeInstanceType.toString(),
      imageId: latestAmiId.getImage(this).imageId,
      keyName,
      tags: [{key: 'Name', value: `${props?.stackName}-Worker1`}],
      networkInterfaces: [{
        networkInterfaceId: instance2ENI1.attrId,
        deviceIndex: '0'
      }],
      blockDeviceMappings: [{
        deviceName: '/dev/sda1',
        ebs: {
          volumeType: 'gp3',
          volumeSize: ec2EbsVolumeSize,
          deleteOnTermination: true
        }
      }],
      userData: Fn.base64(Fn.sub(w1UserData))
    });

    // Worker Node - W2EC2 (Worker2 EC2)
    const instance3ENI1 = new ec2.CfnNetworkInterface(this, 'Instance3ENI1', {
      subnetId: publicSubnet1.attrSubnetId,
      description: `${props?.stackName}-Instance3ENI1`,
      groupSet: [ec2SG.attrGroupId],
      privateIpAddress: '192.168.10.102',
      sourceDestCheck: false,
      tags: [{key: 'Name', value: `${props?.stackName}-Instance3ENI1`}]
    })

    const w2UserData = readFileSync('./src/w2-userData.sh', 'utf8');
    const W2EC2 = new ec2.CfnInstance(this, 'W2EC2', {
      instanceType: workerNodeInstanceType.toString(),
      imageId: latestAmiId.getImage(this).imageId,
      keyName,
      tags: [{key: 'Name', value: `${props?.stackName}-Worker2`}],
      networkInterfaces: [{
        networkInterfaceId: instance3ENI1.attrId,
        deviceIndex: '0'
      }],
      blockDeviceMappings: [{
        deviceName: '/dev/sda1',
        ebs: {
          volumeType: 'gp3',
          volumeSize: ec2EbsVolumeSize,
          deleteOnTermination: true
        }
      }],
      userData: Fn.base64(Fn.sub(w2UserData))
    });

    // Worker Node - W3EC2 (Worker3 EC2)
    const instance4ENI1 = new ec2.CfnNetworkInterface(this, 'Instance4ENI1', {
      subnetId: publicSubnet2.attrSubnetId,
      description: `${props?.stackName}-Instance4ENI1`,
      groupSet: [ec2SG.attrGroupId],
      privateIpAddress: '192.168.20.103',
      sourceDestCheck: false,
      tags: [{key: 'Name', value: `${props?.stackName}-Instance4ENI1`}]
    })

    const w3UserData = readFileSync('./src/w3-userData.sh', 'utf8');
    const W3EC2 = new ec2.CfnInstance(this, 'W3EC2', {
      instanceType: workerNodeInstanceType.toString(),
      imageId: latestAmiId.getImage(this).imageId,
      keyName,
      tags: [{key: 'Name', value: `${props?.stackName}-Worker3`}],
      networkInterfaces: [{
        networkInterfaceId: instance4ENI1.attrId,
        deviceIndex: '0'
      }],
      blockDeviceMappings: [{
        deviceName: '/dev/sda1',
        ebs: {
          volumeType: 'gp3',
          volumeSize: ec2EbsVolumeSize,
          deleteOnTermination: true
        }
      }],
      userData: Fn.base64(Fn.sub(w3UserData))
    });


    new CfnOutput(this, 'MasterNodeIP', { value: MEC2.attrPublicIp });
    new CfnOutput(this, 'WorkerNode1IP', { value: W1EC2.attrPublicIp });
    new CfnOutput(this, 'WorkerNode2IP', { value: W2EC2.attrPublicIp });
    new CfnOutput(this, 'WorkerNode3IP', { value: W3EC2.attrPublicIp });
    new CfnOutput(this, 'EfsFileSystemID', { value: elasticFileSystem.attrFileSystemId });
  }
}
