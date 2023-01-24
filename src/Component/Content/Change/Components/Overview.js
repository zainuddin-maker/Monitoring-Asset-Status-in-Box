import React, { useState, useEffect } from "react";
import iconRequestStatus from "../../../../svg/icon_request_status.svg";
import RequestStatusSquare from "./Overview/RequestStatusSquare";
import { requestStatus } from "./ComponentEnum";
import FilterDate from "./FilterDate";
import PieChart from "./Overview/PieChart";
import DonutChart from "./Overview/DonutChart";
import BarChart from "./Overview/BarChart";
import OverviewTable from "./Overview/OverviewTable";
import {
    DummyRackTable,
    PrevRackTable,
    DummyItemTable,
    PrevItemTable,
    createDataRackChangeOccupation,
    createPrevDataRackChangeOccupation,
    createItemRegisteredChange,
    createPrevItemRegisteredChange,
} from "./Overview/DummyData";
import { requestAPI } from "./Utils/changeUtils";
import {
    getOverviewStatusAPI,
    getOverviewByCategoryAPI,
    getOverviewRackOccupationAPI,
    getOverviewRackClientsAPI,
    getOveriewRackChangeOccupationAPI,
    getOverviewItemClientsAPI,
    getOverviewItemStatusCategoryAPI,
    getOverviewItemRegisteredChangeAPI,
} from "./ChangeAPI";
import { toast } from "react-toastify";
import {
    LoadingData,
    useModal,
    ButtonDetail,
} from "../../../ComponentReuseable";
import Legend from "../../Legend/Legend.index";
import axios from "axios";

