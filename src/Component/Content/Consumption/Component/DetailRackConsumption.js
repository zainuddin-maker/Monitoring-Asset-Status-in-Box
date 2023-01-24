// System library imports
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Custom library imports
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { getToken } from "../../../TokenParse/TokenParse";
import {
    InputDateHorizontal,
    InputDropdownHorizontal,
    generateDateGMT8,
    ExportButton,
    useModal,
    LoadingData,
    exportCSVFile,
} from "../../../ComponentReuseable/index";
import RackConsumptionLineChart from "./RackConsumptionLineChart";
import RackConsumptionChartThreshold from "./RackConsumptionChartThreshold";
import DetailRackBox from "./DetailRackBox";
import { intervals, menus, subMenus } from "./EnumsRack";
import { normalizeValueUnit } from "../Utilities/NormalizeValueUnit";
import { normalizeExportedData } from "../Utilities/ExportTools";
import { getUACWithoutToast } from "../../../ComponentReuseable/Functions";

// Image imports
import writeIcon from "../../../../svg/write-icon-no-padding.svg";

// Constants
const REFRESH_PERIOD_MS = 5000;
const REFRESH_LOADING_THRESHOLD_MS = 10000;
const totalPduName = "";
const defaultTotalPdu = {
    pdu: totalPduName,
    pduName: "Total",
    value: null,
    unit: null,
    warningThreshold: null,
    criticalThreshold: null,
    threshold: null,
};

