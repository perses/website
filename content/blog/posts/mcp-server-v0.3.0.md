---
date: 2026-11-17
slug: release-mcp-server-v030
categories:
  - Release notes
authors:
  - Akshay Iyyadurai Balasundaram
  - Augustin Husson
---

# Release Perses MCP Server v0.3.0

Perses MCP Server v0.3.0 is out. Agents can now look up which metrics exist before writing PromQL, get
compact query results instead of raw Prometheus responses, edit one dashboard panel without rewriting the
whole dashboard, and validate changes before saving them. The server also tells every MCP client how to
combine its tools.

We compared v0.3.0 and v0.2.0 in 240 agent sessions on real dashboard and investigation tasks. With v0.3.0,
**task success went from 74% to 93%**, **panels querying metrics that don't exist dropped by 90%**, and
**each successful task was 15% cheaper**.

The server grows from 58 to 71 tools. Visit the
[Perses MCP Server repository](https://github.com/perses/mcp-server) to learn more.

![Task success and cost per successful task, v0.2.0 vs v0.3.0](../../assets/images/blog/mcp-server-v030/headline.png)

## Prometheus discovery and query tools

In v0.2.0, agents got raw Prometheus responses that were often hundreds of kilobytes, enough to fill the
agent's context window and leave room for mistakes.

The new read-only `prometheus` resource adds five tools:

| Tool | What it does |
|---|---|
| `perses_list_prometheus_metric_names` | List metric names, filtered with `search` or `match`, optionally with type and help |
| `perses_list_prometheus_label_names` | List label names |
| `perses_list_prometheus_label_values` | List the values of a label |
| `perses_get_prometheus_metric_metadata` | Get type, help and unit of 1–20 metrics (`_bucket`, `_total`, … resolve to their family) |
| `perses_query_prometheus` | Run an instant or range PromQL query and get a compact result |

| Same request on a Prometheus from one of our test environments | v0.2.0 | v0.3.0 |
|---|---|---|
| Find metrics matching `http_requests` | 1.1 MB (all metric names) | 1.2 KB |
| 1h range query, 103 series | 888 KB | 3.1 KB (top 20 of 103 series, per-series statistics) |
| 6h range query, 2 series | 26 KB | 0.7 KB |
| Query over 1 MiB | cut off at 1 MiB | error that tells the agent to aggregate (`sum by`, `topk`) |

### How it works

- **Your credentials stay in Perses.** The tools go through Perses, so the agent never sees datasource
  secrets and can only do what its Perses permissions allow.
- **Same data as your dashboards.** The tools use your default Prometheus datasource and its settings,
  unless the agent picks another one.
- **Summaries instead of raw data.** For a time range, the agent gets the minimum, maximum, average and
  latest value of each series, with the busiest series first.
- **Errors the agent can act on.** When a query is wrong or too large, the agent is told why and how to
  fix it.

Across the 240 agent sessions, metric queries returned **95% less data** (8 MB vs 176 MB).

![Query data per task](../../assets/images/blog/mcp-server-v030/query-data-per-task.png)

### Lighter on your Prometheus too

The summaries are computed by the MCP server, so a single query still costs Prometheus the same. What
changes is how agents use Prometheus:

- **Lookups cover a recent time window.** When an agent looks up metric or label names, it asks about
  the past hour by default, not everything Prometheus has stored.
- **Range queries use the same resolution as your dashboards** (the scrape interval of the datasource,
  1 minute by default), not finer.
- **Fewer wasted queries.** Agents check names before querying, so fewer queries are wrong from the
  start, and fewer saved panels query metrics that don't exist (each of those runs on every dashboard
  refresh). In our eval, queries that timed out on Prometheus dropped from **95 to 2**.

## Server instructions

With about 70 tools, models tend to skip discovery and guess metric names. In the eval, v0.2.0 agents saved
40 panels querying metrics or label values that never existed in the datasource. A typical example is
`opensearch_threadpool_tasks_number{type="rejected"}`: a plausible name, but not one this cluster exports.

