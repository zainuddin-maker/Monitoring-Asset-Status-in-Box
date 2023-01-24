import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { getToken } from "../../../TokenParse/TokenParse";

export const getFloorsAPI = {
    method: "post",
    url:
        ReturnHostBackend(process.env.REACT_APP_JDBC) +
        process.env.REACT_APP_CHANGE_GET_FLOORS,
    headers: {
        authorization: getToken(),
    },
    data: {},
};

export const getRoomsByFloorAPI = (floor_id) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CONNECTIVITY_GET_ROOMS_BY_FLOOR,
        headers: {
            authorization: getToken(),
        },
        data: {
            floor_id: floor_id,
        },
    };
};

export const getRackNumbersByRoomAPI = (floor_name, room_name) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_RACK_NUMBER_BY_ROOM,
        headers: {
            authorization: getToken(),
        },
        data: {
            floor_name: floor_name,
            room_name: room_name,
        },
    };
};

export const getChangeTypesAPI = (request_type) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_SERVICES) +
            process.env.REACT_APP_CHANGE_GET_CHANGE_TYPES,
        headers: {
            authorization: getToken(),
        },
        data: {
            request_type: request_type,
        },
    };
};

export const getItemNumbers = (search, type) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_ITEM_NUMBERS,
        headers: {
            authorization: getToken(),
        },
        data: {
            search: search || "",
            type: type,
        },
    };
};

export const getAllRackNumbers = (item_number) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_ALL_RACK_NUMBERS,
        headers: {
            authorization: getToken(),
        },
        data: {
            item_number: item_number || "",
        },
    };
};

export const getItemNumbersByRack = (rack_number) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_ITEM_NUMBERS_BY_RACK,
        headers: {
            authorization: getToken(),
        },
        data: {
            rack_number: rack_number,
        },
    };
};

export const getRecordItemNumbersAPI = (
    rack_number,
    floor_name,
    room_name,
    client_name
) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_RECORD_ITEM_NUMBERS,
        headers: {
            authorization: getToken(),
        },
        data: {
            rack_number: rack_number,
            floor_name: floor_name,
            room_name: room_name,
            client_name: client_name,
        },
    };
};

export const addItemRequests = (
    rack_number,
    rack_id,
    requester_username,
    payload
) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_SERVICES) +
            process.env.REACT_APP_CHANGE_ADD_ITEM_REQUESTS,
        headers: {
            authorization: getToken(),
        },
        data: {
            rack_number: rack_number,
            rack_id: rack_id,
            requester_username: requester_username,
            payload: JSON.stringify(payload),
        },
    };
};

export const listWaitingApprovalAPI = (limit, offset, type) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_LIST_WAITING_APPROVAL,
        headers: {
            authorization: getToken(),
        },
        data: {
            limit: limit,
            offset: offset,
            type: type === "all" ? "" : type || "",
        },
    };
};

export const getDetailedRequestAPI = (
    request_type,
    request_timestamp,
    request_username
) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_DETAILED_REQUEST,
        headers: {
            authorization: getToken(),
        },
        data: {
            request_type: request_type,
            request_timestamp: request_timestamp,
            requester_username: request_username,
        },
    };
};

export const getCurrentRackParametersAPI = (rack_id) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_CURRENT_RACK_PARAMETERS,
        headers: {
            authorization: getToken(),
        },
        data: {
            rack_id: rack_id,
        },
    };
};

export const getRackAccessTypesNamesAPI = () => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_RACK_ACCESS_TYPES_NAMES,
        headers: {
            authorization: getToken(),
        },
        data: {},
    };
};

export const getClientsAPI = () => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_CLIENTS,
        headers: {
            authorization: getToken(),
        },
        data: {},
    };
};

export const getPowerSourcesAPI = () => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_POWER_SOURCES,
        headers: {
            authorization: getToken(),
        },
        data: {},
    };
};

export const addRackRequest = (
    rack_number,
    change_type,
    requester_username,
    change_to,
    rack_id
) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_SERVICES) +
            process.env.REACT_APP_CHANGE_ADD_RACK_REQUESTS,
        headers: {
            authorization: getToken(),
        },
        data: {
            rack_number: rack_number,
            change_type: change_type,
            requester_username: requester_username,
            change_to: JSON.stringify(change_to),
            rack_id: rack_id,
        },
    };
};

