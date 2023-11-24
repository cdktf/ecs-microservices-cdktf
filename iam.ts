/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { Fn } from "cdktf";
import { Construct } from "constructs";
import { Tfvars } from "./variables";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { DataAwsIamPolicyDocument } from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";
import { IamPolicy } from "@cdktf/provider-aws/lib/iam-policy";

export class EcsMonitoringIamTaskExecRole extends Construct {
  public role: IamRole;

  constructor(scope: Construct, name: string, vars: Tfvars) {
    super(scope, name);

    const nameTagPrefix = `${Fn.lookup(vars.defaultTags, "project", "")}`;

    const assumeRolePolicyDoc = new DataAwsIamPolicyDocument(
      this,
      "monitoring-assume-role-doc",
      {
        version: "2012-10-17",
        statement: [
          {
            effect: "Allow",
            actions: ["sts:AssumeRole"],
            principals: [
              {
                identifiers: ["ecs-tasks.amazonaws.com"],
                type: "Service",
              },
            ],
          },
        ],
      }
    );

    const monitoringPermissionsDoc = new DataAwsIamPolicyDocument(
      this,
      "monitoring-permissions",
      {
        version: "2012-10-17",
        statement: [
          {
            effect: "Allow",
            actions: [
              "ecs:ListClusters",
              "ecs:ListContainerInstances",
              "ecs:DescribeContainerInstances",
              "logs:DescribeLogStreams"
            ],
            resources: ["*"],
          },
        ],
      }
    );

    this.role = new IamRole(this, "monitoring-task-exec-role", {
      namePrefix: `${nameTagPrefix}-te-role`,
      description:
        "Task execution role for monitoring with ECS Task definitions",
      assumeRolePolicy: assumeRolePolicyDoc.json,
    });

    new IamPolicy(this, "monitoring-permissions-attachment", {
      name: `${nameTagPrefix}-monitoring-policy`,
      policy: monitoringPermissionsDoc.json,
    });
  }
}
