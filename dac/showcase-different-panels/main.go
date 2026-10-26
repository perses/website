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

package main

import (
	"flag"

	"github.com/perses/perses/go-sdk"
	"github.com/perses/perses/go-sdk/common"
	"github.com/perses/perses/go-sdk/dashboard"
	"github.com/perses/perses/go-sdk/panel"
	panelgroup "github.com/perses/perses/go-sdk/panel-group"
	barchart "github.com/perses/plugins/barchart/sdk/go"
	gauge "github.com/perses/plugins/gaugechart/sdk/go"
	heatmapchart "github.com/perses/plugins/heatmapchart/sdk/go"
	histogramchart "github.com/perses/plugins/histogramchart/sdk/go"
	markdown "github.com/perses/plugins/markdown/sdk/go"
	piechart "github.com/perses/plugins/piechart/sdk/go"
	promquery "github.com/perses/plugins/prometheus/sdk/go/query"
	statchart "github.com/perses/plugins/statchart/sdk/go"
	statushistorychart "github.com/perses/plugins/statushistorychart/sdk/go"
	table "github.com/perses/plugins/table/sdk/go"
	timeserieschart "github.com/perses/plugins/timeserieschart/sdk/go"
	timeseriestable "github.com/perses/plugins/timeseriestable/sdk/go"
)

const (
	sharedSummedPromQL = "sum(increase(prometheus_http_requests_total[1h]))"
	sharedRawPromQL    = "increase(prometheus_http_requests_total[1h])"
	topPromQLInstant   = "topk(2, increase(prometheus_http_requests_total[$__range]))"
)

func main() {
	flag.Parse()
	exec := sdk.NewExec()
	decimalUnit := common.DecimalUnit

	// DASHBOARD
	builder, buildErr := dashboard.New("showcase-different-panels",
		dashboard.ProjectName("showcase-dac"),
		dashboard.Name("Showcase of the different panels"),

		// PANELS
		dashboard.AddPanelGroup("TimeSeries panels",
			panelgroup.PanelsPerLine(3),
			panelgroup.AddPanel("Gauge Chart",
				gauge.Chart(
					gauge.Calculation(common.MeanCalculation),
					gauge.Format(common.Format{Unit: &decimalUnit}),
					gauge.Thresholds(common.Thresholds{
						Steps: []common.StepOption{
							{Value: 60},
						},
					}),
					gauge.Max(100),
				),
				panel.AddQuery(
					promquery.PromQL(topPromQLInstant),
				),
			),
			panelgroup.AddPanel("Bar Chart",
				barchart.Chart(),
				panel.AddQuery(
					promquery.PromQL(sharedRawPromQL, promquery.SeriesNameFormat("{{handler}}")),
				),
			),
			panelgroup.AddPanel("Pie Chart",
				piechart.Chart(
					piechart.Calculation(common.LastCalculation),
					piechart.WithVisual(piechart.Visual{OuterRadius: 80}),
				),
				panel.AddQuery(
					promquery.PromQL(sharedRawPromQL, promquery.SeriesNameFormat("{{handler}}")),
				),
			),
			panelgroup.AddPanel("Stat Chart",
				statchart.Chart(
					statchart.WithSparkline(statchart.Sparkline{}),
				),
				panel.AddQuery(
					promquery.PromQL(topPromQLInstant, promquery.SeriesNameFormat("{{handler}}")),
				),
			),
			panelgroup.AddPanel("Status History Chart",
				statushistorychart.Chart(),
				panel.AddQuery(
					promquery.PromQL(topPromQLInstant, promquery.SeriesNameFormat("{{handler}}")),
				),
			),
			panelgroup.AddPanel("Table",
				table.Table(),
				panel.AddQuery(
					promquery.PromQL(sharedRawPromQL),
				),
			),
			panelgroup.AddPanel("Time Series Chart",
				timeserieschart.Chart(),
				panel.AddQuery(
					promquery.PromQL(sharedRawPromQL),
				),
			),
			panelgroup.AddPanel("Time Series Table",
				timeseriestable.Chart(),
				panel.AddQuery(
					promquery.PromQL(sharedRawPromQL),
				),
			),
		),
		dashboard.AddPanelGroup("Native histogram panels",
			panelgroup.PanelsPerLine(3),
			panelgroup.AddPanel("Heatmap Chart",
				heatmapchart.Chart(),
				panel.AddQuery(
					promquery.PromQL(sharedSummedPromQL),
				),
			),
			panelgroup.AddPanel("Histogram Chart",
				histogramchart.Chart(),
				panel.AddQuery(
					promquery.PromQL(sharedSummedPromQL),
				),
			),
		),
		dashboard.AddPanelGroup("Other panels",
			panelgroup.PanelsPerLine(3),
			panelgroup.AddPanel("Markdown",
				markdown.Markdown("# A title\nAnd a description."),
				panel.AddQuery(
					promquery.PromQL(sharedSummedPromQL),
				),
			),
		),
	)

	exec.BuildDashboard(builder, buildErr)
}
