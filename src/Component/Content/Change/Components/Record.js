import React, { useState, useEffect, useCallback } from "react";
import {
    SearchBar,
    InputDropdownHorizontal,
    InputTextAutoSuggestHorizontal,
    TableDCIM,
    Paging,
    exportCSVFile,
    Tooltip,
    ExportButton,
} from "../../../ComponentReuseable";
import { recordFilter, recordMenu } from "./Record/RecordEnum";
import RackInformation from "./Record/RackInformation";
import ItemInformation from "./Record/ItemInformation";
import RackItem from "./Record/RackItem";
import { requestAPI } from "./Utils/changeUtils";
import {
    getFloorsAPI,
    getClientsAPI,
    getRackNumbersByFloorClient,
    getItemNumbersByRack,
    getRecordChangesAPI,
    getRackListsAPI,
    getItemListsAPI,
    getRackItemsAPI,
    getExportLogRecordAPI,
    getRoomsByFloorAPI,
    getRecordItemNumbersAPI,
} from "./ChangeAPI";
import exportIcon from "../../../../svg/write-icon-no-padding.svg";
import loadingGif from "../../../../gif/loading_button.gif";

import { toast } from "react-toastify";
import { LoadingData } from "../../../ComponentReuseable";
import { Rack } from "../../../ComponentReuseable";
import { timestampWithoutDayParse } from "../../../ComponentReuseable/Functions";
import { getLimitTableDCIM } from "../../../ComponentReuseable";
import { InvalidInput } from "./InvalidInput";

export const formatDate = (timestamp) => {
    if (timestamp) {
        let timeZoneOffset = new Date().getTimezoneOffset() * -1 * 60 * 1000;
        let newTimestamp = new Date(
            new Date(timestamp).getTime() + timeZoneOffset
        );
        return newTimestamp.toLocaleString();
    } else {
        return "---";
    }
};

