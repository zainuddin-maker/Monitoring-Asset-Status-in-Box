// System library imports
import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

// Custom library imports
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { getToken } from "../../../TokenParse/TokenParse";

import {
    InputDateHorizontal,
    Timer,
    exportCSVFile,
    generateDateGMT8,
    ExportButton,
} from "../../../ComponentReuseable/index"; 

// Constants
const options = {
    interval: [
        {
            id: "daily",
            name: "Daily",
        },
        {
            id: "weekly",
            name: "Weekly",
        },
        {
            id: "monthly",
            name: "Monthly",
        },
        {
            id: "yearly",
            name: "Yearly",
        },
    ],
};

const ConsumptionHeader = (props) => {
    // Destructure props
    let { filter, setFilter, startDate, setStartDate } = props;

    // States
    const [isLoading, setIsLoading] = useState({
        export: false,
    });

    // Functions
    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === "interval") {
            setFilter((prevState) => ({
                ...prevState,
                interval: options.interval.find(
                    (option) => option.id === value
                ),
            }));
        } else if (name === "start-date") {
            let isValidDate = new Date(value).getTime() > 0;
            if (isValidDate) {
                setStartDate(new Date(value).toISOString().slice(0, 10));
            }
        }
    };

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

    const exportConsumption = async () => {
        // Prepare return value variable
        let exportedData = [];

        // Call service to get the exported data
        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_CONSUMPTION_EXPORT,
            headers: {
                authorization: getToken(),
            },
            data: {
                interval: filter.interval ? filter.interval.id : "daily",
                start_date: startDate,
            },
        };

        try {
            const result = await axios(config);

            if (result.status === 200) {
                let { data } = result;

                if (
                    data.status &&
                    (data.status === "SUCCESS" ||
                        data.status === "PARTIAL_ERROR")
                ) {
                    let { power, energy, flow_rate, volume, pue_wue } = data;

                    exportedData.push({
                        sheetName: "active_power",
                        header: [
                            "timestamp",
                            "IT_load_active_power",
                            "non_IT_load_active_power",
                            "unit",
                        ],
                        body: power,
                    });

                    exportedData.push({
                        sheetName: "active_energy",
                        header: [
                            "timestamp",
                            "IT_load_active_energy",
                            "non_IT_load_active_energy",
                            "unit",
                        ],
                        body: energy,
                    });

                    exportedData.push({
                        sheetName: "flow_rate",
                        header: [
                            "timestamp",
                            "flow_rate_supply",
                            "flow_rate_return",
                            "flow_rate_usage",
                            "unit",
                        ],
                        body: flow_rate,
                    });

                    exportedData.push({
                        sheetName: "volume",
                        header: [
                            "timestamp",
                            "volume_supply",
                            "volume_return",
                            "volume_usage",
                            "unit",
                        ],
                        body: volume,
                    });

                    exportedData.push({
                        sheetName: "pue_wue",
                        header: [
                            "timestamp",
                            "pue",
                            "pue_unit",
                            "wue",
                            "wue_unit",
                        ],
                        body: pue_wue,
                    });

                    exportCSVFile(
                        exportedData,
                        `Consumption_[${getCurrentTimestamp()}]_[${startDate}]_[${
                            filter.interval ? filter.interval.name : "Daily"
                        }]`
                    );

                    if (data.status === "PARTIAL_ERROR") {
                        data.errors.forEach((err, index) => {
                            toast.error("EXPORT CONSUMPTION: " + err.message, {
                                toastId: `error-export-consumption-${index}`,
                            });
                        });
                    }
                } else {
                    if (data.status === "EMPTY") {
                        toast.info("Consumption chart data is empty", {
                            toastId: "empty-consumption-data",
                        });
                    } else {
                        data.errors.forEach((err, index) => {
                            toast.error("EXPORT CONSUMPTION: " + err.message, {
                                toastId: `error-export-consumption-${index}`,
                            });
                        });
                    }
                }
            } else {
                toast.error("Error getting exported consumption data", {
                    toastId: "error-export-consumption",
                });
            }
        } catch (e) {
            toast.error("Error calling API to get exported consumption data", {
                toastId: "error-export-consumption",
            });
        }
    };

    return (
        <React.Fragment>
            <div className='consumption-header-container-title'>
                <span id='consumption-management'>
                    Data Centre Consumption Report
                </span>
                <Timer />
            </div>
            <div className='consumption-header-menu-container'>
                <div className='consumption-header-menu-container__ps-filter'>
                    <div className='consumption-header-filter'>
                        {options.interval.map((intv, index) => {
                            return (
                                <div
                                    key={index}
                                    onClick={() => {
                                        handleChange({
                                            target: {
                                                name: "interval",
                                                value: intv.id,
                                            },
                                        });
                                    }}
                                    className={
                                        filter.interval.id === intv.id
                                            ? "selected"
                                            : ""
                                    }>
                                    <span>{intv.name}</span>
                                </div>
                            );
                        })}
                    </div>
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

                                await exportConsumption();

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
        </React.Fragment>
    );
};

export default ConsumptionHeader;
