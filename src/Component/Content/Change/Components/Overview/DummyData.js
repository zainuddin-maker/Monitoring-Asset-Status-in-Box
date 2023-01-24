import IconChangeUp from "../../../../../svg/change_up.svg";
import IconChangeStatic from "../../../../../svg/change_static.svg";
import IconChangeDown from "../../../../../svg/change_down.svg";
import M from "minimatch";

const DummyChange = ({ type, value }) => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
            }}>
            <img
                src={
                    type === "up"
                        ? IconChangeUp
                        : type === "down"
                        ? IconChangeDown
                        : IconChangeStatic
                }
            />
            {value}
        </div>
    );
};

const ColumnChange = ({ children }) => {
    return (
        <div style={{ display: "flex", gap: "10px", marginLeft: "35px" }}>
            {children}
        </div>
    );
};
export const DummyRackTable = {
    header: ["", "Occupied Change", "Total Occupied"],
    body: [
        [
            "Today",
            <ColumnChange>
                <DummyChange type='up' value='29' />
                <DummyChange type='static' value='35' />
            </ColumnChange>,
            "60",
        ],
        [
            "MTD",
            <ColumnChange>
                <DummyChange type='up' value='29' />
                <DummyChange type='up' value='35' />
            </ColumnChange>,
            ,
            "60",
        ],
        [
            "YTD",
            <ColumnChange>
                <DummyChange type='up' value='29' />
                <DummyChange type='up' value='35' />
            </ColumnChange>,
            ,
            "38",
        ],
    ],
};
export const PrevRackTable = {
    header: ["", "Previous Occupancy Rate"],
    body: [
        [
            "Yesterday",
            <ColumnChange>
                <span>17</span>
                <span>20%</span>
            </ColumnChange>,
        ],
        [
            "Last Month",
            <ColumnChange>
                <span>17</span>
                <span>20%</span>
            </ColumnChange>,
        ],
        [
            "Last Year",
            <ColumnChange>
                <span>17</span>
                <span>20%</span>
            </ColumnChange>,
        ],
    ],
};

export const createDataRackChangeOccupation = (data) => {
    let tempArray = [];
    if (data.length > 0) {
        data.forEach((val, index) => {
            let firstColumn = "";
            let percentageChange;
            if (val.date_type === "today") {
                firstColumn = "Today";
            } else if (val.date_type === "mtd") {
                firstColumn = "MTD";
            } else if (val.date_type === "ytd") {
                firstColumn = "YTD";
            }

            percentageChange = (
                (parseFloat(val.change_occupation) /
                    parseFloat(val.prev_occupancy)) *
                100
            ).toFixed(1);
            percentageChange = isFinite(percentageChange)
                ? percentageChange
                : val.change_occupation * 100;
            if (val.date_type !== "before_ytd") {
                tempArray.push([
                    firstColumn,
                    <ColumnChange>
                        <DummyChange
                            type={
                                val.change_occupation > 0
                                    ? "up"
                                    : val.change_occupation < 0
                                    ? "down"
                                    : "static"
                            }
                            value={Math.abs(val.change_occupation)}
                        />
                        <DummyChange
                            type={
                                percentageChange > 0
                                    ? "up"
                                    : percentageChange < 0
                                    ? "down"
                                    : "static"
                            }
                            value={Math.abs(percentageChange) + "%"}
                        />
                    </ColumnChange>,
                    val.total_occupied,
                    // (
                    //     (parseFloat(val.total_occupied) /
                    //         parseFloat(val.total_rack)) *
                    //     100
                    // ).toFixed(1) + "%",
                ]);
            }
        });
        return tempArray;
    } else {
        return [
            [
                "Today",
                <ColumnChange>
                    <DummyChange type='static' value='---' />
                    <DummyChange type='static' value='---' />
                </ColumnChange>,
                "---",
            ],
            [
                "MTD",
                <ColumnChange>
                    <DummyChange type='static' value='---' />
                    <DummyChange type='static' value='---' />
                </ColumnChange>,
                ,
                "---",
            ],
            [
                "YTD",
                <ColumnChange>
                    <DummyChange type='static' value='---' />
                    <DummyChange type='static' value='---' />
                </ColumnChange>,
                ,
                "---",
            ],
        ];
    }
};

