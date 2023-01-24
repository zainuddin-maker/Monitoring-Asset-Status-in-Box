// System library imports
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

// Custom library imports
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { getToken } from "../../../TokenParse/TokenParse";
import {
    allOption,
    totalOption,
    EnumPowerManagement,
    numOfDataPoints,
} from "./Enums";
import {
    InputDateHorizontal,
    InputDropdownHorizontal,
    InputTextAutoSuggestHorizontal,
    // InputDropdownCreatableHorizontal,
    Timer,
    exportCSVFile,
    ExportButton,
    // getUAC,
    generateDateGMT8,
} from "../../../ComponentReuseable/index";
import {
    IsAllOption,
    IsRackType,
    IsParentType,
    IsTotalChildrenOption,
    IsTotalPduOption,
} from "./Validation";
import { durations } from "./Enums";

// Constants
const defaultPowerSourceTypeOptions = [allOption];
const defaultChildrenOptions = [totalOption];
const defaultPduOptions = [totalOption];

const PowerHeader = (props) => {
    // Destructure props
    let { filter, setFilter, startDate, setStartDate, duration } = props;

    // States
    const [rackFilter, setRackFilter] = useState({
        floorId: null,
        roomId: null,
    });
    const [rackNumber, setRackNumber] = useState("");
    const [options, setOptions] = useState({
        powerSourceTypes: defaultPowerSourceTypeOptions,
        powerTypes: [],
        children: [],
        floors: [],
        rooms: [],
        racks: [],
    });
    const [pduOptions, setPduOptions] = useState([]);
    const [isLoading, setIsLoading] = useState({
        getChild: false,
        export: false,
    });
    const [isLoadingInput, setIsLoadingInput] = useState({
        powerSourceTypes: false,
        powerTypes: false,
        floors: false,
        rooms: false,
        racks: false,
        pdu: false,
    });
    const [getChildTrigger, setGetChildTrigger] = useState(false);

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

    // const snakeToPascal = (str) => {
    //     str += "";
    //     str = str.split("_");
    //     for (var i = 0; i < str.length; i++) {
    //         str[i] =
    //             str[i].slice(0, 1).toUpperCase() +
    //             str[i].slice(1, str[i].length);
    //     }
    //     return str.join("");
    // };

    const isValidRackNumber = (rackNumber) => {
        return (
            options.racks &&
            options.racks.length > 0 &&
            options.racks.find((rack) => rack.name === rackNumber)
        );
    };

    // Get rooms based on the selected floor
    const getRooms = async (floorId) => {
        // Set isLoading to TRUE
        setIsLoadingInput((prevState) => ({ ...prevState, rooms: true }));

        // Call JDBC query to get all rooms inside the selected floor
        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_CONNECTIVITY_GET_ROOMS_BY_FLOOR,
            headers: {
                authorization: getToken(),
            },
            data: {
                floor_id:
                    floorId === null || floorId === undefined ? "" : floorId,
            },
        };

        try {
            const result = await axios(config);

            if (result.status === 200) {
                let { data } = result;

                if (data.count > 0) {
                    let { data: queryData } = data;

                    setOptions((prevState) => {
                        return {
                            ...prevState,
                            rooms: queryData.map((row) => {
                                return {
                                    id: row.room_id,
                                    name: row.room_name,
                                };
                            }),
                        };
                    });
                } else {
                    setOptions((prevState) => {
                        return {
                            ...prevState,
                            rooms: [],
                        };
                    });
                }
            } else {
                toast.error("Error getting rooms data", {
                    toastId: "error-get-rooms",
                });
            }
        } catch (e) {
            toast.error("Error calling API to get rooms data", {
                toastId: "error-get-rooms",
            });
        }

        // Set isLoading to FALSE
        setIsLoadingInput((prevState) => ({ ...prevState, rooms: false }));
    };

    const handlePduChange = (e) => {
        let { name, value } = e.target;

        if (name === "pdu") {
            if (IsTotalPduOption({ id: value })) {
                setFilter((prevState) => ({
                    ...prevState,
                    pdu: totalOption,
                }));
            } else {
                setFilter((prevState) => {
                    return {
                        ...prevState,
                        pdu: pduOptions.find(
                            (option) => option.id === parseInt(value)
                        ),
                    };
                });
            }
        }
    };

    const handleChange = (e) => {
        let { name, value } = e.target;

        switch (name) {
            case "power-source-type":
                if (IsAllOption({ id: value })) {
                    setFilter((prevState) => ({
                        ...prevState,
                        powerSourceType: allOption,
                        pdu: null,
                    }));
                } else {
                    setFilter((prevState) => {
                        return {
                            ...prevState,
                            powerSourceType: options.powerSourceTypes.find(
                                (option) => option.id === parseInt(value)
                            ),
                        };
                    });
                }
                break;
            case "power-type":
                setFilter((prevState) => {
                    let selectedPowerType = options.powerTypes.find(
                        (option) => option.id === parseInt(value)
                    );

                    return {
                        ...prevState,
                        powerType: selectedPowerType ? selectedPowerType : null,
                        child: null,
                        rack: null,
                        pdu: null,
                    };
                });
                break;
            case "child":
                if (IsTotalChildrenOption({ id: value })) {
                    setFilter((prevState) => ({
                        ...prevState,
                        child: totalOption,
                    }));
                } else {
                    setFilter((prevState) => {
                        let selectedChild = options.children.find(
                            (option) => option.id === parseInt(value)
                        );

                        return {
                            ...prevState,
                            child: selectedChild ? selectedChild : null,
                        };
                    });
                }
                break;
            case "floor":
                let floorId = value !== "" ? parseInt(value) : null;

                setRackFilter((prevState) => {
                    return { ...prevState, floorId: floorId, roomId: null };
                });

                if (floorId) {
                    getRooms(floorId);
                }
                break;
            case "room":
                let roomId = value !== "" ? parseInt(value) : null;
                setRackFilter((prevState) => {
                    return { ...prevState, roomId: roomId };
                });
                break;
            case "rack":
                setRackNumber(value);
                break;
            case "start-date":
                let isValidDate = new Date(value).getTime() > 0;
                if (isValidDate) {
                    setStartDate(new Date(value).toISOString().slice(0, 10));
                }
                break;
            default:
                break;
        }
    };

    const exportPSUsage = async () => {
        // Prepare return value variable
        let exportedData = [];

        // Call service to get the chart data
        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_POWER_GET_RANGEBAR_CHART_DATA,
            headers: {
                authorization: getToken(),
            },
            data: {
                start_date: startDate,
                power_source_type_id: IsAllOption(filter.powerSourceType)
                    ? ""
                    : filter.powerSourceType && filter.powerSourceType.id
                    ? filter.powerSourceType.id
                    : "",
            },
        };

        try {
            const result = await axios(config);

            if (result.status === 200) {
                let { data } = result;

                if (
                    !data ||
                    (data && data.isEmpty) ||
                    typeof data === "string"
                ) {
                    toast.info("No power meter is assigned yet");
                } else {
                    Object.keys(data).forEach((key) => {
                        let sheetName = key;
                        let header = ["start_date", "end_date", "value"];
                        let body = data[key];

                        exportedData.push({
                            sheetName: sheetName,
                            header: header,
                            body: body,
                        });
                    });
                }
            } else {
                toast.error("Error getting power source usage data", {
                    toastId: "error-export-ps-usage",
                });
            }
        } catch (e) {
            toast.error("Error calling API to get power source usage data", {
                toastId: "error-export-ps-usage",
            });
        }

        return exportedData;
    };

    const exportPowerEnergy = async () => {
        // Prepare return value variable
        let exportedData = [];

        // Call service to get the chart data
        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_POWER_GET_POWER_AND_ENERGY_DATA,
            headers: {
                authorization: getToken(),
            },
            data: {
                start_date: startDate,
                duration:
                    duration === durations.ONE_DAY
                        ? "daily"
                        : duration === durations.SEVEN_DAY
                        ? "weekly"
                        : duration === durations.ONE_MONTH
                        ? "monthly"
                        : "yearly",
                power_source_type_id:
                    IsAllOption(filter.powerSourceType) ||
                    !filter.powerSourceType
                        ? ""
                        : filter.powerSourceType.id,
                power_type_id: filter.powerType ? filter.powerType.id : "",
                rack_id: filter.rack ? filter.rack.id : "",
                child_id:
                    filter.child === null || filter.child === undefined
                        ? ""
                        : IsTotalChildrenOption(filter.child)
                        ? ""
                        : filter.child.id,
                pdu_id:
                    filter.pdu === null || filter.pdu === undefined
                        ? ""
                        : IsTotalPduOption(filter.pdu)
                        ? ""
                        : filter.pdu.id,
                parent_id: IsParentType(filter.powerType)
                    ? filter.powerType.id
                    : "",
            },
        };

        try {
            const result = await axios(config);

            if (result.status === 200) {
                let { data } = result;

                const formatTimestamp = (input) => {
                    let timestamp = new Date(input);
                    let year = timestamp
                        .getFullYear()
                        .toString()
                        .padStart(4, "0");
                    let month = (timestamp.getMonth() + 1)
                        .toString()
                        .padStart(2, "0");
                    let date = timestamp.getDate().toString().padStart(2, "0");
                    let hours = timestamp
                        .getHours()
                        .toString()
                        .padStart(2, "0");
                    let minutes = timestamp
                        .getMinutes()
                        .toString()
                        .padStart(2, "0");
                    let seconds = timestamp
                        .getSeconds()
                        .toString()
                        .padStart(2, "0");
                    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
                };

                // Set hour, minute, seconds to 0 if duration is monthly or yearly
                if (
                    duration === durations.ONE_MONTH ||
                    duration === durations.ONE_YEAR
                ) {
                    Object.keys(data).forEach((key) => {
                        if (data[key] && data[key].length > 0) {
                            data[key] = data[key].map((row) => {
                                let timestamp = new Date(row.timestamp);
                                timestamp.setHours(0, 0, 0);
                                return {
                                    ...row,
                                    timestamp: formatTimestamp(timestamp),
                                };
                            });
                        }
                    });
                }

                let body =
                    duration === durations.ONE_DAY
                        ? Array(numOfDataPoints.ONE_DAY)
                              .fill({})
                              .map((item, index) => {
                                  let timestamp = new Date(startDate);
                                  timestamp.setHours(0, 0, 0);
                                  timestamp = new Date(
                                      new Date(timestamp).getTime() +
                                          index * 900 * 1000 - // 15 minutes step
                                          (index === numOfDataPoints.ONE_DAY - 1
                                              ? 1000
                                              : 0) // 23.59
                                  );
                                  return {
                                      timestamp: formatTimestamp(timestamp),
                                  };
                              })
                        : duration === durations.SEVEN_DAY
                        ? Array(numOfDataPoints.SEVEN_DAY)
                              .fill({})
                              .map((item, index) => {
                                  let firstDayOfWeek = new Date(startDate);
                                  let day = firstDayOfWeek.getDay() || 7; // Get current day number, converting Sun. to 7
                                  if (day !== 1) {
                                      // Only manipulate the date if it isn't Mon.
                                      firstDayOfWeek.setHours(
                                          -24 * (day - 1),
                                          0,
                                          0
                                      );
                                  } else {
                                      firstDayOfWeek.setHours(0, 0, 0);
                                  }

                                  let lastDayOfWeek = new Date(
                                      new Date(firstDayOfWeek)
                                  );
                                  lastDayOfWeek.setDate(
                                      firstDayOfWeek.getDate() + 6
                                  );
                                  lastDayOfWeek.setHours(23, 59, 59);

                                  let startTimestamp = new Date(startDate);
                                  let endTimestamp = new Date(startDate);

                                  if (
                                      firstDayOfWeek.getMonth() !==
                                      lastDayOfWeek.getMonth()
                                  ) {
                                      if (
                                          startTimestamp.getMonth() !==
                                          firstDayOfWeek.getMonth()
                                      ) {
                                          endTimestamp = new Date(
                                              lastDayOfWeek
                                          );
                                      } else {
                                          endTimestamp = new Date(
                                              lastDayOfWeek
                                          );
                                          endTimestamp.setDate(1);
                                          endTimestamp.setHours(0, 0, 0);
                                          endTimestamp = new Date(
                                              new Date(endTimestamp).getTime() -
                                                  1000
                                          );
                                      }
                                  } else {
                                      endTimestamp = new Date(lastDayOfWeek);
                                  }

                                  endTimestamp = new Date(
                                      endTimestamp.getTime() + 1000
                                  );

                                  let timestamp = new Date(firstDayOfWeek);
                                  timestamp.setHours(0, 0, 0);
                                  timestamp = new Date(
                                      new Date(timestamp).getTime() +
                                          index * 6 * 3600 * 1000
                                  );
                                  if (
                                      timestamp.getTime() ===
                                      endTimestamp.getTime()
                                  ) {
                                      timestamp = new Date(
                                          timestamp.getTime() - 1000
                                      );
                                  }
                                  return {
                                      timestamp: formatTimestamp(timestamp),
                                  };
                              })
                        : duration === durations.ONE_MONTH
                        ? Array(numOfDataPoints.ONE_MONTH)
                              .fill({})
                              .map((item, index) => {
                                  let timestamp = new Date(startDate);
                                  timestamp.setDate(1);
                                  timestamp.setHours(0, 0, 0);
                                  timestamp = new Date(
                                      new Date(timestamp).getTime() +
                                          index * 24 * 3600 * 1000 // 1 day step
                                  );
                                  return {
                                      timestamp: formatTimestamp(timestamp),
                                  };
                              })
                        : Array(numOfDataPoints.ONE_YEAR)
                              .fill({})
                              .map((item, index) => {
                                  let timestamp = new Date(startDate);
                                  timestamp.setMonth(0 + index, 1);
                                  timestamp.setHours(0, 0, 0);
                                  return {
                                      timestamp: formatTimestamp(timestamp),
                                  };
                              });

                // Generate index for each key
                let indexes = {};
                Object.keys(data).forEach((key) => {
                    indexes[key] = 0;
                });

                // Read data
                Object.keys(data).forEach((key) => {
                    body = body.map((row, index) => {
                        let newField = {
                            [key]: "",
                        };

                        if (data[key].length > 0) {
                            if (
                                data[key][indexes[key]] &&
                                new Date(
                                    data[key][indexes[key]].timestamp
                                ).getTime() ===
                                    new Date(row.timestamp).getTime()
                            ) {
                                let value = data[key][indexes[key]].tag_value;
                                indexes[key] = indexes[key] + 1;

                                newField = {
                                    [key]: value,
                                };
                                return {
                                    ...row,
                                    ...newField,
                                };
                            } else {
                                return {
                                    ...row,
                                    ...newField,
                                };
                            }
                        } else {
                            return {
                                ...row,
                                ...newField,
                            };
                        }
                    });
                });

                // Generate header from keys
                let header = ["timestamp"];
                Object.keys(data).forEach((key) => {
                    header.push(key);
                });

                // Check if duration is monthly or yearly
                if (duration === durations.ONE_MONTH) {
                    // Remove hours from timestamp
                    body = body.map((row) => {
                        let { timestamp } = row;

                        return {
                            ...row,
                            timestamp: timestamp.toString().slice(0, -9),
                        };
                    });
                } else if (duration === durations.ONE_YEAR) {
                    // Remove date & hours from timestamp
                    body = body.map((row) => {
                        let { timestamp } = row;

                        return {
                            ...row,
                            timestamp: timestamp.toString().slice(0, -12),
                        };
                    });
                }

                body = body.filter((row) => {
                    return !(
                        row.active_power === "" &&
                        row.reactive_power === "" &&
                        row.apparent_power === "" &&
                        row.active_energy === "" &&
                        row.reactive_energy === "" &&
                        row.apparent_energy === ""
                    );
                });

                exportedData.push({
                    sheetName: "Power & Energy",
                    header: header,
                    body: body,
                });
            } else {
                toast.error("Error getting power & energy data", {
                    toastId: "error-export-power-energy",
                });
            }
        } catch (e) {
            toast.error("Error calling API to get power & energy data", {
                toastId: "error-export-power-energy",
            });
        }

        return exportedData;
    };

    // // Function to create new child
    // const createChild = async (childName) => {
    //     // Set isLoading to TRUE
    //     setIsLoading((prevState) => ({ ...prevState, getChild: true }));

    //     // Call JDBC query to create new child for selected power type
    //     let config = {
    //         method: "post",
    //         url:
    //             ReturnHostBackend(process.env.REACT_APP_JDBC) +
    //             process.env.REACT_APP_POWER_CREATE_POWER_TYPE_CHILD,
    //         headers: {
    //             authorization: getToken(),
    //         },
    //         data: {
    //             parent_id: filter.powerType ? filter.powerType.id : "",
    //             child_name: childName ? childName : "",
    //         },
    //     };

    //     try {
    //         const result = await axios(config);

    //         if (result.status === 200) {
    //             let { data } = result;

    //             if (data.count > 0) {
    //                 setGetChildTrigger((prevState) => !prevState);
    //                 if (filter.powerType) {
    //                     toast.success(
    //                         `Successfully created new ${filter.powerType.name}`
    //                     );
    //                 }
    //             } else {
    //                 if (filter.powerType) {
    //                     toast.error(
    //                         `${filter.powerType.name} with the same name already exists`,
    //                         { toastId: "error-create-power-type-child" }
    //                     );
    //                 }
    //             }
    //         } else {
    //             toast.error("Error creating power type child", {
    //                 toastId: "error-create-power-type-child",
    //             });
    //         }
    //     } catch (e) {
    //         if (!axios.isCancel(e)) {
    //             toast.error("Error calling API to create power type child", {
    //                 toastId: "error-create-power-type-child",
    //             });
    //         }
    //     }

    //     // Set isLoading to FALSE
    //     setIsLoading((prevState) => ({ ...prevState, getChild: false }));
    // };

    // // Function to delete a child
    // const deleteChild = async (child) => {
    //     // Set isLoading to TRUE
    //     setIsLoading((prevState) => ({ ...prevState, getChild: true }));

    //     let canDeleteChild = false;

    //     // Call JDBC query to check if there is existing power meter assigned for the selected child
    //     let config = {
    //         method: "post",
    //         url:
    //             ReturnHostBackend(process.env.REACT_APP_JDBC) +
    //             process.env.REACT_APP_POWER_GET_CHILD_ASSIGNED_POWER_METER,
    //         headers: {
    //             authorization: getToken(),
    //         },
    //         data: {
    //             child_id: child ? child.value : "",
    //         },
    //     };

    //     try {
    //         const result = await axios(config);

    //         if (result.status === 200) {
    //             let { data } = result;

    //             if (data.count === 0) {
    //                 canDeleteChild = true;
    //             }
    //         } else {
    //             toast.error(
    //                 "Error calling API to get assigned power meter for selected power type child",
    //                 {
    //                     toastId: "error-delete-power-type-child",
    //                 }
    //             );
    //         }
    //     } catch (e) {
    //         if (!axios.isCancel(e)) {
    //             toast.error("Error calling API to delete power type child", {
    //                 toastId: "error-delete-power-type-child",
    //             });
    //         }
    //     }

    //     if (canDeleteChild) {
    //         // Call JDBC query to delete child for selected power type
    //         config = {
    //             method: "post",
    //             url:
    //                 ReturnHostBackend(process.env.REACT_APP_JDBC) +
    //                 process.env.REACT_APP_POWER_DELETE_POWER_TYPE_CHILD,
    //             headers: {
    //                 authorization: getToken(),
    //             },
    //             data: {
    //                 parent_id: filter.powerType ? filter.powerType.id : "",
    //                 child_id: child ? child.value : "",
    //             },
    //         };

    //         try {
    //             const result = await axios(config);

    //             if (result.status === 200) {
    //                 let { data } = result;

    //                 if (data.count > 0) {
    //                     setGetChildTrigger((prevState) => !prevState);
    //                     if (filter.powerType) {
    //                         toast.success(
    //                             `Successfully deleted selected ${filter.powerType.name}`
    //                         );
    //                     }
    //                 } else {
    //                     toast.error("Error deleting power type child", {
    //                         toastId: "error-delete-power-type-child",
    //                     });
    //                 }
    //             } else {
    //                 toast.error("Error deleting power type child", {
    //                     toastId: "error-delete-power-type-child",
    //                 });
    //             }
    //         } catch (e) {
    //             if (!axios.isCancel(e)) {
    //                 toast.error(
    //                     "Error calling API to delete power type child",
    //                     {
    //                         toastId: "error-delete-power-type-child",
    //                     }
    //                 );
    //             }
    //         }
    //     } else {
    //         toast.warn(
    //             `There are still assigned power meter on this ${filter.powerType.name}`,
    //             {
    //                 toastId: "warning-delete-power-type-child",
    //             }
    //         );
    //     }

    //     // Set isLoading to FALSE
    //     setIsLoading((prevState) => ({ ...prevState, getChild: false }));
    // };

    // Side-effects
    // Get PDUs
    useEffect(() => {
        // Internal variable
        let cancelToken = axios.CancelToken.source();
        let mounted = true;

        // Get PDUs based on rack and power source type
        const getPdu = async (powerSourceType, rack) => {
            // Call service to get asset's energy
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_JDBC) +
                    process.env.REACT_APP_POWER_GET_PDU,
                headers: {
                    authorization: getToken(),
                },
                data: {
                    power_source_type_id:
                        IsAllOption(powerSourceType) || !powerSourceType
                            ? ""
                            : powerSourceType.id,
                    rack_id: rack ? rack.id : "",
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
                            if (IsAllOption(powerSourceType)) {
                                setFilter((prevState) => {
                                    return {
                                        ...prevState,
                                        pdu: totalOption,
                                    };
                                });
                                setPduOptions(defaultPduOptions);
                            } else {
                                if (queryData.length > 1) {
                                    setFilter((prevState) => {
                                        return {
                                            ...prevState,
                                            pdu: totalOption,
                                        };
                                    });
                                    setPduOptions(
                                        defaultPduOptions
                                            .map((opt) => ({
                                                ...opt,
                                                name: `${opt.name} ${
                                                    powerSourceType
                                                        ? powerSourceType.name
                                                        : ""
                                                }`,
                                            }))
                                            .concat(queryData)
                                    );
                                } else {
                                    setFilter((prevState) => {
                                        return {
                                            ...prevState,
                                            pdu: queryData[0],
                                        };
                                    });
                                    setPduOptions(queryData);
                                }
                            }
                        }
                    } else {
                        // Set empty data
                        if (mounted) {
                            setFilter((prevState) => {
                                return {
                                    ...prevState,
                                    pdu: null,
                                };
                            });
                            setPduOptions([]);
                        }
                    }
                } else {
                    toast.error("Error getting pdu data", {
                        toastId: "error-get-pdu",
                    });
                }
            } catch (e) {
                if (!axios.isCancel(e)) {
                    toast.error("Error calling API to get pdu data", {
                        toastId: "error-get-pdu",
                    });
                }
            }
        };

        if (filter.rack) {
            (async () => {
                // Set isLoading to TRUE
                setIsLoadingInput((prevState) => ({ ...prevState, pdu: true }));

                if (IsRackType(filter.powerType) && filter.rack) {
                    await getPdu(filter.powerSourceType, filter.rack);
                } else {
                    // Set empty data
                    if (mounted) {
                        setFilter((prevState) => {
                            return {
                                ...prevState,
                                pdu: null,
                            };
                        });
                        setPduOptions([]);
                    }
                }

                // Set isLoading to FALSE
                setIsLoadingInput((prevState) => ({
                    ...prevState,
                    pdu: false,
                }));
            })();
        }

        return () => {
            cancelToken.cancel();
            mounted = false;
        };
    }, [filter.powerSourceType, filter.powerType, filter.rack, setFilter]);

    // Get floors on component load
    useEffect(() => {
        // Internal variable
        let cancelToken = axios.CancelToken.source();
        let mounted = true;

        // Internal functions
        const getFloors = async () => {
            // Call JDBC query to get all floors
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_JDBC) +
                    process.env.REACT_APP_CONNECTIVITY_GET_FLOORS,
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

                        if (mounted) {
                            setOptions((prevState) => {
                                return {
                                    ...prevState,
                                    floors: queryData.map((row) => {
                                        return {
                                            id: row.floor_id,
                                            name: row.floor_name,
                                        };
                                    }),
                                };
                            });
                        }
                    } else {
                        if (mounted) {
                            setOptions((prevState) => {
                                return {
                                    ...prevState,
                                    floors: [],
                                };
                            });
                        }
                    }
                } else {
                    toast.error("Error getting floors data", {
                        toastId: "error-get-floors",
                    });
                }
            } catch (e) {
                if (!axios.isCancel(e)) {
                    toast.error("Error calling API to get floors data", {
                        toastId: "error-get-floors",
                    });
                }
            }
        };

        (async () => {
            // Set isLoading to TRUE
            setIsLoadingInput((prevState) => ({ ...prevState, floors: true }));

            await getFloors();

            // Set isLoading to FALSE
            setIsLoadingInput((prevState) => ({ ...prevState, floors: false }));
        })();

        return () => {
            cancelToken.cancel();
            mounted = false;
        };
    }, []);

    // Update racks when the filter changes
    useEffect(() => {
        // Internal variable
        let cancelToken = axios.CancelToken.source();
        let mounted = true;

        // Internal functions
        const getRacks = async (floorId, roomId) => {
            // Call DataHub query to get racks based on the floor and room
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_DATA_HUB) +
                    process.env.REACT_APP_POWER_GET_RACKS,
                headers: {
                    authorization: getToken(),
                },
                data: {
                    floor_id:
                        floorId === null || floorId === undefined
                            ? ""
                            : floorId,
                    room_id:
                        roomId === null || roomId === undefined ? "" : roomId,
                },
                cancelToken: cancelToken.token,
            };

            try {
                const result = await axios(config);

                if (result.status === 200) {
                    let { data } = result;

                    if (data.count > 0) {
                        let { data: queryData } = data;

                        queryData = queryData.map((row) => {
                            return {
                                id: row.rack_id,
                                name: row.rack_number,
                            };
                        });

                        if (mounted) {
                            setOptions((prevState) => {
                                return {
                                    ...prevState,
                                    racks: queryData,
                                };
                            });

                            if (
                                !(
                                    filter.rack &&
                                    queryData.find(
                                        (rack) => rack.id === filter.rack.id
                                    )
                                )
                            ) {
                                setFilter((prevState) => {
                                    return {
                                        ...prevState,
                                        rack: null,
                                    };
                                });
                                setRackNumber("");
                            }
                        }
                    } else {
                        if (mounted) {
                            setOptions((prevState) => {
                                return {
                                    ...prevState,
                                    racks: [],
                                };
                            });
                            setFilter((prevState) => {
                                return {
                                    ...prevState,
                                    rack: null,
                                };
                            });
                        }
                    }
                } else {
                    toast.error("Error getting racks data", {
                        toastId: "error-get-racks",
                    });
                }
            } catch (e) {
                if (!axios.isCancel(e)) {
                    toast.error("Error calling API to get racks data", {
                        toastId: "error-get-racks",
                    });
                }
            }
        };

        (async () => {
            if (filter.powerType && IsRackType(filter.powerType)) {
                // Set isLoading to TRUE
                setIsLoadingInput((prevState) => ({
                    ...prevState,
                    racks: true,
                }));

                // Get racks based on the filter
                await getRacks(rackFilter.floorId, rackFilter.roomId);

                // Set isLoading to FALSE
                setIsLoadingInput((prevState) => ({
                    ...prevState,
                    racks: false,
                }));
            }
        })();

        return () => {
            cancelToken.cancel();
            mounted = false;
        };
    }, [
        rackFilter.floorId,
        rackFilter.roomId,
        filter.powerSourceType,
        filter.powerType,
        setFilter,
    ]);

    // Get power source types, power types, and racks on component mount
    useEffect(() => {
        // Internal variables
        let cancelToken = axios.CancelToken.source();
        let mounted = true;

        // Internal functions
        const getPowerSourceTypes = async () => {
            // Set isLoading to TRUE
            setIsLoadingInput((prevState) => ({
                ...prevState,
                powerSourceTypes: true,
            }));

            // Call JDBC query to get power source types
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_JDBC) +
                    process.env.REACT_APP_POWER_GET_POWER_SOURCE_TYPES,
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

                        if (mounted) {
                            setOptions((prevState) => {
                                return {
                                    ...prevState,
                                    powerSourceTypes:
                                        defaultPowerSourceTypeOptions.concat(
                                            queryData
                                        ),
                                };
                            });
                        }
                    } else {
                        if (mounted) {
                            setOptions((prevState) => {
                                return {
                                    ...prevState,
                                    powerSourceTypes: [],
                                };
                            });
                        }
                    }
                } else {
                    toast.error("Error getting power source types data", {
                        toastId: "error-get-pst",
                    });
                }
            } catch (e) {
                if (!axios.isCancel(e)) {
                    toast.error(
                        "Error calling API to get power source types data",
                        {
                            toastId: "error-get-pst",
                        }
                    );
                }
            }

            // Set isLoading to FALSE
            setIsLoadingInput((prevState) => ({
                ...prevState,
                powerSourceTypes: false,
            }));
        };

        const getPowerTypes = async () => {
            // Set isLoading to TRUE
            setIsLoadingInput((prevState) => ({
                ...prevState,
                powerTypes: true,
            }));

            // Call JDBC query to get power types
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_JDBC) +
                    process.env.REACT_APP_POWER_GET_POWER_TYPES,
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

                        let atsPowerType = queryData.find(
                            (pt) => pt.name === "MSB"
                        );

                        if (mounted) {
                            setFilter((prevState) => ({
                                ...prevState,
                                powerType: atsPowerType
                                    ? atsPowerType
                                    : queryData[0],
                            }));
                            setOptions((prevState) => {
                                return {
                                    ...prevState,
                                    powerTypes: queryData,
                                };
                            });
                        }
                    } else {
                        if (mounted) {
                            setFilter((prevState) => ({
                                ...prevState,
                                powerType: null,
                            }));
                            setOptions((prevState) => {
                                return {
                                    ...prevState,
                                    powerTypes: [],
                                };
                            });
                        }
                    }
                } else {
                    toast.error("Error getting power types data", {
                        toastId: "error-get-pt",
                    });
                }
            } catch (e) {
                if (!axios.isCancel(e)) {
                    toast.error("Error calling API to get power types data", {
                        toastId: "error-get-pt",
                    });
                }
            }

            // Set isLoading to FALSE
            setIsLoadingInput((prevState) => ({
                ...prevState,
                powerTypes: false,
            }));
        };

        (async () => {
            await Promise.all([getPowerSourceTypes(), getPowerTypes()]);
        })();

        return () => {
            cancelToken.cancel();
            mounted = false;
        };
    }, [setFilter]);

    // Get children
    useEffect(() => {
        // Internal variables
        let cancelToken = axios.CancelToken.source();
        let mounted = true;

        // Internal functions
        const getChildren = async (powerSourceType) => {
            // Call JDBC query to get children of selected parent power type
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_JDBC) +
                    process.env.REACT_APP_POWER_GET_POWER_TYPE_CHILDREN,
                headers: {
                    authorization: getToken(),
                },
                data: {
                    parent_id: filter.powerType ? filter.powerType.id : "",
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
                            if (queryData.length > 1) {
                                if (IsAllOption(powerSourceType)) {
                                    setFilter((prevState) => ({
                                        ...prevState,
                                        child: totalOption,
                                    }));
                                    setOptions((prevState) => {
                                        return {
                                            ...prevState,
                                            children:
                                                defaultChildrenOptions.concat(
                                                    queryData
                                                ),
                                        };
                                    });
                                } else {
                                    setFilter((prevState) => ({
                                        ...prevState,
                                        child: totalOption,
                                    }));
                                    setOptions((prevState) => {
                                        return {
                                            ...prevState,
                                            children: defaultChildrenOptions
                                                .map((opt) => ({
                                                    ...opt,
                                                    name: `${opt.name} ${
                                                        powerSourceType
                                                            ? powerSourceType.name
                                                            : ""
                                                    }`,
                                                }))
                                                .concat(queryData),
                                        };
                                    });
                                }
                            } else {
                                setFilter((prevState) => ({
                                    ...prevState,
                                    child: queryData[0],
                                }));
                                setOptions((prevState) => {
                                    return {
                                        ...prevState,
                                        children: queryData,
                                    };
                                });
                            }
                        }
                    } else {
                        if (mounted) {
                            setFilter((prevState) => ({
                                ...prevState,
                                child: null,
                            }));
                            setOptions((prevState) => {
                                return {
                                    ...prevState,
                                    children: [],
                                };
                            });
                        }
                    }
                } else {
                    toast.error("Error getting power types children data", {
                        toastId: "error-get-children",
                    });
                }
            } catch (e) {
                if (!axios.isCancel(e)) {
                    toast.error(
                        "Error calling API to get power types children data",
                        {
                            toastId: "error-get-children",
                        }
                    );
                }
            }
        };

        if (IsParentType(filter.powerType)) {
            (async () => {
                // Set isLoading to TRUE
                setIsLoading((prevState) => ({
                    ...prevState,
                    getChild: true,
                }));

                await getChildren(filter.powerSourceType);

                // Set isLoading to FALSE
                setIsLoading((prevState) => ({
                    ...prevState,
                    getChild: false,
                }));
            })();
        }

        return () => {
            cancelToken.cancel();
            mounted = false;
        };
    }, [filter.powerSourceType, filter.powerType, setFilter, getChildTrigger]);

    return (
        <React.Fragment>
            <div className='power-header-container-title'>
                <span id='power-management'>{EnumPowerManagement.TITLE}</span>
                <Timer />
            </div>
            <div className='power-header-menu-container'>
                <div className='power-header-menu-container__ps-filter'>
                    <InputDropdownHorizontal
                        inputWidth={"120px"}
                        label={"Type"}
                        name={"power-type"}
                        options={options.powerTypes}
                        value={filter.powerType ? filter.powerType.id : ""}
                        onChange={handleChange}
                        useAltColor={false}
                        noEmptyOption={true}
                        isLoading={isLoadingInput.powerTypes}
                    />
                    {IsRackType(filter.powerType) ? (
                        <InputDropdownHorizontal
                            inputWidth={"150px"}
                            name='floor'
                            label='Floor'
                            value={rackFilter.floorId ? rackFilter.floorId : ""}
                            options={options.floors}
                            onChange={handleChange}
                            isLoading={isLoadingInput.floors}
                        />
                    ) : null}
                    {IsRackType(filter.powerType) ? (
                        <InputDropdownHorizontal
                            inputWidth={"150px"}
                            name='room'
                            label='Room'
                            value={rackFilter.roomId ? rackFilter.roomId : ""}
                            options={options.rooms}
                            onChange={handleChange}
                            isDisabled={
                                rackFilter.floorId === null ||
                                rackFilter.floorId === undefined
                            }
                            isLoading={isLoadingInput.rooms}
                        />
                    ) : null}
                    {IsRackType(filter.powerType) ? (
                        <InputTextAutoSuggestHorizontal
                            inputWidth='100px'
                            name='rack'
                            label='Rack No.'
                            value={rackNumber}
                            options={options.racks.map((rack) => rack.name)}
                            isLoading={isLoadingInput.racks}
                            onChange={handleChange}
                            isResponsive={true}
                            onClear={() => {
                                setRackNumber("");
                            }}
                            validateInput={(e) => {
                                let { value } = e.target;

                                if (isValidRackNumber(value)) {
                                    let rack = options.racks.find(
                                        (rack) => rack.name === value
                                    );

                                    setFilter((prevState) => ({
                                        ...prevState,
                                        rack: rack,
                                    }));
                                } else {
                                    setFilter((prevState) => ({
                                        ...prevState,
                                        rack: null,
                                    }));
                                    setRackNumber("");

                                    if (value !== "") {
                                        toast.error("Invalid rack number");
                                    }
                                }
                            }}
                        />
                    ) : null}
                    <InputDropdownHorizontal
                        inputWidth={"80px"}
                        label={"Power Source"}
                        name={"power-source-type"}
                        options={options.powerSourceTypes}
                        value={
                            filter.powerSourceType
                                ? filter.powerSourceType.id
                                : ""
                        }
                        onChange={handleChange}
                        useAltColor={false}
                        noEmptyOption={true}
                        isLoading={isLoadingInput.powerSourceTypes}
                    />
                    {IsRackType(filter.powerType) && filter.rack ? (
                        <InputDropdownHorizontal
                            labelWidth={"auto"}
                            inputWidth={"auto"}
                            label={"PDU"}
                            name={"pdu"}
                            options={pduOptions}
                            value={filter.pdu ? filter.pdu.id : ""}
                            onChange={handlePduChange}
                            useAltColor={false}
                            noEmptyOption={true}
                            isDisabled={!pduOptions || pduOptions.length <= 0}
                            isLoading={isLoadingInput.pdu}
                        />
                    ) : null}
                    {IsParentType(filter.powerType) ? (
                        <React.Fragment>
                            <InputDropdownHorizontal
                                labelWidth='auto'
                                inputWidth='150px'
                                name='child'
                                label={filter.powerType.name}
                                value={filter.child ? filter.child.id : ""}
                                options={
                                    options.children ? options.children : []
                                }
                                onChange={handleChange}
                                isDisabled={
                                    filter.powerType === null ||
                                    filter.powerType === undefined
                                }
                                useAltColor={false}
                                noEmptyOption={true}
                                isLoading={isLoading.getChild}
                            />
                            {/* <InputDropdownCreatableHorizontal
                            labelWidth='auto'
                            inputWidth='150px'
                            name='child'
                            label={filter.powerType.name}
                            value={
                                filter.child
                                    ? {
                                          label: filter.child.name,
                                          value: filter.child.id,
                                      }
                                    : ""
                            }
                            options={
                                options.children
                                    ? options.children.map((child) => ({
                                          value: child.id,
                                          label: child.name,
                                      }))
                                    : []
                            }
                            onSelect={(selectedOption) => {
                                let currentValue = filter.child
                                    ? filter.child.id
                                    : null;
                                let { value } = selectedOption;

                                if (!currentValue || currentValue !== value) {
                                    let e = {
                                        target: {
                                            name: "child",
                                            value: value,
                                        },
                                    };

                                    handleChange(e);
                                }
                            }}
                            onCreateOption={(createdItem) => {
                                if (getUAC("add")) {
                                    (async () => {
                                        await createChild(createdItem);
                                    })();
                                }
                            }}
                            onDeleteOption={(deletedItem) => {
                                if (getUAC("delete")) {
                                    (async () => {
                                        await deleteChild(deletedItem);
                                    })();
                                }
                            }}
                            isLoading={isLoading.getChild}
                        /> */}
                        </React.Fragment>
                    ) : null}
                </div>
                <div className='power-header-menu-container__date-filter'>
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

                                try {
                                    let exportedPSUsage = await exportPSUsage();
                                    let exportedPowerEnergy =
                                        await exportPowerEnergy();

                                    let data =
                                        exportedPSUsage.concat(
                                            exportedPowerEnergy
                                        );

                                    exportCSVFile(
                                        data,
                                        `Power_[${getCurrentTimestamp()}]_[${
                                            filter.powerSourceType.name
                                        }]_[${
                                            filter.powerType
                                                ? filter.powerType.name
                                                : "AllType"
                                        }]_[${
                                            filter.rack
                                                ? filter.rack.name
                                                : "AllRack"
                                        }]_[${startDate}]_[${duration}]`
                                    );
                                } catch (e) {
                                    // toast.error(
                                    //     "Error exporting power data"
                                    // );
                                }

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

export default PowerHeader;
