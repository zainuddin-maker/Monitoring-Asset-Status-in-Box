import React, { useState, useEffect, useCallback } from "react";
import {
    Switch,
    Route,
    useRouteMatch,
    useHistory,
    useLocation,
    matchPath,
} from "react-router-dom";

import "./style.scss";

import { ReturnHostBackend } from "../../BackendHost/BackendHost";
import MonitoringCollection from "./Component/MonitoringCollection";
import MonitoringChart from "./Component/MonitoringChart";
import MonitoringAreaView from "./MonitoringAreaView/MonitoringAreaView.index";
import { Timer, getLimitCard } from "../../ComponentReuseable/index";
import { getToken } from "../../TokenParse/TokenParse";
import axios from "axios";
import { toast } from "react-toastify";

// TODO HERE:
// 1. Get option list
// 2. get total asset (assetList)
// 4. request on filter change

const Monitoring = ({ setPageName }) => {
    const [loading, setLoading] = useState(false);
    const [loadingParam, setLoadingParam] = useState({
        floor: false,
        room: false,
        function: false,
        asset: false,
    });
    const baseURL = "/operation/cdc_asset_monitoring/monitoring";
    let { path, url } = useRouteMatch();
    const [isSetFilter, setIsSetFilter] = useState(false);
    const history = useHistory();
    const locationRack = useLocation();
    const currentLocation = useLocation().pathname;
    // grid or blueprint
    const [viewType, setViewType] = useState(
        currentLocation.split("/").length === 4 ? "blueprint" : "grid"
    );
    // asset count & list asset data
    const [assetList, setAssetList] = useState({
        count: 0,
        countUP: 0,
        percentUP: 0,
        countDOWN: 0,
        percentDOWN: 0,
        countUNKNOWN: 0,
        percentUNKNOWN: 0,
        list: [],
    });

    // data filter
    const [statusFilter, setStatusFilter] = useState("all");
    const [disableRoom, setDisableRoom] = useState(true);
    const [filter, setFilter] = useState({
        search: "",
        floor: "",
        room: "",
        function: "",
        assetNo: "",
        assetNoId: "",

        currentPage: 1,
        lastPage: 1,
        limit: 4,
        offset: 0,
    });
    const [filterOptions, setFilterOptions] = useState({
        floor: [],
        room: [],
        function: [],
        assetNo: [],
    });

    // handle change tab view
    const handleChangeView = (view, floor, room) => {
        if (view === "rack_layout") {
            setPageName("Layout Visualization");
            history.push({
                pathname:
                    "/operation/rack_and_server_management/layout_visualization",
                state: {
                    floor: floor,
                    room: room,
                    viewType: view,
                },
            });
        } else if ( view === "rackconsumption"){
            setPageName("rackconsumption");
            history.push({
                pathname: "/operation/consumption/rack",
                state: {
                    floor: filter.floor,
                    room: filter.room,
                    viewType: "rackconsumption",
                },
            });
        }
        setSearchAndAsset((prev) => {
            return { ...prev, search: "", asset: "" };
        });

        if (floor) {
            setFilter((prev) => {
                return { ...prev, floor: floor, search: "", assetNo: "" };
            });
            setDisableRoom(false);
        }
        if (room) {
            setFilter((prev) => {
                return { ...prev, room: room, search: "", assetNo: "" };
            });
        }

        setViewType(view);
    };

    // handle change input filter dropdown
    const handleChange = (e) => {
        if (e.target) {
            let { name, value } = e.target;
            if (name.toLowerCase() === "floor") {
                if (!value) {
                    setDisableRoom(true);
                } else {
                    setDisableRoom(false);
                }
                setFilter((prev) => {
                    prev.floor = value;
                    prev.room = "";
                    prev.assetNo = "";
                    return { ...prev };
                });
            } else {
                setFilter((prev) => {
                    prev[name] = value;
                    if (name.toLowerCase() !== "assetno") {
                        prev.assetNo = "";
                    }
                    return { ...prev };
                });
            }
        } else {
            setFilter((prev) => {
                prev.search = e;
                return { ...prev };
            });
        }
    };
    // clearing asset number
    const handleClearAsset = () => {
        setFilter((prev) => ({ ...prev, assetNo: "" }));
    };
    // input validation for datalist
    const validateInput = (e) => {
        let { name, value } = e.target;
        if (name === "assetNo") {
            let found = filterOptions.assetNo.find(
                (data) =>
                    data.id.toString() === value.toLowerCase() ||
                    data.name.toLowerCase() === value.toLowerCase()
            );
            if (found) {
                setSearchAndAsset((prev) => {
                    return { ...prev, asset: found.id };
                });
            } else {
                if (value) {
                    toast.error("Asset is Invalid", { toastId: "error" });
                }
                setSearchAndAsset((prev) => {
                    return { ...prev, asset: "" };
                });
                setFilter((prev) => {
                    return { ...prev, assetNo: "", assetNoId: "" };
                });
            }
        }
    };

    // get asset list
    const [assetAxios, setAssetAxios] = useState({
        getAssets: axios.CancelToken.source(),
    });
    const [searchAndAsset, setSearchAndAsset] = useState({
        search: "",
        asset: "",
    });
    const getAssetList = useCallback(
        (search = "", assetNo = "", isTimeLoading) => {
            let loadingTimeout;
            if (isTimeLoading) {
                loadingTimeout = setTimeout(() => {
                    setLoading(true);
                }, 5000);
            } else {
                setLoading(true);
            }

            if (assetNo) {
                let found = filterOptions.assetNo.find(
                    (data) =>
                        data.id.toString() === filter.assetNo.toLowerCase() ||
                        data.name.toLowerCase() === filter.assetNo.toLowerCase()
                );
                if (found) {
                    assetNo = found.id;
                }
            }

            let maxDataPerPage;
            if (document.getElementById("limit-container-card-dcim")) {
                maxDataPerPage = getLimitCard(420, 195, 10);
            } else {
                maxDataPerPage = 12;
            }
            const data = new FormData();
            data.append("search", search);
            data.append("status", statusFilter === "all" ? "" : statusFilter);
            data.append("floor_id", filter.floor);
            data.append("room_id", filter.room);
            data.append("function_id", filter.function);
            data.append("asset_id", assetNo);
            data.append("offset", (filter.currentPage - 1) * maxDataPerPage);
            if (maxDataPerPage > 0) {
                data.append("page_limit", maxDataPerPage);
            } else {
                data.append("page_limit", filter.limit);
            }

            const config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env.REACT_APP_MONITORING_GET_ASSET_LIST,
                headers: {
                    authorization: getToken(),
                },
                data: data,
            };
            axios(config)
                .then((response) => {
                    if (response.data) {
                        setAssetList((prev) => {
                            prev.count = response.data.count;
                            prev.countUP = response.data.countUP;
                            prev.percentUP = response.data.percentUP;
                            prev.countDOWN = response.data.countDOWN;
                            prev.percentDOWN = response.data.percentDOWN;
                            prev.countUNKNOWN = response.data.countUNKNOWN;
                            prev.percentUNKNOWN = response.data.percentUNKNOWN;
                            prev.list = response.data.list;
                            return { ...prev };
                        });
                        let lastPage;
                        if (statusFilter === "all") {
                            lastPage = Math.ceil(
                                response.data.count / maxDataPerPage
                            );
                        } else if (statusFilter === "up") {
                            lastPage = Math.ceil(
                                response.data.countUP / maxDataPerPage
                            );
                        } else if (statusFilter === "down") {
                            lastPage = Math.ceil(
                                response.data.countDOWN / maxDataPerPage
                            );
                        } else if (statusFilter === "offline") {
                            lastPage = Math.ceil(
                                response.data.countUNKNOWN / maxDataPerPage
                            );
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
                    } else {
                        setAssetList((prev) => {
                            prev.count = 0;
                            prev.countUP = 0;
                            prev.percentUP = 0;
                            prev.countDOWN = 0;
                            prev.percentDOWN = 0;
                            prev.list = [];
                            return { ...prev };
                        });
                    }
                    if (isTimeLoading) {
                        clearTimeout(loadingTimeout);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    // console.log(err);
                    toast.error("Cannot get asset list: " + err.message, {
                        toastId: "error",
                    });
                    if (isTimeLoading) {
                        clearTimeout(loadingTimeout);
                    }
                    setLoading(false);
                });
        },
        [
            filter.currentPage,
            filter.floor,
            filter.function,
            filter.room,
            statusFilter,
        ]
    );

    // handling route change when card clicked
    const handleChangeRoute = (value) => {
        history.push(`${baseURL}/${value}`);
        setFilter((prev) => {
            prev.assetNo = value;
            return { ...prev };
        });
    };
    // handling refresh on chart view
    const match = matchPath(currentLocation, {
        path: `${baseURL}/:asset`,
        exact: true,
        strict: false,
    });
    const handleBack = () => {
        setFilter((prev) => {
            prev.assetNo = searchAndAsset.asset;
            prev.search = searchAndAsset.search;
            return { ...prev };
        });

        // getAssetList(searchAndAsset.search, searchAndAsset.asset);
        history.push(baseURL);
    };

    // get filter data
    const getFloors = useCallback(() => {
        setLoadingParam((prev) => {
            return { ...prev, floor: true };
        });
        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_MONITORING_GET_FLOORS,
            headers: {
                authorization: getToken(),
            },
        };
        axios(config)
            .then((response) => {
                if (response.data.data) {
                    setFilterOptions((prev) => {
                        prev.floor = response.data.data;
                        return { ...prev };
                    });
                } else {
                    setFilterOptions((prev) => {
                        prev.floor = [];
                        return { ...prev };
                    });
                }
                setLoadingParam((prev) => {
                    return { ...prev, floor: false };
                });
            })
            .catch((err) => {
                // console.log(err);
                setLoadingParam((prev) => {
                    return { ...prev, floor: false };
                });
            });
    }, []);

    const getFunctions = useCallback(() => {
        setLoadingParam((prev) => {
            return { ...prev, function: true };
        });
        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_MONITORING_GET_FUNCTIONS,
            headers: {
                authorization: getToken(),
            },
        };
        axios(config)
            .then((response) => {
                if (response.data.data) {
                    setFilterOptions((prev) => {
                        prev.function = response.data.data;
                        return { ...prev };
                    });
                } else {
                    setFilterOptions((prev) => {
                        prev.function = [];
                        return { ...prev };
                    });
                }
                setLoadingParam((prev) => {
                    return { ...prev, function: false };
                });
            })
            .catch((err) => {
                // console.log(err);
                setLoadingParam((prev) => {
                    return { ...prev, function: false };
                });
            });
    }, []);

    const getRooms = useCallback(() => {
        setLoadingParam((prev) => {
            return { ...prev, room: true };
        });
        const data = new FormData();
        data.append("plant_id", filter.floor);
        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_MONITORING_GET_ROOMS,
            headers: {
                authorization: getToken(),
            },
            data: data,
        };
        axios(config)
            .then((response) => {
                if (response.data.data) {
                    setFilterOptions((prev) => {
                        prev.room = response.data.data;
                        return { ...prev };
                    });
                } else {
                    setFilterOptions((prev) => {
                        prev.room = [];
                        return { ...prev };
                    });
                }
                setLoadingParam((prev) => {
                    return { ...prev, room: false };
                });
            })
            .catch((err) => {
                // console.log(err);
                setLoadingParam((prev) => {
                    return { ...prev, room: false };
                });
            });
    }, [filter.floor]);

    const getAssetNumbers = useCallback(() => {
        setLoadingParam((prev) => {
            return { ...prev, asset: true };
        });
        const data = new FormData();
        const foundFloor = filterOptions.floor.find(
            (data) => data.id === parseInt(filter.floor)
        );
        const foundRoom = filterOptions.room.find(
            (data) => data.id === parseInt(filter.room)
        );
        const foundFunc = filterOptions.function.find(
            (data) => data.id === parseInt(filter.function)
        );
        data.append("floor_name", foundFloor ? foundFloor.name : "");
        data.append("room_name", foundRoom ? foundRoom.name : "");
        data.append("function_name", foundFunc ? foundFunc.name : "");
        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_MONITORING_GET_ASSET_NUMBERS,
            headers: {
                authorization: getToken(),
            },
            data: data,
        };
        axios(config)
            .then((response) => {
                if (response.data.data) {
                    setFilterOptions((prev) => {
                        prev.assetNo = response.data.data;
                        return { ...prev };
                    });
                } else {
                    setFilterOptions((prev) => {
                        prev.assetNo = [];
                        return { ...prev };
                    });
                }
                setLoadingParam((prev) => {
                    return { ...prev, asset: false };
                });
            })
            .catch((err) => {
                setLoadingParam((prev) => {
                    return { ...prev, asset: false };
                });
                // console.log(err);
            });
    }, [filter.floor, filter.room, filter.function]);

    useEffect(() => {
        if (currentLocation === baseURL && viewType === "grid") {
            // console.log("sini", searchAndAsset.search, searchAndAsset.asset);
            getAssetList(searchAndAsset.search, searchAndAsset.asset);
            const intervalGetAssets = setInterval(() => {
                getAssetList(searchAndAsset.search, searchAndAsset.asset, true);
            }, 5 * 1000);

            return () => {
                assetAxios.getAssets.cancel();
                clearInterval(intervalGetAssets);
            };
        }
    }, [
        filter.currentPage,
        filter.floor,
        filter.function,
        filter.room,
        statusFilter,
        getAssetList,
        searchAndAsset.search,
        searchAndAsset.asset,
        currentLocation,
        isSetFilter,
        viewType,
    ]);

    useEffect(() => {
        if (match) {
            setFilter((prev) => {
                prev.assetNo = match.params.asset;
                return { ...prev };
            });
        }

        getFloors();
        getFunctions();
        getAssetNumbers();
    }, [getFunctions, getFloors, getAssetNumbers, history]);

    useEffect(() => {
        if (filter.floor) {
            getRooms();
        } else {
            setFilterOptions((prev) => {
                return { ...prev, room: [] };
            });
            setFilter((prev) => {
                return { ...prev, room: "" };
            });
        }
    }, [filter.floor, getRooms]);

    useEffect(() => {
        if (filter.floor || filter.room || filter.function) {
            getAssetNumbers();
        }
    }, [filter.floor, filter.room, filter.function, getAssetNumbers]);

    useEffect(() => {
        if (!isSetFilter) {
            if (locationRack.state) {
                let stateRack = locationRack.state;
                if (stateRack.floor) {
                    setDisableRoom(false);
                    setFilter((prev) => {
                        return { ...prev, floor: stateRack.floor };
                    });
                }
                if (stateRack.room) {
                    setFilter((prev) => {
                        return { ...prev, room: stateRack.room };
                    });
                }
                if (stateRack.viewType) {
                    setViewType(stateRack.viewType);
                }
                setIsSetFilter(true);
            }
        }
    }, [locationRack]);

    return (
        <div className='monitoring-container'>
            <div className='monitoring-header'>
                <div className='header-overview'>
                    <div className='page-title'>Asset Monitoring</div>
                    {/* {viewType === "grid" && ( */}
                    {/* {match && (
                        <div className='overview'>
                            <span
                                onClick={handleBack}
                                style={{ cursor: "pointer" }}>
                                Overview
                            </span>
                            <>
                                <span>{" > "}</span>
                                <span>{`${match.params.asset} Monitoring`}</span>
                            </>
                        </div>
                    )} */}
                    {/* )} */}
                </div>
                <Timer />
            </div>
            <Switch>
                <Route to exact path={path}>
                    {viewType === "grid" ? (
                        <MonitoringCollection
                            loadingFloor={loadingParam.floor}
                            loadingRoom={loadingParam.room}
                            loadingFunction={loadingParam.function}
                            loadingAsset={loadingParam.asset}
                            setSearchAndAsset={setSearchAndAsset}
                            validateInput={validateInput}
                            setFilter={setFilter}
                            filter={filter}
                            filterOptions={filterOptions}
                            handleChange={handleChange}
                            handleChangeView={handleChangeView}
                            assetList={assetList}
                            viewType={viewType}
                            handleChangeRoute={handleChangeRoute}
                            setAssetList={setAssetList}
                            getAssetList={getAssetList}
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            loading={loading}
                            disableRoom={disableRoom}
                            handleClearAsset={handleClearAsset}
                        />
                    ) : (
                        viewType === "blueprint" && (
                            <MonitoringAreaView
                                handleChangeView={handleChangeView}
                                viewType={viewType}
                                filter={Object.filter(
                                    filter,
                                    ([name, value]) =>
                                        name === "floor" || name === "room"
                                )}
                                setFilter={setFilter}
                                setPageName={setPageName}
                            />
                        )
                    )}
                </Route>
                <Route to path='/:assetNo'>
                    <MonitoringChart
                        match={match}
                        handleChangeView={handleChangeView}
                        viewType={viewType}
                    />
                </Route>
            </Switch>
        </div>
    );
};

export default Monitoring;

// filter object
Object.filter = (obj, predicate) =>
    Object.fromEntries(Object.entries(obj).filter(predicate));
