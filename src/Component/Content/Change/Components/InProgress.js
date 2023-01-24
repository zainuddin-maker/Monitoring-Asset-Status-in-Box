import { filter } from "minimatch";
import React, { useState, useEffect, useCallback } from "react";
import {
    InputDropdownHorizontal,
    InputTextAutoSuggestHorizontal,
    TableDCIM,
    Paging,
} from "../../../ComponentReuseable";
import IconCheck from "../../../../svg/icon_check.svg";
import IconSearch from "../../../../svg/icon_search.svg";
import { requestAPI } from "./Utils/changeUtils";
import {
    getFloorsAPI,
    getAreasByFloorAPI,
    getClientsAPI,
    getInProgressChangesAPI,
    getRackNumbersByFloorClient,
    getRoomsByFloorAPI,
    getUACNotifChangeAPI,
} from "./ChangeAPI";
import { toast } from "react-toastify";
import { LoadingData } from "../../../ComponentReuseable";
import ModalRequestCompletion from "./InProgress/ModalRequestCompletion";
import { useModal } from "../../../ComponentReuseable";
import ModalApproval from "./Approval/ModalApproval";
import { formatDate } from "./Record";
import { timestampWithoutDayParse } from "../../../ComponentReuseable/Functions";
import { getLimitTableDCIM } from "../../../ComponentReuseable";
import { getUAC, getUACWithoutToast } from "../../../ComponentReuseable";
import { InvalidInput } from "./InvalidInput";

const filterDropdown = {
    FLOOR: {
        label: "Floor",
        name: "floor",
    },
    AREA: {
        label: "Room",
        name: "room",
    },
    CLIENT: {
        label: "Client",
        name: "client",
    },
    RACK: {
        label: "Rack No.",
        name: "rack_no",
    },

    CATEGORY: {
        label: "Category",
        name: "category",
    },
    // TECHNICIAN: {
    //     label: "Technician",
    //     name: "technician",
    // },
};
const inProgressTableHeader = {
    request_timestamp: "Request Timestamp",
    approval_timestamp: "Approval Timestamp",
    request: "Request",
    rack_no: "Rack #",
    client: "Client",
    requested_by: "Requested By",
    approved_by: "Approved By",
};
const inProgressTableBody = new Array(2).fill({}).map((item, index) => {
    return {
        request_timestamp: "19 Jun 2021 06:11",
        approval_timestamp: "20 Jun 2021 12:11",
        request: "Rack",
        rack_no: "RK45-002",
        change: "Install",
        item_no: "SV2-001",
        change_to: "U#02-U#04",
    };
});

