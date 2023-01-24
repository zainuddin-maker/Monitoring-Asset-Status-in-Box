// System library imports
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import ReactApexChart from "react-apexcharts";

// Custom library imports
import ConsumptionCard from "./ConsumptionCard";
import { LoadingData } from "../../../ComponentReuseable/index";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { getToken } from "../../../TokenParse/TokenParse";
import NotConnected from "./NotConnected";

// Constants
const REFRESH_PERIOD_MS = 5000; // 5s
const REFRESH_COUNT_THRESHOLD = 6; // refresh other data after getting current PUE data 6 times
const REFRESH_LOADING_THRESHOLD_MS = 10000; // 10s

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
    // Validate input
    if (
        isNaN(value) ||
        value === undefined ||
        value === null ||
        !unit ||
        (unit && unit.length <= 0)
    ) {
        return { value, unit };
    }

    // Check the first character (case sensitive)
    let currentPrefix = unit[0];
    let newValue = value;
    let newUnit = unit;

    switch (currentPrefix) {
        case "M": // 10^6
            if (Math.abs(value) >= 0.001 && Math.abs(value) < 1) {
                newValue = newValue * 1e3;
                newUnit = "k" + unit.slice(1);
            } else if (Math.abs(value) < 0.001) {
                newValue = newValue * 1e6;
                newUnit = unit.slice(1);
            }
            break;
        case "k": // 10^3
            if (Math.abs(value) / 1e3 >= 1) {
                newValue = newValue / 1e3;
                newUnit = "M" + unit.slice(1);
            } else if (Math.abs(value) < 1) {
                newValue = newValue * 1e3;
                newUnit = unit.slice(1);
            }
            break;
        default:
            if (Math.abs(value) / 1e6 >= 1) {
                newValue = newValue / 1e6;
                newUnit = "M" + unit;
            } else if (Math.abs(value) / 1e3 >= 1) {
                newValue = newValue / 1e3;
                newUnit = "k" + unit;
            }
            break;
    }

    return {
        value: round(newValue),
        unit: newUnit,
    };
};

