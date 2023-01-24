// System library imports
import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { toast } from "react-toastify";
import axios from "axios";

// Custom library imports
import { durations, chartMenu, chartSubMenu } from "./Enums";
import {
    InputDropdownHorizontal,
    LoadingData,
    generateDateGMT8,
} from "../../../ComponentReuseable/index";
import {
    IsAllOption,
    IsTotalChildrenOption,
    IsTotalPduOption,
    IsParentType,
    IsRackType,
} from "./Validation";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { getToken } from "../../../TokenParse/TokenParse";

// import resetZoom from "../../../../svg/reset-zoom.svg";

// Constants
const REFRESH_PERIOD_MS = 5000; // 5s
const ENERGY_REFRESH_PERIOD_MS = 60000; // 1m
const REFRESH_LOADING_THRESHOLD_MS = 10000; // 10s

const formatDaily = "dd MMM yyyy, HH:mm:ss";
const formatWeekly = "dd MMM yyyy, HH:mm";
const formatMonthly = "dd MMM yyyy";
const formatYearly = "MMM yyyy";

// Functions
const round = (num) => {
    let m = Number((Math.abs(num) * 100).toPrecision(15));
    return (Math.round(m) / 100) * Math.sign(num);
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

const normalizeTimestamp = (timestamp) => {
    const padZero = (number) => {
        if (number > 9) {
            return number.toString();
        } else {
            return String(number).padStart(2, "0");
        }
    };

    let currentTimestamp = new Date(timestamp);
    let year = currentTimestamp.getFullYear();
    let month = padZero(currentTimestamp.getMonth() + 1);
    let date = padZero(currentTimestamp.getDate());
    let hours = padZero(currentTimestamp.getHours());
    let minutes = padZero(currentTimestamp.getMinutes());
    let seconds = padZero(currentTimestamp.getSeconds());

    return `${year}-${month}-${date},${hours}:${minutes}:${seconds}`;
};

const tooltipFunction = (opts) => {
    let { series, seriesIndex, dataPointIndex, w } = opts;
    if (series && series.length > 0) {
        let yValue = series[seriesIndex][dataPointIndex];
        yValue =
            !isNaN(yValue) && yValue !== ""
                ? Math.round(yValue * 100) / 100
                : "";

        let userData =
            w.config.series[seriesIndex].data[dataPointIndex].userData;
        let unit = userData.unit ? userData.unit : "";
        let lastSampleTimestamp = userData.lastSampleTimestamp;

        if (lastSampleTimestamp) {
            return (
                '<div class="arrow_box"><span>' +
                yValue +
                " " +
                unit +
                '</span></div><div class="arrow_box"><span>' +
                "Last measured at " +
                normalizeTimestamp(lastSampleTimestamp) +
                "<span></div>"
            );
        } else {
            return (
                '<div class="arrow_box"><span>' +
                yValue +
                " " +
                unit +
                "</span></div>"
            );
        }
    }
};

const emptyChartSetting = {
    series: [],
    options: {
        chart: {
            animations: {
                enabled: false,
            },
            type: "area",
            height: 350,
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
        fill: {
            colors: ["#4244D4"],
            type: "gradient",
            gradient: {
                gradientToColors: ["#242573"],
                stops: [0, 100, 100],
            },
        },
        markers: {
            size: 3,
        },

        xaxis: {
            type: "datetime",
            min: new Date(
                new Date(new Date().setHours(0)).setMinutes(0)
            ).setSeconds(0),
            max: new Date(
                new Date(new Date().setHours(24)).setMinutes(0)
            ).setSeconds(1),

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
        yaxis: {
            labels: {
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
        legend: {
            horizontalAlign: "left",
        },
        tooltip: {
            x: {
                format: formatDaily,
            },
            custom: tooltipFunction,
        },
    },
};

const PowerChart = (props) => {
    // Destructure props
    const {
        asset,
        filter,
        startDate,
        duration,
        setDuration,
        units,
        menu,
        setMenu,
    } = props;

    // Functions
    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === "subMenu") {
            setSubMenu(value);
        } else if (name === "duration") {
            setDuration(value);
        }
    };

    // States
    const [isLoading, setIsLoading] = useState(false);
    const [subMenu, setSubMenu] = useState(chartSubMenu.active);
    const [chartSetting, setChartSetting] = useState(emptyChartSetting);
    const [maxValue, setMaxValue] = useState(Number.NEGATIVE_INFINITY);

    // Side-effects
    // Get chart data
    useEffect(() => {
        // Internal variable
        let interval = null;
        let cancelToken = axios.CancelToken.source();
        let mounted = true;
        let loadingTimer = null;
        let modifier = 1;
        let currentMaxValue = Number.NEGATIVE_INFINITY;
        let referenceValue = null;
        let unit = "";

        // Variable to track chart data from initial fetch
        let chartData = [];

        // Internal function
        const updateChartData = (data, startDate, duration) => {
            let startTimestamp = new Date(startDate);

            if (duration === durations.SEVEN_DAY) {
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
                    if (
                        startTimestamp.getMonth() !== firstDayOfWeek.getMonth()
                    ) {
                        startTimestamp.setMonth(startTimestamp.getMonth(), 1);
                        startTimestamp.setHours(0, 0, 0);
                    } else {
                        startTimestamp = new Date(firstDayOfWeek);
                    }
                } else {
                    startTimestamp = new Date(firstDayOfWeek);
                }
            } else if (duration === durations.ONE_MONTH) {
                startTimestamp.setDate(1);
            } else if (duration === durations.ONE_YEAR) {
                startTimestamp.setMonth(0, 1);
            }

            startTimestamp.setHours(0, 0, 0);

            let endTimestamp = new Date(startTimestamp);

            if (duration === durations.ONE_DAY) {
                endTimestamp.setHours(23, 59, 59);
            } else if (duration === durations.SEVEN_DAY) {
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
                    if (
                        startTimestamp.getMonth() !== firstDayOfWeek.getMonth()
                    ) {
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
            } else if (duration === durations.ONE_MONTH) {
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
            } else if (duration === durations.ONE_YEAR) {
                endTimestamp.setFullYear(
                    startTimestamp.getFullYear() + 1,
                    0,
                    1
                );
                endTimestamp.setHours(0, 0, 0);
                endTimestamp = new Date(
                    new Date(endTimestamp).getTime() - 1000
                );
            }

            if (mounted) {
                setChartSetting((prevState) => {
                    let prevOptions = prevState.options;
                    let prevXAxis = prevOptions.xaxis;
                    let prevTooltip = prevOptions.tooltip;

                    return {
                        ...prevState,
                        series: [
                            {
                                name: "series1",
                                data: data,
                            },
                        ],
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
                                        duration === durations.ONE_DAY
                                            ? formatDaily
                                            : duration === durations.SEVEN_DAY
                                            ? formatWeekly
                                            : duration === durations.ONE_MONTH
                                            ? formatMonthly
                                            : formatYearly,
                                },
                            },
                        },
                    };
                });
            }
        };

        const appendChartDataRealTime = (row) => {
            if (mounted) {
                setChartSetting((prevState) => {
                    let prevData = prevState.series[0].data;

                    return {
                        ...prevState,
                        series: [
                            {
                                name: "series1",
                                data: [...prevData, row],
                            },
                        ],
                    };
                });
            }
        };

        // const generateDummyData = (startDate, duration) => {
        //     return duration === durations.ONE_DAY
        //         ? Array(
        //               ONE_DAY_NUM_OF_DATA_POINTS - Math.floor(Math.random() * 5)
        //           )
        //               .fill({})
        //               .map((item, index) => {
        //                   let timestamp = new Date(startDate).setHours(0);
        //                   timestamp = new Date(timestamp).setMinutes(0);
        //                   timestamp = new Date(timestamp).setSeconds(0);
        //                   timestamp = new Date(
        //                       new Date(timestamp).getTime() +
        //                           index * 1800 * 1000 // 30 minutes step
        //                   );
        //                   return {
        //                       x: timestamp,
        //                       y: Math.floor(Math.random() * 100) + 1,
        //                   };
        //               })
        //         : Array(
        //               SEVEN_DAY_NUM_OF_DATA_POINTS -
        //                   Math.floor(Math.random() * 5)
        //           )
        //               .fill({})
        //               .map((item, index) => {
        //                   let timestamp = new Date(startDate).setHours(0);
        //                   timestamp = new Date(timestamp).setMinutes(0);
        //                   timestamp = new Date(timestamp).setSeconds(0);
        //                   timestamp = new Date(
        //                       new Date(timestamp).getTime() +
        //                           index * 12 * 3600 * 1000 // 12 hours step
        //                   );
        //                   return {
        //                       x: timestamp,
        //                       y: Math.floor(Math.random() * 100) + 1,
        //                   };
        //               });
        // };

        const getInitialData = async (
            powerSourceType,
            powerType,
            child,
            rack,
            pdu,
            startDate,
            duration,
            menu,
            subMenu
        ) => {
            // Call service to get the initial chart data
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env.REACT_APP_POWER_GET_AREA_CHART_DATA,
                headers: {
                    authorization: getToken(),
                },
                data: {
                    start_date: startDate,
                    duration:
                        duration === durations.ONE_DAY
                            ? "daily"
                            : duration === durations.SEVEN_DAY
                            ? "weekly"
                            : duration === durations.ONE_MONTH
                            ? "monthly"
                            : "yearly",
                    menu: menu === chartMenu.power ? "power" : "energy",
                    sub_menu:
                        subMenu === chartSubMenu.active
                            ? "active"
                            : subMenu === chartSubMenu.reactive
                            ? "reactive"
                            : "apparent",
                    power_source_type_id:
                        IsAllOption(powerSourceType) || !powerSourceType
                            ? ""
                            : powerSourceType.id,
                    power_type_id: powerType ? powerType.id : "",
                    rack_id: rack ? rack.id : "",
                    child_id:
                        child === null || child === undefined
                            ? ""
                            : IsTotalChildrenOption(child)
                            ? ""
                            : child.id,
                    pdu_id:
                        pdu === null || pdu === undefined
                            ? ""
                            : IsTotalPduOption(pdu)
                            ? ""
                            : pdu.id,
                    parent_id: IsParentType(powerType) ? powerType.id : "",
                },
                cancelToken: cancelToken.token,
            };

            try {
                const result = await axios(config);

                if (result.status === 200) {
                    let { data } = result;

                    if (data.count > 0) {
                        let { data: queryData } = data;

                        unit =
                            units[
                                `${
                                    Object.keys(chartSubMenu)[
                                        Object.values(chartSubMenu).findIndex(
                                            (item) => item === subMenu
                                        )
                                    ]
                                }_${
                                    Object.keys(chartMenu)[
                                        Object.values(chartMenu).findIndex(
                                            (item) => item === menu
                                        )
                                    ]
                                }`
                            ];

                        // Find maximum value of the chart data
                        queryData.forEach((row) => {
                            currentMaxValue =
                                row.tag_value > currentMaxValue
                                    ? row.tag_value
                                    : currentMaxValue;
                        });

                        referenceValue = queryData[0].reference_value;

                        modifier = normalizeValueUnit(
                            currentMaxValue,
                            unit
                        ).modifier;
                        unit = normalizeValueUnit(currentMaxValue, unit).unit;

                        setMaxValue(currentMaxValue);

                        queryData = queryData.map((row, index) => {
                            return {
                                x: new Date(row.timestamp),
                                y: round(row.tag_value * modifier),
                                userData: {
                                    unit: unit,
                                    lastSampleTimestamp:
                                        duration !== durations.ONE_DAY &&
                                        duration === durations.ONE_YEAR &&
                                        row.last_sample_timestamp
                                            ? row.last_sample_timestamp
                                            : duration !== durations.ONE_DAY &&
                                              index === queryData.length - 1 &&
                                              row.last_sample_timestamp
                                            ? row.last_sample_timestamp
                                            : null,
                                },
                            };
                        });

                        chartData = queryData;

                        if (mounted) {
                            updateChartData(chartData, startDate, duration);
                        }
                    } else {
                        // Set empty chart
                        if (mounted) {
                            updateChartData([], startDate, duration);
                        }
                    }
                } else {
                    toast.error("Error getting area chart data", {
                        toastId: "error-get-initial",
                    });
                }
            } catch (e) {
                if (!axios.isCancel(e)) {
                    toast.error("Error calling API to get area chart data", {
                        toastId: "error-get-initial",
                    });
                }
            }
        };

        const getRealTimeData = async (
            powerSourceType,
            powerType,
            child,
            rack,
            pdu,
            menu,
            subMenu
        ) => {
            // Call service to get the chart data
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env
                        .REACT_APP_POWER_GET_LATEST_POWER_OR_ENERGY_SINGULAR,
                headers: {
                    authorization: getToken(),
                },
                data: {
                    menu: menu === chartMenu.power ? "power" : "energy",
                    sub_menu:
                        subMenu === chartSubMenu.active
                            ? "active"
                            : subMenu === chartSubMenu.reactive
                            ? "reactive"
                            : "apparent",
                    power_source_type_id:
                        IsAllOption(powerSourceType) || !powerSourceType
                            ? ""
                            : powerSourceType.id,
                    power_type_id: powerType ? powerType.id : "",
                    rack_id: rack ? rack.id : "",
                    child_id:
                        child === null || child === undefined
                            ? ""
                            : IsTotalChildrenOption(child)
                            ? ""
                            : child.id,
                    pdu_id:
                        pdu === null || pdu === undefined
                            ? ""
                            : IsTotalPduOption(pdu)
                            ? ""
                            : pdu.id,
                    parent_id: IsParentType(powerType) ? powerType.id : "",
                    asset_number: IsAllOption(powerSourceType)
                        ? ""
                        : asset
                        ? asset.number
                        : "-",
                },
                cancelToken: cancelToken.token,
            };

            try {
                const result = await axios(config);

                if (result.status === 200) {
                    let { data } = result;

                    if (data && data.timestamp !== "" && data.value !== "") {
                        if (chartData.length <= 0) {
                            currentMaxValue =
                                data.value > currentMaxValue
                                    ? data.value
                                    : currentMaxValue;

                            referenceValue = 0;

                            unit =
                                units[
                                    `${
                                        Object.keys(chartSubMenu)[
                                            Object.values(
                                                chartSubMenu
                                            ).findIndex(
                                                (item) => item === subMenu
                                            )
                                        ]
                                    }_${
                                        Object.keys(chartMenu)[
                                            Object.values(chartMenu).findIndex(
                                                (item) => item === menu
                                            )
                                        ]
                                    }`
                                ];

                            modifier = normalizeValueUnit(
                                currentMaxValue,
                                unit
                            ).modifier;
                            unit = normalizeValueUnit(
                                currentMaxValue,
                                unit
                            ).unit;

                            setMaxValue(currentMaxValue);

                            let yValue = 0;

                            if (referenceValue) {
                                yValue = round(
                                    (data.value - referenceValue) * modifier
                                );
                            } else {
                                yValue = round(data.value * modifier);
                            }

                            let newRow = {
                                x: new Date(data.timestamp),
                                y: yValue,
                                userData: {
                                    unit: unit,
                                    lastSampleTimestamp: null,
                                },
                            };

                            chartData.push(newRow);

                            if (mounted) {
                                appendChartDataRealTime(newRow);
                            }
                        } else {
                            let lastRow = chartData[chartData.length - 1];
                            let lastTimestamp = lastRow.x;
                            let latestTimestamp = data.timestamp;

                            let timeDifference =
                                new Date(latestTimestamp).getTime() -
                                new Date(lastTimestamp).getTime();

                            if (timeDifference > 0) {
                                let yValue = 0;

                                if (referenceValue) {
                                    yValue = round(
                                        (data.value - referenceValue) * modifier
                                    );
                                } else {
                                    yValue = round(data.value * modifier);
                                }

                                let newRow = {
                                    x: new Date(latestTimestamp),
                                    y: yValue,
                                    userData: {
                                        unit: unit,
                                        lastSampleTimestamp: null,
                                    },
                                };

                                chartData.push(newRow);

                                if (mounted) {
                                    appendChartDataRealTime(newRow);
                                }
                            }
                        }
                    }
                } else {
                    toast.error("Error getting latest area chart data", {
                        toastId: "error-get-realtime",
                    });
                }
            } catch (e) {
                if (!axios.isCancel(e)) {
                    toast.error(
                        "Error calling API to get latest area chart data",
                        {
                            toastId: "error-get-realtime",
                        }
                    );
                }
            }
        };

        const fetchRealTimeData = async () => {
            loadingTimer = setTimeout(() => {
                // Set isLoading to TRUE
                if (mounted) {
                    setIsLoading(true);
                }
            }, REFRESH_LOADING_THRESHOLD_MS);

            if (
                !(
                    (IsParentType(filter.powerType) && !filter.child) ||
                    (IsRackType(filter.powerType) && !filter.rack)
                )
            ) {
                if (menu === chartMenu.power) {
                    await getRealTimeData(
                        filter.powerSourceType,
                        filter.powerType,
                        filter.child,
                        filter.rack,
                        filter.pdu,
                        menu,
                        subMenu
                    );
                } else {
                    await getInitialData(
                        filter.powerSourceType,
                        filter.powerType,
                        filter.child,
                        filter.rack,
                        filter.pdu,
                        startDate,
                        duration,
                        menu,
                        subMenu
                    );
                }
            }

            // Clear timeout for setting loading to TRUE
            clearTimeout(loadingTimer);
            loadingTimer = null;

            // Set isLoading to FALSE
            if (mounted) {
                setIsLoading(false);
            }

            if (mounted && interval) {
                if (menu === chartMenu.power) {
                    interval = setTimeout(fetchRealTimeData, REFRESH_PERIOD_MS);
                } else {
                    interval = setTimeout(
                        fetchRealTimeData,
                        ENERGY_REFRESH_PERIOD_MS
                    );
                }
            }
        };

        // Fetch initial chart data
        (async () => {
            // Set isLoading to TRUE
            if (mounted) {
                setIsLoading(true);
            }

            if (
                !(
                    (IsParentType(filter.powerType) && !filter.child) ||
                    (IsRackType(filter.powerType) && !filter.rack)
                )
            ) {
                await getInitialData(
                    filter.powerSourceType,
                    filter.powerType,
                    filter.child,
                    filter.rack,
                    filter.pdu,
                    startDate,
                    duration,
                    menu,
                    subMenu
                );
            } else {
                // Set empty chart
                if (mounted) {
                    updateChartData([], startDate, duration);
                }
            }

            // Set isLoading to FALSE
            if (mounted) {
                setIsLoading(false);
            }

            if (
                duration === durations.ONE_DAY &&
                new Date(startDate).getDate() ===
                    generateDateGMT8(new Date()).getDate()
            ) {
                interval = setTimeout(fetchRealTimeData, REFRESH_PERIOD_MS);
            }
        })();

        return () => {
            clearTimeout(interval);
            interval = null;
            clearTimeout(loadingTimer);
            loadingTimer = null;
            cancelToken.cancel();
            mounted = false;
        };
    }, [
        filter.powerSourceType,
        filter.powerType,
        filter.child,
        filter.rack,
        filter.pdu,
        startDate,
        duration,
        menu,
        subMenu,
        asset,
        units,
    ]);

    return (
        <div className='power-power-container-container'>
            <LoadingData
                size='100px'
                isLoading={isLoading}
                useDarkBackground={true}
            />
            <div className='power-power-container'>
                <div className='power-power-header'>
                    {Object.keys(chartMenu).map((key) => (
                        <span
                            key={key}
                            // style={{
                            //     opacity: key === "energy" ? "0.2" : null,
                            //     cursor: key === "energy" ? "not-allowed" : null,
                            // }}
                            id={menu === chartMenu[key] ? "active" : ""}
                            onClick={() => {
                                // if (key !== "energy") {
                                //     setMenu(chartMenu[key]);
                                // }
                                setMenu(chartMenu[key]);
                            }}>
                            {chartMenu[key]}
                        </span>
                    ))}
                </div>
                <div className='power-power-filter'>
                    <InputDropdownHorizontal
                        inputWidth={"100px"}
                        label={""}
                        name={"subMenu"}
                        options={
                            Object.values(chartSubMenu)
                            // menu === chartMenu.power
                            //     ? Object.values(chartSubMenu)
                            //     : Object.values(chartSubMenu).filter(
                            //           (item) => item === chartSubMenu.active
                            //       )
                        }
                        value={subMenu}
                        onChange={handleChange}
                        useAltColor={true}
                        noEmptyOption={true}
                    />
                    <InputDropdownHorizontal
                        labelWidth={"85px"}
                        inputWidth={"100px"}
                        label={"Interval"}
                        name={"duration"}
                        options={Object.values(durations)}
                        value={duration}
                        onChange={handleChange}
                        useAltColor={true}
                        noEmptyOption={true}
                    />
                </div>
                <span>
                    {`${menu} - ${subMenu}` +
                        ` (${
                            normalizeValueUnit(
                                maxValue,
                                units[
                                    `${
                                        Object.keys(chartSubMenu)[
                                            Object.values(
                                                chartSubMenu
                                            ).findIndex(
                                                (item) => item === subMenu
                                            )
                                        ]
                                    }_${
                                        Object.keys(chartMenu)[
                                            Object.values(chartMenu).findIndex(
                                                (item) => item === menu
                                            )
                                        ]
                                    }`
                                ]
                            ).unit
                        })`}
                </span>
                <div className='power-power-chart'>
                    <div className='power-power-chart-wrapper'>
                        <ReactApexChart
                            options={chartSetting.options}
                            series={chartSetting.series}
                            type='area'
                            height={320}
                        />

                        {/* <img
                            src={resetZoom}
                            alt='reset-coom'
                            onClick={() =>
                                setChartSetting((prev) => ({
                                    ...prev,
                                    options: emptyChartSetting.options,
                                }))
                            }
                            className='reset-zoom-chart'
                            style={{ right: "15px" }}
                        /> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PowerChart;