export const createPrevDataRackChangeOccupation = (data) => {
    let tempArray = [];
    if (data.length > 0) {
        data.forEach((val, index) => {
            let firstColumn = "";
            let percentageChange;
            if (val.date_type === "today") {
                firstColumn = "Yesterday";
            } else if (val.date_type === "mtd") {
                firstColumn = "Last Month";
            } else if (val.date_type === "ytd") {
                firstColumn = "Last Year";
            }
            let occupancy_rate = (
                (parseFloat(val.prev_occupancy) / parseFloat(val.total_rack)) *
                100
            ).toFixed(1);
            if (val.date_type !== "before_ytd") {
                tempArray.push([
                    firstColumn,
                    <ColumnChange>
                        <span>{val.prev_occupancy}</span>
                        <span>{occupancy_rate}%</span>
                    </ColumnChange>,
                ]);
            }
        });
        return tempArray;
    } else {
        return [
            [
                "Yesterday",
                <ColumnChange>
                    <span>---</span>
                    <span>---%</span>
                </ColumnChange>,
            ],
            [
                "Last Month",
                <ColumnChange>
                    <span>---</span>
                    <span>---%</span>
                </ColumnChange>,
            ],
            [
                "Last Year",
                <ColumnChange>
                    <span>---</span>
                    <span>---%</span>
                </ColumnChange>,
            ],
        ];
    }
};

export const createItemRegisteredChange = (data) => {
    let tempArray = [];
    if (data.length > 0) {
        data.forEach((val, index) => {
            let firstColumn = "";
            let percentageChange;
            let prev_total_item = val.total_item - val.registered_change;
            if (val.date_type === "today") {
                firstColumn = "Today";
            } else if (val.date_type === "mtd") {
                firstColumn = "MTD";
            } else if (val.date_type === "ytd") {
                firstColumn = "YTD";
            }

            percentageChange = (
                (parseFloat(val.registered_change) /
                    parseFloat(prev_total_item)) *
                100
            ).toFixed(1);
            if (val.date_type !== "before_ytd") {
                tempArray.push([
                    firstColumn,
                    <ColumnChange>
                        <DummyChange
                            type={
                                val.registered_change > 0
                                    ? "up"
                                    : val.registered_change < 0
                                    ? "down"
                                    : "static"
                            }
                            value={Math.abs(val.registered_change)}
                        />
                        <DummyChange
                            type={
                                percentageChange > 0
                                    ? "up"
                                    : percentageChange < 0
                                    ? "down"
                                    : "static"
                            }
                            value={Math.abs(percentageChange) + "%"}
                        />
                    </ColumnChange>,
                    val.total_item,
                ]);
            }
        });
        return tempArray;
    } else {
        return [
            [
                "Today",
                <ColumnChange>
                    <DummyChange type='static' value='---' />
                    <DummyChange type='static' value='---' />
                </ColumnChange>,
                "",
            ],
            [
                "MTD",
                <ColumnChange>
                    <DummyChange type='static' value='---' />
                    <DummyChange type='static' value='---' />
                </ColumnChange>,
                "---",
            ],
            [
                "YTD",
                <ColumnChange>
                    <DummyChange type='static' value='---' />
                    <DummyChange type='static' value='---' />
                </ColumnChange>,
                "---",
            ],
        ];
    }
};

export const createPrevItemRegisteredChange = (data) => {
    let tempArray = [];
    if (data.length > 0) {
        data.forEach((val, index) => {
            let firstColumn = "";
            if (val.date_type === "today") {
                firstColumn = "Yesterday";
            } else if (val.date_type === "mtd") {
                firstColumn = "Last Month";
            } else if (val.date_type === "ytd") {
                firstColumn = "Last Year";
            }
            if (val.date_type !== "before_ytd") {
                tempArray.push([
                    firstColumn,
                    val.total_item - val.registered_change,
                ]);
            }
        });
        return tempArray;
    } else {
        return [
            ["Yesterday", "---"],
            ["Last Month", "---"],
            ["Last Year", "---"],
        ];
    }
};
export const DummyItemTable = {
    header: ["", "Item Registered Change", "Total Item Registered"],
    body: [
        [
            "Today",
            <ColumnChange>
                <DummyChange type='up' value='29' />
                <DummyChange type='static' value='35' />
            </ColumnChange>,
            "---",
        ],
        [
            "MTD",
            <ColumnChange>
                <DummyChange type='up' value='29' />
                <DummyChange type='static' value='35' />
            </ColumnChange>,
            "81",
        ],
        [
            "YTD",
            <ColumnChange>
                <DummyChange type='up' value='29' />
                <DummyChange type='static' value='35' />
            </ColumnChange>,
            "64",
        ],
    ],
};

export const PrevItemTable = {
    header: ["", "Previous Total Item"],
    body: [
        ["Yesterday", "---"],
        ["Last Month", "---"],
        ["Last Year", "---"],
    ],
};
