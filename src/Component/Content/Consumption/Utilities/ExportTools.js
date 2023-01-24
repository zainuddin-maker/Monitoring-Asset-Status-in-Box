// Custom library imports
const { numOfDataPoints, intervals } = require("../Component/EnumsRack");

export const formatTimestamp = (input) => {
    let timestamp = new Date(input);
    let year = timestamp.getFullYear().toString().padStart(4, "0");
    let month = (timestamp.getMonth() + 1).toString().padStart(2, "0");
    let date = timestamp.getDate().toString().padStart(2, "0");
    let hours = timestamp.getHours().toString().padStart(2, "0");
    let minutes = timestamp.getMinutes().toString().padStart(2, "0");
    let seconds = timestamp.getSeconds().toString().padStart(2, "0");
    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
};

export const generateTimestamps = (interval, startDate) => {
    return interval === intervals.daily
        ? Array(numOfDataPoints.daily)
              .fill({})
              .map((item, index) => {
                  let timestamp = new Date(startDate);
                  timestamp.setHours(0, 0, 0);
                  timestamp = new Date(
                      new Date(timestamp).getTime() +
                          index * 900 * 1000 - // 15 minutes step
                          (index === numOfDataPoints.daily - 1 ? 1000 : 0) // 23.59
                  );
                  return {
                      timestamp: formatTimestamp(timestamp),
                  };
              })
        : interval === intervals.weekly
        ? Array(numOfDataPoints.weekly)
              .fill({})
              .map((item, index) => {
                  let firstDayOfWeek = new Date(startDate);
                  let day = firstDayOfWeek.getDay() || 7; // Get current day number, converting Sun. to 7
                  if (day !== 1) {
                      // Only manipulate the date if it isn't Mon.
                      firstDayOfWeek.setHours(-24 * (day - 1), 0, 0);
                  } else {
                      firstDayOfWeek.setHours(0, 0, 0);
                  }

                  let lastDayOfWeek = new Date(new Date(firstDayOfWeek));
                  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
                  lastDayOfWeek.setHours(23, 59, 59);

                  let startTimestamp = new Date(startDate);
                  let endTimestamp = new Date(startDate);

                  if (firstDayOfWeek.getMonth() !== lastDayOfWeek.getMonth()) {
                      if (
                          startTimestamp.getMonth() !==
                          firstDayOfWeek.getMonth()
                      ) {
                          endTimestamp = new Date(lastDayOfWeek);
                      } else {
                          endTimestamp = new Date(lastDayOfWeek);
                          endTimestamp.setDate(1);
                          endTimestamp.setHours(0, 0, 0);
                          endTimestamp = new Date(
                              new Date(endTimestamp).getTime() - 1000
                          );
                      }
                  } else {
                      endTimestamp = new Date(lastDayOfWeek);
                  }

                  endTimestamp = new Date(endTimestamp.getTime() + 1000);

                  let timestamp = new Date(firstDayOfWeek);
                  timestamp.setHours(0, 0, 0);
                  timestamp = new Date(
                      new Date(timestamp).getTime() + index * 6 * 3600 * 1000
                  );
                  if (timestamp.getTime() === endTimestamp.getTime()) {
                      timestamp = new Date(timestamp.getTime() - 1000);
                  }
                  return {
                      timestamp: formatTimestamp(timestamp),
                  };
              })
        : interval === intervals.monthly
        ? Array(numOfDataPoints.monthly)
              .fill({})
              .map((item, index) => {
                  let timestamp = new Date(startDate);
                  timestamp.setDate(1);
                  timestamp.setHours(0, 0, 0);
                  timestamp = new Date(
                      new Date(timestamp).getTime() + index * 24 * 3600 * 1000 // 1 day step
                  );
                  return {
                      timestamp: formatTimestamp(timestamp),
                  };
              })
        : Array(numOfDataPoints.yearly)
              .fill({})
              .map((item, index) => {
                  let timestamp = new Date(startDate);
                  timestamp.setMonth(0 + index, 1);
                  timestamp.setHours(0, 0, 0);
                  return {
                      timestamp: formatTimestamp(timestamp),
                  };
              });
};

