// System library imports
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

// Custom library imports
import AssignPowerSourceModal from "./AssignPowerSourceModal";
import EditPowerSourceModal from "./EditPowerSourceModal";
import PowerCard from "./PowerCard";
import { EnumPowerManagement, EnergyConsumptionPer, chartMenu } from "./Enums";
import {
    ButtonSubmit,
    Tooltip,
    useModal,
    LoadingData,
    // getUAC,
    getUACWithoutToast,
    // InputDropdownHorizontal,
} from "../../../ComponentReuseable/index";
import {
    IsAllOption,
    IsTotalChildrenOption,
    IsTotalPduOption,
    IsRackType,
    IsParentType,
} from "./Validation";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { getToken } from "../../../TokenParse/TokenParse";

// Image imports
import writeIcon from "../../../../svg/write-icon-no-padding.svg";

// Constants
const REFRESH_PERIOD_MS = 5000; // 5s
const REFRESH_LOADING_THRESHOLD_MS = 10000; // 10s

// Functions
const round = (num) => {
    let m = Number((Math.abs(num) * 100).toPrecision(15));
    return (Math.round(m) / 100) * Math.sign(num);
};

const normalizeValueUnit = (value, unit) => {
    // Validate input
    if (
        isNaN(value) ||
        value === undefined ||
        value === null ||
        !unit ||
        (unit && unit.length <= 0)
    ) {
        return { value, unit };
    }

    // Check the first character (case sensitive)
    let currentPrefix = unit[0];
    let newValue = value;
    let newUnit = unit;

    switch (currentPrefix) {
        case "M": // 10^6
            if (Math.abs(value) >= 0.001 && Math.abs(value) < 1) {
                newValue = newValue * 1e3;
                newUnit = "k" + unit.slice(1);
            } else if (Math.abs(value) < 0.001) {
                newValue = newValue * 1e6;
                newUnit = unit.slice(1);
            }
            break;
        case "k": // 10^3
            if (Math.abs(value) / 1e3 >= 1) {
                newValue = newValue / 1e3;
                newUnit = "M" + unit.slice(1);
            } else if (Math.abs(value) < 1) {
                newValue = newValue * 1e3;
                newUnit = unit.slice(1);
            }
            break;
        default:
            if (Math.abs(value) / 1e6 >= 1) {
                newValue = newValue / 1e6;
                newUnit = "M" + unit;
            } else if (Math.abs(value) / 1e3 >= 1) {
                newValue = newValue / 1e3;
                newUnit = "k" + unit;
            }
            break;
    }

    return {
        value: round(newValue),
        unit: newUnit,
    };
};

