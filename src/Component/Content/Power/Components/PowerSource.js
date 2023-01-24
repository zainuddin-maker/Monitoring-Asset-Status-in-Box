// System library imports
import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { toast } from "react-toastify";
import axios from "axios";

// Custom library imports
import { emptyDataAll, emptyDataA, emptyDataB } from "./DummyData";
import {
    LoadingData,
    generateDateGMT8,
} from "../../../ComponentReuseable/index";
import { IsAllOption } from "./Validation";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { getToken } from "../../../TokenParse/TokenParse";

// import resetZoom from "../../../../svg/reset-zoom.svg";

// Constants
const REFRESH_PERIOD_MS = 5000; // 1m
const REFRESH_LOADING_THRESHOLD_MS = 10000; // 10s

const chartLegends = [
    { label: "Main", color: "#4244D4" }, //#6991ff
    { label: "Generator", color: "#49F2DB" },
    { label: "Battery", color: "#9A77CF" },
    { label: "Coupling Powered", color: "#FEBC2C" },
    { label: "Down", color: "#F11B2A" },
    { label: "Offline", color: "rgb(81, 65, 76)" },
];

const emptyChartSetting = {
    series: emptyDataAll,
    options: {
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
        chart: {
            animations: {
                enabled: false,
            },
            height: 250,
            type: "rangeBar",
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
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: "50%",
                rangeBarGroupRows: true,
            },
        },
        colors: [
            "#4244D4",
            "#49F2DB",
            "#9A77CF",
            "#FEBC2C",
            "#F11B2A",
            "rgb(81, 65, 76)",
        ],
        fill: {
            type: "solid",
        },
        yaxis: [
            {
                labels: {
                    minWidth: 70,
                    // maxWidth: 250,
                    style: {
                        colors: ["white"],
                        fontSize: "12px",
                        // fontWeight: 500,
                        fontFamily: "Segoe UI",
                        cssClass: "apexcharts-yaxis-label",
                    },

                    formatter: (value) => {
                        if (typeof value === "string") {
                            let first =
                                "\u00A0" + value.split(" ")[0] + "\u00A0\u00A0";
                            let next = value.split(" ").slice(1).join(" ");
                            return [first, next];
                        } else {
                            return value;
                        }
                    },
                },
            },
        ],
        xaxis: {
            axisBorder: {
                show: false,
                color: "#c3c3c5",
                offsetX: 957,
                offsetY: -1,
            },
            type: "datetime",
            min: generateDateGMT8(new Date()).setHours(0),
            max: generateDateGMT8(new Date()).setHours(24),

            labels: {
                show: true,
                style: {
                    colors: ["white"],
                    fontSize: "12px",
                    fontFamily: "Segoe UI",
                    fontWeight: 500,
                    cssClass: "apexcharts-xaxis-label",
                },
                datetimeUTC: false,
            },
        },
        legend: {
            show: false,
            position: "right",
            fontSize: "16px",
            fontFamily: "Segoe UI",
            formatter: (value) => {
                return " " + value;
            },
            labels: {
                colors: ["white"],
            },
            markers: {
                radius: 0,
            },
            onItemClick: {
                toggleDataSeries: false,
            },
            onItemHover: {
                highlightDataSeries: false,
            },
        },

        tooltip: {
            custom: (opts) => {
                const padZero = (number) => {
                    if (number > 9) {
                        return number.toString();
                    } else {
                        return String(number).padStart(2, "0");
                    }
                };

                const start = new Date(opts.y1);
                const finish = new Date(opts.y2);
                const condition = opts.w.globals.seriesNames[opts.seriesIndex];
                return `<div class="chart-tooltip">
                <div>${padZero(start.getHours())}:${padZero(
                    start.getMinutes()
                )}:${padZero(start.getSeconds())} - ${padZero(
                    finish.getHours()
                )}:${padZero(finish.getMinutes())}:${padZero(
                    finish.getSeconds()
                )}</div>
                <div>${condition}</div>
                <div>`;
            },
        },
    },
};