const ConsumptionLoad = (props) => {
    // Destructure props
    const { filter, startDate, isConnectedWUE, isConnectedPUE } = props;

    // States
    const [isLoading, setIsLoading] = useState(false);

    const [pueWue, setPueWue] = useState({
        current_pue: {
            value: null,
            unit: "",
            isChange: false,
            date: null,
            changeValue: null,
            changeType: null,
            isConnected: isConnectedPUE.it || isConnectedPUE.nonIt,
        },
        daily_pue: {
            value: null,
            unit: "",
            isChange: true,
            date: null,
            changeValue: null,
            changeType: null,
            isConnected: isConnectedPUE.it || isConnectedPUE.nonIt,
        },
        daily_wue: {
            value: null,
            unit: "",
            isChange: true,
            date: null,
            changeValue: null,
            changeType: null,
            isConnected: isConnectedWUE.usage || isConnectedWUE.return,
        },
    });
    const [powerConsumption, setPowerConsumption] = useState({
        it: {
            power: {
                isConnected: true,
                value: null,
                unit: null,
            },
            energy: {
                isConnected: true,
                value: null,
                unit: null,
            },
        },
        nonIt: {
            power: {
                isConnected: true,
                value: null,
                unit: null,
            },
            energy: {
                isConnected: true,
                value: null,
                unit: null,
            },
        },
    });
    const emptyChartSetting = {
        series: [],
        options: {
            noData: {
                text: "Data is Empty",
                align: "left",
                verticalAlign: "middle",
                // offsetX: -40,
                offsetY: 15,
                style: {
                    color: "#fff",
                    fontSize: "16px",
                    fontFamily: "Segoe UI",
                },
            },
            labels: ["IT", "Non-IT"],
            chart: {
                type: "donut",
            },
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
            colors: ["#49F2DB", "#4244D4"],
            legend: {
                show: false,
            },
            stroke: {
                show: false,
            },
            dataLabels: {
                enabled: true,
                // formatter: (val, opts) => {
                //     return [
                //         opts.w.globals.seriesNames[opts.seriesIndex],
                //         val.toFixed(1) + "%",
                //     ];
                // },
                style: {
                    fontSize: "11px",
                    fontWeight: "600",
                    colors: ["#000", "#fff"],
                },
            },
            plotOptions: {
                donut: {
                    expandOnClick: false,
                    customScale: 1,
                },
                pie: {
                    customScale: 1,
                    donut: {
                        size: "45%",
                    },
                    expandOnClick: false,
                },
            },
            tooltip: {
                enabled: false,
                // custom: function (
                //     { series, seriesIndex, dataPointIndex, w },
                //     label = ["IT", "Non-IT"]
                // ) {
                //     return (
                //         '<div style="z-index: 10" class="consumption-tooltip-container" ' +
                //         `id=${`label-${seriesIndex}`} ` +
                //         ">" +
                //         '<span style="display: block; text-align: left">' +
                //         label[seriesIndex] +
                //         "</span>" +
                //         '<span style="display: block; text-align: left">' +
                //         "Active Energy" +
                //         "</span>" +
                //         '<span style="display: block; text-align: left">' +
                //         series[seriesIndex] +
                //         " " +
                //         (label[seriesIndex] === "IT"
                //             ? powerConsumption.it.energy.unit
                //             : powerConsumption.nonIt.energy.unit) +
                //         "</span>" +
                //         "</div>"
                //     );
                // },
            },
        },
    };
    const [chartSetting, setChartSetting] = useState(emptyChartSetting);
    const [waterConsumption, setWaterConsumption] = useState({
        volume: {
            usage: {
                isConnected: true,
                value: null,
                unit: null,
            },
            supply: {
                isConnected: true,
                value: null,
                unit: null,
            },
            return: {
                isConnected: true,
                value: null,
                unit: null,
            },
        },
        flow: {
            usage: {
                isConnected: true,
                value: null,
                unit: null,
            },
            supply: {
                isConnected: true,
                value: null,
                unit: null,
            },
            return: {
                isConnected: true,
                value: null,
                unit: null,
            },
        },
    });

    // Side-effects
    // Get data in card, power consumption, and cooling water consumption
    useEffect(() => {
        // Internal variable
        let mounted = true;
        let cancelToken = axios.CancelToken.source();
        let fetchTimer = null;
        let loadingTimer = null;
        let fetchCurrentPueCounter = REFRESH_COUNT_THRESHOLD - 1; // Set to minus 1 from threshold so all data are fetched on first call
        let isFirstCall = true;

        const convertDate = (dateStr, interval) => {
            // Convert date to its short form
            const months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];

            let date = new Date(dateStr);

            if (interval === "daily" || interval === "weekly") {
                return `${date.getDate()} ${months[date.getMonth()]}`;
            } else if (interval === "monthly") {
                return `${months[date.getMonth()]}`;
            } else {
                return `${date.getFullYear()}`;
            }
        };

        const fetchCurrentPue = async () => {
            // Increment fetch current PUE counter
            ++fetchCurrentPueCounter;

            // Call service to get the current PUE
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env.REACT_APP_CONSUMPTION_CURRENT_PUE,
                headers: {
                    authorization: getToken(),
                },
                cancelToken: cancelToken.token,
            };

            try {
                const result = await axios(config);

                if (result.status === 200) {
                    let { data } = result;

                    if (data.status && data.status === "SUCCESS") {
                        if (mounted) {
                            setPueWue((prevState) => ({
                                ...prevState,
                                current_pue: {
                                    ...prevState.current_pue,
                                    value: data.currentPUE,
                                },
                            }));
                        }
                    } else {
                        // Set state to empty state
                        if (mounted) {
                            setPueWue((prevState) => ({
                                ...prevState,
                                current_pue: {
                                    value: null,
                                    unit: "",
                                    isChange: false,
                                    date: null,
                                    changeValue: null,
                                    changeType: null,
                                    isConnected:
                                        isConnectedPUE.it ||
                                        isConnectedPUE.nonIt,
                                },
                            }));
                        }

                        toast.error("CURRENT PUE: " + data.message, {
                            toastId: "error-current-pue",
                        });
                    }
                } else {
                    toast.error("Error getting current PUE", {
                        toastId: "error-current-pue",
                    });
                }
            } catch (e) {
                if (!axios.isCancel(e)) {
                    toast.error("Error calling API to get current PUE", {
                        toastId: "error-current-pue",
                    });
                }
            }
        };

        const fetchConsumptionSummary = async (interval, startDate) => {
            // Call service to get power consumption
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env.REACT_APP_CONSUMPTION_SUMMARY,
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
                        let { powerConsumption, waterConsumption } = data;
                        let { pue, prevPue } = powerConsumption;
                        let { wue, prevWue } = waterConsumption;

                        // Set power consumption states
                        if (mounted) {
                            let { ITEquipment, nonIT } = powerConsumption;

                            setPowerConsumption({
                                it: {
                                    power: {
                                        isConnected: true,
                                        value: ITEquipment.power
                                            ? normalizeValueUnit(
                                                  ITEquipment.power.value,
                                                  ITEquipment.power.unit
                                              ).value
                                            : null,
                                        unit: ITEquipment.power
                                            ? normalizeValueUnit(
                                                  ITEquipment.power.value,
                                                  ITEquipment.power.unit
                                              ).unit
                                            : null,
                                    },
                                    energy: {
                                        isConnected: true,
                                        value: ITEquipment.energy
                                            ? normalizeValueUnit(
                                                  ITEquipment.energy.value,
                                                  ITEquipment.energy.unit
                                              ).value
                                            : null,
                                        unit: ITEquipment.energy
                                            ? normalizeValueUnit(
                                                  ITEquipment.energy.value,
                                                  ITEquipment.energy.unit
                                              ).unit
                                            : null,
                                    },
                                },
                                nonIt: {
                                    power: {
                                        isConnected: true,
                                        value: nonIT.power
                                            ? normalizeValueUnit(
                                                  nonIT.power.value,
                                                  nonIT.power.unit
                                              ).value
                                            : null,
                                        unit: nonIT.power
                                            ? normalizeValueUnit(
                                                  nonIT.power.value,
                                                  nonIT.power.unit
                                              ).unit
                                            : null,
                                    },
                                    energy: {
                                        isConnected: true,
                                        value: nonIT.energy
                                            ? normalizeValueUnit(
                                                  nonIT.energy.value,
                                                  nonIT.energy.unit
                                              ).value
                                            : null,
                                        unit: nonIT.energy
                                            ? normalizeValueUnit(
                                                  nonIT.energy.value,
                                                  nonIT.energy.unit
                                              ).unit
                                            : null,
                                    },
                                },
                            });

                            if (ITEquipment.energy && nonIT.energy) {
                                setChartSetting((prevState) => ({
                                    ...prevState,
                                    series: [
                                        ITEquipment.energy.value,
                                        nonIT.energy.value,
                                    ],
                                    options: {
                                        ...prevState.options,
                                        tooltip: {
                                            enabled: true,
                                            custom: function (
                                                {
                                                    series,
                                                    seriesIndex,
                                                    dataPointIndex,
                                                    w,
                                                },
                                                label = ["IT", "Non-IT"]
                                            ) {
                                                let value = series[seriesIndex];
                                                let unit = ITEquipment.energy
                                                    .unit
                                                    ? ITEquipment.energy.unit
                                                    : nonIT.energy.unit
                                                    ? nonIT.energy.unit
                                                    : "---";
                                                let total = 0;
                                                for (let x of series) {
                                                    total += x;
                                                }
                                                const selected =
                                                    series[seriesIndex];
                                                const normalized =
                                                    normalizeValueUnit(
                                                        value,
                                                        unit
                                                    );

                                                value = normalized.value;
                                                unit = normalized.unit;

                                                return (
                                                    '<div style="z-index: 10" class="consumption-tooltip-container" ' +
                                                    `id=${`label-${seriesIndex}`} ` +
                                                    ">" +
                                                    '<span style="display: block; text-align: left">' +
                                                    label[seriesIndex] +
                                                    "</span>" +
                                                    '<span style="display: block; text-align: left">' +
                                                    "Active Energy" +
                                                    "</span>" +
                                                    '<span style="display: block; text-align: left">' +
                                                    value +
                                                    " " +
                                                    unit +
                                                    " (" +
                                                    (
                                                        (selected / total) *
                                                        100
                                                    ).toFixed(1) +
                                                    "%)" +
                                                    "</span>" +
                                                    "</div>"
                                                );
                                            },
                                        },
                                    },
                                }));
                            } else {
                                setChartSetting((prevState) => ({
                                    ...prevState,
                                    series: [],
                                }));
                            }
                        }

                        // Set daily PUE
                        if (mounted) {
                            let diff = null;

                            if (pue && prevPue) {
                                diff = pue - prevPue.value;
                            }

                            setPueWue((prevState) => ({
                                ...prevState,
                                daily_pue: {
                                    value: pue ? pue : null,
                                    isChange: true,
                                    date: prevPue
                                        ? convertDate(
                                              prevPue.ts + " 00:00:00",
                                              interval
                                          )
                                        : null,
                                    changeValue:
                                        diff !== null && diff !== undefined
                                            ? `${round(diff)} (${
                                                  prevPue.value === 0
                                                      ? "---"
                                                      : round(
                                                            (diff /
                                                                prevPue.value) *
                                                                100
                                                        ) + "%"
                                              })`
                                            : null,
                                    changeType:
                                        diff !== null && diff !== undefined
                                            ? diff >= 0
                                                ? "up"
                                                : "down"
                                            : null,
                                    isConnected:
                                        isConnectedPUE.it ||
                                        isConnectedPUE.nonIt,
                                },
                            }));
                        }

                        // Set water consumption states
                        if (mounted) {
                            let { waterSupply, waterReturn, waterUsage } =
                                waterConsumption;

                            setWaterConsumption({
                                volume: {
                                    supply: {
                                        isConnected: true,
                                        value:
                                            waterSupply && waterSupply.volume
                                                ? normalizeValueUnit(
                                                      waterSupply.volume.value,
                                                      waterSupply.volume.unit
                                                  ).value
                                                : null,
                                        unit:
                                            waterSupply && waterSupply.volume
                                                ? normalizeValueUnit(
                                                      waterSupply.volume.value,
                                                      waterSupply.volume.unit
                                                  ).unit
                                                : null,
                                    },
                                    return: {
                                        isConnected: true,
                                        value:
                                            waterReturn && waterReturn.volume
                                                ? normalizeValueUnit(
                                                      waterReturn.volume.value,
                                                      waterReturn.volume.unit
                                                  ).value
                                                : null,
                                        unit:
                                            waterReturn && waterReturn.volume
                                                ? normalizeValueUnit(
                                                      waterReturn.volume.value,
                                                      waterReturn.volume.unit
                                                  ).unit
                                                : null,
                                    },
                                    usage: {
                                        isConnected: true,
                                        value:
                                            waterUsage && waterUsage.volume
                                                ? normalizeValueUnit(
                                                      waterUsage.volume.value,
                                                      waterUsage.volume.unit
                                                  ).value
                                                : null,
                                        unit:
                                            waterUsage && waterUsage.volume
                                                ? normalizeValueUnit(
                                                      waterUsage.volume.value,
                                                      waterUsage.volume.unit
                                                  ).unit
                                                : null,
                                    },
                                },
                                flow: {
                                    supply: {
                                        isConnected: true,
                                        value:
                                            waterSupply && waterSupply.flowRate
                                                ? normalizeValueUnit(
                                                      waterSupply.flowRate
                                                          .value,
                                                      waterSupply.flowRate.unit
                                                  ).value
                                                : null,
                                        unit:
                                            waterSupply && waterSupply.flowRate
                                                ? normalizeValueUnit(
                                                      waterSupply.flowRate
                                                          .value,
                                                      waterSupply.flowRate.unit
                                                  ).unit
                                                : null,
                                    },
                                    return: {
                                        isConnected: true,
                                        value:
                                            waterReturn && waterReturn.flowRate
                                                ? normalizeValueUnit(
                                                      waterReturn.flowRate
                                                          .value,
                                                      waterReturn.flowRate.unit
                                                  ).value
                                                : null,
                                        unit:
                                            waterReturn && waterReturn.flowRate
                                                ? normalizeValueUnit(
                                                      waterReturn.flowRate
                                                          .value,
                                                      waterReturn.flowRate.unit
                                                  ).unit
                                                : null,
                                    },
                                    usage: {
                                        isConnected: true,
                                        value:
                                            waterUsage && waterUsage.flowRate
                                                ? normalizeValueUnit(
                                                      waterUsage.flowRate.value,
                                                      waterUsage.flowRate.unit
                                                  ).value
                                                : null,
                                        unit:
                                            waterUsage && waterUsage.flowRate
                                                ? normalizeValueUnit(
                                                      waterUsage.flowRate.value,
                                                      waterUsage.flowRate.unit
                                                  ).unit
                                                : null,
                                    },
                                },
                            });
                        }

                        // Set daily WUE
                        if (mounted) {
                            let diff = null;

                            if (wue && prevWue) {
                                diff = wue.value - prevWue.value;
                            }

                            setPueWue((prevState) => ({
                                ...prevState,
                                daily_wue: {
                                    value: wue ? wue.value : null,
                                    unit: wue
                                        ? `${wue.volumeUnit}/${wue.energyUnit}`
                                        : null,
                                    isChange: true,
                                    date: prevWue
                                        ? convertDate(
                                              prevWue.ts + " 00:00:00",
                                              interval
                                          )
                                        : null,
                                    changeValue:
                                        diff !== null && diff !== undefined
                                            ? `${round(diff)} (${
                                                  prevWue.value === 0
                                                      ? "---"
                                                      : round(
                                                            (diff /
                                                                prevWue.value) *
                                                                100
                                                        ) + "%"
                                              })`
                                            : null,
                                    changeType:
                                        diff !== null && diff !== undefined
                                            ? diff >= 0
                                                ? "up"
                                                : "down"
                                            : null,
                                    isConnected:
                                        isConnectedWUE.usage ||
                                        isConnectedWUE.return,
                                },
                            }));
                        }

                        if (data.status === "PARTIAL_ERROR") {
                            data.errors.forEach((err, index) => {
                                toast.error(
                                    "CONSUMPTION SUMMARY: " + err.message,
                                    {
                                        toastId: `error-consumption-summary-${index}`,
                                    }
                                );
                            });
                        }
                    } else {
                        // Set power consumption state to empty state
                        if (mounted) {
                            setPueWue((prevState) => ({
                                ...prevState,

                                daily_pue: {
                                    value: null,
                                    unit: "",
                                    isChange: true,
                                    date: null,
                                    changeValue: null,
                                    changeType: null,
                                    isConnected:
                                        isConnectedPUE.it ||
                                        isConnectedPUE.nonIt,
                                },
                            }));
                            setPowerConsumption({
                                it: {
                                    power: {
                                        isConnected: true,
                                        value: null,
                                        unit: null,
                                    },
                                    energy: {
                                        isConnected: true,
                                        value: null,
                                        unit: null,
                                    },
                                },
                                nonIt: {
                                    power: {
                                        isConnected: true,
                                        value: null,
                                        unit: null,
                                    },
                                    energy: {
                                        isConnected: true,
                                        value: null,
                                        unit: null,
                                    },
                                },
                            });
                            setChartSetting((prevState) => ({
                                ...prevState,
                                series: [],
                            }));
                        }

                        // Set water consumption state to empty state
                        if (mounted) {
                            setPueWue((prevState) => ({
                                ...prevState,
                                daily_wue: {
                                    value: null,
                                    unit: "L/kWh",
                                    isChange: true,
                                    date: null,
                                    changeValue: null,
                                    changeType: null,
                                    isConnected:
                                        isConnectedWUE.usage ||
                                        isConnectedWUE.return,
                                },
                            }));

                            setWaterConsumption({
                                volume: {
                                    usage: {
                                        isConnected: true,
                                        value: null,
                                        unit: null,
                                    },
                                    supply: {
                                        isConnected: true,
                                        value: null,
                                        unit: null,
                                    },
                                    return: {
                                        isConnected: true,
                                        value: null,
                                        unit: null,
                                    },
                                },
                                flow: {
                                    usage: {
                                        isConnected: true,
                                        value: null,
                                        unit: null,
                                    },
                                    supply: {
                                        isConnected: true,
                                        value: null,
                                        unit: null,
                                    },
                                    return: {
                                        isConnected: true,
                                        value: null,
                                        unit: null,
                                    },
                                },
                            });
                        }

                        if (data.status === "EMPTY") {
                            toast.info("Consumption summary data is empty", {
                                toastId: "empty-consumption-summary",
                            });
                        } else {
                            data.errors.forEach((err, index) => {
                                toast.error(
                                    "CONSUMPTION SUMMARY: " + err.message,
                                    {
                                        toastId: `error-consumption-summary-${index}`,
                                    }
                                );
                            });
                        }
                    }
                } else {
                    toast.error("Error getting consumption summary data", {
                        toastId: "error-consumption-summary",
                    });
                }
            } catch (e) {
                if (!axios.isCancel(e)) {
                    toast.error(
                        "Error calling API to get consumption summary data",
                        {
                            toastId: "error-consumption-summary",
                        }
                    );
                }
            }
        };

        const fetchOtherLoadData = async (interval, startDate) => {
            // Reset fetch current PUE counter
            fetchCurrentPueCounter = 0;

            await fetchConsumptionSummary(interval, startDate);
        };

        const fetchConsumptionLoadData = async (interval, startDate) => {
            // Fetch current PUE
            await fetchCurrentPue();

            // Check refresh count threshold
            if (fetchCurrentPueCounter >= REFRESH_COUNT_THRESHOLD) {
                // Fetch consumption load data
                await fetchOtherLoadData(interval, startDate);
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

            await fetchConsumptionLoadData(filter.interval.id, startDate);

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
            fetchCurrentPueCounter = 0;
        };
    }, [
        filter.interval,
        startDate,
        isConnectedPUE.it,
        isConnectedPUE.nonIt,
        isConnectedWUE.return,
        isConnectedWUE.usage,
    ]);

    return (
        <div className='consumption-energy-consumption'>
            <LoadingData
                size='150px'
                backgroundOffset='15px'
                isLoading={isLoading}
                useDarkBackground={true}
            />
            <div className='consumption-energy-consumption-card-container'>
                <ConsumptionCard
                    title='Current PUE'
                    value={
                        pueWue.current_pue &&
                        pueWue.current_pue.value !== null &&
                        pueWue.current_pue.value !== undefined
                            ? pueWue.current_pue.value
                            : "---"
                    }
                    unit=''
                    isChange={pueWue.current_pue.isChange}
                    date={pueWue.current_pue.date}
                    changeValue={pueWue.current_pue.changeValue}
                    changeType={pueWue.current_pue.changeType}
                    isConnected={pueWue.current_pue.isConnected}
                    icon='PUE'
                />
                <ConsumptionCard
                    title={`${filter.interval.name} PUE`}
                    value={
                        pueWue.daily_pue &&
                        pueWue.daily_pue.value !== null &&
                        pueWue.daily_pue.value !== undefined
                            ? pueWue.daily_pue.value
                            : "---"
                    }
                    unit=''
                    isChange={pueWue.daily_pue.isChange}
                    date={pueWue.daily_pue.date}
                    changeValue={pueWue.daily_pue.changeValue}
                    changeType={pueWue.daily_pue.changeType}
                    isConnected={pueWue.daily_pue.isConnected}
                    icon='PUE'
                />
                <ConsumptionCard
                    title={`${filter.interval.name} WUE`}
                    value={
                        pueWue.daily_wue &&
                        pueWue.daily_wue.value !== null &&
                        pueWue.daily_wue.value !== undefined
                            ? pueWue.daily_wue.value
                            : "---"
                    }
                    unit={pueWue.daily_wue.unit}
                    isChange={pueWue.daily_wue.isChange}
                    date={pueWue.daily_wue.date}
                    changeValue={pueWue.daily_wue.changeValue}
                    changeType={pueWue.daily_wue.changeType}
                    isConnected={pueWue.daily_wue.isConnected}
                    icon='WUE'
                />
            </div>
            <div className='consumption-energy-consumption-parameter-container'>
                <div className='power-consumption-title'>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16.574'
                        height='26.198'
                        viewBox='0 0 16.574 29.198'>
                        <path
                            id='Path_23690'
                            data-name='Path 23690'
                            d='M127.2,10.025a.468.468,0,0,0-.438-.292h-5.742l5.694-9a.442.442,0,0,0,0-.487A.511.511,0,0,0,126.278,0h-7.786a.511.511,0,0,0-.438.243l-7.3,14.6a.442.442,0,0,0,0,.487.581.581,0,0,0,.438.243h5.012l-5.45,12.993a.486.486,0,0,0,.195.584.365.365,0,0,0,.243.049.553.553,0,0,0,.389-.146L127.154,10.56A.522.522,0,0,0,127.2,10.025ZM112.9,25.937l4.477-10.706a.473.473,0,0,0-.049-.438.6.6,0,0,0-.389-.195h-4.964L118.784.973H125.4l-5.742,9a.442.442,0,0,0,0,.487.511.511,0,0,0,.438.243h5.645Z'
                            transform='translate(-110.682)'
                            fill='#fff'
                        />
                    </svg>
                    <span>Power Consumption</span>
                </div>
                <div className='power-consumption-body'>
                    <div className='body-load'>
                        <span>{`${filter.interval.name} IT Load`}</span>
                        <div>
                            {powerConsumption.it &&
                                Object.entries(powerConsumption.it)
                                    .sort((a, b) => (a < b && 1) || -1)
                                    .map(([key, val]) => {
                                        return (
                                            <div className='body-load-data'>
                                                <NotConnected
                                                    size='25px'
                                                    isConnected={
                                                        val.isConnected
                                                    }
                                                    // backgroundOffset='10px'
                                                />
                                                <span className='type'>
                                                    {key
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        key.slice(1)}
                                                </span>
                                                <span className='value'>
                                                    {val.isConnected &&
                                                    val.value !== null
                                                        ? val.value
                                                        : "---"}
                                                </span>
                                                <span className='unit'>
                                                    {val.unit
                                                        ? val.unit
                                                        : "---"}
                                                </span>
                                            </div>
                                        );
                                    })}
                        </div>
                    </div>
                    <div className='body-load'>
                        <span>{`${filter.interval.name} Non-IT Load`}</span>
                        <div>
                            {powerConsumption.nonIt &&
                                Object.entries(powerConsumption.nonIt)
                                    .sort((a, b) => (a < b && 1) || -1)
                                    .map(([key, val]) => {
                                        return (
                                            <div className='body-load-data'>
                                                <NotConnected
                                                    size='25px'
                                                    isConnected={
                                                        val.isConnected
                                                    }
                                                    // backgroundOffset='10px'
                                                />
                                                <span className='type'>
                                                    {key
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        key.slice(1)}
                                                </span>
                                                <span className='value'>
                                                    {val.isConnected &&
                                                    val.value !== null
                                                        ? val.value
                                                        : "---"}
                                                </span>
                                                <span className='unit'>
                                                    {val.unit
                                                        ? val.unit
                                                        : "---"}
                                                </span>
                                            </div>
                                        );
                                    })}
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            justifyContent: "flex-start",
                        }}>
                        <ReactApexChart
                            options={chartSetting.options}
                            series={chartSetting.series}
                            type={"donut"}
                            height={"150px"}
                            width={"150px"}
                        />
                        {chartSetting.series.length > 0 && (
                            <div className='consumption-donut-legend'>
                                <div className='donut-legend-data'>
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
                                            fill='#49F2DB'
                                        />
                                    </svg>
                                    <label>IT</label>
                                </div>
                                <div className='donut-legend-data'>
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
                                            fill='#4244D4'
                                        />
                                    </svg>
                                    <label>Non - IT</label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <hr className='consumption-horizontal-line'></hr>
            <div className='consumption-energy-consumption-consumption-container'>
                <div className='power-consumption-title'>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='20.155'
                        height='26.864'
                        viewBox='0 0 24.155 27.864'>
                        <g
                            id='water_1_'
                            data-name='water (1)'
                            transform='translate(-0.438 0)'>
                            <path
                                id='Path_23683'
                                data-name='Path 23683'
                                d='M7.406,19.5c4.493,0,6.968-2.639,6.968-7.432C14.373,7.583,8.022.448,7.751.147a.479.479,0,0,0-.691,0C6.79.448.438,7.583.438,12.07c0,4.793,2.475,7.432,6.968,7.432Zm0-18.337c1.33,1.561,6.039,7.337,6.039,10.9,0,2.967-1.048,6.5-6.039,6.5s-6.039-3.537-6.039-6.5C1.367,8.5,6.076,2.727,7.406,1.166Zm0,0'
                                fill='#fff'
                            />
                            <path
                                id='Path_23684'
                                data-name='Path 23684'
                                d='M276.619,156.056c2.657,0,4.181-1.773,4.181-4.865,0-2.9-3.684-6.9-3.841-7.064a.479.479,0,0,0-.68,0c-.156.169-3.841,4.16-3.841,7.064C272.438,154.283,273.962,156.056,276.619,156.056Zm0-10.912c.9,1.042,3.252,3.98,3.252,6.046,0,2.612-1.094,3.936-3.252,3.936s-3.252-1.324-3.252-3.936C273.367,149.124,275.723,146.187,276.619,145.144Zm0,0'
                                transform='translate(-256.207 -135.624)'
                                fill='#fff'
                            />
                            <path
                                id='Path_23685'
                                data-name='Path 23685'
                                d='M179.341,320.146c-.118.134-2.9,3.315-2.9,5.417,0,2.362,1.185,3.716,3.252,3.716s3.252-1.355,3.252-3.716c0-2.1-2.785-5.283-2.9-5.417a.48.48,0,0,0-.7,0Zm.348,8.2c-1.541,0-2.323-.938-2.323-2.787,0-1.263,1.453-3.318,2.323-4.389.87,1.069,2.323,3.124,2.323,4.389C182.012,327.412,181.23,328.35,179.69,328.35Zm0,0'
                                transform='translate(-165.781 -301.415)'
                                fill='#fff'
                            />
                            <path
                                id='Path_23686'
                                data-name='Path 23686'
                                d='M35.32,191.055l.047,0a.465.465,0,0,0,.046-.927,3.4,3.4,0,0,1-2.482-1.267c-1.235-1.611-.826-4.208-.823-4.234a.464.464,0,0,0-.916-.152c-.021.123-.481,3.013,1,4.947a4.293,4.293,0,0,0,3.129,1.631Zm0,0'
                                transform='translate(-28.89 -173.412)'
                                fill='#fff'
                            />
                            <path
                                id='Path_23687'
                                data-name='Path 23687'
                                d='M328.9,259.767a3.234,3.234,0,0,0,2.272-.979,2.776,2.776,0,0,0,.509-2.35.464.464,0,0,0-.916.153,1.906,1.906,0,0,1-.3,1.592,2.313,2.313,0,0,1-1.566.654.465.465,0,1,0,0,.929Zm0,0'
                                transform='translate(-308.955 -241.193)'
                                fill='#fff'
                            />
                            <path
                                id='Path_23688'
                                data-name='Path 23688'
                                d='M207.532,409.312a.533.533,0,0,1-.256-.77.465.465,0,0,0-.832-.415,1.462,1.462,0,0,0,.673,2.019.465.465,0,1,0,.415-.832Zm0,0'
                                transform='translate(-193.88 -384.186)'
                                fill='#fff'
                            />
                        </g>
                    </svg>
                    <span>Cooling Water Consumption</span>
                </div>
                <div
                    className='power-consumption-body'
                    style={{ justifyContent: "space-around" }}>
                    <div className='body-load'>
                        <span>{`${filter.interval.name} Volume`}</span>
                        <div>
                            {waterConsumption.flow &&
                                Object.entries(waterConsumption.volume)
                                    .sort((a, b) => (a < b && 1) || -1)
                                    .map(([key, val]) => {
                                        return (
                                            <div className='body-load-data'>
                                                <NotConnected
                                                    size='25px'
                                                    isConnected={
                                                        val.isConnected
                                                    }
                                                    // backgroundOffset='10px'
                                                />
                                                <span className='type'>
                                                    {key
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        key.slice(1)}
                                                </span>
                                                <span className='value'>
                                                    {val.isConnected &&
                                                    val.value !== null
                                                        ? val.value
                                                        : "---"}
                                                </span>
                                                <span className='unit'>
                                                    {val.unit
                                                        ? val.unit
                                                        : "---"}
                                                </span>
                                            </div>
                                        );
                                    })}
                        </div>
                    </div>
                    <div className='body-load'>
                        <span>{`${filter.interval.name} Flow Rate Average`}</span>
                        <div>
                            {waterConsumption.flow &&
                                Object.entries(waterConsumption.flow)
                                    .sort((a, b) => (a < b && 1) || -1)
                                    .map(([key, val]) => {
                                        return (
                                            <div className='body-load-data'>
                                                <NotConnected
                                                    size='25px'
                                                    isConnected={
                                                        val.isConnected
                                                    }
                                                    // backgroundOffset='10px'
                                                />
                                                <span className='type'>
                                                    {key
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        key.slice(1)}
                                                </span>
                                                <span className='value'>
                                                    {val.isConnected &&
                                                    val.value !== null
                                                        ? val.value
                                                        : "---"}
                                                </span>
                                                <span className='unit'>
                                                    {val.unit
                                                        ? val.unit
                                                        : "---"}
                                                </span>
                                            </div>
                                        );
                                    })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsumptionLoad;
