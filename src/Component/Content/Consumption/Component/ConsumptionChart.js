// System library imports
import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";
import { toast } from "react-toastify";
import axios from "axios";

// Custom library imports
import {
    chartMenu,
    chartPowerSubMenu,
    chartWaterSubMenu,
    consumptionChart,
} from "./Enums";
import {
    InputDropdownHorizontal,
    LoadingData,
    // generateDateGMT8,
} from "../../../ComponentReuseable/index";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { getToken } from "../../../TokenParse/TokenParse";
import NotConnected from "./NotConnected";

// Constants
const REFRESH_PERIOD_MS = 30000; // 30 seconds
const REFRESH_LOADING_THRESHOLD_MS = 10000; // 10s

const formatDaily = "dd MMM yyyy, HH:mm:ss";
const formatWeekly = "dd MMM yyyy, HH:mm";
const formatMonthly = "dd MMM yyyy";
const formatYearly = "MMM yyyy";

const defaultUnits = {
    active_power: "W",
    active_energy: "Wh",
    flow_rate: "L/min",
    volume: "Litres",
};

// Functions
const round = (num) => {
    if (!isNaN(num)) {
        let m = Number((Math.abs(num) * 100).toPrecision(15));
        return (Math.round(m) / 100) * Math.sign(num);
    } else {
        return num;
    }
};

const normalizeValueUnit = (value, unit) => {
    let modifier = 1;
    let newUnit = unit;

    // Validate input
    if (
        isNaN(value) ||
        value === undefined ||
        value === null ||
        !unit ||
        (unit && unit.length <= 0)
    ) {
        return { modifier, unit };
    }

    // Check the first character (case sensitive)
    let currentPrefix = unit[0];

    switch (currentPrefix) {
        case "M": // 10^6
            if (Math.abs(value) >= 0.001 && Math.abs(value) < 1) {
                modifier = 1e3;
                newUnit = "k" + unit.slice(1);
            } else if (Math.abs(value) < 0.001) {
                modifier = 1e6;
                newUnit = unit.slice(1);
            }
            break;
        case "k": // 10^3
            if (Math.abs(value) / 1e3 >= 1) {
                modifier = 1 / 1e3;
                newUnit = "M" + unit.slice(1);
            } else if (Math.abs(value) < 1) {
                modifier = 1e3;
                newUnit = unit.slice(1);
            }
            break;
        default:
            if (Math.abs(value) / 1e6 >= 1) {
                modifier = 1 / 1e6;
                newUnit = "M" + unit;
            } else if (Math.abs(value) / 1e3 >= 1) {
                modifier = 1 / 1e3;
                newUnit = "k" + unit;
            }
            break;
    }

    return {
        modifier: modifier,
        unit: newUnit,
    };
};

// const normalizeTimestamp = (timestamp) => {
//     const padZero = (number) => {
//         if (number > 9) {
//             return number.toString();
//         } else {
//             return String(number).padStart(2, "0");
//         }
//     };

//     let currentTimestamp = new Date(timestamp);
//     let year = currentTimestamp.getFullYear();
//     let month = padZero(currentTimestamp.getMonth() + 1);
//     let date = padZero(currentTimestamp.getDate());
//     let hours = padZero(currentTimestamp.getHours());
//     let minutes = padZero(currentTimestamp.getMinutes());
//     let seconds = padZero(currentTimestamp.getSeconds());

//     return `${year}-${month}-${date},${hours}:${minutes}:${seconds}`;
// };

const tooltipFunction = (opts) => {
    let { series, seriesIndex, dataPointIndex, w } = opts;
    if (series && series.length > 0) {
        let yValue = series[seriesIndex][dataPointIndex];
        yValue = !isNaN(yValue) && yValue !== "" ? round(yValue) : "";

        let unit = null;

        if (w.config.series[seriesIndex].data[dataPointIndex]) {
            let userData =
                w.config.series[seriesIndex].data[dataPointIndex].userData;
            unit = userData && userData.unit ? userData.unit : "";
        }

        return (
            '<div class="arrow_box"><span>' +
            yValue +
            " " +
            (unit ? unit : "") +
            "</span></div>"
        );
    }
};