const PowerSource = (props) => {
    // Destructure props
    const { filter, startDate, triggerGetPowerSourceAsset } = props;

    // States
    const [isLoading, setIsLoading] = useState(false);
    const [chartPowerSource, setChartPowerSource] = useState(emptyChartSetting);

    // Functions
    const convertResponseToChartData = (data) => {
        // Prepare initial data
        let mainData = [];
        let generatorData = [];
        let batteryData = [];
        let downData = [];
        let offlineData = [];
        let couplingData = [];

        Object.keys(data).forEach((key) => {
            if (data[key] && data[key].length > 0) {
                data[key].forEach((row) => {
                    if (row.value === "MAIN") {
                        mainData.push({
                            x: key,
                            y: [
                                new Date(row.start_date).getTime(),
                                new Date(row.end_date).getTime(),
                            ],
                        });
                    } else if (row.value === "GENERATOR") {
                        generatorData.push({
                            x: key,
                            y: [
                                new Date(row.start_date).getTime(),
                                new Date(row.end_date).getTime(),
                            ],
                        });
                    } else if (row.value === "BATTERY") {
                        batteryData.push({
                            x: key,
                            y: [
                                new Date(row.start_date).getTime(),
                                new Date(row.end_date).getTime(),
                            ],
                        });
                    } else if (row.value === "DOWN") {
                        downData.push({
                            x: key,
                            y: [
                                new Date(row.start_date).getTime(),
                                new Date(row.end_date).getTime(),
                            ],
                        });
                    } else if (row.value === "OFFLINE") {
                        offlineData.push({
                            x: key,
                            y: [
                                new Date(row.start_date).getTime(),
                                new Date(row.end_date).getTime(),
                            ],
                        });
                    } else if (row.value === "COUPLING_POWERED") {
                        couplingData.push({
                            x: key,
                            y: [
                                new Date(row.start_date).getTime(),
                                new Date(row.end_date).getTime(),
                            ],
                        });
                    }
                });
            } else {
                mainData.push({
                    x: key,
                    y: [
                        generateDateGMT8(new Date()).setHours(0),
                        generateDateGMT8(new Date()).setHours(0),
                    ],
                });
            }
        });

        let mainUsages = {
            name: "Main",
            data: mainData,
        };

        let generatorUsages = {
            name: "Generator",
            data: generatorData,
        };

        let batteryUsages = {
            name: "Battery",
            data: batteryData,
        };

        let couplingUsages = {
            name: "Coupling Powered",
            data: couplingData,
        };

        let downUsages = {
            name: "Down",
            data: downData,
        };

        let offlineUsages = {
            name: "Offline",
            data: offlineData,
        };

        let ret = [];
        ret.push(mainUsages);
        ret.push(generatorUsages);
        ret.push(batteryUsages);
        ret.push(couplingUsages);
        ret.push(downUsages);
        ret.push(offlineUsages);

        return ret;
    };

    // Side-effects
    // Get chart data
    useEffect(() => {
        // Internal variables
        let interval = null;
        let cancelToken = axios.CancelToken.source();
        let mounted = true;
        let loadingTimer = null;
        let count = 0;

        // Internal functions
        const getChartData = async (powerSourceType) => {
            // Call service to get the chart data
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env.REACT_APP_POWER_GET_RANGEBAR_CHART_DATA,
                headers: {
                    authorization: getToken(),
                },
                data: {
                    start_date: startDate,
                    power_source_type_id: IsAllOption(filter.powerSourceType)
                        ? ""
                        : filter.powerSourceType && filter.powerSourceType.id
                        ? filter.powerSourceType.id
                        : "",
                },
                cancelToken: cancelToken.token,
            };

            try {
                const result = await axios(config);

                if (result.status === 200) {
                    let { data } = result;

                    if (
                        !data ||
                        (data && data.isEmpty) ||
                        typeof data === "string"
                    ) {
                        if (IsAllOption(filter.powerSourceType)) {
                            if (mounted) {
                                setChartPowerSource((prev) => ({
                                    ...prev,
                                    series: emptyDataAll,
                                }));
                            }
                        } else {
                            if (
                                powerSourceType &&
                                powerSourceType.name === "A"
                            ) {
                                // A
                                if (mounted) {
                                    setChartPowerSource((prev) => ({
                                        ...prev,
                                        series: emptyDataA,
                                    }));
                                }
                            } else if (
                                powerSourceType &&
                                powerSourceType.name === "B"
                            ) {
                                // B
                                if (mounted) {
                                    setChartPowerSource((prev) => ({
                                        ...prev,
                                        series: emptyDataB,
                                    }));
                                }
                            }
                        }
                    } else {
                        if (mounted) {
                            setChartPowerSource((prev) => {
                                let prevOptions = prev.options;
                                let prevXAxis = prevOptions.xaxis;

                                return {
                                    ...prev,
                                    series: convertResponseToChartData(data),
                                    options: {
                                        ...prevOptions,
                                        xaxis: {
                                            ...prevXAxis,
                                            min: new Date(startDate).setHours(
                                                0
                                            ),
                                            max: new Date(startDate).setHours(
                                                24
                                            ),
                                        },
                                    },
                                };
                            });
                        }
                    }
                } else {
                    toast.error("Error getting power source usage data", {
                        toastId: "error-get-ps-usage",
                    });
                }
            } catch (e) {
                if (!axios.isCancel(e)) {
                    toast.error(
                        "Error calling API to get power source usage data",
                        { toastId: "error-get-ps-usage" }
                    );
                }
            }
        };

        // Internal function
        const fetchData = async () => {
            if (count === 0) {
                // Set isLoading to TRUE
                if (mounted) {
                    setIsLoading(true);
                }
            } else {
                loadingTimer = setTimeout(() => {
                    // Set isLoading to TRUE
                    if (mounted) {
                        setIsLoading(true);
                    }
                }, REFRESH_LOADING_THRESHOLD_MS);
            }

            ++count;
            await getChartData(filter.powerSourceType);

            // Clear timeout for setting loading to TRUE
            clearTimeout(loadingTimer);
            loadingTimer = null;

            // Set isLoading to FALSE
            if (mounted) {
                setIsLoading(false);
            }

            if (mounted && interval) {
                interval = setTimeout(fetchData, REFRESH_PERIOD_MS);
            }
        };

        interval = setTimeout(fetchData, 10);

        return () => {
            clearTimeout(interval);
            interval = null;
            clearTimeout(loadingTimer);
            loadingTimer = null;
            cancelToken.cancel();
            mounted = false;
        };
    }, [filter.powerSourceType, startDate, triggerGetPowerSourceAsset]);

    return (
        <div className='power-source-container'>
            <LoadingData
                size='100px'
                isLoading={isLoading}
                useDarkBackground={true}
            />
            <div className='power-source-status-chart'>
                <div className='power-source-status-chart__chart'>
                    <ReactApexChart
                        options={chartPowerSource.options}
                        series={chartPowerSource.series}
                        type='rangeBar'
                        height={"100%"}
                        width={"100%"}
                    />
                    <div className='power-source-status-chart__chart__end-border' />
                </div>
                <div className='power-source-status-chart__legend'>
                    {chartLegends.map((legend, index) => (
                        <div
                            key={`legend_${index}`}
                            className='power-source-status-chart__legend__row'>
                            <div
                                className='power-source-status-chart__legend__row__color'
                                style={{ backgroundColor: legend.color }}
                            />
                            <span className='power-source-status-chart__legend__row__label'>
                                {legend.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* <img
                src={resetZoom}
                alt='reset-coom'
                onClick={() =>
                    setChartPowerSource((prev) => ({
                        ...prev,
                        options: emptyChartSetting.options,
                    }))
                }
                className='reset-zoom-chart'
                style={{ right: "120px" }}
            /> */}
        </div>
    );
};

export default PowerSource;
