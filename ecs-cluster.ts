/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { Fn } from "cdktf"
import * as ecs from '@cdktf/provider-aws/lib/ecs-cluster';
import { Construct } from "constructs"
import { Tfvars } from "./variables"

export class EcsCluster extends Construct {
  public cluster: ecs.EcsCluster

  constructor(
    scope: Construct,
    name: string,
    vars: Tfvars
  ) {
    super(scope, name)

    const nameTagPrefix = `${Fn.lookup(vars.defaultTags, "project", "")}`

    this.cluster = new ecs.EcsCluster(this, name, {
      name: `${nameTagPrefix}-cluster`,
    })
  }
}