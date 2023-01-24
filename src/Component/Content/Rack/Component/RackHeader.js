import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
    SearchBar,
    InputDropdownHorizontal,
    InputTextAutoSuggestHorizontal,
    Tooltip,
    ExportButton,
    exportCSVFile,
} from "../../../ComponentReuseable/index";
import axios from "axios";
import { getToken } from "../../../TokenParse/TokenParse";
import "./../style.scss";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";

const RackHeader = (props) => {
    const { filter, setFilter, getRacks, search, setSearch, power } = props;
    const [floors, setFloors] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [clients, setClients] = useState([]);
    const [rackNumbers, setRackNumbers] = useState([]);
    const [status, setStatus] = useState([]);
    const [isDisabled, setIsDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState({
        floor: false,
        room: false,
        client: false,
        rackNo: false,
        status: false,
        export: false,
    });
    const [state, setState] = useState({
        client: "",
        rack_number: "",
    });

    const getFloors = async () => {
        setIsLoading((prev) => {
            prev.floor = true;
            return { ...prev };
        });
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_GET_FLOORS,
            headers: {
                authorization: getToken(),
            },
        };
        try {
            const result = await axios(config);
            if (result.data.data.length > 0) {
                setFloors(result.data.data);
            } else {
                setFloors([]);
            }
            setIsLoading((prev) => {
                prev.floor = false;
                return { ...prev };
            });
        } catch (e) {
            // console.error(e);
            if (e.message === "Network Error") {
                setIsLoading((prev) => {
                    prev.floor = true;
                    return { ...prev };
                });
            } else {
                setIsLoading((prev) => {
                    prev.floor = false;
                    return { ...prev };
                });
            }
            toast.error("Failed to get floor data", {
                toastId: "failed-get-floor",
            });
        }
    };

    const getRooms = async (floor) => {
        setIsDisabled(true);
        setIsLoading((prev) => {
            prev.room = true;
            return { ...prev };
        });
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_GET_ROOMS,
            headers: {
                authorization: getToken(),
            },
            data: {
                id_floor: floor,
            },
        };
        try {
            const result = await axios(config);
            if (result.data.data.length > 0) {
                setRooms(result.data.data);
            } else {
                setRooms([]);
            }
            setIsDisabled(false);
            setIsLoading((prev) => {
                prev.room = false;
                return { ...prev };
            });
        } catch (e) {
            // console.error(e);
            if (e.message === "Network Error") {
                setIsLoading((prev) => {
                    prev.room = true;
                    return { ...prev };
                });
            } else {
                setIsLoading((prev) => {
                    prev.room = true;
                    return { ...prev };
                });
            }
            toast.error("Failed to get room data", {
                toastId: "failed-get-room",
            });
        }
    };

    const getClients = async () => {
        setIsLoading((prev) => {
            prev.client = true;
            return { ...prev };
        });
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_GET_CLIENTS_FILTER,
            headers: {
                authorization: getToken(),
            },
            data: {
                status:
                    filter.status || filter.status !== "" ? filter.status : "",
                rack_number:
                    filter.rack_number || filter.rack_number !== ""
                        ? filter.rack_number
                        : "",
                floor_name:
                    filter.floor_name === "" || filter.floor_name === undefined
                        ? ""
                        : filter.floor_name,
                room_name:
                    filter.room_name === "" || filter.room_name === undefined
                        ? ""
                        : filter.room_name,
            },
        };
        try {
            const result = await axios(config);
            const data = result.data.data;
            const client = [];
            if (data.length > 0) {
                data.map((data) => {
                    if (data.client_id !== null && data.client_name !== null) {
                        client.push(data);
                    } else {
                        client.push({
                            client_id: "Not Occupied",
                            client_name: "Not Occupied",
                        });
                    }
                });
                let check = client.find(
                    (dt) => dt.client_name === state.client
                );
                if (check === undefined) {
                    setState((prev) => {
                        prev.client = "";
                        return { ...prev };
                    });
                    setFilter((prev) => {
                        prev.client_name = "";
                        return { ...prev };
                    });
                }
                setClients(client);
            } else {
                setClients([]);
                setState((prev) => {
                    prev.client = "";
                    return { ...prev };
                });
                setFilter((prev) => {
                    prev.client_name = "";
                    return { ...prev };
                });
            }
            setIsLoading((prev) => {
                prev.client = false;
                return { ...prev };
            });
        } catch (e) {
            // console.error(e);
            if (e.message === "Network Error") {
                setIsLoading((prev) => {
                    prev.client = true;
                    return { ...prev };
                });
            } else {
                setIsLoading((prev) => {
                    prev.client = false;
                    return { ...prev };
                });
            }
            toast.error("Failed to get client data", {
                toast: "failed-get-client",
            });
        }
    };

    const getRackNumbers = async () => {
        setIsLoading((prev) => {
            prev.rackNo = true;
            return { ...prev };
        });
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_GET_RACK_NUMBER,
            headers: {
                authorization: getToken(),
            },
            data: {
                floor_name:
                    filter.floor_name === "" || filter.floor_name === undefined
                        ? ""
                        : filter.floor_name,
                room_name:
                    filter.room_name === "" || filter.room_name === undefined
                        ? ""
                        : filter.room_name,
                client_name:
                    filter.client_name === "" ||
                    filter.client_name === undefined
                        ? ""
                        : filter.client_name,
                status:
                    filter.status === "" || filter.status === undefined
                        ? ""
                        : filter.status,
            },
        };
        try {
            const result = await axios(config);
            const data = result.data.data;
            let rackNo = [];
            if (data.length > 0) {
                let check = data.find(
                    (dt) => dt.rack_number === state.rack_number
                );
                if (check === undefined) {
                    setState((prev) => {
                        prev.rack_number = "";
                        return { ...prev };
                    });
                    setFilter((prev) => {
                        prev.rack_number = "";
                        return { ...prev };
                    });
                }
                setRackNumbers(data);
            } else {
                setRackNumbers([]);
                setState((prev) => {
                    prev.rack_number = "";
                    return { ...prev };
                });
                setFilter((prev) => {
                    prev.rack_number = "";
                    return { ...prev };
                });
            }
            setIsLoading((prev) => {
                prev.rackNo = false;
                return { ...prev };
            });
        } catch (e) {
            // console.error(e);
            if (e.message === "Network Error") {
                setIsLoading((prev) => {
                    prev.rackNo = true;
                    return { ...prev };
                });
            } else {
                setIsLoading((prev) => {
                    prev.rackNo = false;
                    return { ...prev };
                });
            }
            toast.error("Failed to get rack number data", {
                toastId: "failed-get-rack-number",
            });
        }
    };

    const getStatus = async () => {
        setIsLoading((prev) => {
            prev.status = true;
            return { ...prev };
        });
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_GET_STATUS,
            headers: {
                authorization: getToken(),
            },
        };
        try {
            const result = await axios(config);
            let status = [];
            let data = result.data.data;
            if (data.length > 0) {
                data.map((r) => {
                    status.push(r.status);
                });
                setStatus(status);
            } else {
                setStatus([]);
                setFilter((prev) => {
                    prev.status = "";
                    return { ...prev };
                });
            }
            setIsLoading((prev) => {
                prev.status = false;
                return { ...prev };
            });
        } catch (e) {
            // console.error(e);
            if (e.message === "Network Error") {
                setIsLoading((prev) => {
                    prev.status = true;
                    return { ...prev };
                });
            } else {
                setIsLoading((prev) => {
                    prev.rackNo = false;
                    return { ...prev };
                });
            }
            toast.error("Failed to get status", {
                toastId: "failde-get-status",
            });
        }
    };

    const exportData = (e) => {
        setIsLoading((prev) => {
            prev.export = true;
            return { ...prev };
        });
        let filterData = {
            floor_name: filter.floor_name === "" ? "" : filter.floor_name,
            room_name: filter.room_name === "" ? "" : filter.room_name,
            client_name: filter.client_name === "" ? "" : filter.client_name,
            rack_number: filter.rack_number === "" ? "" : filter.rack_number,
            status: filter.status === "" ? "" : filter.status,
        };

        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_GET_EXPORT_RACK,
            headers: {
                authorization: getToken(),
            },
            data: filterData,
        };

        axios(config)
            .then((response) => {
                if (response.data) {
                    if (response.data.data.length > 0) {
                        // PROCESSING THE EXPORT HERE
                        const fileName = `Racks_[${new Date()
                            .toLocaleString("sv-SE")
                            .replace(" ", ",")}]_[${
                            !filter.floor_name || filter.floor_name === ""
                                ? "AllFloor"
                                : "Floor(" + filter.floor_name + ")"
                        }]_[${
                            !filter.room_name || filter.room_name === ""
                                ? "AllRoom"
                                : "Room(" + filter.room_name + ")"
                        }]_[${
                            !filter.client_name || filter.client_name === ""
                                ? "AllClient"
                                : filter.client_name === "Not Occupied"
                                ? "Client(" + filter.client_name + ")"
                                : "Client(" +
                                  clients.find(
                                      (data) =>
                                          data.client_id ===
                                          parseInt(filter.client_name)
                                  ).client_name +
                                  ")"
                        }]_[${
                            !filter.rack_number || filter.rack_number === ""
                                ? "AllRackNumber"
                                : "RackNumber(" +
                                  rackNumbers.find(
                                      (data) =>
                                          data.rack_id ===
                                          parseInt(filter.rack_number)
                                  ).rack_number +
                                  ")"
                        }]_[${
                            !filter.status || filter.status === ""
                                ? "AllStatus"
                                : "Status(" + filter.status + ")"
                        }]`;

                        const body = response.data.data.map((rack) => {
                            let area = rack.area ? rack.area.split(",") : "-";

                            return {
                                rack_number: rack.rack_number,
                                floor: rack.floor,
                                room: rack.room,
                                area:
                                    area.length > 1
                                        ? area[0] + "-" + area[1]
                                        : rack.area,
                                brand: rack.brand,
                                model: rack.model ? rack.model : "-",
                                number_of_u: rack.number_of_u,
                                power_source: rack.power,
                                client: rack.client,
                                status: rack.status,
                            };
                        });

                        const headers = [
                            "rack_number",
                            "floor",
                            "room",
                            "area",
                            "brand",
                            "model",
                            "number_of_u",
                            "power_source",
                            "client",
                            "status",
                        ];

                        const data = [
                            {
                                sheetName: "sheet1",
                                header: headers,
                                body: body,
                            },
                        ];
                        exportCSVFile(data, fileName);
                    } else {
                        toast.warning("Data is Empty", {
                            toastId: "data-empty",
                        });
                    }
                } else {
                    toast.warning("Data is Empty", {
                        toastId: "data-empty",
                    });
                }
                setIsLoading((prev) => {
                    prev.export = false;
                    return { ...prev };
                });
            })
            .catch((err) => {
                toast.error("Failed to get data", {
                    toastId: "failed-get-data",
                });
                setIsLoading((prev) => {
                    prev.export = false;
                    return { ...prev };
                });
            });
    };

    const handleChangeSearch = (value) => {
        setSearch(value);
    };

    const handleChange = async (e) => {
        let { name, value } = e.target;

        switch (name) {
            case "floor_name":
                if (value !== "") {
                    await getRooms(value);
                } else {
                    setRooms([]);
                }
                setFilter((prev) => {
                    prev.floor_name = value;
                    prev.room_name = "";
                    return { ...prev };
                });
                break;
            case "room_name":
                setFilter((prev) => {
                    prev.room_name = value;
                    return { ...prev };
                });
                break;
            case "client":
                setState((prev) => {
                    prev.client = value;
                    return { ...prev };
                });
                break;
            case "rack_number":
                setState((prev) => {
                    prev.rack_number = value;
                    return { ...prev };
                });
                break;
            case "status":
                setFilter((prev) => {
                    prev.status = value;
                    return { ...prev };
                });
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        getFloors();
        getStatus();
    }, []);

    useEffect(() => {
        getClients();
    }, [
        filter.floor_name,
        filter.room_name,
        filter.status,
        filter.rack_number,
    ]);

    useEffect(() => {
        getRackNumbers();
    }, [
        filter.floor_name,
        filter.room_name,
        filter.client_name,
        filter.status,
    ]);

    return (
        <div className='rack-header-filter'>
            <div className='header-overview'>
                <div className='page-filter'>
                    <SearchBar
                        name='search'
                        value={search}
                        search={handleChangeSearch}
                        searchContent={() => getRacks(search)}
                    />
                    <InputDropdownHorizontal
                        name='floor_name'
                        label='Floor'
                        value={filter.floor_name}
                        options={floors}
                        onChange={handleChange}
                        inputWidth='110px'
                        isLoading={isLoading.floor}
                    />
                    <InputDropdownHorizontal
                        name='room_name'
                        label='Room'
                        value={filter.room_name}
                        options={rooms}
                        onChange={handleChange}
                        inputWidth='110px'
                        isDisabled={isDisabled || filter.floor_name === ""}
                        isLoading={isLoading.room || isLoading.floor}
                    />
                    <InputTextAutoSuggestHorizontal
                        name='client'
                        label='Client'
                        value={state.client}
                        options={clients.map((c) => c.client_name)}
                        onChange={handleChange}
                        inputWidth='150px'
                        isLoading={isLoading.client}
                        isDisabled={isLoading.client}
                        onClear={() => {
                            setState((prev) => {
                                prev.client = "";
                                return { ...prev };
                            });
                            setFilter((prev) => {
                                return {
                                    ...prev,
                                    client_name: "",
                                };
                            });
                        }}
                        validateInput={(e) => {
                            let { value } = e.target;

                            let client = clients.find(
                                (c) => c.client_name === value
                            );
                            if (value !== "") {
                                if (client && client !== undefined) {
                                    setFilter((prev) => {
                                        return {
                                            ...prev,
                                            client_name: client.client_id,
                                        };
                                    });
                                } else {
                                    setState((prev) => {
                                        return {
                                            ...prev,
                                            client: "",
                                        };
                                    });
                                    setFilter((prev) => {
                                        return {
                                            ...prev,
                                            client_name: "",
                                        };
                                    });
                                    toast.error("Invalid input client name", {
                                        toastId: "invalid-input-client",
                                    });
                                    return;
                                }
                            }
                        }}
                    />
                    <InputTextAutoSuggestHorizontal
                        name='rack_number'
                        label='Rack No.'
                        value={state.rack_number}
                        options={rackNumbers.map((r) => r.rack_number)}
                        onChange={handleChange}
                        isLoading={isLoading.rackNo}
                        isDisabled={isLoading.rackNo}
                        onClear={() => {
                            setState((prev) => {
                                prev.rack_number = "";
                                return { ...prev };
                            });
                            setFilter((prev) => {
                                return {
                                    ...prev,
                                    rack_number: "",
                                };
                            });
                        }}
                        inputWidth='150px'
                        validateInput={(e) => {
                            let { value } = e.target;

                            let rack = rackNumbers.find(
                                (r) => r.rack_number === value
                            );
                            if (value !== "") {
                                if (rack && rack !== undefined) {
                                    setFilter((prev) => {
                                        return {
                                            ...prev,
                                            rack_number: rack.rack_id,
                                        };
                                    });
                                } else {
                                    value = "";
                                    setState((prev) => {
                                        return {
                                            ...prev,
                                            rack_number: "",
                                        };
                                    });
                                    setFilter((prev) => {
                                        return {
                                            ...prev,
                                            rack_number: "",
                                        };
                                    });
                                    toast.error("Invalid input rack number", {
                                        toastId: "invalid-input-rack_number",
                                    });
                                    return;
                                }
                            }
                        }}
                    />
                    <InputDropdownHorizontal
                        name='status'
                        label='Status'
                        value={filter.status}
                        options={status}
                        onChange={handleChange}
                        inputWidth='140px'
                        isLoading={isLoading.status}
                    />
                </div>
            </div>
            <div className='export'>
                <ExportButton
                    onClick={exportData}
                    isLoading={isLoading.export}
                />
            </div>
        </div>
    );
};

export default RackHeader;