const category = [
    {
        id: "rack",
        name: "Rack",
    },
    {
        id: "item",
        name: "Item",
    },
];
const InProgress = () => {
    let pageLimit = 15;

    const { isShowing, toggle } = useModal();
    const {
        isShowing: isShowingDetailedRequest,
        toggle: toggleDetailedRequest,
    } = useModal();
    const [inputOptions, setInputOptions] = useState({
        floor: [],
        area: [],
        client: [],
        rack_no: [],
        category: category,
        technician: [],
        room: [],
    });
    const [inputData, setInputData] = useState({
        floor: "",
        area: "",
        room: "",
        client: "",
        client_id: "",
        category: "",
        technician: "",
        rack_no: "",
        rack_id: "",
    });
    const [pagination, setPagination] = useState({
        currPage: 1,
        totalPage: Math.ceil(1 / pageLimit),
    });
    const [detailedRequest, setDetailedRequest] = useState({});
    const actions = getUACWithoutToast("add")
        ? [
              {
                  iconSrc: IconCheck,
                  onClick: (selectedItem, index) => {
                      setDetailedRequest(inProgressList[index]);
                      getUAC("add") && toggle();
                      // toggle();
                  },
              },
              {
                  iconSrc: IconSearch,
                  onClick: (selectedItem, index) => {
                      setDetailedRequest(inProgressList[index]);
                      // toggleDetailedRequest();
                      toggleDetailedRequest();
                  },
              },
          ]
        : [
              {
                  iconSrc: IconSearch,
                  onClick: (selectedItem, index) => {
                      setDetailedRequest(inProgressList[index]);
                      // toggleDetailedRequest();
                      toggleDetailedRequest();
                  },
              },
          ];
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFilter, setIsLoadingFilter] = useState({
        floor: "",
        room: "",
        client: "",
        rack_no: "",
    });
    const [inProgressList, setInProgressList] = useState([]);
    const [userGroupNotif, setUserGroupNotif] = useState([]);

    const handleChange = (e) => {
        let { name, value } = e.target;
        setInputData((prev) => {
            prev[name] = value;
            return { ...prev };
        });
    };
    const getInProgress = useCallback(
        async (
            pageLimit,
            offset,
            floor_id,
            area,
            client,
            category,
            technician,
            room,
            rack_no,
            inputOptions
        ) => {
            setIsLoading(true);
            try {
                let find_floor_name = inputOptions.floor.find(
                    (floor) => floor.id.toString() === floor_id.toString()
                );
                let find_room_name = inputOptions.room.find(
                    (el) => el.id.toString() === room.toString()
                );

                let floor_name = find_floor_name ? find_floor_name.name : "";
                let room_name = find_room_name ? find_room_name.name : "";

                let result = await requestAPI(
                    getInProgressChangesAPI(
                        pageLimit,
                        offset,
                        floor_name,
                        area,
                        client,
                        category,
                        technician,
                        room_name,
                        rack_no
                    )
                );
                if (result.data && result.data.length > 0) {
                    setInProgressList((prev) => [...result.data]);
                } else {
                    setInProgressList((prev) => [...[]]);
                }
                setIsLoading(false);
            } catch (error) {
                toast.error(error.toString(), { toastId: "network-error" });
                setIsLoading(false);
            }
        },
        []
    );
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

            setIsLoadingFilter((prev) => ({ ...prev, floor: false }));
        } catch (error) {
            toast.error(error.toString(), { toastId: "network-error" });
            setIsLoadingFilter((prev) => ({ ...prev, floor: false }));
        }
    }, []);

    // Get Areas
    // useEffect(async () => {
    //     setInputData((prev) => ({ ...prev, area: "" }));
    //     if (inputData.floor) {
    //         try {
    //             let result = await requestAPI(
    //                 getAreasByFloorAPI(inputData.floor)
    //             );
    //             if (result.data && result.data.length > 0) {
    //                 let filterData = result.data.filter((val) => val.id !== "");

    //                 setInputOptions((prev) => ({
    //                     ...prev,
    //                     area: filterData.map((value) => ({
    //                         id: value.id,
    //                         name: value.name,
    //                     })),
    //                 }));
    //             } else {
    //                 setInputOptions((prev) => ({
    //                     ...prev,
    //                     area: [...[]],
    //                 }));
    //             }
    //         } catch (error) {
    //             toast.error(error.toString());
    //         }
    //     }
    // }, [inputData.floor]);

    // Get Rooms
    useEffect(async () => {
        if (inputData.floor) {
            setIsLoadingFilter((prev) => ({ ...prev, room: true }));
            try {
                let result = await requestAPI(
                    getRoomsByFloorAPI(inputData.floor)
                );
                setInputOptions((prev) => ({
                    ...prev,
                    room: result.data.map((value) => ({
                        id: value.room_id,
                        name: value.room_name,
                    })),
                }));
                setInputData((prev) => ({
                    ...prev,
                    room: "",
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
            setInputData((prev) => ({
                ...prev,
                room: "",
            }));
        }
    }, [inputData.floor]);

    // Get Rack No
    useEffect(async () => {
        // setFilter((prev) => ({ ...prev }));
        // if (filter.floor || filter.client) {
        setIsLoadingFilter((prev) => ({ ...prev, rack_no: true }));
        try {
            let find_floor_name = inputOptions.floor.find(
                (floor) => floor.id.toString() === inputData.floor.toString()
            );
            let find_room_name = inputOptions.room.find(
                (room) => room.id.toString() === inputData.room.toString()
            );
            let floor_name = find_floor_name ? find_floor_name.name : "";
            let room_name = find_room_name ? find_room_name.name : "";

            let result = await requestAPI(
                getRackNumbersByFloorClient(
                    floor_name,
                    inputData.client,
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
    }, [inputData.floor, inputData.room, inputData.client_id]);
    // // Get Clients
    useEffect(async () => {
        setIsLoadingFilter((prev) => ({ ...prev, client: true }));
        try {
            let result = await requestAPI(getClientsAPI());

            if (result.data && result.data.length > 0) {
                setInputOptions((prev) => ({
                    ...prev,
                    client: result.data.map((value) => ({
                        id: value.client_id,
                        name: value.client_name || "---",
                    })),
                }));
            }
            setIsLoadingFilter((prev) => ({ ...prev, client: false }));
        } catch (error) {
            toast.error(error.toString(), { toastId: "network-error" });
            setIsLoadingFilter((prev) => ({ ...prev, client: false }));
        }
    }, []);
    // Get In Progress
    useEffect(() => {
        setPagination((prev) => ({ ...prev, currPage: 1 }));
        getInProgress(
            (pageLimit = getLimitTableDCIM()),
            0,
            inputData.floor,
            inputData.area,
            inputData.client,
            inputData.category,
            inputData.technician,
            inputData.room,
            inputData.rack_no,
            inputOptions
        );
    }, [
        inputData.floor,
        inputData.area,
        inputData.client_id,
        inputData.category,
        inputData.room,
        inputData.rack_id,
    ]);

    useEffect(() => {
        getInProgress(
            (pageLimit = getLimitTableDCIM()),
            (pagination.currPage - 1) * pageLimit,
            inputData.floor,
            inputData.area,
            inputData.client,
            inputData.category,
            inputData.technician,
            inputData.room,
            inputData.rack_no,
            inputOptions
        );
    }, [pagination.currPage]);

    // Validate Input

    const validateInput = (e) => {
        if (e.target.name === "client") {
            let findClient = inputOptions.client.find(
                (el) => el.name === e.target.value
            );

            if (findClient) {
                setInputData((prev) => ({ ...prev, client_id: findClient.id }));
            } else {
                setInputData((prev) => ({
                    ...prev,
                    client: "",
                    client_id: "",
                }));
                if (e.target.value !== "") {
                    toast.error(InvalidInput.client);
                }
            }
        } else if (e.target.name === "rack_no") {
            let find = inputOptions.rack_no.find(
                (el) => el.name === e.target.value
            );
            if (find) {
                if (find.id === inputData.rack_id) {
                    setInputData((prev) => ({
                        ...prev,
                        rack_id: find.id,
                    }));
                } else {
                    setInputData((prev) => ({
                        ...prev,
                        rack_id: find.id,
                        item_id: "",
                        item_no: "",
                    }));
                }
            } else {
                setInputData((prev) => ({
                    ...prev,
                    rack_no: "",
                    rack_id: "",
                }));
                if (e.target.value !== "") {
                    toast.error(InvalidInput.rack_no);
                }
            }
        }
    };
    // UAC Get Notif
    useEffect(() => {
        (async () => {
            try {
                let result = await requestAPI(getUACNotifChangeAPI());
                if (result.inprogress) {
                    setUserGroupNotif(result.inprogress);
                }
            } catch (error) {
                toast.error("Failed to get change notification user group");
            }
        })();
    }, []);

    return (
        <div className='change-inprogress-container'>
            <div className='change-inprogress-header'>
                <ModalRequestCompletion
                    isShowing={isShowing}
                    hide={toggle}
                    detailedRequest={detailedRequest}
                    userGroupNotif={userGroupNotif}
                    getInProgress={() =>
                        getInProgress(
                            pageLimit,
                            0,
                            inputData.floor,
                            inputData.area,
                            inputData.client,
                            inputData.category,
                            inputData.technician,
                            inputData.room,
                            inputData.rack_no,
                            inputOptions
                        )
                    }
                />
                {isShowingDetailedRequest && (
                    <ModalApproval
                        isShowing={isShowingDetailedRequest}
                        hide={toggleDetailedRequest}
                        detailedRequest={detailedRequest}
                        status='in_progress'
                    />
                )}

                {Object.keys(filterDropdown).map((key) => {
                    return key === "CLIENT" || key === "RACK" ? (
                        <InputTextAutoSuggestHorizontal
                            name={filterDropdown[key].name}
                            label={filterDropdown[key].label}
                            value={inputData[filterDropdown[key].name]}
                            options={
                                key === "CLIENT"
                                    ? inputOptions.client.map((el) => el.name)
                                    : inputOptions.rack_no.map((el) => el.name)
                            }
                            onChange={handleChange}
                            onClear={() =>
                                key === "CLIENT"
                                    ? setInputData((prev) => ({
                                          ...prev,
                                          client: "",
                                          client_id: "",
                                      }))
                                    : setInputData((prev) => ({
                                          ...prev,
                                          rack_no: "",
                                      }))
                            }
                            isLoading={
                                key === "CLIENT"
                                    ? isLoadingFilter.client
                                    : isLoadingFilter.rack_no
                            }
                            // isRequired={true}
                            validateInput={(e) => validateInput(e)}
                        />
                    ) : (
                        <InputDropdownHorizontal
                            inputWidth='150px'
                            label={filterDropdown[key].label}
                            name={filterDropdown[key].name}
                            value={inputData[filterDropdown[key].name]}
                            onChange={handleChange}
                            options={inputOptions[filterDropdown[key].name]}
                            isLoading={
                                isLoadingFilter[filterDropdown[key].name]
                            }
                            isDisabled={
                                filterDropdown[key].name === "room"
                                    ? inputData["floor"]
                                        ? false
                                        : true
                                    : false
                            }
                        />
                    );
                })}
            </div>
            <div className='change-inprogress-content-container'>
                <LoadingData isLoading={isLoading} />
                <div className='change-inprogress-table'>
                    <TableDCIM
                        header={inProgressTableHeader}
                        body={
                            inProgressList.length > 0 &&
                            inProgressList.map((el) => ({
                                request_timestamp: timestampWithoutDayParse(
                                    el.request_timestamp
                                ),
                                approval_timestamp: timestampWithoutDayParse(
                                    el.approval_timestamp
                                ),
                                request:
                                    el.type.charAt(0).toUpperCase() +
                                    el.type.slice(1),
                                rack_no: el.rack_number,
                                client: el.client_name || "---",
                                requested_by: el.requester_username || "---",
                                approved_by: el.approved_by || "---",
                            }))
                        }
                        actions={actions}
                        selectable={true}
                        onSelect={(e, index) => {}}
                        customCellClassNames={{}}
                    />
                </div>
                <div className='change-inprogress-paging'>
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
    );
};

export default InProgress;
