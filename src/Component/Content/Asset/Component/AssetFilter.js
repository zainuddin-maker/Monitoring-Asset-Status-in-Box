import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import "../style.scss";

import {
    SearchBar,
    InputDropdownHorizontal,
    InputTextAutoSuggestHorizontal,
    ExportButton,
} from "../../../ComponentReuseable/index";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { getToken } from "../../../TokenParse/TokenParse";

function AssetFilter(props) {
    let {
        searchValue,
        filterValue,
        searchContent,
        isLoadingExport,
        exportData,
    } = props;

    const [filterOptions, setFilterOptions] = useState({
        floors: [],
        rooms: [],
        functions: [],
        assets: [],
    });

    const [filter, setFilter] = useState({
        floorId: null,
        roomId: null,
        functionId: null,
        assetNo: null,
    });

    const [filterDataList, setFilterDataList] = useState({
        assetNo: null,
    });

    const [isLoadingFloor, setIsLoadingFloor] = useState(false);
    const [isLoadingRoom, setIsLoadingRoom] = useState(false);
    const [isLoadingFunction, setIsLoadingFunction] = useState(false);
    const [isLoadingAssetNo, setIsLoadingAssetNo] = useState(false);

    // Get Floors
    useEffect(() => {
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

                        setFilterOptions((prevState) => {
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
                    } else {
                        setFilterOptions((prevState) => {
                            return {
                                ...prevState,
                                floors: [],
                            };
                        });
                    }
                } else {
                    toast.error("Error getting floors data", {
                        toastId: "AF_error-get-floor_S_400",
                    });
                }
            } catch (e) {
                // console.log(e.message);
                toast.error("Error calling API to get floors data", {
                    toastId: "AF_error-get-floor_API",
                });
            }
        };

        (async () => {
            setIsLoadingFloor(true);
            await getFloors();
            setIsLoadingFloor(false);
        })();
    }, []);

    // Get Rooms when Floor selected
    useEffect(() => {
        const getRooms = async (floorId) => {
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
                        floorId === null || floorId === undefined
                            ? ""
                            : floorId,
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
                                id: row.room_id,
                                name: row.room_name,
                            };
                        });

                        setFilterOptions((prevState) => {
                            return {
                                ...prevState,
                                rooms: queryData,
                            };
                        });
                    } else {
                        setFilterOptions((prevState) => {
                            return {
                                ...prevState,
                                rooms: [],
                            };
                        });
                        setFilter((prev) => {
                            return {
                                ...prev,
                                roomId: null,
                            };
                        });
                    }
                } else {
                    toast.error("Error getting rooms data", {
                        toastId: "AF_error-get-room_S_400",
                    });
                }
            } catch (e) {
                toast.error("Error calling API to get rooms data", {
                    toastId: "AF_error-get-room_API",
                });
            }
        };
        (async () => {
            setIsLoadingRoom(true);
            await getRooms(filter.floorId);
            setIsLoadingRoom(false);
        })();
    }, [filter.floorId]);

    // Get functions whenever the floor and room changes
    useEffect(() => {
        const getFunctions = async () => {
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_JDBC) +
                    process.env.REACT_APP_ASSET_GET_FUNCTIONS_DROPDOWN,
                headers: {
                    authorization: getToken(),
                },
                // data: {
                //     floor_id:
                //         floorId === null || floorId === undefined
                //             ? ""
                //             : floorId,
                //     room_id:
                //         roomId === null || roomId === undefined ? "" : roomId,
                // },
            };

            try {
                const result = await axios(config);

                if (result.status === 200) {
                    let { data } = result;

                    if (data.count > 0) {
                        let { data: queryData } = data;

                        queryData = queryData.map((row) => {
                            return {
                                id: row.id,
                                name: row.machine_type,
                            };
                        });

                        setFilterOptions((prevState) => {
                            return {
                                ...prevState,
                                functions: queryData,
                            };
                        });
                    } else {
                        setFilterOptions((prevState) => {
                            return {
                                ...prevState,
                                functions: [],
                            };
                        });
                    }
                } else {
                    toast.error("Error getting functions data", {
                        toastId: "AF_error-get-function_S_400",
                    });
                }
            } catch (e) {
                toast.error("Error calling API to get functions data", {
                    toastId: "AF_error-get-function_API",
                });
            }
        };

        (async () => {
            setIsLoadingFunction(true);
            await getFunctions(null, null);
            setIsLoadingFunction(false);
        })();
    }, []);

    //     const getFunctions = async (floorId, roomId) => {
    //         let config = {
    //             method: "post",
    //             url:
    //                 ReturnHostBackend(process.env.REACT_APP_DATA_HUB) +
    //                 process.env.REACT_APP_ASSET_GET_FUNCTIONS,
    //             headers: {
    //                 authorization: getToken(),
    //             },
    //             data: {
    //                 floor_id:
    //                     floorId === null || floorId === undefined
    //                         ? ""
    //                         : floorId,
    //                 room_id:
    //                     roomId === null || roomId === undefined ? "" : roomId,
    //             },
    //         };

    //         try {
    //             const result = await axios(config);

    //             if (result.status === 200) {
    //                 let { data } = result;

    //                 if (data.count > 0) {
    //                     let { data: queryData } = data;

    //                     queryData = queryData.map((row) => {
    //                         return {
    //                             id: row.function_id,
    //                             name: row.function_type,
    //                         };
    //                     });

    //                     setFilterOptions((prevState) => {
    //                         return {
    //                             ...prevState,
    //                             functions: queryData,
    //                         };
    //                     });

    //                     if (
    //                         filter.functionId !== null &&
    //                         filter.functionId !== undefined &&
    //                         !queryData.find(
    //                             (row) => row.id === filter.functionId
    //                         )
    //                     ) {
    //                         setFilter((prevState) => {
    //                             return {
    //                                 ...prevState,
    //                                 functionId: queryData[0].id,
    //                             };
    //                         });
    //                     }
    //                 } else {
    //                     setFilterOptions((prevState) => {
    //                         return {
    //                             ...prevState,
    //                             functions: [],
    //                         };
    //                     });
    //                     setFilter((prevState) => {
    //                         return {
    //                             ...prevState,
    //                             functionId: null,
    //                         };
    //                     });
    //                 }
    //             } else {
    //                 toast.error("Error getting functions data");
    //             }
    //         } catch (e) {
    //             toast.error("Error calling API to get functions data");
    //         }
    //     };

    //     (async () => {
    //         await getFunctions(filter.floorId, filter.roomId);
    //     })();
    // }, [filter.floorId, filter.roomId]);

    // Get assets when the filter changes
    useEffect(() => {
        const getAssets = async (floorId, roomId, functionId) => {
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_DATA_HUB) +
                    process.env.REACT_APP_ASSET_GET_ASSETS_FILTER,
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
                    function_id:
                        functionId === null || functionId === undefined
                            ? ""
                            : functionId,
                },
            };

            try {
                const result = await axios(config);

                if (result.status === 200) {
                    let { data } = result;

                    if (data.count > 0) {
                        let { data: queryData } = data;

                        let emptyArr = [];

                        queryData.map((row) => {
                            return emptyArr.push(row.asset_number);
                        });

                        setFilterOptions((prev) => {
                            return {
                                ...prev,
                                assets: emptyArr,
                            };
                        });

                        // queryData = queryData.map((row) => {
                        //     return {
                        //         id: row.asset_id,
                        //         name: row.asset_number,
                        //     };
                        // });

                        // setFilterOptions((prev) => {
                        //     return {
                        //         ...prev,
                        //         assets: queryData,
                        //     };
                        // });
                    } else {
                        setFilterOptions((prev) => {
                            return {
                                ...prev,
                                assets: [],
                            };
                        });
                        setFilter((prev) => {
                            return {
                                ...prev,
                                assetId: null,
                            };
                        });
                    }
                } else {
                    toast.error("Error getting assets data", {
                        toastId: "AF_error-get-assets_S_400",
                    });
                }
            } catch (e) {
                // console.log(e.message);
                toast.error("Error calling API to get assets data", {
                    toastId: "AF_error-get-assets_API",
                });
            }
        };

        (async () => {
            setIsLoadingAssetNo(true);
            await getAssets(filter.floorId, filter.roomId, filter.functionId);
            setIsLoadingAssetNo(false);
        })();
    }, [filter.floorId, filter.roomId, filter.functionId]);

    const handleChange = (e) => {
        let { name, value } = e.target;
        let id = value !== "" ? parseInt(value) : null;

        switch (name) {
            case "floor":
                setFilter((prevState) => {
                    if (id == null) {
                        return { ...prevState, floorId: null, roomId: null };
                    } else {
                        return { ...prevState, floorId: id };
                    }
                });
                break;
            case "room":
                setFilter((prevState) => {
                    return { ...prevState, roomId: id };
                });
                break;
            case "function":
                setFilter((prevState) => {
                    return { ...prevState, functionId: id, assetNo: null };
                });
                setFilterDataList((prevState) => {
                    return { ...prevState, assetNo: "" };
                });
                break;
            case "asset":
                setFilterDataList((prevState) => {
                    return { ...prevState, assetNo: value };
                });
                break;
            default:
                break;
        }
    };

    const [search, setSearch] = useState(null);

    const handleChangeSearch = (e) => {
        setSearch(e);
    };

    const isValidAssetNo = (assetNo) => {
        return (
            filterOptions.assets &&
            filterOptions.assets.length > 0 &&
            filterOptions.assets.find((asset) => asset === assetNo)
        );
    };

    // Pass filter input to index
    useEffect(async () => {
        filterValue(filter);
    }, [filter.floorId, filter.roomId, filter.functionId, filter.assetNo]);

    // Pass seach input to index
    useEffect(() => {
        searchValue(search);
    }, [search]);

    const handleExport = async () => {
        let filtered = {
            floor:
                filter.floorId == null
                    ? ""
                    : filterOptions.floors.find(
                          (item) => item.id == filter.floorId
                      ),
            room:
                filter.roomId == null
                    ? ""
                    : filterOptions.rooms.find(
                          (item) => item.id == filter.roomId
                      ),
            function:
                filter.functionId == null
                    ? ""
                    : filterOptions.functions.find(
                          (item) => item.id == filter.functionId
                      ),
            assetNo: filter.assetNo == null ? "" : filter.assetNo,
        };

        exportData(filtered);
    };

    return (
        <div className='page-filter'>
            <div className='page-filter-content'>
                <SearchBar
                    name='search'
                    value={search}
                    search={handleChangeSearch}
                    searchContent={() => {
                        searchContent();
                    }}
                />
                <InputDropdownHorizontal
                    name='floor'
                    label='Floor'
                    value={filter.floorId}
                    options={filterOptions.floors}
                    onChange={handleChange}
                    inputWidth='100px'
                    isLoading={isLoadingFloor}
                />
                <InputDropdownHorizontal
                    name='room'
                    label='Room'
                    value={filter.roomId}
                    options={filterOptions.rooms}
                    onChange={handleChange}
                    isDisabled={
                        filter.floorId === null || filter.floorId === undefined
                    }
                    inputWidth='100px'
                    isLoading={isLoadingRoom}
                />
                <InputDropdownHorizontal
                    name='function'
                    label='Function'
                    value={filter.functionId}
                    options={filterOptions.functions}
                    onChange={handleChange}
                    inputWidth='245px'
                    isLoading={isLoadingFunction}
                />
                <InputTextAutoSuggestHorizontal
                    name='asset'
                    label='Asset No'
                    value={filterDataList.assetNo}
                    options={filterOptions.assets}
                    onChange={handleChange}
                    validateInput={(e) => {
                        let { value } = e.target;

                        let assetNo = filterOptions.assets.find(
                            (asset) => asset === value
                        );

                        if (value !== "") {
                            if (assetNo && assetNo !== undefined) {
                                setFilter((prev) => {
                                    return {
                                        ...prev,
                                        assetNo: assetNo,
                                    };
                                });
                            } else {
                                value = "";
                                setFilterDataList({
                                    assetNo: "",
                                });
                                toast.error("Invalid input Asset Number", {
                                    toastId: "AF_error-invalid-asset-num",
                                });
                                return;
                            }
                        } else {
                            setFilter((prev) => {
                                return {
                                    ...prev,
                                    assetNo: "",
                                };
                            });
                        }
                    }}
                    onClear={() => {
                        setFilterDataList((prev) => {
                            return {
                                ...prev,
                                assetNo: "",
                            };
                        });
                    }}
                    isLoading={isLoadingAssetNo}
                    // inputWidth='110px'
                />
            </div>
            <div className='exports'>
                <ExportButton
                    isLoading={isLoadingExport}
                    onClick={handleExport}
                />
            </div>
        </div>
    );
}

export default AssetFilter;
