import { useEffect } from "react";
import { Tooltip } from "../../../ComponentReuseable";
function ConsumptionRackBlueprint(props) {
    let { onClick, hidegride, data, isDetails, selectedRackId } = props;

    // Function for calculating rack's location
    const numberToLetters = (num) => {
        let letters = "";
        while (num >= 0) {
            letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[num % 26] + letters;
            num = Math.floor(num / 26) - 1;
        }
        return letters;
    };

    useEffect(() => {
        if (selectedRackId !== null) {
            const elmnt = document.getElementById("clickedRack");
            if (elmnt) {
                setTimeout(() => {
                    elmnt.scrollIntoView({
                        block: "center",
                        inline: "center",
                        behavior: "smooth",
                    });
                }, 100);
            }
        }
    }, [selectedRackId]);

    return (
        <table
            style={{ display: "inline-block" }}
            className={`table-no-border-header ${isDetails}  ${
                hidegride && "table-monitoring-hide-grid"
            }`}>
            <thead>
                {!isDetails && (
                    <tr>
                        <th>{numberToLetters(-1)}</th>
                        {data[0].map((dataHeader, indexHeader) => (
                            <th key={indexHeader} style={{ height: "40px" }}>
                                {hidegride ? "" : numberToLetters(indexHeader)}
                            </th>
                        ))}
                    </tr>
                )}
            </thead>
            <tbody>
                {!isDetails &&
                    data.map((dataHeader, indexHeader) => (
                        <tr key={indexHeader}>
                            <td className='first-data'>
                                {!hidegride && indexHeader + 1}
                            </td>
                            {dataHeader.map((dataRow, indexRow) => (
                                <td
                                    key={indexRow}
                                    onClick={
                                        dataRow.length > 0
                                            ? () => {}
                                            : () => {
                                                  onClick(
                                                      false,
                                                      indexHeader,
                                                      indexRow
                                                  );
                                              }
                                    }
                                    style={{
                                        border:
                                            dataRow.length > 0 &&
                                            dataRow[0].statusRack ===
                                                "Installed"
                                                ? "2px solid #fff"
                                                : dataRow.length > 0 &&
                                                  dataRow[0].statusRack !==
                                                      "Installed"
                                                ? "2px solid rgba(250,250,250,0.2)"
                                                : "",
                                        boxSizing: "border-box",
                                        backgroundColor:
                                            dataRow.length > 0 &&
                                            dataRow[0].statusPower === null
                                                ? "#735A57"
                                                : dataRow.length > 0 &&
                                                  dataRow[0].statusPower.toLowerCase() ===
                                                      "critical"
                                                ? "#F11B2A"
                                                : dataRow.length > 0 &&
                                                  dataRow[0].statusPower.toLowerCase() ===
                                                      "good"
                                                ? "#00F23D"
                                                : dataRow.length > 0 &&
                                                  dataRow[0].statusPower.toLowerCase() ===
                                                      "warning"
                                                ? "#FEBC2C"
                                                : dataRow.length > 0 &&
                                                  dataRow[0].statusPower.toLowerCase() ===
                                                      "unknown"
                                                ? "rgb(115, 90, 87)"
                                                : "",
                                        outline:
                                            dataRow.length > 0 &&
                                            (dataRow[0].display ||
                                                (selectedRackId !== null &&
                                                    selectedRackId ===
                                                        dataRow[0].rack_id))
                                                ? " 6px solid #4244D4"
                                                : "",
                                        zIndex:
                                            dataRow.length > 0 &&
                                            (dataRow[0].display ||
                                                (selectedRackId !== null &&
                                                    selectedRackId ===
                                                        dataRow[0].rack_id))
                                                ? "3"
                                                : "",
                                    }}>
                                    {dataRow.length > 0 ? (
                                        dataRow[0].statusRack ===
                                        "Installed" ? (
                                            <Tooltip
                                                tooltip={
                                                    dataRow.length === 1 ? (
                                                        <TooltipTableData
                                                            data={dataRow}
                                                        />
                                                    ) : (
                                                        <TooltipMultipleData
                                                            data={dataRow}
                                                        />
                                                    )
                                                }>
                                                <div
                                                    onClick={
                                                        dataRow[0]
                                                            .statusRack ===
                                                        "Installed"
                                                            ? () => {
                                                                  onClick(
                                                                      true,
                                                                      indexHeader,
                                                                      indexRow,
                                                                      dataRow
                                                                  );
                                                              }
                                                            : () => {}
                                                    }
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "center",
                                                        alignItems: "center",
                                                    }}>
                                                    <div
                                                        className='black-box-rack'
                                                        id={
                                                            (dataRow[0]
                                                                .display ||
                                                                (selectedRackId !==
                                                                    null &&
                                                                    selectedRackId ===
                                                                        dataRow[0]
                                                                            .rack_id)) &&
                                                            "clickedRack"
                                                        }
                                                        style={{
                                                            fontSize: "16px",
                                                            whiteSpace:
                                                                "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                            lineHeight: "2",

                                                            cursor: "pointer",
                                                            color: "#08091B",
                                                            backgroundColor:
                                                                "transparent",
                                                        }}>
                                                        {dataRow[0].racknumber}
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        ) : (
                                            <div
                                                onClick={() => {}}
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                }}>
                                                <div
                                                    className='black-box-rack'
                                                    id={
                                                        (dataRow[0].display ||
                                                            (selectedRackId !==
                                                                null &&
                                                                selectedRackId ===
                                                                    dataRow[0]
                                                                        .rack_id)) &&
                                                        "clickedRack"
                                                    }
                                                    style={{
                                                        fontSize: "16px",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                        lineHeight: "2",

                                                        cursor: "pointer",
                                                        color: "#08091B",
                                                        backgroundColor:
                                                            "transparent",
                                                    }}>
                                                    {dataRow[0].racknumber}
                                                </div>
                                            </div>
                                        )
                                    ) : null}

                                    <div
                                        style={{
                                            position: "absolute",
                                            top: -5,
                                            right: 0,
                                        }}>
                                        {dataRow.length <= 1
                                            ? ""
                                            : dataRow.length}
                                    </div>
                                </td>
                            ))}

                            {/* {isDetails && <td></td>} */}
                        </tr>
                    ))}
            </tbody>
        </table>
    );
}

