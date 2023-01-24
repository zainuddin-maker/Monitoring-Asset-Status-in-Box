// System library imports
import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";
import { toast } from "react-toastify";
import axios from "axios";

// Custom library imports
import {
    // intervals,
    // chartMenu,
    // chartPowerSubMenu,
    // chartWaterSubMenu,
    pueChart,
    // chartMaxMin,
} from "./Enums";
import {
    // InputDropdownHorizontal,
    LoadingData,
    // generateDateGMT8,
} from "../../../ComponentReuseable/index";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { getToken } from "../../../TokenParse/TokenParse";
import NotConnected from "./NotConnected";

// Constants
const REFRESH_PERIOD_MS = 30000; // 30s
const REFRESH_LOADING_THRESHOLD_MS = 10000; // 10s

const formatDaily = "dd MMM yyyy, HH:mm:ss";
const formatWeekly = "dd MMM yyyy, HH:mm";
const formatMonthly = "dd MMM yyyy";
const formatYearly = "MMM yyyy";

// Functions
const round = (num) => {
    if (!isNaN(num)) {
        let m = Number((Math.abs(num) * 100).toPrecision(15));
        return (Math.round(m) / 100) * Math.sign(num);
    } else {
        return num;
    }
};

const tooltipFunction = (opts) => {
    let { series, seriesIndex, dataPointIndex, w } = opts;
    if (series && series.length > 0) {
        let yValue = series[seriesIndex][dataPointIndex];
        yValue = !isNaN(yValue) && yValue !== "" ? round(yValue) : "";

        let unit = null;

        if (w.config.series[seriesIndex]) {
            if (w.config.series[seriesIndex].data[dataPointIndex]) {
                let userData =
                    w.config.series[seriesIndex].data[dataPointIndex].userData;
                unit = userData && userData.unit ? userData.unit : "";
            }
        }

        return (
            '<div class="arrow_box"><span>' +
            yValue +
            " " +
            unit +
            "</span></div>"
        );
    }
};

const emptyChartSetting = {
    series: [
        {
            name: pueChart.pue,
            data: [],
        },
        {
            name: pueChart.wue,
            data: [],
        },
    ],
    options: {
        chart: {
            id: "pue",
            animations: {
                enabled: false,
            },
            type: "area",
            height: 180,
            zoom: {
                enabled: true,
                type: "x",
            },
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
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: "straight",
        },

        markers: {
            size: 2,
        },

        xaxis: {
            type: "datetime",
            min: new Date(
                new Date(new Date().setHours(0)).setMinutes(0)
            ).setSeconds(0),
            max: new Date(
                new Date(new Date().setHours(23)).setMinutes(59)
            ).setSeconds(59),

            labels: {
                style: {
                    colors: "white",
                    fontSize: "12px",
                    fontFamily: "Segoe UI",
                    fontWeight: 500,
                    cssClass: "apexcharts-xaxis-label",
                },
                datetimeUTC: false,
                datetimeFormatter: {
                    day: "dd MMM",
                },
            },
        },
        yaxis: [
            {
                tickAmount: 5,
                max: undefined,
                min: undefined,
                labels: {
                    align: "center",
                    show: true,
                    style: {
                        colors: ["white"],
                        fontSize: "12px",
                        fontWeight: 500,
                        fontFamily: "Segoe UI",
                        cssClass: "apexcharts-yaxis-label",
                    },
                },
                decimalsInFloat: 2,
            },
            {
                tickAmount: 5,
                max: undefined,
                min: undefined,
                opposite: true,
                labels: {
                    align: "center",
                    show: true,
                    style: {
                        colors: ["white"],
                        fontSize: "12px",
                        fontWeight: 500,
                        fontFamily: "Segoe UI",
                        cssClass: "apexcharts-yaxis-label",
                    },
                },
                decimalsInFloat: 2,
            },
        ],
        legend: {
            show: false,
        },
        tooltip: {
            shared: true,
            intersect: false,
            x: {
                format: formatDaily,
                show: false,
            },
            y: [
                {
                    formatter: function (
                        y,
                        { series, seriesIndex, dataPointIndex, w }
                    ) {
                        let unit = "";
                        if (w.config.series[seriesIndex]) {
                            if (
                                w.config.series[seriesIndex].data[
                                    dataPointIndex
                                ]
                            ) {
                                let userData =
                                    w.config.series[seriesIndex].data[
                                        dataPointIndex
                                    ].userData;
                                unit =
                                    userData && userData.unit
                                        ? userData.unit
                                        : "";
                            }
                        }
                        if (y || y == "0") {
                            return `${y.toFixed(2)} ${unit}`;
                        } else {
                            return `---`;
                        }
                    },
                },
                {
                    formatter: function (
                        y,
                        { series, seriesIndex, dataPointIndex, w }
                    ) {
                        if (typeof y !== "undefined") {
                            let unit = "";
                            if (w.config.series[seriesIndex]) {
                                if (
                                    w.config.series[seriesIndex].data[
                                        dataPointIndex
                                    ]
                                ) {
                                    let userData =
                                        w.config.series[seriesIndex].data[
                                            dataPointIndex
                                        ].userData;
                                    unit =
                                        userData && userData.unit
                                            ? userData.unit
                                            : "";
                                }
                            }
                            if (y || y == "0") {
                                return `${y.toFixed(2)} ${unit}`;
                            } else {
                                return `---`;
                            }
                        }

                        return y;
                    },
                },
            ],

            // custom: tooltipFunction,
        },
        colors: ["#FEBC2C", "#008FFB"],
        fill: {
            colors: ["#FEBC2C", "#008FFB"],
            type: "gradient",
            gradient: {
                gradientToColors: ["#242573"],
                stops: [0, 100, 100],
            },
        },
    },
};

