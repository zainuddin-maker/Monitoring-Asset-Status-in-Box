import React, { useState, useEffect } from "react";
import { ModalContainer } from "../../../../ComponentReuseable";

import { requestAPI } from "../Utils/changeUtils";

import { completeRequest } from "../ChangeAPI";
import { toast } from "react-toastify";

const ModalConfirmation = (props) => {
    let { isShowing, hide, handleSubmit, isReject, isLoading } = props;
    // const [isLoading, setIsLoading] = useState(false);

    const handleConfirmation = async () => {
        handleSubmit();
        // hide();
    };

    return (
        <ModalContainer
            width='300px'
            title={`Change Request Completion`}
            isShowing={isShowing}
            hide={hide}
            submitName={"Yes"}
            onSubmit={handleConfirmation}
            clearName={"No"}
            onClear={hide}
            isLoading={isLoading}>
            <div className='reusable-modal-delete'>
                <span>
                    {isReject
                        ? "Are you sure to reject this request ?"
                        : `Are you sure to approve this request ?`}
                </span>
            </div>
        </ModalContainer>
    );
};

export default ModalConfirmation;
