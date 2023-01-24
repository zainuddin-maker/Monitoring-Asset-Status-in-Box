// System library imports
import React, { useState, useEffect } from "react";

// Custom library imports
import GenerateColor from "./GenerateColor";

const Rack = (props) => {
    // Destructure props
    let { rack, rackItems, isHide } = props;
    isHide = isHide ? true : false;
    // rack = {
    //     ...
    //     numberOfU: 45,
    // }

    // rackItems =
    // [
    //     {
    //         id: 1,
    //         itemNumber: "SV-BP-001",
    //         isFull: true,
    //         isLeft: null,
    //         uStart: 1,
    //         uNeeded: 1,
    //     },
    //     {
    //         id: 3,
    //         itemNumber: "PS4-003",
    //         isFull: false,
    //         isLeft: true,
    //         uStart: 22,
    //         uNeeded: 5,
    //     },
    //     {
    //         id: 4,
    //         itemNumber: "PS4-004",
    //         isFull: false,
    //         isLeft: false,
    //         uStart: 20,
    //         uNeeded: 5,
    //     },
    // ]

    // Constants
    const dummyRack = Array(45)
        .fill({})
        .map((item, index) => {
            return (
                <tr key={index} className='reusable-rack__row'>
                    <td
                        className='reusable-rack__row__number'
                        style={{ height: isHide ? "14px" : "" }}>
                        {!isHide && `${45 - index}`}
                    </td>
                    <td
                        style={{ border: isHide ? "1px solid #000000" : "" }}
                        colSpan={2}
                        className='reusable-rack__row__content'
                    />
                </tr>
            );
        });

    // States
    const [renderedRack, setRenderedRack] = useState([]);

    // Side-effects
    // Render the prop's rack and its items
    useEffect(() => {
        if (rack && rack.numberOfU) {
            // Declare rackTable variable
            let rackTable;

            // Check if the rack contains any rackItem
            if (rackItems && rackItems.length > 0) {
                // Generate
                rackTable = Array(rack.numberOfU)
                    .fill({})
                    .map((rackRow, index) => {
                        // Declare leftSlot and rightSlot variable
                        let leftSlot;
                        let rightSlot;

                        // Find rack item for the current slot
                        let currentRowItems = rackItems.filter(
                            (item) =>
                                item.uNeeded > 0 &&
                                item.uStart <= rack.numberOfU - index &&
                                rack.numberOfU - index <
                                    item.uStart + item.uNeeded
                        );

                        if (currentRowItems.length > 0) {
                            // Check if first item isFull
                            let firstItem = currentRowItems[0];
                            let firstItemIndex = rackItems.findIndex(
                                (item) => item.id === firstItem.id
                            );

                            if (firstItem.isFull) {
                                leftSlot = {
                                    isEmpty: false,
                                    itemNumber: firstItem.itemNumber,
                                    isFirst:
                                        rack.numberOfU - index ===
                                        firstItem.uStart +
                                            firstItem.uNeeded -
                                            1,
                                    uNeeded: firstItem.uNeeded,
                                    referencedItemIndex: firstItemIndex,
                                };
                                rightSlot = {
                                    isEmpty: false,
                                    itemNumber: firstItem.itemNumber,
                                    isFirst:
                                        rack.numberOfU - index ===
                                        firstItem.uStart +
                                            firstItem.uNeeded -
                                            1,
                                    uNeeded: firstItem.uNeeded,
                                    referencedItemIndex: firstItemIndex,
                                };
                            } else {
                                // Check if there is a second item
                                if (currentRowItems.length > 1) {
                                    let secondItem = currentRowItems[1];
                                    let secondItemIndex = rackItems.findIndex(
                                        (item) => item.id === secondItem.id
                                    );

                                    leftSlot = {
                                        isEmpty: !(
                                            firstItem.isLeft ||
                                            secondItem.isLeft
                                        ),
                                        itemNumber: firstItem.isLeft
                                            ? firstItem.itemNumber
                                            : secondItem.isLeft
                                            ? secondItem.itemNumber
                                            : null,
                                        isFirst: firstItem.isLeft
                                            ? rack.numberOfU - index ===
                                              firstItem.uStart +
                                                  firstItem.uNeeded -
                                                  1
                                            : secondItem.isLeft
                                            ? rack.numberOfU - index ===
                                              secondItem.uStart +
                                                  secondItem.uNeeded -
                                                  1
                                            : null,
                                        uNeeded: firstItem.isLeft
                                            ? firstItem.uNeeded
                                            : secondItem.isLeft
                                            ? secondItem.uNeeded
                                            : null,
                                        referencedItemIndex: firstItem.isLeft
                                            ? firstItemIndex
                                            : secondItem.isLeft
                                            ? secondItemIndex
                                            : null,
                                    };
                                    rightSlot = {
                                        isEmpty: !(
                                            !firstItem.isLeft ||
                                            !secondItem.isLeft
                                        ),
                                        itemNumber: !firstItem.isLeft
                                            ? firstItem.itemNumber
                                            : !secondItem.isLeft
                                            ? secondItem.itemNumber
                                            : null,
                                        isFirst: !firstItem.isLeft
                                            ? rack.numberOfU - index ===
                                              firstItem.uStart +
                                                  firstItem.uNeeded
                                            : !secondItem.isLeft
                                            ? rack.numberOfU - index ===
                                              secondItem.uStart +
                                                  secondItem.uNeeded -
                                                  1
                                            : null,
                                        uNeeded: !firstItem.isLeft
                                            ? firstItem.uNeeded
                                            : !secondItem.isLeft
                                            ? secondItem.uNeeded
                                            : null,
                                        referencedItemIndex: !firstItem.isLeft
                                            ? firstItemIndex
                                            : !secondItem.isLeft
                                            ? secondItemIndex
                                            : null,
                                    };
                                } else {
                                    leftSlot = {
                                        isEmpty: !firstItem.isLeft,
                                        itemNumber: firstItem.isLeft
                                            ? firstItem.itemNumber
                                            : null,
                                        isFirst: firstItem.isLeft
                                            ? rack.numberOfU - index ===
                                              firstItem.uStart +
                                                  firstItem.uNeeded -
                                                  1
                                            : null,
                                        uNeeded: firstItem.isLeft
                                            ? firstItem.uNeeded
                                            : null,
                                        referencedItemIndex: firstItem.isLeft
                                            ? firstItemIndex
                                            : null,
                                    };
                                    rightSlot = {
                                        isEmpty: firstItem.isLeft,
                                        itemNumber: !firstItem.isLeft
                                            ? firstItem.itemNumber
                                            : null,
                                        isFirst: !firstItem.isLeft
                                            ? rack.numberOfU - index ===
                                              firstItem.uStart +
                                                  firstItem.uNeeded -
                                                  1
                                            : null,
                                        uNeeded: !firstItem.isLeft
                                            ? firstItem.uNeeded
                                            : null,
                                        referencedItemIndex: !firstItem.isLeft
                                            ? firstItemIndex
                                            : null,
                                    };
                                }
                            }
                        } else {
                            leftSlot = {
                                isEmpty: true,
                                itemNumber: null,
                                isFirst: null,
                                uNeeded: null,
                                referencedItemIndex: -1,
                            };
                            rightSlot = {
                                isEmpty: true,
                                itemNumber: null,
                                isFirst: null,
                                uNeeded: null,
                                referencedItemIndex: -1,
                            };
                        }

                        return {
                            left: leftSlot,
                            right: rightSlot,
                        };
                    });

                // Convert the rackTable into its html element
                rackTable = rackTable.map((slot, slotIndex) => {
                    let { left, right } = slot;
                    return (
                        <tr key={slotIndex} className='reusable-rack__row'>
                            <td
                                className='reusable-rack__row__number'
                                style={{ height: isHide ? "14px" : "" }}>
                                {!isHide && `${rackTable.length - slotIndex}`}
                            </td>
                            {left.isEmpty && !right.isEmpty && (
                                <td
                                    className='reusable-rack__row__content reusable-rack__row__content--half'
                                    style={{
                                        border: isHide
                                            ? "1px solid #000000"
                                            : "",
                                    }}
                                />
                            )}
                            {!left.isEmpty &&
                                left.isFirst &&
                                left.itemNumber !== right.itemNumber && (
                                    <td
                                        style={{
                                            border: isHide
                                                ? "1px solid #000000"
                                                : "",
                                        }}
                                        colSpan={1}
                                        rowSpan={left.uNeeded}
                                        className='reusable-rack__row__content reusable-rack__row__content--half reusable-rack__row__content--half--left'>
                                        <div
                                            className='reusable-rack__row__content__rack-item'
                                            style={{
                                                backgroundColor: GenerateColor(
                                                    left.referencedItemIndex
                                                ),
                                                height: `${
                                                    left.uNeeded * 16 - 1
                                                }px`,
                                                width: `${90}px`,
                                            }}>
                                            <span>{left.itemNumber}</span>
                                        </div>
                                    </td>
                                )}
                            {!right.isEmpty &&
                                right.isFirst &&
                                left.itemNumber !== right.itemNumber && (
                                    <td
                                        style={{
                                            border: isHide
                                                ? "1px solid #000000"
                                                : "",
                                        }}
                                        colSpan={1}
                                        rowSpan={right.uNeeded}
                                        className='reusable-rack__row__content reusable-rack__row__content--half reusable-rack__row__content--half--right'>
                                        <div
                                            className='reusable-rack__row__content__rack-item'
                                            style={{
                                                backgroundColor: GenerateColor(
                                                    right.referencedItemIndex
                                                ),
                                                height: `${
                                                    right.uNeeded * 16 - 1
                                                }px`,
                                                width: `${89}px`,
                                            }}>
                                            <span>{right.itemNumber}</span>
                                        </div>
                                    </td>
                                )}
                            {left.isEmpty && right.isEmpty ? (
                                <td
                                    style={{
                                        border: isHide
                                            ? "1px solid #000000"
                                            : "",
                                    }}
                                    colSpan={2}
                                    className='reusable-rack__row__content'
                                />
                            ) : !left.isEmpty &&
                              !right.isEmpty &&
                              left.itemNumber === right.itemNumber ? (
                                left.isFirst ? (
                                    <td
                                        style={{
                                            border: isHide
                                                ? "1px solid #000000"
                                                : "",
                                        }}
                                        colSpan={2}
                                        rowSpan={left.uNeeded}
                                        className='reusable-rack__row__content'>
                                        <div
                                            className='reusable-rack__row__content__rack-item'
                                            style={{
                                                backgroundColor: GenerateColor(
                                                    left.referencedItemIndex
                                                ),
                                                height: `${
                                                    left.uNeeded * 16 - 1
                                                }px`,
                                                width: `${180}px`,
                                            }}>
                                            <span>{left.itemNumber}</span>
                                        </div>
                                    </td>
                                ) : null
                            ) : null}
                            {!left.isEmpty && right.isEmpty && (
                                <td
                                    style={{
                                        border: isHide
                                            ? "1px solid #000000"
                                            : "",
                                    }}
                                    className='reusable-rack__row__content reusable-rack__row__content--half'
                                />
                            )}
                        </tr>
                    );
                });
            } else {
                // Generate empty rack
                rackTable = Array(rack.numberOfU)
                    .fill({})
                    .map((item, index) => {
                        return (
                            <tr key={index} className='reusable-rack__row'>
                                <td
                                    className='reusable-rack__row__number'
                                    style={{ height: isHide ? "14px" : "" }}>
                                    {!isHide && `${rack.numberOfU - index}`}
                                </td>
                                <td
                                    style={{
                                        border: isHide
                                            ? "1px solid #000000"
                                            : "",
                                    }}
                                    colSpan={2}
                                    className='reusable-rack__row__content'
                                />
                            </tr>
                        );
                    });
            }

            // Set the rendered rack to the generated rack
            setRenderedRack(rackTable);
        } else {
            setRenderedRack(dummyRack);
        }
    }, [rack, rackItems, isHide]);

    return (
        <React.Fragment>
            <div className='reusable-rack-container'>
                <div className='reusable-rack-container__table-container'>
                    <table className='reusable-rack'>
                        <tbody>
                            {renderedRack && renderedRack.length > 0
                                ? renderedRack
                                : dummyRack}
                        </tbody>
                    </table>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Rack;
