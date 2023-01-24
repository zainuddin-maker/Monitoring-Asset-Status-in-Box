import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";
import rackconsumption from "../../../../svg/rack_consumption.svg";
import monitLayout from "../../../../svg/monitoring-layout.svg";
import monitOverview from "../../../../svg/monitoring-overview.svg";
import rackLayout from "../../../../svg/rack-layout.svg";
import resetZoom from "../../../../svg/reset-zoom.svg";
import notConnected from "../../../../svg/not_connected_white.svg";
import alarmTriangle from "../../../../svg/alarm_triangle.svg";
import SearchBar from "../../../ComponentReuseable/SearchBar";
import AssetCard from "./AssetCard";
import MonitoringLineChart from "./MonitoringLineChart";
import MonitoringChartThreshold from "./MonitoringChartThreshold";
import {
    TableDCIM,
    Paging,
    useModal,
    LoadingData,
    InputDateHorizontal,
    Tooltip,
    exportCSVFile,
    ExportButton,
    ButtonDetail,
    generateDateGMT8,
} from "../../../ComponentReuseable/index";
import { getToken } from "../../../TokenParse/TokenParse";
import axios from "axios";
import { toast } from "react-toastify";
import Legend from "../../Legend/Legend.index";

import { ReturnHostBackend } from "../../../BackendHost/BackendHost";

