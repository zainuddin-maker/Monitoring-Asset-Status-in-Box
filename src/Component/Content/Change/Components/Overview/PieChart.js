import React, { useState, useEffect, useRef } from "react";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";

const PieChart = ({ widthChart, heightChart, categories, label, id }) => {
    // console.log({ widthChart, heightChart, categories, label, id });
    const [chartSetting, setChartSetting] = useState({
        series: categories || [],
        options: {
            noData: {
                text: "No Data",
                align: "center",
                verticalAlign: "middle",

                style: {
                    color: "#fff",
                    fontSize: "16px",
                    fontFamily: "Segoe UI",
                },
            },
            chart: {
                type: "pie",
                id: id,
            },
            colors: [
                "#5F5F7A",
                "#4244D4",
                "#597BD9",
                "#FEBC2C",
                "#00A629",
                "#F11B2A",
            ],
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 200,
                        },
                        legend: {
                            position: "bottom",
                        },
                    },
                },
            ],
            labels: [],
            legend: {
                show: false,
                position: "right",

                labels: {
                    colors: ["white"],
                },
                markers: {
                    radius: 0,
                },

                // height: "100%",
            },
            stroke: {
                show: false,
            },
            plotOptions: {
                pie: {
                    expandOnClick: false,
                    customScale: 1,
                },
            },
            dataLabels: {
                enabled: false,
                colors: ["#F44336", "#E91E63", "#9C27B0"],
            },
        },
    });

    useEffect(() => {
        setChartSetting((prev) => {
            prev.options = {
                ...prev.options,

                legend: { ...prev.options.legend },
                plotOptions: { ...prev.options.plotOptions },
                labels: label,
                tooltip: {
                    ...prev.options.tooltip,
                    tooltip: {
                        custom: function ({
                            series,
                            seriesIndex,
                            dataPointIndex,
                            w,
                        }) {
                            return (
                                '<div class="tooltip-container" ' +
                                `id=${`label-${seriesIndex}`} ` +
                                ">" +
                                "<span>" +
                                label[seriesIndex] +
                                ":" +
                                [seriesIndex] +
                                "</span>" +
                                "</div>"
                            );
                        },
                    },
                },
            };
            return { ...prev };
        });
    }, [label]);

    return (
        <div className='pie-chart-container'>
            <ReactApexChart
                options={chartSetting.options}
                series={categories.map((val) => parseInt(val))}
                type={"pie"}
                key={categories}
                height={
                    id === "overview-rack-category" ||
                    id === "overview-item-category"
                        ? "150px"
                        : "170px"
                }
                width='200px'
            />
            <div className='pie-chart-label'>
                {label.map((val, index) => {
                    return (
                        <div key={val} className='row-label'>
                            <div
                                className='legend-icon'
                                id={`label-${index}`}></div>
                            <span
                                style={{
                                    width:
                                        id === "overview-item-category" &&
                                        "150px",
                                }}>
                                {val}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PieChart;