export const approveRequest = (
    request_type,
    request_timestamp,
    requester_username,
    approver_username
) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_SERVICES) +
            process.env.REACT_APP_CHANGE_APPROVE_REQUEST,
        headers: {
            authorization: getToken(),
        },
        data: {
            request_type: request_type,
            request_timestamp: request_timestamp,
            requester_username: requester_username,
            approver_username: approver_username,
        },
    };
};

export const rejectRequest = (
    request_type,
    request_timestamp,
    requester_username,
    approved_by
) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_REJECT_REQUEST,
        headers: {
            authorization: getToken(),
        },
        data: {
            request_type: request_type,
            request_timestamp: request_timestamp,
            requester_username: requester_username,
            approved_by: approved_by,
        },
    };
};

// return {id:,name:}
export const getAreasByFloorAPI = (floor_id) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_AREAS_BY_FLOOR,
        headers: {
            authorization: getToken(),
        },
        data: {
            floor_id: floor_id,
        },
    };
};

export const getInProgressChangesAPI = (
    limit,
    offset,
    floor_name,
    area_name,
    client_id,
    type,
    technician,
    room,
    rack_no
) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_INPROGRESS,
        headers: {
            authorization: getToken(),
        },
        data: {
            limit: limit,
            offset: offset,
            floor_name: floor_name,
            area_name: area_name,
            client_id: client_id,
            type: type,
            technician: technician,
            room: room,
            rack_no: rack_no,
        },
    };
};

export const completeRequest = (
    request_type,
    request_timestamp,
    requester_username
) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_SERVICES) +
            process.env.REACT_APP_CHANGE_COMPLETE_REQUEST,
        headers: {
            authorization: getToken(),
        },
        data: {
            request_type: request_type,
            request_timestamp: request_timestamp,
            requester_username: requester_username,
        },
    };
};

export const getRackNumbersByFloorClient = (
    floor_name,
    client_id,
    room_name
) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_RACK_NUMBERS_BY_FLOOR_CLIENT,
        headers: {
            authorization: getToken(),
        },
        data: {
            floor_name: floor_name,
            client_id: client_id,
            room_name: room_name || "",
        },
    };
};

export const getRecordChangesAPI = (
    limit,
    offset,
    floor_name,
    rack_id,
    client_id,
    type,
    search,
    status,
    item_number,
    room_name
) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_CHANGE_LOGS,
        headers: {
            authorization: getToken(),
        },
        data: {
            limit: limit,
            offset: offset,
            floor_name: floor_name,
            rack_id: rack_id,
            client_id: client_id,
            type: type,
            search: search,
            status: status,
            item_number: item_number || "",
            room_name: room_name || "",
        },
    };
};

export const getRackListsAPI = (
    limit,
    offset,
    floor_name,
    rack_number,
    client_name,
    search,
    room_name
) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_RACK_LISTS,
        headers: {
            authorization: getToken(),
        },
        data: {
            limit: limit,
            offset: offset,
            floor_name: floor_name,
            rack_number: rack_number,
            client_name: client_name,
            search: search,
            room_name: room_name,
        },
    };
};

export const getItemListsAPI = (
    limit,
    offset,
    floor_name,
    rack_number,
    client_name,
    search,
    item_number,
    room_name
) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_ITEM_LISTS,
        headers: {
            authorization: getToken(),
        },
        data: {
            limit: limit,
            offset: offset,
            floor_name: floor_name,
            rack_number: rack_number,
            client_name: client_name,
            item_number: item_number,
            search: search,
            room_name: room_name,
        },
    };
};

export const getRackItemsAPI = (rackId) => {
    // Call JDBC query to get all rack items inside the selected racks
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CONNECTIVITY_GET_INSTALLED_RACK_ITEMS,
        headers: {
            authorization: getToken(),
        },
        data: {
            rack_id: rackId === null || rackId === undefined ? "" : rackId,
        },
    };
};

export const getRackChangesHistoryAPI = (
    limit,
    offset,
    rack_number,
    change_type,
    change_timestamp
) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_RACK_CHANGES_HISTORY,
        headers: {
            authorization: getToken(),
        },
        data: {
            limit: limit,
            offset: offset,
            rack_number: rack_number,
            change_type: change_type,
            change_timestamp: change_timestamp,
        },
    };
};

