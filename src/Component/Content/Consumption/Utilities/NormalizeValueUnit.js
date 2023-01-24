export const round = (num) => {
    if (!isNaN(num)) {
        let m = Number((Math.abs(num) * 100).toPrecision(15));
        return (Math.round(m) / 100) * Math.sign(num);
    } else {
        return num;
    }
};

export const normalizeValueUnit = (value, unit) => {
    // Validate input
    if (
        isNaN(value) ||
        value === undefined ||
        value === null ||
        !unit ||
        (unit && unit.length <= 0)
    ) {
        return { value: "---", unit };
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

export const normalizeValueUnitModifier = (value, unit) => {
    let modifier = 1;
    let newUnit = unit;

    // Validate input
    if (
        isNaN(value) ||
        value === undefined ||
        value === null ||
        !unit ||
        (unit && unit.length <= 0)
    ) {
        return { modifier, unit };
    }

    // Check the first character (case sensitive)
    let currentPrefix = unit[0];

    switch (currentPrefix) {
        case "M": // 10^6
            if (Math.abs(value) >= 0.001 && Math.abs(value) < 1) {
                modifier = 1e3;
                newUnit = "k" + unit.slice(1);
            } else if (Math.abs(value) < 0.001) {
                modifier = 1e6;
                newUnit = unit.slice(1);
            }
            break;
        case "k": // 10^3
            if (Math.abs(value) / 1e3 >= 1) {
                modifier = 1 / 1e3;
                newUnit = "M" + unit.slice(1);
            } else if (Math.abs(value) < 1) {
                modifier = 1e3;
                newUnit = unit.slice(1);
            }
            break;
        default:
            if (Math.abs(value) / 1e6 >= 1) {
                modifier = 1 / 1e6;
                newUnit = "M" + unit;
            } else if (Math.abs(value) / 1e3 >= 1) {
                modifier = 1 / 1e3;
                newUnit = "k" + unit;
            }
            break;
    }

    return {
        modifier: modifier,
        unit: newUnit,
    };
};