const emptyChartSetting = {
    series: [
        {
            name: consumptionChart.it,
            data: [],
        },
        {
            name: consumptionChart.nonIt,
            data: [],
        },
    ],
    options: {
        chart: {
            id: "power",
            animations: {
                enabled: false,
            },
            type: "area",
            height: 285,
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
                seriesName: consumptionChart.usage,
                tickAmount: 5,
                min: undefined,
                max: undefined,
                labels: {
                    show: true,
                    align: "center",
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
                seriesName: consumptionChart.supply,
                tickAmount: 5,
                min: undefined,
                max: undefined,
                opposite: true,
                labels: {
                    show: true,
                    align: "center",
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
                seriesName: consumptionChart.supply,
                tickAmount: 5,
                min: undefined,
                max: undefined,
                opposite: true,
                labels: {
                    show: false,
                    align: "center",
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
        colors: ["#49F2DB", "#008FFB", "#5F5F7A"],
        fill: {
            colors: ["#49F2DB", "#008FFB", "#5F5F7A"],
            type: "gradient",
            // gradient: {
            //     gradientToColors: ["#242573"],
            //     stops: [0, 100, 100],
            // },
            gradient: {
                enabled: true,
                opacityFrom: 0.55,
                opacityTo: 0,
            },
        },
    },
};

const ConsumptionChart = (props) => {
    // Destructure props
    const { filter, startDate, isConnectedWUE, isConnectedPUE } = props;

    // States
    const [isLoading, setIsLoading] = useState(false);
    const [chartSetting, setChartSetting] = useState(emptyChartSetting);
    const [tempSeries, setTempSeries] = useState([
        {
            name: consumptionChart.it,
            data: [],
        },
        {
            name: consumptionChart.nonIt,
            data: [],
        },
    ]);
    const [menu, setMenu] = useState(chartMenu.power);
    const [chartSubMenu, setChartSubMenu] = useState(chartPowerSubMenu);
    const [subMenu, setSubMenu] = useState(chartSubMenu.power);
    const [checked, setChecked] = useState({
        it: true,
        nonIt: true,
        usage: true,
        supply: true,
        return: true,
    });
    const [leftUnit, setLeftUnit] = useState(defaultUnits.active_power);
    const [rightUnit, setRightUnit] = useState(defaultUnits.active_power);

    // Functions
    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === "subMenu") {
            setSubMenu(value);
        }
    };

    const handleChangeMenu = (key) => {
        setMenu(chartMenu[key]);
        setChartSubMenu((prev) => {
            if (chartMenu[key] === chartMenu.power) {
                setSubMenu(chartPowerSubMenu.power);
                return chartPowerSubMenu;
            } else {
                setSubMenu(chartWaterSubMenu.flow);
                return chartWaterSubMenu;
            }
        });
    };

    const toggleChart = (val) => {
        let operatorId;
        let operatorIndex;

        if (val === consumptionChart.it) {
            operatorId = "it";
            operatorIndex = 0;
        } else if (val === consumptionChart.nonIt) {
            operatorId = "nonIt";
            operatorIndex = 1;
        } else if (val === consumptionChart.usage) {
            operatorId = "usage";
            operatorIndex = 0;
        } else if (val === consumptionChart.supply) {
            operatorId = "supply";
            operatorIndex = 1;
        }

        // set checked and chart state
        if (checked[operatorId] === true) {
            setChartSetting((prev) => {
                const prevOption = prev.options;
                if (operatorIndex >= 0) {
                    prevOption.yaxis[operatorIndex].labels.show = false;
                }
                ApexCharts.exec("power", "updateOptions", prevOption);
                return {
                    ...prev,
                    options: prevOption,
                };
            });
        } else {
            setChartSetting((prev) => {
                const prevOption = prev.options;
                if (operatorIndex >= 0) {
                    prevOption.yaxis[operatorIndex].labels.show = true;
                }
                ApexCharts.exec("power", "updateOptions", prevOption);
                return {
                    ...prev,
                    options: prevOption,
                };
            });
        }

        setChecked((prev) => {
            return { ...prev, [operatorId]: !prev[operatorId] };
        });
    };

    const getMaxOfArray = (numArray) => {
        let arrayNumber = [];
        if (numArray.length > 0) {
            arrayNumber = numArray.map((data) => data.y);
        }
        const value = Math.max.apply(null, arrayNumber);
        if (value || value === 0) {
            return value + 5;
        } else {
            return undefined;
        }
    };

    const getMinOfArray = (numArray) => {
        let arrayNumber = [];
        if (numArray.length > 0) {
            arrayNumber = numArray.map((data) => data.y);
        }
        const value = Math.min.apply(null, arrayNumber);
        if (value || value === 0) {
            return value - 1;
        } else {
            return undefined;
        }
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

                if (chartSeries.length === 3) {
                    // water
                    let prevYaxis = prevOptions.yaxis;
                    const x = prevYaxis.map((data, index) => {
                        if (chartSeries[index]) {
                            data.max = getMaxOfArray(chartSeries[index].data);
                            data.min = getMinOfArray(chartSeries[index].data);
                        }
                        return data;
                    });

                    prevOptions.yaxis = prevOptions.yaxis.map((data, index) => {
                        if (chartSeries[index]) {
                            data.max = getMaxOfArray(chartSeries[index].data);
                            data.min = getMinOfArray(chartSeries[index].data);
                        }
                        if (index === 0) {
                            data.seriesName = consumptionChart.usage;
                        } else {
                            data.seriesName = consumptionChart.supply;
                        }
                        return data;
                    });
                } else {
                    // power
                    prevOptions.yaxis = prevOptions.yaxis.map((data, index) => {
                        if (chartSeries[index]) {
                            data.max = getMaxOfArray(chartSeries[index].data);
                            data.min = getMinOfArray(chartSeries[index].data);
                        }
                        if (index === 0) {
                            data.seriesName = consumptionChart.it;
                        } else {
                            data.seriesName = consumptionChart.nonIt;
                        }
                        return data;
                    });
                }
                ApexCharts.exec("power", "updateOptions", prevOptions);
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
                        yaxis: prevOptions.yaxis,
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
        let modifier = 1;
        let currentMaxValue = Number.NEGATIVE_INFINITY;
        let unit = "";

        const fetchConsumptionChartData = async (interval, startDate) => {
            // Call service to get consumption chart data
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env.REACT_APP_CONSUMPTION_CONSUMPTION_CHART,
                headers: {
                    authorization: getToken(),
                },
                data: {
                    interval: interval,
                    start_date: startDate,
                    menu:
                        menu === chartMenu.power
                            ? "power_consumption"
                            : "water_consumption",
                    sub_menu:
                        subMenu === chartPowerSubMenu.power
                            ? "active_power"
                            : subMenu === chartPowerSubMenu.energy
                            ? "active_energy"
                            : subMenu === chartWaterSubMenu.flow
                            ? "flow_rate"
                            : "volume",
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

                        if (menu === chartMenu.power) {
                            // Find maximum value of the chart data
                            if (data.IT && data.IT.chartData) {
                                data.IT.chartData.forEach((row) => {
                                    currentMaxValue =
                                        row.tag_value > currentMaxValue
                                            ? row.tag_value
                                            : currentMaxValue;
                                });
                            }

                            if (data.nonIT && data.nonIT.chartData) {
                                data.nonIT.chartData.forEach((row) => {
                                    currentMaxValue =
                                        row.tag_value > currentMaxValue
                                            ? row.tag_value
                                            : currentMaxValue;
                                });
                            }

                            if (currentMaxValue > Number.NEGATIVE_INFINITY) {
                                modifier = normalizeValueUnit(
                                    currentMaxValue,
                                    data.IT.unit
                                        ? data.IT.unit
                                        : data.nonIT.unit
                                ).modifier;

                                unit = normalizeValueUnit(
                                    currentMaxValue,
                                    data.IT.unit
                                        ? data.IT.unit
                                        : data.nonIT.unit
                                ).unit;
                            }

                            if (data.IT && data.IT.chartData) {
                                chartSeries.push({
                                    name: consumptionChart.it,
                                    data: data.IT.chartData.map((row) => {
                                        return {
                                            x: new Date(row.timestamp),
                                            y: round(row.tag_value * modifier),
                                            userData: {
                                                unit: unit,
                                            },
                                        };
                                    }),
                                });
                                setLeftUnit(unit);
                            } else {
                                chartSeries.push({
                                    name: consumptionChart.it,
                                    data: [],
                                });
                            }

                            if (data.nonIT && data.nonIT.chartData) {
                                chartSeries.push({
                                    name: consumptionChart.nonIt,
                                    data: data.nonIT.chartData.map((row) => {
                                        return {
                                            x: new Date(row.timestamp),
                                            y: round(row.tag_value * modifier),
                                            userData: {
                                                unit: unit,
                                            },
                                        };
                                    }),
                                });
                                setRightUnit(unit);
                            } else {
                                chartSeries.push({
                                    name: consumptionChart.nonIt,
                                    data: [],
                                });
                            }
                        } else {
                            // Find maximum value of the chart data
                            if (
                                data.waterSupply &&
                                data.waterSupply.chartData
                            ) {
                                data.waterSupply.chartData.forEach((row) => {
                                    currentMaxValue =
                                        row.tag_value > currentMaxValue
                                            ? row.tag_value
                                            : currentMaxValue;
                                });
                            }

                            if (
                                data.waterReturn &&
                                data.waterReturn.chartData
                            ) {
                                data.waterReturn.chartData.forEach((row) => {
                                    currentMaxValue =
                                        row.tag_value > currentMaxValue
                                            ? row.tag_value
                                            : currentMaxValue;
                                });
                            }

                            if (data.waterUsage && data.waterUsage.chartData) {
                                data.waterUsage.chartData.forEach((row) => {
                                    currentMaxValue =
                                        row.tag_value > currentMaxValue
                                            ? row.tag_value
                                            : currentMaxValue;
                                });
                            }

                            if (currentMaxValue > Number.NEGATIVE_INFINITY) {
                                modifier = normalizeValueUnit(
                                    currentMaxValue,
                                    data.waterSupply.unit
                                        ? data.waterSupply.unit
                                        : data.waterReturn.unit
                                        ? data.waterReturn.unit
                                        : data.waterUsage.unit
                                ).modifier;

                                unit = normalizeValueUnit(
                                    currentMaxValue,
                                    data.waterSupply.unit
                                        ? data.waterSupply.unit
                                        : data.waterReturn.unit
                                        ? data.waterReturn.unit
                                        : data.waterUsage.unit
                                ).unit;
                            }

                            if (data.waterUsage && data.waterUsage.chartData) {
                                chartSeries.push({
                                    name: consumptionChart.usage,
                                    data: data.waterUsage.chartData.map(
                                        (row) => {
                                            return {
                                                x: new Date(row.timestamp),
                                                y: round(
                                                    row.tag_value * modifier
                                                ),
                                                userData: {
                                                    unit: unit,
                                                },
                                            };
                                        }
                                    ),
                                });
                                setLeftUnit(unit);
                            } else {
                                chartSeries.push({
                                    name: consumptionChart.usage,
                                    data: [],
                                });
                            }

                            if (
                                data.waterSupply &&
                                data.waterSupply.chartData
                            ) {
                                chartSeries.push({
                                    name: consumptionChart.supply,
                                    data: data.waterSupply.chartData.map(
                                        (row) => {
                                            return {
                                                x: new Date(row.timestamp),
                                                y: round(
                                                    row.tag_value * modifier
                                                ),
                                                userData: {
                                                    unit: unit,
                                                },
                                            };
                                        }
                                    ),
                                });
                                setRightUnit(unit);
                            } else {
                                chartSeries.push({
                                    name: consumptionChart.supply,
                                    data: [],
                                });
                            }

                            if (
                                data.waterReturn &&
                                data.waterReturn.chartData
                            ) {
                                chartSeries.push({
                                    name: consumptionChart.return,
                                    data: data.waterReturn.chartData.map(
                                        (row) => {
                                            return {
                                                x: new Date(row.timestamp),
                                                y: round(
                                                    row.tag_value * modifier
                                                ),
                                                userData: {
                                                    unit: unit,
                                                },
                                            };
                                        }
                                    ),
                                });
                                setRightUnit(unit);
                            } else {
                                chartSeries.push({
                                    name: consumptionChart.return,
                                    data: [],
                                });
                            }
                        }

                        if (mounted) {
                            // updateChartData(
                            //     chartSeries,
                            //     interval,
                            //     startDate,
                            //     mounted
                            // );
                            setTempSeries(
                                JSON.parse(JSON.stringify(chartSeries))
                            );
                        }

                        if (data.status === "PARTIAL_ERROR") {
                            data.errors.forEach((err, index) => {
                                toast.error(
                                    "CONSUMPTION CHART: " + err.message,
                                    {
                                        toastId: `error-consumption-chart-${index}`,
                                    }
                                );
                            });
                        }
                    } else {
                        if (mounted) {
                            // updateChartData(
                            //     emptyChartSetting.series,
                            //     interval,
                            //     startDate,
                            //     mounted
                            // );
                            setTempSeries(
                                JSON.parse(
                                    JSON.stringify(emptyChartSetting.series)
                                )
                            );

                            if (menu === chartMenu.power) {
                                if (subMenu === chartPowerSubMenu.power) {
                                    setLeftUnit(defaultUnits.active_power);
                                    setRightUnit(defaultUnits.active_power);
                                } else {
                                    setLeftUnit(defaultUnits.active_energy);
                                    setRightUnit(defaultUnits.active_energy);
                                }
                            } else {
                                if (subMenu === chartWaterSubMenu.flow) {
                                    setLeftUnit(defaultUnits.flow_rate);
                                    setRightUnit(defaultUnits.flow_rate);
                                } else {
                                    setLeftUnit(defaultUnits.volume);
                                    setRightUnit(defaultUnits.volume);
                                }
                            }
                        }

                        if (data.status === "EMPTY") {
                            toast.info("Consumption chart data is empty", {
                                toastId: "empty-consumption-chart",
                            });
                        } else {
                            data.errors.forEach((err, index) => {
                                toast.error(
                                    "CONSUMPTION CHART: " + err.message,
                                    {
                                        toastId: `error-consumption-chart-${index}`,
                                    }
                                );
                            });
                        }
                    }
                } else {
                    toast.error("Error getting consumption chart data", {
                        toastId: "error-consumption-chart",
                    });
                }
            } catch (e) {
                if (!axios.isCancel(e)) {
                    toast.error(
                        "Error calling API to get consumption chart data",
                        {
                            toastId: "error-consumption-chart",
                        }
                    );
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

            // Fetch consumption chart data
            await fetchConsumptionChartData(filter.interval.id, startDate);

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
    }, [filter.interval, startDate, menu, subMenu]);

    useEffect(() => {
        let mounted = true;

        let filteredChartSeries = JSON.parse(JSON.stringify(tempSeries)).map(
            (series, idx) => {
                let condition = false;

                if (menu === chartMenu.power) {
                    if (checked.it && checked.nonIt) {
                        condition = true;
                    } else if (checked.it) {
                        condition = series.name === consumptionChart.it;
                    } else if (checked.nonIt) {
                        condition = series.name === consumptionChart.nonIt;
                    } else {
                        condition = false;
                    }
                } else {
                    if (checked.supply && checked.usage) {
                        condition = true;
                    } else if (checked.supply) {
                        condition =
                            series.name === consumptionChart.supply ||
                            series.name === consumptionChart.return;
                    } else if (checked.usage) {
                        condition = series.name === consumptionChart.usage;
                    } else {
                        condition = false;
                    }

                    // if (checked.supply && checked.return && checked.usage) {
                    //     condition = true;
                    // } else if (checked.supply && checked.return) {
                    //     condition =
                    //         series.name === consumptionChart.supply ||
                    //         series.name === consumptionChart.return;
                    // } else if (checked.supply && checked.usage) {
                    //     condition =
                    //         series.name === consumptionChart.supply ||
                    //         series.name === consumptionChart.usage;
                    // } else if (checked.return && checked.usage) {
                    //     condition =
                    //         series.name === consumptionChart.return ||
                    //         series.name === consumptionChart.usage;
                    // } else if (checked.supply) {
                    //     condition = series.name === consumptionChart.supply;
                    // } else if (checked.return) {
                    //     condition = series.name === consumptionChart.return;
                    // } else if (checked.usage) {
                    //     condition = series.name === consumptionChart.usage;
                    // } else {
                    //     condition = false;
                    // }
                }

                if (condition) {
                    return series;
                } else {
                    return {
                        name: series.name,
                        data:
                            series.data.length > 0
                                ? series.data.map((yVal, index) => {
                                      yVal.y = null;
                                      return yVal;
                                  })
                                : [],
                    };
                }
            }
        );
        // if (filteredChartSeries[1] && filteredChartSeries[2]) {
        //     if (
        //         filteredChartSeries[1].name === consumptionChart.supply &&
        //         filteredChartSeries[2].name === consumptionChart.return
        //     ) {
        //         console.log("sini");
        //         filteredChartSeries[2].name = consumptionChart.supply;
        //     }
        // }
        updateChartData(
            filteredChartSeries,
            filter.interval.id,
            startDate,
            mounted
        );

        return () => {
            mounted = false;
        };
    }, [filter.interval, startDate, tempSeries, menu, checked]);

    return (
        <div className='consumption-consumption-container-container'>
            <LoadingData
                size='120px'
                isLoading={isLoading}
                useDarkBackground={true}
            />
            <div className='consumption-consumption-container consumption-consumption-container-bottom'>
                <div className='consumption-consumption-header'>
                    {Object.keys(chartMenu).map((key) => (
                        <span
                            key={key}
                            id={menu === chartMenu[key] ? "active" : ""}
                            onClick={() => {
                                handleChangeMenu(key);
                            }}>
                            {chartMenu[key]}
                        </span>
                    ))}
                </div>
                <div className='consumption-consumption-filter'>
                    <InputDropdownHorizontal
                        inputWidth={"100px"}
                        label={""}
                        name={"subMenu"}
                        options={Object.values(chartSubMenu)}
                        value={subMenu}
                        onChange={handleChange}
                        useAltColor={true}
                        noEmptyOption={true}
                    />
                </div>
                <div className='consumption-consumption-chart'>
                    <div className='consumption-consumption-chart-wrapper'>
                        {menu === chartMenu.power ? (
                            <div className='pue-title-container'>
                                <span>
                                    {checked.it &&
                                        `${consumptionChart.it} ${subMenu} (${leftUnit})`}
                                </span>
                                <span>
                                    {checked.nonIt &&
                                        `${consumptionChart.nonIt} ${subMenu} (${rightUnit})`}
                                </span>
                            </div>
                        ) : (
                            <div className='pue-title-container'>
                                <span>
                                    {checked.usage &&
                                        `${consumptionChart.usage} (${leftUnit})`}
                                </span>
                                <span>
                                    {checked.supply &&
                                        `${consumptionChart.supply} - ${consumptionChart.return} (${rightUnit})`}
                                </span>
                            </div>
                        )}

                        <div
                            style={{
                                marginLeft: "20px",
                                marginRight:
                                    menu === chartMenu.power && checked.nonIt
                                        ? "-20px"
                                        : menu === chartMenu.water &&
                                          checked.supply
                                        ? "-20px"
                                        : "-15px",
                            }}>
                            <ReactApexChart
                                options={chartSetting.options}
                                series={chartSetting.series}
                                type='area'
                                height={285}
                                // width={"80%"}
                            />
                        </div>
                        {menu === chartMenu.power ? (
                            <div className='legend-container'>
                                <div className='legend-data'>
                                    <NotConnected
                                        size='20px'
                                        isConnected={isConnectedPUE.it}
                                    />
                                    <input
                                        id='it_load'
                                        type='checkbox'
                                        checked={checked.it}
                                        onClick={() =>
                                            toggleChart(consumptionChart.it)
                                        }
                                    />
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='24.24'
                                        height='10.255'
                                        viewBox='0 0 33.237 14.062'>
                                        <rect
                                            id='Rectangle_18575'
                                            data-name='Rectangle 18575'
                                            width='33.237'
                                            height='14.062'
                                            fill='#49f2db'
                                        />
                                    </svg>
                                    <label htmlFor='it_load'>
                                        {consumptionChart.it}
                                    </label>
                                </div>
                                <div className='legend-data'>
                                    <NotConnected
                                        size='25px'
                                        isConnected={isConnectedPUE.nonIt}
                                    />
                                    <input
                                        id='nonit_load'
                                        type='checkbox'
                                        checked={checked.nonIt}
                                        onClick={() =>
                                            toggleChart(consumptionChart.nonIt)
                                        }
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
                                    <label htmlFor='nonit_load'>
                                        {consumptionChart.nonIt}
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className='legend-container'>
                                <div className='legend-data'>
                                    <NotConnected
                                        size='25px'
                                        isConnected={isConnectedWUE.usage}
                                    />
                                    <input
                                        id='usage'
                                        type='checkbox'
                                        checked={checked.usage}
                                        onClick={() =>
                                            toggleChart(consumptionChart.usage)
                                        }
                                    />
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='24.24'
                                        height='10.255'
                                        viewBox='0 0 33.237 14.062'>
                                        <rect
                                            id='Rectangle_18575'
                                            data-name='Rectangle 18575'
                                            width='33.237'
                                            height='14.062'
                                            fill='#49f2db'
                                        />
                                    </svg>
                                    <label htmlFor='usage'>
                                        {consumptionChart.usage}
                                    </label>
                                </div>
                                <div className='legend-data'>
                                    <NotConnected
                                        size='25px'
                                        isConnected={isConnectedWUE.supply}
                                    />
                                    <input
                                        id='supply'
                                        type='checkbox'
                                        checked={checked.supply}
                                        onClick={() =>
                                            toggleChart(consumptionChart.supply)
                                        }
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
                                    <label htmlFor='supply'>
                                        {consumptionChart.supply}
                                    </label>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='24.24'
                                        height='10.255'
                                        viewBox='0 0 33.237 14.061'>
                                        <path
                                            id='Path_23697'
                                            data-name='Path 23697'
                                            d='M0,0H33.237V14.061H0Z'
                                            fill='#5f5f7a'
                                        />
                                    </svg>
                                    <label htmlFor='return'>
                                        {consumptionChart.return}
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsumptionChart;
