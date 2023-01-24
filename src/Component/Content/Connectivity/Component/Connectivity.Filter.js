// System library imports
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

// Custom library imports
import {
    InputDropdownHorizontal,
    InputTextAutoSuggestHorizontal,
} from "../../../ComponentReuseable/index";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { getToken } from "../../../TokenParse/TokenParse";

const Filter = (props) => {
    // Destructure props
    let { selectedRack, setSelectedRack } = props;

    // States
    const [options, setOptions] = useState({
        floors: [],
        rooms: [],
        clients: [],
        racks: [],
    });
    const [filter, setFilter] = useState({
        floorId: null,
        roomId: null,
        clientId: null,
    });
    const [datalistFilter, setDatalistFilter] = useState({
        clientName: "",
        rackNumber: "",
    });
    const [isLoadingInput, setIsLoadingInput] = useState({
        floors: false,
        rooms: false,
        clients: false,
        racks: false,
    });

    // Functions
    // Get rooms based on the selected floor
    const getRooms = async (floorId) => {
        // Set isLoading to TRUE
        setIsLoadingInput((prevState) => ({ ...prevState, rooms: true }));

        // Call JDBC query to get all rooms inside the selected floor
        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_CONNECTIVITY_GET_ROOMS_BY_FLOOR,
            headers: {
                authorization: getToken(),
            },
            data: {
                floor_id:
                    floorId === null || floorId === undefined ? "" : floorId,
            },
        };

        try {
            const result = await axios(config);

            if (result.status === 200) {
                let { data } = result;

                if (data.count > 0) {
                    let { data: queryData } = data;

                    setOptions((prevState) => {
                        return {
                            ...prevState,
                            rooms: queryData.map((row) => {
                                return {
                                    id: row.room_id,
                                    name: row.room_name,
                                };
                            }),
                        };
                    });
                } else {
                    setOptions((prevState) => {
                        return {
                            ...prevState,
                            rooms: [],
                        };
                    });
                }
            } else {
                toast.error("Error getting rooms data", {
                    toastId: "error-get-rooms",
                });
            }
        } catch (e) {
            toast.error("Error calling API to get rooms data", {
                toastId: "error-get-rooms",
            });
        }

        // Set isLoading to FALSE
        setIsLoadingInput((prevState) => ({ ...prevState, rooms: false }));
    };

    const isValidClientName = (clientName) => {
        return (
            options.clients &&
            options.clients.length > 0 &&
            options.clients.find((client) => client.name === clientName)
        );
    };

    const isValidRackNumber = (rackNumber) => {
        return (
            options.racks &&
            options.racks.length > 0 &&
            options.racks.find((rack) => rack.name === rackNumber)
        );
    };

    const handleChange = (e) => {
        let { name, value } = e.target;

        let id = null;
        if (name !== "client" && name !== "rack") {
            id = value !== "" ? parseInt(value) : null;
        }

        switch (name) {
            case "floor":
                setFilter((prevState) => {
                    return { ...prevState, floorId: id, roomId: null };
                });

                if (id) {
                    getRooms(id);
                }
                break;
            case "room":
                setFilter((prevState) => {
                    return { ...prevState, roomId: id };
                });
                break;
            case "client":
                // setFilter((prevState) => {
                //     return { ...prevState, clientId: id };
                // });
                setDatalistFilter((prevState) => {
                    return { ...prevState, clientName: value };
                });
                break;
            case "rack":
                // setSelectedRack(options.racks.find((rack) => rack.id === id));
                setDatalistFilter((prevState) => {
                    return { ...prevState, rackNumber: value };
                });
                break;
            default:
                break;
        }
    };

    // Side-effects
    // Get floors on component load
    useEffect(() => {
        // Internal variable
        let mounted = true;

        // Internal functions
        const getFloors = async () => {
            // Call JDBC query to get all floors
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_JDBC) +
                    process.env.REACT_APP_CONNECTIVITY_GET_FLOORS,
                headers: {
                    authorization: getToken(),
                },
            };

            try {
                const result = await axios(config);

                if (result.status === 200) {
                    let { data } = result;

                    if (data.count > 0) {
                        let { data: queryData } = data;

                        if (mounted) {
                            setOptions((prevState) => {
                                return {
                                    ...prevState,
                                    floors: queryData.map((row) => {
                                        return {
                                            id: row.floor_id,
                                            name: row.floor_name,
                                        };
                                    }),
                                };
                            });
                        }
                    } else {
                        if (mounted) {
                            setOptions((prevState) => {
                                return {
                                    ...prevState,
                                    floors: [],
                                };
                            });
                        }
                    }
                } else {
                    toast.error("Error getting floors data", {
                        toastId: "error-get-floors",
                    });
                }
            } catch (e) {
                toast.error("Error calling API to get floors data", {
                    toastId: "error-get-floors",
                });
            }
        };

        (async () => {
            // Set isLoading to TRUE
            setIsLoadingInput((prevState) => ({ ...prevState, floors: true }));

            await getFloors();

            // Set isLoading to FALSE
            setIsLoadingInput((prevState) => ({ ...prevState, floors: false }));
        })();

        return () => {
            mounted = false;
        };
    }, []);

    // Get clients on component load
    useEffect(() => {
        // Internal variable
        let mounted = true;

        // Internal functions
        const getClients = async () => {
            // Call DataHub query to get clients based on the floor and room
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_JDBC) +
                    process.env.REACT_APP_CONNECTIVITY_GET_CLIENTS,
                headers: {
                    authorization: getToken(),
                },
            };

            try {
                const result = await axios(config);

                if (result.status === 200) {
                    let { data } = result;

                    if (data.count > 0) {
                        let { data: queryData } = data;

                        queryData = queryData.map((row) => {
                            return {
                                id: row.client_id,
                                name: row.client_name,
                            };
                        });

                        if (mounted) {
                            setOptions((prevState) => {
                                return {
                                    ...prevState,
                                    clients: queryData,
                                };
                            });

                            if (
                                filter.clientId !== null &&
                                filter.clientId !== undefined &&
                                !queryData.find(
                                    (client) => client.id === filter.clientId
                                )
                            ) {
                                setFilter((prevState) => {
                                    return {
                                        ...prevState,
                                        clientId: queryData[0].id,
                                    };
                                });
                                setDatalistFilter((prevState) => {
                                    return {
                                        ...prevState,
                                        clientName: queryData[0].name,
                                    };
                                });
                            }
                        }
                    } else {
                        if (mounted) {
                            setOptions((prevState) => {
                                return {
                                    ...prevState,
                                    clients: [],
                                };
                            });
                            setFilter((prevState) => {
                                return {
                                    ...prevState,
                                    clientId: null,
                                };
                            });
                            setDatalistFilter((prevState) => {
                                return {
                                    ...prevState,
                                    clientName: "",
                                };
                            });
                        }
                    }
                } else {
                    toast.error("Error getting clients data", {
                        toastId: "error-get-clients",
                    });
                }
            } catch (e) {
                toast.error("Error calling API to get clients data", {
                    toastId: "error-get-clients",
                });
            }
        };

        (async () => {
            // Set isLoading to TRUE
            setIsLoadingInput((prevState) => ({ ...prevState, clients: true }));

            await getClients();

            // Set isLoading to FALSE
            setIsLoadingInput((prevState) => ({
                ...prevState,
                clients: false,
            }));
        })();

        return () => {
            mounted = false;
        };
    }, []);

    // Update racks when the filter changes
    useEffect(() => {
        // Internal variable
        let mounted = true;

        // Internal functions
        const getRacks = async (floorId, roomId, clientId) => {
            // Call DataHub query to get clients based on the floor and room
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_DATA_HUB) +
                    process.env.REACT_APP_CONNECTIVITY_GET_RACKS,
                headers: {
                    authorization: getToken(),
                },
                data: {
                    floor_id:
                        floorId === null || floorId === undefined
                            ? ""
                            : floorId,
                    room_id:
                        roomId === null || roomId === undefined ? "" : roomId,
                    client_id:
                        clientId === null || clientId === undefined
                            ? ""
                            : clientId,
                },
            };

            try {
                const result = await axios(config);

                if (result.status === 200) {
                    let { data } = result;

                    if (data.count > 0) {
                        let { data: queryData } = data;

                        queryData = queryData.map((row) => {
                            return {
                                id: row.rack_id,
                                name: row.rack_number,
                                numberOfU: row.number_of_u,
                            };
                        });

                        if (mounted) {
                            setOptions((prevState) => {
                                return {
                                    ...prevState,
                                    racks: queryData,
                                };
                            });

                            if (
                                !(
                                    selectedRack &&
                                    queryData.find(
                                        (rack) => rack.id === selectedRack.id
                                    )
                                )
                            ) {
                                setSelectedRack(null);
                                setDatalistFilter((prevState) => {
                                    return {
                                        ...prevState,
                                        rackNumber: "",
                                    };
                                });
                            }
                        }
                    } else {
                        if (mounted) {
                            setOptions((prevState) => {
                                return {
                                    ...prevState,
                                    racks: [],
                                };
                            });
                            setSelectedRack(null);
                            setDatalistFilter((prevState) => {
                                return {
                                    ...prevState,
                                    rackNumber: "",
                                };
                            });
                        }
                    }
                } else {
                    toast.error("Error getting racks data", {
                        toastId: "error-get-racks",
                    });
                }
            } catch (e) {
                toast.error("Error calling API to get racks data", {
                    toastId: "error-get-racks",
                });
            }
        };

        (async () => {
            // Set isLoading to TRUE
            setIsLoadingInput((prevState) => ({ ...prevState, racks: true }));

            // Get racks based on the filter
            await getRacks(filter.floorId, filter.roomId, filter.clientId);

            // Set isLoading to FALSE
            setIsLoadingInput((prevState) => ({ ...prevState, racks: false }));
        })();

        return () => {
            mounted = false;
        };
    }, [filter, setSelectedRack]);

    // // Set selected rack to the first rack based on a condition
    // useEffect(() => {
    //     // Check if selectedRack is null or undefined or exists & included in racks
    //     if (
    //         !selectedRack ||
    //         (selectedRack &&
    //             !options.racks.find((rack) => rack.id === selectedRack.id))
    //     ) {
    //         // Check if racks is not empty
    //         if (options.racks && options.racks.length > 0) {
    //             setSelectedRack(options.racks[0]);
    //         }
    //     }
    // }, [selectedRack, setSelectedRack, options.racks]);

    return (
        <div className='connectivity-header'>
            <div className='header-overview'>
                <div className='page-filter'>
                    <InputDropdownHorizontal
                        name='floor'
                        label='Floor'
                        value={filter.floorId ? filter.floorId : ""}
                        options={options.floors}
                        onChange={handleChange}
                        inputWidth='160px'
                        isLoading={isLoadingInput.floors}
                    />
                    <InputDropdownHorizontal
                        name='room'
                        label='Room'
                        value={filter.roomId ? filter.roomId : ""}
                        options={options.rooms}
                        onChange={handleChange}
                        isDisabled={
                            filter.floorId === null ||
                            filter.floorId === undefined
                        }
                        inputWidth='160px'
                        isLoading={isLoadingInput.rooms}
                    />
                    {/* <InputDropdownHorizontal
                        name='client'
                        label='Client:'
                        value={filter.clientId ? filter.clientId : ""}
                        options={options.clients}
                        onChange={handleChange}
                        inputWidth='160px'
                    /> */}
                    <InputTextAutoSuggestHorizontal
                        name='client'
                        label='Client'
                        value={datalistFilter.clientName}
                        options={options.clients.map((client) => client.name)}
                        isLoading={isLoadingInput.clients}
                        onChange={handleChange}
                        onClear={() => {
                            setDatalistFilter((prevState) => ({
                                ...prevState,
                                clientName: "",
                            }));
                        }}
                        validateInput={(e) => {
                            let { value } = e.target;

                            if (isValidClientName(value)) {
                                let client = options.clients.find(
                                    (client) => client.name === value
                                );

                                setFilter((prevState) => {
                                    return {
                                        ...prevState,
                                        clientId: client.id,
                                    };
                                });
                            } else {
                                setFilter((prevState) => {
                                    return {
                                        ...prevState,
                                        clientId: null,
                                    };
                                });
                                setDatalistFilter((prevState) => {
                                    return {
                                        ...prevState,
                                        clientName: "",
                                    };
                                });

                                if (value !== "") {
                                    toast.error("Invalid client name");
                                }
                            }
                        }}
                        inputWidth='160px'
                    />
                    {/* <InputDropdownHorizontal
                        name='rack'
                        label='Rack No.:'
                        value={selectedRack ? selectedRack.id : ""}
                        options={options.racks}
                        onChange={handleChange}
                        inputWidth='160px'
                        // isDisabled={options.racks.length <= 0}
                        noEmptyOption={true}
                    /> */}
                    <InputTextAutoSuggestHorizontal
                        name='rack'
                        label='Rack No.'
                        value={datalistFilter.rackNumber}
                        options={options.racks.map((rack) => rack.name)}
                        isLoading={isLoadingInput.racks}
                        onChange={handleChange}
                        onClear={() => {
                            setDatalistFilter((prevState) => ({
                                ...prevState,
                                rackNumber: "",
                            }));
                        }}
                        validateInput={(e) => {
                            let { value } = e.target;

                            if (isValidRackNumber(value)) {
                                let rack = options.racks.find(
                                    (rack) => rack.name === value
                                );

                                setSelectedRack(rack);
                            } else {
                                setSelectedRack(null);
                                setDatalistFilter((prevState) => {
                                    return {
                                        ...prevState,
                                        rackNumber: "",
                                    };
                                });

                                if (value !== "") {
                                    toast.error("Invalid rack number");
                                }
                            }
                        }}
                        inputWidth='160px'
                        isDisabled={
                            !options.racks ||
                            (options.racks && options.racks.length <= 0)
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default Filter;
