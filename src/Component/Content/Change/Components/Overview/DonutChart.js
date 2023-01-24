import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

const DonutChart = ({ widthChart, heightChart, series, label }) => {
    const [chartSetting, setChartSetting] = useState({
        options: {
            noData: {
                text: "Data is Empty",
                align: "left",
                verticalAlign: "middle",

                style: {
                    color: "#fff",
                    fontSize: "16px",
                    fontFamily: "Segoe UI",
                },
            },
            chart: {
                type: "donut",
            },
            labels: label,
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
            colors: ["#0E64E3", "#5F5F7A"],
            legend: {
                show: false,
                offsetY: 35,
                position: "right",
                labels: {
                    colors: ["white"],
                    fontSize: "24px",
                },
                markers: {
                    radius: 0,
                },
                height: 230,
            },
            stroke: {
                show: false,
            },
            dataLabels: {
                enabled: false,
            },
            plotOptions: {
                donut: {
                    expandOnClick: false,
                    customScale: 1,
                },
            },
        },
    });

    return (
        <div className='pie-chart-container'>
            <ReactApexChart
                options={chartSetting.options}
                series={series.map((val) => parseInt(val))}
                type={"donut"}
                key={series}
                height={"180px"}
                width={"200px"}
            />
            <div
                className='pie-chart-label'
                style={{ gap: "40px", marginTop: "5px" }}>
                {label.map((val, index) => {
                    return (
                        <div key={val} className='donut-label'>
                            <div
                                className='legend-icon'
                                id={`donut-${index}`}></div>
                            <span className='donut'>{val}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DonutChart;