export const getItemChangesHistoryAPI = (
    limit,
    offset,
    rack_number,
    change_type,
    change_timestamp
) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_ITEM_CHANGES_HISTORY,
        headers: {
            authorization: getToken(),
        },
        data: {
            limit: limit,
            offset: offset,
            rack_number: rack_number,
            change_type: change_type,
            change_timestamp: change_timestamp,
        },
    };
};

export const getOverviewStatusAPI = (cancelToken) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_OVERVIEW_STATUS,
        headers: {
            authorization: getToken(),
        },
        data: {},
        cancelToken: cancelToken.token,
    };
};

export const getOverviewByCategoryAPI = (filter_type, cancelToken) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_OVERVIEW_BY_CATEGORY,
        headers: {
            authorization: getToken(),
        },
        data: {
            filter_type: filter_type,
        },
        cancelToken: cancelToken.token,
    };
};

export const getOverviewRackOccupationAPI = (cancelToken) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_RACK_OCCUPATION,
        headers: {
            authorization: getToken(),
        },
        data: {},
        cancelToken: cancelToken.token,
    };
};

export const getOverviewRackClientsAPI = (cancelToken) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_OVERVIEW_RACK_CLIENTS,
        headers: {
            authorization: getToken(),
        },
        data: {},
        cancelToken: cancelToken.token,
    };
};

export const getOveriewRackChangeOccupationAPI = (cancelToken) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_OVERVIEW_RACK_CHANGE_OCCUPATION,
        headers: {
            authorization: getToken(),
        },
        data: {},
        cancelToken: cancelToken.token,
    };
};

export const getOverviewItemClientsAPI = (cancelToken) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_OVERVIEW_ITEM_CLIENT,
        headers: {
            authorization: getToken(),
        },
        data: {},
        cancelToken: cancelToken.token,
    };
};

export const getOverviewItemStatusCategoryAPI = (cancelToken) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_OVERVIEW_ITEM_STATUS_CATEGORY,
        headers: {
            authorization: getToken(),
        },
        data: {},
        cancelToken: cancelToken.token,
    };
};

export const getOverviewItemRegisteredChangeAPI = (cancelToken) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_ITEM_REGISTERED_CHANGE,
        headers: {
            authorization: getToken(),
        },
        data: {},
        cancelToken: cancelToken.token,
    };
};

export const getExportLogRecordAPI = (
    floor_name,
    client_id,
    rack_id,
    type,
    status,
    room_name,
    item_number
) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_EXPORT_LOG_RECORD,
        headers: {
            authorization: getToken(),
        },
        data: {
            floor_name: floor_name,
            client_id: client_id,
            rack_id: rack_id,
            type: type,
            status: status,
            room_name: room_name,
            item_number: item_number,
        },
    };
};

export const createClientAPI = (client_name) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_CREATE_CLIENT,
        headers: {
            authorization: getToken(),
        },
        data: {
            client_name: client_name,
        },
    };
};

export const deleteClientAPI = (client_name) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_DELETE_CLIENT,
        headers: {
            authorization: getToken(),
        },
        data: {
            client_name: client_name,
        },
    };
};

export const getDetailedRackAPI = (rack_number) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_DETAILED_RACK,
        headers: {
            authorization: getToken(),
        },
        data: {
            rack_number: rack_number,
        },
    };
};

export const getItemNumbersDisconnectAPI = (item_number, rack_number) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_GET_ITEM_NUMBER_DISCONNECT,
        headers: {
            authorization: getToken(),
        },
        data: {
            item_number: item_number,
            rack_number: rack_number,
        },
    };
};

export const createRackAccessNameAPI = (access_name) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_CREATE_RACK_ACCESS_NAMES,
        headers: {
            authorization: getToken(),
        },
        data: {
            name: access_name,
        },
    };
};

export const deleteRackAccessNameAPI = (access_name) => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_JDBC) +
            process.env.REACT_APP_CHANGE_DELETE_RACK_ACCESS_NAME,
        headers: {
            authorization: getToken(),
        },
        data: {
            name: access_name,
        },
    };
};

// Get User Group Change Notification
export const getUACNotifChangeAPI = () => {
    return {
        method: "post",
        url:
            ReturnHostBackend(process.env.REACT_APP_SERVICES) +
            process.env.REACT_APP_CHANGE_GET_UAC_NOTIFICATION,
        headers: {
            authorization: getToken(),
        },
        data: {},
    };
};
