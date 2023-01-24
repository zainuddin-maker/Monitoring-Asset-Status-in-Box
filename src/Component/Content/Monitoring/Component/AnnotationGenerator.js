export const generateAnnotation = (
    warn1,
    warn2,
    warnComp,
    critical1,
    critical2,
    criticalComp,
    yMax,
    yMin
) => {
    let maxMinArray = [];
    maxMinArray = [
        ...maxMinArray,
        ...generateMaxMin(warn1, warn2, warnComp, yMax, yMin, "warning"),
        ...generateMaxMin(
            critical1,
            critical2,
            criticalComp,
            yMax,
            yMin,
            "critical"
        ),
    ];
    const checkOverlap = checkRangeOverlap(maxMinArray);
    if (checkOverlap.isOverlap && checkOverlap.indexToDrop !== -1) {
        // maxMinArray = maxMinArray.filter(
        //     (data, index) => index !== checkOverlap.indexToDrop
        // );
    }
    // console.log(generateAnnot(maxMinArray));
    return generateAnnot(maxMinArray);
};

const generateMaxMin = (val1, val2, compType, yMax, ymin, type) => {
    val1 = parseFloat(parseFloat(val1).toFixed(2));
    val2 = parseFloat(parseFloat(val2).toFixed(2));
    yMax = parseInt(yMax);
    ymin = parseInt(ymin);
    const arrayData = [];

    //
    if (compType) {
        switch (true) {
            case compType.startsWith("LOWER_THAN"):
                arrayData.push({
                    min: ymin,
                    max: val1,
                    type,
                });
                break;
            case compType === "HIGHER_THAN" || compType === "HIGHER_THAN_EQUAL":
                arrayData.push({
                    min: val1,
                    max: yMax,
                    type,
                });
                break;
            case compType.startsWith("HIGHER_THAN_AND") ||
                compType.startsWith("HIGHER_THAN_EQUAL_AND"):
                arrayData.push(
                    {
                        min: ymin,
                        max: val2,
                        type,
                    },
                    {
                        min: val1,
                        max: yMax,
                        type,
                    }
                );
                break;
            case compType === "BETWEEN":
                arrayData.push({
                    min: val2,
                    max: val1,
                    type,
                });
                break;
            default:
                break;
        }
    }
    //
    return arrayData;
};

const checkRangeOverlap = (ranges) => {
    let condition = {
        isOverlap: false,
        indexToDrop: -1,
    };
    ranges.forEach((a, ia) => {
        ranges.forEach((b, ib) => {
            if (a !== b) {
                if (a.min < b.max && a.max > b.min) {
                    condition.isOverlap = true;
                    if (ranges[ia].type === "critical") {
                        if (ranges[ib].type === "warning") {
                            condition.indexToDrop = ib;
                        }
                    } else if (ranges[ib].type === "critical") {
                        if (ranges[ia].type === "warning") {
                            condition.indexToDrop = ia;
                        }
                    }
                }
            }
        });
    });
    return condition;
    // true mean its overlapping -> should be critical
    // false mean not overpalling
};

const generateAnnot = (maxMinTypeArray) => {
    // console.log(maxMinTypeArray);
    let annotations = [];
    const color = {
        warning: "#FEBC2C",
        critical: "#F11B2A",
    };
    if (maxMinTypeArray.length > 0) {
        maxMinTypeArray.forEach((data) => {
            annotations.push({
                y: data.min,
                y2: data.max,
                fillColor: color[data.type],
            });
        });
    }
    return annotations;
};

// if (warnComp) {
//     switch (true) {
//         case warnComp.startsWith("LOWER_THAN"):
//             if (criticalComp.startsWith("LOWER")) {
//                 if (critical1 >= warn1) {
//                     limit.push({
//                         y: warn1,
//                         y2: yMin,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: critical1,
//                         y2: warn1,
//                         fillColor: color.critical,
//                     });
//                 } else {
//                     limit.push({
//                         y: critical1,
//                         y2: warn1,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: yMin,
//                         y2: critical1,
//                         fillColor: color.critical,
//                     });
//                 }
//             } else if (criticalComp === "BETWEEN") {
//                 if (critical2 <= warn1) {
//                     // upper warning
//                     limit.push({
//                         y: critical1,
//                         y2: warn1,
//                         fillColor: color.warning,
//                     });

