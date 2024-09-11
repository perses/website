# Reference

This section will give you an insight on every resource supported by the Perses API. While it can give you some
explanations about the purpose of each resource, this documentation is mainly for users that would like to interact
directly with the API and manipulate the resources without using the UI.

On the different documentations, you will find the definition of each resource in the yaml format.
Brackets indicate that a parameter is optional.

Generic placeholders are defined as follows:

* `<boolean>`: a boolean that can take the values `true` or `false`
* `<duration>`: a duration matching the regular
  expression `((([0-9]+)y)?(([0-9]+)w)?(([0-9]+)d)?(([0-9]+)h)?(([0-9]+)m)?(([0-9]+)s)?(([0-9]+)ms)?|0)`,
  e.g. `1d`, `1h30m`, `5m`, `10s`
* `<filename>`: a valid path in the current working directory
* `<path>`: a valid URL path
* `<int>`: an integer value
* `<secret>`: a regular string that is a secret, such as a password
* `<string>`: a regular string

## Table of contents

1. [Project](project.md)
1. [Dashboard](dashboard.md)
    1. [Specification](dashboard.md#dashboard-specification)
    1. [API definition](dashboard.md#api-definition)
1. [Datasource](datasource.md)
    1. [Choose a scope](datasource.md#choose-a-scope)
    1. [Specification](datasource.md#datasource-specification)
    1. [API definition](datasource.md#api-definition)
1. [EphemeralDashboard](ephemeral-dashboard.md)
    1. [Specification](ephemeral-dashboard.md#ephemeral-dashboard-specification)
    1. [API definition](ephemeral-dashboard.md#api-definition)
1. [Secret](secret.md)
    1. [Specification](secret.md#secret-specification)
    1. [API definition](secret.md#api-definition)
1. [User](user.md)
    1. [Specification](user.md#user-specification)
    1. [API definition](user.md#api-definition)
1. [Variable](variable.md)
    1. [Choose a scope](variable.md#choose-a-scope)
    1. [Specification](variable.md#variable-specification)
    1. [API definition](variable.md#api-definition)
1. [Role](role.md)
    1. [Choose a scope](datasource.md#choose-a-scope)
    1. [Specification](role.md#role-specification)
    1. [API definition](role.md#api-definition)
1. [RoleBinding](rolebinding.md)
    1. [Choose a scope](./rolebinding.md#choose-a-scope)
    1. [Specification](./rolebinding.md#rolebinding-specification)
    1. [API definition](./rolebinding.md#api-definition)
1. Plugins
     1. [Panels](../plugins/panelplugins.md)
        1. [BarChart](../plugins/panelplugins.md#barchart)
        1. [GaugeChart](../plugins/panelplugins.md#gaugechart)
        1. [Markdown](../plugins/panelplugins.md#markdown)
        1. [StatChart](../plugins/panelplugins.md#statchart)
        1. [TimeSeriesChart](../plugins/panelplugins.md#timeserieschart)
     1. [Prometheus](../plugins/prometheusplugins.md)
        1. [Datasource](../plugins/prometheusplugins.md#datasource)
        1. [Query](../plugins/prometheusplugins.md#query)
        1. [Variable](../plugins/prometheusplugins.md#variable)