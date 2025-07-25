---
hide:
  - navigation
  - toc
  - search
  - path
title: Perses
---

<!-- below css is required to remove the empty header that is generated automatically by mkdocs ref: https://github.com/squidfunk/mkdocs-material/issues/2163#issuecomment-2109733111-->
<style>
.md-content .md-typeset h1 {
      display: none;
  }
</style>

<div class="centered image" markdown>
![Perses logo](assets/images/logos/Perses_dark_theme.png#only-dark) ![Perses logo](assets/images/logos/Perses_light_theme.png#only-light)
## An open specification for dashboards. The open dashboard tool for Prometheus and other data sources.
</div>

![perses overview](assets/images/perses_overview.gif)

<div class="grid cards" markdown>

-   ## Observability display
    ---
    Perses is first and foremost a dashboard tool that you can use to display a variety of observability data. Today supports Prometheus metrics, Tempo traces & Pyroscope profiles.

-   ## Embeddable components
    ---
    You can use Perses as-is or embed parts of it in your own UI, could it be a single panel or a whole dashboard view.

-   ## DevOps-ready
    ---
    Perses offers a complete static validation of the dashboard format. It also comes with a CLI, `percli`, that can be used to perform actions in CI/CD pipelines.

-   ## Scale-friendly
    ---
    Perses dashboards can be written as code using the provided SDKs, enabling you to manage large numbers of dashboards at scale.

-   ## Kubernetes-native
    ---
    Use the Perses operator to manage your Perses deployments & dashboards as CRDs. Leverage on the datasource discovery to retrieve data from your datasource pods/services.

-   ## Extensible
    ---
    Perses, with its plugin-based architecture, offers effortless extension and reuse of plugins across different projects.

</div>

...and more to discover!

<div class="features-showcase-wrapper" markdown>

## Visualize your data

{{ feature(
    title="Monitoring with Prometheus",
    description="Perses provides comprehensive Prometheus support with specialized panels for metrics visualization. It also comes with a built-in metrics explorer and a PromQL debugger that mirror Prometheus's native UI experience.",
    image="assets/images/perses_overview.gif"
) }}

{{ feature(
    title="Tracing with Tempo",
    description="Deep dive into your Tempo traces and display them in several ways: scatter plots, Gantt charts, or tables.",
    image="assets/images/perses_overview.gif",
    reverse=True
) }}

{{ feature(
    title="Profiling with Pyroscope",
    description="Visualize your Pyroscope profiling data through interactive flame graphs.",
    image="assets/images/perses_overview.gif",
) }}

...more data sources to come!

## Open ecosystem

{{ feature(
    title="Open specification for dashboards",
    description="Perses is also an initiative to define a standardized dashboard specification, fostering interoperability across observability tools.",
    image="assets/images/perses_overview.gif",
    reverse=True
) }}

{{ feature(
    title="Embeddable components",
    description="Perses provides various npm packages that allow developers to embed panels and dashboards into their own UIs, giving the flexibility to integrate Perses components without running the full application.",
    image="assets/images/perses_overview.gif",
) }}

{{ feature(
    title="Plugins",
    description="Perses supports multiple kinds of plugins, enabling users to extend the tool’s native capabilities to suit specific needs.",
    image="assets/images/perses_overview.gif",
    reverse=True
) }}

## DevOps-ready

{{ feature(
    title="percli",
    description="Perses comes with a native CLI, `percli`, that can be used to perform many kind of actions in CI/CD pipelines.",
    image="assets/images/perses_overview.gif",
) }}

{{ feature(
    title="Dashboard-as-Code",
    description="Perses dashboards can be written as code using the provided SDKs. This enables you to define reusable components in libraries or leverage existing community libraries, from simple color codes to complex templates, for reuse across as many dashboards as you want.",
    image="assets/images/perses_overview.gif",
    reverse=True
) }}

{{ feature(
    title="Static validation",
    description="Perses offers a complete static validation of the dashboard format, that you can also extend with custom lint rules.",
    image="assets/images/perses_overview.gif",
) }}

{{ feature(
    title="Perses operator",
    description="Deploy and manage Perses instances and dashboards declaratively using Kubernetes Custom Resources, enabling GitOps workflows and seamless integration with your existing K8s infrastructure.",
    image="assets/images/perses_overview.gif",
    reverse=True
) }}

{{ feature(
    title="Datasource discovery",
    description="Automatically discover and register datasources through HTTP services or Kubernetes API, eliminating manual configuration effort in dynamic environments.",
    image="assets/images/perses_overview.gif",
) }}

## And more

{{ feature(
    title="Secure your access",
    description="Perses provides comprehensive authentication and authorization capabilities. Choose from native user management or integrate with external OIDC/OAuth identity providers. Control access with Kubernetes-inspired RBAC system featuring roles, role bindings, and fine-grained permissions across projects and global resources.",
    image="assets/images/perses_overview.gif",
    reverse=True
) }}

{{ feature(
    title="Grafana migration",
    description="Seamlessly migrate your existing Grafana dashboards to Perses, using either the web UI to import JSON files directly or leveraging `percli` for batch migrations. The migration process translates Grafana definitions to their Perses equivalents on a best-effort basis.",
    image="assets/images/perses_overview.gif",
) }}

{{ feature(
    title="Resources scopes",
    description="Organize datasources and variables across three hierarchical scopes: global (available everywhere), project (shared within a project), and dashboard (specific to one dashboard). Lower scopes automatically override higher ones, enabling flexible resource reuse while allowing targeted customization for specific use cases.",
    image="assets/images/perses_overview.gif",
    reverse=True
) }}

<!--

An Observability frontend
    Metrics
    Traces
    Profiling
    (Explorer)
An open platform
    Open spec for dashboards
    Extend the spec by providing your own plugin
    Embeddable Components
GitOps-friendly
    Percli
    Dashboard as Code
    Operator / CRD
    Datasource Discovery
...And more features!
    Secure your access
    Grafana migration
    Resources scopes

-->

</div>

<!-- Add more features as needed, alternating image and text order for each block -->
<div class="centered" markdown>

## Open Source

Perses is 100% open source and community-driven. All components are available under
the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0) on [GitHub](https://github.com/perses).

Perses is a [Cloud Native Computing Foundation](https://cncf.io) sandbox project.

[![CNCF logo](assets/images/logos/CNCF_dark_theme.png#only-dark)](https://cncf.io) [![CNCF logo](assets/images/logos/CNCF_light_theme.png#only-light)](https://cncf.io)

</div>

<div class="centered" markdown>

## Adopters

</div>

<div class="grid cards image-grid" markdown>

- [![Amadeus logo](assets/images/logos/Amadeus_dark_theme.png#only-dark)](https://amadeus.com) [![Amadeus logo](assets/images/logos/Amadeus_light_theme.png#only-light)](https://amadeus.com)
- [![Chronosphere logo](assets/images/logos/Chronosphere_dark_theme.svg#only-dark)](https://chronosphere.io/) [![Chronosphere logo](assets/images/logos/Chronosphere_light_theme.svg#only-light)](https://chronosphere.io/)
- [![Dash0 logo](assets/images/logos/Dash0.svg)](https://www.dash0.com/)
- [![Enlighten logo](assets/images/logos/Enlighten_dark_theme.png#only-dark)](https://enlighten.com) [![Enlighten logo](assets/images/logos/Enlighten_light_theme.png#only-light)](https://enlighten.com)
- [![GIGAPIPE logo](assets/images/logos/Gigapipe.svg)](https://gigapipe.com)
- [![Greptime logo](assets/images/logos/Greptime_dark_theme.svg#only-dark)](https://greptime.com/) [![Greptime logo](assets/images/logos/Greptime_light_theme.svg#only-light)](https://greptime.com/)
- [![Pydantic logo](assets/images/logos/Pydantic_dark_theme.png#only-dark)](https://pydantic.dev/) [![Pydantic logo](assets/images/logos/Pydantic_light_theme.png#only-light)](https://pydantic.dev/)
- [![RedHat logo](assets/images/logos/RedHat_dark_theme.png#only-dark)](https://www.redhat.com) [![RedHat logo](assets/images/logos/RedHat_light_theme.png#only-light)](https://www.redhat.com)
- [![SAP logo](assets/images/logos/SAP.svg)](https://www.sap.com)
- [Your company logo here](./adopters.md)

</div>
