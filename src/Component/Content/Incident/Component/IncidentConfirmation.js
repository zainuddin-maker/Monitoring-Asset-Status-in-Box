import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import {
    InputDropdownHorizontal,
    SearchBar,
    InputDateHorizontal,
    Paging,
    useModal,
    LoadingData,
    PushNotification,
    ModalConfirm,
} from "../../../ComponentReuseable/index";
import IncidentConfirmationCard from "./IncidentConfirmationCard";
import IncidentRecordDetail from "./IncidentRecordDetail";

import { getToken, getUserDetails } from "../../../TokenParse/TokenParse";
import { timeFormatter } from "./timeFormatter";
import { getLimitCard } from "../../../ComponentReuseable/Functions";

import { ReturnHostBackend } from "../../../BackendHost/BackendHost";

const IncidentConfirmation = () => {
    const { isShowing: isShowingConf, toggle: toggleConf } = useModal();
    const { isShowing: isShowingReject, toggle: toggleReject } = useModal();
    const { isShowing: isShowingDetail, toggle: toggleDetail } = useModal();
    // loading state
    const [isLoading, setLoading] = useState({
        confirm: false,
        reject: false,
        data: false,
        floor: false,
        room: false,
        priority: false,
        severity: false,
    });

    // filter data
    const [filter, setFilter] = useState({
        search: "",
        floor: "",
        room: "",
        priority: "",
        severity: "",
        incidentDate: "",
        closeDate: "",
        category: "all",

        currentPage: 1,
        lastPage: 1,
        limit: 4,
        offset: 0,
    });
    const [disableRoom, setDisableRoom] = useState(true);

    const [filterOptions, setFilterOptions] = useState({
        floor: [],
        room: [],
        priority: [],
        severity: [],
        category: [],
    });

    // selected confirm
    const [selectedConfirmation, setSelectedConfirmation] = useState({
        id: "",
        reportTime: "",
        incident_time: "",
        category: "",
        floor: "",
        room: "",
        priority: "",
        severity: "",
        assetNo: "",
        submitter: "",
        remark: "",
        status: "",
    });

    // confirmation list
    const [confirmList, setConfirmList] = useState([]);

    // handling filter change input
    const handleChangeFilter = (e) => {
        if (e.target) {
            let { name, value } = e.target;
            if (name === "floor") {
                if (!value) {
                    setDisableRoom(true);
                } else {
                    setDisableRoom(false);
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
                prev.category = e.toLowerCase();
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
            .catch((prev) => {
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

    // handleClik card
    const handleClick = (e, index) => {
        setSelectedConfirmation((prev) => {
            return { ...prev, ...confirmList[index] };
        });
        toggleDetail();
    };

    // update filters data from props
    useEffect(() => {
        getCategories();
        getFloors();
        getPrioritySeverity();
    }, [getCategories, getFloors, getPrioritySeverity]);

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
            let maxDataPerPage = getLimitCard(400, 327, 20);

            const formData = new FormData();
            formData.append("search", filter.search || search);
            formData.append(
                "category",
                filter.category !== "all" ? filter.category : ""
            );
            formData.append("floor", filter.floor);
            formData.append("room", filter.room);
            formData.append("priority", filter.priority);
            formData.append("severity", filter.severity);
            formData.append("incident_date", filter.incidentDate);
            formData.append("close_date", filter.closeDate);
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
                    ReturnHostBackend(process.env.REACT_APP_JDBC) +
                    process.env.REACT_APP_INCIDENT_GET_WAITING,
                headers: {
                    authorization: getToken(),
                },
                data: formData,
            };
            axios(config)
                .then((response) => {
                    if (response.data.data) {
                        if (response.data.data.length > 0) {
                            const tempList = response.data.data.map(
                                (incident) => {
                                    incident.incident_time_initial =
                                        incident.incident_time;
                                    incident.incident_time = timeFormatter(
                                        incident.incident_time
                                    );
                                    incident.report_time_initial =
                                        incident.report_time;
                                    incident.report_time = timeFormatter(
                                        incident.report_time
                                    );
                                    incident.close_time = timeFormatter(
                                        incident.close_time
                                    );
                                    return incident;
                                }
                            );
                            setConfirmList((prev) => {
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
                            setConfirmList([]);
                            setFilter((prev) => {
                                prev.lastPage = 1;
                                prev.currentPage = 1;

                                return { ...prev };
                            });
                        }
                    } else {
                        setConfirmList([]);
                        setFilter((prev) => {
                            prev.lastPage = 1;
                            prev.currentPage = 1;

                            return { ...prev };
                        });
                    }
                    setTimeout(() => {
                        setLoading((prev) => {
                            prev.data = false;
                            return { ...prev };
                        });
                    }, 500);
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
            filter.closeDate,
            filter.room,
            filter.severity,
        ]
    );

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
        filter.closeDate,
        filter.room,
        filter.severity,
    ]);

    const pushNotif = async (notifMessage, category) => {
        const formData = new FormData();
        formData.append("type", "record");
        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_INCIDENT_USER_GROUP,
            headers: {
                authorization: getToken(),
            },
            data: formData,
        };
        axios(config)
            .then(async (response) => {
                if (response.data) {
                    try {
                        const message = notifMessage;
                        const is_general = false;
                        const user_group_name = response.data;
                        const notification_category_name = "incident";
                        const notification_sub_category_name = category;
                        const notification_url =
                            "operation/cdc_asset_monitoring/incident/record";
                        const result = await PushNotification(
                            message,
                            is_general,
                            user_group_name,
                            notification_category_name,
                            notification_sub_category_name,
                            notification_url
                        );
                    } catch (e) {
                        // console.log(e.toString());
                    }
                }
            })
            .catch((err) => {
                // console.log(err);
            });
    };

    // HANDLING CONFIRM
    const handleConfirm = () => {
        setLoading((prev) => {
            prev.confirm = true;
            return { ...prev };
        });
        const formData = new FormData();
        // get from local storage
        const confirmer = getUserDetails().fullname;
        formData.append("record_id", selectedConfirmation.id);
        formData.append("confirmer", confirmer);
        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_INCIDENT_CONFIRM,
            data: formData,
            headers: {
                authorization: getToken(),
            },
        };

        axios(config)
            .then((response) => {
                if (response.data.data) {
                    pushNotif(
                        "Incident Close Confirmation",
                        selectedConfirmation.category
                    );
                    toast.success("Incident Confirmed as Closed", {
                        toastId: "confirm",
                    });
                }
                setLoading((prev) => {
                    prev.confirm = false;
                    return { ...prev };
                });
                toggleConf();
                getIncidentList();
            })
            .catch((err) => {
                toast.error("Confirmation Failed: " + err.message, {
                    toastId: "error",
                });
                setLoading((prev) => {
                    prev.confirm = false;
                    return { ...prev };
                });
                getIncidentList();
                toggleConf();
            });
    };

    // HANDLE REJECTION
    const handleReject = () => {
        setLoading((prev) => {
            prev.reject = true;
            return { ...prev };
        });
        const formData = new FormData();
        formData.append("record_id", selectedConfirmation.id);

        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_INCIDENT_REJECT,
            data: formData,
            headers: {
                authorization: getToken(),
            },
        };

        axios(config)
            .then((response) => {
                if (response.data.data) {
                    pushNotif(
                        "Incident Close Rejection",
                        selectedConfirmation.category
                    );
                    toast.success("Incident Rejected", {
                        toastId: "reject",
                    });
                }
                setLoading((prev) => {
                    prev.reject = false;
                    return { ...prev };
                });
                toggleReject();
                getIncidentList();
            })
            .catch((err) => {
                toast.error("Rejection Failed: " + err.message, {
                    toastId: "error",
                });
                setLoading((prev) => {
                    prev.reject = false;
                    return { ...prev };
                });
                getIncidentList();
                toggleReject();
            });
    };

    return (
        <React.Fragment>
            <ModalConfirm
                isShowing={isShowingConf}
                hide={toggleConf}
                actionName='Confirm'
                objectType=' Incident'
                objectName='as Closed'
                onConfirm={handleConfirm}
                isLoading={isLoading.confirm}
            />
            <ModalConfirm
                isShowing={isShowingReject}
                hide={toggleReject}
                actionName='Reject'
                objectType=' Incident'
                objectName='as Closed'
                onConfirm={handleReject}
                isLoading={isLoading.reject}
            />
            <div className='record-filter-container'>
                <IncidentRecordDetail
                    selectedIncident={selectedConfirmation}
                    isShowing={isShowingDetail}
                    hide={toggleDetail}
                />
                <SearchBar
                    name='search'
                    value={filter.search}
                    search={(val) => {
                        handleChangeFilter({
                            target: { name: "search", value: val },
                        });
                    }}
                    searchContent={() => {
                        getIncidentList(filter.search);
                    }}
                />
                <InputDropdownHorizontal
                    inputWidth='110px'
                    name='floor'
                    label='Floor'
                    value={filter.floor}
                    options={filterOptions.floor}
                    onChange={handleChangeFilter}
                    isLoading={isLoading.floor}
                />
                <InputDropdownHorizontal
                    inputWidth='110px'
                    name='room'
                    label='Room'
                    value={filter.room}
                    options={filterOptions.room}
                    onChange={handleChangeFilter}
                    isDisabled={disableRoom}
                    isLoading={isLoading.room}
                />
                <InputDropdownHorizontal
                    inputWidth='110px'
                    name='priority'
                    label='Priority'
                    value={filter.priority}
                    options={filterOptions.priority}
                    onChange={handleChangeFilter}
                    isLoading={isLoading.priority}
                />
                <InputDropdownHorizontal
                    inputWidth='110px'
                    name='severity'
                    label='Severity'
                    value={filter.severity}
                    options={filterOptions.severity}
                    onChange={handleChangeFilter}
                    isLoading={isLoading.severity}
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
                    name='closeDate'
                    label='Close Date'
                    value={filter.closeDate}
                    onChange={handleChangeFilter}
                    clearData={() => clearData("closeDate")}
                />
            </div>
            <div className='tab-menu-container'>
                {filterOptions.category.map((category, index) => {
                    return (
                        <div
                            key={index}
                            onClick={() =>
                                handleChangeFilter(category.name.toLowerCase())
                            }
                            className={
                                filter.category === category.name.toLowerCase()
                                    ? "selected"
                                    : ""
                            }>
                            <span>{category.name}</span>
                        </div>
                    );
                })}
            </div>
            <div
                className='confirmation-card-container'
                id='limit-container-card-dcim'>
                <LoadingData isLoading={isLoading.data} />
                <div className='confirmation-card'>
                    {confirmList.length > 0 &&
                        confirmList.map((card, index) => {
                            return (
                                <IncidentConfirmationCard
                                    key={index}
                                    cardData={card}
                                    handleClick={(e) => handleClick(e, index)}
                                    toggleConf={() => {
                                        toggleConf();
                                        setSelectedConfirmation((prev) => {
                                            return {
                                                ...prev,
                                                ...confirmList[index],
                                            };
                                        });
                                    }}
                                    toggleReject={() => {
                                        toggleReject();
                                        setSelectedConfirmation((prev) => {
                                            return {
                                                ...prev,
                                                ...confirmList[index],
                                            };
                                        });
                                    }}
                                />
                            );
                        })}
                </div>

                <Paging
                    firstPage={firstPage}
                    lastPage={lastPage}
                    nextPage={nextPage}
                    prevPage={prevPage}
                    currentPageNumber={filter.currentPage}
                    lastPageNumber={filter.lastPage}
                />
            </div>
        </React.Fragment>
    );
};

export default IncidentConfirmation;
