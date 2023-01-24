import React, { useCallback, useEffect, useState } from "react";
import "../style.scss";

import {
    InputDropdownVertical,
    InputTextAreaVertical,
    InputDatetimeVertical,
    ButtonClear,
    ButtonSubmit,
    UploadPhoto,
    ModalContainer,
    InputTextAutoSuggestVertical,
    PushNotification,
    LoadingUploadFile,
    generateDateGMT8,
} from "../../../ComponentReuseable/index";
import axios from "axios";
import { getToken, getUserDetails } from "../../../TokenParse/TokenParse";
import { toast } from "react-toastify";

import { ReturnHostBackend } from "../../../BackendHost/BackendHost";

import dummyImage from "../../../../image/image.png";

const IncidentForm = ({
    isShowing,
    hide,
    isEdit,
    incidentData,
    getIncidentList,
}) => {
    const [disableRoom, setDisableRoom] = useState(true);
    const [requiredAsset, setRequiredAsset] = useState(false);
    const [loadingButton, setLoadingButton] = useState(false);
    const [loadingParam, setLoadingParam] = useState({
        floor: false,
        room: false,
        category: false,
        asset: false,
        prioritySeverity: false,
    });
    const [inputData, setInputData] = useState({
        floor: "",
        room: "",
        category: "",
        submitter: getUserDetails().fullname,
        time: formatDate(generateDateGMT8(new Date())),
        assetNo: "",
        priority: "",
        severity: "",
        remark: "",
        image: "",
        imagePreview: "",
        imageOldPath: "",
    });
    const [progressBarUpload, setProgressBarUpload] = useState();
    const [inputOptions, setInputOptions] = useState({
        floor: [],
        room: [],
        category: [],
        assetNo: [],
        priority: [],
        severity: [],
    });

    // clearing asset number
    const handleClearAsset = () => {
        setInputData((prev) => ({ ...prev, assetNo: "" }));
    };

    // handle form inputs
    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name.toLowerCase() === "category") {
            if (isEdit) {
                name = "category_id";
            }

            let foundCategory = inputOptions.category.find(
                (data) => data.id === parseInt(value)
            );
            if (foundCategory) {
                if (foundCategory.name.toLowerCase() === "asset") {
                    setRequiredAsset(true);
                } else {
                    setRequiredAsset(false);
                }
            } else {
                setRequiredAsset(false);
            }
        }
        if (name === "floor") {
            if (!value) {
                setDisableRoom(true);
            } else {
                setDisableRoom(false);
            }
            setInputData((prev) => {
                prev.floor = value;
                prev.room = "";
                return { ...prev };
            });
        } else {
            setInputData((prev) => {
                prev[name] = value;
                return { ...prev };
            });
        }
    };
    const clearData = (name) => {
        console.log(name);
        console.log(inputData[name]);
        setInputData((prev) => {
            prev[name] = "";
            return { ...prev };
        });
    };
    const handleChangePhoto = (file) => {
        setInputData((prev) => {
            prev.image = file;
            prev.imagePreview = URL.createObjectURL(file);
            return { ...prev };
        });
    };
    const handleClear = () => {
        setInputData((prev) => {
            prev.assetNo = "";
            prev.category = "";
            prev.floor = "";
            prev.image = null;
            prev.imagePreview = "";
            prev.imageOldPath = "";
            prev.priority = "";
            prev.remark = "";
            prev.severity = "";
            prev.room = "";
            prev.time = formatDate(generateDateGMT8(new Date()));
            return { ...prev };
        });
    };
    const handleResetEdit = () => {
        let tempData = incidentData;
        tempData.imagePreview = "";
        tempData.imageOldPath = incidentData.image_location;
        tempData.image_location = "";
        setInputData({ ...tempData });
    };
    const validateAsset = (e) => {
        let { name, value } = e.target;
        let found = inputOptions.assetNo.find(
            (data) => data.id === value || data.name === value
        );
        if (!found) {
            if (value) {
                toast.error("Asset is Invalid", { toastId: "error" });
            }
            setInputData((prev) => {
                return { ...prev, assetNo: "" };
            });
        }
    };

    // notification

    const pushNotif = async (category_id) => {
        const foundCategory = inputOptions.category.find(
            (data) => data.id === parseInt(category_id)
        );
        const formData = new FormData();
        formData.append("type", "record");
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
                        const message = "New Incident Input";
                        const is_general = false;
                        const user_group_name = response.data;
                        const notification_category_name = "incident";
                        const notification_sub_category_name =
                            foundCategory.name || "";
                        const notification_url =
                            "operation/cdc_asset_monitoring/incident/record";
                        const result = await PushNotification(
                            message,
                            is_general,
                            user_group_name,
                            notification_category_name,
                            notification_sub_category_name,
                            notification_url
                        );
                        // console.log(result);
                    } catch (e) {
                        // console.log(e.toString());
                        toast.error("Failed to send notification", {
                            toastId: "error-notif",
                        });
                    }
                }
            })
            .catch((err) => {
                // console.log(err);
                toast.error("Failed to send notification", {
                    toastId: "error-notif",
                });
            });
    };

    // handle submission form and image
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoadingButton(true);

        // handling upload incident image
        const formData = new FormData();
        formData.append("floor", inputData.floor);
        formData.append("room", inputData.room);
        formData.append("category_id", inputData.category);
        formData.append("submitter", inputData.submitter);
        formData.append("asset", inputData.assetNo);
        formData.append("priority", inputData.priority);
        formData.append("severity", inputData.severity);
        formData.append(
            "incident_time",
            inputData.time || formatDate(generateDateGMT8(new Date()))
        );
        formData.append("remark", inputData.remark);
        if (inputData.image) {
            formData.append(
                "image_path",
                inputData.image.name.replace(/\s/g, "")
            );
            formData.append("image_file", inputData.image);
        } else {
            formData.append("image_path", "");
            formData.append("image_file", "");
        }
        let config;
        if (inputData.image) {
            // including loading upload
            config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env.REACT_APP_INCIDENT_SUBMIT,
                headers: {
                    authorization: getToken(),
                },
                data: formData,
                onUploadProgress: (data) =>
                    setProgressBarUpload(
                        Math.round((data.loaded / data.total) * 100)
                    ),
            };
        } else {
            config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env.REACT_APP_INCIDENT_SUBMIT,
                headers: {
                    authorization: getToken(),
                },
                data: formData,
            };
        }

        axios(config)
            .then((response) => {
                if (response.data.data) {
                    pushNotif(inputData.category);
                    toast.success("Incident Form Submitted", {
                        toastId: "success-submit",
                    });
                    handleClear();
                } else {
                    toast.success("Submission Failed", {
                        toastId: "success-submit",
                    });
                }
                setProgressBarUpload(0);
                setLoadingButton(false);
            })
            .catch((err) => {
                toast.error("Submission Failed: " + err.message, {
                    toastId: "error-submit",
                });
                setProgressBarUpload(0);
                setLoadingButton(false);
            });
    };

    const handleSubmitEdit = (e) => {
        e.preventDefault();
        setLoadingButton(true);
        // handling upload incident image
        let imagePath = "image_repository/incident/";
        const formData = new FormData();
        formData.append("id", inputData.id);
        formData.append("floor", inputData.floor);
        formData.append("room", inputData.room);
        formData.append("category_id", inputData.category_id);
        formData.append("submitter", inputData.submitter);
        formData.append("asset", inputData.assetNo);
        formData.append("priority", inputData.priority);
        formData.append("severity", inputData.severity);
        formData.append("incident_time", inputData.time);
        formData.append("remark", inputData.remark);

        if (inputData.imageOldPath) {
            if (inputData.image) {
                formData.append("image_file", inputData.image);
            } else {
                // NOT UPDATING
                formData.append("image_file", "");
            }
            formData.append("image_path", inputData.imageOldPath);
        } else {
            if (inputData.image) {
                formData.append(
                    "image_path",
                    imagePath + inputData.image.name.replace(/\s/g, "")
                );
                formData.append("image_file", inputData.image);
            } else {
                formData.append("image_path", "");
                formData.append("image_file", "");
            }
        }
        let config;
        if (inputData.image) {
            // include image upload loading
            config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env.REACT_APP_INCIDENT_SUBMIT_EDIT,
                headers: {
                    authorization: getToken(),
                },
                data: formData,
                onUploadProgress: (data) =>
                    setProgressBarUpload(
                        Math.round((data.loaded / data.total) * 100)
                    ),
            };
        } else {
            config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env.REACT_APP_INCIDENT_SUBMIT_EDIT,
                headers: {
                    authorization: getToken(),
                },
                data: formData,
            };
        }

        axios(config)
            .then((response) => {
                if (response.data.data) {
                    toast.success("Incident Form Submitted", {
                        toastId: "success-submit",
                    });
                }
                getIncidentList();
                setProgressBarUpload(0);
                setLoadingButton(false);
                hide();
            })
            .catch((err) => {
                toast.error("Submission Failed: " + err.message, {
                    toastId: "error-submit",
                });
                setProgressBarUpload(0);
                setLoadingButton(false);
            });
    };

    // get floors
    const getFloors = useCallback(() => {
        setLoadingParam((prev) => {
            return { ...prev, floor: true };
        });
        let config = {
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_INCIDENT_GET_FLOORS,
            method: "post",
            headers: {
                authorization: getToken(),
            },
        };
        axios(config)
            .then((response) => {
                if (response.data.data) {
                    const result = response.data.data;
                    if (result.length > 0) {
                        setInputOptions((prev) => {
                            return { ...prev, floor: result };
                        });
                    } else {
                        setInputOptions((prev) => {
                            return { ...prev, floor: [] };
                        });
                    }
                }
                setLoadingParam((prev) => {
                    return { ...prev, floor: false };
                });
            })
            .catch((err) => {
                setLoadingParam((prev) => {
                    return { ...prev, floor: false };
                });
            });
    }, []);

    // get incident categories
    const getCategories = useCallback(() => {
        setLoadingParam((prev) => {
            return { ...prev, category: true };
        });
        let config = {
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_INCIDENT_GET_CATEGORIES,
            method: "post",
            headers: {
                authorization: getToken(),
            },
        };
        axios(config)
            .then((response) => {
                if (response.data.data) {
                    let result = response.data.data;
                    if (result.length > 0) {
                        result = result.filter(
                            (category) => category.name.toLowerCase() !== "all"
                        );
                        setInputOptions((prev) => {
                            return { ...prev, category: result };
                        });
                    } else {
                        setInputOptions((prev) => {
                            return { ...prev, category: result };
                        });
                    }
                }
                setLoadingParam((prev) => {
                    return { ...prev, category: false };
                });
            })
            .catch((err) => {
                setLoadingParam((prev) => {
                    return { ...prev, category: false };
                });
            });
    }, []);

    // get priority & severity categories
    const getPrioritySeverity = useCallback(() => {
        setLoadingParam((prev) => {
            return { ...prev, prioritySeverity: true };
        });
        let config = {
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_INCIDENT_GET_PRIORITY,
            method: "post",
            headers: {
                authorization: getToken(),
            },
        };
        axios(config)
            .then((response) => {
                if (response.data) {
                    const result = response.data;
                    if (result.length > 0) {
                        setInputOptions((prev) => {
                            return {
                                ...prev,
                                priority: result,
                                severity: result,
                            };
                        });
                    } else {
                        setInputOptions((prev) => {
                            return { ...prev, priority: [], severity: [] };
                        });
                    }
                }
                setLoadingParam((prev) => {
                    return { ...prev, prioritySeverity: false };
                });
            })
            .catch((err) => {
                setLoadingParam((prev) => {
                    return { ...prev, prioritySeverity: false };
                });
            });
    }, []);

    // get assets as filters
    const getAssets = useCallback(() => {
        setLoadingParam((prev) => {
            return { ...prev, asset: true };
        });
        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_INCIDENT_GET_ASSETS,
            headers: {
                authorization: getToken(),
            },
        };
        axios(config)
            .then((response) => {
                if (response.data.data) {
                    setInputOptions((prev) => {
                        prev.assetNo = response.data.data;
                        return { ...prev };
                    });
                }
                setLoadingParam((prev) => {
                    return { ...prev, asset: false };
                });
            })
            .catch((error) => {
                setLoadingParam((prev) => {
                    return { ...prev, asset: false };
                });
            });
    }, []);

    // get rooms
    const getRooms = useCallback(() => {
        setLoadingParam((prev) => {
            return { ...prev, room: true };
        });
        const formData = new FormData();
        if (isEdit) {
            formData.append("floor_name", incidentData.floor);
        } else {
            formData.append("floor_name", inputData.floor);
        }

        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_INCIDENT_GET_ROOMS,
            headers: {
                authorization: getToken(),
            },
            data: formData,
        };

        axios(config)
            .then((response) => {
                if (response.data.data) {
                    setInputOptions((prev) => {
                        prev.room = response.data.data;
                        return { ...prev };
                    });
                }
                setLoadingParam((prev) => {
                    return { ...prev, room: false };
                });
            })
            .catch((err) => {
                // console.log(err);
                setLoadingParam((prev) => {
                    return { ...prev, room: false };
                });
            });
    }, [inputData.floor, incidentData, isEdit]);

    useEffect(() => {
        getAssets();
        getCategories();
        getFloors();
        getPrioritySeverity();
    }, [getCategories, getFloors, getPrioritySeverity, getAssets]);

    useEffect(() => {
        if (inputData.floor) {
            getRooms();
        } else {
            setInputOptions((prev) => {
                prev.room = [];
                return { ...prev };
            });
        }
    }, [inputData.floor, getRooms, , incidentData, isEdit]);

    // process if its an edit
    useEffect(() => {
        if (isEdit) {
            let tempData = incidentData;
            tempData.imageOldPath = incidentData.image_location;
            tempData.assetNo = incidentData.asset_number;
            tempData.time = tempData.incident_time_initial;
            tempData.imagePreview = "";
            setInputData({ ...tempData });
            if (incidentData.room) {
                setDisableRoom(false);
            }
        }
    }, [isEdit, incidentData]);

    return isEdit ? (
        isShowing ? (
            // Edit incident
            <ModalContainer
                title='Edit Incident'
                isShowing={isShowing}
                hide={hide}
                submitName='Submit'
                onSubmit={handleSubmitEdit}
                clearName='Clear'
                onClear={handleResetEdit}
                isLoading={loadingButton}
                showRequired={true}>
                <div className='incident-form-container'>
                    <LoadingUploadFile percentage={progressBarUpload} />
                    <form
                        id='incident-input'
                        onSubmit={handleSubmitEdit}
                        className='incident-form-container__body'>
                        <div className='upper-input'>
                            <InputDropdownVertical
                                width='120px'
                                name='floor'
                                label='Floor'
                                value={inputData.floor}
                                options={inputOptions.floor}
                                onChange={handleChange}
                                isRequired={true}
                                isLoading={loadingParam.floor}
                            />
                            <InputDropdownVertical
                                width='120px'
                                name='room'
                                label='Room'
                                value={inputData.room}
                                options={inputOptions.room}
                                onChange={handleChange}
                                isRequired={true}
                                isDisabled={disableRoom}
                                isLoading={loadingParam.room}
                            />
                            <InputDropdownVertical
                                width='120px'
                                name='category'
                                label='Category'
                                value={inputData.category_id}
                                options={inputOptions.category}
                                onChange={handleChange}
                                isRequired={true}
                                isLoading={loadingParam.category}
                            />
                            <div className='submitter'>
                                <label className='submitter__label'>
                                    Submitter
                                </label>
                                <div className='submitter__value'>
                                    {inputData.submitter}
                                </div>
                            </div>
                        </div>
                        <div className='middle-input'>
                            <InputDatetimeVertical
                                width='250px'
                                name='time'
                                label='Incident Datetime'
                                value={formatDate(inputData.time)}
                                onChange={handleChange}
                                isLogin={false}
                                isRequired={true}
                                clearData={() => clearData("time")}
                            />
                            <InputTextAutoSuggestVertical
                                width='120px'
                                name='assetNo'
                                label='Asset Number'
                                value={inputData.assetNo}
                                options={inputOptions.assetNo}
                                onChange={handleChange}
                                inputWidth='120px'
                                validateInput={validateAsset}
                                isRequired={requiredAsset}
                                onClear={handleClearAsset}
                                isLoading={loadingParam.asset}
                            />
                            <InputDropdownVertical
                                width='120px'
                                name='priority'
                                label='Priority'
                                value={inputData.priority}
                                options={inputOptions.priority}
                                onChange={handleChange}
                                isRequired={true}
                                isLoading={loadingParam.prioritySeverity}
                            />
                            <InputDropdownVertical
                                width='120px'
                                name='severity'
                                label='Severity'
                                value={inputData.severity}
                                options={inputOptions.severity}
                                onChange={handleChange}
                                isRequired={true}
                                isLoading={loadingParam.prioritySeverity}
                            />
                        </div>
                        <div
                            className='lower-input'
                            style={{ marginBottom: "10px" }}>
                            <InputTextAreaVertical
                                height='175px'
                                width='100%'
                                name='remark'
                                label='Remark'
                                value={inputData.remark}
                                onChange={handleChange}
                                isLogin={false}
                                isRequired={true}
                            />
                            <div className='incident-form-image-container'>
                                <UploadPhoto
                                    height='180px'
                                    width='150px'
                                    defaultImage={
                                        inputData.imageOldPath
                                            ? inputData.imagePreview
                                                ? inputData.imagePreview
                                                : `${ReturnHostBackend(
                                                      process.env
                                                          .REACT_APP_BACKEND_NODELINX
                                                  )}/filerepository/dcim/uploadFileFromAPI/` +
                                                  inputData.imageOldPath
                                            : dummyImage
                                    }
                                    onUpload={(photoFile) => {
                                        handleChangePhoto(photoFile);
                                    }}
                                    triggerClear={inputData.image_location}
                                />
                            </div>
                        </div>
                    </form>
                </div>
            </ModalContainer>
        ) : null
    ) : (
        // Add new incident
        <div className='incident-form-container'>
            {isEdit ? null : (
                <div className='incident-form-container__header'>
                    <div>Input Incident</div>
                </div>
            )}
            <LoadingUploadFile percentage={progressBarUpload} />
            <form
                id='incident-input'
                onSubmit={isEdit ? handleSubmitEdit : handleSubmit}
                className='incident-form-container__body'
                style={isEdit ? {} : { padding: "20px" }}>
                <div className='upper-input'>
                    <InputDropdownVertical
                        width='120px'
                        name='floor'
                        label='Floor'
                        value={inputData.floor}
                        options={inputOptions.floor}
                        onChange={handleChange}
                        isRequired={true}
                        isLoading={loadingParam.floor}
                    />
                    <InputDropdownVertical
                        width='120px'
                        name='room'
                        label='Room'
                        value={inputData.room}
                        options={inputOptions.room}
                        onChange={handleChange}
                        isRequired={true}
                        isDisabled={disableRoom}
                        isLoading={loadingParam.room}
                    />
                    <InputDropdownVertical
                        width='120px'
                        name='category'
                        label='Category'
                        value={inputData.category}
                        options={inputOptions.category}
                        onChange={handleChange}
                        isRequired={true}
                        isLoading={loadingParam.category}
                    />
                    <div className='submitter'>
                        <label className='submitter__label'>Submitter</label>
                        <div className='submitter__value'>
                            {inputData.submitter}
                        </div>
                    </div>
                </div>
                <div className='middle-input'>
                    <InputDatetimeVertical
                        width='250px'
                        name='time'
                        label='Incident Datetime'
                        value={inputData.time}
                        onChange={handleChange}
                        isLogin={false}
                        isRequired={true}
                        clearData={() => clearData("time")}
                    />
                    <InputTextAutoSuggestVertical
                        width='120px'
                        name='assetNo'
                        label='Asset Number'
                        value={inputData.assetNo}
                        options={inputOptions.assetNo}
                        onChange={handleChange}
                        inputWidth='120px'
                        validateInput={validateAsset}
                        isRequired={requiredAsset}
                        onClear={handleClearAsset}
                        isLoading={loadingParam.asset}
                    />
                    <InputDropdownVertical
                        width='120px'
                        name='priority'
                        label='Priority'
                        value={inputData.priority}
                        options={inputOptions.priority}
                        onChange={handleChange}
                        isRequired={true}
                        isLoading={loadingParam.prioritySeverity}
                    />
                    <InputDropdownVertical
                        width='120px'
                        name='severity'
                        label='Severity'
                        value={inputData.severity}
                        options={inputOptions.severity}
                        onChange={handleChange}
                        isRequired={true}
                        isLoading={loadingParam.prioritySeverity}
                    />
                </div>
                <div className='lower-input'>
                    <InputTextAreaVertical
                        height='175px'
                        width='100%'
                        name='remark'
                        label='Remark'
                        value={inputData.remark}
                        onChange={handleChange}
                        isLogin={false}
                        isRequired={true}
                    />
                    <div className='incident-form-image-container'>
                        <UploadPhoto
                            height='180px'
                            width='150px'
                            defaultImage={inputData.imagePreview || dummyImage}
                            onUpload={(photoFile) => {
                                handleChangePhoto(photoFile);
                            }}
                            triggerClear={inputData.image}
                        />
                    </div>
                </div>
                <div style={{ textAlign: "left", fontSize: "14px" }}>
                    *Required
                </div>
                <div className='button-container'>
                    <ButtonSubmit
                        name='Submit'
                        formId='incident-input'
                        isLoading={loadingButton}
                    />
                    <ButtonClear name='Clear' onClear={handleClear} />
                </div>
            </form>
        </div>
    );
};

export default IncidentForm;

const formatDate = (dateVal) => {
    var newDate = new Date(dateVal);

    var sMonth = padValue(newDate.getMonth() + 1);
    var sDay = padValue(newDate.getDate());
    var sYear = newDate.getFullYear();
    var sHour = newDate.getHours();
    var sMinute = padValue(newDate.getMinutes());

    sHour = padValue(sHour);

    return sYear + "-" + sMonth + "-" + sDay + "T" + sHour + ":" + sMinute;
};

const padValue = (value) => {
    return value < 10 ? "0" + value : value;
};
