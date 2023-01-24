// System library imports
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

// Custom library imports
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { getToken } from "../../../TokenParse/TokenParse";
import {
    InputTextAutoSuggestVertical,
    ModalContainer,
    ModalDelete,
    useModal,
    getUAC,
    getUACWithoutToast,
} from "../../../ComponentReuseable/index";
import { IsRackType } from "./Validation";

const EditPowerSourceModal = (props) => {
    // Destructure props
    let { isShowing, toggle, asset, filter, setTriggerGetPowerSourceAsset } =
        props;

    // Modals
    const { isShowing: isShowingDeletePopup, toggle: toggleDeletePopup } =
        useModal();

    // States
    const [selectedAssetNumber, setSelectedAssetNumber] = useState("");
    const [assetOptions, setAssetOptions] = useState([]);
    const [isValidInput, setIsValidInput] = useState(false);
    const [isLoading, setIsLoading] = useState({
        update: false,
        remove: false,
    });

    // Side-effects
    // Get all asset numbers with function = Power System on component load
    useEffect(() => {
        if (isShowing) {
            // Internal variable
            let cancelToken = axios.CancelToken.source();
            let mounted = true;

            // Internal function
            const getPowerSystemAssets = async () => {
                // Call JDBC query to get all asset numbers with type = 'Power System'
                let config = {
                    method: "post",
                    url:
                        ReturnHostBackend(process.env.REACT_APP_JDBC) +
                        process.env
                            .REACT_APP_POWER_GET_POWER_SYSTEM_ASSET_NUMBERS,
                    headers: {
                        authorization: getToken(),
                    },
                    cancelToken: cancelToken.token,
                };

                try {
                    const result = await axios(config);

                    if (result.status === 200) {
                        let { data } = result;

                        if (data.count > 0) {
                            let { data: queryData } = data;

                            queryData = queryData.map(
                                (row) => row.asset_number
                            );

                            if (mounted) {
                                setAssetOptions(queryData);

                                if (asset && queryData.includes(asset.number)) {
                                    setSelectedAssetNumber(asset.number);
                                    setIsValidInput(
                                        queryData &&
                                            queryData.length > 0 &&
                                            queryData.includes(asset.number)
                                    );
                                }
                            }
                        } else {
                            if (mounted) {
                                setAssetOptions([]);
                            }
                        }
                    } else {
                        toast.error(
                            "Error getting power system asset numbers data",
                            { toastId: "error-get-ps-asset-num" }
                        );
                    }
                } catch (e) {
                    if (!axios.isCancel(e)) {
                        toast.error(
                            "Error calling API to get power system asset numbers",
                            { toastId: "error-get-ps-asset-num" }
                        );
                    }
                }
            };

            (async () => {
                await getPowerSystemAssets();
            })();

            return () => {
                cancelToken.cancel();
                mounted = false;
            };
        }
    }, [asset, isShowing]);

    // Functions
    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === "asset-number") {
            setSelectedAssetNumber(value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (getUAC("edit")) {
            if (isValidInput) {
                (async () => {
                    // Set isLoading to TRUE
                    setIsLoading((prevState) => {
                        return { ...prevState, update: true };
                    });

                    // Call JDBC query to update assigned power meter
                    let config = {
                        method: "post",
                        url:
                            ReturnHostBackend(process.env.REACT_APP_JDBC) +
                            process.env
                                .REACT_APP_POWER_UPDATE_ASSIGNED_POWER_METER,
                        headers: {
                            authorization: getToken(),
                        },
                        data: {
                            power_source_type_id:
                                filter.powerSourceType === null ||
                                filter.powerSourceType === undefined
                                    ? ""
                                    : filter.powerSourceType.id,
                            power_type_id:
                                filter.powerType === null ||
                                filter.powerType === undefined
                                    ? ""
                                    : filter.powerType.id,
                            child_id:
                                filter.child === null ||
                                filter.child === undefined
                                    ? ""
                                    : filter.child.id,
                            rack_id:
                                IsRackType(filter.powerType) &&
                                filter.rack &&
                                filter.rack.id
                                    ? filter.rack.id
                                    : "",
                            pdu_id:
                                IsRackType(filter.powerType) &&
                                filter.pdu &&
                                filter.pdu.id
                                    ? filter.pdu.id
                                    : "",
                            asset_number: selectedAssetNumber,
                        },
                    };

                    try {
                        const result = await axios(config);

                        if (result.status === 200) {
                            let { data } = result;

                            if (data.count > 0) {
                                toast.success(
                                    "Successfully updated assigned power meter"
                                );

                                setTriggerGetPowerSourceAsset(
                                    (prevState) => !prevState
                                );

                                // Reset state
                                resetState();

                                // Hide popup
                                toggle();
                            } else {
                                toast.error(
                                    "Error updating assigned power meter",
                                    { toastId: "error-update-pm" }
                                );

                                // Set isLoading to FALSE
                                setIsLoading((prevState) => {
                                    return { ...prevState, update: false };
                                });
                            }
                        } else {
                            toast.error("Error updating assigned power meter", {
                                toastId: "error-update-pm",
                            });

                            // Set isLoading to FALSE
                            setIsLoading((prevState) => {
                                return { ...prevState, update: false };
                            });
                        }
                    } catch (e) {
                        toast.error(
                            "Error calling API to update assigned power meter",
                            { toastId: "error-update-pm" }
                        );

                        // Set isLoading to FALSE
                        setIsLoading((prevState) => {
                            return { ...prevState, update: false };
                        });
                    }
                })();
            } else {
                toast.error("Invalid asset number", {
                    toastId: "invalid-asset-number",
                });
            }
        }
    };

    const handleDelete = (e) => {
        e.preventDefault();

        (async () => {
            // Set isLoading to TRUE
            setIsLoading((prevState) => {
                return { ...prevState, remove: true };
            });

            // Call JDBC query to remove assigned power meter
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_JDBC) +
                    process.env.REACT_APP_POWER_REMOVE_POWER_METER,
                headers: {
                    authorization: getToken(),
                },
                data: {
                    power_source_type_id:
                        filter.powerSourceType === null ||
                        filter.powerSourceType === undefined
                            ? ""
                            : filter.powerSourceType.id,
                    power_type_id:
                        filter.powerType === null ||
                        filter.powerType === undefined
                            ? ""
                            : filter.powerType.id,
                    child_id:
                        filter.child === null || filter.child === undefined
                            ? ""
                            : filter.child.id,
                    rack_id: IsRackType(filter.powerType)
                        ? filter.rack
                            ? filter.rack.id
                            : ""
                        : "",
                    pdu_id:
                        IsRackType(filter.powerType) &&
                        filter.pdu &&
                        filter.pdu.id
                            ? filter.pdu.id
                            : "",
                },
            };

            try {
                const result = await axios(config);

                if (result.status === 200) {
                    let { data } = result;

                    if (data.count > 0) {
                        toast.success(
                            "Successfully removed assigned power meter"
                        );

                        setTriggerGetPowerSourceAsset(
                            (prevState) => !prevState
                        );

                        // Reset state
                        resetState();

                        // Hide delete popup
                        toggleDeletePopup();

                        // Hide popup
                        toggle();
                    } else {
                        toast.error("Error removing assigned power meter", {
                            toastId: "error-remove-pm",
                        });

                        // Set isLoading to FALSE
                        setIsLoading((prevState) => {
                            return { ...prevState, remove: false };
                        });
                    }
                } else {
                    toast.error("Error removing assigned power meter", {
                        toastId: "error-remove-pm",
                    });

                    // Set isLoading to FALSE
                    setIsLoading((prevState) => {
                        return { ...prevState, remove: false };
                    });
                }
            } catch (e) {
                toast.error(
                    "Error calling API to remove assigned power meter",
                    { toastId: "error-remove-pm" }
                );

                // Set isLoading to FALSE
                setIsLoading((prevState) => {
                    return { ...prevState, remove: false };
                });
            }
        })();
    };

    const resetState = () => {
        setAssetOptions([]);
        setSelectedAssetNumber("");
        setIsValidInput(false);
        setIsLoading({
            update: false,
            remove: false,
        });
    };

    const hide = () => {
        // Reset state
        resetState();

        // Hide popup
        toggle();
    };

    const validateAssetNumber = (e) => {
        let { value } = e.target;

        if (assetOptions.includes(value)) {
            setIsValidInput(true);
        } else {
            setSelectedAssetNumber("");
            setIsValidInput(false);
            toast.error("Invalid asset number", {
                toastId: "invalid-asset-number",
            });
        }
    };

    return (
        <React.Fragment>
            <ModalDelete
                isShowing={isShowingDeletePopup}
                hide={toggleDeletePopup}
                deletedObjectType='Power Meter'
                deletedObjectName={asset ? asset.number : ""}
                onDelete={handleDelete}
                isLoading={isLoading.remove}
                level={2}
            />
            <ModalContainer
                title={`Edit Power Meter`}
                isShowing={isShowing}
                hide={hide}
                submitName={getUACWithoutToast("edit") ? "Update" : undefined}
                formId={
                    getUACWithoutToast("edit") ? "power-source-form" : undefined
                }
                clearName={getUACWithoutToast("delete") ? "Remove" : undefined}
                onClear={
                    getUACWithoutToast("delete")
                        ? () => {
                              toggleDeletePopup();
                          }
                        : undefined
                }
                isLoading={isLoading.update}>
                <form
                    id='power-source-form'
                    className='power-source-form'
                    onSubmit={handleSubmit}>
                    <InputTextAutoSuggestVertical
                        width='200px'
                        name='asset-number'
                        label='Asset Number'
                        value={selectedAssetNumber}
                        options={assetOptions}
                        onChange={handleChange}
                        onClear={() => {
                            setSelectedAssetNumber("");
                        }}
                        validateInput={validateAssetNumber}
                        isDisabled={!assetOptions || assetOptions.length <= 0}
                        isRequired={true}
                    />
                </form>
            </ModalContainer>
        </React.Fragment>
    );
};

export default EditPowerSourceModal;