//                     // critical
//                     limit.push({
//                         y: critical2,
//                         y2: critical1,
//                         fillColor: color.critical,
//                     });

//                     // push lower warning
//                     limit.push({
//                         y: yMin || 0,
//                         y2: critical2,
//                         fillColor: color.warning,
//                     });
//                 } else {
//                     // critical
//                     limit.push({
//                         y: critical2,
//                         y2: critical1,
//                         fillColor: color.critical,
//                     });

//                     // push lower warning
//                     limit.push({
//                         y: yMin || 0,
//                         y2: warn1,
//                         fillColor: color.warning,
//                     });
//                 }
//             } else if (
//                 criticalComp.startsWith("HIGHER_THAN_AND") ||
//                 criticalComp.startsWith("HIGHER_THAN_EQUAL_AND")
//             ) {
//                 if (critical2 <= warn1) {
//                     limit.push({
//                         y: critical2,
//                         y2: warn1,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: yMin,
//                         y2: critical2,
//                         fillColor: color.critical,
//                     });
//                     limit.push({
//                         y: critical1,
//                         y2: yMax,
//                         fillColor: color.critical,
//                     });
//                 } else {
//                     limit.push({
//                         y: yMin,
//                         y2: warn1,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: warn1,
//                         y2: critical2,
//                         fillColor: color.critical,
//                     });
//                     limit.push({
//                         y: critical1,
//                         y2: yMax,
//                         fillColor: color.critical,
//                     });
//                 }
//             } else if (
//                 criticalComp === "HIGHER_THAN" ||
//                 criticalComp === "HIGHER_THAN_EQUAL"
//             ) {
//                 limit.push({
//                     y: warn1,
//                     y2: yMin,
//                     fillColor: color.warning,
//                 });
//                 limit.push({
//                     y: critical1,
//                     y2: yMax,
//                     fillColor: color.critical,
//                 });
//             } else {
//                 // there is no critical
//                 limit.push({
//                     y: yMin,
//                     y2: warn1,
//                     fillColor: color.warning,
//                 });
//             }
//             return limit;
//         case warnComp === "HIGHER_THAN" || warnComp === "HIGHER_THAN_EQUAL":
//             if (criticalComp.startsWith("LOWER")) {
//                 limit.push({
//                     y: warn1,
//                     y2: yMax,
//                     fillColor: color.warning,
//                 });
//                 limit.push({
//                     y: yMin,
//                     y2: critical1,
//                     fillColor: color.critical,
//                 });
//             } else if (criticalComp === "BETWEEN" && critical1 >= warn1) {
//                 limit.push({
//                     y: warn1,
//                     y2: critical2,
//                     fillColor: color.warning,
//                 });
//                 limit.push({
//                     y: critical1,
//                     y2: yMax,
//                     fillColor: color.warning,
//                 });
//                 limit.push({
//                     y: critical2,
//                     y2: critical1,
//                     fillColor: color.critical,
//                 });
//             } else if (
//                 criticalComp === "HIGHER_THAN" ||
//                 criticalComp === "HIGHER_THAN_EQUAL"
//             ) {
//                 limit.push({
//                     y: warn1,
//                     y2: critical1,
//                     fillColor: color.warning,
//                 });
//                 limit.push({
//                     y: critical1,
//                     y2: yMax,
//                     fillColor: color.critical,
//                 });
//             } else {
//                 if (criticalComp === "BETWEEN") {
//                     limit.push({
//                         y: warn1,
//                         y2: yMax,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: critical2,
//                         y2: critical1,
//                         fillColor: color.critical,
//                     });
//                 } else {
//                     // critical is higher than and lower than
//                     if (critical1 > warn1) {
//                         limit.push({
//                             y: warn1,
//                             y2: critical1,
//                             fillColor: color.warning,
//                         });
//                         limit.push({
//                             y: critical1,
//                             y2: yMax,
//                             fillColor: color.critical,
//                         });
//                     }
//                     if (critical2 && critical2 <= warn1) {
//                         limit.push({
//                             y: warn1,
//                             y2: critical1,
//                             fillColor: color.warning,
//                         });
//                         limit.push({
//                             y: critical1,
//                             y2: yMax,
//                             fillColor: color.critical,
//                         });
//                         limit.push({
//                             y: yMin,
//                             y2: critical2,
//                             fillColor: color.critical,
//                         });
//                     }
//                     if (criticalComp === "null") {
//                         limit.push({
//                             y: warn1,
//                             y2: yMax,
//                             fillColor: color.warning,
//                         });
//                     }
//                 }
//             }
//             return limit;
//         case warnComp.startsWith("HIGHER_THAN_AND") ||
//             warnComp.startsWith("HIGHER_THAN_EQUAL_AND"):
//             if (criticalComp.startsWith("LOWER")) {
//                 if (critical1 <= warn1 && critical1 >= warn2) {
//                     limit.push({
//                         y: warn1,
//                         y2: yMax,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: yMin,
//                         y2: warn2,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: warn2,
//                         y2: critical1,
//                         fillColor: color.critical,
//                     });
//                 } else {
//                     limit.push({
//                         y: warn1,
//                         y2: yMax,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: critical1,
//                         y2: warn2,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: yMin,
//                         y2: critical1,
//                         fillColor: color.critical,
//                     });
//                 }
//             } else if (criticalComp === "BETWEEN") {
//                 if (critical2 >= warn1) {
//                     // critical higher than warning
//                     limit.push({
//                         y: warn1,
//                         y2: critical2,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: critical1,
//                         y2: yMax,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: yMin,
//                         y2: warn2,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: critical2,
//                         y2: critical1,
//                         fillColor: color.critical,
//                     });
//                 } else if (critical1 <= warn2) {
//                     // critical lower than warning
//                     limit.push({
//                         y: warn1,
//                         y2: yMax,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: critical1,
//                         y2: warn2,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: yMin,
//                         y2: critical2,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: critical2,
//                         y2: critical1,
//                         fillColor: color.critical,
//                     });
//                 } else {
//                     // critical inside the warning
//                     limit.push({
//                         y: warn1,
//                         y2: yMax,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: yMin,
//                         y2: warn2,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: critical2,
//                         y2: critical1,
//                         fillColor: color.critical,
//                     });
//                 }
//             } else if (
//                 criticalComp === "HIGHER_THAN" ||
//                 criticalComp === "HIGHER_THAN_EQUAL"
//             ) {
//                 if (warn1 <= critical1) {
//                     // critical upper the warning
//                     limit.push({
//                         y: warn1,
//                         y2: critical1,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: yMin,
//                         y2: warn2,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: critical1,
//                         y2: yMax,
//                         fillColor: color.critical,
//                     });
//                 } else {
//                     limit.push({
//                         y: warn1,
//                         y2: yMax,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: yMin,
//                         y2: warn2,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: critical1,
//                         y2: warn1,
//                         fillColor: color.critical,
//                     });
//                 }
//             } else if (
//                 criticalComp.startsWith("HIGHER_THAN_AND") ||
//                 criticalComp.startsWith("HIGHER_THAN_EQUAL_AND")
//             ) {
//                 limit.push({
//                     y: warn1,
//                     y2: yMax,
//                     fillColor: color.warning,
//                 });
//                 limit.push({
//                     y: warn2,
//                     y2: yMin,
//                     fillColor: color.warning,
//                 });
//                 limit.push({
//                     y: critical1,
//                     y2: warn1,
//                     fillColor: color.critical,
//                 });
//                 limit.push({
//                     y: warn2,
//                     y2: critical2,
//                     fillColor: color.critical,
//                 });
//             } else {
//                 if (criticalComp === "null" || !criticalComp) {
//                     limit.push({
//                         y: yMin,
//                         y2: warn2,
//                         fillColor: color.warning,
//                     });
//                     limit.push({
//                         y: warn1,
//                         y2: yMax,
//                         fillColor: color.warning,
//                     });
//                 } else {
//                     if (critical1 >= warn1 && critical2 >= warn1) {
//                         limit.push({
//                             y: warn1,
//                             y2: critical2,
//                             fillColor: color.warning,
//                         });
//                         limit.push({
//                             y: yMin,
//                             y2: warn2,
//                             fillColor: color.warning,
//                         });
//                         limit.push({
//                             y: warn1,
//                             y2: critical2,
//                             fillColor: color.warning,
//                         });
//                     }
//                 }
//             }
//             return limit;
//         case warnComp === "BETWEEN":
//             if (criticalComp.startsWith("LOWER")) {
//                 limit.push({
//                     y: warn1,
//                     y2: warn2,
//                     fillColor: color.warning,
//                 });
//                 if (critical1 <= warn1) {
//                     limit.push({
//                         y: yMin,
//                         y2: critical1,
//                         fillColor: color.critical,
//                     });
//                 } else {
//                     limit.push({
//                         y: warn1,
//                         y2: critical1,
//                         fillColor: color.critical,
//                     });
//                     limit.push({
//                         y: yMin,
//                         y2: warn2,
//                         fillColor: color.critical,
//                     });
//                 }
//             } else if (
//                 criticalComp === "HIGHER_THAN" ||
//                 criticalComp === "HIGHER_THAN_EQUAL"
//             ) {
//                 limit.push({
//                     y: warn1,
//                     y2: warn2,
//                     fillColor: color.warning,
//                 });
//                 if (critical1 <= warn1) {
//                     limit.push({
//                         y: critical1,
//                         y2: warn2,
//                         fillColor: color.critical,
//                     });
//                     limit.push({
//                         y: warn1,
//                         y2: yMax,
//                         fillColor: color.critical,
//                     });
//                 } else {
//                     limit.push({
//                         y: critical1,
//                         y2: yMax,
//                         fillColor: color.critical,
//                     });
//                 }
//             } else if (
//                 criticalComp.startsWith("HIGHER_THAN_AND") ||
//                 criticalComp.startsWith("HIGHER_THAN_EQUAL_AND")
//             ) {
//                 limit.push({
//                     y: warn2,
//                     y2: warn1,
//                     fillColor: color.warning,
//                 });
//                 if (critical1 >= warn1 && critical2 >= warn1) {
//                     // upper the warning range
//                     limit.push({
//                         y: critical2,
//                         y2: warn1,
//                         fillColor: color.critical,
//                     });
//                     limit.push({
//                         y: warn2,
//                         y2: yMin,
//                         fillColor: color.critical,
//                     });
//                     limit.push({
//                         y: critical1,
//                         y2: yMax,
//                         fillColor: color.critical,
//                     });
//                 } else if (critical1 <= warn2) {
//                     // lower the warning range
//                     limit.push({
//                         y: yMin,
//                         y2: critical2,
//                         fillColor: color.critical,
//                     });
//                     limit.push({
//                         y: critical1,
//                         y2: warn2,
//                         fillColor: color.critical,
//                     });
//                     limit.push({
//                         y: warn2,
//                         y2: yMax,
//                         fillColor: color.critical,
//                     });
//                 } else if (critical1 >= warn1 && critical2 <= warn2) {
//                     limit.push({
//                         y: critical1,
//                         y2: yMax,
//                         fillColor: color.critical,
//                     });
//                     limit.push({
//                         y: yMin,
//                         y2: critical2,
//                         fillColor: color.critical,
//                     });
//                 }
//             } else if ((criticalComp = "BETWEEN")) {
//                 limit.push({
//                     y: warn2,
//                     y2: warn1,
//                     fillColor: color.warning,
//                 });
//                 limit.push({
//                     y: critical2,
//                     y2: critical1,
//                     fillColor: color.critical,
//                 });
//             }
//         default:
//             return limit;
//     }
// } else {
//     return [];
// }
