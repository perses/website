# CUE SDK for Dashboard-as-Code

!!! info "Getting started with Dashboard as code"

    To get started with Dashboard-as-Code in Perses, have a look at the [DaC user guide](../../user-guides/dashboardascode.md) first.

This section provides detailed information about the CUE SDK to develop dashboards as code in Perses.
It's focusing on explaining how to use the different builders provided by the SDK, that you should rely on to simplify the coding.
Besides, you can always manipulate directly the base datamodel of the Perses dashboard, but this is less convenient.

See the dedicated pages for each builder:

* [Dashboard Builder](dashboardbuilder.md)
* [Panel Groups Builder](panelgroupsbuilder.md)

## Variable Related builders:
* [Variable Group Builder](variablegroupbuilder.md)
* [Static List Variable Builder](staticlistvariablebuilder.md)
* [Text Variable Builder](textvariablebuilder.md)

## Prometheus Related builders:
* [Filter Builder](filterbuilder.md)
* [Panel Builder](prometheuspanelbuilder.md)
    * Variable-related builders:
        * [Label Names Variable](labelnamesvariablebuilder.md)
        * [Label Values Variable](labelvaluesvariablebuilder.md)
        * [PromQL Variable](promqlvariablebuilder.md)

## Useful patterns

This section provides additional tips & tricks to help you develop dashboards as code:

### Declare intermediary objects for reusability

For code organization & to allow reuse/imports of definitions, it's often interesting to declare things like panels, variables etc. upfront and to pass them afterwards to the dashboard object.

Example:

```cue
package myDaC

import (
	dashboardBuilder "github.com/perses/perses/cue/dac-utils/dashboard"
	panelGroupsBuilder "github.com/perses/perses/cue/dac-utils/panelgroups"
	panelBuilder "github.com/perses/perses/cue/dac-utils/prometheus/panel"
	varGroupBuilder "github.com/perses/perses/cue/dac-utils/variable/group"
	promQLVarBuilder "github.com/perses/perses/cue/dac-utils/prometheus/variable/promql"
	promFilterBuilder "github.com/perses/perses/cue/dac-utils/prometheus/filter"
	timeseriesChart "github.com/perses/perses/cue/schemas/panels/time-series:model"
	promQuery "github.com/perses/perses/cue/schemas/queries/prometheus:model"
)

#myVarsBuilder: varGroupBuilder & {
	#input: [
		promQLVarBuilder & {
			#name:           "namespace"
			#metric:         "kube_namespace_labels"
			#allowMultiple:  true
			#datasourceName: "promDemo"
		},
		promQLVarBuilder & {
			#name:           "pod"
			#metric:         "kube_pod_info"
			#allowAllValue:  true
			#allowMultiple:  true
			#datasourceName: "promDemo"
		},
	]
}

#filter: { promFilterBuilder & #myVarsBuilder }.filter

#cpuPanel: panelBuilder & {
	spec: {
		display: name: "Container CPU"
		plugin: timeseriesChart
		queries: [
			{
				kind: "TimeSeriesQuery"
				spec: plugin: promQuery & {
					spec: query: "sum (container_cpu_usage_seconds{\(#filter)})"
				}
			},
		]
	}
}

dashboardBuilder & {
	#name:      "ContainersMonitoring"
	#project:   "MyProject"
	#variables: #myVarsBuilder.variables
	#panelGroups: panelGroupsBuilder & {
		#input: [
			{
				#title: "Resource usage"
				#cols:  3
				#panels: [
					#cpuPanel,
				]
			},
		]
	}
}
```

Once your code is organized this way, you can even split the different definitions in different files. This avoids e.g to have one very big file when you have a dashboard with lots of panels.

### Multiple variable groups

If you want 2 independant groups of variables on the same dashboard like "C depends on B that depends on A" and "F depends on E that depends on D", use 2 times the variable group builder independantly, then concat the lists.

Example:

```cue
package myDaC

import (
	"list"
	dashboardBuilder "github.com/perses/perses/cue/dac-utils/dashboard"
	panelGroupsBuilder "github.com/perses/perses/cue/dac-utils/panelgroups"
	panelBuilder "github.com/perses/perses/cue/dac-utils/prometheus/panel"
	varGroupBuilder "github.com/perses/perses/cue/dac-utils/variable/group"
	promQLVarBuilder "github.com/perses/perses/cue/dac-utils/prometheus/variable/promql"
	promFilterBuilder "github.com/perses/perses/cue/dac-utils/prometheus/filter"
	timeseriesChart "github.com/perses/perses/cue/schemas/panels/time-series:model"
	promQuery "github.com/perses/perses/cue/schemas/queries/prometheus:model"
)

#myCloudVarsBuilder: varGroupBuilder & {
	#input: [
		promQLVarBuilder & {
			#name:           "namespace"
			#metric:         "kube_namespace_labels"
			#allowMultiple:  true
			#datasourceName: "promDemo"
		},
		promQLVarBuilder & {
			#name:           "pod"
			#metric:         "kube_pod_info"
			#allowAllValue:  true
			#allowMultiple:  true
			#datasourceName: "promDemo"
		}
	]
}

#cloudFilter: { promFilterBuilder & #myCloudVarsBuilder }.filter

#myVMVarsBuilder: varGroupBuilder & {
	#input: [
		promQLVarBuilder & {
			#name:           "datacenter"
			#metric:         "node_uname_info"
			#allowMultiple:  true
			#datasourceName: "promDemo"
		},
		promQLVarBuilder & {
			#name:           "hostname"
			#metric:         "node_uname_info"
			#allowAllValue:  true
			#allowMultiple:  true
			#datasourceName: "promDemo"
		}
	]
}

#vmFilter: { promFilterBuilder & #myVMVarsBuilder }.filter

#containerCPUPanel: panelBuilder & {
	spec: {
		display: name: "Container CPU"
		plugin: timeseriesChart
		queries: [
			{
				kind: "TimeSeriesQuery"
				spec: plugin: promQuery & {
					spec: query: "sum (container_cpu_usage_seconds{\(#cloudFilter)})"
				}
			},
		]
	}
}

#vmCPUPanel: panelBuilder & {
	spec: {
		display: name: "VM CPU"
		plugin: timeseriesChart
		queries: [
			{
				kind: "TimeSeriesQuery"
				spec: plugin: promQuery & {
					spec: query: "sum (node_memory_MemTotal_bytes{\(#vmFilter)})"
				}
			},
		]
	}
}

dashboardBuilder & {
	#name:      "ContainersMonitoring"
	#project:   "MyProject"
	#variables: list.Concat([#myCloudVarsBuilder.variables, #myVMVarsBuilder.variables])
	#panelGroups: panelGroupsBuilder & {
		#input: [
			{
				#title: "Resource usage"
				#cols:  3
				#panels: [
					#containerCPUPanel,
					#vmCPUPanel,
				]
			},
		]
	}
}
```