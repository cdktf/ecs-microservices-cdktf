import { Instance } from "@cdktf/provider-aws/lib/instance"
import { NatGateway } from "@cdktf/provider-aws/lib/nat-gateway"
import { DataAwsSsmParameter } from "@cdktf/provider-aws/lib/data-aws-ssm-parameter";
import { Fn } from "cdktf"
import { Construct } from "constructs"
import { Tfvars } from "./variables"
import { readFileSync } from 'fs'

export class Database extends Construct {
  public instance: Instance
  constructor(
    scope: Construct,
    name: string,
    vars: Tfvars,
    subnetId: string,
    securityGroupId: string,
    natGateway: NatGateway
  ) {
    super(scope, name)

    const nameTagPrefix = `${Fn.lookup(vars.defaultTags, "project", "")}`

    const ami = new DataAwsSsmParameter(this, "ubuntu_1804_ami_id", {
      name: "/aws/service/canonical/ubuntu/server/18.04/stable/current/amd64/hvm/ebs-gp2/ami-id"
    }).value

    this.instance = new Instance(this, name, {
      ami,
      instanceType: "t2.micro",
      vpcSecurityGroupIds: [securityGroupId],
      subnetId,
      privateIp: vars.databasePrivateIp,
      tags: { Name: `${nameTagPrefix}-database`},
      dependsOn: [natGateway],
      userData: readFileSync('./scripts/database.sh', 'utf8')
    })
  }
}