const Overview = () => {
    const [requestStatusData, setRequestStatusData] = useState([]);
    const [rackChangeCategory, setRackChangeCategory] = useState([]);
    const labelRackCategory = ["Access", "Client"];
    const [itemChangeCategory, setItemChangeCategory] = useState([]);
    const { isShowing: isShowingLegend, toggle: toggleShowingLegend } =
        useModal();
    const [rackOccupation, setRackOccupation] = useState({
        occupied: "",
        not_occupied: "",
        total: "",
        series: [],
    });
    const [rackClients, setRackClients] = useState({
        pie: [],
        pie_label: [],
        bar: [],
        bar_label: [],
    });
    const [isLoading, setIsLoading] = useState({
        overview_status: false,
        overview_category: false,
        rack_occupation: false,
        rack_clients: false,
        rack_occupation_change: false,
        item_status_category: false,
        item_clients: false,
        item_registered_change: false,
    });

    const [rackChangeOccupation, setRackChangeOccupation] = useState(
        createDataRackChangeOccupation([])
    );
    const [prevRackChangeOccupation, setPrevRackChangeOccupation] = useState(
        createPrevDataRackChangeOccupation([])
    );
    const [itemRegisteredChange, setItemRegisteredChange] = useState(
        createItemRegisteredChange([])
    );
    const [prevItemRegisteredChange, setPrevItemRegisteredChange] = useState(
        createPrevItemRegisteredChange([])
    );

    const [itemStatusCategory, setItemStatuCategory] = useState({
        status: {
            series: [],
            label: ["In-Progress", "Installed", "Removed"],
        },
        category: {
            series: [],
            label: ["Server", "Network", "Power Supply", "Rack Item", "Others"],
        },
    });
    const [itemClients, setItemClients] = useState({
        pie: [],
        pie_label: [],
        bar: [],
        bar_label: [],
    });
    const labelItemCategory = [
        "Connect",
        "Disconnect",
        "Install",
        "Move",
        "Disconnect & Move",
    ];
    const [filterDate, setFilterDate] = useState("1");
    const REFRESH_LOADING_THRESHOLD_MS = 10000; // 10s
    const REFRESH_PARAMETER_MS = 5000; // 10s

    // Get Overview Status
    useEffect(() => {
        let interval = null;
        let loadingTimer = null;
        let mounted = false;
        let cancelToken = axios.CancelToken.source();

        const fetchOverviewStatus = async () => {
            if (!mounted) {
                setIsLoading((prev) => ({ ...prev, overview_status: true }));
                mounted = true;
            } else {
                loadingTimer = setTimeout(() => {
                    setIsLoading((prev) => ({
                        ...prev,
                        overview_status: true,
                    }));
                }, REFRESH_LOADING_THRESHOLD_MS);
            }

            try {
                let result = await requestAPI(
                    getOverviewStatusAPI(cancelToken)
                );
                if (result.data) {
                    result.data.map((el) => {
                        el.status =
                            el.status === "Approval"
                                ? "In Progress"
                                : "Requested";
                        el.categories = JSON.parse(el.categories);
                    });
                    setRequestStatusData([...result.data]);
                } else {
                    setRequestStatusData([...[]]);
                }
                setIsLoading((prev) => ({ ...prev, overview_status: false }));
                clearTimeout(loadingTimer);
                if (interval) {
                    interval = setTimeout(
                        fetchOverviewStatus,
                        REFRESH_PARAMETER_MS
                    );
                }
            } catch (error) {
                if (!axios.isCancel(error)) {
                    toast.error(error.toString(), { toastId: "network-error" });
                }

                setRequestStatusData([...[]]);
                setIsLoading((prev) => ({ ...prev, overview_status: false }));
                clearTimeout(loadingTimer);
                if (interval) {
                    interval = setTimeout(
                        fetchOverviewStatus,
                        REFRESH_PARAMETER_MS
                    );
                }
            }
        };

        interval = setTimeout(fetchOverviewStatus, 10);
        return () => {
            clearTimeout(interval);
            interval = null;

            cancelToken.cancel();

            mounted = false;
        };
    }, []);
    // Get Change Request By Category
    useEffect(() => {
        let interval = null;
        let loadingTimer = null;
        let mounted = false;
        let cancelToken = axios.CancelToken.source();

        const fetchChangeRequestByCategory = async () => {
            if (!mounted) {
                setIsLoading((prev) => ({ ...prev, overview_category: true }));
                mounted = true;
            } else {
                loadingTimer = setTimeout(() => {
                    setIsLoading((prev) => ({
                        ...prev,
                        overview_category: true,
                    }));
                }, REFRESH_LOADING_THRESHOLD_MS);
            }

            try {
                let result = await requestAPI(
                    getOverviewByCategoryAPI(filterDate, cancelToken)
                );
                if (result.data) {
                    let items = result.data.find((x) => x.type === "item")
                        ? JSON.parse(
                              result.data.find((x) => x.type === "item")
                                  .categories
                          )
                        : [];
                    let racks = result.data.find((x) => x.type === "rack")
                        ? JSON.parse(
                              result.data.find((x) => x.type === "rack")
                                  .categories
                          )
                        : [];
                    let rackDataBasedOnLabel = [];
                    labelRackCategory.map((label) => {
                        if (racks.find((val) => val[label])) {
                            rackDataBasedOnLabel.push(
                                racks.find((val) => val[label])[label]
                            );
                        } else {
                            rackDataBasedOnLabel.push(0);
                        }
                    });
                    if (rackDataBasedOnLabel.every((val) => val == 0)) {
                        rackDataBasedOnLabel = [...[]];
                    }
                    let itemDataBasedOnLabel = [];
                    labelItemCategory.map((label) => {
                        if (items.find((val) => val[label])) {
                            itemDataBasedOnLabel.push(
                                items.find((val) => val[label])[label]
                            );
                        } else {
                            itemDataBasedOnLabel.push(0);
                        }
                    });
                    if (itemDataBasedOnLabel.every((val) => val == 0)) {
                        itemDataBasedOnLabel = [...[]];
                    }

                    setRackChangeCategory([...rackDataBasedOnLabel]);
                    setItemChangeCategory([...itemDataBasedOnLabel]);
                } else {
                    setRackChangeCategory([...[]]);
                    setItemChangeCategory([...[]]);
                }
                clearTimeout(loadingTimer);
                setIsLoading((prev) => ({ ...prev, overview_category: false }));
                if (interval) {
                    interval = setTimeout(
                        fetchChangeRequestByCategory,
                        REFRESH_PARAMETER_MS
                    );
                }
            } catch (error) {
                if (!axios.isCancel(error)) {
                    toast.error(error.toString(), { id: "network-error" });
                }

                setRackChangeCategory([...[]]);
                setItemChangeCategory([...[]]);
                setIsLoading((prev) => ({ ...prev, overview_category: false }));
                if (interval) {
                    interval = setTimeout(
                        fetchChangeRequestByCategory,
                        REFRESH_PARAMETER_MS
                    );
                }
            }
        };

        interval = setTimeout(fetchChangeRequestByCategory, 10);
        return () => {
            clearTimeout(interval);
            interval = null;

            cancelToken.cancel();

            mounted = false;
        };
    }, [filterDate]);

    // Get Rack Occupation
    useEffect(() => {
        let interval = null;
        let loadingTimer = null;
        let mounted = false;
        let cancelToken = axios.CancelToken.source();
        const fetchOverviewRackOccupation = async () => {
            if (!mounted) {
                setIsLoading((prev) => ({ ...prev, rack_occupation: true }));
                mounted = true;
            } else {
                loadingTimer = setTimeout(() => {
                    setIsLoading((prev) => ({
                        ...prev,
                        rack_occupation: true,
                    }));
                }, REFRESH_LOADING_THRESHOLD_MS);
            }

            try {
                let result = await requestAPI(
                    getOverviewRackOccupationAPI(cancelToken)
                );
                if (result.data && result.data.length > 0) {
                    setRackOccupation((prev) => {
                        prev.occupied = result.data[0].occupied;
                        prev.not_occupied = result.data[0].not_occupied;
                        prev.total = result.data[0].total_data;
                        prev.series = [...[prev.occupied, prev.not_occupied]];
                        return { ...prev };
                    });
                } else {
                    setRackOccupation((prev) => {
                        prev.occupied = "";
                        prev.not_occupied = "";
                        prev.total = "";
                        prev.series = [...[]];
                        return { ...prev };
                    });
                }
                setIsLoading((prev) => ({ ...prev, rack_occupation: false }));
                clearTimeout(loadingTimer);
                if (interval) {
                    interval = setTimeout(
                        fetchOverviewRackOccupation,
                        REFRESH_PARAMETER_MS
                    );
                }
            } catch (error) {
                if (!axios.isCancel(error)) {
                    toast.error(error.toString(), { toastId: "network-error" });
                }
                setRackOccupation((prev) => {
                    prev.occupied = "";
                    prev.not_occupied = "";
                    prev.total = "";
                    prev.series = [...[]];
                    return { ...prev };
                });
                setIsLoading((prev) => ({ ...prev, rack_occupation: false }));
                clearTimeout(loadingTimer);
                if (interval) {
                    interval = setTimeout(
                        fetchOverviewRackOccupation,
                        REFRESH_PARAMETER_MS
                    );
                }
            }
        };
        interval = setTimeout(fetchOverviewRackOccupation, 10);
        return () => {
            clearTimeout(interval);
            interval = null;

            cancelToken.cancel();
            mounted = false;
        };
    }, []);

    // Get Rack Client
    useEffect(() => {
        let interval = null;
        let loadingTimer = null;
        let mounted = false;
        let cancelToken = axios.CancelToken.source();

        const fetchOverviewClients = async () => {
            if (!mounted) {
                setIsLoading((prev) => ({ ...prev, rack_clients: true }));
                mounted = true;
            } else {
                loadingTimer = setTimeout(() => {
                    setIsLoading((prev) => ({ ...prev, rack_clients: true }));
                }, REFRESH_LOADING_THRESHOLD_MS);
            }
            try {
                let result = await requestAPI(
                    getOverviewRackClientsAPI(cancelToken)
                );
                if (result.data && result.data.length > 0) {
                    let sorted_data = JSON.parse(JSON.stringify(result.data));
                    sorted_data.sort((a, b) => b.count - a.count);
                    setRackClients((prev) => {
                        prev.bar = sorted_data
                            .filter((x) => x.client_name !== "Others")
                            .map((x) => x.count);
                        prev.bar_label = sorted_data
                            .filter((x) => x.client_name !== "Others")
                            .map((x) => x.client_name);
                        prev.pie = result.data.map((x) => x.count);
                        prev.pie_label = result.data.map((x) => x.client_name);
                        return { ...prev };
                    });
                } else {
                }
                setIsLoading((prev) => ({ ...prev, rack_clients: false }));
                clearTimeout(loadingTimer);
                if (interval) {
                    interval = setTimeout(
                        fetchOverviewClients,
                        REFRESH_PARAMETER_MS
                    );
                }
            } catch (error) {
                if (!axios.isCancel(error)) {
                    toast.error(error.toString(), { toastId: "network-error" });
                }
                setIsLoading((prev) => ({ ...prev, rack_clients: false }));
                clearTimeout(loadingTimer);
                if (interval) {
                    interval = setTimeout(
                        fetchOverviewClients,
                        REFRESH_PARAMETER_MS
                    );
                }
            }
        };
        interval = setTimeout(fetchOverviewClients, 10);
        return () => {
            clearTimeout(interval);
            interval = null;

            cancelToken.cancel();
            mounted = false;
        };
    }, []);

    // Get Item Status Category
    useEffect(() => {
        let interval = null;
        let loadingTimer = null;
        let mounted = false;
        let cancelToken = axios.CancelToken.source();

        const fetchItemStatusCategory = async () => {
            if (!mounted) {
                setIsLoading((prev) => ({
                    ...prev,
                    item_status_category: true,
                }));
                mounted = true;
            } else {
                loadingTimer = setTimeout(() => {
                    setIsLoading((prev) => ({
                        ...prev,
                        item_status_category: true,
                    }));
                }, REFRESH_LOADING_THRESHOLD_MS);
            }
            try {
                let result = await requestAPI(
                    getOverviewItemStatusCategoryAPI(cancelToken)
                );
                let resultStatus = result[0];
                let resultCategory = result[1];
                let tempArrayStatus = [];
                let tempArrayCategory = [];
                if (resultStatus.data.length > 0) {
                    itemStatusCategory.status.label.map((val, index) => {
                        let findStatus = resultStatus.data.find(
                            (el) => el.status === val
                        );
                        if (findStatus) {
                            tempArrayStatus.push(parseInt(findStatus.count));
                        } else {
                            tempArrayStatus.push(0);
                        }
                    });
                }

                if (resultCategory.data.length > 0) {
                    let tempArray = [];
                    itemStatusCategory.category.label.map((val, index) => {
                        let findCategory = resultCategory.data.find(
                            (el) => el.item_category_name === val
                        );
                        if (findCategory) {
                            tempArrayCategory.push(
                                parseInt(findCategory.count)
                            );
                        } else {
                            tempArrayCategory.push(0);
                        }
                    });
                }

                setItemStatuCategory((prev) => {
                    prev.status = { ...prev.status, series: tempArrayStatus };
                    prev.category = {
                        ...prev.category,
                        series: tempArrayCategory,
                    };
                    return { ...prev };
                });

                setIsLoading((prev) => ({
                    ...prev,
                    item_status_category: false,
                }));
                clearTimeout(loadingTimer);
                if (interval) {
                    interval = setTimeout(
                        fetchItemStatusCategory,
                        REFRESH_PARAMETER_MS
                    );
                }
            } catch (error) {
                if (!axios.isCancel(error)) {
                    toast.error(error.toString(), { toastId: "network-error" });
                }
                setIsLoading((prev) => ({
                    ...prev,
                    item_status_category: false,
                }));
                clearTimeout(loadingTimer);
                if (interval) {
                    interval = setTimeout(
                        fetchItemStatusCategory,
                        REFRESH_PARAMETER_MS
                    );
                }
            }
        };
        interval = setTimeout(fetchItemStatusCategory, 10);
        return () => {
            clearTimeout(interval);
            interval = null;

            cancelToken.cancel();
            mounted = false;
        };
    }, []);

    // Get Item Clients
    useEffect(() => {
        let interval = null;
        let loadingTimer = null;
        let mounted = false;
        let cancelToken = axios.CancelToken.source();

        const fetchItemClients = async () => {
            if (!mounted) {
                setIsLoading((prev) => ({ ...prev, item_clients: true }));
                mounted = true;
            } else {
                loadingTimer = setTimeout(() => {
                    setIsLoading((prev) => ({ ...prev, item_clients: true }));
                }, REFRESH_LOADING_THRESHOLD_MS);
            }
            try {
                let result = await requestAPI(
                    getOverviewItemClientsAPI(cancelToken)
                );
                if (result.data && result.data.length > 0) {
                    setItemClients((prev) => {
                        let sorted_data = JSON.parse(
                            JSON.stringify(result.data)
                        );
                        sorted_data.sort((a, b) => b.count - a.count);
                        prev.bar = sorted_data
                            .filter((x) => x.client_name !== "Others")
                            .map((x) => x.count);
                        prev.bar_label = sorted_data
                            .filter((x) => x.client_name !== "Others")
                            .map((x) => x.client_name);
                        prev.pie = result.data.map((x) => x.count);
                        prev.pie_label = result.data.map((x) => x.client_name);
                        return { ...prev };
                    });
                } else {
                }
                setIsLoading((prev) => ({ ...prev, item_clients: false }));
                clearTimeout(loadingTimer);
                if (interval) {
                    interval = setTimeout(
                        fetchItemClients,
                        REFRESH_PARAMETER_MS
                    );
                }
            } catch (error) {
                if (!axios.isCancel(error)) {
                    toast.error(error.toString(), { toastId: "network-error" });
                }
                setIsLoading((prev) => ({ ...prev, item_clients: false }));
                clearTimeout(loadingTimer);
                if (interval) {
                    interval = setTimeout(
                        fetchItemClients,
                        REFRESH_PARAMETER_MS
                    );
                }
            }
        };
        interval = setTimeout(fetchItemClients, 10);
        return () => {
            clearTimeout(interval);
            interval = null;

            cancelToken.cancel();
            mounted = false;
        };
    }, []);

    // Get Rack Change Occupation
    useEffect(() => {
        let interval = null;
        let loadingTimer = null;
        let mounted = false;
        let cancelToken = axios.CancelToken.source();
        const fetchRackChangeOccupation = async () => {
            if (!mounted) {
                setIsLoading((prev) => ({
                    ...prev,
                    rack_occupation_change: true,
                }));
                mounted = true;
            } else {
                loadingTimer = setTimeout(() => {
                    setIsLoading((prev) => ({
                        ...prev,
                        rack_occupation_change: true,
                    }));
                }, REFRESH_LOADING_THRESHOLD_MS);
            }
            try {
                let result = await requestAPI(
                    getOveriewRackChangeOccupationAPI(cancelToken)
                );
                let tableBody = createDataRackChangeOccupation(result.data);
                let prevTableBody = createPrevDataRackChangeOccupation(
                    result.data
                );
                setRackChangeOccupation([...tableBody]);
                setPrevRackChangeOccupation([...prevTableBody]);
                setIsLoading((prev) => ({
                    ...prev,
                    rack_occupation_change: false,
                }));
                clearTimeout(loadingTimer);
                if (interval) {
                    interval = setTimeout(
                        fetchRackChangeOccupation,
                        REFRESH_PARAMETER_MS
                    );
                }
            } catch (error) {
                if (!axios.isCancel(error)) {
                    toast.error(error.toString(), { toastId: "network-error" });
                }
                setIsLoading((prev) => ({
                    ...prev,
                    rack_occupation_change: false,
                }));
                clearTimeout(loadingTimer);
                if (interval) {
                    interval = setTimeout(
                        fetchRackChangeOccupation,
                        REFRESH_PARAMETER_MS
                    );
                }
            }
        };

        interval = setTimeout(fetchRackChangeOccupation, 10);
        return () => {
            clearTimeout(interval);
            interval = null;

            cancelToken.cancel();
            mounted = false;
        };
    }, []);

    // Get Item Registered Change
    useEffect(() => {
        let interval = null;
        let loadingTimer = null;
        let mounted = false;
        let cancelToken = axios.CancelToken.source();
        const fetchItemRegisteredChange = async () => {
            if (!mounted) {
                setIsLoading((prev) => ({
                    ...prev,
                    item_registered_change: true,
                }));
                mounted = true;
            } else {
                loadingTimer = setTimeout(() => {
                    setIsLoading((prev) => ({
                        ...prev,
                        item_registered_change: true,
                    }));
                }, REFRESH_LOADING_THRESHOLD_MS);
            }
            try {
                let result = await requestAPI(
                    getOverviewItemRegisteredChangeAPI(cancelToken)
                );
                let tableBody = createItemRegisteredChange(result.data);
                let prevTableBody = createPrevItemRegisteredChange(result.data);
                setItemRegisteredChange([...tableBody]);
                setPrevItemRegisteredChange([...prevTableBody]);

                setIsLoading((prev) => ({
                    ...prev,
                    item_registered_change: false,
                }));
                clearTimeout(loadingTimer);
                if (interval) {
                    interval = setTimeout(
                        fetchItemRegisteredChange,
                        REFRESH_PARAMETER_MS
                    );
                }
            } catch (error) {
                if (!axios.isCancel(error)) {
                    toast.error(error.toString(), { toastId: "network-error" });
                }
                setIsLoading((prev) => ({
                    ...prev,
                    item_registered_change: false,
                }));
                clearTimeout(loadingTimer);
                if (interval) {
                    interval = setTimeout(
                        fetchItemRegisteredChange,
                        REFRESH_PARAMETER_MS
                    );
                }
            }
        };
        interval = setTimeout(fetchItemRegisteredChange, 10);
        return () => {
            clearTimeout(interval);
            interval = null;
            cancelToken.cancel();
            mounted = false;
        };
    }, []);

    return (
        <div className='overview-container'>
            <Legend
                isShowing={isShowingLegend}
                hide={toggleShowingLegend}
                type={"change_overview"}
            />
            <div className='overview-request-status'>
                <LoadingData
                    isLoading={
                        isLoading.overview_status || isLoading.overview_category
                    }
                    backgroundOffset='20px'
                    useDarkBackground={true}
                />
                <div className='overview-request-status-title-container'>
                    <span>Change Request Status</span>
                    {/* <img src={iconRequestStatus} alt='Icon Request Status' /> */}
                </div>
                <div className='overview-request-status-title-dashboard-container'>
                    {Object.keys(requestStatus).map((key, index) => {
                        let data = requestStatusData.find(
                            (el) => el.status === requestStatus[key]
                        );

                        let numberOfItem =
                            data && data.categories.find((x) => x.item)
                                ? data.categories.find((x) => x.item).item
                                : 0;
                        let numberOfRack =
                            data && data.categories.find((x) => x.rack)
                                ? data.categories.find((x) => x.rack).rack
                                : 0;

                        return (
                            <div
                                className={
                                    index !==
                                    Object.keys(requestStatus).length - 1
                                        ? "overview-request-status-dashboard border-right"
                                        : "overview-request-status-dashboard"
                                }>
                                <RequestStatusSquare
                                    title={requestStatus[key]}
                                    number={
                                        requestStatusData.find(
                                            (el) =>
                                                el.status === requestStatus[key]
                                        )
                                            ? requestStatusData.find(
                                                  (el) =>
                                                      el.status ===
                                                      requestStatus[key]
                                              ).total
                                            : 0
                                    }
                                    color={
                                        requestStatus[key] === "Requested"
                                            ? "yellow"
                                            : "green"
                                    }
                                />
                                <div className='overview-request-status-dashbord-rack-item'>
                                    <RequestStatusSquare
                                        title='Rack'
                                        number={numberOfRack}
                                        color={"blue"}
                                    />
                                    <RequestStatusSquare
                                        title='Item'
                                        number={numberOfItem}
                                        color={"white"}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className='overview-request-status-fitler-date'>
                    <FilterDate
                        filterDate={filterDate}
                        setFilterDate={setFilterDate}
                    />
                </div>
                <div className='overview-request-status-chart'>
                    {/* <LoadingData
                        isLoading={isLoading.overview_category}
                        useDarkBackground={true}
                    /> */}
                    <div className='overview-request-status-chart-rack'>
                        <span>Rack Change Request by Category</span>
                        <div className='overview-request-status-chart-pie'>
                            <PieChart
                                widthChart='150px'
                                heightChart='200px'
                                categories={rackChangeCategory}
                                label={labelRackCategory}
                                id={"overview-rack-category"}
                            />
                        </div>
                    </div>
                    <div className='overview-request-status-chart-rack'>
                        <span>Item Change Request by Category</span>
                        <div className='overview-request-status-chart-pie'>
                            <PieChart
                                widthChart='150px'
                                heightChart='200px'
                                categories={itemChangeCategory}
                                label={labelItemCategory}
                                id={"overview-item-category"}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className='overview-rack-status'>
                <LoadingData
                    isLoading={
                        isLoading.rack_occupation ||
                        isLoading.rack_clients ||
                        isLoading.rack_occupation_change
                    }
                    backgroundOffset='20px'
                    useDarkBackground={true}
                />
                <span id='title'>Rack</span>
                <div className='overview-rack-donut-container'>
                    <div
                        className='overview-rack-donut'
                        style={{ width: "60%" }}>
                        <DonutChart
                            widthChart='180px'
                            heightChart='200px'
                            series={rackOccupation.series}
                            label={["Occupied", "Not Occupied"]}
                        />
                    </div>
                    <div className='overview-rack-donut-status'>
                        <div className='overview-rack-donut-status-percentage'>
                            <span>
                                {rackOccupation.occupied &&
                                    rackOccupation.total &&
                                    (
                                        (parseFloat(rackOccupation.occupied) /
                                            parseFloat(rackOccupation.total)) *
                                        100
                                    ).toFixed(1)}
                                %
                            </span>
                            <span>
                                {" "}
                                {rackOccupation.not_occupied &&
                                    rackOccupation.total &&
                                    (
                                        (parseFloat(
                                            rackOccupation.not_occupied
                                        ) /
                                            parseFloat(rackOccupation.total)) *
                                        100
                                    ).toFixed(1)}
                                %
                            </span>
                        </div>
                        <div className='overview-rack-donut-status-total'>
                            <span>Total</span>
                            <div>
                                <span>{rackOccupation.total || "---"}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='overview-rack-donut-container'>
                    {/* <LoadingData
                        isLoading={isLoading.rack_clients}
                        useDarkBackground={true}
                    /> */}
                    <div className='overview-rack-pie'>
                        <PieChart
                            widthChart='180px'
                            heightChart='200px'
                            categories={rackClients.pie}
                            label={rackClients.pie_label}
                            id='rack-clients'
                        />
                    </div>
                    <div className='overview-rack-bar-container'>
                        <span>Top 5 Client by Number of Racks </span>
                        <BarChart
                            series={[
                                {
                                    data:
                                        rackClients.bar.length > 0
                                            ? rackClients.bar
                                            : [],
                                },
                            ]}
                            label={rackClients.bar_label}
                        />
                    </div>
                </div>

                <div className='overview-rack-table-container'>
                    {/* <LoadingData
                        isLoading={isLoading.rack_occupation_change}
                        useDarkBackground={true}
                        size={150}
                    /> */}
                    <OverviewTable
                        header={DummyRackTable.header}
                        body={rackChangeOccupation}
                    />
                    <OverviewTable
                        header={PrevRackTable.header}
                        body={prevRackChangeOccupation}
                        type='previous'
                    />
                </div>
            </div>

            <div className='overview-item-status'>
                <LoadingData
                    isLoading={
                        isLoading.item_status_category ||
                        isLoading.item_clients ||
                        isLoading.item_registered_change
                    }
                    useDarkBackground={true}
                    backgroundOffset='20px'
                />
                <span id='title'>Item</span>
                <div className='overview-item-donut-container'>
                    <div className='overview-item-donut'>
                        <PieChart
                            widthChart='180px'
                            heightChart='200px'
                            categories={itemStatusCategory.status.series}
                            label={itemStatusCategory.status.label}
                            id={"item-status"}
                        />
                    </div>
                    <div className='overview-item-donut'>
                        <PieChart
                            widthChart='180px'
                            heightChart='200px'
                            categories={itemStatusCategory.category.series}
                            label={itemStatusCategory.category.label}
                            id={"item-category"}
                        />
                    </div>
                </div>
                <div className='overview-item-donut-container'>
                    {/* <LoadingData
                        isLoading={isLoading.item_clients}
                        useDarkBackground={true}
                    /> */}
                    <div className='overview-item-pie'>
                        <PieChart
                            widthChart='180px'
                            heightChart='200px'
                            categories={itemClients.pie}
                            label={itemClients.pie_label}
                            id='item-client'
                        />
                    </div>
                    <div className='overview-item-bar-container'>
                        <span>Top 5 Client by Number of Items </span>
                        <BarChart
                            series={[
                                {
                                    data:
                                        itemClients.bar.length > 0
                                            ? itemClients.bar
                                            : [],
                                },
                            ]}
                            label={itemClients.bar_label}
                        />
                    </div>
                </div>

                <div className='overview-item-table-container'>
                    {/* <LoadingData
                        isLoading={isLoading.item_registered_change}
                        useDarkBackground={true}
                        size={150}
                    /> */}
                    <OverviewTable
                        header={DummyItemTable.header}
                        body={itemRegisteredChange}
                    />
                    <OverviewTable
                        header={PrevItemTable.header}
                        body={prevItemRegisteredChange}
                        type='previous-item'
                    />
                </div>
            </div>
            <div style={{ zIndex: "100" }}>
                <ButtonDetail onClick={toggleShowingLegend} />
            </div>
        </div>
    );
};

export default Overview;
