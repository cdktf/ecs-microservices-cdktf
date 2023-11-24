/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { EcsService } from "@cdktf/provider-aws/lib/ecs-service";
import * as constructs from "constructs";
/*Provider bindings are generated by running cdktf get.
See https://cdk.tf/provider-generation for more details.*/

interface ClientEcsServiceConfig {
  ecsClusterArn: string;
  clientAlbTargetGroupArn: string;
  projectTag: string;
  clientSecurityGroupId: string;
  subnetIds: string[];
  clientTaskDefinitionArn: string;
}

export class ClientEcsService extends constructs.Construct {
  service: EcsService;
  constructor(scope: constructs.Construct, name: string, config: ClientEcsServiceConfig) {
    super(scope, name);
    this.service = new EcsService(this, "client", {
      cluster: config.ecsClusterArn,
      desiredCount: 1,
      launchType: "FARGATE",
      loadBalancer: [
        {
          containerName: "client",
          containerPort: 9090,
          targetGroupArn: config.clientAlbTargetGroupArn,
        },
      ],
      name: `${config.projectTag}-client`,
      networkConfiguration: {
        assignPublicIp: false,
        securityGroups: [config.clientSecurityGroupId],
        subnets: config.subnetIds,
      },
      taskDefinition: config.clientTaskDefinitionArn,
    });
  }
}

