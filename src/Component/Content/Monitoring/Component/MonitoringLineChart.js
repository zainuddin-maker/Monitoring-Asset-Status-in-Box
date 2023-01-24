import React, { useState, useEffect, useCallback } from "react";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";

import {
    Tooltip,
    LoadingData,
    generateDateGMT8,
} from "../../../ComponentReuseable/index";
import { getToken } from "../../../TokenParse/TokenParse";
import axios from "axios";
import { toast } from "react-toastify";
import resetZoom from "../../../../svg/reset-zoom.svg";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { generateAnnotation } from "./AnnotationGenerator";

const MonitoringLineChart = ({
    tag,
    tag_name,
    generateLimit,
    date,
    formatDate,
    generateOverview,
    tagLength,
    statusSeries,
    isStatus,
}) => {
    const [realTime, setRealTime] = useState(false);
    const requestInterval = 5000;

    const [loading, setLoading] = useState({
        chart: false,
        info: false,
        chartLatest: false,
        infoLatest: false,
    });

    // line chart
    const defaultOption = {
        chart: {
            animations: {
                enabled: false,
            },
            id: tag_name,
            type: "area",
            height: 140,
            toolbar: {
                show: false,
                tools: {
                    download: false,
                    selection: false,
                    zoom: false,
                    reset: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                },
            },
            background: "#08091B",
            sparkline: {
                enabled: false,
            },
        },
        stroke: {
            width: 2,
        },
        legend: {
            show: false,
        },
        grid: {
            show: true,
            xaxis: {
                lines: {
                    show: true,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        markers: {
            strokeColors: [
                () => {
                    return "#e5131d";
                },
            ],
            size: 3,
            hover: {
                size: 3,
                sizeOffset: 3,
            },
        },
        yaxis: [
            {
                // min: tag.min,
                // max: (max) => {
                //     console.log("he", max);
                //     return max;
                // },
                tickAmount: 2,
                labels: {
                    style: {
                        colors: ["white"],
                    },
                },
            },
            {
                opposite: true,
                labels: {
                    show: false,
                },
            },
            {
                labels: {
                    show: false,
                },
            },
        ],
        xaxis: {
            type: "datetime",
            min: new Date(new Date(date).setHours(0, 0, 0)).getTime(),
            max: new Date(new Date(date).setHours(23, 30)).getTime(),
            labels: {
                style: {
                    colors: "white",
                },
                datetimeUTC: false,
                format: "HH:mm",
            },
            tooltip: {
                // enabled: false,
            },
        },
        tooltip: {
            // enabled: false,
            // enabledOnSeries: [0],
            x: {
                format: "HH:mm:ss",
            },
            custom: ({ series, seriesIndex, dataPointIndex, w }) => {
                return `<div class="chart-tooltip">${
                    series[seriesIndex][dataPointIndex]
                } ${tag.unit ? tag.unit : ""}<div>`;
            },
        },
        colors: ["#00A629", "#FEBC2C", "#F11B2A"],
        fill: {
            colors: ["#00A629", "#FEBC2C", "#F11B2A"],
            type: "gradient",
            gradient: {
                shadeIntensity: 0.8,
                opacityFrom: 0.7,
                opacityTo: 0.1,
                // stops: [10, 100],
            },
        },
        annotations: {
            position: "front",
            yaxis: [],
        },
    };
    const [lineChart, setLineChart] = useState({
        series: [
            {
                name: "series1",
                data: [],
            },
        ],
        options: defaultOption,
    });

    // parameters
    const [parameters, setParameters] = useState({
        value: 0,
        unit: "",
        warning: 0,
        critical: 0,
    });

    // GENERATE chart options
    const generateOptions = (
        tag_name,
        unit,
        date,
        min,
        max,
        tag,
        series = []
    ) => {
        let yMax = 0;
        let yMin = 0;
        const options = {
            chart: {
                animations: {
                    enabled: false,
                },
                id: tag_name,
                type: "area",
                height: 140,
                toolbar: {
                    show: false,
                    tools: {
                        download: false,
                        selection: false,
                        zoom: false,
                        reset: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,
                    },
                },
                background: "#08091B",
            },
            stroke: {
                width: 2,
            },
            legend: {
                show: false,
            },
            grid: {
                show: true,
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
            },
            dataLabels: {
                enabled: false,
            },
            markers: {
                strokeColors: [
                    () => {
                        return "#e5131d";
                    },
                ],
                size: 3,
                hover: {
                    size: 3,
                    sizeOffset: 3,
                },
            },
            yaxis: [
                {
                    min: min,
                    max: max,
                    tickAmount: 2,
                    labels: {
                        style: {
                            colors: ["white"],
                        },
                    },
                },
                {
                    axisBorder: {
                        show: true,
                        color: "#c3c3c5",
                        offsetX: 0,
                        offsetY: 1,
                    },
                    opposite: true,
                    min: min,
                    max: max,
                    tickAmount: 2,
                    labels: {
                        show: false,
                    },
                },
                {
                    min: min,
                    max: max,
                    tickAmount: 2,
                    labels: {
                        show: false,
                    },
                },
            ],
            xaxis: {
                type: "datetime",
                min: new Date(new Date(date).setHours(0, 0, 0)).getTime(),
                max: new Date(new Date(date).setHours(23, 30)).getTime(),
                labels: {
                    style: {
                        colors: "white",
                    },
                    datetimeUTC: false,
                    format: "HH:mm",
                },
                tooltip: {
                    // enabled: false,
                },
            },
            tooltip: {
                // enabled: false,
                // enabledOnSeries: [0],
                x: {
                    format: "HH:mm:ss",
                },
                custom: ({ series, seriesIndex, dataPointIndex, w }) => {
                    return `<div class="chart-tooltip">${
                        series[seriesIndex][dataPointIndex]
                    } ${unit ? unit : ""}<div>`;
                },
            },
            colors: ["#00A629", "#FEBC2C", "#F11B2A"],
            fill: {
                colors: ["#00A629", "#FEBC2C", "#F11B2A"],
                type: "gradient",
                gradient: {
                    shadeIntensity: 0.8,
                    opacityFrom: 0.7,
                    opacityTo: 0.1,
                    // stops: [10, 100],
                },
            },
            annotations: {
                position: "front",
                yaxis: [],
            },
        };

        if (isNaN(max) || max === null) {
            // delete options.yaxis[0].max
            options.yaxis[0].max = (max) => {
                // yMax = max;
                return max + 1;
            };
            options.yaxis[1].max = undefined;
            options.yaxis[2].max = undefined;
            yMax =
                lineChart.series[0].data.length > 0 || series.length > 0
                    ? series.length > 0
                        ? Math.max(
                              ...series
                                  .filter((data) => data.y !== null)
                                  .map((data) => data.y)
                          ) + 1
                        : Math.max(
                              ...lineChart["series"][0]["data"]
                                  .filter((data) => data.y !== null)
                                  .map((data) => data.y)
                          ) + 1
                    : 0;
        } else {
            yMax = max;
        }
        if (isNaN(min) || min === null) {
            // delete options.yaxis[0].max
            options.yaxis[0].min =
                lineChart.series[0].data.length > 0 || series.length > 0
                    ? series.length > 0
                        ? Math.min(
                              ...series
                                  .filter((data) => data.y !== null)
                                  .map((data) => data.y)
                          ) - 1
                        : Math.min(
                              ...lineChart["series"][0]["data"]
                                  .filter((data) => data.y !== null)
                                  .map((data) => data.y)
                          ) - 1
                    : 0;
            options.yaxis[1].min = undefined;
            options.yaxis[2].min = undefined;
            yMin =
                lineChart.series[0].data.length > 0 || series.length > 0
                    ? series.length > 0
                        ? Math.min(
                              ...series
                                  .filter((data) => data.y !== null)
                                  .map((data) => data.y)
                          ) - 1
                        : Math.min(
                              ...lineChart["series"][0]["data"]
                                  .filter((data) => data.y !== null)
                                  .map((data) => data.y)
                          ) - 1
                    : 0;
        } else {
            yMin = min;
        }
        options.annotations.yaxis = generateAnnotation(
            tag.warning,
            tag.second_warning,
            tag.warning_comparison,
            tag.critical,
            tag.second_critical,
            tag.critical_comparison,
            yMax,
            yMin
        );
        return options;
    };
    const [dummySeries, setDummySeries] = useState([
        {
            name: "series1",
            data: [],
        },
    ]);
    // parse chart data threshold from tag
    useEffect(() => {
        let cancelToken = axios.CancelToken.source();
        let interval = null;
        console.log("tag monitoring chart");
        console.log(tag);
        if (tag && realTime) {
            // const prevOptions = lineChart.options;
            const prevOptions = generateOptions(
                tag_name,
                tag.unit,
                date,
                tag.min,
                tag.max,
                tag
            );

            prevOptions.xaxis.min = new Date(formatDate(date)).setHours(
                0,
                0,
                0
            );
            prevOptions.xaxis.max = new Date(formatDate(date)).setHours(23, 30);
            prevOptions.chart.id = tag_name;

            setParameters((prev) => {
                return {
                    ...prev,
                    unit: tag.unit,
                    warning: tag.warning || "---",
                    critical: tag.critical || "---",
                };
            });

            setLineChart((prev) => {
                return {
                    ...prev,
                    options: prevOptions,
                };
            });
            // update options (max min warning critical) and redraw
            // ApexCharts.exec(
            //     tag_name,
            //     "updateOptions",
            //     prevOptions,
            //     false,
            //     true,
            //     true
            // );

            // can used to update chart series data (except the warning & critical)
            // GET LATEST DATA USING INTERVAL

            // get new status chart data using interval
            const getLatestChart = async () => {
                const loadingTimeout = setTimeout(() => {
                    setLoading((prev) => {
                        if (
                            generateDateGMT8(
                                new Date(date)
                            ).toLocaleDateString() ===
                            generateDateGMT8(new Date()).toLocaleDateString()
                        ) {
                            prev.chartLatest = true;
                        }
                        prev.infoLatest = true;
                        return { ...prev };
                    });
                }, 10000);

                const config = {
                    method: "get",
                    url:
                        ReturnHostBackend(process.env.REACT_APP_RAW_DATA) +
                        process.env.REACT_APP_MONITORING_LATEST +
                        `/${tag.asset_number}/${tag_name}`,
                    headers: {
                        authorization: getToken(),
                    },
                    cancelToken: cancelToken.token,
                };

                axios(config)
                    .then((response) => {
                        console.log(
                            "response.data REACT_APP_MONITORING_LATEST  "
                        );
                        console.log(response.data);
                        if (response.data.length > 0) {
                            let prevSeries = [
                                {
                                    name: "series1",
                                    data: [],
                                },
                            ];

                            if (response.data[0].tagValue) {
                                let newData = response.data[0];
                                let value = parseFloat(
                                    parseFloat(newData.tagValue).toFixed(2)
                                );

                                if (
                                    generateDateGMT8(
                                        new Date(date)
                                    ).toLocaleDateString() ===
                                        generateDateGMT8(
                                            new Date()
                                        ).toLocaleDateString() &&
                                    tag.name === newData.tagName
                                ) {
                                    if (lineChart.series[0].data.length > 0) {
                                        if (
                                            lineChart.series[0].data[
                                                lineChart.series[0].data
                                                    .length - 1
                                            ].y === value ||
                                            (generateDateGMT8(
                                                new Date(newData.timestamp)
                                            ).getHours() <
                                                generateDateGMT8(
                                                    new Date(
                                                        lineChart.series[0].data[
                                                            lineChart.series[0]
                                                                .data.length - 1
                                                        ].x
                                                    )
                                                ).getHours() &&
                                                generateDateGMT8(
                                                    new Date(newData.timestamp)
                                                ).getMinutes() <
                                                    generateDateGMT8(
                                                        new Date(
                                                            lineChart.series[0].data[
                                                                lineChart
                                                                    .series[0]
                                                                    .data
                                                                    .length - 1
                                                            ].x
                                                        )
                                                    ).getMinutes()) ||
                                            isNaN(value)
                                        ) {
                                            // console.log("not push");
                                            // not push new data
                                        } else {
                                            // console.log("push data");
                                            prevSeries[0].data.push({
                                                x: generateDateGMT8(new Date()),
                                                y: value,
                                                fillColor: comparatorFunction(
                                                    tag,
                                                    value
                                                ),
                                            });
                                        }
                                    } else if (!isNaN(value)) {
                                        prevSeries[0].data.push({
                                            x: generateDateGMT8(new Date()),
                                            y: value,
                                            fillColor: comparatorFunction(
                                                tag,
                                                value
                                            ),
                                        });
                                    }
                                    setLineChart((prev) => {
                                        return {
                                            ...prev,
                                            series: [
                                                {
                                                    name: "series1",
                                                    data: [
                                                        ...prev.series[0].data,
                                                        ...prevSeries[0].data,
                                                    ],
                                                },
                                            ],
                                        };
                                    });
                                    // update options
                                    const prevOptions = generateOptions(
                                        tag_name,
                                        tag.unit,
                                        date,
                                        tag.min,
                                        tag.max,
                                        tag,
                                        [
                                            ...lineChart.series[0].data,
                                            ...prevSeries[0].data,
                                        ]
                                    );

                                    prevOptions.xaxis.min = new Date(
                                        formatDate(date)
                                    ).setHours(0, 0, 0);
                                    prevOptions.xaxis.max = new Date(
                                        formatDate(date)
                                    ).setHours(23, 30);
                                    prevOptions.chart.id = tag_name;

                                    setLineChart((prev) => {
                                        return {
                                            ...prev,
                                            options: prevOptions,
                                        };
                                    });
                                }
                                setParameters((prev) => {
                                    return { ...prev, value: value };
                                });
                            } else {
                                setParameters((prev) => {
                                    return { ...prev, value: "---" };
                                });
                            }
                        }
                        clearTimeout(loadingTimeout);
                        // setTimeout(() => {
                        setLoading((prev) => ({
                            ...prev,
                            chartLatest: false,
                            infoLatest: false,
                        }));
                        // }, 500);
                    })
                    .catch((err) => {
                        console.log(err);
                        clearTimeout(loadingTimeout);
                        // setTimeout(() => {
                        setLoading((prev) => ({
                            ...prev,
                            chartLatest: false,
                            infoLatest: false,
                        }));
                        // }, 500);
                        if (err.message !== undefined) {
                            toast.error("Failed to get realtime data", {
                                toastId: "error",
                            });
                        }
                    });
            };

            const fetchData = async () => {
                try {
                    await getLatestChart();
                } catch (error) {
                    // console.log(error);
                }

                if (interval) {
                    interval = setTimeout(fetchData, requestInterval);
                }
            };

            interval = setTimeout(fetchData, 1);
        }
        return () => {
            if (interval !== null) {
                clearTimeout(interval);
                interval = null;
            }

            cancelToken.cancel();
        };
    }, [tag, date, tag_name, realTime, dummySeries[0].data]);

    useEffect(() => {
        let interval = null;
        let cancelToken = axios.CancelToken.source();

        // GET CHART DATA FROM DB
        const getChartData = async () => {
            setLoading((prev) => ({ ...prev, chart: true }));
            const formData = new FormData();
            // YYYY-MM-DD
            formData.append("date", date);
            formData.append("tag", JSON.stringify(tag));
            formData.append("tag_group", tag.tag_group);
            const config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env.REACT_APP_MONITORING_GET_CHART_LINE,
                data: formData,
                headers: {
                    authorization: getToken(),
                },
                cancelToken: cancelToken.token,
            };

            try {
                const response = await axios(config);
                let prevSeries = [
                    {
                        name: "series1",
                        data: [],
                    },
                ];
                if (response.status === 200) {
                    // console.log("response.data REACT_APP_MONITORING_GET_CHART_LINE");
                    // console.log(response.data);
                    // const chartS = response.data;
                    // console.log(statusSeries);
                    const chartS = response.data;
                    // const chartS = parsingStatusSeries(
                    //     statusSeries,
                    //     response.data,
                    //     tag
                    // );
                    if (chartS.length > 0) {
                        prevSeries[0] = {
                            name: "series1",
                            data: chartS.map((data) => ({
                                ...data,
                                x: new Date(data.x),
                            })),
                        };
                    }

                    setLineChart((prev) => {
                        return {
                            ...prev,
                            series: prevSeries,
                            // options: prevOptions,
                        };
                    });
                    // setLineChart((prev) => {
                    //     prev.series[0].name = prevSeries[0].name;
                    //     prev.series[0].data = parsingStatusSeries(
                    //         statusSeries,
                    //         prevSeries[0].data
                    //     );
                    //     // console.log(newData);
                    //     return {
                    //         ...prev,
                    //         series: prevSeries,
                    //     };
                    // });

                    // ApexCharts.exec(tag_name, "updateSeries", prevSeries);
                    // ApexCharts.exec(
                    //     tag_name,
                    //     "updateOptions",
                    //     lineChart.options,
                    //     false,
                    //     true,
                    //     true
                    // );
                } else {
                    // console.log(response);
                    toast.error("Cannot get line chart data", {
                        toastId: "error-line",
                    });
                }
                setDummySeries((prev) => {
                    prev[0].data = prevSeries[0].data;
                    return { ...prev };
                });
                setRealTime(true);
                setLoading((prev) => ({ ...prev, chart: false }));
            } catch (error) {
                setRealTime(false);

                if (error.message !== undefined) {
                    toast.error("Cannot get line chart data", {
                        toastId: "error-line",
                    });
                }

                setLoading((prev) => ({ ...prev, chart: false }));
            }
        };
        const fetchData = async () => {
            try {
                await getChartData();
            } catch (error) {
                // console.log(error);
            }
        };

        interval = setTimeout(fetchData, 1);

        return () => {
            clearTimeout(interval);
            interval = null;
            cancelToken.cancel();
            setLineChart((prev) => {
                return {
                    ...prev,
                    series: [
                        {
                            name: "series1",
                            data: [],
                        },
                    ],
                };
            });
        };
    }, [tag, date, tag_name]);

    useEffect(() => {
        // console.log("statusSeries");
        // console.log(statusSeries);
        if (lineChart.series[0]) {
            setLineChart((prev) => {
                prev.series[0].data = parsingStatusSeries(
                    statusSeries,
                    prev.series[0].data
                );

                return {
                    ...prev,
                };
            });
        }
    }, [statusSeries, lineChart.series]);

    return (
        <div
            className='line-chart-child'
            style={tagLength === 3 ? { height: "100%" } : { height: "auto" }}>
            <div className='chart-info'>
                <LoadingData
                    useDarkBackground={true}
                    isLoading={loading.info}
                    size='100px'
                    useAltBackground={true}
                />
                <Tooltip
                    tooltip={
                        <div
                            style={{
                                color: "white",
                                minWidth: "100px",
                                textAlign: "center",
                            }}>
                            <span>{tag_name}</span>
                        </div>
                    }>
                    <div className='chart-info-title'>{tag_name}</div>
                </Tooltip>
                <span>Value</span>
                <div className='value-container'>
                    <div>
                        {isNaN(parameters.value) ? "---" : parameters.value}
                    </div>
                    <div>{parameters.unit}</div>
                </div>
                <div className='condition-container'>
                    <div>
                        <span>Warning</span>
                        <div className='condition-parameter'>
                            <div>
                                {generateOverview(
                                    tag.warning_comparison,
                                    tag.warning,
                                    tag.second_warning
                                )}
                            </div>
                        </div>
                    </div>
                    <div>
                        <span>Critical</span>
                        <div className='condition-parameter'>
                            <div>
                                {generateOverview(
                                    tag.critical_comparison,
                                    tag.critical,
                                    tag.second_critical
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                style={{
                    width: "85%",
                    alignItems: "center",
                    position: "relative",
                }}>
                <LoadingData
                    isLoading={loading.chart}
                    useAltBackground={true}
                    size='120px'
                />
                <ReactApexChart
                    series={lineChart.series}
                    options={lineChart.options}
                    type='area'
                    height={140}
                />

                {/* <img
                    src={resetZoom}
                    alt='reset-coom'
                    onClick={() =>
                        setLineChart((prev) => ({
                            ...prev,
                            options: generateOptions(
                                tag_name,
                                tag.unit,
                                date,
                                tag.min,
                                tag.max,
                                tag
                            ),
                        }))
                    }
                    className='reset-zoom-chart'
                    style={{ right: "37px" }}
                /> */}
            </div>
        </div>
    );
};

export default MonitoringLineChart;

//
const comparatorFunction = (tag, value) => {
    let critical_comparison = tag.critical_comparison;
    let warning_comparison = tag.warning_comparison;
    let critical = tag.critical;
    let second_critical = tag.second_critical;
    let warning = tag.warning;
    let second_warning = tag.second_warning;
    // COLOR LIST
    let color = {
        good: "#00A629",
        warning: "#FEBC2C",
        critical: "#F11B2A",
    };
    // PROCESSING
    if (warning_comparison) {
        if (compare(value, warning, warning_comparison, second_warning)) {
            if (
                compare(value, critical, critical_comparison, second_critical)
            ) {
                return color.critical;
            } else {
                return color.warning;
            }
        } else if (
            compare(value, critical, critical_comparison, second_critical)
        ) {
            return color.critical;
        } else {
            return color.good;
        }
    } else {
        if (compare(value, critical, critical_comparison, second_critical)) {
            return color.critical;
        } else {
            return color.good;
        }
    }
};

const compare = (val, val1, compType, val2) => {
    switch (compType) {
        case "LOWER_THAN":
            if (val1 !== null && val1 !== undefined) {
                return val < val1;
            } else {
                return false;
            }
        case "LOWER_THAN_EQUAL":
            if (val1 !== null && val1 !== undefined) {
                return val <= val1;
            } else {
                return false;
            }
        case "HIGHER_THAN":
            if (val1 !== null && val1 !== undefined) {
                return val > val1;
            } else {
                return false;
            }
        case "HIGHER_THAN_EQUAL":
            if (val1 !== null && val1 !== undefined) {
                return val >= val1;
            } else {
                return false;
            }
        case "HIGHER_THAN_AND_LOWER":
            if (
                val1 !== null &&
                val1 !== undefined &&
                val2 !== null &&
                val2 !== undefined
            ) {
                return val > val1 || val < val2;
            } else {
                return false;
            }
        case "HIGHER_THAN_EQUAL_AND_LOWER":
            if (
                val1 !== null &&
                val1 !== undefined &&
                val2 !== null &&
                val2 !== undefined
            ) {
                return val >= val1 || val < val2;
            } else {
                return false;
            }
        case "HIGHER_THAN_AND_LOWER_EQUAL":
            if (
                val1 !== null &&
                val1 !== undefined &&
                val2 !== null &&
                val2 !== undefined
            ) {
                return val > val1 || val < val2;
            } else {
                return false;
            }
        case "HIGHER_THAN_EQUAL_AND_LOWER_EQUAL":
            if (
                val1 !== null &&
                val1 !== undefined &&
                val2 !== null &&
                val2 !== undefined
            ) {
                return val >= val1 || val <= val2;
            } else {
                return false;
            }
        case "BETWEEN":
            // FIRST VALUE ALWAYS GREATER THAN SECOND
            if (
                val1 !== null &&
                val1 !== undefined &&
                val2 !== null &&
                val2 !== undefined
            ) {
                return val2 < val && val < val1;
            } else {
                return false;
            }
        default:
            return false;
    }
};

//parsing offline status
const insertArrayAt = (array, index, arrayToInsert) => {
    Array.prototype.splice.apply(array, [index, 0].concat(arrayToInsert));
    return array;
};
const lastIndexOf = (arr, keyValue, start) => {
    for (let i = arr.length - 1; i >= start; i--) {
        if (new Date(arr[i].x) < new Date(keyValue)) {
            return i;
        }
    }
    return -1;
};
function getAllIndexes(arr, val) {
    let indexes = [],
        i;
    for (i = 0; i < arr.length; i++)
        if (
            new Date(arr[i].x) <= new Date(val.data[0].y[1]) &&
            new Date(arr[i].x) >= new Date(val.data[0].y[0])
        ) {
            indexes.push(i);
        }
    return indexes;
}
function dynamicSort(property) {
    let sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        /* next line works with strings and numbers,
         * and you may want to customize it to your needs
         */
        let result =
            new Date(a[property]) < new Date(b[property])
                ? -1
                : new Date(a[property]) > new Date(b[property])
                ? 1
                : 0;
        return result * sortOrder;
    };
}
const parsingStatusSeries = (statusSeries, chartSeries) => {
    // console.log(statusSeries, chartSeries);
    statusSeries = statusSeries.filter(
        (data) =>
            data.name !== null &&
            (data.name.toLowerCase() === "offline" ||
                data.name.toLowerCase() === "down") &&
            data.data[0].x.toLowerCase() === "status"
    );

    if (statusSeries.length > 0) {
        let resultParsed = chartSeries;

        statusSeries.forEach((status, index) => {
            resultParsed = resultParsed.filter((el) => {
                return el.x < status.data[0].y[0] || el.x > status.data[0].y[1];
            });
        });

        statusSeries.forEach((status) => {
            // lastValue after unknown
            const lastLastData = chartSeries.find(
                (el) => el.x > status.data[0].y[1]
            );

            // const lastFirstData = chartSeries
            //     .reverse()
            //     .find(
            //         (el) => new Date(el.x) < new Date(status.data[0].y[0])
            //     );
            const foundValChartIdx = lastIndexOf(
                chartSeries,
                status.data[0].y[0],
                0
            );
            const lastFirstData = chartSeries[foundValChartIdx];
            // make 3 data: 1 = first value, 2 = null between first and last, 3 = last value
            if (lastFirstData) {
                resultParsed.push({
                    x: status.data[0].y[0],
                    y: lastFirstData.y || null,
                    fillColor: lastFirstData.fillColor,
                });
            }
            resultParsed.push({
                x: new Date(
                    new Date(status.data[0].y[0]).getTime() +
                        (new Date(status.data[0].y[1]).getTime() -
                            new Date(status.data[0].y[0]).getTime()) /
                            2
                ),
                y: null,
            });
            if (lastLastData) {
                resultParsed.push({
                    x: status.data[0].y[1],
                    y: lastLastData.y || null,
                    fillColor: lastLastData.fillColor,
                });
            }
            // }
        });

        resultParsed = resultParsed.sort(dynamicSort("x"));
        return resultParsed;
    } else {
        return chartSeries;
    }
    // console.log(result);
};
