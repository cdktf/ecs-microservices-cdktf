import { Fn } from "cdktf"
import { Alb } from "@cdktf/provider-aws/lib/alb"
import { LbListener } from "@cdktf/provider-aws/lib/lb-listener"
import { LbTargetGroup } from "@cdktf/provider-aws/lib/lb-target-group"
import { Subnet } from "@cdktf/provider-aws/lib/subnet"
import { Construct } from "constructs"
import { Tfvars } from "./variables"

export class ClientAlb extends Construct {
  public lb: Alb
  public targetGroup: LbTargetGroup
  public listener: LbListener

  constructor(
    scope: Construct,
    name: string,
    vars: Tfvars,
    subnets: Subnet[],
    securityGroupId: string,
    vpcId: string
  ) {
    super(scope, name)

    const nameTagPrefix = `${Fn.lookup(vars.defaultTags, "project", "")}`

    this.lb = new Alb(this, "client_alb", {
      securityGroups: [securityGroupId],
      namePrefix: "cl-",
      loadBalancerType: "application",
      subnets: subnets.map((subnet) => subnet.id),
      idleTimeout: 60,
      ipAddressType: "dualstack",
      tags: { Name: `${nameTagPrefix}-client-alb`}
    })

    this.targetGroup = new LbTargetGroup(this, "client_alb_targets", {
      namePrefix: "cl-",
      port: 9090,
      protocol: "HTTP",
      vpcId,
      deregistrationDelay: "30",
      targetType: "ip",

      healthCheck: {
        enabled: true,
        path: "/",
        healthyThreshold: 3,
        unhealthyThreshold: 3,
        timeout: 30,
        interval: 60,
        protocol: "HTTP",
      },

      tags: { Name: `${nameTagPrefix}-client-tg`}
    })

    this.listener = new LbListener(this, "client_alb_http_80", {
      loadBalancerArn: this.lb.arn,
      port: 80,
      protocol: "HTTP",

      defaultAction: [
        {
          type: "forward",
          targetGroupArn: this.targetGroup.arn,
        },
      ],
    })
  }
}

export class UpstreamServiceAlb extends Construct {
  public lb: Alb
  public targetGroup: LbTargetGroup
  public listener: LbListener

  constructor(
    scope: Construct,
    name: string,
    vars: Tfvars,
    subnets: Subnet[],
    securityGroupId: string,
    vpcId: string
  ) {
    super(scope, name)

    const nameTagPrefix = `${Fn.lookup(vars.defaultTags, "project", "")}`

    this.lb = new Alb(this, `${name}_alb`, {
      securityGroups: [securityGroupId],
      namePrefix: "s-",
      loadBalancerType: "application",
      subnets: subnets.map((subnet) => subnet.id),
      idleTimeout: 60,
      internal: true,
      tags: { Name: `${nameTagPrefix}-${name}-alb`}
    })

    this.targetGroup = new LbTargetGroup(this, `${name}_alb_targets`, {
      namePrefix: "s-",
      port: 9090,
      protocol: "HTTP",
      vpcId,
      deregistrationDelay: "30",
      targetType: "ip",

      healthCheck: {
        enabled: true,
        path: "/",
        healthyThreshold: 3,
        unhealthyThreshold: 3,
        timeout: 30,
        interval: 60,
        protocol: "HTTP",
      },

      tags: { Name: `${nameTagPrefix}-${name}-tg`}
    })

    this.listener = new LbListener(this, `${name}_alb_http_80`, {
      loadBalancerArn: this.lb.arn,
      port: 80,
      protocol: "HTTP",

      defaultAction: [
        {
          type: "forward",
          targetGroupArn: this.targetGroup.arn,
        },
      ],
    })
  }
}