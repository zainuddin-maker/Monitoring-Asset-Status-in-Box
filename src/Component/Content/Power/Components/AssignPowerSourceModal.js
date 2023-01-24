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
} from "../../../ComponentReuseable/index";
import { IsRackType } from "./Validation";

const AssignPowerSourceModal = (props) => {
    // Destructure props {
    let { isShowing, toggle, filter, setTriggerGetPowerSourceAsset } = props;

    // States
    const [selectedAssetNumber, setSelectedAssetNumber] = useState("");
    const [assetOptions, setAssetOptions] = useState([]);
    const [isValidInput, setIsValidInput] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
    }, [isShowing]);

    // Functions
    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === "asset-number") {
            setSelectedAssetNumber(value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Prepare variable
        let rackPduId = null;

        const insertPowerMeter = async () => {
            // Call JDBC query to insert power meter
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_JDBC) +
                    process.env.REACT_APP_POWER_INSERT_NEW_POWER_METER,
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
                        if (!IsRackType(filter.powerType)) {
                            toast.success("Successfully assigned power meter");
                        } else {
                            let { data: queryData } = data;
                            rackPduId = queryData[0].power_configuration_id;
                        }
                    } else {
                        toast.error("Power meter already assigned", {
                            toastId: "error-assign-pm",
                        });
                    }
                } else {
                    toast.error("Error assigning power meter", {
                        toastId: "error-assign-pm",
                    });
                }
            } catch (e) {
                toast.error("Error calling API to assign power meter", {
                    toastId: "error-assign-pm",
                });
            }
        };

        const assignPowerMeterToRack = async (rackPduId) => {
            // Validate input
            if (!rackPduId) {
                return;
            }

            // Call JDBC query to assign the power meter to the rack
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_JDBC) +
                    process.env.REACT_APP_POWER_ASSIGN_POWER_METER_TO_RACK,
                headers: {
                    authorization: getToken(),
                },
                data: {
                    power_source_type_id:
                        filter.powerSourceType === null ||
                        filter.powerSourceType === undefined
                            ? ""
                            : filter.powerSourceType.id,
                    rack_id:
                        filter.rack && filter.rack.id ? filter.rack.id : "",
                    power_configuration_id: filter.pdu ? filter.pdu.id : "",
                    rack_pdu_id: rackPduId ? rackPduId : "",
                },
            };

            try {
                const result = await axios(config);

                if (result.status === 200) {
                    let { data } = result;

                    if (data.count > 0) {
                        toast.success(
                            "Successfully assigned power meter to the rack"
                        );
                    } else {
                        toast.error(
                            "Power meter already assigned to this rack",
                            { toastId: "error-assign-pm-to-rack" }
                        );
                    }
                } else {
                    toast.error("Error assigning power meter to the rack", {
                        toastId: "error-assign-pm-to-rack",
                    });
                }
            } catch (e) {
                toast.error("Error calling API to assign power meter to rack", {
                    toastId: "error-assign-pm-to-rack",
                });
            }
        };

        if (isValidInput) {
            (async () => {
                // Set isLoading to TRUE
                setIsLoading(true);

                try {
                    // Assign a new power meter
                    await insertPowerMeter();

                    // Assign the new power meter to the rack
                    if (IsRackType(filter.powerType)) {
                        if (filter.rack) {
                            await assignPowerMeterToRack(rackPduId);
                        } else {
                            toast.error("Invalid rack ID", {
                                toastId: "error-assign-pm-to-rack",
                            });
                        }
                    }

                    setTriggerGetPowerSourceAsset((prevState) => !prevState);

                    // Reset state
                    resetState();

                    // Hide popup
                    toggle();
                } catch (e) {
                    // Set isLoading to FALSE
                    setIsLoading(false);
                }
            })();
        } else {
            toast.error("Invalid asset number", {
                toastId: "invalid-asset-number",
            });
        }
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

    const resetState = () => {
        setAssetOptions([]);
        setSelectedAssetNumber("");
        setIsValidInput(false);
        setIsLoading(false);
    };

    const hide = () => {
        // Reset state
        resetState();

        // Hide popup
        toggle();
    };

    return (
        <ModalContainer
            title={`Assign Power Meter`}
            isShowing={isShowing}
            hide={hide}
            submitName={"Submit"}
            formId='power-source-form'
            isLoading={isLoading}>
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
    );
};

export default AssignPowerSourceModal;