// const generateChartSetting = (max, min, seriesIdx) => {
//     // max: series max value
//     // min: series min value
//     // seriesIdx: index of the series -> determine which y axis

//     let initOption = emptyChartSetting.options;
//     let type;
//     if (seriesIdx === 0) {
//         type = pueChart.pue.toLowerCase();
//     } else if (seriesIdx === 1) {
//         type = pueChart.wue.toLowerCase();
//     }

//     if (isNaN(max) || max === null) {
//         initOption.yaxis[seriesIdx].max = undefined;
//     } else {
//         if (max > chartMaxMin[type].max) {
//             initOption.yaxis[seriesIdx].max = max;
//         } else {
//             initOption.yaxis[seriesIdx].max = chartMaxMin[type].max;
//         }
//     }

//     if (isNaN(max) || max === null) {
//         initOption.yaxis[seriesIdx].min = undefined;
//     } else {
//         if (min < chartMaxMin[type].min) {
//             initOption.yaxis[seriesIdx].min = min;
//         } else {
//             initOption.yaxis[seriesIdx].min = chartMaxMin[type].min;
//         }
//     }

//     // return options
//     return initOption;
// };

const PUEChart = (props) => {
    // Destructure props
    const { filter, startDate, isConnectedWUE, isConnectedPUE } = props;

    // Constants
    const rightUnit = "L/kWh";

    // States
    const [isLoading, setIsLoading] = useState(false);
    const [chartSetting, setChartSetting] = useState(emptyChartSetting);
    const [tempSeries, setTempSeries] = useState([
        {
            name: pueChart.pue,
            data: [],
        },
        {
            name: pueChart.wue,
            data: [],
        },
    ]);
    const [checked, setChecked] = useState({
        pue: true,
        wue: true,
    });

    // const [maxValue, setMaxValue] = useState(Number.NEGATIVE_INFINITY);

    const toggleChart = (val) => {
        let operatorId;
        let operatorIndex;

        if (val === pueChart.pue) {
            operatorId = "pue";
            operatorIndex = 0;
        } else if (val === pueChart.wue) {
            operatorId = "wue";
            operatorIndex = 1;
        }

        setChecked((prev) => {
            return { ...prev, [operatorId]: !prev[operatorId] };
        });

        setChartSetting((prev) => {
            const prevOption = prev.options;
            const prevSeries = prev.series;
            const newData = [];

            if (checked[operatorId] === true) {
                prevOption.yaxis[operatorIndex].labels.show = false;
                prevSeries.forEach((data) => {
                    if (data.name === val) {
                        data.data = [];
                    }
                    newData.push(data);
                });
            } else {
                prevOption.yaxis[operatorIndex].labels.show = true;
                prevSeries.forEach((data, index) => {
                    if (data.name === val) {
                        if (tempSeries[index]) {
                            data.data = tempSeries[index].data;
                        }
                    }
                    newData.push(data);
                });
            }

            ApexCharts.exec("pue", "updateOptions", prevOption);
            ApexCharts.exec("pue", "updateSeries", newData);

            return {
                ...prev,
                series: newData,
                options: { ...prevOption },
            };
        });
    };

    const updateChartData = (chartSeries, interval, startDate, mounted) => {
        let startTimestamp = new Date(startDate);

        if (interval === "weekly") {
            let firstDayOfWeek = new Date(startDate);
            let day = firstDayOfWeek.getDay() || 7; // Get current day number, converting Sun. to 7
            if (day !== 1) {
                // Only manipulate the date if it isn't Mon.
                firstDayOfWeek.setHours(-24 * (day - 1), 0, 0);
            } else {
                firstDayOfWeek.setHours(0, 0, 0);
            }

            let lastDayOfWeek = new Date(new Date(firstDayOfWeek));
            lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
            lastDayOfWeek.setHours(23, 59, 59);

            if (firstDayOfWeek.getMonth() !== lastDayOfWeek.getMonth()) {
                if (startTimestamp.getMonth() !== firstDayOfWeek.getMonth()) {
                    startTimestamp.setMonth(startTimestamp.getMonth(), 1);
                    startTimestamp.setHours(0, 0, 0);
                } else {
                    startTimestamp = new Date(firstDayOfWeek);
                }
            } else {
                startTimestamp = new Date(firstDayOfWeek);
            }
        } else if (interval === "monthly") {
            startTimestamp.setDate(1);
        } else if (interval === "yearly") {
            startTimestamp.setMonth(0, 1);
        }

        startTimestamp.setHours(0, 0, 0);

        let endTimestamp = new Date(startTimestamp);

        if (interval === "daily") {
            endTimestamp.setHours(23, 59, 59);
        } else if (interval === "weekly") {
            let firstDayOfWeek = new Date(startDate);
            let day = firstDayOfWeek.getDay() || 7; // Get current day number, converting Sun. to 7
            if (day !== 1) {
                // Only manipulate the date if it isn't Mon.
                firstDayOfWeek.setHours(-24 * (day - 1), 0, 0);
            } else {
                firstDayOfWeek.setHours(0, 0, 0);
            }

            let lastDayOfWeek = new Date(new Date(firstDayOfWeek));
            lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
            lastDayOfWeek.setHours(23, 59, 59);

            if (firstDayOfWeek.getMonth() !== lastDayOfWeek.getMonth()) {
                if (startTimestamp.getMonth() !== firstDayOfWeek.getMonth()) {
                    endTimestamp = new Date(lastDayOfWeek);
                } else {
                    endTimestamp = new Date(lastDayOfWeek);
                    endTimestamp.setDate(1);
                    endTimestamp.setHours(0, 0, 0);
                    endTimestamp = new Date(
                        new Date(endTimestamp).getTime() - 1000
                    );
                }
            } else {
                endTimestamp = new Date(lastDayOfWeek);
            }
        } else if (interval === "monthly") {
            if (endTimestamp.getMonth() === 11) {
                endTimestamp.setFullYear(
                    startTimestamp.getFullYear() + 1,
                    0,
                    1
                );
                endTimestamp.setHours(0, 0, 0);
                endTimestamp = new Date(
                    new Date(endTimestamp).getTime() - 1000
                );
            } else {
                endTimestamp.setMonth(startTimestamp.getMonth() + 1, 1);
                endTimestamp.setHours(0, 0, 0);
                endTimestamp = new Date(
                    new Date(endTimestamp).getTime() - 1000
                );
            }
        } else if (interval === "yearly") {
            endTimestamp.setFullYear(startTimestamp.getFullYear() + 1, 0, 1);
            endTimestamp.setHours(0, 0, 0);
            endTimestamp = new Date(new Date(endTimestamp).getTime() - 1000);
        }

        if (mounted) {
            setChartSetting((prevState) => {
                let prevOptions = prevState.options;
                let prevXAxis = prevOptions.xaxis;
                let prevTooltip = prevOptions.tooltip;

                return {
                    ...prevState,
                    series: chartSeries,
                    options: {
                        ...prevOptions,
                        xaxis: {
                            ...prevXAxis,
                            min: startTimestamp.getTime(),
                            max: endTimestamp.getTime(),
                        },
                        tooltip: {
                            ...prevTooltip,
                            x: {
                                format:
                                    interval === "daily"
                                        ? formatDaily
                                        : interval === "weekly"
                                        ? formatWeekly
                                        : interval === "monthly"
                                        ? formatMonthly
                                        : formatYearly,
                            },
                        },
                    },
                };
            });
        }
    };

    // Side-effects
    // Get chart data
    useEffect(() => {
        // Internal variable
        let mounted = true;
        let cancelToken = axios.CancelToken.source();
        let fetchTimer = null;
        let loadingTimer = null;
        let isFirstCall = true;

        const fetchPueWueChartData = async (interval, startDate) => {
            // Call service to get PUE-WUE chart data
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env.REACT_APP_CONSUMPTION_PUE_WUE_CHART,
                headers: {
                    authorization: getToken(),
                },
                data: {
                    interval: interval,
                    start_date: startDate,
                },
                cancelToken: cancelToken.token,
            };

            try {
                const result = await axios(config);

                if (result.status === 200) {
                    let { data } = result;

                    if (
                        data.status &&
                        (data.status === "SUCCESS" ||
                            data.status === "PARTIAL_ERROR")
                    ) {
                        let chartSeries = [];

                        if (data.pue && data.pue.chartData) {
                            chartSeries.push({
                                name: pueChart.pue,
                                data: data.pue.chartData.map((row) => {
                                    return {
                                        x: new Date(row.timestamp),
                                        y: round(row.tag_value),
                                        userData: {
                                            unit: data.pue.unit,
                                        },
                                    };
                                }),
                            });
                        }

                        if (data.wue && data.wue.chartData) {
                            chartSeries.push({
                                name: pueChart.wue,
                                data: data.wue.chartData.map((row) => {
                                    return {
                                        x: new Date(row.timestamp),
                                        y: round(row.tag_value),
                                        userData: {
                                            unit: data.wue.unit,
                                        },
                                    };
                                }),
                            });
                        }

                        if (mounted) {
                            // updateChartData(chartSeries, interval, startDate);
                            setTempSeries(
                                JSON.parse(JSON.stringify(chartSeries))
                            );
                        }

                        if (data.status === "PARTIAL_ERROR") {
                            data.errors.forEach((err, index) => {
                                toast.error("PUE-WUE CHART: " + err.message, {
                                    toastId: `error-pue-wue-chart-${index}`,
                                });
                            });
                        }
                    } else {
                        if (mounted) {
                            // updateChartData(
                            //     emptyChartSetting.series,
                            //     interval,
                            //     startDate
                            // );
                            setTempSeries(
                                JSON.parse(
                                    JSON.stringify(emptyChartSetting.series)
                                )
                            );
                        }

                        if (data.status === "EMPTY") {
                            toast.info("PUE-WUE chart data is empty", {
                                toastId: "empty-pue-wue-chart",
                            });
                        } else {
                            data.errors.forEach((err, index) => {
                                toast.error("PUE-WUE CHART: " + err.message, {
                                    toastId: `error-pue-wue-chart-${index}`,
                                });
                            });
                        }
                    }
                } else {
                    toast.error("Error getting pue-wue chart data", {
                        toastId: "error-pue-wue-chart",
                    });
                }
            } catch (e) {
                if (!axios.isCancel(e)) {
                    toast.error("Error calling API to get pue-wue chart data", {
                        toastId: "error-pue-wue-chart",
                    });
                }
            }
        };

        const fetchData = async () => {
            if (isFirstCall) {
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

            // Fetch PUE-WUE chart data
            await fetchPueWueChartData(filter.interval.id, startDate);

            if (!isFirstCall) {
                // Clear timeout for setting loading to TRUE
                clearTimeout(loadingTimer);
                loadingTimer = null;
            } else {
                isFirstCall = false;
            }

            // Set isLoading to FALSE
            if (mounted) {
                setIsLoading(false);
            }

            if (mounted && fetchTimer) {
                fetchTimer = setTimeout(fetchData, REFRESH_PERIOD_MS);
            }
        };

        fetchTimer = setTimeout(fetchData, 10);

        return () => {
            clearTimeout(fetchTimer);
            fetchTimer = null;
            clearTimeout(loadingTimer);
            loadingTimer = null;
            cancelToken.cancel();
            mounted = false;
            isFirstCall = true;
        };
    }, [filter.interval, startDate]);

    useEffect(() => {
        let mounted = true;

        let filteredChartSeries = JSON.parse(JSON.stringify(tempSeries)).map(
            (series) => {
                let condition = false;

                if (checked.pue && checked.wue) {
                    condition = true;
                } else if (checked.pue) {
                    condition = series.name === pueChart.pue;
                } else if (checked.wue) {
                    condition = series.name === pueChart.wue;
                } else {
                    condition = false;
                }

                if (condition) {
                    return series;
                } else {
                    return [];
                }
            }
        );

        updateChartData(
            filteredChartSeries,
            filter.interval.id,
            startDate,
            mounted
        );

        return () => {
            mounted = false;
        };
    }, [filter.interval, startDate, tempSeries, checked]);

    // TESTING FUNCTION TO TEST CHART Y AXIS LIMIT
    // const getRandomInt = (min, max) => {
    //     min = Math.ceil(min);
    //     max = Math.floor(max);
    //     return Math.floor(Math.random() * (max - min + 1)) + min;
    // };

    // const updateOption = () => {
    //     const newOpt = generateChartSetting(
    //         getRandomInt(2, 4),
    //         getRandomInt(-1, 1),
    //         1
    //     );
    //     ApexCharts.exec("pue", "updateOptions", newOpt);
    //     setChartSetting((prev) => {
    //         return { ...newOpt };
    //     });
    // };

    return (
        <div className='consumption-consumption-container-container pue-main-container'>
            <LoadingData
                size='120px'
                isLoading={isLoading}
                useDarkBackground={true}
            />
            <div className='consumption-consumption-container'>
                <div className='consumption-consumption-chart'>
                    <div className='consumption-consumption-chart-wrapper'>
                        {/* Dummy component to check y axis
                        <button onClick={updateOption}>UPDATE</button> */}
                        <div className='pue-title-container'>
                            <span>{checked.pue && pueChart.pue}</span>
                            <span>
                                {checked.wue && pueChart.wue + ` ${rightUnit}`}
                            </span>
                        </div>
                        <div
                            style={{
                                marginLeft: "20px",
                                // marginRight: "-20px",
                            }}>
                            <ReactApexChart
                                options={chartSetting.options}
                                series={chartSetting.series}
                                type='area'
                                height={180}
                            />
                        </div>

                        <div className='legend-container'>
                            <div className='legend-data'>
                                <NotConnected
                                    size='25px'
                                    isConnected={
                                        isConnectedPUE.it ||
                                        isConnectedPUE.nonIt
                                    }
                                />
                                <input
                                    id='pue'
                                    type='checkbox'
                                    checked={checked.pue}
                                    onClick={() => toggleChart(pueChart.pue)}
                                />
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='24.24'
                                    height='10.255'
                                    viewBox='0 0 24.24 10.255'>
                                    <rect
                                        id='Rectangle_18430'
                                        data-name='Rectangle 18430'
                                        width='24.24'
                                        height='10.255'
                                        fill='#febc2c'
                                    />
                                </svg>
                                <label htmlFor='pue'>{pueChart.pue}</label>
                            </div>
                            <div className='legend-data'>
                                <NotConnected
                                    size='25px'
                                    isConnected={
                                        isConnectedWUE.usage ||
                                        isConnectedWUE.return
                                    }
                                />
                                <input
                                    id='wue'
                                    type='checkbox'
                                    checked={checked.wue}
                                    onClick={() => toggleChart(pueChart.wue)}
                                />
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='24.24'
                                    height='10.255'
                                    viewBox='0 0 24.24 10.255'>
                                    <rect
                                        id='Rectangle_18431'
                                        data-name='Rectangle 18431'
                                        width='24.24'
                                        height='10.255'
                                        fill='#008ffb'
                                    />
                                </svg>
                                <label htmlFor='wue'>{pueChart.wue}</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PUEChart;