const RackInformation = (props) => {
    // Destructure props
    let { rackId, rackNumber } = props;

    // States
    // Filter states
    const [menu, setMenu] = useState(menus.power);
    const [subMenu, setSubMenu] = useState(subMenus.apparent);
    const [interval, setInterval] = useState(intervals.daily);
    const [startDate, setStartDate] = useState(
        generateDateGMT8(new Date()).toISOString().slice(0, 10)
    );

    // Loading states
    const [isLoading, setIsLoading] = useState({
        latestData: false,
        export: false,
    });

    // PDU states
    const [totalPdu, setTotalPdu] = useState(defaultTotalPdu);
    const [pdus, setPdus] = useState(null);
    const [selectedPdu, setSelectedPdu] = useState(totalPduName);

    // Modals
    const { isShowing: isShowingThreshold, toggle: toggleThreshold } =
        useModal();

    // Functions
    // Handle menu changes (power or energy)
    const handleChangeMenu = (menu) => {
        setMenu(menu);
        setSubMenu(subMenus.apparent);
    };

    // Handle input changes
    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === "interval") {
            setInterval(value);
        } else if (name === "start-date") {
            let isValidDate = new Date(value).getTime() > 0;
            if (isValidDate) {
                setStartDate(new Date(value).toISOString().slice(0, 10));
            }
        } else if (name === "subMenu") {
            setSubMenu(value);
        }
    };

    // Generate threshold overview
    const generateOverview = (comparison, firstVal, secondVal) => {
        const compare = (value) => {
            if (value === 0) {
                return "0";
            } else if (value) {
                return value;
            } else {
                return "---";
            }
        };
        switch (comparison) {
            case "LOWER_THAN":
                return `X < ${compare(firstVal)}`;
            case "LOWER_THAN_EQUAL":
                return `X <= ${compare(firstVal)}`;
            case "HIGHER_THAN":
                return `X > ${compare(firstVal)}`;
            case "HIGHER_THAN_EQUAL":
                return `X >= ${compare(firstVal)}`;
            case "HIGHER_THAN_AND_LOWER":
                return `X > ${compare(firstVal)}, X < ${compare(secondVal)}`;
            case "HIGHER_THAN_EQUAL_AND_LOWER":
                return `X >= ${compare(firstVal)}, X < ${compare(secondVal)}`;
            case "HIGHER_THAN_AND_LOWER_EQUAL":
                return `X > ${compare(firstVal)}, X <= ${compare(secondVal)}`;
            case "HIGHER_THAN_EQUAL_AND_LOWER_EQUAL":
                return `X >= ${compare(firstVal)}, X <= ${compare(secondVal)}`;
            case "BETWEEN":
                return `${compare(secondVal)} < X < ${compare(firstVal)}`;
            default:
                return "---";
        }
    };

    // Functions
    const getCurrentTimestamp = () => {
        const padZero = (number) => {
            if (number > 9) {
                return number.toString();
            } else {
                return String(number).padStart(2, "0");
            }
        };

        let currentTimestamp = generateDateGMT8(new Date());
        let year = currentTimestamp.getFullYear();
        let month = padZero(currentTimestamp.getMonth() + 1);
        let date = padZero(currentTimestamp.getDate());
        let hours = padZero(currentTimestamp.getHours());
        let minutes = padZero(currentTimestamp.getMinutes());
        let seconds = padZero(currentTimestamp.getSeconds());

        return `${year}-${month}-${date},${hours}_${minutes}_${seconds}`;
    };

    // Function to export rack consumption chart data
    const exportRackConsumption = async () => {
        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_CONSUMPTION_RACK_EXPORT_RACK_CONSUMPTION,
            headers: {
                authorization: getToken(),
            },
            data: {
                interval: interval,
                start_date: startDate,
                rack_id: rackId,
            },
        };

        try {
            const result = await axios(config);

            if (result.status === 200) {
                let { data } = result;

                if (data.status === "SUCCESS") {
                    let { pdus, thresholds, exported } = data;

                    exportCSVFile(
                        normalizeExportedData(
                            interval,
                            startDate,
                            pdus,
                            thresholds,
                            exported
                        ),
                        `RackConsumption_[${rackNumber.toUpperCase()}]_[${getCurrentTimestamp()}]_[${interval.toUpperCase()}]_[${startDate}]`
                    );
                } else {
                    toast.error(data.message, {
                        toastId: "error-export-rack-consumption",
                    });
                }
            } else {
                toast.error("Error exporting rack's consumption data", {
                    toastId: "error-export-rack-consumption",
                });
            }
        } catch (e) {
            if (!axios.isCancel(e)) {
                toast.error(
                    "Error calling API to export rack's consumption data",
                    {
                        toastId: "error-export-rack-consumption",
                    }
                );
            }
        }
    };

    // Side-effects
    // Get latest data based on selected rack, menu, and subMenu
    useEffect(() => {
        // Internal variables
        let mounted = true;
        let cancelToken = axios.CancelToken.source();
        let fetchTimer = null;
        let loadingTimer = null;
        let isFirstCall = true;

        // Internal functions
        const fetchLatestPowerOrEnergy = async (
            rackId,
            menu,
            subMenu,
            interval,
            startDate
        ) => {
            const config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env
                        .REACT_APP_CONSUMPTION_RACK_GET_LATEST_POWER_OR_ENERGY,
                headers: {
                    authorization: getToken(),
                },
                data: {
                    menu: menu.toLowerCase(),
                    sub_menu: subMenu.toLowerCase(),
                    rack_id: rackId,
                    interval: interval.toLowerCase(),
                    start_date: startDate,
                },
                cancelToken: cancelToken.token,
            };

            try {
                const result = await axios(config);

                if (result.status === 200) {
                    let { data } = result;

                    if (data.status === "SUCCESS") {
                        let { total, pdus } = data;

                        // Set total state
                        if (mounted && total) {
                            let { threshold } = total;

                            let warning = null;
                            let critical = null;
                            if (threshold) {
                                warning = threshold.warning;
                                critical = threshold.critical;
                            }

                            let normalized = normalizeValueUnit(
                                total.value,
                                total.unit
                            );

                            let newTotalPdu = {
                                ...defaultTotalPdu,
                                value: normalized.value,
                                unit: normalized.unit,
                                warningThreshold: warning
                                    ? generateOverview(
                                          warning.comparisonType,
                                          warning.threshold,
                                          warning.second_threshold
                                      ) + ` ${total.unit}`
                                    : null,
                                criticalThreshold: critical
                                    ? generateOverview(
                                          critical.comparisonType,
                                          critical.threshold,
                                          critical.second_threshold
                                      ) + ` ${total.unit}`
                                    : null,
                                threshold: threshold,
                            };

                            setTotalPdu(newTotalPdu);
                        }

                        // Set pdus state
                        if (mounted && pdus) {
                            setPdus(
                                pdus.map((pdu) => {
                                    let { threshold } = pdu;

                                    let warning = null;
                                    let critical = null;
                                    if (threshold) {
                                        warning = threshold.warning;
                                        critical = threshold.critical;
                                    }

                                    let normalized = normalizeValueUnit(
                                        pdu.value,
                                        pdu.unit
                                    );

                                    return {
                                        pdu: pdu.pdu,
                                        pduName: "PDU " + pdu.pdu,
                                        value: normalized.value,
                                        unit: normalized.unit,
                                        warningThreshold: warning
                                            ? generateOverview(
                                                  warning.comparisonType,
                                                  warning.threshold,
                                                  warning.second_threshold
                                              ) + ` ${pdu.unit}`
                                            : null,
                                        criticalThreshold: critical
                                            ? generateOverview(
                                                  critical.comparisonType,
                                                  critical.threshold,
                                                  critical.second_threshold
                                              ) + ` ${pdu.unit}`
                                            : null,
                                        threshold: threshold,
                                    };
                                })
                            );
                        }
                    } else {
                        toast.error(data.message + ": " + data.error, {
                            toastId: "error-get-latest-data",
                        });
                    }
                } else {
                    toast.error("Error getting racks latest data", {
                        toastId: "error-get-latest-data",
                    });

                    if (mounted) {
                        setPdus(null);
                    }
                }
            } catch (e) {
                if (!axios.isCancel(e)) {
                    toast.error("Error calling API to get racks latest data", {
                        toastId: "error-get-latest-data",
                    });
                }

                if (mounted) {
                    setPdus(null);
                }
            }
        };

        const fetchData = async () => {
            if (isFirstCall) {
                // Set isLoading to TRUE
                if (mounted) {
                    setIsLoading((prevState) => ({
                        ...prevState,
                        latestData: true,
                    }));
                }
            } else {
                loadingTimer = setTimeout(() => {
                    // Set isLoading to TRUE
                    if (mounted) {
                        setIsLoading((prevState) => ({
                            ...prevState,
                            latestData: true,
                        }));
                    }
                }, REFRESH_LOADING_THRESHOLD_MS);
            }

            await fetchLatestPowerOrEnergy(
                rackId,
                menu,
                subMenu,
                interval,
                startDate
            );

            if (!isFirstCall) {
                // Clear timeout for setting loading to TRUE
                clearTimeout(loadingTimer);
                loadingTimer = null;
            } else {
                isFirstCall = false;
            }

            // Set isLoading to FALSE
            if (mounted) {
                setIsLoading((prevState) => ({
                    ...prevState,
                    latestData: false,
                }));
            }

            if (mounted && fetchTimer) {
                fetchTimer = setTimeout(fetchData, REFRESH_PERIOD_MS);
            }
        };

        if (rackId) {
            fetchTimer = setTimeout(fetchData, 10);
        }

        return () => {
            clearTimeout(fetchTimer);
            fetchTimer = null;
            clearTimeout(loadingTimer);
            loadingTimer = null;
            cancelToken.cancel();
            mounted = false;
        };
    }, [rackId, menu, subMenu, interval, startDate]);

    return (
        <div className='rack_consumpstion_information'>
            <RackConsumptionChartThreshold
                isShowing={isShowingThreshold}
                hide={toggleThreshold}
                menu={menu}
                subMenu={subMenu}
                rackId={rackId}
                generateOverview={generateOverview}
            />
            <div className='rack_consumption_nameandfilter'>
                <div className='rack_consumpstion_information_header'>
                    Rack No: {rackNumber ? rackNumber : "---"}
                </div>

                <div className='consumption-header-filter'>
                    {Object.values(intervals).map((intv, index) => {
                        return (
                            <div
                                key={index}
                                onClick={() => {
                                    handleChange({
                                        target: {
                                            name: "interval",
                                            value: intv,
                                        },
                                    });
                                }}
                                className={interval === intv ? "selected" : ""}>
                                <span>{intv}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className='power_energy_filter_date'>
                <div className='consumption-rack-consumption-header'>
                    {Object.values(menus).map((row) => (
                        <span
                            key={row}
                            id={menu === row ? "active" : ""}
                            onClick={() => {
                                handleChangeMenu(row);
                            }}>
                            {row}
                        </span>
                    ))}
                </div>
                <div className='consumption-header-menu-container__date-filter'>
                    <InputDateHorizontal
                        label={"Date"}
                        name={"start-date"}
                        value={startDate ? startDate : ""}
                        onChange={handleChange}
                        useAltColor={false}
                        hideClearData={true}
                    />

                    <ExportButton
                        isLoading={isLoading.export}
                        onClick={() => {
                            (async () => {
                                // Set isLoading to TRUE
                                setIsLoading((prevState) => ({
                                    ...prevState,
                                    export: true,
                                }));

                                await exportRackConsumption();

                                // Set isLoading to FALSE
                                setIsLoading((prevState) => ({
                                    ...prevState,
                                    export: false,
                                }));
                            })();
                        }}
                    />
                </div>
            </div>

            <div className='consumption-rack-consumption-filter'>
                <InputDropdownHorizontal
                    inputWidth={"100px"}
                    label={""}
                    name={"subMenu"}
                    options={Object.values(subMenus)}
                    value={subMenu}
                    onChange={handleChange}
                    useAltColor={true}
                    noEmptyOption={true}
                />

                {getUACWithoutToast("edit") && (
                    <div
                        className='chart-edit-button'
                        onClick={toggleThreshold}>
                        <img alt={"edit-button"} src={writeIcon} />
                    </div>
                )}
            </div>

            <div className='spacebetweentotaldanlist'>
                <LoadingData size={"150px"} isLoading={isLoading.latestData} />
                {/* Total rack box */}
                <DetailRackBox
                    selected={selectedPdu === totalPduName}
                    onClick={() => setSelectedPdu(totalPduName)}
                    menu={menu}
                    subMenu={subMenu}
                    pduName={totalPdu.pduName}
                    value={totalPdu.value}
                    unit={totalPdu.unit}
                    warningThreshold={totalPdu.warningThreshold}
                    criticalThreshold={totalPdu.criticalThreshold}
                />
                {/* Other pdus rack boxes */}
                <div className='listofboxapparentandactive'>
                    {pdus && pdus.length > 0
                        ? pdus.map((pdu) => (
                              <DetailRackBox
                                  key={pdu.pduName}
                                  selected={selectedPdu === pdu.pdu}
                                  onClick={() => setSelectedPdu(pdu.pdu)}
                                  menu={menu}
                                  subMenu={subMenu}
                                  pduName={pdu.pduName}
                                  value={pdu.value}
                                  unit={pdu.unit}
                                  warningThreshold={pdu.warningThreshold}
                                  criticalThreshold={pdu.criticalThreshold}
                              />
                          ))
                        : null}
                </div>
            </div>

            <RackConsumptionLineChart
                rackId={rackId}
                interval={interval}
                startDate={startDate}
                menu={menu}
                subMenu={subMenu}
                pdu={selectedPdu}
                pduName={
                    selectedPdu === totalPduName
                        ? totalPdu.pduName
                        : pdus && pdus.find((pdu) => selectedPdu === pdu.pdu)
                        ? pdus.find((pdu) => selectedPdu === pdu.pdu).pduName
                        : null
                }
                threshold={
                    selectedPdu === totalPduName
                        ? totalPdu.threshold
                        : pdus && pdus.find((pdu) => selectedPdu === pdu.pdu)
                        ? pdus.find((pdu) => selectedPdu === pdu.pdu).threshold
                        : null
                }
            />
        </div>
    );
};

export default RackInformation;
