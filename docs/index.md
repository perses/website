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

    Perses is first and foremost a dashboard tool that you can use to display a variety of observability data. Today
    supports Prometheus metrics & Tempo traces.

-   ## Embeddable components

    ---

    You can use Perses as-is or embed parts of it in your own UI, could it be a single panel or a whole dashboard view.

-   ## GitOps-friendly

    ---

    Perses offers a complete static validation of the dashboard format. It also comes with a CLI, `percli`, that can be
    used to perform actions in CI/CD pipelines.

-   ## Scale-friendly

    ---

    Perses dashboards can be written as-code using the provided SDKs. This enables to define any kind of components in
    libraries, from simple color codes to complex templates, for reusage across as much dashboards as you want.

-   ## Kubernetes-native

    ---

    Use the Perses operator to manage your Perses deployments & dashboards as CRDs. Leverage on the datasource discovery
    to retrieve data from your datasource pods/services.

-   ## Extensible

    ---

    Perses, with its plugin-based architecture, offers effortless extension and reuse of plugins across different
    projects.

</div>

...and more to discover!

<div class="features-showcase-wrapper" markdown>

{{ feature(
    title="Observability Display", 
    description="Perses is first and foremost a dashboard tool that you can use to display a variety of observability data. Today supports Prometheus metrics & Tempo traces.", 
    image="assets/images/feature1.png"
) }}

{{ feature(
    title="Embeddable Components", 
    description="You can use Perses as-is or embed parts of it in your own UI, could it be a single panel or a whole dashboard view.", 
    image="assets/images/feature2.png", 
    reverse=True
) }}

{{ feature(
    title="GitOps-friendly", 
    description="Perses offers a complete static validation of the dashboard format. It also comes with a CLI, `percli`, that can be used to perform actions in CI/CD pipelines.", 
    image="assets/images/feature3.png"
) }}

{{ feature(
    title="Scale-friendly", 
    description="Perses dashboards can be written as-code using the provided SDKs. This enables to define any kind of components in libraries, from simple color codes to complex templates, for reusage across as much dashboards as you want.", 
    image="assets/images/feature4.png", 
    reverse=True
) }}

{{ feature(
    title="Kubernetes-native", 
    description="Use the Perses operator to manage your Perses deployments & dashboards as CRDs. Leverage on the datasource discovery to retrieve data from your datasource pods/services.", 
    image="assets/images/feature5.png"
) }}

{{ feature(
    title="Extensible", 
    description="Perses, with its plugin-based architecture, offers effortless extension and reuse of plugins across different projects.", 
    image="assets/images/feature6.png", 
    reverse=True
) }}

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
