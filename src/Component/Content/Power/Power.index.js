// System library imports
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

// Custom library imports
import PowerHeader from "./Components/PowerHeader";
import PowerSource from "./Components/PowerSource";
import PowerChart from "./Components/PowerChart";
import EnergyConsumption from "./Components/EnergyConsumption";
import { ReturnHostBackend } from "../../BackendHost/BackendHost";
import { getToken } from "../../TokenParse/TokenParse";
import {
    IsAllOption,
    IsTotalChildrenOption,
    IsTotalPduOption,
    IsParentType,
    IsRackType,
} from "./Components/Validation";
import { allOption, durations, chartMenu } from "./Components/Enums";
import { generateDateGMT8 } from "../../ComponentReuseable";

// Style imports
import "./style.scss";

const defaultUnits = {
    active_power: "W",
    reactive_power: "VAR",
    apparent_power: "VA",
    active_energy: "Wh",
    reactive_energy: "VARh",
    apparent_energy: "VAh",
    voltage_rms: "V",
    current_rms: "A",
    power_factor: "",
    frequency: "Hz",
};

const Power = () => {
    // States
    const [filter, setFilter] = useState({
        powerSourceType: allOption,
        powerType: null,
        child: null,
        rack: null,
        pdu: null,
    });
    const [startDate, setStartDate] = useState(
        generateDateGMT8(new Date()).toISOString().slice(0, 10)
    );
    const [duration, setDuration] = useState(durations.ONE_DAY);
    const [menu, setMenu] = useState(chartMenu.power);
    const [asset, setAsset] = useState(null);
    const [units, setUnits] = useState(defaultUnits);
    const [triggerGetPowerSourceAsset, setTriggerGetPowerSourceAsset] =
        useState(false);

    // Side-effects
    // Get power source asset based on the filter
    useEffect(() => {
        // Internal variable
        let cancelToken = axios.CancelToken.source();
        let mounted = true;

        // Internal function
        const getPowerSourceAsset = async (
            powerSourceType,
            powerType,
            child,
            rack,
            pdu
        ) => {
            let asset = null;

            // Call Data Hub query to get power source's asset data
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_DATA_HUB) +
                    process.env.REACT_APP_POWER_GET_POWER_SOURCE_ASSET,
                headers: {
                    authorization: getToken(),
                },
                data: {
                    power_source_type_id:
                        powerSourceType === null ||
                        powerSourceType === undefined
                            ? ""
                            : powerSourceType.id,
                    power_type_id:
                        powerType === null || powerType === undefined
                            ? ""
                            : powerType.id,
                    child_id:
                        child === null || child === undefined
                            ? ""
                            : IsTotalChildrenOption(child)
                            ? ""
                            : child.id,
                    rack_id: rack === null || rack === undefined ? "" : rack.id,
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
                            asset = {
                                name: queryData[0].asset_name,
                                number: queryData[0].asset_number,
                            };

                            setAsset(asset);
                        }
                    } else {
                        if (mounted) {
                            setAsset(null);
                        }
                    }
                } else {
                    toast.error("Error getting power source asset data", {
                        toastId: "error-get-ps-asset",
                    });
                }
            } catch (e) {
                if (!axios.isCancel(e)) {
                    toast.error(
                        "Error calling API to get power source asset data",
                        {
                            toastId: "error-get-ps-asset",
                        }
                    );
                }
            }

            return asset;
        };

        const isValidUnit = (unit) => {
            return unit !== null && unit !== undefined && unit !== "-";
        };

        const getUnits = async (
            powerSourceType,
            powerType,
            child,
            rack,
            pdu
        ) => {
            // Call Data Hub query to get power source's units data
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_DATA_HUB) +
                    process.env.REACT_APP_POWER_GET_UNITS,
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
                            let {
                                power_active_unit,
                                power_reactive_unit,
                                power_apparent_unit,
                                energy_active_unit,
                                energy_reactive_unit,
                                energy_apparent_unit,
                                voltage_rms_unit,
                                current_rms_unit,
                                power_factor_unit,
                                frequency_unit,
                            } = queryData[0];

                            let units = {
                                active_power: isValidUnit(power_active_unit)
                                    ? power_active_unit
                                    : defaultUnits.active_power,
                                reactive_power: isValidUnit(power_reactive_unit)
                                    ? power_reactive_unit
                                    : defaultUnits.reactive_power,
                                apparent_power: isValidUnit(power_apparent_unit)
                                    ? power_apparent_unit
                                    : defaultUnits.apparent_power,
                                active_energy: isValidUnit(energy_active_unit)
                                    ? energy_active_unit
                                    : defaultUnits.active_energy,
                                reactive_energy: isValidUnit(
                                    energy_reactive_unit
                                )
                                    ? energy_reactive_unit
                                    : defaultUnits.reactive_energy,
                                apparent_energy: isValidUnit(
                                    energy_apparent_unit
                                )
                                    ? energy_apparent_unit
                                    : defaultUnits.apparent_energy,
                                voltage_rms: isValidUnit(voltage_rms_unit)
                                    ? voltage_rms_unit
                                    : defaultUnits.voltage_rms,
                                current_rms: isValidUnit(current_rms_unit)
                                    ? current_rms_unit
                                    : defaultUnits.current_rms,
                                power_factor: isValidUnit(power_factor_unit)
                                    ? power_factor_unit
                                    : defaultUnits.power_factor,
                                frequency: isValidUnit(frequency_unit)
                                    ? frequency_unit
                                    : defaultUnits.frequency,
                            };

                            setUnits(units);
                        }
                    } else {
                        if (mounted) {
                            setUnits(defaultUnits);
                        }
                    }
                } else {
                    toast.error("Error getting power source units data", {
                        toastId: "error-get-units",
                    });
                }
            } catch (e) {
                if (!axios.isCancel(e)) {
                    toast.error(
                        "Error calling API to get power source units data",
                        {
                            toastId: "error-get-units",
                        }
                    );
                }
            }
        };

        (async () => {
            if (
                IsAllOption(filter.powerSourceType) ||
                IsTotalChildrenOption(filter.child) ||
                IsTotalPduOption(filter.pdu) ||
                (IsRackType(filter.powerType) && !filter.rack) ||
                (IsParentType(filter.powerType) && !filter.child)
            ) {
                if (mounted) {
                    setAsset(null);
                }

                if (
                    (IsRackType(filter.powerType) && !filter.rack) ||
                    (IsParentType(filter.powerType) && !filter.child)
                ) {
                    if (mounted) {
                        setUnits(defaultUnits);
                    }
                } else {
                    await getUnits(
                        filter.powerSourceType,
                        filter.powerType,
                        filter.child,
                        filter.rack,
                        filter.pdu
                    );
                }
            } else {
                let asset = await getPowerSourceAsset(
                    filter.powerSourceType,
                    filter.powerType,
                    filter.child,
                    filter.rack,
                    filter.pdu
                );

                if (asset && asset.name) {
                    await getUnits(
                        filter.powerSourceType,
                        filter.powerType,
                        filter.child,
                        filter.rack,
                        filter.pdu
                    );
                } else {
                    if (mounted) {
                        setUnits(defaultUnits);
                    }
                }
            }
        })();

        return () => {
            cancelToken.cancel();
            mounted = false;
        };
    }, [
        filter.powerSourceType,
        filter.powerType,
        filter.child,
        filter.rack,
        filter.pdu,
        triggerGetPowerSourceAsset,
    ]);

    return (
        <div className='power-container power-bg-darkblue'>
            <PowerHeader
                filter={filter}
                setFilter={setFilter}
                startDate={startDate}
                setStartDate={setStartDate}
                duration={duration}
            />
            <div className='power-content-container'>
                <EnergyConsumption
                    filter={filter}
                    setFilter={setFilter}
                    asset={asset}
                    units={units}
                    menu={menu}
                    setTriggerGetPowerSourceAsset={
                        setTriggerGetPowerSourceAsset
                    }
                />
                <div className='power-chart-container'>
                    <PowerSource
                        filter={filter}
                        startDate={startDate}
                        triggerGetPowerSourceAsset={triggerGetPowerSourceAsset}
                    />
                    <PowerChart
                        asset={asset}
                        filter={filter}
                        startDate={startDate}
                        duration={duration}
                        setDuration={setDuration}
                        units={units}
                        menu={menu}
                        setMenu={setMenu}
                    />
                </div>
            </div>
        </div>
    );
};

export default Power;
