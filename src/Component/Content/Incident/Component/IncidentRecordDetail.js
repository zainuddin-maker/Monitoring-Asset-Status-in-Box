import React, { useState } from "react";
import {
    ModalContainer,
    PreviewImage,
    useModal,
} from "../../../ComponentReuseable/index";
import dummyImage from "../../../../image/image.png";
import SVG_preview from "../../../../svg/preview.svg";

import { timeFormatter } from "./timeFormatter";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";

const IncidentRecordDetail = ({ selectedIncident, isShowing, hide }) => {
    const { isShowing: isShowingPreview, toggle: togglePreview } = useModal();
    // tabmenu
    const [tabMenu, setTabMenu] = useState("incident");
    const handleChangeMenu = (value) => {
        setTabMenu(value);
    };

    return (
        <ModalContainer
            title={`${selectedIncident.incident_time} - ${selectedIncident.category} - Incident`}
            isShowing={isShowing}
            hide={() => {
                hide();
                setTabMenu("incident");
            }}>
            <PreviewImage
                src={
                    selectedIncident.image_location
                        ? `${ReturnHostBackend(
                              process.env.REACT_APP_BACKEND_NODELINX
                          )}/filerepository/dcim/uploadFileFromAPI/${
                              selectedIncident.image_location
                          }`
                        : dummyImage
                }
                isShowing={isShowingPreview}
                hide={togglePreview}
                level={2}
            />

            <div className='incident-detail-container'>
                <div className='incident-tabmenu'>
                    <div
                        className={tabMenu === "incident" ? "selected" : ""}
                        onClick={() => handleChangeMenu("incident")}>
                        <span>Incident</span>
                    </div>
                    <div
                        className={tabMenu === "closed" ? "selected" : ""}
                        onClick={() => handleChangeMenu("closed")}>
                        <span>Closed</span>
                    </div>
                </div>
                {tabMenu === "incident" ? (
                    <div className='incident-body-container'>
                        <div className='left-container'>
                            <div className='image-container'>
                                <img
                                    onClick={togglePreview}
                                    src={
                                        selectedIncident.image_location
                                            ? `${ReturnHostBackend(
                                                  process.env
                                                      .REACT_APP_BACKEND_NODELINX
                                              )}/filerepository/dcim/uploadFileFromAPI/${
                                                  selectedIncident.image_location
                                              }`
                                            : dummyImage
                                    }
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = dummyImage;
                                    }}
                                />
                                <div
                                    className='image-container-preview'
                                    onClick={togglePreview}>
                                    <img src={SVG_preview} />
                                </div>
                            </div>

                            <div className='status-container'>
                                <div>Status</div>
                                <div>:</div>
                                <div
                                    className={
                                        selectedIncident.status.toLowerCase() ===
                                        "closed"
                                            ? "closed"
                                            : selectedIncident.status.toLowerCase() ===
                                              "open"
                                            ? "open"
                                            : "waiting"
                                    }>
                                    {selectedIncident.status}
                                </div>
                            </div>
                        </div>
                        <div className='right-container'>
                            <div className='parameter-container'>
                                <div>Floor</div>
                                <div>:</div>
                                <div>{selectedIncident.floor}</div>
                            </div>
                            <div className='parameter-container'>
                                <div>Room</div>
                                <div>:</div>
                                <div>{selectedIncident.room}</div>
                            </div>
                            <div className='parameter-container'>
                                <div>Category</div>
                                <div>:</div>
                                <div>{selectedIncident.category}</div>
                            </div>
                            <div className='parameter-container'>
                                <div>Submitter</div>
                                <div>:</div>
                                <div>{selectedIncident.submitter}</div>
                            </div>
                            <div className='parameter-container'>
                                <div>Asset Number</div>
                                <div>:</div>
                                <div>{selectedIncident.asset_number}</div>
                            </div>
                            <div className='parameter-container'>
                                <div>Report Timestamp</div>
                                <div>:</div>
                                <div>
                                    {timeFormatter(
                                        selectedIncident.report_time
                                    )}
                                </div>
                            </div>
                            <div className='parameter-container'>
                                <div>Incident Timestamp</div>
                                <div>:</div>
                                <div>
                                    {timeFormatter(
                                        selectedIncident.incident_time
                                    )}
                                </div>
                            </div>
                            <div
                                className='parameter-container'
                                style={{ alignItems: "center" }}>
                                <div>Priority</div>
                                <div>:</div>
                                <div
                                    className={selectedIncident.priority.toLowerCase()}>
                                    {selectedIncident.priority}
                                </div>
                            </div>
                            <div
                                className='parameter-container'
                                style={{ alignItems: "center" }}>
                                <div>Severity</div>
                                <div>:</div>
                                <div
                                    className={selectedIncident.severity.toLowerCase()}>
                                    {selectedIncident.severity}
                                </div>
                            </div>
                            <div className='parameter-container'>
                                <div>Remark</div>
                                <div>:</div>
                                <div>{selectedIncident.remark}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className='closed-container'>
                        <div className='parameter-container'>
                            <div>Status</div>
                            <div>:</div>
                            <div
                                className={selectedIncident.status.toLowerCase()}>
                                {selectedIncident.status}
                            </div>
                        </div>
                        <div className='parameter-container'>
                            <div>Closed Timestamp</div>
                            <div>:</div>
                            <div>{selectedIncident.close_time}</div>
                        </div>
                        <div className='parameter-container'>
                            <div>Incident Close Submitter</div>
                            <div>:</div>
                            <div>{selectedIncident.close_submitter}</div>
                        </div>
                        <div className='parameter-container'>
                            <div>Confirmed by</div>
                            <div>:</div>
                            <div>{selectedIncident.confirmer}</div>
                        </div>
                        <div className='parameter-container'>
                            <div>Remark</div>
                            <div>:</div>
                            <div>{selectedIncident.close_remark}</div>
                        </div>
                    </div>
                )}
            </div>
        </ModalContainer>
    );
};

export default IncidentRecordDetail;
