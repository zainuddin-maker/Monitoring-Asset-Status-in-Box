// System library imports
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ReactApexChart from "react-apexcharts";

// Custom library imports
import { generateAnnotation } from "../../Monitoring/Component/AnnotationGenerator";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { getToken } from "../../../TokenParse/TokenParse";
import {
    LoadingData,
    // generateDateGMT8,
} from "../../../ComponentReuseable/index";
import { intervals } from "./EnumsRack";
import {
    round,
    normalizeValueUnitModifier,
} from "../Utilities/NormalizeValueUnit";

// Constants
const REFRESH_PERIOD_MS = 50000;
const REFRESH_LOADING_THRESHOLD_MS = 10000;

const formatDaily = "dd MMM yyyy, HH:mm:ss";
const formatWeekly = "dd MMM yyyy, HH:mm";
const formatMonthly = "dd MMM yyyy";
const formatYearly = "MMM yyyy";

// Line chart default option
const defaultOption = {
    chart: {
        animations: {
            enabled: false,
        },
        id: "rack_consumption",
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
        min: new Date(new Date().setHours(0, 0, 0)),
        max: new Date(new Date().setHours(23, 59, 59)),
        labels: {
            style: {
                colors: "white",
            },
            datetimeUTC: false,
            datetimeFormatter: {
                day: "dd MMM",
            },
        },
    },
    tooltip: {
        enabled: true,
        x: {
            format: formatDaily,
            show: true,
        },
        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
            let unit = "";
            if (w.config.series[seriesIndex]) {
                if (w.config.series[seriesIndex].data[dataPointIndex]) {
                    let userData =
                        w.config.series[seriesIndex].data[dataPointIndex]
                            .userData;
                    unit = userData && userData.unit ? userData.unit : "";
                }
            }

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
        },
    },
    annotations: {
        position: "front",
        yaxis: [],
    },
};

const defaultSeries = [
    {
        name: "series1",
        data: [],
    },
];