const EnergyConsumption = (props) => {
    // Destructure props
    let {
        filter,
        // setFilter,
        asset,
        units,
        menu,
        setTriggerGetPowerSourceAsset,
    } = props;

    // Modal
    const { isShowing: isShowingAssignPS, toggle: toggleAssignPS } = useModal();
    const { isShowing: isShowingEditPS, toggle: toggleEditPS } = useModal();

    // States
    // const [pduOptions, setPduOptions] = useState([]);
    const [runningPowerSource, setRunningPowerSource] = useState(null);
    const [energyConsumption, setEnergyConsumption] = useState({
        today: null,
        wtd: null,
        mtd: null,
    });
    const [parameterCards, setParameterCards] = useState([]);
    const [powerEnergyCards, setPowerEnergyCards] = useState([
        {
            title: "Active",
            value: "---",
            unit: "W",
        },
        {
            title: "Reactive",
            value: "---",
            unit: "VAR",
        },
        {
            title: "Apparent",
            value: "---",
            unit: "VA",
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    // const [isLoadingInput, setIsLoadingInput] = useState(false);

    // Functions
    // const handlePduChange = (e) => {
    //     let { name, value } = e.target;

    //     if (name === "pdu") {
    //         setFilter((prevState) => {
    //             return {
    //                 ...prevState,
    //                 pdu: pduOptions.find(
    //                     (option) => option.id === parseInt(value)
    //                 ),
    //             };
    //         });
    //     }
    // };

    // Side-effects
    // // Get PDUs
    // useEffect(() => {
    //     // Internal variable
    //     let cancelToken = axios.CancelToken.source();
    //     let mounted = true;

    //     // Get PDUs based on rack and power source type
    //     const getPdu = async (powerSourceType, rack) => {
    //         // Call service to get asset's energy
    //         let config = {
    //             method: "post",
    //             url:
    //                 ReturnHostBackend(process.env.REACT_APP_JDBC) +
    //                 process.env.REACT_APP_POWER_GET_PDU,
    //             headers: {
    //                 authorization: getToken(),
    //             },
    //             data: {
    //                 power_source_type_id:
    //                     IsAllOption(powerSourceType) || !powerSourceType
    //                         ? ""
    //                         : powerSourceType.id,
    //                 rack_id: rack ? rack.id : "",
    //             },
    //             cancelToken: cancelToken.token,
    //         };

    //         try {
    //             const result = await axios(config);

    //             if (result.status === 200) {
    //                 let { data } = result;

    //                 if (data.count > 0) {
    //                     let { data: queryData } = data;

    //                     if (mounted) {
    //                         setFilter((prevState) => {
    //                             return {
    //                                 ...prevState,
    //                                 pdu: queryData[0],
    //                             };
    //                         });
    //                         setPduOptions(queryData);
    //                     }
    //                 } else {
    //                     // Set empty data
    //                     if (mounted) {
    //                         setFilter((prevState) => {
    //                             return {
    //                                 ...prevState,
    //                                 pdu: null,
    //                             };
    //                         });
    //                         setPduOptions([]);
    //                     }
    //                 }
    //             } else {
    //                 toast.error("Error getting pdu data", {
    //                     toastId: "error-get-pdu",
    //                 });
    //             }
    //         } catch (e) {
    //             if (!axios.isCancel(e)) {
    //                 toast.error("Error calling API to get pdu data", {
    //                     toastId: "error-get-pdu",
    //                 });
    //             }
    //         }
    //     };

    //     if (filter.rack) {
    //         (async () => {
    //             // Set isLoading to TRUE
    //             setIsLoadingInput(true);

    //             if (
    //                 !IsAllOption(filter.powerSourceType) &&
    //                 IsRackType(filter.powerType) &&
    //                 filter.rack
    //             ) {
    //                 await getPdu(filter.powerSourceType, filter.rack);
    //             } else {
    //                 // Set empty data
    //                 if (mounted) {
    //                     setFilter((prevState) => {
    //                         return {
    //                             ...prevState,
    //                             pdu: null,
    //                         };
    //                     });
    //                     setPduOptions([]);
    //                 }
    //             }

    //             // Set isLoading to FALSE
    //             setIsLoadingInput(false);
    //         })();
    //     }

    //     return () => {
    //         cancelToken.cancel();
    //         mounted = false;
    //     };
    // }, [filter.powerSourceType, filter.powerType, filter.rack, setFilter]);

    // Get values & parameter based on the power source's asset
    useEffect(() => {
        // Internal variable
        let interval = null;
        let cancelToken = axios.CancelToken.source();
        let mounted = true;
        let count = 0;
        let loadingTimer = null;

        // Internal function
        const getEnergyConsumption = async (
            powerSourceType,
            powerType,
            child,
            rack,
            pdu
        ) => {
            if (
                (IsParentType(powerType) && !child) ||
                (IsRackType(powerType) && !rack)
            ) {
                // Set empty data
                if (mounted) {
                    setEnergyConsumption({
                        today: null,
                        wtd: null,
                        mtd: null,
                    });
                }
            } else {
                // Call service to get asset's energy
                let config = {
                    method: "post",
                    url:
                        ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                        process.env.REACT_APP_POWER_GET_LATEST_ENERGY,
                    headers: {
                        authorization: getToken(),
                    },
                    data: {
                        power_source_type_id:
                            IsAllOption(powerSourceType) || !powerSourceType
                                ? ""
                                : powerSourceType.id,
                        power_type_id: powerType ? powerType.id : "",
                        rack_id: rack ? rack.id : "",
                        child_id:
                            child === null || child === undefined
                                ? ""
                                : IsTotalChildrenOption(child)
                                ? ""
                                : child.id,
                        pdu_id:
                            pdu === null || pdu === undefined
                                ? ""
                                : IsTotalPduOption(pdu)
                                ? ""
                                : pdu.id,
                        parent_id: IsParentType(powerType) ? powerType.id : "",
                    },
                    cancelToken: cancelToken.token,
                };

                try {
                    const result = await axios(config);

                    if (result.status === 200) {
                        let { data } = result;

                        if (data.count > 0) {
                            let { data: queryData } = data;

                            if (mounted) {
                                setEnergyConsumption({
                                    today: queryData[0].today,
                                    wtd: queryData[0].week_to_date,
                                    mtd: queryData[0].month_to_date,
                                });
                            }
                        } else {
                            // Set empty data
                            if (mounted) {
                                setEnergyConsumption({
                                    today: null,
                                    wtd: null,
                                    mtd: null,
                                });
                            }
                        }
                    } else {
                        toast.error("Error getting latest energy", {
                            toastId: "error-get-energy",
                        });
                    }
                } catch (e) {
                    if (!axios.isCancel(e)) {
                        toast.error("Error calling API to get latest energy", {
                            toastId: "error-get-energy",
                        });
                    }
                }
            }
        };

        const getParameters = async (asset, powerSourceType, child, pdu) => {
            if (
                IsAllOption(powerSourceType) ||
                IsTotalChildrenOption(filter.child) ||
                IsTotalPduOption(filter.pdu)
            ) {
                // Set empty parameters
                if (mounted) {
                    setParameterCards([
                        {
                            title: "Voltage RMS",
                            value: "---",
                            unit: "",
                        },
                        {
                            title: "Current RMS",
                            value: "---",
                            unit: "",
                        },
                        {
                            title: "Power Factor",
                            value: "---",
                            unit: "",
                        },
                        {
                            title: "Frequency",
                            value: "---",
                            unit: "",
                        },
                    ]);
                }
            } else {
                if (asset && asset.name) {
                    // Call service to get asset's parameters
                    let config = {
                        method: "post",
                        url:
                            ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                            process.env.REACT_APP_POWER_GET_LATEST_PARAMETERS,
                        headers: {
                            authorization: getToken(),
                        },
                        data: {
                            asset_number: asset.number,
                        },
                        cancelToken: cancelToken.token,
                    };

                    try {
                        const result = await axios(config);

                        if (result.status === 200) {
                            let { data } = result;

                            if (mounted) {
                                setParameterCards([
                                    {
                                        title: "Voltage RMS",
                                        value:
                                            !isNaN(data.voltageRMS) &&
                                            data.voltageRMS !== ""
                                                ? normalizeValueUnit(
                                                      data.voltageRMS,
                                                      units.voltage_rms
                                                  ).value
                                                : "---",
                                        unit: units.voltage_rms
                                            ? normalizeValueUnit(
                                                  data.voltageRMS,
                                                  units.voltage_rms
                                              ).unit
                                            : "",
                                    },
                                    {
                                        title: "Current RMS",
                                        value:
                                            !isNaN(data.currentRMS) &&
                                            data.currentRMS !== ""
                                                ? normalizeValueUnit(
                                                      data.currentRMS,
                                                      units.current_rms
                                                  ).value
                                                : "---",
                                        unit: units.current_rms
                                            ? normalizeValueUnit(
                                                  data.currentRMS,
                                                  units.current_rms
                                              ).unit
                                            : "",
                                    },
                                    {
                                        title: "Power Factor",
                                        value:
                                            !isNaN(data.powerFactor) &&
                                            data.powerFactor !== ""
                                                ? normalizeValueUnit(
                                                      data.powerFactor,
                                                      units.power_factor
                                                  ).value
                                                : "---",
                                        unit: units.power_factor
                                            ? normalizeValueUnit(
                                                  data.powerFactor,
                                                  units.power_factor
                                              ).unit
                                            : "",
                                    },
                                    {
                                        title: "Frequency",
                                        value:
                                            !isNaN(data.frequency) &&
                                            data.frequency !== ""
                                                ? normalizeValueUnit(
                                                      data.frequency,
                                                      units.frequency
                                                  ).value
                                                : "---",
                                        unit: units.frequency
                                            ? normalizeValueUnit(
                                                  data.frequency,
                                                  units.frequency
                                              ).unit
                                            : "",
                                    },
                                ]);
                            }
                        } else {
                            toast.error("Error getting latest parameters", {
                                toastId: "error-get-param",
                            });
                        }
                    } catch (e) {
                        if (!axios.isCancel(e)) {
                            toast.error(
                                "Error calling API to get latest parameters",
                                {
                                    toastId: "error-get-param",
                                }
                            );
                        }
                    }
                } else {
                    if (mounted) {
                        setParameterCards([]);
                    }
                }
            }
        };

        const getPowerOrEnergy = async (
            asset,
            powerSourceType,
            powerType,
            child,
            rack,
            pdu,
            menu
        ) => {
            if (
                (IsParentType(powerType) && !child) ||
                (IsRackType(powerType) && !rack)
            ) {
                if (mounted) {
                    setPowerEnergyCards([
                        {
                            title: "Active",
                            value: "---",
                            unit: menu === chartMenu.power ? "W" : "Wh",
                        },
                        {
                            title: "Reactive",
                            value: "---",
                            unit: menu === chartMenu.power ? "VAR" : "VARh",
                        },
                        {
                            title: "Apparent",
                            value: "---",
                            unit: menu === chartMenu.power ? "VA" : "VAh",
                        },
                    ]);
                }
            } else {
                // Call service to get asset's powers
                let config = {
                    method: "post",
                    url:
                        ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                        process.env.REACT_APP_POWER_GET_LATEST_POWER_OR_ENERGY,
                    headers: {
                        authorization: getToken(),
                    },
                    data: {
                        asset_number: IsAllOption(powerSourceType)
                            ? ""
                            : asset
                            ? asset.number
                            : "",
                        menu: menu === chartMenu.power ? "power" : "energy",
                        power_source_type_id:
                            IsAllOption(powerSourceType) || !powerSourceType
                                ? ""
                                : powerSourceType.id,
                        power_type_id: powerType ? powerType.id : "",
                        rack_id: rack ? rack.id : "",
                        child_id:
                            child === null || child === undefined
                                ? ""
                                : IsTotalChildrenOption(child)
                                ? ""
                                : child.id,
                        pdu_id:
                            pdu === null || pdu === undefined
                                ? ""
                                : IsTotalPduOption(pdu)
                                ? ""
                                : pdu.id,
                        parent_id: IsParentType(powerType) ? powerType.id : "",
                    },
                    cancelToken: cancelToken.token,
                };

                try {
                    const result = await axios(config);

                    if (result.status === 200) {
                        let { data } = result;

                        if (mounted) {
                            let activeUnit =
                                menu === chartMenu.power
                                    ? units.active_power
                                    : units.active_energy;
                            let reactiveUnit =
                                menu === chartMenu.power
                                    ? units.reactive_power
                                    : units.reactive_energy;
                            let apparentUnit =
                                menu === chartMenu.power
                                    ? units.apparent_power
                                    : units.apparent_energy;

                            setPowerEnergyCards([
                                {
                                    title: "Active",
                                    value:
                                        !isNaN(data.active) &&
                                        data.active !== ""
                                            ? normalizeValueUnit(
                                                  data.active,
                                                  activeUnit
                                              ).value
                                            : "---",
                                    unit: activeUnit
                                        ? normalizeValueUnit(
                                              data.active,
                                              activeUnit
                                          ).unit
                                        : "",
                                },
                                {
                                    title: "Reactive",
                                    value:
                                        !isNaN(data.reactive) &&
                                        data.reactive !== ""
                                            ? normalizeValueUnit(
                                                  data.reactive,
                                                  reactiveUnit
                                              ).value
                                            : "---",
                                    unit: reactiveUnit
                                        ? normalizeValueUnit(
                                              data.reactive,
                                              reactiveUnit
                                          ).unit
                                        : "",
                                },
                                {
                                    title: "Apparent",
                                    value:
                                        !isNaN(data.apparent) &&
                                        data.apparent !== ""
                                            ? normalizeValueUnit(
                                                  data.apparent,
                                                  apparentUnit
                                              ).value
                                            : "---",
                                    unit: apparentUnit
                                        ? normalizeValueUnit(
                                              data.apparent,
                                              apparentUnit
                                          ).unit
                                        : "",
                                },
                            ]);
                        }
                    } else {
                        toast.error("Error getting latest power or energy", {
                            toastId: "error-get-power-energy",
                        });
                    }
                } catch (e) {
                    if (!axios.isCancel(e)) {
                        toast.error(
                            "Error calling API to get latest power or energy",
                            {
                                toastId: "error-get-power-energy",
                            }
                        );
                    }
                }
            }
        };

        const getCurrentlyRunningPowerSource = async (powerSourceType) => {
            if (!IsAllOption(powerSourceType)) {
                // Call service to get currently running power type
                let config = {
                    method: "post",
                    url:
                        ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                        process.env
                            .REACT_APP_POWER_GET_CURRENTLY_RUNNING_POWER_SOURCE,
                    headers: {
                        authorization: getToken(),
                    },
                    data: {
                        power_source_type_id:
                            powerSourceType && powerSourceType.id
                                ? powerSourceType.id
                                : "",
                    },
                    cancelToken: cancelToken.token,
                };

                try {
                    const result = await axios(config);

                    if (result.status === 200) {
                        let { data } = result;

                        if (!data || (data && data.notFound)) {
                            if (mounted) {
                                setRunningPowerSource(null);
                            }
                        } else {
                            if (mounted) {
                                setRunningPowerSource(data);
                            }
                        }
                    } else {
                        toast.error(
                            "Error getting currently running power type",
                            {
                                toastId: "error-get-running",
                            }
                        );
                    }
                } catch (e) {
                    if (!axios.isCancel(e)) {
                        toast.error(
                            "Error calling API to get currently running power type",
                            {
                                toastId: "error-get-running",
                            }
                        );
                    }
                }
            }
        };

        const fetchData = async () => {
            if (count === 0) {
                // Set isLoading to TRUE
                if (mounted) {
                    setIsLoading(true);
                }
            } else {
                loadingTimer = setTimeout(() => {
                    // Set isLoading to TRUE
                    if (mounted) {
                        setIsLoading(true);
                    }
                }, REFRESH_LOADING_THRESHOLD_MS);
            }

            ++count;
            await Promise.all([
                getEnergyConsumption(
                    filter.powerSourceType,
                    filter.powerType,
                    filter.child,
                    filter.rack,
                    filter.pdu
                ),
                getParameters(
                    asset,
                    filter.powerSourceType,
                    filter.child,
                    filter.pdu
                ),
                getPowerOrEnergy(
                    asset,
                    filter.powerSourceType,
                    filter.powerType,
                    filter.child,
                    filter.rack,
                    filter.pdu,
                    menu
                ),
                getCurrentlyRunningPowerSource(filter.powerSourceType),
            ]);

            // Clear timeout for setting loading to TRUE
            clearTimeout(loadingTimer);
            loadingTimer = null;

            // Set isLoading to FALSE
            if (mounted) {
                setIsLoading(false);
            }

            if (
                mounted &&
                interval &&
                !(
                    (IsParentType(filter.powerType) && !filter.child) ||
                    (IsRackType(filter.powerType) && !filter.rack)
                )
            ) {
                interval = setTimeout(fetchData, REFRESH_PERIOD_MS);
            }
        };

        interval = setTimeout(fetchData, 10);

        return () => {
            clearTimeout(interval);
            interval = null;
            clearTimeout(loadingTimer);
            loadingTimer = null;
            cancelToken.cancel();
            mounted = false;
        };
    }, [
        asset,
        filter.powerSourceType,
        filter.powerType,
        filter.child,
        filter.rack,
        filter.pdu,
        units,
        menu,
    ]);

    return (
        <div className='power-energy-consumption'>
            <LoadingData
                size='100px'
                backgroundOffset='5px'
                isLoading={isLoading}
                useDarkBackground={true}
            />
            <AssignPowerSourceModal
                isShowing={isShowingAssignPS}
                toggle={toggleAssignPS}
                filter={filter}
                setTriggerGetPowerSourceAsset={setTriggerGetPowerSourceAsset}
            />
            <EditPowerSourceModal
                isShowing={isShowingEditPS}
                toggle={toggleEditPS}
                asset={asset}
                filter={filter}
                setTriggerGetPowerSourceAsset={setTriggerGetPowerSourceAsset}
            />
            <div className='power-energy-consumption-title-container'>
                <div className='power-energy-consumption-title'>
                    <div className='power-energy-consumption-title__card-header'>
                        <span>{EnumPowerManagement.ENERGY_CONSUMPTION}</span>
                        {/* {!IsAllOption(filter.powerSourceType) &&
                        IsRackType(filter.powerType) &&
                        filter.rack ? (
                            <InputDropdownHorizontal
                                labelWidth={"auto"}
                                inputWidth={"auto"}
                                label={"PDU"}
                                name={"pdu"}
                                options={pduOptions}
                                value={filter.pdu ? filter.pdu.id : ""}
                                onChange={handlePduChange}
                                useAltColor={true}
                                noEmptyOption={true}
                                isDisabled={
                                    !pduOptions || pduOptions.length <= 0
                                }
                                isLoading={isLoadingInput}
                            />
                        ) : (
                            <div className='power-energy-consumption-title__pdu-padding' />
                        )} */}
                        {
                            <div className='power-energy-consumption-title__pdu-padding' />
                        }
                    </div>
                    {(getUACWithoutToast("delete") ||
                        getUACWithoutToast("edit")) && (
                        <div className='edit-assigned-ps'>
                            <Tooltip
                                tooltip={
                                    <span className='icon-tooltip'>
                                        {"Edit Assigned Power Meter"}
                                    </span>
                                }>
                                <img
                                    className={
                                        asset
                                            ? "edit-assigned-ps__icon"
                                            : "edit-assigned-ps__icon edit-assigned-ps__icon--disabled"
                                    }
                                    src={writeIcon}
                                    alt='write-icon'
                                    onClick={() => {
                                        if (asset) {
                                            toggleEditPS();
                                        }
                                    }}
                                />
                            </Tooltip>
                        </div>
                    )}
                </div>

                <div
                    className='power-energy-consumption-power-source'
                    style={{
                        visibility: IsAllOption(filter.powerSourceType)
                            ? "hidden"
                            : null,
                    }}>
                    <span id='running-power-source'>
                        {`${EnumPowerManagement.RUNNING_POWER_SOURCE} ${
                            filter.powerSourceType
                                ? filter.powerSourceType.name
                                : ""
                        }`}
                    </span>
                    <div className='running-power-source-type-value'>
                        {/* <span className='running-power-source-type'>
                            {filter.powerSourceType
                                ? filter.powerSourceType.name
                                : null}
                        </span> */}
                        <span
                            className='running-power-source-value'
                            style={{
                                color: runningPowerSource
                                    ? runningPowerSource === "Main"
                                        ? "#6991ff"
                                        : runningPowerSource === "Generator"
                                        ? "#49F2DB"
                                        : runningPowerSource === "Battery"
                                        ? "#9A77CF"
                                        : runningPowerSource ===
                                          "Coupling Powered"
                                        ? "#FEBC2C"
                                        : runningPowerSource === "Down"
                                        ? "#F11B2A"
                                        : runningPowerSource === "Offline"
                                        ? "rgb(81, 65, 76)"
                                        : null
                                    : null,
                            }}>
                            {runningPowerSource ? runningPowerSource : "---"}
                        </span>
                    </div>
                </div>
            </div>
            <div className='power-energy-consumption-card-container'>
                <PowerCard
                    title={EnergyConsumptionPer.TODAY}
                    value={
                        energyConsumption &&
                        energyConsumption.today !== null &&
                        energyConsumption.today !== undefined
                            ? normalizeValueUnit(
                                  energyConsumption.today,
                                  units.active_energy
                              ).value
                            : "---"
                    }
                    unit={
                        units.active_energy
                            ? normalizeValueUnit(
                                  energyConsumption.today,
                                  units.active_energy
                              ).unit
                            : ""
                    }
                />
                <PowerCard
                    title={EnergyConsumptionPer.WEEK_TO_DATE}
                    value={
                        energyConsumption &&
                        energyConsumption.wtd !== null &&
                        energyConsumption.wtd !== undefined
                            ? normalizeValueUnit(
                                  energyConsumption.wtd,
                                  units.active_energy
                              ).value
                            : "---"
                    }
                    unit={
                        units.active_energy
                            ? normalizeValueUnit(
                                  energyConsumption.wtd,
                                  units.active_energy
                              ).unit
                            : ""
                    }
                />
                <PowerCard
                    title={EnergyConsumptionPer.MONTH_TO_DATE}
                    value={
                        energyConsumption &&
                        energyConsumption.mtd !== null &&
                        energyConsumption.mtd !== undefined
                            ? normalizeValueUnit(
                                  energyConsumption.mtd,
                                  units.active_energy
                              ).value
                            : "---"
                    }
                    unit={
                        units.active_energy
                            ? normalizeValueUnit(
                                  energyConsumption.mtd,
                                  units.active_energy
                              ).unit
                            : ""
                    }
                />
            </div>
            <div className='power-energy-consumption-parameter-container'>
                {parameterCards && parameterCards.length > 0 ? (
                    parameterCards.map(({ title, value, unit }) => (
                        <div className='parameter' key={title}>
                            <span id='title'>{title}</span>
                            <span id='value'>{`${value} ${unit}`}</span>
                        </div>
                    ))
                ) : !IsAllOption(filter.powerSourceType) &&
                  !IsTotalChildrenOption(filter.child) &&
                  !IsTotalPduOption(filter.pdu) ? (
                    asset && !asset.name ? (
                        <div className='assign-ps-asset-number-container'>
                            <span className='assign-ps-asset-number-container__title'>
                                Asset number is invalid.
                            </span>
                            <span className='assign-ps-asset-number-container__title'>
                                Please update the power source's asset number.
                            </span>
                        </div>
                    ) : !asset ? (
                        <div className='assign-ps-asset-number-container'>
                            {(IsRackType(filter.powerType) && !filter.rack) ||
                            (IsParentType(filter.powerType) &&
                                !filter.child) ? null : getUACWithoutToast(
                                  "add"
                              ) ? (
                                <React.Fragment>
                                    <span className='assign-ps-asset-number-container__title'>
                                        Assign a Power Meter
                                    </span>
                                    <ButtonSubmit
                                        name='Assign'
                                        onSubmit={() => {
                                            toggleAssignPS();
                                        }}
                                        isLoading={false}
                                    />
                                </React.Fragment>
                            ) : null}
                        </div>
                    ) : (
                        <div className='assign-ps-asset-number-container' />
                    )
                ) : (
                    <div className='assign-ps-asset-number-container' />
                )}
            </div>
            <hr className='power-horizontal-line'></hr>
            <div className='power-energy-consumption-power-container'>
                <div className='title'>
                    <span>{menu === chartMenu.power ? "Power" : "Energy"}</span>
                </div>
                <div className='card'>
                    {powerEnergyCards.map(({ title, value, unit }, index) => (
                        <div
                            key={title}
                            className={
                                isLastElement(index, powerEnergyCards.length)
                                    ? "parameter"
                                    : "parameter border-right"
                            }>
                            <span id='title'>{title}</span>
                            <span id='value'>{`${value} ${unit}`}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const isLastElement = (index, length) => {
    if (index === length - 1) {
        return true;
    }
    return false;
};

export default EnergyConsumption;
