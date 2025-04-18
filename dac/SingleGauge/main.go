package main

import (
	"flag"

	"github.com/perses/perses/go-sdk"
	"github.com/perses/perses/go-sdk/common"
	"github.com/perses/perses/go-sdk/dashboard"
	"github.com/perses/perses/go-sdk/panel"
	panelgroup "github.com/perses/perses/go-sdk/panel-group"
	gauge "github.com/perses/perses/go-sdk/panel/gauge"
	"github.com/perses/perses/go-sdk/prometheus/query"
)

func main() {
	flag.Parse()
	exec := sdk.NewExec()

	// DASHBOARD
	builder, buildErr := dashboard.New("GaugeChartPanel",
		dashboard.ProjectName("showcase-dac"),

		// PANELS
		dashboard.AddPanelGroup("Row 1",
			panelgroup.PanelsPerLine(3),
			panelgroup.AddPanel("Single Gauge",
				gauge.Chart(
					gauge.Calculation(common.MeanCalculation),
					gauge.Format(common.Format{
						Unit: string(common.PercentMode),
					}),
					gauge.Thresholds(common.Thresholds{
						Steps: []common.StepOption{
							{
								Value: 20,
							},
						},
					}),
				),
				panel.AddQuery(
					query.PromQL("100 - ((node_memory_MemAvailable_bytes{env=\"demo\", instance=\"demo.prometheus.io:9100\"} * 100) / node_memory_MemTotal_bytes{env=\"demo\", instance=\"demo.do.prometheus.io:9100\"})"),
				),
			),
			panelgroup.AddPanel("Second Gauge",
				gauge.Chart(
					gauge.Calculation(common.LastCalculation),
					gauge.Format(common.Format{
						Unit: common.BytesUnit,
					}),
					gauge.Max(20),
				),
				panel.AddQuery(
					query.PromQL("100 - ((node_memory_MemAvailable_bytes{env=\"demo\", instance=\"demo.prometheus.io:9100\"} * 100) / node_memory_MemTotal_bytes{env=\"demo\", instance=\"demo.do.prometheus.io:9100\"})"),
				),
			),
		),
	)

	exec.BuildDashboard(builder, buildErr)
}
