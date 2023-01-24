import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

const BarChart = ({ series, label }) => {
    const [chartSetting, setChartSetting] = useState({
        series: [
            {
                data: [100, 200, 300, 400, 500],
            },
        ],
        options: {
            chart: {
                type: "bar",
                height: 350,
                toolbar: {
                    show: false,
                },
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    horizontal: true,
                    dataLabels: {
                        position: "bottom",
                    },
                },
            },
            dataLabels: {
                enabled: true,
                textAnchor: "start",
                style: {
                    colors: ["#fff"],
                },
                formatter: function (val, opt) {
                    return val;
                },
                offsetX: 0,
                dropShadow: {
                    enabled: true,
                },
            },

            xaxis: {
                categories: label || [],
                labels: {
                    style: {
                        colors: ["white"],
                    },
                },
            },
            yaxis: {
                labels: {
                    style: {
                        colors: ["white"],
                        fontSize: "14px",
                        fontWeight: 600,
                        fontFamily: "Segoe UI",
                    },
                },
            },
            tooltip: {
                enabled: true,
                theme: true,
                custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                    return (
                        '<div class="arrow_box">' +
                        "<span>" +
                        w.globals.labels[dataPointIndex] +
                        ": " +
                        series[seriesIndex][dataPointIndex] +
                        "</span>" +
                        "</div>"
                    );
                },
            },
            grid: {
                show: false,
                yaxis: {
                    lines: {
                        show: false,
                    },
                },
                xaxis: {
                    lines: {
                        show: false,
                    },
                },
            },
        },
    });
    useEffect(() => {
        setChartSetting((prev) => {
            prev.options = {
                ...prev.options,
                xaxis: { ...prev.options.xaxis, categories: label },
            };
            return { ...prev };
        });
    }, [label]);
    return (
        <ReactApexChart
            options={chartSetting.options}
            series={series}
            type={"bar"}
            width={"100%"}
            key={series}
        />
    );
};

export default BarChart;