The server now sends
[instructions](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle#initialization) on
`initialize`. They describe how to combine the tools, not what each tool does:

1. Use the same `datasource` for discovery and queries.
2. Before writing PromQL, check metric and label names and metric types.
3. Query with `perses_query_prometheus`, not the raw proxy tools, and pass the same `time_range` to the
   discovery tools for past ranges.
4. Existing dashboard panels show which metrics matter for a system.

### Built from your configuration

The instructions are built from the registered tools, so they never mention a tool you have turned off:

| Configuration | Tools | Instructions |
|---|---|---|
| default | 71 | 1,038 characters |
| `read_only: true` | 35 | 1,038 characters |
| `resources: "prometheus,dashboard"` | 13 | 834 characters |
| `resources: "dashboard"` | 8 | 101 characters (one sentence) |

They follow the MCP guidance in
[Server Instructions: Giving LLMs a user manual for your server](https://blog.modelcontextprotocol.io/posts/2025-11-03-using-server-instructions/).
In the eval, agents checked metric or label names before their first query in **103 of 120** sessions. With
v0.2.0 they never did, because v0.2.0 has no tools for it.

![Panels querying metrics that don't exist](../../assets/images/blog/mcp-server-v030/nonexistent-metric-panels.png)

> [!NOTE]
> Hosts handle instructions differently. opencode, Claude Code and VS Code put them in the system
> prompt. pi only shows them if the model asks for them, and the gain there was smaller (67% → 77% with GPT-6.1 Sol).

## Incremental dashboard editing and compact reads

In v0.2.0, changing one panel meant reading the full dashboard JSON and writing all of it back. For a
30-panel dashboard, that is about 23 KB each way.

| Tool | What it does |
|---|---|
| `perses_set_dashboard_panels` | Add, replace or remove panels (and their layout items) |
| `perses_set_dashboard_variables` | Add, replace or remove variables by name |
| `perses_set_dashboard_layout` | Define, replace or remove a panel group (`panels_per_line`, `panel_height`) |

| On a 30-panel dashboard | v0.2.0 | v0.3.0 |
|---|---|---|
| Read the dashboard | 22.7 KB, full JSON | 4.9 KB outline |
| Read one panel | – | 0.8 KB (`panels: ["key"]`) |
| Add one panel | ~24.5 KB sent | 424 B sent, 359 B summary back |

Write tools also accept `dry_run`, `expected_version` and `include_dashboard`. Edits made through one server
are serialized, so parallel tool calls don't overwrite each other's changes. In the eval, agents made **173
partial writes and only 39 full writes**, and sent 66% less dashboard JSON. For a one-panel fix, the median
write dropped from 25.7 KB to 0.8 KB.

## Validation and plugin schema tools

| Tool | Resource | What it does |
|---|---|---|
| `perses_validate_dashboard` | `validate` | Validate against the installed plugin CUE schemas, without saving |
| `perses_validate_variable` | `validate` | Validate a project or global variable |
| `perses_list_plugin_schemas` | `schema` | All installed plugin schemas |
| `perses_get_plugin_schema` | `schema` | The schema of one plugin kind (StatChart: 573 bytes) |

An invalid StatChart `calculation` returns the CUE error itself
(`conflicting values "first" and "not-a-calc"`), so the agent can fix the field instead of guessing. These
tools stay available in read-only mode. The schema tools need **Perses v0.55 or later**.

## Reliability fixes

- **One bad tool call no longer crashes the server** ([#132](https://github.com/perses/mcp-server/pull/132)). In v0.2.0, a dashboard with a Grid item without
  `content` crashed the process with a nil pointer, and every later call failed. In v0.3.0 it returns a
  tool error and the session continues.
- **Works with Perses v0.55.** v0.2.0's `perses_list_plugins` fails with `invalid plugin kind JsonQuery`.
- **Credentials are never sent to another host.** The datasource tools no longer follow redirects.
- The process **exits with status code 1** when the transport fails, for example when the port is in use ([#133](https://github.com/perses/mcp-server/pull/133)).
- The Docker images expose port 8000 for the HTTP transport ([#110](https://github.com/perses/mcp-server/pull/110)).
- `perses_create_project` accepts descriptions with spaces ([#111](https://github.com/perses/mcp-server/pull/111)), and `perses_create_project_variable` sets
  the variable's value ([#112](https://github.com/perses/mcp-server/pull/112)).
- New documentation: overview, installation, configuration, deployment, clients and tools ([#109](https://github.com/perses/mcp-server/pull/109)).

## How we measured

We ran 240 agent sessions: 6 tasks (health check, new dashboard, add panels, fix a "no data" panel, a
multi-turn investigation, and a vague "add performance panels" request) × 2 harnesses (opencode, pi) ×
2 models (Claude Opus 5.5, GPT-6.1 Sol) × 5 runs, for each version. The target was a 12-node OpenSearch cluster
behind Thanos-backed Prometheus datasources, with both versions running in parallel against the same Perses
instance. Sessions were scored automatically from the saved dashboards and the agent's answers. No sessions
were re-run or excluded.

| | v0.2.0 | v0.3.0 |
|---|---|---|
| Task success | 74% (89/120) | **93% (112/120)** |
| Panels querying metrics that don't exist | 40 | **4** |
| Cost per successful session | $0.34 | **$0.29** |
| Median wall time | 74 s | 65 s |

If you have feedback, please open an issue in the
[Perses MCP Server repository](https://github.com/perses/mcp-server/issues).
