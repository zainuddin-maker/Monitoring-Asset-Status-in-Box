// System library imports
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

// Custom library imports
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { getToken } from "../../../TokenParse/TokenParse";
import {
    InputDropdownHorizontal,
    GenerateColor,
} from "../../../ComponentReuseable/index";
import ConnectedItemCard from "./Connectivity.ConnectedItems.Card";

const ConnectedItems = (props) => {
    // Destructure props
    let { rackItems, setIsLoading } = props;

    // States
    const [defaultOptions] = useState([{ id: "ALL", name: "ALL" }]);
    const [options, setOptions] = useState(defaultOptions);
    const [selectedItem, setSelectedItem] = useState(defaultOptions[0].id);
    const [connectedItems, setConnectedItems] = useState([]);
    const [displayedItems, setDisplayedItems] = useState([]);

    // Side-effects
    // Get all connected items based on the selected item
    useEffect(() => {
        // Internal variable
        let mounted = true;

        // Internal functions
        const getConnectedItems = async (rackItems) => {
            if (rackItems && rackItems.length > 0) {
                // Generate comma separated rackItemIds
                let rackItemIds = "";

                for (let rackItem of rackItems) {
                    rackItemIds = rackItemIds + `${rackItem.id},`;
                }

                rackItemIds = rackItemIds.slice(0, -1);

                // Call JDBC query to get all connected items
                let config = {
                    method: "post",
                    url:
                        ReturnHostBackend(process.env.REACT_APP_JDBC) +
                        process.env.REACT_APP_CONNECTIVITY_GET_CONNECTED_ITEMS,
                    headers: {
                        authorization: getToken(),
                    },
                    data: {
                        item_ids: rackItemIds,
                    },
                };

                try {
                    const result = await axios(config);

                    if (result.status === 200) {
                        let { data } = result;

                        if (data.count > 0) {
                            let { data: queryData } = data;

                            if (mounted) {
                                setConnectedItems(
                                    queryData.map((row) => {
                                        return {
                                            id: row.item_id,
                                            rackNumber: row.rack_number,
                                            itemNumber: row.item_number,
                                            uStart: row.u_start,
                                            uNeeded: row.u_needed,
                                            referencedItemIndex:
                                                rackItems.findIndex(
                                                    (item) =>
                                                        item.id ===
                                                        row.referenced_item_id
                                                ),
                                        };
                                    })
                                );
                            }
                        } else {
                            if (mounted) {
                                setConnectedItems([]);
                            }
                        }
                    } else {
                        setConnectedItems([]);
                        toast.error("Error getting connected items data", {
                            toastId: "error-get-connected-items",
                        });
                    }
                } catch (e) {
                    setConnectedItems([]);
                    toast.error(
                        "Error calling API to get connected items data",
                        { toastId: "error-get-connected-items" }
                    );
                }
            } else {
                if (mounted) {
                    setConnectedItems([]);
                }
            }
        };

        (async () => {
            // Set isLoading to TRUE
            if (mounted) {
                setIsLoading((prevState) => {
                    return { ...prevState, connectedItems: true };
                });
            }

            await getConnectedItems(rackItems);

            if (mounted) {
                setOptions(
                    defaultOptions.concat(
                        rackItems.map((item) => {
                            return { id: item.id, name: item.itemNumber };
                        })
                    )
                );

                // Reset selected option to ALL
                setSelectedItem(defaultOptions[0].id);

                // Set isLoading to FALSE
                setIsLoading((prevState) => {
                    return { ...prevState, connectedItems: false };
                });
            }
        })();

        return () => {
            mounted = false;
        };
    }, [defaultOptions, rackItems, setIsLoading]);

    // Filter connected items based on the selected item
    useEffect(() => {
        // Internal functions
        const filterConnectedItems = async (selectedItem) => {
            // Check if item is ALL
            if (selectedItem === "ALL") {
                if (connectedItems.length > 0) {
                    setDisplayedItems(connectedItems);
                } else {
                    setDisplayedItems([]);
                }
            } else {
                // Get index of the selected item
                let selectedItemIndex = rackItems.findIndex(
                    (item) => item.id === parseInt(selectedItem)
                );

                if (connectedItems.length > 0 && selectedItemIndex !== -1) {
                    setDisplayedItems(
                        connectedItems.filter(
                            (connectedItem) =>
                                connectedItem.referencedItemIndex ===
                                selectedItemIndex
                        )
                    );
                } else {
                    setDisplayedItems([]);
                }
            }
        };

        (async () => {
            await filterConnectedItems(selectedItem);
        })();
    }, [rackItems, selectedItem, connectedItems]);

    // Functions
    const handleItemChange = async (e) => {
        let { name, value } = e.target;

        if (name === "item") {
            setSelectedItem(value);
        }
    };

    return (
        <div className='connectivity-connected-items'>
            <InputDropdownHorizontal
                name='item'
                label='Item'
                value={selectedItem}
                options={options}
                onChange={handleItemChange}
                inputWidth='140px'
                noEmptyOption={true}
            />
            <div className='connectivity-connected-items__items'>
                {displayedItems.map((item, index) => {
                    return (
                        <ConnectedItemCard
                            key={index}
                            backgroundColor={GenerateColor(
                                item.referencedItemIndex
                            )}
                            rackNumber={item.rackNumber}
                            itemNumber={item.itemNumber}
                            uStart={item.uStart}
                            uNeeded={item.uNeeded}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default ConnectedItems;