export const normalizeExportedData = (
    interval,
    startDate,
    pdus,
    thresholds,
    exported
) => {
    // Convert thresholds from array to an object
    const objThresholds = {};

    if (thresholds && thresholds.length > 0) {
        thresholds.forEach((row) => {
            objThresholds[row.pdu] = row;
        });
    }

    // Convert from menu-base to pdu-base
    let converted = {};

    pdus.forEach((pdu) => {
        Object.keys(exported).forEach((menu) => {
            Object.keys(exported[menu]).forEach((subMenu) => {
                if (!converted[pdu]) {
                    converted[pdu] = {};
                }

                // Set hour, minute, seconds to 0 if interval is monthly or yearly
                if (
                    interval === intervals.monthly ||
                    interval === intervals.yearly
                ) {
                    converted[pdu][subMenu + "_" + menu] = exported[menu][
                        subMenu
                    ][pdu].map((row) => {
                        let timestamp = new Date(row.timestamp);
                        timestamp.setHours(0, 0, 0);
                        return {
                            ...row,
                            timestamp: formatTimestamp(timestamp),
                        };
                    });
                } else {
                    converted[pdu][subMenu + "_" + menu] =
                        exported[menu][subMenu][pdu];
                }
            });
        });
    });

    // Generate timestamps as the base
    let timestamps = generateTimestamps(interval, startDate);

    // For each pdu, flatten each separate array into one array with single timestamp column
    let flattened = {};

    pdus.forEach((pdu) => {
        let body = [...timestamps];

        // Generate index for each key
        let indexes = {};
        Object.keys(converted[pdu]).forEach((key) => {
            indexes[key] = 0;
        });

        // Read data
        Object.keys(converted[pdu]).forEach((key) => {
            body = body.map((row, index) => {
                let newField = {
                    [key]: "",
                    [key + "_unit"]: "",
                };

                if (converted[pdu][key].length > 0) {
                    if (
                        converted[pdu][key][indexes[key]] &&
                        new Date(
                            converted[pdu][key][indexes[key]].timestamp
                        ).getTime() === new Date(row.timestamp).getTime()
                    ) {
                        let value = converted[pdu][key][indexes[key]].value;
                        let unit = converted[pdu][key][indexes[key]].unit;

                        indexes[key] = indexes[key] + 1;

                        newField = {
                            [key]: value,
                            [key + "_unit"]: unit,
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

        flattened[pdu] = body;
    });

    // // Append thresholds to the data
    // pdus.forEach((pdu) => {
    //     flattened[pdu] = flattened[pdu].map((row) => {
    //         let value = row;

    //         Object.keys(objThresholds[pdu]).forEach((key) => {
    //             if (key !== "pdu") {
    //                 value[key] = objThresholds[pdu][key];
    //             }
    //         });

    //         return value;
    //     });
    // });

    // let total = timestamps.map((row, index) => {
    //     let value = null;

    //     pdus.forEach((pdu) => {
    //         if (value === null) {
    //             value = { ...flattened[pdu][index] };

    //             Object.keys(value).forEach((key) => {
    //                 if (typeof value[key] === "number") {
    //                     if (
    //                         isNaN(flattened[pdu][index][key]) ||
    //                         flattened[pdu][index][key] === null
    //                     ) {
    //                         value[key] = 0;
    //                     }
    //                 }
    //             });
    //         } else {
    //             Object.keys(value).forEach((key) => {
    //                 if (typeof value[key] === "number") {
    //                     if (!isNaN(flattened[pdu][index][key])) {
    //                         value[key] += flattened[pdu][index][key];
    //                     }
    //                 }
    //             });
    //         }
    //     });

    //     Object.keys(objThresholds.total).forEach((key) => {
    //         if (key !== "pdu") {
    //             value[key] = objThresholds.total[key];
    //         } else {
    //             value[" "] = null;
    //         }
    //     });

    //     return value;
    // });

    // Combine the calculated total and the data from each pdu
    let combined = {
        ...flattened,
    };

    // Remove hour and/or date if interval is monthly or yearly
    if (interval === intervals.monthly || interval === intervals.yearly) {
        Object.keys(combined).forEach((key) => {
            if (interval === intervals.monthly) {
                // Remove hours from timestamp
                combined[key] = combined[key].map((row) => {
                    let { timestamp } = row;

                    return {
                        ...row,
                        timestamp: timestamp.toString().slice(0, -9),
                    };
                });
            } else if (interval === intervals.yearly) {
                // Remove date & hours from timestamp
                combined[key] = combined[key].map((row) => {
                    let { timestamp } = row;

                    return {
                        ...row,
                        timestamp: timestamp.toString().slice(0, -12),
                    };
                });
            }
        });
    }

    // Export data to XLSX
    let exportedData = [];

    const isValid = (value) => {
        return value !== undefined && value !== null && value !== "";
    };

    Object.keys(combined).forEach((key) => {
        exportedData.push({
            sheetName: key.toUpperCase(),
            header: [
                "timestamp",
                "apparent_power",
                "apparent_power_unit",
                // "apparent_power_warning_comparison_type",
                // "apparent_power_warning_threshold",
                // "apparent_power_warning_second_threshold",
                // "apparent_power_critical_comparison_type",
                // "apparent_power_critical_threshold",
                // "apparent_power_critical_second_threshold",
                "active_power",
                "active_power_unit",
                // "active_power_warning_comparison_type",
                // "active_power_warning_threshold",
                // "active_power_warning_second_threshold",
                // "active_power_critical_comparison_type",
                // "active_power_critical_threshold",
                // "active_power_critical_second_threshold",
                "reactive_power",
                "reactive_power_unit",
                // "reactive_power_warning_comparison_type",
                // "reactive_power_warning_threshold",
                // "reactive_power_warning_second_threshold",
                // "reactive_power_critical_comparison_type",
                // "reactive_power_critical_threshold",
                // "reactive_power_critical_second_threshold",
                "apparent_energy",
                "apparent_energy_unit",
                "active_energy",
                "active_energy_unit",
                "reactive_energy",
                "reactive_energy_unit",
            ],
            body: combined[key]
                .map((row) => ({
                    timestamp: row.timestamp,
                    apparent_power: row.apparent_power,
                    apparent_power_unit: row.apparent_power_unit,
                    // apparent_power_warning_comparison_type:
                    //     row.apparent_power_warning_comparison_type,
                    // apparent_power_warning_threshold:
                    //     row.apparent_power_warning_threshold,
                    // apparent_power_warning_second_threshold:
                    //     row.apparent_power_warning_second_threshold,
                    // apparent_power_critical_comparison_type:
                    //     row.apparent_power_critical_comparison_type,
                    // apparent_power_critical_threshold:
                    //     row.apparent_power_critical_threshold,
                    // apparent_power_critical_second_threshold:
                    //     row.apparent_power_critical_second_threshold,
                    active_power: row.active_power,
                    active_power_unit: row.active_power_unit,
                    // active_power_warning_comparison_type:
                    //     row.active_power_warning_comparison_type,
                    // active_power_warning_threshold:
                    //     row.active_power_warning_threshold,
                    // active_power_warning_second_threshold:
                    //     row.active_power_warning_second_threshold,
                    // active_power_critical_comparison_type:
                    //     row.active_power_critical_comparison_type,
                    // active_power_critical_threshold:
                    //     row.active_power_critical_threshold,
                    // active_power_critical_second_threshold:
                    //     row.active_power_critical_second_threshold,
                    reactive_power: row.reactive_power,
                    reactive_power_unit: row.reactive_power_unit,
                    // reactive_power_warning_comparison_type:
                    //     row.reactive_power_warning_comparison_type,
                    // reactive_power_warning_threshold:
                    //     row.reactive_power_warning_threshold,
                    // reactive_power_warning_second_threshold:
                    //     row.reactive_power_warning_second_threshold,
                    // reactive_power_critical_comparison_type:
                    //     row.reactive_power_critical_comparison_type,
                    // reactive_power_critical_threshold:
                    //     row.reactive_power_critical_threshold,
                    // reactive_power_critical_second_threshold:
                    //     row.reactive_power_critical_second_threshold,
                    apparent_energy: row.apparent_energy,
                    apparent_energy_unit: row.apparent_energy_unit,
                    active_energy: row.active_energy,
                    active_energy_unit: row.active_energy_unit,
                    reactive_energy: row.reactive_energy,
                    reactive_energy_unit: row.reactive_energy_unit,
                }))
                .filter(
                    (row) =>
                        isValid(row.apparent_power) ||
                        isValid(row.apparent_power_unit) ||
                        isValid(row.active_power) ||
                        isValid(row.active_power_unit) ||
                        isValid(row.reactive_power) ||
                        isValid(row.reactive_power_unit) ||
                        isValid(row.apparent_energy) ||
                        isValid(row.apparent_energy_unit) ||
                        isValid(row.active_energy) ||
                        isValid(row.active_energy_unit) ||
                        isValid(row.reactive_energy) ||
                        isValid(row.reactive_energy_unit)
                ),
        });
    });

    return exportedData;
};