const TooltipTableData = ({ data }) => {
    return (
        <div
            className='tooltip-data-table-monitoring'
            style={{
                padding: "3px",
                minWidth: "200px",
            }}>
            <div className='tooltip-data-table-monitoring--header'>
                <span>{data[0].racknumber}</span>
            </div>
            <div className='tooltip-data-table-monitoring--status'>
                <div>
                    <span>Apparent Power</span>
                </div>
                <div>
                    <span>{data[0].ApparentPower}</span>
                </div>
            </div>
            <div className='tooltip-data-table-monitoring--status'>
                <div>
                    <span>Active Power</span>
                </div>
                <div>
                    <span>{data[0].ActivePower}</span>
                </div>
            </div>
            <div className='tooltip-data-table-monitoring--status'>
                <div>
                    <span>Apparent Energy</span>
                </div>
                <div>
                    <span>{data[0].ApparentEnergy}</span>
                </div>
            </div>

            <div className='tooltip-data-table-monitoring--status'>
                <div>
                    <span>Active Energy</span>
                </div>
                <div>
                    <span>{data[0].ActiveEnergy}</span>
                </div>
            </div>
        </div>
    );
};

const TooltipMultipleData = ({ data }) => {
    return (
        <div style={{ width: "300px", display: "flex", flexWrap: "wrap" }}>
            {data.map((datarack, i) => (
                <div
                    key={i}
                    className='tooltip-data-table-monitoring'
                    style={{
                        padding: "4px",
                        width: "150px",
                        boxSizing: "border-box",
                        border: "1px solid #fff",
                    }}>
                    <div className='tooltip-data-table-monitoring--header'>
                        <span>{datarack.racknumber}</span>
                    </div>
                    <div className='tooltip-data-table-monitoring--status'>
                        <div>
                            <span>Total Item(s)</span>
                        </div>
                        <div>
                            <span>{datarack.total_item}</span>
                        </div>
                    </div>
                    <div className='tooltip-data-table-monitoring--status'>
                        <div>
                            <span
                                className={
                                    "tooltip-data-table-monitoring--status--"
                                    //  +
                                    // data.condition
                                }>
                                U(s) Available
                            </span>
                        </div>
                        <div>
                            <span>
                                {datarack.numberOfU - datarack.total_unit}/
                                {datarack.numberOfU}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
export default ConsumptionRackBlueprint;
