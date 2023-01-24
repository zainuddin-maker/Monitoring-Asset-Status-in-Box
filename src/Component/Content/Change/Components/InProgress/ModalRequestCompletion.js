import React, { useState, useEffect } from "react";
import { ModalContainer } from "../../../../ComponentReuseable";

import { requestAPI } from "../Utils/changeUtils";

import { completeRequest } from "../ChangeAPI";
import { toast } from "react-toastify";
import { PushNotification } from "../../../../ComponentReuseable";
const ERROR_CODE = {
    FAIL_DISCONNECT_ITEM: "Failed to Disconnect Item",
    FAIL_REMOVE_ITEM: "Failed to Remove Item",
};
const ModalRequestCompletion = (props) => {
    let { isShowing, hide, detailedRequest, getInProgress, userGroupNotif } =
        props;

    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            let result = await requestAPI(
                completeRequest(
                    detailedRequest.type,
                    detailedRequest.request_timestamp,
                    detailedRequest.requester_username
                    // detailedRequest.change_id
                )
            );

            let isSuccess = true;
            if (Object.keys(ERROR_CODE).includes(result)) {
                toast.error(ERROR_CODE[result]);
                isSuccess = false;
            }
            if (isSuccess) {
                hide();
                getInProgress();

                // Push Notification
                try {
                    const message =
                        "Complete " +
                        detailedRequest.type.charAt(0).toUpperCase() +
                        detailedRequest.type.slice(1) +
                        " Change Request";
                    const is_general = false;
                    const user_group_name = userGroupNotif.user_group_name
                        ? userGroupNotif.user_group_name
                        : [];
                    const notification_category_name = "change";
                    const notification_sub_category_name = detailedRequest.type;
                    const result = await PushNotification(
                        message,
                        is_general,
                        user_group_name,
                        notification_category_name,
                        notification_sub_category_name,
                        "operation/rack_and_server_management/change/record"
                    );
                } catch (error) {
                    toast.error("Failed to push notification message");
                }
            }
            setIsLoading(false);
        } catch (error) {
            toast.error(error.toString());
            setIsLoading(false);
        }
    };

    return (
        <ModalContainer
            width='300px'
            title={`Change Request Completion`}
            isShowing={isShowing}
            hide={hide}
            submitName={"Yes"}
            onSubmit={handleSubmit}
            clearName={"No"}
            onClear={hide}
            isLoading={isLoading}>
            <div
                className='reusable-modal-delete'
                style={{
                    marginTop: "0px",
                    fontSize: "16px",
                    fontWeight: "500",
                }}>
                <span>{`Are you sure this request is completed ?`}</span>
            </div>
        </ModalContainer>
    );
};

export default ModalRequestCompletion;
