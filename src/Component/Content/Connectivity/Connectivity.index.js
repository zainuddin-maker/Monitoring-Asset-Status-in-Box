// System library imports
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

// Custom library imports
import { ReturnHostBackend } from "../../BackendHost/BackendHost";
import { getToken } from "../../TokenParse/TokenParse";
import { Timer, LoadingData, Rack } from "../../ComponentReuseable/index";
import Filter from "./Component/Connectivity.Filter";
import PSPDU from "./Component/Connectivity.PSPDU";
import RackToConnectedItems from "./Component/Connectivity.RackToConnectedItems";
import ConnectedItems from "./Component/Connectivity.ConnectedItems";

// Style imports
import "./style.scss";

const Connectivity = () => {
    // States
    const [selectedRack, setSelectedRack] = useState(null);
    const [rackItems, setRackItems] = useState([]);
    const [isLoading, setIsLoading] = useState({
        PSPDU: false,
        rackItems: false,
        connectedItems: false,
    });

    // Side-effects
    // Get selected rack's items
    useEffect(() => {
        // Internal variable
        let mounted = true;

        // Internal functions
        const getRackItems = async (rack) => {
            if (rack) {
                // Destructure rackId from rack
                let { id: rackId } = rack;

                // Call JDBC query to get all rack items inside the selected racks
                let config = {
                    method: "post",
                    url:
                        ReturnHostBackend(process.env.REACT_APP_JDBC) +
                        process.env
                            .REACT_APP_CONNECTIVITY_GET_INSTALLED_RACK_ITEMS,
                    headers: {
                        authorization: getToken(),
                    },
                    data: {
                        rack_id:
                            rackId === null || rackId === undefined
                                ? ""
                                : rackId,
                    },
                };

                try {
                    const result = await axios(config);

                    if (result.status === 200) {
                        let { data } = result;

                        if (data.count > 0) {
                            let { data: queryData } = data;

                            if (mounted) {
                                setRackItems(
                                    queryData.map((row) => {
                                        return {
                                            id: row.item_id,
                                            itemNumber: row.item_number,
                                            isFull: row.is_full ? true : false,
                                            isLeft: row.is_left ? true : false,
                                            uStart: row.u_start,
                                            uNeeded: row.u_needed,
                                        };
                                    })
                                );
                            }
                        } else {
                            if (mounted) {
                                setRackItems([]);
                            }
                        }
                    } else {
                        toast.error("Error getting rackItems data", {
                            toastId: "error-get-rack-items",
                        });
                    }
                } catch (e) {
                    toast.error("Error calling API to get rackItems data", {
                        toastId: "error-get-rack-items",
                    });
                }
            }
        };

        (async () => {
            // Set isLoading to TRUE
            if (mounted) {
                setIsLoading((prevState) => {
                    return { ...prevState, rackItems: true };
                });
            }

            // Call API to get current rack's items
            if (selectedRack !== null && selectedRack !== undefined) {
                await getRackItems(selectedRack);
            } else {
                setRackItems([]);
            }

            // Delay for a bit to wait for other API call to start
            await new Promise((resolve) => setTimeout(resolve, 200));

            // Set isLoading to FALSE
            if (mounted) {
                setIsLoading((prevState) => {
                    return { ...prevState, rackItems: false };
                });
            }
        })();

        return () => {
            mounted = false;
        };
    }, [selectedRack]);

    return (
        <div className='connectivity-container'>
            <div className='connectivity-header'>
                <div className='header-overview'>
                    <div className='page-title'>Connectivity</div>
                </div>
                <Timer />
            </div>
            <Filter
                selectedRack={selectedRack}
                setSelectedRack={setSelectedRack}
            />
            <div className='connectivity-content'>
                <LoadingData
                    isLoading={
                        isLoading.PSPDU ||
                        isLoading.rackItems ||
                        isLoading.connectedItems
                    }
                    useAltBackground={false}
                />
                <PSPDU rack={selectedRack} setIsLoading={setIsLoading} />
                <Rack rack={selectedRack} rackItems={rackItems} />
                <RackToConnectedItems />
                <ConnectedItems
                    rackItems={rackItems}
                    setIsLoading={setIsLoading}
                />
            </div>
        </div>
    );
};

export default Connectivity;
