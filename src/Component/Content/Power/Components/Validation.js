export const IsAllOption = (powerSourceType) => {
    return (
        powerSourceType &&
        typeof powerSourceType.id === "string" &&
        powerSourceType.id.toUpperCase() === "ALL"
    );
};

export const IsTotalChildrenOption = (child) => {
    return (
        child &&
        typeof child.id === "string" &&
        child.id.toUpperCase() === "TOTAL"
    );
};

export const IsTotalPduOption = (pdu) => {
    return (
        pdu && typeof pdu.id === "string" && pdu.id.toUpperCase() === "TOTAL"
    );
};

export const IsRackType = (powerType) => {
    return powerType && powerType.name.toUpperCase() === "RACK PDU";
};

export const IsParentType = (powerType) => {
    return (
        powerType &&
        (powerType.name.toUpperCase() === "ROOM PDU" ||
            powerType.name.toUpperCase() === "DB-LP")
    );
};
