import { useEffect } from "react";
import { Tooltip } from "../../../ComponentReuseable";
function BlueprintAssetMonitoring(props) {
    let { onClick, hidegride, data, numberToLetters, isDetails } = props;

    useEffect(() => {
        const elmnt = document.getElementById("clickedRack");
        if (elmnt) {
            elmnt.scrollIntoView({
                block: "center",
                inline: "center",
                behavior: "smooth",
            });
        }
    }, [props]);

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
                                            dataRow[0].status === "Installed"
                                                ? "2px solid #fff"
                                                : dataRow.length > 0 &&
                                                  dataRow[0].status !==
                                                      "Installed"
                                                ? "2px solid rgba(250,250,250,0.2)"
                                                : "",
                                        boxSizing: "border-box",
                                    }}>
                                    {dataRow.length > 0 && (
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
                                                    dataRow[0].status ===
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
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                }}>
                                                <div
                                                    className='black-box-rack'
                                                    id={
                                                        dataRow[0].display &&
                                                        "clickedRack"
                                                    }
                                                    style={{
                                                        fontSize: "16px",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                        lineHeight: "2",
                                                        backgroundColor:
                                                            dataRow[0].display
                                                                ? "#4244D4"
                                                                : "",
                                                        cursor: "pointer",
                                                    }}>
                                                    {dataRow[0].racknumber}
                                                </div>
                                            </div>
                                        </Tooltip>
                                    )}

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
                padding: "4px",
                minWidth: "150px",
                boxSizing: "border-box",
                border: "1px solid #fff",
            }}>
            <div className='tooltip-data-table-monitoring--header'>
                <span>{data[0].racknumber}</span>
            </div>
            <div className='tooltip-data-table-monitoring--status'>
                <div>
                    <span>Total Item(s)</span>
                </div>
                <div>
                    <span>{data[0].total_item}</span>
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
                        {/* {listtounit(data[0].listitem)} */}
                        {data[0].numberOfU - data[0].total_unit}/
                        {data[0].numberOfU}
                    </span>
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
export default BlueprintAssetMonitoring;
