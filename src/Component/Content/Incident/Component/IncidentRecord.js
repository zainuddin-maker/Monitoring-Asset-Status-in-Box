import React, { useState, useCallback, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import axios from "axios";

// svg
import editIcon from "../../../../svg/edit_pencil.svg";
import xMarkIcon from "../../../../svg/x-mark.svg";
import fileIcon from "../../../../svg/file.svg";

import {
    InputDropdownHorizontal,
    SearchBar,
    InputDateHorizontal,
    TableDCIM,
    Paging,
    useModal,
    LoadingData,
    Tooltip,
    exportCSVFile,
    ExportButton,
    getLimitTableDCIM,
    getUACWithoutToast,
    generateDateGMT8,
} from "../../../ComponentReuseable/index";
import IncidentRecordDetail from "./IncidentRecordDetail";
import IncidentForm from "./IncidentForm";
import IncidentRecordConfirm from "./IncidentRecordConfirm";

import { getToken, getUserDetails } from "../../../TokenParse/TokenParse";
import { timeFormatter } from "./timeFormatter";
import { toast } from "react-toastify";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";

const IncidentRecord = ({ status }) => {
    // MODALS
    const { isShowing: isShowingEdit, toggle: toggleEdit } = useModal();
    const { isShowing: isShowingDetail, toggle: toggleDetail } = useModal();
    const { isShowing: isShowingConfirm, toggle: toggleConfirm } = useModal();

    // loading
    const [loading, setLoading] = useState({
        data: false,
        chart: false,
        export: false,
        floor: false,
        room: false,
        priority: false,
        severity: false,
    });

    // chart filtering
    const chartFilterOptions = {
        status: ["Open", "Closed", "Waiting Conf.", "All"],
        time: ["Today", "MTD", "YTD"],
    };
    // filter chart
    const [chartFilter, setChartFilter] = useState({
        status: "open",
        time: "today",
    });

    // filter data
    const [filter, setFilter] = useState({
        search: "",
        floor: "",
        room: "",
        priority: "",
        severity: "",
        status: "",
        incidentDate: "",
        reportDate: "",
        category: "all",

        currentPage: 1,
        lastPage: 1,
        limit: 10,
        offset: 0,
    });
    const [roomDisable, setRoomDisable] = useState(true);

    const [filterOptions, setFilterOptions] = useState({
        floor: [],
        room: [],
        priority: [],
        severity: [],
        status: status,
        category: [],
    });

    // TABLE BODY
    const [body, setBody] = useState([]);

    // selected incident
    const [selectedIncident, setSelectedIncident] = useState({
        id: "",
        report_time: "",
        incident_time: "",
        category: "",
        floor: "",
        room: "",
        priority: "",
        severity: "",
        status: "",
        assetNo: "",
        submitter: "",
        remark: "",
    });

    // handling filter change input
    const handleChangeFilter = (e) => {
        if (e.target) {
            let { name, value } = e.target;
            if (name === "floor") {
                if (!value) {
                    setRoomDisable(true);
                } else {
                    setRoomDisable(false);
                }
                setFilter((prev) => {
                    prev.floor = value;
                    prev.room = "";
                    return { ...prev };
                });
            } else {
                setFilter((prev) => {
                    prev[name] = value;
                    return { ...prev };
                });
            }
        } else {
            setFilter((prev) => {
                prev.category = e;
                return { ...prev };
            });
        }
    };
    const clearData = (name) => {
        setFilter((prev) => {
            prev[name] = "";
            return { ...prev };
        });
    };
    // chart filter
    const handleChangeFilterChart = (type, value) => {
        setChartFilter((prev) => {
            prev[type] = value;
            return { ...prev };
        });
    };

    // handling table row selection
    const handleSelectRow = (selectedItem, index) => {
        setSelectedIncident({ ...selectedItem });
    };

    // table paging function
    const firstPage = () => {
        setFilter((prev) => {
            return { ...prev, currentPage: 1 };
        });
    };
    const lastPage = () => {
        setFilter((prev) => {
            return { ...prev, currentPage: prev.lastPage };
        });
    };
    const nextPage = () => {
        if (filter.currentPage < filter.lastPage) {
            setFilter((prev) => {
                return { ...prev, currentPage: prev.currentPage + 1 };
            });
        }
    };
    const prevPage = () => {
        if (filter.currentPage > 1) {
            setFilter((prev) => {
                return { ...prev, currentPage: prev.currentPage - 1 };
            });
        }
    };

    // get data room based on floor
    const getRooms = useCallback(() => {
        setLoading((prev) => {
            return { ...prev, room: true };
        });
        const formData = new FormData();
        formData.append("floor_name", filter.floor);
        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_INCIDENT_GET_ROOMS,
            headers: {
                authorization: getToken(),
            },
            data: formData,
        };

        axios(config)
            .then((response) => {
                if (response.data.data) {
                    setFilterOptions((prev) => {
                        prev.room = response.data.data;
                        return { ...prev };
                    });
                }
                setLoading((prev) => {
                    return { ...prev, room: false };
                });
            })
            .catch((err) => {
                // console.log(err);
                setLoading((prev) => {
                    return { ...prev, room: false };
                });
            });
    }, [filter.floor]);

    useEffect(() => {
        if (filter.floor) {
            getRooms();
        } else {
            setFilterOptions((prev) => {
                prev.room = [];
                return { ...prev };
            });
        }
    }, [filter.floor, getRooms]);

    // GET INCIDENT LIST
    const getIncidentList = useCallback(
        (search = "") => {
            setLoading((prev) => {
                prev.data = true;
                return { ...prev };
            });
            // page limit data
            let maxDataPerPage = getLimitTableDCIM();

            const formData = new FormData();
            formData.append("search", search);
            formData.append(
                "category",
                filter.category !== "all" ? filter.category : ""
            );
            formData.append("floor", filter.floor);
            formData.append("room", filter.room);
            formData.append("priority", filter.priority);
            formData.append("severity", filter.severity);
            formData.append("status", filter.status);
            formData.append("incident_date", filter.incidentDate);
            formData.append("report_date", filter.reportDate);
            formData.append("full_name", getUserDetails().fullname);
            formData.append(
                "group_name",
                getUserDetails().userGroupName.join(",")
            );
            formData.append(
                "offset",
                (filter.currentPage - 1) * maxDataPerPage
            );

            if (maxDataPerPage > 0) {
                formData.append("page_limit", maxDataPerPage);
            } else {
                maxDataPerPage = filter.limit;
                formData.append("page_limit", filter.limit);
            }

            const config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env.REACT_APP_INCIDENT_GET_LIST,
                headers: {
                    authorization: getToken(),
                },
                data: formData,
            };
            axios(config)
                .then((response) => {
                    if (response.data.length > 0) {
                        const tempList = response.data.map((incident) => {
                            incident.incident_time_initial =
                                incident.incident_time;
                            incident.incident_time = timeFormatter(
                                incident.incident_time
                            );
                            incident.report_time_initial = incident.report_time;
                            incident.report_time = timeFormatter(
                                incident.report_time
                            );
                            if (incident.close_time) {
                                incident.close_time = timeFormatter(
                                    incident.close_time
                                );
                            }

                            return incident;
                        });

                        setBody((prev) => {
                            return tempList;
                        });
                        let lastPage = Math.ceil(
                            tempList[0].count / maxDataPerPage
                        );
                        setFilter((prev) => {
                            prev.lastPage = lastPage;
                            if (lastPage <= prev.currentPage) {
                                prev.currentPage = lastPage;
                            }
                            return { ...prev };
                        });
                    } else {
                        setBody([]);
                        setFilter((prev) => {
                            prev.lastPage = 1;
                            prev.currentPage = 1;

                            return { ...prev };
                        });
                    }
                    setLoading((prev) => {
                        prev.data = false;
                        return { ...prev };
                    });
                })
                .catch((err) => {
                    toast.error("Failed to get data", {
                        toastId: "failed-get-data",
                    });
                    setLoading((prev) => {
                        prev.data = false;
                        return { ...prev };
                    });
                });
        },
        [
            filter.category,
            filter.currentPage,
            filter.floor,
            filter.incidentDate,
            filter.priority,
            filter.reportDate,
            filter.room,
            filter.severity,
            filter.status,
        ]
    );

    const getIncidentListExport = (e) => {
        setLoading((prev) => {
            prev.export = true;
            return { ...prev };
        });
        const formData = new FormData();
        formData.append("search", filter.search);
        formData.append(
            "category",
            filter.category !== "all" ? filter.category : ""
        );
        formData.append("floor", filter.floor);
        formData.append("room", filter.room);
        formData.append("priority", filter.priority);
        formData.append("severity", filter.severity);
        formData.append("status", filter.status);
        formData.append("incident_date", filter.incidentDate);
        formData.append("report_date", filter.reportDate);

        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_INCIDENT_EXPORT,
            headers: {
                authorization: getToken(),
            },
            data: formData,
        };

        axios(config)
            .then((response) => {
                if (response.data) {
                    if (response.data.data.length > 0) {
                        // PROCESSING THE EXPORT HERE
                        const fileName = `Incident_[${new Date()
                            .toLocaleString("sv-SE")
                            .replace(" ", ",")}]_[${
                            filter.category.toLocaleLowerCase() === "all"
                                ? "All Category"
                                : "Category " + filter.category
                        }]_[${
                            !filter.floor
                                ? "All Floor"
                                : filterOptions.floor.find(
                                      (data) =>
                                          data.id === parseInt(filter.floor)
                                  ).name + " Floor"
                        }]_[${
                            !filter.room
                                ? "All Room"
                                : filterOptions.room.find(
                                      (data) =>
                                          data.id === parseInt(filter.room)
                                  ).name + " Room"
                        }]_[${
                            !filter.priority
                                ? "All Priority"
                                : filter.priority + " Priority"
                        }]_[${
                            !filter.severity
                                ? "All Severity"
                                : filter.severity + " Severity"
                        }]_[${
                            !filter.status
                                ? "All Status"
                                : filter.status + " Status"
                        }]`;
                        const headers = [
                            "id",
                            "report_time",
                            "incident_time",
                            "category",
                            "floor",
                            "room",
                            "priority",
                            "severity",
                            "status",
                        ];
                        const data = [
                            {
                                sheetName: "Incident",
                                header: headers,
                                body: response.data.data,
                            },
                        ];
                        exportCSVFile(data, fileName);
                    } else {
                        toast.warning("Data is Empty", {
                            toastId: "failed-get-data",
                        });
                    }
                } else {
                    toast.warning("Data is Empty", {
                        toastId: "failed-get-data",
                    });
                }
                setLoading((prev) => {
                    prev.export = false;
                    return { ...prev };
                });
            })
            .catch((err) => {
                toast.error("Failed to get data", {
                    toastId: "failed-get-data",
                });
                setLoading((prev) => {
                    prev.export = false;
                    return { ...prev };
                });
            });
    };

    // get floors
    const getFloors = useCallback(() => {
        setLoading((prev) => {
            return { ...prev, floor: true };
        });
        let config = {
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_INCIDENT_GET_FLOORS,
            method: "post",
            headers: {
                authorization: getToken(),
            },
        };
        axios(config)
            .then((response) => {
                if (response.data.data) {
                    const result = response.data.data;
                    if (result.length > 0) {
                        setFilterOptions((prev) => {
                            return { ...prev, floor: result };
                        });
                    } else {
                        setFilterOptions((prev) => {
                            return { ...prev, floor: [] };
                        });
                    }
                }
                setLoading((prev) => {
                    return { ...prev, floor: false };
                });
            })
            .catch((error) => {
                setLoading((prev) => {
                    return { ...prev, floor: false };
                });
            });
    }, []);

    // get incident categories
    const getCategories = useCallback(() => {
        let config = {
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_INCIDENT_GET_CATEGORIES,
            method: "post",
            headers: {
                authorization: getToken(),
            },
        };
        axios(config).then((response) => {
            if (response.data.data) {
                let result = response.data.data;
                if (result.length > 0) {
                    setFilterOptions((prev) => {
                        return { ...prev, category: result };
                    });
                } else {
                    setFilterOptions((prev) => {
                        return { ...prev, category: result };
                    });
                }
            }
        });
    }, []);

    // get priority & severity categories
    const getPrioritySeverity = useCallback(() => {
        setLoading((prev) => {
            return { ...prev, priority: true, severity: true };
        });
        let config = {
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_INCIDENT_GET_PRIORITY,
            method: "post",
            headers: {
                authorization: getToken(),
            },
        };
        axios(config)
            .then((response) => {
                if (response.data) {
                    const result = response.data;
                    if (result.length > 0) {
                        setFilterOptions((prev) => {
                            return {
                                ...prev,
                                priority: result,
                                severity: result,
                            };
                        });
                    } else {
                        setFilterOptions((prev) => {
                            return { ...prev, priority: [], severity: [] };
                        });
                    }
                }
                setLoading((prev) => {
                    return { ...prev, priority: false, severity: false };
                });
            })
            .catch((error) => {
                setLoading((prev) => {
                    return { ...prev, priority: false, severity: false };
                });
            });
    }, []);

    // GET DATA
    useEffect(() => {
        getIncidentList();
    }, [
        getIncidentList,
        filter.category,
        filter.currentPage,
        filter.floor,
        filter.incidentDate,
        filter.priority,
        filter.reportDate,
        filter.room,
        filter.severity,
        filter.status,
    ]);

    // update filters data from props
    useEffect(() => {
        getCategories();
        getFloors();
        getPrioritySeverity();
    }, [getCategories, getFloors, getPrioritySeverity]);

    const header = {
        report_time: { width: "200px", name: "Report Timestamp" },
        incident_time: { width: "200px", name: "Incident Timestamp" },
        category: { width: "150px", name: "Category" },
        floor: { width: "80px", name: "Floor" },
        room: { width: "80px", name: "Room" },
        priority: { width: "90px", name: "Priority" },
        severity: { width: "90px", name: "Severity" },
        status: { width: "150px", name: "Status" },
    };

    const actions = [
        {
            iconSrc: xMarkIcon,
            onClick: (selectedItem, index) => {
                handleSelectRow(selectedItem, index);
                toggleConfirm();
            },
            checkFunction: (selectedItem, index) => {
                return (
                    selectedItem.status === "OPEN" &&
                    getUACWithoutToast("delete")
                );
            },
        },
        {
            iconSrc: editIcon,
            onClick: (selectedItem, index) => {
                handleSelectRow(selectedItem, index);
                toggleEdit();
            },
            checkFunction: (selectedItem, index) => {
                // check if the user still can edit or the user is admin
                return (
                    selectedItem.canEdit === true &&
                    selectedItem.status === "OPEN"
                );
            },
        },
        {
            iconSrc: fileIcon,
            onClick: (selectedItem, index) => {
                handleSelectRow(selectedItem, index);
                toggleDetail();
            },
        },
    ];

    const customCellClassNames = {
        status: [
            { value: "OPEN", className: "column-open" },
            { value: "CLOSED", className: "column-closed" },
            { value: "Waiting Confirmation", className: "column-waiting" },
        ],
    };

    // CHART SECTION
    const [totalData, setTotalData] = useState(0);
    // PIE CHART
    const [pieChartData, setPieChartData] = useState({
        // asset, security, fire, env, net, power
        series: [],
        options: {
            noData: {
                text: "No Data",
                align: "left",
                verticalAlign: "middle",
                offsetX: 30,
                offsetY: -30,
                style: {
                    color: "#fff",
                    fontSize: "20px",
                    fontFamily: "Segoe UI",
                },
            },
            chart: {
                // width: 380,
                type: "pie",
            },
            labels: [
                "Asset",
                "Security",
                "Fire",
                "Environment",
                "Network",
                "Power",
            ],
            colors: [
                "#4244D4",
                "#597BD9",
                "#F11B2A",
                "#00A629",
                "#5F5F7A",
                "#FEBC2C",
            ],
            legend: {
                show: false,
                position: "right",
                offsetY: -15,
                labels: {
                    colors: ["white"],
                    fontSize: "14px",
                },
                markers: {
                    radius: 0,
                },
            },
            stroke: {
                show: false,
            },
            plotOptions: {
                pie: {
                    expandOnClick: false,
                },
            },
            dataLabels: {
                enabled: false,
            },
        },
    });

    // PARETO CHART
    const [paretoData, setParetoData] = useState({
        series: [],
        options: {
            chart: {
                height: 350,
                type: "line",
                toolbar: {
                    show: false,
                },
            },
            stroke: {
                width: [0, 4],
            },
            legend: {
                show: false,
            },
            dataLabels: {
                enabled: true,
                enabledOnSeries: [0],
                colors: "#fff",
                background: {
                    enabled: false,
                },
                position: "top",
                offsetY: -15,
            },
            labels: [
                "Network",
                "Asset",
                "Security",
                "Power",
                "Environment",
                "Fire",
            ],
            xaxis: {
                labels: {
                    // rotate: -45,
                    // rotateAlways: true,
                    style: {
                        colors: "white",
                        fontSize: "16px",
                        // fontWeight: 500,
                    },
                },
                formatter: (val, index) => {
                    return val;
                },
                tooltip: {
                    enabled: false,
                },
            },
            yaxis: [
                {
                    show: false,
                    labels: {
                        style: {
                            colors: "white",
                        },
                    },
                },
                {
                    opposite: true,
                    labels: {
                        style: {
                            colors: "white",
                        },
                    },
                    min: 0,
                    max: 100,
                    tickAmount: 4,
                    labels: {
                        formatter: function (val, index) {
                            return val + "%";
                        },
                        style: {
                            colors: "white",
                        },
                    },
                },
            ],
            tooltip: {
                shared: true,
                intersect: false,
                theme: "dark",
                y: [
                    {
                        formatter: function (y) {
                            if (typeof y !== "undefined") {
                                return y.toFixed(0);
                            }
                            return y;
                        },
                    },
                    {
                        formatter: function (y) {
                            if (typeof y !== "undefined") {
                                return y.toFixed(2) + " %";
                            }
                            return y;
                        },
                    },
                ],
            },
            plotOptions: {
                bar: {
                    columnWidth: "30%",
                },
            },
            colors: [
                function ({ value, seriesIndex, dataPointIndex, w }) {
                    return "#fff";
                },
                () => {
                    return "#F11B2A";
                },
            ],
        },
    });

    // donut CHART
    const donutProperties = {
        noData: {
            text: "No Data",
            align: "center",
            verticalAlign: "middle",
            offsetY: -30,
            style: {
                color: "#fff",
                fontSize: "20px",
                fontFamily: "Segoe UI",
            },
        },
        chart: {
            type: "donut",
        },
        grid: {
            padding: {
                left: -10,
                right: -10,
            },
        },
        labels: ["High", "Medium", "Low"],
        stroke: {
            show: false,
        },
        colors: ["#f11b2a", "#feae00", "#00f23d"],
        plotOptions: {
            pie: {
                customScale: 1,
                donut: {
                    size: "40%",
                },
                expandOnClick: false,
            },
        },
        dataLabels: {
            enabled: true,
            formatter: (val, opts) => {
                return opts.w.globals.seriesNames[opts.seriesIndex];
            },
            style: {
                fontSize: "14px",
                fontWeight: "500",
            },
        },
        legend: {
            show: false,
        },
    };
    const [priorityDonut, setPriorityDonut] = useState({
        // high, medium, low
        series: [],
        options: donutProperties,
    });
    const [severityDonut, setSeverityDonut] = useState({
        // high, medium, low
        series: [],
        options: donutProperties,
    });

    // function to get pie and pareto chart
    const getPiePareto = useCallback(() => {
        setLoading((prev) => {
            prev.chart = true;
            return { ...prev };
        });
        const formData = new FormData();
        formData.append(
            "status",
            chartFilter.status === "all" ? "" : chartFilter.status
        );
        const today = generateDateGMT8(new Date());
        formData.append("end_date", today.toISOString().slice(0, 10));
        if (chartFilter.time === "today") {
            formData.append("start_date", today.toISOString().slice(0, 10));
        } else if (chartFilter.time === "mtd") {
            formData.append(
                "start_date",
                new Date(
                    generateDateGMT8(new Date()).setMonth(today.getMonth() - 1)
                )
                    .toISOString()
                    .slice(0, 10)
            );
        } else {
            //ytd
            formData.append(
                "start_date",
                new Date(
                    generateDateGMT8(new Date()).setFullYear(
                        today.getFullYear() - 1
                    )
                )
                    .toISOString()
                    .slice(0, 10)
            );
        }

        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_INCIDENT_GET_PIE_PARETO,
            data: formData,
            headers: {
                authorization: getToken(),
            },
        };
        axios(config)
            .then((response) => {
                if (response.data) {
                    setTotalData(response.data.count);
                    setPieChartData((prev) => {
                        prev.series = response.data.pie;
                        return { ...prev };
                    });

                    let paretoSeries = [
                        {
                            name: "Bar",
                            type: "column",
                            data: response.data.pareto.bar,
                        },
                        {
                            name: "Line",
                            type: "line",
                            data: response.data.pareto.line,
                        },
                    ];

                    setParetoData((prev) => {
                        return { ...prev, series: paretoSeries };
                    });
                }
                setLoading((prev) => {
                    prev.chart = false;
                    return { ...prev };
                });
            })
            .catch((err) => {
                toast.error("Failed to get chart data: " + err.message, {
                    toastId: "error-chart",
                });
                setLoading((prev) => {
                    prev.chart = false;
                    return { ...prev };
                });
            });
    }, [chartFilter]);

    const getDonut = useCallback(() => {
        setLoading((prev) => {
            prev.chart = true;
            return { ...prev };
        });
        const formData = new FormData();
        formData.append(
            "status",
            chartFilter.status === "all" ? "" : chartFilter.status
        );
        const today = generateDateGMT8(new Date());
        formData.append("end_date", today.toISOString().slice(0, 10));
        if (chartFilter.time === "today") {
            formData.append("start_date", today.toISOString().slice(0, 10));
        } else if (chartFilter.time === "mtd") {
            formData.append(
                "start_date",
                new Date(
                    generateDateGMT8(new Date()).setMonth(today.getMonth() - 1)
                )
                    .toISOString()
                    .slice(0, 10)
            );
        } else {
            //ytd
            formData.append(
                "start_date",
                new Date(
                    generateDateGMT8(new Date()).setFullYear(
                        today.getFullYear() - 1
                    )
                )
                    .toISOString()
                    .slice(0, 10)
            );
        }

        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_INCIDENT_GET_DONUT,
            data: formData,
            headers: {
                authorization: getToken(),
            },
        };
        axios(config)
            .then((response) => {
                if (response.data) {
                    setPriorityDonut((prev) => {
                        prev.series = response.data.priority;
                        return { ...prev };
                    });
                    setSeverityDonut((prev) => {
                        prev.series = response.data.severity;
                        return { ...prev };
                    });
                }
                setLoading((prev) => {
                    prev.chart = false;
                    return { ...prev };
                });
            })
            .catch((err) => {
                toast.error("Failed to get chart data: " + err.message, {
                    toastId: "error-chart",
                });
                setLoading((prev) => {
                    prev.chart = false;
                    return { ...prev };
                });
            });
    }, [chartFilter]);

    useEffect(() => {
        getPiePareto();
        getDonut();
    }, [chartFilter]);

    return (
        <React.Fragment>
            {/* MODALS */}
            <IncidentRecordConfirm
                selectedIncident={selectedIncident}
                isShowing={isShowingConfirm}
                hide={toggleConfirm}
                getIncidentList={getIncidentList}
            />
            <IncidentForm
                isShowing={isShowingEdit}
                hide={toggleEdit}
                incidentData={selectedIncident}
                isEdit={true}
                getIncidentList={getIncidentList}
            />
            <IncidentRecordDetail
                selectedIncident={selectedIncident}
                isShowing={isShowingDetail}
                hide={toggleDetail}
            />

            <div className='record-filter-container'>
                <SearchBar
                    name='search'
                    value={filter.search}
                    search={(val) =>
                        handleChangeFilter({
                            target: {
                                name: "search",
                                value: val,
                            },
                        })
                    }
                    searchContent={() => getIncidentList(filter.search)}
                />
                <InputDropdownHorizontal
                    inputWidth='110px'
                    name='floor'
                    label='Floor'
                    value={filter.floor}
                    options={filterOptions.floor}
                    onChange={handleChangeFilter}
                    isLoading={loading.floor}
                />
                <InputDropdownHorizontal
                    inputWidth='110px'
                    name='room'
                    label='Room'
                    value={filter.room}
                    options={filterOptions.room}
                    onChange={handleChangeFilter}
                    isDisabled={roomDisable}
                    isLoading={loading.room}
                />
                <InputDropdownHorizontal
                    inputWidth='110px'
                    name='priority'
                    label='Priority'
                    value={filter.priority}
                    options={filterOptions.priority}
                    onChange={handleChangeFilter}
                    isLoading={loading.priority}
                />
                <InputDropdownHorizontal
                    inputWidth='110px'
                    name='severity'
                    label='Severity'
                    value={filter.severity}
                    options={filterOptions.severity}
                    onChange={handleChangeFilter}
                    isLoading={loading.severity}
                />
                <InputDropdownHorizontal
                    inputWidth='110px'
                    name='status'
                    label='Status'
                    value={filter.status}
                    options={filterOptions.status}
                    onChange={handleChangeFilter}
                />
                <InputDateHorizontal
                    inputWidth='200px'
                    name='incidentDate'
                    label='Incident Date'
                    value={filter.incidentDate}
                    onChange={handleChangeFilter}
                    clearData={() => clearData("incidentDate")}
                />
                <InputDateHorizontal
                    inputWidth='200px'
                    name='reportDate'
                    label='Report Date'
                    value={filter.reportDate}
                    onChange={handleChangeFilter}
                    clearData={() => clearData("reportDate")}
                />
            </div>
            <div className='record-body-container'>
                <div className='table-filter-container'>
                    <div className='incident-padding-table'>
                        <div className='tab-menu-export'>
                            <div className='tab-menu-container'>
                                {filterOptions.category.map(
                                    (category, index) => {
                                        return (
                                            <div
                                                key={index}
                                                onClick={() => {
                                                    handleChangeFilter(
                                                        category.name.toLowerCase()
                                                    );
                                                }}
                                                className={
                                                    filter.category ===
                                                    category.name.toLowerCase()
                                                        ? "selected"
                                                        : ""
                                                }>
                                                <span>{category.name}</span>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                            <div className='incident-export-button'>
                                <ExportButton
                                    onClick={getIncidentListExport}
                                    isLoading={loading.export}
                                />
                            </div>
                        </div>

                        <div className='table-container' id='table-height'>
                            <LoadingData isLoading={loading.data} />
                            <TableDCIM
                                header={header}
                                body={body}
                                actions={actions}
                                selectable={false}
                                onSelect={(selectedItem, index) => {
                                    handleSelectRow(selectedItem, index);
                                }}
                                customCellClassNames={customCellClassNames}
                            />
                        </div>
                        <div className='paging-container'>
                            <Paging
                                firstPage={firstPage}
                                lastPage={lastPage}
                                nextPage={nextPage}
                                prevPage={prevPage}
                                currentPageNumber={filter.currentPage}
                                lastPageNumber={filter.lastPage}
                            />
                        </div>
                    </div>
                </div>
                <div className='chart-card-container-content'>
                    <div className='chart-card-container'>
                        <div className='chart-filter-container'>
                            <div className='left-tab-menu'>
                                {chartFilterOptions.status.map(
                                    (status, index) => {
                                        return (
                                            <div
                                                key={index}
                                                onClick={() =>
                                                    handleChangeFilterChart(
                                                        "status",
                                                        status.toLowerCase()
                                                    )
                                                }
                                                className={
                                                    chartFilter.status ===
                                                    status.toLowerCase()
                                                        ? "selected"
                                                        : ""
                                                }>
                                                <span>{status}</span>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                            <div className='right-tab-menu'>
                                {chartFilterOptions.time.map((time, index) => {
                                    return (
                                        <div
                                            key={index}
                                            onClick={() =>
                                                handleChangeFilterChart(
                                                    "time",
                                                    time.toLowerCase()
                                                )
                                            }
                                            className={
                                                chartFilter.time ===
                                                time.toLowerCase()
                                                    ? "selected"
                                                    : ""
                                            }>
                                            <span>{time}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className='chart-container'>
                            <LoadingData isLoading={loading.chart} />
                            <div className='top-chart-container'>
                                <div className='chart-title'>
                                    {`${uppercasing(
                                        chartFilter.status
                                    )} Incident by Category`}
                                </div>
                                <div className='chart-open-incident'>
                                    <div className='chart-legend'>
                                        <ReactApexChart
                                            options={pieChartData.options}
                                            series={pieChartData.series}
                                            type='pie'
                                            width={200}
                                        />
                                        <div className='category-legend-container'>
                                            {filterOptions.category.length >
                                                0 &&
                                                filterOptions.category
                                                    .filter(
                                                        (data) =>
                                                            data.name.toLowerCase() !==
                                                            "all"
                                                    )
                                                    .map((data, index) => {
                                                        return (
                                                            <div
                                                                key={index}
                                                                className='category-label'>
                                                                <div
                                                                    id={`${data.name.toLowerCase()}`}></div>
                                                                <span>
                                                                    {data.name}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                        </div>
                                    </div>
                                    <div className='open-card-container'>
                                        <div>{`Total ${uppercasing(
                                            chartFilter.status
                                        )} Incident`}</div>
                                        <div className='open-value-container'>
                                            <div>
                                                <span>{totalData}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='mid-chart-container'>
                                <div className='chart-title'>
                                    {`${uppercasing(
                                        chartFilter.status
                                    )} Incident by Category Pareto`}
                                </div>
                                <div className='chart-bar-incident'>
                                    <ReactApexChart
                                        options={paretoData.options}
                                        series={paretoData.series}
                                        type='line'
                                        width={600}
                                        height={200}
                                    />
                                </div>
                            </div>
                            <div className='bottom-chart-container'>
                                <div className='bottom-left-chart'>
                                    <div className='chart-open-incident'>
                                        <div className='chart-title'>
                                            Priority
                                        </div>
                                        <ReactApexChart
                                            options={priorityDonut.options}
                                            series={priorityDonut.series}
                                            type='donut'
                                            width={180}
                                        />
                                    </div>
                                    <div className='donut-legend-container'>
                                        <div>
                                            <span>High</span>
                                            <div>
                                                {priorityDonut.series[0] || 0}
                                            </div>
                                        </div>
                                        <div>
                                            <span>Medium</span>
                                            <div>
                                                {priorityDonut.series[1] || 0}
                                            </div>
                                        </div>
                                        <div>
                                            <span>Low</span>
                                            <div>
                                                {priorityDonut.series[2] || 0}
                                            </div>
                                        </div>
                                        <div>
                                            <span>Total</span>
                                            <div>{totalData}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className='bottom-left-chart'>
                                    <div className='chart-open-incident'>
                                        <div className='chart-title'>
                                            Severity
                                        </div>
                                        <ReactApexChart
                                            options={severityDonut.options}
                                            series={severityDonut.series}
                                            type='donut'
                                            width={180}
                                        />
                                    </div>
                                    <div className='donut-legend-container'>
                                        <div>
                                            <span>High</span>
                                            <div>
                                                {severityDonut.series[0] || 0}
                                            </div>
                                        </div>
                                        <div>
                                            <span>Medium</span>
                                            <div>
                                                {severityDonut.series[1] || 0}
                                            </div>
                                        </div>
                                        <div>
                                            <span>Low</span>
                                            <div>
                                                {severityDonut.series[2] || 0}
                                            </div>
                                        </div>
                                        <div>
                                            <span>Total</span>
                                            <div>{totalData}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default IncidentRecord;

// uppercasing first letter
const uppercasing = (str) => {
    const arr = str.split(" ");
    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    return arr.join(" ");
};
