/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { Fn } from "cdktf"
import { EcsService } from "@cdktf/provider-aws/lib/ecs-service"
import { Subnet } from "@cdktf/provider-aws/lib/subnet"
import { Construct } from "constructs"
import { Tfvars } from "./variables"

export class EcsServiceClient extends Construct {
  public service: EcsService

  constructor(
    scope: Construct,
    name: string,
    vars: Tfvars,
    clusterArn: string,
    taskDefinitionArn: string,
    targetGroupArn: string,
    subnets: Subnet[],
    clientSecurityGroupId: string
  ) {
    super(scope, name)

    const nameTagPrefix = `${Fn.lookup(vars.defaultTags, "project", "")}`

    this.service = new EcsService(this, name, {
      name: `${nameTagPrefix}-client`,
      cluster: clusterArn,
      taskDefinition: taskDefinitionArn,
      desiredCount: 1,
      launchType: "FARGATE",

      loadBalancer: [
        {
          targetGroupArn,
          containerName: "client",
          containerPort: 9090,
        },
      ],

      networkConfiguration: {
        subnets: subnets.map((subnet) => subnet.id),
        assignPublicIp: false,
        securityGroups: [clientSecurityGroupId],
      },
    })
  }
}

export class EcsServiceUpstream extends Construct {
  public service: EcsService

  constructor(
    scope: Construct,
    name: string,
    vars: Tfvars,
    clusterArn: string,
    taskDefinitionArn: string,
    targetGroupArn: string,
    subnets: Subnet[],
    securityGroupId: string
  ) {
    super(scope, name)

    const nameTagPrefix = `${Fn.lookup(vars.defaultTags, "project", "")}`

    this.service = new EcsService(this, name, {
      name: `${nameTagPrefix}-${name}`,
      cluster: clusterArn,
      taskDefinition: taskDefinitionArn,
      desiredCount: 1,
      launchType: "FARGATE",

      loadBalancer: [
        {
          targetGroupArn,
          containerName: name,
          containerPort: 9090,
        },
      ],

      networkConfiguration: {
        subnets: subnets.map((subnet) => subnet.id),
        assignPublicIp: false,
        securityGroups: [securityGroupId],
      },
    })
  }
}