const ReactConsumptionMonitoringLineChart = (props) => {
    // Destructure props
    let {
        rackId,
        interval,
        startDate,
        menu,
        subMenu,
        pdu,
        pduName,
        threshold,
    } = props;

    // States
    const [lineChart, setLineChart] = useState({
        series: defaultSeries,
        options: defaultOption,
    });
    const [warningThreshold, setWarningThreshold] = useState({
        comparisonType: null,
        threshold: null,
        second_threshold: null,
    });
    const [criticalThreshold, setCriticalThreshold] = useState({
        comparisonType: null,
        threshold: null,
        second_threshold: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [unit, setUnit] = useState("---");

    // Side-effects
    // Process threshold props and react to its changes
    useEffect(() => {
        if (threshold) {
            if (threshold.warning) {
                setWarningThreshold((prevState) => {
                    prevState.comparisonType = threshold.warning.comparisonType;
                    prevState.threshold = threshold.warning.threshold;
                    prevState.second_threshold =
                        threshold.warning.second_threshold;
                    return prevState;
                });
            }

            if (threshold.critical) {
                setCriticalThreshold((prevState) => {
                    prevState.comparisonType =
                        threshold.critical.comparisonType;
                    prevState.threshold = threshold.critical.threshold;
                    prevState.second_threshold =
                        threshold.critical.second_threshold;
                    return prevState;
                });
            }
        } else {
            setWarningThreshold({
                comparisonType: null,
                threshold: null,
                second_threshold: null,
            });
            setCriticalThreshold({
                comparisonType: null,
                threshold: null,
                second_threshold: null,
            });
        }
    }, [threshold]);

    // Load chart data on component load
    useEffect(() => {
        // Internal variables
        let mounted = true;
        let cancelToken = axios.CancelToken.source();
        let fetchTimer = null;
        let loadingTimer = null;
        let isFirstCall = true;
        let modifier = 1;
        let currentMaxValue = Number.NEGATIVE_INFINITY;

        // Internal functions
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
                if (
                    compare(value, warning, warning_comparison, second_warning)
                ) {
                    if (
                        compare(
                            value,
                            critical,
                            critical_comparison,
                            second_critical
                        )
                    ) {
                        return color.critical;
                    } else {
                        return color.warning;
                    }
                } else if (
                    compare(
                        value,
                        critical,
                        critical_comparison,
                        second_critical
                    )
                ) {
                    return color.critical;
                } else {
                    return color.good;
                }
            } else {
                if (
                    compare(
                        value,
                        critical,
                        critical_comparison,
                        second_critical
                    )
                ) {
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

        const updateChartData = (data, startDate, interval) => {
            // Find max and min value of the data
            let yMax = Number.NEGATIVE_INFINITY;
            let yMin = Number.POSITIVE_INFINITY;

            if (data && data.length > 0) {
                data.forEach((row) => {
                    yMax = row.y > yMax ? row.y : yMax;
                    yMin = row.y < yMin ? row.y : yMin;
                });
            }

            // Calculate start and end timestamp
            let startTimestamp = new Date(startDate);

            if (interval === intervals.weekly) {
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
            } else if (interval === intervals.monthly) {
                startTimestamp.setDate(1);
            } else if (interval === intervals.yearly) {
                startTimestamp.setMonth(0, 1);
            }

            startTimestamp.setHours(0, 0, 0);

            let endTimestamp = new Date(startTimestamp);

            if (interval === intervals.daily) {
                endTimestamp.setHours(23, 59, 59);
            } else if (interval === intervals.weekly) {
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
            } else if (interval === intervals.monthly) {
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
            } else if (interval === intervals.yearly) {
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
                setLineChart((prevState) => {
                    let prevOptions = prevState.options;
                    let prevXAxis = prevOptions.xaxis;
                    let prevYAxis = prevOptions.yaxis;
                    let prevTooltip = prevOptions.tooltip;
                    let prevAnnotations = prevOptions.annotations;

                    let max =
                        yMax > 0 ? 1.2 * yMax : yMax < 0 ? 0.8 * yMax : 0.2;
                    let min =
                        yMin > 0 ? 0.8 * yMin : yMin < 0 ? 1.2 * yMin : -0.2;

                    let newYAxis = [
                        {
                            ...prevYAxis[0],
                            max: max,
                            min: min,
                        },
                        ...prevYAxis.slice(1, prevYAxis.length),
                    ];

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
                                        interval === intervals.daily
                                            ? formatDaily
                                            : interval === intervals.weekly
                                            ? formatWeekly
                                            : interval === intervals.monthly
                                            ? formatMonthly
                                            : formatYearly,
                                },
                            },
                            yaxis: [...newYAxis],
                            annotations: {
                                ...prevAnnotations,
                                yaxis: generateAnnotation(
                                    warningThreshold.comparisonType
                                        ? warningThreshold.threshold * modifier
                                        : null,
                                    warningThreshold.comparisonType
                                        ? warningThreshold.second_threshold *
                                              modifier
                                        : null,
                                    warningThreshold.comparisonType
                                        ? warningThreshold.comparisonType
                                        : null,
                                    criticalThreshold.comparisonType
                                        ? criticalThreshold.threshold * modifier
                                        : null,
                                    criticalThreshold.comparisonType
                                        ? criticalThreshold.second_threshold *
                                              modifier
                                        : null,
                                    criticalThreshold.comparisonType
                                        ? criticalThreshold.comparisonType
                                        : null,
                                    max >= 0 ? 10 * max : 0.1 * max,
                                    min >= 0 ? 0.1 * min : 10 * min
                                ),
                            },
                        },
                    };
                });
            }
        };

        const fetchRackConsumptionChart = async (
            rackId,
            menu,
            subMenu,
            pdu,
            interval,
            startDate
        ) => {
            const config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env
                        .REACT_APP_CONSUMPTION_RACK_GET_POWER_OR_ENERGY_CHART,
                headers: {
                    authorization: getToken(),
                },
                data: {
                    interval: interval.toLowerCase(),
                    start_date: startDate,
                    menu: menu.toLowerCase(),
                    sub_menu: subMenu.toLowerCase(),
                    rack_id: rackId,
                    pdu: pdu,
                },
                cancelToken: cancelToken.token,
            };

            try {
                const result = await axios(config);

                if (result.status === 200) {
                    let { data } = result;

                    if (data.status === "SUCCESS") {
                        let { unit, chartData } = data;

                        // Find maximum value of the chart data
                        chartData.forEach((row) => {
                            currentMaxValue =
                                row.tag_value > currentMaxValue
                                    ? row.tag_value
                                    : currentMaxValue;
                        });

                        modifier = normalizeValueUnitModifier(
                            currentMaxValue,
                            unit
                        ).modifier;
                        unit = normalizeValueUnitModifier(
                            currentMaxValue,
                            unit
                        ).unit;

                        setUnit(unit);

                        chartData = chartData.map((row, index) => {
                            let tag = {
                                warning: warningThreshold.comparisonType
                                    ? warningThreshold.threshold
                                    : null,
                                second_warning: warningThreshold.comparisonType
                                    ? warningThreshold.second_threshold
                                    : null,
                                warning_comparison:
                                    warningThreshold.comparisonType
                                        ? warningThreshold.comparisonType
                                        : null,
                                critical: criticalThreshold.comparisonType
                                    ? criticalThreshold.threshold
                                    : null,
                                second_critical:
                                    criticalThreshold.comparisonType
                                        ? criticalThreshold.second_threshold
                                        : null,
                                critical_comparison:
                                    criticalThreshold.comparisonType
                                        ? criticalThreshold.comparisonType
                                        : null,
                            };

                            return {
                                x: new Date(row.timestamp),
                                y: round(row.tag_value * modifier),
                                userData: {
                                    unit: unit,
                                },
                                fillColor: comparatorFunction(
                                    tag,
                                    row.tag_value
                                ),
                            };
                        });

                        if (mounted) {
                            updateChartData(chartData, startDate, interval);
                        }
                    } else {
                        toast.error(data.message + ": " + data.error, {
                            toastId: "error-get-rack-consumption-chart",
                        });
                    }
                } else {
                    toast.error("Error getting rack's consumption chart", {
                        toastId: "error-get-rack-consumption-chart",
                    });

                    if (mounted) {
                        setLineChart((prevState) => ({
                            ...prevState,
                            series: defaultSeries,
                        }));
                    }
                }
            } catch (e) {
                if (!axios.isCancel(e)) {
                    toast.error(
                        "Error calling API to get rack's consumption chart",
                        {
                            toastId: "error-get-rack-consumption-chart",
                        }
                    );
                }

                if (mounted) {
                    setLineChart((prevState) => ({
                        ...prevState,
                        series: defaultSeries,
                    }));
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

            await fetchRackConsumptionChart(
                rackId,
                menu,
                subMenu,
                pdu,
                interval,
                startDate
            );

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

        if (
            rackId &&
            menu &&
            subMenu &&
            interval &&
            startDate &&
            typeof pdu === "string"
        ) {
            fetchTimer = setTimeout(fetchData, 10);
        }

        return () => {
            clearTimeout(fetchTimer);
            fetchTimer = null;
            clearTimeout(loadingTimer);
            loadingTimer = null;
            cancelToken.cancel();
            mounted = false;
        };
    }, [
        rackId,
        menu,
        subMenu,
        pdu,
        interval,
        startDate,
        warningThreshold.comparisonType,
        warningThreshold.threshold,
        warningThreshold.second_threshold,
        criticalThreshold.comparisonType,
        criticalThreshold.threshold,
        criticalThreshold.second_threshold,
    ]);

    return (
        <div
            style={{
                width: "100%",
                alignItems: "center",
                marginTop: "20px",
                overflow: "hidden",
                position: "relative",
            }}>
            <LoadingData
                isLoading={isLoading}
                useAltBackground={true}
                size='120px'
            />
            <span>{`${pduName} ${subMenu} ${menu} (${unit})`}</span>
            <ReactApexChart
                series={lineChart.series}
                options={lineChart.options}
                type='area'
                height={350}
            />
        </div>
    );
};

export default ReactConsumptionMonitoringLineChart;
