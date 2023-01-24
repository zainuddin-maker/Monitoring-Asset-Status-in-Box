import React, { useState, useEffect, useCallback } from "react";
import checkIcon from "../../../../svg/check.svg";
import rejectIcon from "../../../../svg/reject.svg";
import { useModal, Tooltip } from "../../../ComponentReuseable";
import ModalApproval from "./Approval/ModalApproval";
import { requestAPI } from "./Utils/changeUtils";
import {
    listWaitingApprovalAPI,
    approveRequest,
    rejectRequest,
    getUACNotifChangeAPI,
} from "./ChangeAPI";
import { toast } from "react-toastify";
import { Paging, LoadingData } from "../../../ComponentReuseable";
import { getUserDetails } from "../../../TokenParse/TokenParse";
import ModalConfirmation from "./Approval/ModalConfirmation";
import { PushNotification } from "../../../ComponentReuseable";
import { formatDate } from "./Record";
import {
    getUACWithoutToast,
    timestampWithoutDayParse,
} from "../../../ComponentReuseable/Functions";
import { getLimitCard } from "../../../ComponentReuseable";
import { getUAC } from "../../../ComponentReuseable";

const approvalMenu = {
    ALL: "All",
    ITEM: "Item",
    RACK: "Rack",
};

const Approval = () => {
    const maxItems = 8;
    const [menu, setMenu] = useState(approvalMenu.ALL);
    const [waitingApprovalList, setWaitingApprovalList] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingConfirmation, setIsLoadingConfirmation] = useState(false);
    const { isShowing: isShowingApproval, toggle: toggleApproval } = useModal();
    const { isShowing: isShowingConfirmation, toggle: toggleConfirmation } =
        useModal();
    const [pagination, setPagination] = useState({
        currPage: 1,
        totalPage: Math.ceil(1 / maxItems),
    });
    const [detailedRequest, setDetailedRequest] = useState({});
    const [isRejected, setIsRejected] = useState(false);
    const [userGroupNotif, setUserGroupNotif] = useState([]);

    const getWaitingForApproval = useCallback(async () => {
        try {
            setIsLoading(true);
            let result = await requestAPI(
                listWaitingApprovalAPI(
                    getLimitCard(400, 280, 20) || maxItems,
                    (pagination.currPage - 1) * getLimitCard(400, 280, 20),
                    menu.toLowerCase()
                )
            );
            setPagination((prev) => ({
                ...prev,
                totalPage: Math.ceil(
                    result.data.length > 0
                        ? result.data[0].total_data /
                              getLimitCard(400, 280, 20) || maxItems
                        : 1
                ),
            }));
            setWaitingApprovalList(result.data);
            setIsLoading(false);
        } catch (error) {
            toast.error(error.toString(), { toastId: "network-error" });
        }
    }, []);

    useEffect(async () => {
        setPagination((prev) => ({ ...prev, currPage: 1, lastPage: 1 }));
        try {
            setIsLoading(true);
            let result = await requestAPI(
                listWaitingApprovalAPI(
                    getLimitCard(400, 280, 20) || maxItems,
                    (pagination.currPage - 1) * getLimitCard(400, 280, 20),
                    menu.toLowerCase()
                )
            );
            setPagination((prev) => ({
                ...prev,
                totalPage: Math.ceil(
                    result.data.length > 0
                        ? result.data[0].total_data / maxItems
                        : 1
                ),
            }));
            setWaitingApprovalList(result.data);
            setIsLoading(false);
        } catch (error) {
            toast.error(error.toString(), { toastId: "network-error" });
            setIsLoading(false);
        }
    }, [menu]);

    useEffect(async () => {
        try {
            setIsLoading(true);
            let result = await requestAPI(
                listWaitingApprovalAPI(
                    getLimitCard(400, 280, 20) || maxItems,
                    (pagination.currPage - 1) * getLimitCard(400, 280, 20),
                    menu.toLowerCase()
                )
            );
            setPagination((prev) => ({
                ...prev,
                totalPage: Math.ceil(
                    result.data.length > 0
                        ? result.data[0].total_data / maxItems
                        : 1
                ),
            }));
            setWaitingApprovalList(result.data);
            setIsLoading(false);
        } catch (error) {
            toast.error(error.toString(), { toastId: "network-error" });
            setIsLoading(false);
        }
    }, [pagination.currPage]);

    const handleClickRequest = (index) => {
        setDetailedRequest(waitingApprovalList[index]);

        toggleApproval();
    };

    const handleClickAccept = async (index) => {
        let {
            request_timestamp,
            requester_username,
            type: request_type,
        } = waitingApprovalList[index];
        setIsLoadingConfirmation(true);
        try {
            let result = await requestAPI(
                approveRequest(
                    request_type,
                    request_timestamp,
                    requester_username,
                    getUserDetails().fullname
                )
            );
            if (result) {
                getWaitingForApproval();

                try {
                    const message =
                        "Approve " +
                        request_type.charAt(0).toUpperCase() +
                        request_type.slice(1) +
                        " Change Request";
                    const is_general = false;
                    const user_group_name =
                        userGroupNotif.approve &&
                        userGroupNotif.approve.user_group_name
                            ? userGroupNotif.approve.user_group_name
                            : [];
                    const notification_category_name = "change";
                    const notification_sub_category_name = request_type;
                    const result = await PushNotification(
                        message,
                        is_general,
                        user_group_name,
                        notification_category_name,
                        notification_sub_category_name,
                        "operation/rack_and_server_management/change/progress"
                    );
                } catch (error) {
                    toast.error("Failed to push notification message");
                }
            }
            setIsLoadingConfirmation(false);
            toggleConfirmation();
        } catch (error) {
            toast.error(error.toString(), { toastId: "network-error" });
            setIsLoadingConfirmation(false);
        }
    };

    const handleClickReject = async (index) => {
        let {
            request_timestamp,
            requester_username,
            type: request_type,
        } = waitingApprovalList[index];
        setIsLoadingConfirmation(true);
        try {
            let result = await requestAPI(
                rejectRequest(
                    request_type,
                    request_timestamp,
                    requester_username,
                    getUserDetails().fullname
                )
            );
            if (result) {
                getWaitingForApproval();
                // Push Notification
                try {
                    const message =
                        "Reject " +
                        request_type.charAt(0).toUpperCase() +
                        request_type.slice(1) +
                        " Change Request";
                    const is_general = false;
                    const user_group_name =
                        userGroupNotif.reject &&
                        userGroupNotif.reject.user_group_name
                            ? userGroupNotif.reject.user_group_name
                            : [];
                    const notification_category_name = "change";
                    const notification_sub_category_name = request_type;
                    const result = await PushNotification(
                        message,
                        is_general,
                        user_group_name,
                        notification_category_name,
                        notification_sub_category_name,
                        "operation/rack_and_server_management/change/progress"
                    );
                } catch (error) {
                    toast.error("Failed to push notification message");
                }
            }
            setIsLoadingConfirmation(false);
            toggleConfirmation();
        } catch (error) {
            toast.error(error.toString(), { toastId: "network-error" });
            setIsLoadingConfirmation(false);
        }
    };

    // UAC Get Notif
    useEffect(() => {
        (async () => {
            try {
                let result = await requestAPI(getUACNotifChangeAPI());
                if (result.approval) {
                    setUserGroupNotif(result.approval);
                }
            } catch (error) {
                toast.error("Failed to get change notification user group");
            }
        })();
    }, []);

    return (
        <div className='change-approval-container'>
            {isShowingApproval && (
                <ModalApproval
                    isShowing={isShowingApproval}
                    hide={toggleApproval}
                    detailedRequest={detailedRequest}
                />
            )}
            <ModalConfirmation
                isShowing={isShowingConfirmation}
                hide={toggleConfirmation}
                isLoading={isLoadingConfirmation}
                handleSubmit={() =>
                    isRejected
                        ? handleClickReject(selectedIndex)
                        : handleClickAccept(selectedIndex)
                }
                isReject={isRejected}
            />
            <div className='change-approval-header'>
                {Object.keys(approvalMenu).map((key) => (
                    <span
                        className='menu'
                        onClick={() => setMenu(approvalMenu[key])}
                        id={menu === approvalMenu[key] && "active"}>
                        {approvalMenu[key]}
                    </span>
                ))}
            </div>
            <div
                className='change-approval-card-container'
                id='limit-container-card-dcim'>
                <LoadingData isLoading={isLoading} />
                <div className='change-approval-card'>
                    {waitingApprovalList.length > 0 &&
                        waitingApprovalList.map((element, index) => (
                            <div
                                className='approval-card-container'
                                onClick={(e) => {
                                    handleClickRequest(index);
                                }}
                                key={index}>
                                <div className='approval-card-header'>
                                    <div>
                                        {`${
                                            element.type
                                                .charAt(0)
                                                .toUpperCase() +
                                            element.type.slice(1)
                                        }   Change Request`}
                                    </div>
                                </div>
                                <div className='approval-card-body'>
                                    <div className='approval-parameter-container'>
                                        <div className='parameter'>
                                            <span>Requested By</span>
                                            <div>
                                                {element.requester_username}
                                            </div>
                                        </div>
                                        <div className='parameter right-parameter'>
                                            <span>Rack Number</span>
                                            <div>{element.rack_number}</div>
                                        </div>
                                    </div>
                                    <div className='approval-parameter-container'>
                                        <div className='parameter'>
                                            <span>Request Timestamp</span>
                                            <div>
                                                {timestampWithoutDayParse(
                                                    element.request_timestamp
                                                )}
                                            </div>
                                        </div>
                                        {element.type === "item" && (
                                            <div className='parameter right-parameter'>
                                                <span>Client</span>
                                                <div>{element.client_name}</div>
                                            </div>
                                        )}
                                    </div>
                                    {element.type === "item" && (
                                        <div className='approval-parameter-container'>
                                            <div className='parameter'>
                                                <span>Number of Change</span>
                                                <div>
                                                    {element.number_of_change}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className='approval-parameter-container'>
                                        <div className='parameter'>
                                            <span>Change</span>
                                            <div>{element.change_type}</div>
                                        </div>
                                    </div>
                                    {element.type === "rack" && (
                                        <div
                                            className='approval-parameter-container'
                                            style={{ visibility: "hidden" }}>
                                            <div className='parameter'>
                                                <span>Number of Change</span>
                                                <div>
                                                    {element.number_of_change}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className='button-container'>
                                        {getUACWithoutToast("add") ? (
                                            <Tooltip
                                                tooltip={
                                                    <span
                                                        style={{
                                                            color: "white",
                                                        }}>
                                                        Confirm
                                                    </span>
                                                }>
                                                <div
                                                    className='confirmation-button'
                                                    style={{
                                                        cursor:
                                                            !getUACWithoutToast(
                                                                "add"
                                                            ) && "not-allowed",
                                                    }}>
                                                    <img
                                                        src={checkIcon}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedIndex(
                                                                index
                                                            );
                                                            setIsRejected(
                                                                false
                                                            );
                                                            // toggleConfirmation();
                                                            getUAC("add") &&
                                                                toggleConfirmation();
                                                            // toggleConfirmation();

                                                            // handleClickAccept(index);
                                                        }}
                                                    />
                                                </div>
                                            </Tooltip>
                                        ) : (
                                            <div
                                                className='confirmation-button'
                                                style={{
                                                    visibility: "hidden",
                                                }}></div>
                                        )}
                                        {getUACWithoutToast("add") ? (
                                            <Tooltip
                                                tooltip={
                                                    <span
                                                        style={{
                                                            color: "white",
                                                        }}>
                                                        Reject
                                                    </span>
                                                }>
                                                <div
                                                    className='reject-button'
                                                    style={{
                                                        cursor:
                                                            !getUACWithoutToast(
                                                                "add"
                                                            ) && "not-allowed",
                                                    }}>
                                                    <img
                                                        src={rejectIcon}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedIndex(
                                                                index
                                                            );
                                                            setIsRejected(true);
                                                            getUAC("add") &&
                                                                toggleConfirmation();

                                                            // toggleConfirmation();
                                                            // handleClickReject(index);
                                                        }}
                                                    />
                                                </div>
                                            </Tooltip>
                                        ) : (
                                            <div
                                                className='confirmation-button'
                                                style={{
                                                    visibility: "hidden",
                                                }}></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
                <div className='change-approval-paging'>
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

export default Approval;
