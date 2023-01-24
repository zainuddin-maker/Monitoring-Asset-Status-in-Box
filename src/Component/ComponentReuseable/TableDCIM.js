// System library imports
import React, { useState, useEffect } from "react";

// Custom library imports
import TableAction from "./TableAction";

// Style imports
import "./style.scss";

const TableDCIM = (props) => {
    // Destructure props
    let {
        header,
        body,
        actions,
        actionWidth,
        selectable,
        onSelect,
        customCellClassNames,
    } = props;

    // Normalize boolean value to true or false (handle null or undefined value)
    selectable = selectable ? true : false;

    // Handle if actions props is not given
    if (!actions) {
        actions = [];
    }

    // Handle if onSelect props is not given
    if (!onSelect) {
        onSelect = () => {};
    }

    // Handle if customCellClassNames props is not given
    if (!customCellClassNames) {
        customCellClassNames = {};
    }

    // States
    const [tableHeader, setTableHeader] = useState([]);
    const [tableBody, setTableBody] = useState([]);
    const [selectedItemIndex, setSelectedItemIndex] = useState(
        body.length > 0 ? 0 : null
    );

    // Side-effects
    // Convert the header props into a table header
    useEffect(() => {
        if (Object.keys(header).length > 0) {
            let headerValues = Object.values(header);
            if (actions.length > 0) {
                headerValues.push({ width: actionWidth || "100px", name: "" });
            }

            setTableHeader(headerValues);
        }
    }, [header, actions, setTableHeader]);

    // Convert the body props into a table body
    useEffect(() => {
        // Convert the header object into array of the object's keys
        // Assumption: the object key is all string, so insertion order is the same as input
        let headerKeys = Object.keys(header);

        // Convert the body array into array of array
        // Assumption: the object key is all string, so insertion order is the same as input
        const normalizeBody = (row, index) => {
            // Get current row keys and values
            let bodyKeys = Object.keys(row);
            let bodyValues = Object.values(row);

            // Sort the keys and values based on headerKeys
            let sortedValues = [];

            for (let key of headerKeys) {
                // Search for value of the current key
                let bodyIndex = bodyKeys.indexOf(key);
                let value = bodyValues[bodyIndex];

                // Check if current key has a customClassName
                if (Object.keys(customCellClassNames).includes(key)) {
                    let valueClassNamePairs = customCellClassNames[key];

                    // Check if it match a value-className pair
                    let foundMatchedIndex = valueClassNamePairs.findIndex(
                        (item) => item.value === value
                    );

                    if (foundMatchedIndex !== -1) {
                        value = {
                            value: value,
                            className:
                                valueClassNamePairs[foundMatchedIndex]
                                    .className,
                        };
                    }
                }

                // Push the value to the sortedValues array
                sortedValues.push(value);
            }

            // Concatenate actions if exists
            if (actions.length > 0) {
                // Generate TableAction array
                let tableActions = actions.map((actionItem, actionIndex) => {
                    if (actionItem.checkFunction) {
                        if (actionItem.checkFunction(row, index)) {
                            return (
                                <TableAction
                                    key={`action-${index}-${actionIndex}`}
                                    index={actionIndex}
                                    row={row}
                                    iconSrc={actionItem.iconSrc}
                                    Src={actionItem.src || null}
                                    onClick={() => {
                                        actionItem.onClick(row, index);
                                    }}
                                />
                            );
                        } else {
                            return (
                                <div
                                    className='reusable-table-dcim__action-icon--empty'
                                    key={`action-${index}-${actionIndex}`}></div>
                            );
                        }
                    } else {
                        return (
                            <TableAction
                                key={`action-${index}-${actionIndex}`}
                                index={actionIndex}
                                iconSrc={actionItem.iconSrc}
                                Src={actionItem.src || null}
                                onClick={() => {
                                    actionItem.onClick(row, index);
                                }}
                                row={row}
                            />
                        );
                    }
                });

                sortedValues.push(
                    <div className='reusable-table-dcim__actions-container'>
                        {tableActions}
                    </div>
                );
            }

            return sortedValues;
        };

        if (body.length > 0) {
            setTableBody(body.map(normalizeBody));
        } else {
            setTableBody([]);
        }
    }, [header, body, actions, setTableBody, customCellClassNames]);

    useEffect(() => {
        if (body.length > 0) {
            //    Set default selected item index
            setSelectedItemIndex(0);
            onSelect(body[0], 0);
        }
    }, [body.length]);

    // Functions
    // Map header array into header columns
    const mapHeader = (col, index) => (
        <th
            key={`headerCol-${index}`}
            style={{
                width: col.width ? col.width : null,
                minWidth: col.width ? col.width : null,
            }}>
            {typeof col === "string" ? col : col.name}
        </th>
    );

    // Map body array into table rows
    const mapBodyRow = (row, index) => (
        <tr
            key={`bodyRow-${index}`}
            className={
                selectable && index === selectedItemIndex
                    ? "reusable-table-dcim__row--selected"
                    : ""
            }
            onClick={() => {
                if (selectable) {
                    setSelectedItemIndex(index);
                    onSelect(body[index], index);
                }
            }}>
            {row.map(mapBodyCell)}
        </tr>
    );

    // Map a row into a cell
    const mapBodyCell = (cell, index) => {
        // Check if the cell is an object with a custom className
        if (typeof cell === "object" && cell !== null && cell.className) {
            return (
                <td
                    key={`bodyRowCol-${index}`}
                    className={`${cell.className} bold-column`}
                    style={
                        selectable
                            ? { cursor: "pointer" }
                            : { cursor: "default" }
                    }>
                    {cell.value}
                </td>
            );
        } else {
            return (
                <td
                    key={`bodyRowCol-${index}`}
                    style={
                        selectable
                            ? { cursor: "pointer" }
                            : { cursor: "default" }
                    }>
                    {cell}
                </td>
            );
        }
    };

    return (
        <div className='reusable-table-dcim-container' id='limit-table-dcim'>
            <table className='reusable-table-dcim'>
                <thead>
                    <tr>{tableHeader.map(mapHeader)}</tr>
                </thead>
                <tbody>
                    {tableBody.length > 0 && tableBody.map(mapBodyRow)}
                </tbody>
            </table>
        </div>
    );
};

export default TableDCIM;
