import "cdktf/lib/testing/adapters/jest"; // Load types for expect matchers
import { TerraformStack, Testing } from "cdktf";
import { ClientEcsService } from "../ecs-service-converted";
import { EcsService } from "@cdktf/provider-aws/lib/ecs-service";
import { MyStack } from "../main";
import { EcsTaskDefinitionClient } from "../ecs-task-definitions";
import { DataAwsIamPolicyDocument } from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";

describe("My CDKTF Application", () => {
  it("should use the task definition arn", async () => {
    const app = Testing.app();
    const stack = new TerraformStack(app, "test");
    const client = new ClientEcsService(stack, "client", {
      ecsClusterArn: "ecsClusterArn",
      clientAlbTargetGroupArn: "clientAlbTargetGroupArn",
      projectTag: "projectTag",
      clientSecurityGroupId: "clientSecurityGroupId",
      subnetIds: ["subnetAId"],
      clientTaskDefinitionArn: "clientTaskDefinitionArn",
    });

    expect(client.service.taskDefinitionInput).toEqual(
      "clientTaskDefinitionArn"
    );
  });

  it("should use the passed cluster arn", async () => {
    expect(
      Testing.synthScope(
        (scope) =>
          new ClientEcsService(scope, "client", {
            ecsClusterArn: "ecsClusterArn",
            clientAlbTargetGroupArn: "clientAlbTargetGroupArn",
            projectTag: "projectTag",
            clientSecurityGroupId: "clientSecurityGroupId",
            subnetIds: ["subnetAId"],
            clientTaskDefinitionArn: "clientTaskDefinitionArn",
          })
      )
    ).toHaveResourceWithProperties(EcsService, { cluster: "ecsClusterArn" });
  });

  it("should have task definition with the right execution role", async () => {
    const app = Testing.app();
    const stack = new MyStack(app, "test");
    const output = Testing.synth(stack);
    const json = JSON.parse(output);

    const taskDef = stack.node.findChild("client_task_definition");
    const taskDefId = (taskDef as EcsTaskDefinitionClient).def.friendlyUniqueId;

    expect(json).toHaveProperty(
      `resource.aws_ecs_task_definition.${taskDefId}`,
      expect.objectContaining({
        execution_role_arn: expect.stringContaining(
          "aws_iam_role.task-monitoring-role_monitoring-task-exec-role"
        ),
      })
    );
  });

  it("should have execution role with the right permissions", async () => {
    const app = Testing.app();
    const stack = new MyStack(app, "test");

    const iamPolicyDocDatasource = stack.node
      .findChild("task-monitoring-role")
      .node.findChild("monitoring-permissions") as DataAwsIamPolicyDocument;

    expect(iamPolicyDocDatasource.statementInput).toMatchInlineSnapshot(`
Array [
  Object {
    "actions": Array [
      "ecs:ListClusters",
      "ecs:ListContainerInstances",
      "ecs:DescribeContainerInstances",
      "logs:DescribeLogStreams",
    ],
    "effect": "Allow",
    "resources": Array [
      "*",
    ],
  },
]
`);
  });


});