const baseURL = "/operation/cdc_asset_monitoring/monitoring";
const MonitoringChart = ({
    viewType,
    handleChangeView,
    match,
    // assetData,
}) => {
    const history = useHistory();
    const { isShowing: isShowingLegend, toggle: toggleLegend } = useModal();
    // Axios cancel token
    const [sourceAxios, setSourceAxios] = useState({
        statusCondition: axios.CancelToken.source(),
    });
    const [isStatusLoaded, setIsStatusLoaded] = useState(false);
    const defaultStatusSeries = [
        {
            name: "UP",
            data: [
                {
                    x: "Status",
                    y: [0, 1],
                },
            ],
        },
        {
            name: "WARNING",
            data: [
                {
                    x: "Condition",
                    y: [0, 1],
                },
            ],
        },
    ];
    const [realTime, setRealTime] = useState(false);
    const [triggerChangePage, setTriggerChangePage] = useState(false);
    const requestInterval = 5000;
    const [loading, setLoading] = useState({
        log: false,
        statusChart: false,
        exportStatus: false,
        exportTag: false,
    });
    const [summary, setSummary] = useState({
        warningCount: 0,
        criticalCount: 0,
    });
    const [assetNotFound, setAssetNotFound] = useState(false);
    const [assetData, setAssetData] = useState({
        floor: "",
        room: "",
        function: "",
        asset_name: "",
        asset_number: "",
    });
    const { isShowing: isShowingThreshold, toggle: toggleThreshold } =
        useModal();
    const [filter, setFilter] = useState({
        search: "",
        date: formatDate(generateDateGMT8(new Date())),
        currentPage: 1,
        lastPage: 1,
        limit: 3,
        offset: 0,
    });
    // asset tags
    const [tags, setTags] = useState([]);

    const defaultOption = {
        chart: {
            animations: {
                enabled: false,
            },
            id: "status-condition",
            width: "100%",
            toolbar: {
                show: false,
                // offsetX: -25,
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
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: "50%",
                rangeBarGroupRows: true,
            },
        },
        colors: [
            (params) => {
                const values = params.seriesIndex;
                const state = params.w.globals.seriesNames[values];
                return state === "UP" || state === "Good"
                    ? "#00A629"
                    : state === "Warning"
                    ? "#FEBC2C"
                    : state === "Critical" || state === "DOWN"
                    ? "#F11B2A"
                    : state === null
                    ? ""
                    : "#51414C";
            },
        ],
        fill: {
            type: "solid",
        },
        yaxis: {
            labels: {
                show: false,
                style: {
                    colors: ["white"],
                    fontSize: "18px",
                    fontWeight: 600,
                },
            },
        },
        xaxis: {
            axisBorder: {
                show: false,
                color: "#c3c3c5",
                offsetX: 922,
                offsetY: -1,
                height: 10,
            },
            type: "datetime",
            // YYYY-MM-DD
            min: new Date(filter.date).setHours(0, 0, 0),
            max: new Date(new Date(filter.date).setHours(23, 59, 59)).getTime(),
            // max: new Date(
            //     new Date(
            //         new Date().setDate(new Date().getDate() + 1)
            //     ).setHours(1, 30, 0)
            // ).getTime(),
            tickAmount: 24,
            tickPlacement: "on",
            labels: {
                show: true,
                style: {
                    colors: ["white"],
                    fontSize: "12px",

                    fontWeight: 500,
                    // cssClass: "apexcharts-xaxis-label",
                },
                datetimeUTC: false,
                format: "HH:mm",
            },
        },
        legend: {
            show: false,
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
    };
    // status & condition chart
    const [statusChart, setStatusChart] = useState({
        changerSeries: defaultStatusSeries,
        series: defaultStatusSeries,
        options: defaultOption,
    });

    // tables data
    const tableHeader = {
        date: { width: "150px", name: "Datetime" },
        type: { width: "100px", name: "Type" },
        description: { width: "150px", name: "Description" },
    };
    const [tableBody, setTableBody] = useState([]);

    // chart paging function
    const firstPage = () => {
        setTriggerChangePage(true);
        setFilter((prev) => {
            return { ...prev, currentPage: 1 };
        });
    };
    const lastPage = () => {
        setTriggerChangePage(true);
        setFilter((prev) => {
            return { ...prev, currentPage: prev.lastPage };
        });
    };
    const nextPage = () => {
        setTriggerChangePage(true);
        if (filter.currentPage < filter.lastPage) {
            setFilter((prev) => {
                return { ...prev, currentPage: prev.currentPage + 1 };
            });
        }
    };
    const prevPage = () => {
        setTriggerChangePage(true);
        if (filter.currentPage > 1) {
            setFilter((prev) => {
                return { ...prev, currentPage: prev.currentPage - 1 };
            });
        }
    };
    // search handling
    const handleChangeSearch = (value) => {
        setFilter((prev) => {
            return { ...prev, search: value };
        });
    };
    // change filter
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => {
            prev[name] = value;
            return { ...prev };
        });
        if (name === "date") {
            setIsRealtime(false);
        }
    };

    //get asset details
    const getDetail = useCallback((isTimeLoading) => {
        let loadingTimeout;
        if (isTimeLoading) {
            loadingTimeout = setTimeout(() => {
                setLoading((prev) => {
                    return { ...prev, log: true };
                });
            }, 10000);
        } else {
            setLoading((prev) => {
                return { ...prev, log: true };
            });
        }

        const formData = new FormData();
        formData.append("asset_number", match.params.asset);

        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_MONITORING_GET_ASSET_DETAIL,
            data: formData,
            headers: {
                authorization: getToken(),
            },
        };
        axios(config)
            .then((response) => {
                if (response.data.data) {
                    if (
                        response.data.data.length > 0 &&
                        response.data.data[0].id !== ""
                    ) {
                        setAssetData(response.data.data[0]);
                        setAssetNotFound(false);
                    } else {
                        console.log(response.data.data);
                        setAssetNotFound(true);
                    }
                } else {
                    setAssetNotFound(true);
                }
                if (isTimeLoading) {
                    clearTimeout(loadingTimeout);
                }
                setLoading((prev) => {
                    return { ...prev, log: false };
                });
            })
            .catch((err) => {
                // console.log(err);
                toast.error("Cannot get asset detail: " + err.mesage, {
                    toastId: "error",
                });
                if (isTimeLoading) {
                    clearTimeout(loadingTimeout);
                }
                setLoading((prev) => {
                    return { ...prev, log: false };
                });
            });
    }, []);
    // get tag list
    const getAssetTags = useCallback(
        (search = "") => {
            const formData = new FormData();
            formData.append("asset_number", assetData.asset_number);
            formData.append("offset", (filter.currentPage - 1) * filter.limit);
            formData.append("page_limit", filter.limit);
            formData.append("search", filter.search || search);
            const config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_DATA_HUB) +
                    process.env.REACT_APP_MONITORING_GET_ASSET_TAGS,
                data: formData,
                headers: {
                    authorization: getToken(),
                },
                // cancelToken: sourceAxios.tags.token,
            };
            if (assetData.asset_number) {
                axios(config)
                    .then((response) => {
                        if (response.data.data) {

                            console.log(response.data.data)
                            setTags(response.data.data);
                            let lastPage;

                            if (response.data.data.length > 0) {
                                lastPage = Math.ceil(
                                    parseInt(response.data.data[0].count) /
                                        filter.limit
                                );
                            } else {
                                lastPage = 1;
                            }
                            if (lastPage < 1) {
                                lastPage = 1;
                            }
                            setFilter((prev) => {
                                prev.lastPage = lastPage;
                                if (lastPage <= prev.currentPage) {
                                    prev.currentPage = lastPage;
                                }
                                return { ...prev };
                            });
                            setTriggerChangePage(false);
                        }
                    })
                    .catch((err) => {
                        // console.log(err);
                        toast.error("Cannot get asset tags: " + err.message, {
                            toastId: "error",
                        });
                        setTriggerChangePage(false);
                    });
            }
        },
        [assetData, filter.currentPage]
    );
    // get asset condition logs
    const getDetailAndLog = useCallback(
        (isTimeLoading) => {
            const formData = new FormData();
            formData.append("asset_number", match.params.asset);
            formData.append("date", filter.date);

            const config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env.REACT_APP_MONITORING_GET_ASSET_LOGS,
                data: formData,
                headers: {
                    authorization: getToken(),
                },
            };
            axios(config)
                .then((response) => {
                    if (response.data) {
                        setTableBody(response.data.log);
                        setSummary((prev) => {
                            return {
                                ...prev,
                                warningCount: response.data.warningCount,
                                criticalCount: response.data.criticalCount,
                            };
                        });
                    }
                })
                .catch((err) => {
                    // console.log(err);
                    toast.error("Cannot get asset logs: " + err.mesage, {
                        toastId: "error",
                    });
                });
        },
        [filter.date]
    );
    // get asset condition logs
    const getStatusChart = useCallback(
        (isTimeLoading) => {
            setIsStatusLoaded(false);
            // if (assetData.condition_tag_id && assetData.tag_id) {
            let loadingTimeout;
            if (isTimeLoading) {
                loadingTimeout = setTimeout(() => {
                    setLoading((prev) => ({ ...prev, statusChart: true }));
                }, 10000);
            } else {
                setLoading((prev) => ({ ...prev, statusChart: true }));
            }

            const formData = new FormData();
            // SHOULD GET TAG_ID of STATUS AND CONDITION
            formData.append("condition_tag_id", assetData.condition_tag_id);
            formData.append("status_tag_id", assetData.tag_id);
            formData.append("asset_id", assetData.id);
            formData.append("date", filter.date);

            const config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env.REACT_APP_MONITORING_GET_CHART_STATUS,
                data: formData,
                headers: {
                    authorization: getToken(),
                },
                cancelToken: sourceAxios.statusCondition.token,
            };
            axios(config)
                .then((response) => {
                    if (response.data) {
                        if (response.data.length > 0) {
                            setStatusChart((prev) => {
                                prev.series = response.data.map((chartData) => {
                                    let newData = {
                                        name: chartData.value,
                                        data: [
                                            {
                                                x: chartData.type,
                                                y: [
                                                    new Date(
                                                        chartData.start_date
                                                    ).getTime(),
                                                    chartData.end_date
                                                        ? new Date(
                                                              chartData.end_date
                                                          ).getTime()
                                                        : generateDateGMT8(
                                                              new Date()
                                                          ).getTime(),
                                                ],
                                            },
                                        ],
                                    };
                                    return newData;
                                });
                                prev.changerSeries = prev.series;
                                return { ...prev };
                            });
                        } else {
                            setStatusChart((prev) => {
                                prev.series = defaultStatusSeries;
                                return { ...prev };
                            });
                        }
                        setIsStatusLoaded(true);
                        clearTimeout(loadingTimeout);
                        setLoading((prev) => ({
                            ...prev,
                            statusChart: false,
                        }));
                    } else {
                        setStatusChart((prev) => {
                            prev.series = defaultStatusSeries;
                            return { ...prev };
                        });
                        clearTimeout(loadingTimeout);
                        setLoading((prev) => ({
                            ...prev,
                            statusChart: false,
                        }));
                    }
                    setRealTime(true);
                })
                .catch((err) => {
                    setRealTime(false);
                    // console.log(err);
                    toast.error(
                        "Cannot get asset status chart: " + err.mesage,
                        {
                            toastId: "error",
                        }
                    );
                    clearTimeout(loadingTimeout);
                    setLoading((prev) => ({ ...prev, statusChart: false }));
                });
            // }
        },
        [filter.date, assetData]
    );
    const [isRealTime, setIsRealtime] = useState(false);
    // get data
    useEffect(() => {
        if (match.params) {
            getDetail();
            let logInterval = setInterval(() => {
                getDetail(true);
                setIsRealtime(true);
            }, 5 * 1000);
            return () => {
                clearInterval(logInterval);
            };
        }
    }, [getDetail]);

    useEffect(() => {
        if (assetData.asset_name && !isRealTime) {
            getAssetTags();
        }
        if (triggerChangePage) {
            getAssetTags();
        }
    }, [
        getAssetTags,
        filter.currentPage,
        assetData,
        isRealTime,
        triggerChangePage,
    ]);

    useEffect(() => {
        if (assetData.asset_name) {
            if (isRealTime) {
                getDetailAndLog(true);
            } else {
                getDetailAndLog();
                getStatusChart();
            }
        }
    }, [getDetailAndLog, getStatusChart, assetData, isRealTime, filter.date]);

    useEffect(() => {
        // get status chart data

        // update status chart max and min time
        let prevOptions = statusChart.options;
        // YYY-DD-MM
        prevOptions.xaxis.min = new Date(formatDate(filter.date)).setHours(
            0,
            0,
            0
        );
        prevOptions.xaxis.max = new Date(formatDate(filter.date)).setHours(
            23,
            59,
            59
        );
        // update chart properties
        ApexCharts.exec(
            "status-condition",
            "updateOptions",
            prevOptions,
            false,
            true,
            true
        );

        let interval = null;
        // get new status chart data using interval
        const getLatestChartStatus = async (type) => {
            if (tags.length > 0 && realTime && assetData.tag_name) {
                const config = {
                    method: "get",
                    url:
                        ReturnHostBackend(process.env.REACT_APP_RAW_DATA) +
                        process.env.REACT_APP_MONITORING_LATEST +
                        `/${assetData.asset_number}/${assetData.tag_name}`,
                    headers: {
                        authorization: getToken(),
                    },
                };
                axios(config)
                    .then((response) => {
                        if (response.data.length > 0) {
                            if (response.data[0].tagValue) {
                                let newStatus = response.data[0];
                                let status = "";
                                let statusTime = response.data[0].timestamp;
                                if (newStatus.tagValue === "0") {
                                    status = "DOWN";
                                } else if (newStatus.tagValue === "1") {
                                    status = "UP";
                                } else {
                                    status = "OFFLINE";
                                }
                                let prevSeries = statusChart.series;
                                // // get last status index
                                let prevStatusIndex = prevSeries
                                    .map((data) => data.data[0].x.toLowerCase())
                                    .lastIndexOf(type.toLowerCase());
                                if (prevStatusIndex !== -1) {
                                    if (
                                        prevSeries[prevStatusIndex].name ===
                                            status ||
                                        new Date(statusTime) <
                                            new Date(
                                                prevSeries[
                                                    prevStatusIndex
                                                ].data[0].y[1]
                                            )
                                    ) {
                                        // the last status is the same -> push the timestamp as its end time
                                        prevSeries[
                                            prevStatusIndex
                                        ].data[0].y[1] = generateDateGMT8(
                                            new Date()
                                        ).getTime();
                                    } else {
                                        // the status is different with the previous status
                                        prevSeries.push({
                                            name: status,
                                            data: [
                                                {
                                                    x: type,
                                                    y: [
                                                        // set the last status end value as the start value
                                                        prevSeries[
                                                            prevStatusIndex
                                                        ].data[0].y[1],
                                                        new Date(
                                                            statusTime
                                                        ).getTime(),
                                                    ],
                                                },
                                            ],
                                        });
                                    }
                                } else {
                                    // the status series still empty
                                    prevSeries.push({
                                        name: status,
                                        data: [
                                            {
                                                x: type,
                                                y: [
                                                    // set the time as start time
                                                    new Date(
                                                        statusTime
                                                    ).getTime(),
                                                    generateDateGMT8(
                                                        new Date()
                                                    ).getTime(),
                                                ],
                                            },
                                        ],
                                    });
                                }
                                setStatusChart((prev) => {
                                    return { ...prev, series: [...prevSeries] };
                                });
                                // ApexCharts.exec(
                                //     "status-condition",
                                //     "updateSeries",
                                //     prevSeries
                                // );
                            }
                        }
                    })
                    .catch((err) => {
                        // console.log(err);
                    });
            }
        };
        const getLatestChartCondition = async (type) => {
            if (
                assetData.asset_number &&
                realTime &&
                assetData.condition_asset
            ) {
                const loadingTimeout = setTimeout(() => {
                    setLoading((prev) => {
                        return { ...prev, statusChart: true };
                    });
                }, 10000);

                const config = {
                    method: "get",
                    url:
                        ReturnHostBackend(process.env.REACT_APP_RAW_DATA) +
                        process.env.REACT_APP_MONITORING_LATEST +
                        `/${assetData.condition_asset}/${assetData.asset_number}`,
                    headers: {
                        authorization: getToken(),
                    },
                };
                axios(config)
                    .then((response) => {
                        if (response.data.length > 0) {
                            if (response.data[0].tagValue) {
                                let newCondition = response.data[0];
                                let condition = "";
                                let conditionTime = response.data[0].timestamp;
                                condition = capitalizeFirstLetter(
                                    newCondition.tagValue
                                );
                                let prevSeries = statusChart.series;
                                // // get last condition index
                                let prevConditionIndex = prevSeries
                                    .map((data) => data.data[0].x.toLowerCase())
                                    .lastIndexOf(type.toLowerCase());
                                if (prevConditionIndex !== -1) {
                                    if (
                                        prevSeries[prevConditionIndex].name ===
                                            condition ||
                                        new Date(conditionTime) <=
                                            new Date(
                                                prevSeries[
                                                    prevConditionIndex
                                                ].data[0].y[1]
                                            )
                                    ) {
                                        // the last condition is the same -> push the timestamp as its end time
                                        prevSeries[
                                            prevConditionIndex
                                        ].data[0].y[1] = generateDateGMT8(
                                            new Date()
                                        ).getTime();
                                    } else {
                                        // the condition is different with the previous condition
                                        prevSeries.push({
                                            name: condition,
                                            data: [
                                                {
                                                    x: type,
                                                    y: [
                                                        // set the last condition end value as the start value
                                                        prevSeries[
                                                            prevConditionIndex
                                                        ].data[0].y[1],
                                                        new Date(
                                                            conditionTime
                                                        ).getTime(),
                                                    ],
                                                },
                                            ],
                                        });
                                    }
                                } else {
                                    // the condition series still empty
                                    prevSeries.push({
                                        name: condition,
                                        data: [
                                            {
                                                x: type,
                                                y: [
                                                    // set the time as start time
                                                    new Date(
                                                        conditionTime
                                                    ).getTime(),
                                                    generateDateGMT8(
                                                        new Date()
                                                    ).getTime(),
                                                ],
                                            },
                                        ],
                                    });
                                }
                                setStatusChart((prev) => {
                                    return { ...prev, series: [...prevSeries] };
                                });
                                // ApexCharts.exec(
                                //     "status-condition",
                                //     "updateSeries",
                                //     prevSeries
                                // );
                            }
                        }

                        clearTimeout(loadingTimeout);
                    })
                    .catch((err) => {
                        clearTimeout(loadingTimeout);
                        // console.log(err);
                    });
            }
        };

        const fetchData = async () => {
            await Promise.all([
                getLatestChartStatus("Status"),
                getLatestChartCondition("Condition"),
            ]);

            if (interval) {
                interval = setTimeout(fetchData, requestInterval);
            }
        };
        if (filter.date === formatDate(generateDateGMT8(new Date()))) {
            interval = setTimeout(fetchData, 1);
        }

        return () => {
            clearTimeout(interval);
            interval = null;
        };
    }, [filter.date, tags, realTime]);

    useEffect(() => {
        // console.log(statusChart.series);
        if (isStatusLoaded) {
            if (statusChart.changerSeries.length > 0) {
                setStatusChart((prev) => {
                    prev.series = parsingConditionSeries(prev.changerSeries);
                    ApexCharts.exec(
                        "status-condition",
                        "updateSeries",
                        prev.series
                    );
                    return { ...prev };
                });
            }
        }
    }, [statusChart.changerSeries, isStatusLoaded, filter.date]);

    const handleExportTags = () => {
        setLoading((prev) => {
            return { ...prev, exportTag: true };
        });
        const formData = new FormData();
        formData.append("asset_number", tags[0].asset_number);
        formData.append("status_tag", assetData.tag_id);
        formData.append("date", filter.date);
        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_MONITORING_EXPORT_TAG,
            data: formData,
            headers: {
                authorization: getToken(),
            },
        };
        axios(config)
            .then((response) => {
                if (response.data.length > 0) {
                    exportCSVFile(
                        response.data,
                        `Monitoring_[${new Date(filter.date)
                            .toLocaleString("sv-SE")
                            .replace(" ", ",")}]_[${assetData.asset_name}]_[${
                            assetData.asset_number
                        }]`
                    );
                } else {
                    toast.error("Data Tags is Empty", {
                        toastId: "error-export",
                    });
                }
                setLoading((prev) => {
                    return { ...prev, exportTag: false };
                });
            })
            .catch((err) => {
                // console.log(err);
                toast.error("Cannot get tag data: " + err.message, {
                    toastId: "error-export",
                });
                setLoading((prev) => {
                    return { ...prev, exportTag: false };
                });
            });
    };

    return (
        assetData && (
            <React.Fragment>
                <MonitoringChartThreshold
                    isShowing={isShowingThreshold}
                    hide={toggleThreshold}
                    tags={tags}
                    assetNumber={tags.length > 0 && tags[0].asset_number}
                    getAssetTags={getAssetTags}
                    generateOverview={generateOverview}
                />

                <Legend
                    isShowing={isShowingLegend}
                    hide={toggleLegend}
                    type='monitoring_asset'
                />

                <div className='monitoring-header'>
                    <div className='header-overview'>
                        <div className='page-filter'>
                            <SearchBar
                                name='search'
                                value={filter.search}
                                search={handleChangeSearch}
                                searchContent={() =>
                                    getAssetTags(filter.search)
                                }
                            />
                            <div className='monitoring-filter-selected'>
                                <label className='monitoring-filter-selected__label'>
                                    Floor:
                                </label>
                                <div className='monitoring-filter-selected__input'>
                                    {assetData ? assetData.floor : ""}
                                </div>
                            </div>
                            <div className='monitoring-filter-selected'>
                                <label className='monitoring-filter-selected__label'>
                                    Room:
                                </label>
                                <div className='monitoring-filter-selected__input'>
                                    {assetData ? assetData.room : ""}
                                </div>
                            </div>
                            <div className='monitoring-filter-selected'>
                                <label className='monitoring-filter-selected__label'>
                                    Function:
                                </label>
                                <div className='monitoring-filter-selected__input'>
                                    {assetData ? assetData.function : ""}
                                </div>
                            </div>
                            <div className='monitoring-filter-selected'>
                                <label className='monitoring-filter-selected__label'>
                                    Asset No:
                                </label>
                                <div className='monitoring-filter-selected__input'>
                                    {assetData ? assetData.asset_number : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='monitoring-view-exports'>
                        <div className='monitoring-export-container'>
                            <InputDateHorizontal
                                // labelWidth,
                                inputWidth='150px'
                                name='date'
                                label='Date'
                                value={filter.date}
                                onChange={handleChange}
                                isRequired={false}
                                hideClearData={true}
                            />
                            <div className='monit-export-button'>
                                <ExportButton
                                    isLoading={loading.exportTag}
                                    onClick={handleExportTags}
                                />
                            </div>
                        </div>
                        <div className={`monitoring-view-selector ${viewType}`}>
                            <div
                                className='rack_layout'
                                style={{ borderRight: "none" }}
                                onClick={() =>
                                    handleChangeView(
                                        "rack_layout",
                                        assetData.floor_id,
                                        assetData.room_id
                                    )
                                }>
                                <Tooltip
                                    tooltip={
                                        <div
                                            style={{
                                                color: "white",
                                                minWidth: "100px",
                                                textAlign: "center",
                                            }}>
                                            <span>Rack Layout</span>
                                        </div>
                                    }>
                                    <img src={rackLayout} alt='grid-view' />
                                </Tooltip>
                            </div>

                            <div
                                className='blueprint'
                                style={{ borderRight: "none" }}
                                onClick={() => {
                                    handleChangeView(
                                        "blueprint",
                                        assetData.floor_id,
                                        assetData.room_id
                                    );
                                    history.push(
                                        "/operation/cdc_asset_monitoring/monitoring"
                                    );
                                }}>
                                <Tooltip
                                    tooltip={
                                        <div
                                            style={{
                                                color: "white",
                                                minWidth: "100px",
                                                textAlign: "center",
                                            }}>
                                            <span>Asset Monitoring Layout</span>
                                        </div>
                                    }>
                                    <img src={monitLayout} alt='grid-view' />
                                </Tooltip>
                            </div>
                            <div
                                onClick={() => handleChangeView("rackconsumption",assetData.floor_id,
                                assetData.room_id)}
                                className='blueprint'
                                style={{
                                    borderRight: "none",
                                    backgroundColor:
                                        viewType === "rackconsumption"
                                            ? "#4244D4"
                                            : ""
                                }}>
                                <Tooltip
                                    tooltip={
                                        <div
                                            style={{
                                                color: "white",
                                                minWidth: "100px",
                                                textAlign: "center",
                                                
                                            }}>
                                            <span>Rack Consumption</span>
                                        </div>
                                    }>
                                    <img
                                        src={rackconsumption}
                                        style={{height:"23px"}}
                                        alt='grid-view'
                                    />
                                </Tooltip>
                            </div>
                            <div
                                className='grid'
                                onClick={() => {
                                    history.push(`${baseURL}`);
                                    handleChangeView(
                                        "grid",
                                        assetData.floor_id,
                                        assetData.room_id
                                    );
                                }}>
                                <Tooltip
                                    tooltip={
                                        <div
                                            style={{
                                                color: "white",
                                                minWidth: "100px",
                                                textAlign: "center",
                                            }}>
                                            <span>
                                                Asset Monitoring Overview
                                            </span>
                                        </div>
                                    }>
                                    <img src={monitOverview} alt='grid-view' />
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>

                {assetNotFound ? (
                    <div className='content-page-not-found-desktop'>
                        <div>
                            <span className='page-not-found-value'>
                                Asset Not Found
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className='monitoring-chart-container'>
                        <div className='grid-horizon'>
                            <div className='grid-left'>
                                <LoadingData
                                    isLoading={loading.log}
                                    size='150px'
                                />
                                <AssetCard
                                    assetData={assetData}
                                    isPreview={true}
                                />
                                <div className='alerts-container'>
                                    <div>
                                        <div className='alerts-label'>
                                            Daily Alerts
                                        </div>
                                        <div className='condition'>
                                            <div className='critical'>
                                                <span>Critical</span>
                                                <div>
                                                    {summary.criticalCount || 0}
                                                </div>
                                            </div>
                                            <div className='warning'>
                                                <span>Warning</span>
                                                <div>
                                                    {summary.warningCount || 0}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='alerts-table-container'>
                                        <span>Latest Alerts Log</span>
                                        <div className='monitoring-table-container'>
                                            <TableDCIM
                                                header={tableHeader}
                                                body={
                                                    tableBody.length > 0
                                                        ? tableBody
                                                        : generateDummyLogs()
                                                }
                                                actions={[]}
                                                selectTable={false}
                                                onSelect={() => {}}
                                                customCellClassNames={[]}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='grid-right'>
                                <div
                                    style={{
                                        width: "100%",
                                        position: "relative",
                                    }}>
                                    <LoadingData
                                        isLoading={loading.statusChart}
                                        size='150px'
                                    />
                                    <div
                                        className='status-chart'
                                        style={{
                                            padding: "0px 30px 0px 60px",
                                            height: "180px",
                                        }}>
                                        <div className='status-chart-legend-top'>
                                            <div className='status-chart-data'>
                                                <span>Status</span>
                                                <div
                                                    className={`status-chart-data-2 ${assetData.status}`}>
                                                    <span>
                                                        {assetData.status}
                                                    </span>

                                                    <Tooltip
                                                        tooltip={
                                                            <span
                                                                style={{
                                                                    color: "white",
                                                                }}>
                                                                {
                                                                    assetData.total_timestamp
                                                                }
                                                            </span>
                                                        }>
                                                        <span className='status-chart-timestamp'>
                                                            {
                                                                assetData.total_timestamp
                                                            }
                                                        </span>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                            <div className='status-chart-data'>
                                                <span>Condition</span>
                                                {assetData.status &&
                                                assetData.status === "DOWN" ? (
                                                    <div className='status-chart-data-2-down'>
                                                        <img
                                                            src={alarmTriangle}
                                                            alt='alarm'></img>
                                                    </div>
                                                ) : assetData.status ===
                                                  "OFFLINE" ? (
                                                    <div className='status-chart-data-2-offline'>
                                                        <img
                                                            src={notConnected}
                                                            alt='not-connected'></img>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`status-chart-data-2 ${assetData.condition}`}>
                                                        <span>
                                                            {
                                                                assetData.condition
                                                            }
                                                        </span>
                                                        <Tooltip
                                                            tooltip={
                                                                <span
                                                                    style={{
                                                                        color: "white",
                                                                    }}>
                                                                    {
                                                                        assetData.total_timestamp_condition
                                                                    }
                                                                </span>
                                                            }>
                                                            <span className='status-chart-timestamp'>
                                                                {
                                                                    assetData.total_timestamp_condition
                                                                }
                                                            </span>
                                                        </Tooltip>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ width: "100%" }}>
                                            <ReactApexChart
                                                series={statusChart.series}
                                                options={statusChart.options}
                                                type='rangeBar'
                                                height={180}
                                            />
                                        </div>

                                        <div className='monitoring-status-end-border' />
                                        {/* <img
                                            src={resetZoom}
                                            alt='reset-coom'
                                            onClick={() =>
                                                setStatusChart((prev) => ({
                                                    ...prev,
                                                    options: defaultOption,
                                                }))
                                            }
                                            className='reset-zoom-chart'
                                            style={{ right: "15px" }}
                                        /> */}
                                    </div>
                                    {/* <div className='status-chart-legend'>
                                        <div className='status'>
                                            <div>
                                                <svg
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    width='21'
                                                    height='9'
                                                    viewBox='0 0 21 9'>
                                                    <rect
                                                        id='Rectangle_17566'
                                                        data-name='Rectangle 17566'
                                                        width='21'
                                                        height='9'
                                                        fill='#00a629'
                                                    />
                                                </svg>

                                                <div className='running'>
                                                    UP
                                                </div>
                                            </div>
                                            <div>
                                                <svg
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    width='21'
                                                    height='9'
                                                    viewBox='0 0 21 9'>
                                                    <rect
                                                        id='Rectangle_17105'
                                                        data-name='Rectangle 17105'
                                                        width='21'
                                                        height='9'
                                                        fill='#f11b2a'
                                                    />
                                                </svg>
                                                <div className='down'>DOWN</div>
                                            </div>
                                            <div>
                                                <svg
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    width='21'
                                                    height='9'
                                                    viewBox='0 0 21 9'>
                                                    <rect
                                                        id='Rectangle_18563'
                                                        data-name='Rectangle 18563'
                                                        width='21'
                                                        height='9'
                                                        fill='#51414c'
                                                    />
                                                </svg>

                                                <div className='unknown'>
                                                    OFFLINE
                                                </div>
                                            </div>
                                        </div>
                                        <div className='condition'>
                                            <div>
                                                <svg
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    width='17'
                                                    height='17'
                                                    viewBox='0 0 17 17'>
                                                    <path
                                                        id='Path_23196'
                                                        data-name='Path 23196'
                                                        d='M8.5,0A8.5,8.5,0,1,1,0,8.5,8.5,8.5,0,0,1,8.5,0Z'
                                                        fill='#00a629'
                                                    />
                                                </svg>

                                                <div className='running'>
                                                    Good
                                                </div>
                                            </div>
                                            <div>
                                                <svg
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    width='17'
                                                    height='17'
                                                    viewBox='0 0 17 17'>
                                                    <path
                                                        id='Path_23669'
                                                        data-name='Path 23669'
                                                        d='M8.5,0A8.5,8.5,0,1,1,0,8.5,8.5,8.5,0,0,1,8.5,0Z'
                                                        fill='#febc2c'
                                                    />
                                                </svg>

                                                <div className='warning'>
                                                    Warning
                                                </div>
                                            </div>
                                            <div>
                                                <svg
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    width='17'
                                                    height='17'
                                                    viewBox='0 0 17 17'>
                                                    <path
                                                        id='Path_23670'
                                                        data-name='Path 23670'
                                                        d='M8.5,0A8.5,8.5,0,1,1,0,8.5,8.5,8.5,0,0,1,8.5,0Z'
                                                        fill='#f11b2a'
                                                    />
                                                </svg>

                                                <div className='down'>
                                                    Critical
                                                </div>
                                            </div>
                                            <div>
                                                <svg
                                                    xmlns='http://www.w3.org/2000/svg'
                                                    width='17'
                                                    height='17'
                                                    viewBox='0 0 17 17'>
                                                    <path
                                                        id='Path_23671'
                                                        data-name='Path 23671'
                                                        d='M8.5,0A8.5,8.5,0,1,1,0,8.5,8.5,8.5,0,0,1,8.5,0Z'
                                                        fill='#51414c'
                                                    />
                                                </svg>

                                                <div className='unknown'>
                                                    Offline
                                                </div>
                                            </div>
                                        </div>
                                    </div> */}
                                </div>
                                <div className='line-chart'>
                                    <div className='chart-edit-button'>
                                        <div onClick={toggleThreshold}>
                                            <svg
                                                xmlns='http://www.w3.org/2000/svg'
                                                width='21.066'
                                                height='21.344'
                                                viewBox='0 0 21.066 21.344'>
                                                <g
                                                    id='Icon_feather-edit-3'
                                                    data-name='Icon feather-edit-3'
                                                    transform='translate(1 1)'>
                                                    <path
                                                        id='Path_782'
                                                        data-name='Path 782'
                                                        d='M18,30h8.565'
                                                        transform='translate(-7.499 -10.656)'
                                                        fill='none'
                                                        stroke='#fff'
                                                        stroke-linecap='round'
                                                        stroke-linejoin='round'
                                                        stroke-width='2'
                                                    />
                                                    <path
                                                        id='Path_783'
                                                        data-name='Path 783'
                                                        d='M18.874,5.02a2.168,2.168,0,0,1,3.194,0,2.5,2.5,0,0,1,0,3.389L8.759,22.532,4.5,23.662l1.065-4.519Z'
                                                        transform='translate(-4.5 -4.318)'
                                                        fill='none'
                                                        stroke='#fff'
                                                        stroke-linecap='round'
                                                        stroke-linejoin='round'
                                                        stroke-width='2'
                                                    />
                                                </g>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className='monitoring-line-chart-paging'>
                                        <div className='line-chart-container'>
                                            {tags.length > 0 &&
                                                isStatusLoaded &&
                                                tags.map((tag, index) => {
                                                    return (
                                                        <MonitoringLineChart
                                                            key={index}
                                                            tag={tag}
                                                            tag_name={tag.name}
                                                            tagLength={
                                                                tags.length
                                                            }
                                                            generateLimit={
                                                                generateLimit
                                                            }
                                                            date={filter.date}
                                                            formatDate={
                                                                formatDate
                                                            }
                                                            generateOverview={
                                                                generateOverview
                                                            }
                                                            statusSeries={
                                                                statusChart.series
                                                            }
                                                        />
                                                    );
                                                })}
                                            {/* {tags.length === 0 && (
                                            <div className='empty-tags'>
                                                No Data
                                            </div>
                                        )} */}
                                        </div>
                                        <div className='monitoring-chart-paging-container'>
                                            <Paging
                                                firstPage={firstPage}
                                                lastPage={lastPage}
                                                nextPage={nextPage}
                                                prevPage={prevPage}
                                                currentPageNumber={
                                                    filter.currentPage
                                                }
                                                lastPageNumber={filter.lastPage}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <ButtonDetail onClick={toggleLegend} />
            </React.Fragment>
        )
    );
};

export default MonitoringChart;

// generate chart limit
const generateLimit = (min, max, value, date) => {
    const array = [];
    for (let i = min; i < max; i++) {
        // array.push([new Date(new Date().setHours(i, 0, 0)).getTime(), value]);
        array.push({
            x: new Date(new Date(formatDate(date)).setHours(i, 0, 0)).getTime(),
            y: value,
        });
        if (i !== max) {
            array.push({
                x: new Date(
                    new Date(formatDate(date)).setHours(i, 30, 0)
                ).getTime(),
                y: value,
            });
        }
    }
    return array;
};

// generate chart value random
const generateRandom = (min, max, warningLimit, criticalLimit) => {
    const array = [];
    for (let i = min; i <= max; i++) {
        const value = Math.floor(Math.random() * (40 - 0)) + 0;
        array.push({
            x: new Date(
                generateDateGMT8(new Date()).setHours(i, 0, 0)
            ).getTime(),
            y: value,
            fillColor:
                value <= criticalLimit
                    ? "#F11B2A"
                    : value <= warningLimit
                    ? "#FEBC2C"
                    : "#00A629",
        });
        array.push({
            x: new Date(
                generateDateGMT8(new Date()).setHours(i, 30, 0)
            ).getTime(),
            y: value,
            fillColor:
                value <= criticalLimit
                    ? "#F11B2A"
                    : value <= warningLimit
                    ? "#FEBC2C"
                    : "#00A629",
        });
    }
    return array;
};

// generate dumy empty table logs
const generateDummyLogs = () => {
    const tableBody = new Array(7).fill({}).map((item, index) => {
        return {
            id: "",
            date: "",
            type: "",
            description: "",
        };
    });

    return tableBody;
};

// format date
const formatDate = (dateVal) => {
    var newDate = new Date(dateVal);

    var sMonth = padValue(newDate.getMonth() + 1);
    var sDay = padValue(newDate.getDate());
    var sYear = newDate.getFullYear();
    return sYear + "-" + sMonth + "-" + sDay;
};

const padValue = (value) => {
    return value < 10 ? "0" + value : value;
};

// generate threshold overview
const generateOverview = (comparison, firstVal, secondVal) => {
    const compare = (value) => {
        if (value === 0) {
            return "0";
        } else if (value) {
            return value;
        } else {
            return "---";
        }
    };
    switch (comparison) {
        case "LOWER_THAN":
            return `X < ${compare(firstVal)}`;
        case "LOWER_THAN_EQUAL":
            return `X <= ${compare(firstVal)}`;
        case "HIGHER_THAN":
            return `X > ${compare(firstVal)}`;
        case "HIGHER_THAN_EQUAL":
            return `X >= ${compare(firstVal)}`;
        case "HIGHER_THAN_AND_LOWER":
            return `X > ${compare(firstVal)}, X < ${compare(secondVal)}`;
        case "HIGHER_THAN_EQUAL_AND_LOWER":
            return `X >= ${compare(firstVal)}, X < ${compare(secondVal)}`;
        case "HIGHER_THAN_AND_LOWER_EQUAL":
            return `X > ${compare(firstVal)}, X <= ${compare(secondVal)}`;
        case "HIGHER_THAN_EQUAL_AND_LOWER_EQUAL":
            return `X >= ${compare(firstVal)}, X <= ${compare(secondVal)}`;
        case "BETWEEN":
            return `${compare(secondVal)} < X < ${compare(firstVal)}`;
        default:
            return "---";
    }
};

const capitalizeFirstLetter = (string) => {
    string = string.toLowerCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const parsingConditionSeries = (allSeries) => {
    let statusSeries = allSeries.filter(
        (data) =>
            (data.name.toLowerCase() === "offline" ||
                data.name.toLowerCase() === "down") &&
            data.data[0].x.toLowerCase() === "status"
    );

    if (statusSeries.length > 0) {
        let resultParsed = allSeries;

        // filter condition data where cond start_time >= status_start && cond end_time <= status_end
        statusSeries.forEach((status, index) => {
            resultParsed = resultParsed.filter((el) => {
                // not include these part
                return (
                    (el.data[0].x.toLowerCase() === "condition" &&
                        (el.data[0].y[0] <= status.data[0].y[0] ||
                            el.data[0].y[1] >= status.data[0].y[1])) ||
                    el.data[0].x.toLowerCase() === "status"
                );
            });
        });

        // z
        statusSeries.forEach((status) => {
            let foundOnStart = resultParsed.findIndex(
                (el) =>
                    el.data[0].x.toLowerCase() === "condition" &&
                    el.data[0].y[1] > status.data[0].y[0] &&
                    el.data[0].y[1] < status.data[0].y[1]
            );
            let foundOnEnd = resultParsed.findIndex(
                (el) =>
                    el.data[0].x.toLowerCase() === "condition" &&
                    el.data[0].y[0] > status.data[0].y[0] &&
                    el.data[0].y[0] < status.data[0].y[1]
            );

            // update condition end to status_start
            if (foundOnStart !== -1) {
                // console.log("star", foundOnStart);
                resultParsed[foundOnStart].data[0].y[1] = status.data[0].y[0];
            }

            // update condition start to status_end
            if (foundOnEnd !== -1) {
                // console.log("end", foundOnEnd);
                resultParsed[foundOnEnd].data[0].y[0] = status.data[0].y[1];
            }

            // handle status on middle of the condition
            if (foundOnEnd === -1 && foundOnStart === -1) {
                let foundOnMiddle = resultParsed.findIndex(
                    (el) =>
                        el.data[0].x.toLowerCase() === "condition" &&
                        el.data[0].y[0] <= status.data[0].y[0] &&
                        el.data[0].y[1] >= status.data[0].y[1]
                );

                if (foundOnMiddle !== -1) {
                    // console.log("foundMiddle", foundOnMiddle);
                    // check the timing
                    // if condition start equal to status start, update condition start with status end
                    if (
                        resultParsed[foundOnMiddle].data[0].y[0] ===
                        status.data[0].y[0]
                    ) {
                        resultParsed[foundOnMiddle].data[0].y[0] =
                            status.data[0].y[1];
                    }
                    // if condition end equal to status end, update condition end with status start
                    else if (
                        resultParsed[foundOnMiddle].data[0].y[1] ===
                        status.data[0].y[1]
                    ) {
                        resultParsed[foundOnMiddle].data[0].y[1] =
                            status.data[0].y[0];
                    }

                    // if not match both above -> right in the middle without
                    else {
                        // generate new
                        const parsed = resultParsed[foundOnMiddle];
                        const statusPrev = status.data[0];

                        const firstObject = {
                            name: parsed.name,
                            data: [
                                {
                                    x: parsed.data[0].x,
                                    y: [parsed.data[0].y[0], statusPrev.y[0]],
                                },
                            ],
                        };

                        const secObject = {
                            name: parsed.name,
                            data: [
                                {
                                    x: parsed.data[0].x,
                                    y: [statusPrev.y[1], parsed.data[0].y[1]],
                                },
                            ],
                        };

                        resultParsed = resultParsed.filter(
                            (data, idx) => idx !== foundOnMiddle
                        );
                        // // push new data
                        // resultParsed.push(firstData);
                        // resultParsed.push(secData);
                        resultParsed.splice(
                            foundOnMiddle,
                            1,
                            firstObject,
                            secObject
                        );

                        // console.log(resultParsed);
                    }
                }
            }
        });

        return resultParsed;
    } else {
        return allSeries;
    }
    // console.log(result);
};
