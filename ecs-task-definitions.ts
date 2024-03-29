/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { Fn } from "cdktf"
import { EcsTaskDefinition } from "@cdktf/provider-aws/lib/ecs-task-definition"
import { Construct } from "constructs"
import { Tfvars } from "./variables"

export class EcsTaskDefinitionClient extends Construct {
  public def: EcsTaskDefinition

  constructor(
    scope: Construct,
    name: string,
    vars: Tfvars,
    upstreamUriString: string,
    executionRoleArn: string
  ) {
    super(scope, name)

    const nameTagPrefix = `${Fn.lookup(vars.defaultTags, "project", "")}`

    this.def = new EcsTaskDefinition(
      this,
      "task_definition",
      {
        family: `${nameTagPrefix}-client`,
        memory: "512",
        cpu: "256",
        networkMode: "awsvpc",
        executionRoleArn,

        containerDefinitions: Fn.jsonencode([
          {
            name: "client",
            image: "nicholasjackson/fake-service:v0.23.1",
            cpu: 0,
            essential: true,

            portMappings: [
              {
                containerPort: 9090,
                hostPort: 9090,
                protocol: "tcp",
              },
            ],

            environment: [
              {
                name: "NAME",
                value: "client",
              },
              {
                name: "MESSAGE",
                value: "Hello World from the client!",
              },
              {
                name: "UPSTREAM_URIS",
                value: upstreamUriString
              }
            ],
          }
        ]),
      }
    )
  }
}

export class EcsTaskDefinitionGold extends Construct {
  public def: EcsTaskDefinition
  
  constructor(
    scope: Construct,
    name: string,
    vars: Tfvars,
    executionRoleArn: string
  ) {
    super(scope, name)

    const nameTagPrefix = `${Fn.lookup(vars.defaultTags, "project", "")}`

    this.def = new EcsTaskDefinition(
      this,
      "task_definition",
      {
        family: `${nameTagPrefix}-gold`,
        memory: "512",
        cpu: "256",
        networkMode: "awsvpc",
        executionRoleArn,

        containerDefinitions: Fn.jsonencode([
          {
            name: "gold",
            image: "nicholasjackson/fake-service:v0.23.1",
            cpu: 0,
            essential: true,

            portMappings: [
              {
                containerPort: 9090,
                hostPort: 9090,
                protocol: "tcp",
              },
            ],

            environment: [
              {
                name: "NAME",
                value: "gold",
              },
              {
                name: "MESSAGE",
                value: "Hello World from the gold service!",
              },
              {
                name: "UPSTREAM_URIS",
                value: `http://${vars.databasePrivateIp}:27017`
              }
            ],
          }
        ]),
      }
    )
  }
}

export class EcsTaskDefinitionSilver extends Construct {
  public def: EcsTaskDefinition
  
  constructor(
    scope: Construct,
    name: string,
    vars: Tfvars,
    executionRoleArn: string
  ) {
    super(scope, name)

    const nameTagPrefix = `${Fn.lookup(vars.defaultTags, "project", "")}`

    this.def = new EcsTaskDefinition(
      this,
      "task_definition",
      {
        family: `${nameTagPrefix}-silver`,
        memory: "512",
        cpu: "256",
        networkMode: "awsvpc",
        executionRoleArn,

        containerDefinitions: Fn.jsonencode([
          {
            name: "silver",
            image: "nicholasjackson/fake-service:v0.23.1",
            cpu: 0,
            essential: true,

            portMappings: [
              {
                containerPort: 9090,
                hostPort: 9090,
                protocol: "tcp",
              },
            ],

            environment: [
              {
                name: "NAME",
                value: "silver",
              },
              {
                name: "MESSAGE",
                value: "Hello World from the silver service!",
              },
              {
                name: "UPSTREAM_URIS",
                value: `http://${vars.databasePrivateIp}:27017`
              }
            ],
          }
        ]),
      }
    )
  }
}