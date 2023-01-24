import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { getToken } from "../../../TokenParse/TokenParse";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import "./../style.scss";
import {
    SearchBar,
    InputDropdownHorizontal,
    InputTextAutoSuggestHorizontal,
    Tooltip,
    ExportButton,
    exportCSVFile,
} from "../../../ComponentReuseable/index";

const ItemHeader = (props) => {
    const { filter, setFilter, getItems, search, setSearch } = props;

    const [clients, setClients] = useState([]);
    const [rackNumbers, setRackNumbers] = useState([]);
    const [itemNumbers, setItemNumbers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [status, setStatus] = useState([]);
    const [isLoading, setIsLoading] = useState({
        rackNo: false,
        itemNo: false,
        client: false,
        category: false,
        status: false,
    });
    const [state, setState] = useState({
        client: "",
        rack_number: "",
        item_number: "",
    });

    const getClients = async () => {
        setIsLoading((prev) => {
            prev.client = true;
            return { ...prev };
        });
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_ITEM_GET_CLIENTS_FILTER,
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
                item_number:
                    filter.item_number || filter.item_number !== ""
                        ? filter.item_number
                        : "",
                category:
                    filter.category || filter.category !== ""
                        ? filter.category
                        : "",
            },
        };
        try {
            const result = await axios(config);
            const data = result.data.data;
            if (data.length > 0) {
                let check = data.find((dt) => dt.client_name === state.client);
                if (check === undefined) {
                    setFilter((prev) => {
                        prev.client = "";
                        return { ...prev };
                    });
                    setState((prev) => {
                        prev.client = "";
                        return { ...prev };
                    });
                }
                setClients(data);
            } else {
                setClients([]);
                setState((prev) => {
                    prev.client = "";
                    return { ...prev };
                });
                setFilter((prev) => {
                    prev.client = "";
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
                toastId: "failed-get-client-data",
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
                process.env.REACT_APP_ITEM_GET_STATUS,
            headers: {
                authorization: getToken(),
            },
        };
        try {
            const result = await axios(config);
            const data = result.data.data;
            let status = [];
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
                    prev.status = false;
                    return { ...prev };
                });
            }
            toast.error("Failed to get status", {
                toastId: "failed-get-status",
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
                process.env.REACT_APP_ITEM_GET_RACK_NUMBER,
            headers: {
                authorization: getToken(),
            },
            data: {
                client_name:
                    filter.client || filter.client !== "" ? filter.client : "",
                status:
                    filter.status || filter.status !== "" ? filter.status : "",
                item_number:
                    filter.item_number || filter.item_number !== ""
                        ? filter.item_number
                        : "",
                category:
                    filter.category || filter.category !== ""
                        ? filter.category
                        : "",
            },
        };
        try {
            const result = await axios(config);
            const data = result.data.data;
            if (data.length > 0) {
                let check = data.find(
                    (dt) => dt.rack_number === state.rack_number
                );
                if (check === undefined) {
                    setFilter((prev) => {
                        prev.rack_number = "";
                        return { ...prev };
                    });
                    setState((prev) => {
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

    const getCategories = async () => {
        setIsLoading((prev) => {
            prev.category = true;
            return { ...prev };
        });
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_ITEM_GET_CATEGORIES_FILTER,
            headers: {
                authorization: getToken(),
            },
        };
        try {
            const result = await axios(config);
            const data = result.data.data;
            if (data.length > 0) {
                setCategories(data);
            } else {
                setCategories([]);
                setFilter((prev) => {
                    prev.category = "";
                    return { ...prev };
                });
            }
            setIsLoading((prev) => {
                prev.category = false;
                return { ...prev };
            });
        } catch (e) {
            // console.error(e);
            if (e.message === "Network Error") {
                setIsLoading((prev) => {
                    prev.category = false;
                    return { ...prev };
                });
            } else {
                setIsLoading((prev) => {
                    prev.category = false;
                    return { ...prev };
                });
            }
            toast.error("Failed to get categories data", {
                toastId: "failed-get-categories",
            });
        }
    };

    const getItemNumber = async () => {
        setIsLoading((prev) => {
            prev.itemNo = true;
            return { ...prev };
        });
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_ITEM_GET_ITEM_NUMBER,
            headers: {
                authorization: getToken(),
            },
            data: {
                client_name:
                    filter.client || filter.client !== "" ? filter.client : "",
                status:
                    filter.status || filter.status !== "" ? filter.status : "",
                category:
                    filter.category || filter.category !== ""
                        ? filter.category
                        : "",
                rack_number:
                    filter.rack_number || filter.rack_number !== ""
                        ? filter.rack_number
                        : "",
            },
        };
        try {
            const result = await axios(config);
            const data = result.data.data;
            if (data.length > 0) {
                let check = data.find(
                    (dt) => dt.item_number === state.item_number
                );
                if (check === undefined) {
                    setFilter((prev) => {
                        prev.item_number = "";
                        return { ...prev };
                    });
                    setState((prev) => {
                        prev.item_number = "";
                        return { ...prev };
                    });
                }
                setItemNumbers(data);
            } else {
                setItemNumbers([]);
                setState((prev) => {
                    prev.item_number = "";
                    return { ...prev };
                });
                setFilter((prev) => {
                    prev.item_number = "";
                    return { ...prev };
                });
            }
            setIsLoading((prev) => {
                prev.itemNo = false;
                return { ...prev };
            });
        } catch (e) {
            // console.error(e);
            if (e.message === "Network Error") {
                setIsLoading((prev) => {
                    prev.itemNo = true;
                    return { ...prev };
                });
            } else {
                setIsLoading((prev) => {
                    prev.itemNo = false;
                    return { ...prev };
                });
            }
            toast.error("Failed to get item number data", {
                toastId: "failed-get-item-number",
            });
        }
    };

    const handleChangeSearch = (value) => {
        setSearch(value);
    };

    const handleChange = (e) => {
        let { name, value } = e.target;

        switch (name) {
            case "client":
                setState((prev) => {
                    prev.client = value;
                    return { ...prev };
                });
                break;
            case "status":
                setFilter((prev) => {
                    prev.status = value;
                    return { ...prev };
                });
                break;
            case "rack_number":
                setState((prev) => {
                    prev.rack_number = value;
                    return { ...prev };
                });
                break;
            case "category":
                setFilter((prev) => {
                    prev.category = value;
                    return { ...prev };
                });
                break;
            case "item_number":
                setState((prev) => {
                    prev.item_number = value;
                    return { ...prev };
                });
                break;
            default:
                break;
        }
    };

    const exportData = (e) => {
        setIsLoading((prev) => {
            prev.export = true;
            return { ...prev };
        });
        let filterData = {
            client_name: filter.client === null ? "" : filter.client,
            status: filter.status === null ? "" : filter.status,
            rack_number: filter.rack_number === null ? "" : filter.rack_number,
            item_number: filter.item_number === null ? "" : filter.item_number,
            category: filter.category === null ? "" : filter.category,
        };

        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_ITEM_GET_EXPORT_ITEM,
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
                        const fileName = `Items_[${new Date()
                            .toLocaleString("sv-SE")
                            .replace(" ", ",")}]_[${
                            !filter.client || filter.client === ""
                                ? "AllClient"
                                : "Client(" +
                                  clients.find(
                                      (data) =>
                                          data.client_id ===
                                          parseInt(filter.client)
                                  ).client_name +
                                  ")"
                        }]_[${
                            !filter.status || filter.status === ""
                                ? "AllStatus"
                                : "Status(" + filter.status + ")"
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
                            !filter.category || filter.category === ""
                                ? "AllCategories"
                                : "Category(" +
                                  categories.find(
                                      (data) =>
                                          data.id === parseInt(filter.category)
                                  ).name +
                                  ")"
                        }]_[${
                            !filter.item_number || filter.item_number === ""
                                ? "AllItemNumber"
                                : "ItemNumber(" +
                                  itemNumbers.find(
                                      (data) =>
                                          data.item_id ===
                                          parseInt(filter.item_number)
                                  ).item_number +
                                  ")"
                        }]`;

                        const body = response.data.data.map((item) => {
                            return {
                                item_number: item.item_number,
                                item_name: item.item_name,
                                brand: item.brand,
                                model: item.model,
                                category: item.category,
                                u_needed: item.u_needed,
                                client: item.client ? item.client : "-",
                                status: item.status,
                            };
                        });

                        const headers = [
                            "item_number",
                            "item_name",
                            "brand",
                            "model",
                            "category",
                            "u_needed",
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
                toast.error("Failed to export data", {
                    toastId: "failed-export-data",
                });
                setIsLoading((prev) => {
                    prev.export = false;
                    return { ...prev };
                });
            });
    };

    useEffect(() => {
        getStatus();
        getCategories();
    }, []);

    useEffect(() => {
        getClients();
    }, [
        filter.status,
        filter.category,
        filter.rack_number,
        filter.item_number,
    ]);

    useEffect(() => {
        getRackNumbers();
    }, [filter.client, filter.status, filter.category, filter.item_number]);

    useEffect(() => {
        getItemNumber();
    }, [filter.client, filter.status, filter.category, filter.rack_number]);

    return (
        <div className='item-header-filter'>
            <div className='header-overview'>
                <div className='page-filter'>
                    <SearchBar
                        name='search'
                        value={filter.search}
                        search={handleChangeSearch}
                        searchContent={() => getItems(search)}
                    />
                    <InputTextAutoSuggestHorizontal
                        label='Client'
                        name='client'
                        value={state.client}
                        options={clients.map((c) => c.client_name)}
                        onChange={handleChange}
                        isLoading={isLoading.client}
                        isDisabled={isLoading.client}
                        onClear={() => {
                            setState((prev) => {
                                return {
                                    ...prev,
                                    client: "",
                                };
                            });
                            setFilter((prev) => {
                                return {
                                    ...prev,
                                    client: "",
                                };
                            });
                        }}
                        inputWidth='140px'
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
                                            client: client.client_id,
                                        };
                                    });
                                } else {
                                    setFilter((prev) => {
                                        return {
                                            ...prev,
                                            client: "",
                                        };
                                    });
                                    setState((prev) => {
                                        return {
                                            ...prev,
                                            client: "",
                                        };
                                    });
                                    toast.error("Invalid input Client", {
                                        toastId: "invalid-input-add-client",
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
                    <InputTextAutoSuggestHorizontal
                        label='Rack No.'
                        name='rack_number'
                        value={state.rack_number}
                        options={rackNumbers.map((r) => r.rack_number)}
                        isLoading={isLoading.rackNo}
                        isDisabled={isLoading.rackNo}
                        onChange={handleChange}
                        onClear={() => {
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
                                    setFilter((prev) => {
                                        return {
                                            ...prev,
                                            rack_number: "",
                                        };
                                    });
                                    setState((prev) => {
                                        return {
                                            ...prev,
                                            rack_number: "",
                                        };
                                    });
                                    toast.error("Invalid input Rack Number", {
                                        toastId: "invalid-input-rack-number",
                                    });
                                    return;
                                }
                            }
                        }}
                    />
                    <InputDropdownHorizontal
                        label='Category'
                        name='category'
                        value={filter.category}
                        options={categories}
                        onChange={handleChange}
                        inputWidth='140px'
                        isLoading={isLoading.category}
                    />
                    <InputTextAutoSuggestHorizontal
                        label='Item No.'
                        name='item_number'
                        isLoading={isLoading.itemNo}
                        isDisabled={isLoading.itemNo}
                        value={state.item_number}
                        options={itemNumbers.map((i) => i.item_number)}
                        onChange={handleChange}
                        onClear={() => {
                            setState((prev) => {
                                prev.item_number = "";
                                return { ...prev };
                            });
                            setFilter((prev) => {
                                prev.item_number = "";
                                return { ...prev };
                            });
                        }}
                        inputWidth='150px'
                        validateInput={(e) => {
                            let { value } = e.target;

                            let item = itemNumbers.find(
                                (i) => i.item_number === value
                            );
                            if (value !== "") {
                                if (item && item !== undefined) {
                                    setFilter((prev) => {
                                        return {
                                            ...prev,
                                            item_number: item.item_id,
                                        };
                                    });
                                } else {
                                    setFilter((prev) => {
                                        return {
                                            ...prev,
                                            item_number: "",
                                        };
                                    });
                                    setState((prev) => {
                                        return {
                                            ...prev,
                                            item_number: "",
                                        };
                                    });
                                    toast.error("Invalid input Item Number", {
                                        toastId: "invalid-input-item-number",
                                    });
                                    return;
                                }
                            }
                        }}
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

export default ItemHeader;
