import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

import checkIcon from "../../../../svg/check.svg";
import rejectIcon from "../../../../svg/reject.svg";

import { getToken } from "../../../TokenParse/TokenParse";
import {
    Tooltip,
    ModalConfirm,
    getUAC,
    getUACWithoutToast,
} from "../../../ComponentReuseable/index";
import ModalConfirmation from "../../Change/Components/Approval/ModalConfirmation";

const IncidentConfirmationCard = ({
    handleClick,
    cardData,
    toggleConf,
    toggleReject,
}) => {
    return (
        <div className='confirm-card-container'>
            <div className='confirm-card-header' onClick={handleClick}>
                <div>Incident Closed Approval</div>
                <div className='svg-container'>
                    <div className={`${cardData.priority.toLowerCase()}`}></div>
                    <div className={`${cardData.severity.toLowerCase()}`}></div>
                </div>
            </div>
            <div className='confirm-body-button'>
                <div className='confirm-card-body' onClick={handleClick}>
                    <div className='confirm-parameter-container'>
                        <div className='left-param'>
                            <span>Incident Close Submitter</span>
                            <div>{cardData.close_submitter}</div>
                        </div>
                        <div className='right-param'>
                            <span>Category</span>
                            <div>{cardData.category}</div>
                        </div>
                    </div>
                    <div className='confirm-parameter-container'>
                        <div className='left-param'>
                            <span>Incident Submitter</span>
                            <div>{cardData.submitter}</div>
                        </div>
                        <div className='right-param'>
                            <span>Incident Date</span>
                            <div>{cardData.incident_time}</div>
                        </div>
                    </div>
                    <div className='confirm-parameter-container'>
                        <div className='left-param'>
                            <span>Close Date</span>
                            <div>{cardData.close_time}</div>
                        </div>
                    </div>
                    <div className='confirm-parameter-container'>
                        <div className='left-param'>
                            <span>Remark</span>
                            <span className='remark-close'>
                                {cardData.close_remark}
                            </span>
                        </div>
                    </div>
                </div>
                <div className='confirmation-button-container'>
                    <div
                        style={
                            getUACWithoutToast("add")
                                ? { display: "flex" }
                                : { display: "none" }
                        }
                        className={`confirmation-button `}
                        onClick={() => {
                            getUAC("add") && toggleConf();
                        }}>
                        <Tooltip
                            tooltip={
                                <span style={{ color: "white" }}>Confirm</span>
                            }>
                            <img src={checkIcon} />
                        </Tooltip>
                    </div>

                    <div
                        style={
                            getUACWithoutToast("add")
                                ? { display: "flex" }
                                : { display: "none" }
                        }
                        className={`reject-button `}
                        onClick={() => {
                            getUAC("add") && toggleReject();
                        }}>
                        <Tooltip
                            tooltip={
                                <span style={{ color: "white" }}>Reject</span>
                            }>
                            <img src={rejectIcon} />
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncidentConfirmationCard;
