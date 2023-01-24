import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";

import {
    ModalContainer,
    InputTextAreaVertical,
    PushNotification,
} from "../../../ComponentReuseable/index";
import { getToken, getUserDetails } from "../../../TokenParse/TokenParse";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";

import { timeFormatter } from "./timeFormatter";

const IncidentRecordConfirm = ({
    isShowing,
    hide,
    selectedIncident,
    getIncidentList,
}) => {
    const [closingData, setClosingData] = useState({
        // TAKE FROM LOCAL STORAGE
        closeSubmitter: getUserDetails().fullname,
        remark: "",
    });
    const [loadingButton, setLoadingButton] = useState(false);

    const pushNotif = async () => {
        const formData = new FormData();
        formData.append("type", "confirmation");
        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_INCIDENT_USER_GROUP,
            headers: {
                authorization: getToken(),
            },
            data: formData,
        };
        axios(config)
            .then(async (response) => {
                if (response.data) {
                    try {
                        const message = "Incident Close Submission";
                        const is_general = false;
                        const user_group_name = response.data;
                        const notification_category_name = "incident";
                        const notification_sub_category_name =
                            selectedIncident.category;
                        const notification_url =
                            "operation/cdc_asset_monitoring/incident/confirmation";
                        const result = await PushNotification(
                            message,
                            is_general,
                            user_group_name,
                            notification_category_name,
                            notification_sub_category_name,
                            notification_url
                        );
                    } catch (e) {
                        // console.log(e.toString());
                    }
                }
            })
            .catch((err) => {
                // console.log(err);
            });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoadingButton(true);

        const formData = new FormData();
        formData.append("record_id", selectedIncident.id);
        formData.append("remark", closingData.remark);
        formData.append("close_submitter", closingData.closeSubmitter);

        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_INCIDENT_CLOSE_INCIDENT,
            data: formData,
            headers: {
                authorization: getToken(),
            },
        };
        axios(config)
            .then((response) => {
                if (response.data.data) {
                    pushNotif();
                    toast.success("Submission Success", { toastId: "success" });
                }
                setLoadingButton(false);
                handleClear();
                hide();
                getIncidentList();
            })
            .catch((err) => {
                toast.error("Submission Failed: " + err.message, {
                    toastId: "error",
                });
                setLoadingButton(false);
            });
    };
    const handleChange = (e) => {
        let { name, value } = e.target;
        setClosingData((prev) => {
            prev[name] = value;
            return { ...prev };
        });
    };
    const handleClear = () => {
        setClosingData((prev) => {
            prev.remark = "";
            return { ...prev };
        });
    };

    return (
        <ModalContainer
            title={"Close Incident"}
            isShowing={isShowing}
            hide={() => {
                handleClear();
                hide();
            }}
            submitName='Submit'
            clearName='Clear'
            onClear={handleClear}
            formId='confirm-incident'
            isLoading={loadingButton}
            showRequired={true}>
            <div className='incident-form-container'>
                <div className='incident-form-container__body'>
                    <form
                        id='confirm-incident'
                        onSubmit={handleSubmit}
                        className='close-incident-body'>
                        <div className='close-incident-data'>
                            <div className='submitter'>
                                <label className='submitter__label'>
                                    Category
                                </label>
                                <div className='submitter__value'>
                                    {selectedIncident.category}
                                </div>
                            </div>
                            <div className='submitter'>
                                <label className='submitter__label'>
                                    Incident Date
                                </label>
                                <div className='submitter__value'>
                                    {timeFormatter(
                                        selectedIncident.incident_time
                                    )}
                                </div>
                            </div>
                            <div className='submitter'>
                                <label className='submitter__label'>
                                    Close Submitter
                                </label>
                                <div className='submitter__value'>
                                    {closingData.closeSubmitter}
                                </div>
                            </div>
                        </div>
                        <div>
                            <InputTextAreaVertical
                                height='175px'
                                width='430px'
                                name='remark'
                                label='Remark'
                                value={closingData.remark}
                                onChange={handleChange}
                                isLogin={false}
                                isRequired={true}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </ModalContainer>
    );
};

export default IncidentRecordConfirm;
