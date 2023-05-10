import "cdktf/lib/testing/adapters/jest"; // Load types for expect matchers
import { TerraformStack, Testing } from "cdktf";
import { ClientEcsService } from "../ecs-services-converted";
import { EcsService } from "@cdktf/provider-aws/lib/ecs-service";
import { MyStack } from "../main";
import { EcsTaskDefinitionClient } from "../ecs-task-definitions";
import { DataAwsIamPolicyDocument } from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";

describe("My CDKTF Application", () => {
  // The tests below are example tests, you can find more information at
  // https://cdk.tf/testing
  describe("ClientEcsService", () => {
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

    it("should use the task definition arn", async () => {
      const app = Testing.app();
      const stack = new TerraformStack(app, "test");
      const service = new ClientEcsService(stack, "client", {
        ecsClusterArn: "ecsClusterArn",
        clientAlbTargetGroupArn: "clientAlbTargetGroupArn",
        projectTag: "projectTag",
        clientSecurityGroupId: "clientSecurityGroupId",
        subnetIds: ["subnetAId"],
        clientTaskDefinitionArn: "clientTaskDefinitionArn",
      });

      expect(service.service.taskDefinitionInput).toEqual(
        "clientTaskDefinitionArn"
      );
    });

    it("should have task definition with the right execution role", async () => {
      const app = Testing.app();
      const stack = new MyStack(app, "test");
      const output = Testing.synth(stack);
      const json = JSON.parse(output);

      const taskDef = stack.node.findChild("client_task_definition");
      const taskDefId = (taskDef as EcsTaskDefinitionClient).def
        .friendlyUniqueId;

      expect(json).toHaveProperty(
        `resource.aws_ecs_task_definition.${taskDefId}`,
        expect.objectContaining({
          execution_role_arn: expect.stringContaining(
            "aws_iam_role.task-monitoring-role_monitoring-task-exec-role"
          ),
        })
      );
    });

  });
  
  it("should have execution role with the right permissions", async () => {
    const app = Testing.app();
      const stack = new MyStack(app, "test");

      const iamPolicyDocDatasource = stack.node.findChild("task-monitoring-role").node.findChild("monitoring-permissions") as DataAwsIamPolicyDocument;
      
      expect(iamPolicyDocDatasource.statementInput).toMatchInlineSnapshot(`
Array [
  Object {
    "actions": Array [
      "ecs:ListClusters",
      "ecs:ListContainerInstances",
      "ecs:DescribeContainerInstances",
    ],
    "effect": "Allow",
    "resources": Array [
      "*",
    ],
  },
]
`);
  })

  // // All Unit tests test the synthesised terraform code, it does not create real-world resources
  // describe("Unit testing using assertions", () => {
  //   it("should contain a resource", () => {
  //     // import { Image,Container } from "./.gen/providers/docker"
  //     expect(
  //       Testing.synthScope((scope) => {
  //         new MyApplicationsAbstraction(scope, "my-app", {});
  //       })
  //     ).toHaveResource(Container);

  //     expect(
  //       Testing.synthScope((scope) => {
  //         new MyApplicationsAbstraction(scope, "my-app", {});
  //       })
  //     ).toHaveResourceWithProperties(Image, { name: "ubuntu:latest" });
  //   });
  // });

  // describe("Unit testing using snapshots", () => {
  //   it("Tests the snapshot", () => {
  //     const app = Testing.app();
  //     const stack = new TerraformStack(app, "test");

  //     new TestProvider(stack, "provider", {
  //       accessKey: "1",
  //     });

  //     new TestResource(stack, "test", {
  //       name: "my-resource",
  //     });

  //     expect(Testing.synth(stack)).toMatchSnapshot();
  //   });

  //   it("Tests a combination of resources", () => {
  //     expect(
  //       Testing.synthScope((stack) => {
  //         new TestDataSource(stack, "test-data-source", {
  //           name: "foo",
  //         });

  //         new TestResource(stack, "test-resource", {
  //           name: "bar",
  //         });
  //       })
  //     ).toMatchInlineSnapshot();
  //   });
  // });

  // describe("Checking validity", () => {
  //   it("check if the produced terraform configuration is valid", () => {
  //     const app = Testing.app();
  //     const stack = new TerraformStack(app, "test");

  //     new TestDataSource(stack, "test-data-source", {
  //       name: "foo",
  //     });

  //     new TestResource(stack, "test-resource", {
  //       name: "bar",
  //     });
  //     expect(Testing.fullSynth(app)).toBeValidTerraform();
  //   });

  //   it("check if this can be planned", () => {
  //     const app = Testing.app();
  //     const stack = new TerraformStack(app, "test");

  //     new TestDataSource(stack, "test-data-source", {
  //       name: "foo",
  //     });

  //     new TestResource(stack, "test-resource", {
  //       name: "bar",
  //     });
  //     expect(Testing.fullSynth(app)).toPlanSuccessfully();
  //   });
  // });
});
