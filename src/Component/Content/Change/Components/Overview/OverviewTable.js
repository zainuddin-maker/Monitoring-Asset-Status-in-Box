import React from "react";

const OverviewTable = (props) => {
    let { header, body, type } = props;
    return (
        <table
            className='overview-table'
            style={{
                width:
                    type === "previous"
                        ? "75%"
                        : type === "previous-item"
                        ? "70%"
                        : null,
            }}>
            <thead>
                <tr>
                    {header.length > 0 &&
                        header.map((column, index) => (
                            <th
                                key={index}
                                style={{
                                    width:
                                        (column === "Occupied Change" ||
                                            column ===
                                                "Item Registered Change") &&
                                        "200px",
                                }}>
                                {column}
                            </th>
                        ))}
                </tr>
            </thead>
            <tbody>
                {body.map((row, indexRow) => (
                    <tr key={indexRow}>
                        {row.length > 0 &&
                            row.map((column, indexColumn) => (
                                <td key={indexColumn}>{column}</td>
                            ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default OverviewTable;
