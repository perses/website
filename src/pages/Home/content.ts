// Copyright The Perses Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import type { Feature } from '../../components/FeatureSection/FeatureSection';

// Text and media of the home page. Links to the documentation always target the latest version.

export interface Highlight {
  title: string;
  description: string;
  icon: 'observability' | 'embeddable' | 'devops' | 'scale' | 'kubernetes' | 'extensible';
}

export const highlights: Highlight[] = [
  {
    title: 'Observability display',
    icon: 'observability',
    description:
      'Perses is first and foremost a dashboard tool that you can use to display a variety of observability data. It supports all four observability pillars through Prometheus metrics, Tempo traces, Loki logs and Pyroscope profiles. Other supported datasources can be found [here](/docs/perses/latest/concepts/datasource/).',
  },
  {
    title: 'Embeddable components',
    icon: 'embeddable',
    description: 'You can use Perses as-is or embed parts of it in your own UI as a single panel or a whole dashboard view.',
  },
  {
    title: 'DevOps-ready',
    icon: 'devops',
    description:
      'Perses offers a complete static validation of the dashboard format. It also comes with a CLI, `percli`, that can be used to perform actions in CI/CD pipelines.',
  },
  {
    title: 'Scale-friendly',
    icon: 'scale',
    description:
      'Perses dashboards can be written as code using the provided SDKs, enabling you to manage large numbers of dashboards at scale.',
  },
  {
    title: 'Kubernetes-native',
    icon: 'kubernetes',
    description:
      'Use the Perses operator to manage your Perses deployments & dashboards as CRDs. Leverage on the datasource discovery to retrieve data from your datasource pods/services.',
  },
  {
    title: 'Extensible',
    icon: 'extensible',
    description:
      'Perses, with its plugin-based architecture, offers effortless extension and reuse of plugins across different projects.',
  },
];

export interface FeatureGroup {
  title: string;
  features: Feature[];
  outro?: string;
}

export const featureGroups: FeatureGroup[] = [
  {
    title: 'Visualize your data',
    features: [
      {
        title: 'Monitoring with Prometheus',
        description:
          "Perses provides comprehensive Prometheus support with specialized panels for metrics visualization. It also comes with a built-in metrics explorer and a PromQL debugger that mirror Prometheus's native UI experience.",
        media: '/assets/images/home/monitoring.mp4',
        learnMore: '/docs/plugins/prometheus/',
      },
      {
        title: 'Tracing with Tempo',
        description:
          'Deep dive into your Tempo traces and display them in several ways: scatter plots, Gantt charts, or tables.',
        media: '/assets/images/home/tracing.mp4',
        learnMore: '/docs/plugins/tempo/',
      },
      {
        title: 'Logging with Loki',
        description: 'Search, filter and make sense of your Loki logs.',
        media: '/assets/images/home/logging.png',
        learnMore: '/docs/plugins/loki/',
      },
      {
        title: 'Profiling with Pyroscope',
        description: 'Visualize your Pyroscope profiling data through interactive flame graphs.',
        media: '/assets/images/home/profiling.mp4',
        learnMore: '/docs/plugins/pyroscope/',
      },
    ],
    outro:
      'Prometheus, Tempo, Loki, and Pyroscope are just the start. Perses also supports other datasources. [→ See all supported datasources.](/docs/perses/latest/concepts/datasource/)',
  },
  {
    title: 'Open ecosystem',
    features: [
      {
        title: 'Open specification for dashboards',
        description:
          'Perses is also an initiative to define a standardized dashboard specification, fostering interoperability across observability tools.',
        media: '/assets/images/home/open_spec.png',
        learnMore: '/docs/perses/latest/concepts/open-specification/',
      },
      {
        title: 'Embeddable components',
        description:
          'Perses provides various npm packages that allow developers to embed panels and dashboards into their own UIs, giving the flexibility to integrate Perses components without running the full application.',
        media: '/assets/images/home/embeddable_components2.png',
        learnMore: '/docs/perses/latest/embedding-panels/',
      },
      {
        title: 'Plugins',
        description:
          'Perses supports multiple kinds of plugins, enabling users to extend the tool’s native capabilities to suit specific needs.',
        media: '/assets/images/home/plugins.png',
        learnMore: '/docs/perses/latest/concepts/plugin/',
      },
    ],
  },
  {
    title: 'DevOps-ready',
    features: [
      {
        title: 'percli',
        description:
          'Perses comes with a native CLI, `percli`, which can be used to perform many kinds of actions in CI/CD pipelines.',
        media: '/assets/images/home/percli.png',
        learnMore: '/docs/perses/latest/cli/',
      },
      {
        title: 'Dashboard-as-Code',
        description:
          'Perses dashboards can be written as code using the provided SDKs. This enables you to define reusable components in libraries or leverage existing community libraries, from simple color codes to complex templates, for reuse across as many dashboards as you want.',
        media: '/assets/images/home/dac.png',
        learnMore: '/docs/perses/latest/concepts/dashboard-as-code/',
      },
      {
        title: 'Static validation',
        description:
          'Perses offers complete static validation of the dashboard format, which you can also extend with custom lint rules.',
        media: '/assets/images/home/static_validation.png',
        learnMore: '/docs/perses/latest/cli/#linter',
      },
      {
        title: 'Perses operator',
        description:
          'Deploy and manage Perses instances and dashboards declaratively using Kubernetes Custom Resources, enabling GitOps workflows and seamless integration with your existing K8s infrastructure.',
        media: '/assets/images/home/perses_operator.png',
        learnMore: '/docs/operator/latest/user-guide/',
      },
      {
        title: 'Datasource discovery',
        description:
          'Automatically discover and register datasources through HTTP services or Kubernetes API, eliminating manual configuration effort in dynamic environments.',
        media: '/assets/images/home/datasource_discovery.png',
        learnMore: '/docs/perses/latest/configuration/datasource-discovery/',
      },
    ],
  },
  {
    title: 'And more',
    features: [
      {
        title: 'Secure your access',
        description:
          'Perses provides comprehensive authentication and authorization capabilities. Choose from native user management or integrate with external OIDC/OAuth identity providers. Control access with Kubernetes-inspired RBAC system featuring roles, role bindings, and fine-grained permissions across projects and global resources.',
        media: '/assets/images/home/auth.png',
        learnMore: '/docs/perses/latest/concepts/authentication/',
      },
      {
        title: 'Grafana migration',
        description:
          'Seamlessly migrate your existing Grafana dashboards to Perses, using either the web UI to import JSON files directly or leveraging `percli` for batch migrations. The migration process translates Grafana definitions to their Perses equivalents on a best-effort basis.',
        media: '/assets/images/home/grafana_migration.mp4',
        learnMore: '/docs/perses/latest/migration/',
      },
      {
        title: 'Resources scopes',
        description:
          'Organize datasources and variables across three hierarchical scopes: global (available everywhere), project (shared within a project), and dashboard (specific to one dashboard). Lower scopes automatically override higher ones, enabling flexible resource reuse while allowing targeted customization for specific use cases.',
        media: '/assets/images/home/resources_scopes.png',
        learnMore: '/docs/perses/latest/concepts/datasource-and-variable-scopes/',
      },
    ],
  },
];