export const formatFilterLabel = (label) => {
    // return <span style={{ fontWeight: "600" }}>{label}</span>;
    return label;
};
const Record = () => {
    let pageLimit = 14;
    const [filter, setFilter] = useState({
        search: "",
        floor: "",
        room: "",
        client: "",
        client_id: "",
        rack_no: "",
        rack_id: "",
        item_id: "",
        item_no: "",
        status: "",
    });
    const [menu, setMenu] = useState(recordMenu.LOG);
    const [inputOptions, setInputOptions] = useState({
        floor: [],
        room: [],
        client: [],
        rack_no: [],
        item_no: [],

        status: [
            {
                id: "Done",
                name: "Completed",
            },
            {
                id: "Rejected",
                name: "Rejected",
            },
        ],
    });
    const [selectedRow, setSelectedRow] = useState(null);
    const [pagination, setPagination] = useState({
        currPage: 1,
        totalPage: Math.ceil(15 / pageLimit),
    });
    const [isLoading, setIsLoading] = useState(false);
    // const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isLoadingExport, setIsLoadingExport] = useState(false);
    const [isLoadingFilter, setIsLoadingFilter] = useState({
        floor: "",
        room: "",
        client: "",
        rack_no: "",
        item_no: "",
    });
    const [prevSearch, setPrevSearch] = useState("");

    const [recordList, setRecordList] = useState([]);
    const [rackItems, setRackItems] = useState([]);
    const handleChange = (e) => {
        let { name, value } = e.target;

        setFilter((prev) => {
            prev[name] = value;
            return { ...prev };
        });
    };
    const handleChangeSearch = (value) => {
        setFilter((prev) => {
            return { ...prev, search: value };
        });
    };
    const logTableHeader = {
        request_timestamp: "Request Timestamp",
        approval_timestamp: "Approval Timestamp",
        change_timestamp: "Change Timestamp",
        status: "Status",
        request: "Request",
        client_name: "Client",
        rack_no: "Rack #",
        change: "Change",
        item_no: "Item #",
        change_to: "Change To",
    };
    const rackTableHeader = {
        rack_no: "Rack #",
        floor_name: "Floor #",
        room_name: "Room",
        area_name: "Area",
        brand_name: "Brand",
        model_no: "Model #",
        client_name: "Client",
    };
    const itemTableHeader = {
        rack_no: "Rack #",
        floor_name: "Floor #",
        room_name: "Room",
        area_name: "Area",
        client_name: "Client",
        number_of_item: "Total Number of Item",
    };
    // const logTableBody = new Array(15).fill({}).map((item, index) => {
    //     return {
    //         request_timestamp: "19 Jun 2021 06:11",
    //         approval_timestamp: "19 Jun 2021 06:11",
    //         change_timestamp: "19 Jun 2021 06:11",
    //         request: "Rack",
    //         rack_no: "RK45-002",
    //         change: "Install",
    //         item_no: "SV2-001",
    //         change_to: "U#02-U#04",
    //     };
    // });

    // Get Floors
    useEffect(async () => {
        setIsLoadingFilter((prev) => ({ ...prev, floor: true }));
        try {
            let result = await requestAPI(getFloorsAPI);

            setInputOptions((prev) => ({
                ...prev,
                floor: result.data.map((value) => ({
                    id: value.floor_id,
                    name: value.floor_name,
                })),
            }));
            setFilter((prev) => ({
                ...prev,
                rack_no: "",
                item_no: "",
            }));
            setIsLoadingFilter((prev) => ({ ...prev, floor: false }));
        } catch (error) {
            toast.error(error.toString(), { toastId: "network-error" });
            setIsLoadingFilter((prev) => ({ ...prev, floor: false }));
        }
    }, []);
    // Get Rooms
    useEffect(async () => {
        setFilter((prev) => ({ ...prev, room: "" }));
        if (filter.floor) {
            setIsLoadingFilter((prev) => ({ ...prev, room: true }));
            try {
                let result = await requestAPI(getRoomsByFloorAPI(filter.floor));
                setInputOptions((prev) => ({
                    ...prev,
                    room: result.data.map((value) => ({
                        id: value.room_id,
                        name: value.room_name,
                    })),
                }));
                setIsLoadingFilter((prev) => ({ ...prev, room: false }));
            } catch (error) {
                toast.error(error.toString(), { toastId: "network-error" });
                setIsLoadingFilter((prev) => ({ ...prev, room: false }));
            }
        } else {
            setInputOptions((prev) => ({
                ...prev,
                room: [],
            }));
        }
    }, [filter.floor]);

    // Get Clients
    useEffect(async () => {
        setIsLoadingFilter((prev) => ({ ...prev, client: true }));
        try {
            let result = await requestAPI(getClientsAPI());
            setInputOptions((prev) => ({
                ...prev,
                client: result.data.map((value) => ({
                    id: value.client_id,
                    name: value.client_name || "---",
                })),
            }));
            setIsLoadingFilter((prev) => ({ ...prev, client: false }));
        } catch (error) {
            toast.error(error.toString(), { toastId: "network-error" });
            setIsLoadingFilter((prev) => ({ ...prev, client: false }));
        }
    }, []);
    // Get Rack No
    useEffect(async () => {
        setFilter((prev) => ({ ...prev }));
        // if (filter.floor || filter.client) {
        setIsLoadingFilter((prev) => ({ ...prev, rack_no: true }));
        try {
            let find_floor_name = inputOptions.floor.find(
                (floor) => floor.id.toString() === filter.floor.toString()
            );
            let find_room_name = inputOptions.room.find(
                (room) => room.id.toString() === filter.room.toString()
            );
            let floor_name = find_floor_name ? find_floor_name.name : "";
            let room_name = find_room_name ? find_room_name.name : "";
            let result = await requestAPI(
                getRackNumbersByFloorClient(
                    floor_name,
                    filter.client,
                    room_name
                )
            );

            setInputOptions((prev) => ({
                ...prev,
                rack_no: result.data.map((value) => ({
                    id: value.rack_id,
                    name: value.rack_number,
                })),
            }));
            setIsLoadingFilter((prev) => ({ ...prev, rack_no: false }));
        } catch (error) {
            toast.error(error.toString(), { toastId: "network-error" });
            setIsLoadingFilter((prev) => ({ ...prev, rack_no: false }));
        }
        // } else {
        //     setFilter((prev) => ({ ...prev, rack_no: "" }));
        // }
    }, [filter.floor, filter.room, filter.client_id]);
    // Get Item No
    useEffect(async () => {
        setIsLoadingFilter((prev) => ({ ...prev, item_no: true }));
        try {
            let find_floor_name = inputOptions.floor.find(
                (floor) => floor.id.toString() === filter.floor.toString()
            );
            let find_room_name = inputOptions.room.find(
                (room) => room.id.toString() === filter.room.toString()
            );
            let floor_name = find_floor_name ? find_floor_name.name : "";
            let room_name = find_room_name ? find_room_name.name : "";
            let result = await requestAPI(
                getRecordItemNumbersAPI(
                    filter.rack_no,
                    floor_name,
                    room_name,
                    filter.client
                )
            );

            setInputOptions((prev) => ({
                ...prev,
                item_no: result.data.map((value) => ({
                    id: value.item_number,
                    name: value.item_number,
                })),
            }));
            setIsLoadingFilter((prev) => ({ ...prev, item_no: false }));
        } catch (error) {
            toast.error(error.toString(), { toastId: "network-error" });
            setIsLoadingFilter((prev) => ({ ...prev, item_no: false }));
        }
    }, [filter.floor, filter.room, filter.client_id, filter.rack_no]);

    // Get Record Log
    const getLogRecord = useCallback(
        async (
            pageLimit,
            offset,
            floor_id,
            rack_id,
            client_id,
            menu,
            inputOptions,
            search,
            status,
            item_number,
            room_id
        ) => {
            search = search || "";
            status = status || "";
            item_number = item_number || "";

            setIsLoading(true);
            try {
                let find_floor_name = inputOptions.floor.find(
                    (floor) => floor.id.toString() === floor_id.toString()
                );
                let floor_name = find_floor_name ? find_floor_name.name : "";
                let find_room_name = inputOptions.room.find(
                    (room) => room.id.toString() === room_id.toString()
                );
                let room_name = find_room_name ? find_room_name.name : "";

                let result = await requestAPI(
                    getRecordChangesAPI(
                        pageLimit,
                        offset,
                        floor_name,
                        rack_id,
                        client_id,
                        menu === recordMenu.LOG.toLowerCase() ? "" : menu,
                        search,
                        status,
                        item_number,
                        room_name
                    )
                );
                if (result.data.length > 0) {
                    result.data.map((el) => {
                        let parsedParameter = JSON.parse(el.parameter);
                        el.change_to = parsedParameter.find(
                            (val) => val["Change To"]
                        )
                            ? parsedParameter.find((val) => val["Change To"])[
                                  "Change To"
                              ]
                            : "";
                        el.item_number = parsedParameter.find(
                            (val) => val["Item Number"]
                        )
                            ? parsedParameter.find((val) => val["Item Number"])[
                                  "Item Number"
                              ]
                            : "";
                        el.item_name = parsedParameter.find(
                            (val) => val["Item Name"]
                        )
                            ? parsedParameter.find((val) => val["Item Name"])[
                                  "Item Name"
                              ]
                            : "";
                    });

                    setRecordList((prev) => [...result.data]);
                    setPagination((prev) => ({
                        ...prev,
                        totalPage: Math.ceil(
                            result.data[0].total_data / pageLimit
                        ),
                    }));
                } else {
                    setRecordList((prev) => [...[]]);
                    setPagination((prev) => ({
                        ...prev,
                        totalPage: Math.ceil(1 / pageLimit),
                    }));
                }
                setIsLoading(false);
            } catch (error) {
                toast.error(error.toString(), { toastId: "network-error" });
                setIsLoading(false);
                setPagination((prev) => ({
                    ...prev,
                    totalPage: Math.ceil(1 / pageLimit),
                }));
            }
        },
        []
    );

    const getRackList = useCallback(
        async (
            pageLimit,
            offset,
            floor_id,
            rack_id,
            client_id,
            inputOptions,
            search,
            room_id
        ) => {
            search = search || "";
            setIsLoading(true);
            try {
                let find_floor_name = inputOptions.floor.find(
                    (floor) => floor.id.toString() === floor_id.toString()
                );
                let floor_name = find_floor_name ? find_floor_name.name : "";

                let find_rack_number = inputOptions.rack_no.find(
                    (rack) => rack.id.toString() === rack_id.toString()
                );
                let rack_number = find_rack_number ? find_rack_number.name : "";

                let find_client_name = inputOptions.client.find(
                    (client) => client.id.toString() === client_id.toString()
                );
                let client_name = find_client_name ? find_client_name.name : "";
                let find_room_name = inputOptions.room.find(
                    (room) => room.id.toString() === room_id.toString()
                );
                let room_name = find_room_name ? find_room_name.name : "";

                let result = await requestAPI(
                    getRackListsAPI(
                        pageLimit,
                        offset,
                        floor_name,
                        rack_number,
                        client_name,
                        search,
                        room_name
                    )
                );

                if (result.data.length > 0) {
                    setRecordList((prev) => [...result.data]);
                    setSelectedRow(result.data[0]);
                    setPagination((prev) => ({
                        ...prev,
                        totalPage: Math.ceil(
                            result.data[0].total_data / pageLimit
                        ),
                    }));
                } else {
                    setRecordList((prev) => [...[]]);
                    setPagination((prev) => ({
                        ...prev,
                        totalPage: Math.ceil(1 / pageLimit),
                    }));
                }
                setIsLoading(false);
            } catch (error) {
                toast.error(error.toString(), { toastId: "network-error" });
                setIsLoading(false);
                setPagination((prev) => ({
                    ...prev,
                    totalPage: Math.ceil(1 / pageLimit),
                }));
            }
        },
        []
    );

    // getItemList
    const getItemList = useCallback(
        async (
            pageLimit,
            offset,
            floor_id,
            rack_id,
            client_id,
            inputOptions,
            search,
            item_number,
            room_id
        ) => {
            search = search || "";
            item_number = item_number || "";
            setIsLoading(true);
            try {
                let find_floor_name = inputOptions.floor.find(
                    (floor) => floor.id.toString() === floor_id.toString()
                );
                let floor_name = find_floor_name ? find_floor_name.name : "";

                let find_rack_number = inputOptions.rack_no.find(
                    (rack) => rack.id.toString() === rack_id.toString()
                );
                let rack_number = find_rack_number ? find_rack_number.name : "";

                let find_client_name = inputOptions.client.find(
                    (client) => client.id.toString() === client_id.toString()
                );
                let client_name = find_client_name ? find_client_name.name : "";

                let find_room_name = inputOptions.room.find(
                    (room) => room.id.toString() === room_id.toString()
                );
                let room_name = find_room_name ? find_room_name.name : "";

                let result = await requestAPI(
                    getItemListsAPI(
                        pageLimit,
                        offset,
                        floor_name,
                        rack_number,
                        client_name,
                        search,
                        item_number,
                        room_name
                    )
                );

                if (result.data && result.data.length > 0) {
                    setRecordList((prev) => [...result.data]);
                    setSelectedRow(result.data[0]);
                    setPagination((prev) => ({
                        ...prev,
                        totalPage: Math.ceil(
                            result.data[0].total_data / pageLimit
                        ),
                    }));
                } else {
                    setRecordList((prev) => [...[]]);
                    setPagination((prev) => ({
                        ...prev,
                        totalPage: Math.ceil(1 / pageLimit),
                    }));
                }
                setIsLoading(false);
            } catch (error) {
                toast.error(error.toString(), { toastId: "network-error" });
                setIsLoading(false);
                setPagination((prev) => ({
                    ...prev,
                    totalPage: Math.ceil(1 / pageLimit),
                }));
            }
        },
        []
    );

    // Get Log Record
    useEffect(async () => {
        setPagination((prev) => ({ ...prev, currPage: 1, lastPage: 1 }));
        if (menu === recordMenu.LOG) {
            setRecordList((prev) => [...[]]);
            getLogRecord(
                (pageLimit = getLimitTableDCIM() - 1),
                0,
                filter.floor,
                filter.rack_id,
                filter.client,
                menu.toLowerCase(),
                inputOptions,
                filter.search,
                filter.status,
                filter.item_no,
                filter.room
            );
        } else if (menu === recordMenu.RACK) {
            setRecordList((prev) => [...[]]);
            setSelectedRow({});
            getRackList(
                (pageLimit = getLimitTableDCIM()),
                0,
                filter.floor,
                filter.rack_id,
                filter.client_id,
                inputOptions,
                filter.search,
                filter.room
            );
        } else if (menu === recordMenu.ITEM) {
            setRecordList((prev) => [...[]]);
            setSelectedRow({});
            getItemList(
                (pageLimit = getLimitTableDCIM()),
                0,
                filter.floor,
                filter.rack_id,
                filter.client_id,
                inputOptions,
                filter.search,
                filter.item_no,
                filter.room
            );
        } else {
            setSelectedRow({});
            setRecordList((prev) => [...[]]);
        }
    }, [
        filter.floor,
        filter.rack_id,
        filter.status,
        filter.client_id,
        filter.item_id,
        filter.room,
    ]);

    useEffect(async () => {
        setPagination((prev) => ({ ...prev, currPage: 1, lastPage: 1 }));

        if (menu === recordMenu.LOG) {
            setRecordList((prev) => [...[]]);
            getLogRecord(
                (pageLimit = getLimitTableDCIM() - 1),
                0,
                filter.floor,
                filter.rack_id,
                filter.client,
                menu.toLowerCase(),
                inputOptions,
                filter.search,
                filter.status,
                filter.item_no,
                filter.room
            );
        } else if (menu === recordMenu.RACK) {
            setRecordList((prev) => [...[]]);
            setSelectedRow({});
            getRackList(
                (pageLimit = getLimitTableDCIM()),
                0,
                filter.floor,
                filter.rack_id,
                filter.client,
                inputOptions,
                filter.search,
                filter.room
            );
        } else if (menu === recordMenu.ITEM) {
            setRecordList((prev) => [...[]]);
            setSelectedRow({});
            getItemList(
                (pageLimit = getLimitTableDCIM()),
                0,
                filter.floor,
                filter.rack_id,
                filter.client,
                inputOptions,
                filter.search,
                filter.item_no,
                filter.room
            );
        } else {
            setSelectedRow({});
            setRecordList((prev) => [...[]]);
        }
    }, [menu]);

    useEffect(async () => {
        if (menu === recordMenu.LOG) {
            setRecordList((prev) => [...[]]);
            getLogRecord(
                (pageLimit = getLimitTableDCIM() - 1),
                (pagination.currPage - 1) * pageLimit,
                filter.floor,
                filter.rack_id,
                filter.client,
                menu.toLowerCase(),
                inputOptions,
                filter.search,
                filter.status,
                filter.item_no,
                filter.room
            );
        } else if (menu === recordMenu.RACK) {
            setRecordList((prev) => [...[]]);
            setSelectedRow({});
            getRackList(
                (pageLimit = getLimitTableDCIM()),
                (pagination.currPage - 1) * pageLimit,
                filter.floor,
                filter.rack_id,
                filter.client,
                inputOptions,
                filter.search,
                filter.room
            );
        } else if (menu === recordMenu.ITEM) {
            setRecordList((prev) => [...[]]);
            setSelectedRow({});
            getItemList(
                (pageLimit = getLimitTableDCIM()),
                (pagination.currPage - 1) * pageLimit,
                filter.floor,
                filter.rack_id,
                filter.client,
                inputOptions,
                filter.search,
                filter.item_no,
                filter.room
            );
        } else {
            setSelectedRow({});
            setRecordList((prev) => [...[]]);
        }
    }, [pagination.currPage]);

    // get Rack Items
    useEffect(async () => {
        if (menu === recordMenu.ITEM && selectedRow && selectedRow.rack_id) {
            try {
                const result = await requestAPI(
                    getRackItemsAPI(selectedRow.rack_id)
                );

                if (result.data) {
                    let { data: queryData } = result;

                    setRackItems(
                        queryData.map((row) => {
                            return {
                                id: row.item_id,
                                itemNumber: row.item_number,
                                isFull: row.is_full ? true : false,
                                isLeft: row.is_left ? true : false,
                                uStart: row.u_start,
                                uNeeded: row.u_needed,
                            };
                        })
                    );
                } else {
                    // toast.error("Error getting rackItems data");
                    setRackItems([...[]]);
                }
            } catch (e) {
                toast.error("Error calling API to get rackItems data");
                setRackItems([...[]]);
            }
        }
    }, [selectedRow]);

    const handleSearch = () => {
        if (prevSearch !== filter.search) {
            setPrevSearch(filter.search);
            setPagination((prev) => ({ ...prev, currPage: 1, lastPage: 1 }));
            if (menu === recordMenu.LOG) {
                setRecordList((prev) => [...[]]);
                getLogRecord(
                    (pageLimit = getLimitTableDCIM() - 1),
                    0,
                    filter.floor,
                    filter.rack_no,
                    filter.client,
                    menu.toLowerCase(),
                    inputOptions,
                    filter.search
                );
            } else if (menu === recordMenu.RACK) {
                setRecordList((prev) => [...[]]);
                setSelectedRow({});
                getRackList(
                    (pageLimit = getLimitTableDCIM()),
                    0,
                    filter.floor,
                    filter.rack_no,
                    filter.client,
                    inputOptions,
                    filter.search
                );
            } else if (menu === recordMenu.ITEM) {
                setRecordList((prev) => [...[]]);
                setSelectedRow({});
                getItemList(
                    (pageLimit = getLimitTableDCIM()),
                    0,
                    filter.floor,
                    filter.rack_no,
                    filter.client,
                    inputOptions,
                    filter.search
                );
            } else {
                setSelectedRow({});
                setRecordList((prev) => [...[]]);
            }
        }
    };

    const getExportRecordLog = async () => {
        try {
            setIsLoadingExport(true);
            let find_floor_name = inputOptions.floor.find(
                (floor) => floor.id.toString() === filter.floor.toString()
            );
            let floor_name = find_floor_name ? find_floor_name.name : "";
            let find_room_name = inputOptions.room.find(
                (room) => room.id.toString() === filter.room.toString()
            );
            let room_name = find_room_name ? find_room_name.name : "";

            let result = await requestAPI(
                getExportLogRecordAPI(
                    floor_name,
                    filter.client,
                    filter.rack_id,
                    "",
                    filter.status,
                    room_name,
                    filter.item_no
                )
            );
            if (result.data.length > 0) {
                result.data.map((el) => {
                    let parsedParameter = JSON.parse(el.parameter);
                    el.change_to = parsedParameter.find(
                        (val) => val["Change To"]
                    )
                        ? parsedParameter.find((val) => val["Change To"])[
                              "Change To"
                          ]
                        : "";
                    el.item_number = parsedParameter.find(
                        (val) => val["Item Number"]
                    )
                        ? parsedParameter.find((val) => val["Item Number"])[
                              "Item Number"
                          ]
                        : "";
                    el.item_name = parsedParameter.find(
                        (val) => val["Item Name"]
                    )
                        ? parsedParameter.find((val) => val["Item Name"])[
                              "Item Name"
                          ]
                        : "";
                });
                let category = [];
                if (filter.floor) {
                    // category += "FLOOR";
                    category.push("FLOOR");
                }
                if (filter.room) {
                    // category += "_CLIENT";
                    category.push("ROOM");
                }
                if (filter.client) {
                    // category += "_CLIENT";
                    category.push("CLIENT");
                }
                if (filter.rack_no) {
                    // category += "_RACK_NO";
                    category.push("RACK_NO");
                }
                if (filter.item_no) {
                    // category += "_RACK_NO";
                    category.push("ITEM_NO");
                }
                if (filter.status) {
                    // category += "_STATUS";
                    category.push("STATUS");
                }
                category =
                    category.length > 0 ? category.join("_") : "ALLCATEGORY";

                const fileName = `Change_Record_[${new Date()
                    .toLocaleString("sv-SE")
                    .replace(" ", ",")}]_[${category}]`;

                const headers = {
                    request_timestamp: "Request Timestamp",
                    approval_timestamp: "Approval Timestamp",
                    change_timestamp: "Change Timestamp",
                    status: "Status",
                    request: "Request",
                    client_name: "Client",
                    rack_number: "Rack #",
                    change: "Change",
                    item_number: "Item Number",
                    change_to: "Change To",
                };
                let exportData = result.data.map((val) => ({
                    request_timestamp: val.request_timestamp,
                    approval_timestamp: val.approval_timestamp,
                    change_timestamp: val.change_timestamp,
                    status: val.status === "Done" ? "Completed" : val.status,
                    request: val.type,
                    client_name: val.client_name,
                    rack_number: val.rack_number,
                    change: val.change_type,
                    item_number: val.item_number || "---",
                    change_to: val.change_to,
                }));
                let dataToBeExported = [
                    {
                        sheetName: "sheet1",
                        header: Object.keys(headers),
                        body: exportData,
                    },
                ];

                exportCSVFile(dataToBeExported, fileName);
            } else {
                toast.info("Data is empty");
            }
            setIsLoadingExport(false);
        } catch (error) {
            toast.error("Failed to export log record", {
                toastId: "export-log",
            });
            setIsLoadingExport(false);
        }
    };

    const validateInput = (e) => {
        if (e.target.name === "client") {
            let findClient = inputOptions.client.find(
                (el) => el.name === e.target.value
            );

            if (findClient) {
                if (findClient.id === filter.client_id) {
                    setFilter((prev) => ({
                        ...prev,
                        client_id: findClient.id,
                    }));
                } else {
                    setFilter((prev) => ({
                        ...prev,
                        client_id: findClient.id,
                        rack_id: "",
                        rack_no: "",
                        item_id: "",
                        item_no: "",
                    }));
                }
            } else {
                setFilter((prev) => ({
                    ...prev,
                    client: "",
                    client_id: "",
                    rack_id: "",
                    rack_no: "",
                }));
                if (e.target.value !== "") {
                    toast.error(InvalidInput.client);
                }
            }
        } else if (e.target.name === recordFilter.RACK_NO) {
            let find = inputOptions.rack_no.find(
                (el) => el.name === e.target.value
            );
            if (find) {
                if (find.id === filter.rack_id) {
                    setFilter((prev) => ({
                        ...prev,
                        rack_id: find.id,
                    }));
                } else {
                    setFilter((prev) => ({
                        ...prev,
                        rack_id: find.id,
                        item_id: "",
                        item_no: "",
                    }));
                }
            } else {
                setFilter((prev) => ({
                    ...prev,
                    rack_no: "",
                    rack_id: "",
                    // item_id: "",
                    // item_no: "",
                }));
                if (e.target.value !== "") {
                    toast.error(InvalidInput.rack_no);
                }
            }
        } else if (e.target.name === recordFilter.ITEM_NO) {
            let find = inputOptions.item_no.find(
                (el) => el.name === e.target.value
            );
            if (find) {
                setFilter((prev) => ({ ...prev, item_id: find.id }));
            } else {
                setFilter((prev) => ({ ...prev, item_no: "", item_id: "" }));
                if (e.target.value !== "") {
                    toast.error(InvalidInput.item_no);
                }
            }
        }
    };

    return (
        <div className='change-record-container'>
            <div className='change-record-table'>
                <div className='change-record-header'>
                    <div className='change-record-menu'>
                        {Object.keys(recordMenu).map((key) => (
                            <span
                                className='menu'
                                onClick={() => setMenu(recordMenu[key])}
                                id={menu === recordMenu[key] && "active"}>
                                {recordMenu[key]}
                            </span>
                        ))}
                    </div>
                    <SearchBar
                        name={recordFilter.SEARCH}
                        value={filter.search}
                        search={handleChangeSearch}
                        searchContent={() => handleSearch()}
                    />
                </div>
                <div className='change-record-filter'>
                    <div className='change-record-filter-input'>
                        <InputDropdownHorizontal
                            name={recordFilter.FLOOR}
                            label={formatFilterLabel("Floor")}
                            value={filter.floor}
                            options={inputOptions.floor}
                            onChange={handleChange}
                            // isRequired={true}
                            inputWidth='110px'
                            isLoading={isLoadingFilter.floor}
                        />

                        <InputDropdownHorizontal
                            name={recordFilter.ROOM}
                            label={"Room"}
                            value={filter.room}
                            options={inputOptions.room}
                            onChange={handleChange}
                            isDisabled={!filter.floor}
                            inputWidth='110px'
                            isLoading={isLoadingFilter.room}
                        />

                        <InputTextAutoSuggestHorizontal
                            name={recordFilter.CLIENT}
                            label={formatFilterLabel("Client")}
                            value={filter.client}
                            options={inputOptions.client.map((el) => el.name)}
                            onChange={handleChange}
                            onClear={() =>
                                setFilter((prev) => ({
                                    ...prev,
                                    client: "",
                                    client_id: "",
                                }))
                            }
                            // isRequired={true}
                            validateInput={(e) => validateInput(e)}
                            isLoading={isLoadingFilter.client}
                        />
                        {/* <InputDropdownHorizontal
                            name={recordFilter.RACK_NO}
                            label='Rack No.:'
                            value={filter.rack_no}
                            options={inputOptions.rack_no}
                            onChange={handleChange}
                            isRequired={true}
                            inputWidth='110px'
                            isDisabled={!filter.floor && !filter.client}
                        /> */}
                        <InputTextAutoSuggestHorizontal
                            name={recordFilter.RACK_NO}
                            label={formatFilterLabel("Rack No.")}
                            value={filter.rack_no}
                            options={inputOptions.rack_no.map((el) => el.name)}
                            onChange={handleChange}
                            onClear={() =>
                                setFilter((prev) => ({
                                    ...prev,
                                    rack_no: "",
                                    rack_id: "",
                                }))
                            }
                            // isRequired={true}
                            validateInput={(e) => validateInput(e)}
                            isLoading={isLoadingFilter.rack_no}
                            // isDisabled={!filter.floor && !filter.client}
                        />
                        {!(menu === recordMenu.RACK) && (
                            // <InputDropdownHorizontal
                            //     name={recordFilter.ITEM_NO}
                            //     label='Item No.:'
                            //     value={filter.item_no}
                            //     options={inputOptions.item_no}
                            //     onChange={handleChange}
                            //     isRequired={true}
                            //     inputWidth='110px'
                            //     isDisabled={!filter.rack_no}
                            // />
                            <InputTextAutoSuggestHorizontal
                                name={recordFilter.ITEM_NO}
                                label={formatFilterLabel("Item No.")}
                                // inputWidth='150px'
                                value={filter.item_no}
                                options={inputOptions.item_no.map(
                                    (el) => el.name
                                )}
                                onClear={() =>
                                    setFilter((prev) => ({
                                        ...prev,
                                        item_no: "",
                                        item_id: "",
                                    }))
                                }
                                isLoading={isLoadingFilter.item_no}
                                onChange={handleChange}
                                // isRequired={true}
                                validateInput={(e) => validateInput(e)}
                                // isDisabled={!filter.rack_id}
                            />
                        )}
                        {menu === recordMenu.LOG && (
                            <InputDropdownHorizontal
                                name={recordFilter.STATUS}
                                label={formatFilterLabel("Status ")}
                                value={filter.status}
                                options={inputOptions.status}
                                onChange={handleChange}
                                // isRequired={true}
                                inputWidth='110px'
                            />
                        )}
                    </div>
                    {menu === recordMenu.LOG && (
                        // <Tooltip
                        //     tooltip={
                        //         <span className='icon-tooltip'>
                        //             {"Export Log Record"}
                        //         </span>
                        //     }>
                        <div className='incident-export-icon'>
                            <ExportButton
                                isLoading={isLoadingExport}
                                onClick={getExportRecordLog}
                            />
                        </div>
                        // </Tooltip>
                    )}
                </div>
                <div className='change-record-content'>
                    <LoadingData isLoading={isLoading} />
                    <div className='change-record-content-table'>
                        <TableDCIM
                            header={
                                menu === recordMenu.LOG
                                    ? logTableHeader
                                    : menu === recordMenu.RACK
                                    ? rackTableHeader
                                    : itemTableHeader
                            }
                            body={
                                recordList.length > 0 &&
                                (menu === recordMenu.LOG
                                    ? recordList.map((el) => ({
                                          request_timestamp:
                                              el.request_timestamp
                                                  ? timestampWithoutDayParse(
                                                        el.request_timestamp
                                                    )
                                                  : "---",
                                          approval_timestamp:
                                              el.approval_timestamp
                                                  ? timestampWithoutDayParse(
                                                        el.approval_timestamp
                                                    )
                                                  : "---",
                                          change_timestamp: el.change_timestamp
                                              ? timestampWithoutDayParse(
                                                    el.change_timestamp
                                                )
                                              : "---",
                                          status:
                                              el.status === "Done" ? (
                                                  <span id='completed'>
                                                      Completed
                                                  </span>
                                              ) : el.status === "Rejected" ? (
                                                  <span id='rejected'>
                                                      Rejected
                                                  </span>
                                              ) : (
                                                  "---"
                                              ),
                                          request: el.type
                                              ? el.type
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                el.type.slice(1)
                                              : "---",
                                          client_name: el.client_name || "---",
                                          rack_no: el.rack_number,
                                          change: el.change_type,
                                          item_no: el.item_number || "---",
                                          change_to: el.change_to,
                                      }))
                                    : menu === recordMenu.RACK
                                    ? recordList.map((el) => ({
                                          rack_no: el.rack_number,
                                          floor_name: el.floor_name,
                                          room_name: el.room_name,
                                          area_name: el.area_name,
                                          brand_name: el.brand_name || "---",
                                          model_no: el.model_name || "---",
                                          client_name: el.client_name || "---",
                                      }))
                                    : recordList.map((el) => ({
                                          rack_no: el.rack_number,
                                          floor_name: el.floor_name,
                                          room_name: el.room_name,
                                          area_name: el.area_name,
                                          client_name: el.client_name || "---",
                                          number_of_item: el.number_of_item,
                                      })))
                            }
                            actions={[]}
                            selectable={menu === recordMenu.LOG ? false : true}
                            onSelect={(e, index) => {
                                setSelectedRow(recordList[index]);
                            }}
                            customCellClassNames={{}}
                        />
                    </div>
                    <div className='change-record-content-paging'>
                        <Paging
                            firstPage={() => {
                                setPagination({
                                    currPage: 1,
                                    totalPage: pagination.totalPage,
                                });
                            }}
                            lastPage={() => {
                                setPagination({
                                    currPage: pagination.totalPage,
                                    totalPage: pagination.totalPage,
                                });
                            }}
                            nextPage={() => {
                                pagination.currPage !== pagination.totalPage &&
                                    setPagination({
                                        currPage: pagination.currPage + 1,
                                        totalPage: pagination.totalPage,
                                    });
                            }}
                            prevPage={() => {
                                pagination.currPage !== 1 &&
                                    setPagination({
                                        currPage: pagination.currPage - 1,
                                        totalPage: pagination.totalPage,
                                    });
                            }}
                            currentPageNumber={pagination.currPage}
                            lastPageNumber={pagination.totalPage}
                        />
                    </div>
                </div>
            </div>
            {menu === recordMenu.RACK && (
                <RackInformation selectedRow={selectedRow} />
            )}
            {menu === recordMenu.ITEM && (
                <>
                    <Rack
                        rack={
                            selectedRow && selectedRow.rack_id
                                ? {
                                      rack_id: selectedRow.rack_id,
                                      numberOfU: selectedRow.number_of_u,
                                  }
                                : ""
                        }
                        rackItems={rackItems}
                    />
                    <ItemInformation selectedRow={selectedRow} />
                </>
            )}
        </div>
    );
};

export default Record;
