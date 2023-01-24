// React
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

// Style and Svgs
import "../style.scss";
// Component Reuseable
import {
    InputDateVertical,
    InputDropdownVertical,
    InputTextAreaVertical,
    InputTextVertical,
    InputTextPairVertical,
    UploadPhoto,
    ModalContainer,
    LoadingData,
    LoadingUploadFile,
    InputDropdownCreatableVertical,
} from "../../../ComponentReuseable/index";

import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { getToken } from "../../../TokenParse/TokenParse";

import AssetUploadFile from "./AssetUploadFile";

function formatDate(date) {
    var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
}

function AssetAddOrUpdatePop(props) {
    // Props
    const {
        title,
        submitName,
        clearName,
        isShowing,
        hide,
        onSubmit,
        selectedAsset,
        updatedAsset,
    } = props;

    const [inputData, setInputData] = useState({
        area: [],
        asset_id: "",
        asset_image: "",
        asset_name: "",
        asset_short_name: "",
        asset_number: "",
        brand: {},
        commissioned_date: "",
        //  formatDate(new Date()),
        data_sheet: "",
        description: "",
        floor: {},
        function: {},
        model_number: {},
        room: {},
    });

    const [inputOptions, setInputOptions] = useState({
        floors: [],
        rooms: [],
        functions: [],
        brands: [],
        model_numbers: [],
    });

    const getDataSheet = async (asset_id) => {
        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_ASSET_GET_DATA_SHEET,
            headers: {
                authorization: getToken(),
            },
            data: {
                asset_id:
                    asset_id === null || asset_id === undefined ? "" : asset_id,
            },
        };

        try {
            const result = await axios(config);

            if (result.status === 200) {
                let { data } = result.data;
                // console.log(data);
                let resultArr = [];

                data = data.filter(
                    (data) => data.data_sheet_location.length !== 0
                );

                data.map((data) => {
                    resultArr.push({
                        file:
                            // process.env.REACT_APP_BACKEND_NODELINX +
                            "/filerepository/dcim/uploadFileFromAPI/" +
                            data.data_sheet_location,
                        file_name: data.data_sheet_location.split("/")[1],
                    });
                });
                // console.log(resultArr);
                inputData.data_sheet = resultArr;
            } else {
                toast.error("Error getting asset data sheet", {
                    toastId: "AU_error-get-datasheet_S_400",
                });
            }
        } catch (e) {
            selectedAsset.data_sheet = "";
            // console.log(e.message);
            // toast.warning("No data sheet for selected asset.", {
            //     toastId: "error-get-data-sheet" + asset_id,
            // });
        }
    };
    useEffect(() => {
        (async () => {
            if (selectedAsset !== undefined) {
                setIsLoading(true);
                await getDataSheet(selectedAsset.asset_id);
                setIsLoading(false);
            }
        })();
    }, [selectedAsset]);

    useEffect(() => {
        if (selectedAsset !== undefined) {
            inputData.area = selectedAsset.area;
            inputData.asset_id = selectedAsset.asset_id;
            inputData.asset_image = selectedAsset.asset_image;
            inputData.asset_name = selectedAsset.asset_name;
            inputData.asset_short_name = selectedAsset.short_name;
            inputData.asset_number = selectedAsset.asset_number;
            inputData.brand = selectedAsset.brand;
            inputData.commissioned_date = selectedAsset.commissioned_date;
            inputData.data_sheet = selectedAsset.data_sheet;
            inputData.description = selectedAsset.description;
            inputData.floor = selectedAsset.floor;
            inputData.function = selectedAsset.function;
            inputData.model_number = selectedAsset.model_number;
            inputData.room = selectedAsset.room;
        }
    }, [selectedAsset]);

    const [isLoadingFloor, setIsLoadingFloor] = useState(false);
    const [isLoadingRoom, setIsLoadingRoom] = useState(false);
    const [isLoadingFunction, setIsLoadingFunction] = useState(false);
    const [isLoadingBrand, setIsLoadingBrand] = useState(false);
    const [isLoadingModel, setIsLoadingModel] = useState(false);

    const handleInputChange = (e) => {
        let { name, value } = e.target;

        if (name == "area1") {
            if (inputData.area.length < 2) {
                inputData.area.push("");
            }
            setInputData((prev) => {
                return {
                    ...prev,
                    area: [value.toUpperCase(), prev.area[1]],
                };
            });
        } else if (name == "area2") {
            if (inputData.area.length < 2) {
                inputData.area.push("");
            }
            setInputData((prev) => {
                return {
                    ...prev,
                    area: [prev.area[0], value.toUpperCase()],
                };
            });
        } else if (name == "asset_number") {
            setInputData((prev) => {
                return {
                    ...prev,
                    asset_number: value.replace(/[#|/|?|%]/gi, ""),
                };
            });
            // } else if (name == "asset_name") {
            //     setInputData((prev) => {
            //         return {
            //             ...prev,
            //             asset_name: value.replace(/[#|/|?|%]/gi, ""),
            //         };
            //     });
        } else if (name == "asset_short_name" && value.length > 17) {
            toast.error("Maximum length for asset short name is 17 character", {
                toastId: "error-max-length-asset-short-name",
            });
            setInputData((prev) => {
                return {
                    ...prev,
                    asset_short_name: value.slice(0, 17),
                };
            });
        } else {
            setInputData((prev) => {
                prev[name] = value;
                return { ...prev };
            });
        }

        if (name == "function") {
            setInputData((prev) => {
                return {
                    ...prev,
                    model_number: "",
                };
            });
        } else if (name == "floor") {
            setInputData((prev) => {
                return {
                    ...prev,
                    room: "",
                };
            });
        }
    };

    const [isLoading, setIsLoading] = useState(false);
    const [progressBarUpload, setProgressBarUpload] = useState();

    // Get Brands
    const getBrands = async () => {
        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_ASSET_GET_BRANDS,
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

                    queryData = queryData.filter((data) => {
                        return data.machine_brand.length != 0;
                    });

                    setInputOptions((prev) => {
                        return {
                            ...prev,
                            brands: queryData.map((row) => {
                                return {
                                    id: row.id,
                                    value: row.machine_brand,
                                    label: row.machine_brand,
                                };
                            }),
                        };
                    });
                } else {
                    setInputOptions((prev) => {
                        return {
                            ...prev,
                            brands: [],
                        };
                    });
                }
            } else {
                toast.error("Error getting brands data", {
                    toastId: "AU_error-get-brand_S_400",
                });
            }
        } catch (e) {
            // console.log(e.message);
            toast.error("Error calling API to get brands data", {
                toastId: "AU_error-get-brand_API",
            });
        }
    };
    useEffect(() => {
        (async () => {
            setIsLoadingBrand(true);
            await getBrands();
            setIsLoadingBrand(false);
        })();
    }, []);

    // const getEmptyBrand = async () => {
    //     let config = {
    //         method: "post",
    //         url:
    //             ReturnHostBackend(process.env.REACT_APP_JDBC) +
    //             process.env.REACT_APP_ASSET_GET_EMPTY_BRAND,
    //         headers: {
    //             authorization: getToken(),
    //         },
    //     };

    //     try {
    //         const result = await axios(config);

    //         if (result.status === 200) {
    //             return result.data.data[0].id;
    //         } else {
    //             toast.error("Error getting empty brand data");
    //         }
    //     } catch (e) {
    //         // console.log(e.message);
    //         toast.error("Error calling API to get empty brand data");
    //     }
    // };

    // Add Brand
    const addBrand = async (brand) => {
        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_ASSET_ADD_BRAND,
            headers: {
                authorization: getToken(),
            },
            data: {
                brand: brand,
            },
        };

        setIsLoadingBrand(true);
        try {
            const result = await axios(config);
            if (result.status === 200) {
                setIsLoadingBrand(true);
                await getBrands();
                setIsLoadingBrand(false);
                return result.data.data[0].id;
            } else {
                toast.error("Error adding brand", {
                    toastId: "AU_error-add-brand_S_400",
                });
            }
        } catch (e) {
            // console.log(e.message)
            toast.error("Error calling API to add brand", {
                toastId: "AU_error-add-brand_API",
            });
        }
        setIsLoadingBrand(false);
    };

    // Delete Brand
    const deleteBrand = async (brand_id) => {
        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_ASSET_DELETE_BRAND,
            headers: {
                authorization: getToken(),
            },
            data: {
                brand_id: brand_id,
            },
        };
        setIsLoadingBrand(true);
        try {
            const result = await axios(config);
            if (result.status === 200) {
                if (result.data.includes("violates foreign key constraint")) {
                    toast.error(
                        "Failed to delete brand option due to existing model number with this brand.",
                        { toastId: "AU_error-del-brand" }
                    );
                }

                setIsLoadingBrand(true);
                await getBrands();
                setIsLoadingBrand(false);
            } else {
                toast.error("Error deleting brand", {
                    toastId: "AU_error-del-brand_S_400",
                });
            }
        } catch (e) {
            // console.log(e.message);
            toast.error("Error calling API to delete brand", {
                toastId: "AU_error-del-brand_API",
            });
        }
        setIsLoadingBrand(false);
    };

    // Get Models
    const getModels = async (function_id, brand_id) => {
        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_ASSET_GET_MODELS,
            headers: {
                authorization: getToken(),
            },
            data: {
                function_id:
                    function_id === null || function_id === undefined
                        ? ""
                        : function_id,
                brand_id:
                    brand_id === null || brand_id === undefined ? "" : brand_id,
            },
        };

        try {
            const result = await axios(config);

            if (result.status === 200) {
                let { data } = result;
                if (data.count > 0) {
                    let { data: queryData } = data;

                    queryData = queryData.filter((data) => {
                        return data.machine_model.length != 0;
                    });

                    setInputOptions((prev) => {
                        return {
                            ...prev,
                            model_numbers: queryData.map((row) => {
                                return {
                                    id: row.id,
                                    value: row.machine_model,
                                    label: row.machine_model,
                                };
                            }),
                        };
                    });
                } else {
                    setInputOptions((prev) => {
                        return {
                            ...prev,
                            model_numbers: [],
                        };
                    });
                }
            } else {
                toast.error("Error getting model numbers data", {
                    toastId: "AU_error-get-model_S_400",
                });
            }
        } catch (e) {
            // console.log(e.message);
            toast.error("Error calling API to get model numbers data", {
                toastId: "AU_error-get-model_API",
            });
        }
    };
    useEffect(() => {
        (async () => {
            setIsLoadingModel(true);
            await getModels(
                inputData === undefined || inputData == null
                    ? null
                    : inputData.function.id == undefined
                    ? inputData.function
                    : inputData.function.id,
                inputData === undefined || inputData == null
                    ? null
                    : inputData.brand.id
            );
            setIsLoadingModel(false);
        })();
    }, [
        inputData === undefined || inputData == null
            ? null
            : inputData.function.id === undefined
            ? inputData.function
            : inputData.function.id,
        inputData === undefined || inputData == null
            ? null
            : inputData.brand.id,
    ]);

    // Add Model Number
    const addModel = async (brand_id, function_id, model_number) => {
        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_ASSET_ADD_MODEL,
            headers: {
                authorization: getToken(),
            },
            data: {
                brand_id: brand_id,
                function_id: function_id,
                model_number: model_number,
            },
        };
        setIsLoadingModel(true);
        try {
            const result = await axios(config);
            if (result.status === 200) {
                setIsLoadingModel(true);
                await getModels(
                    inputData.function.id == undefined
                        ? inputData.function
                        : inputData.function.id,
                    inputData.brand.id
                );
                setIsLoadingModel(false);
                return result.data.data[0].id;
            } else {
                toast.error("Error adding model number", {
                    toastId: "AU_error-add-model_S_400",
                });
            }
        } catch (e) {
            // console.log(e.message);
            toast.error("Error calling API to add model number", {
                toastId: "AU_error-add-model_API",
            });
        }
        setIsLoadingModel(false);
    };

    // const getModel = async (brand_id, function_id, model_number) => {
    //     let config = {
    //         method: "post",
    //         url:
    //             ReturnHostBackend(process.env.REACT_APP_JDBC) +
    //             process.env.REACT_APP_ASSET_GET_MODEL,
    //         headers: {
    //             authorization: getToken(),
    //         },
    //         data: {
    //             brand_id: brand_id,
    //             function_id: function_id,
    //             model_number: model_number,
    //         },
    //     };
    //     setIsLoadingModel(true);
    //     try {
    //         const result = await axios(config);
    //         if (result.status === 200) {
    //             return result.data.data[0].id;
    //         } else {
    //             toast.error("Error adding model number");
    //         }
    //     } catch (e) {
    //         // console.log(e.message);
    //         // toast.error("Error calling API to add model number");
    //     }
    //     setIsLoadingModel(false);
    // };

    // Delete Model Number
    const deleteModel = async (model_number_id) => {
        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_ASSET_DELETE_MODEL,
            headers: {
                authorization: getToken(),
            },
            data: {
                model_number_id: model_number_id,
            },
        };
        setIsLoadingModel(true);
        try {
            const result = await axios(config);
            if (result.status === 200) {
                if (
                    typeof result.data == "string" &&
                    result.data.includes("violates foreign key constraint")
                ) {
                    toast.error(
                        "Failed to delete model number option due to existing asset with this model number.",
                        { toastId: "AU_error-del-model" }
                    );
                }

                setIsLoadingModel(true);
                await getModels(
                    inputData.function.id == undefined
                        ? inputData.function
                        : inputData.function.id,
                    inputData.brand.id
                );
                setIsLoadingModel(false);
            } else {
                toast.error("Error deleting model number", {
                    toastId: "AU_error-del-model_S_400",
                });
            }
        } catch (e) {
            // console.log(e.message);
            toast.error("Error calling API to delete model number", {
                toastId: "AU_error-del-model_API",
            });
        }
        setIsLoadingModel(false);
    };

    const valAssetNum = async (asset_number, asset_id) => {
        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_ASSET_VAL_EXIST_ASSET_NUMBER_UPDATE,
            headers: {
                authorization: getToken(),
            },
            data: {
                asset_number: asset_number,
                asset_id: asset_id,
            },
        };
        setIsLoading(true);
        try {
            const result = await axios(config);
            if (result.status === 200) {
                setIsLoading(false);
                if (result.data.count != 0) {
                    return result.data.data[0].id;
                } else {
                    return undefined;
                }
            } else {
                toast.error("Error validating existing asset number", {
                    toastId: "AU_error-val-asset-num_S_400",
                });
            }
        } catch (e) {
            // console.log(e.message);
            toast.error("Error validating existing asset number", {
                toastId: "AU_error-val-asset-num_API",
            });
        }
        setIsLoading(false);
    };

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

                        setInputOptions((prevState) => {
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
                        setInputOptions((prevState) => {
                            return {
                                ...prevState,
                                floors: [],
                            };
                        });
                    }
                } else {
                    toast.error("Error getting floors data", {
                        toastId: "AU_error-get-floor_S_400",
                    });
                }
            } catch (e) {
                toast.error("Error calling API to get floors data", {
                    toastId: "AU_error-get-floor_API",
                });
            }
        };

        (async () => {
            setIsLoadingFloor(true);
            await getFloors();
            setIsLoadingFloor(false);
        })();
    }, []);

    // Get Rooms
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

                        setInputOptions((prevState) => {
                            return {
                                ...prevState,
                                rooms: queryData,
                            };
                        });
                    } else {
                        setInputOptions((prevState) => {
                            return {
                                ...prevState,
                                rooms: [],
                            };
                        });
                    }
                } else {
                    toast.error("Error getting rooms data", {
                        toastId: "AU_error-get-room_S_400",
                    });
                }
            } catch (e) {
                toast.error("Error calling API to get rooms data", {
                    toastId: "AU_error-get-room_API",
                });
            }
        };
        (async () => {
            setIsLoadingRoom(true);
            await getRooms(
                inputData === undefined || inputData === null
                    ? null
                    : inputData.floor.id === undefined
                    ? inputData.floor
                    : inputData.floor.id
            );
            setIsLoadingRoom(false);
        })();
    }, [
        inputData === undefined || inputData === null
            ? null
            : inputData.floor.id === undefined
            ? inputData.floor
            : inputData.floor.id,
    ]);

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

                        setInputOptions((prevState) => {
                            return {
                                ...prevState,
                                functions: queryData,
                            };
                        });
                    } else {
                        setInputOptions((prevState) => {
                            return {
                                ...prevState,
                                functions: [],
                            };
                        });
                    }
                } else {
                    toast.error("Error getting functions data", {
                        toastId: "AU_error-get-function_S_400",
                    });
                }
            } catch (e) {
                toast.error("Error calling API to get functions data", {
                    toastId: "AU_error-get-function_API",
                });
            }
        };

        (async () => {
            setIsLoadingFunction(true);
            await getFunctions(null, null);
            setIsLoadingFunction(false);
        })();
    }, []);

    // const uploadFile = async (file, file_path) => {
    //     const formData = new FormData();
    //     formData.append("file", file);
    //     formData.append("file_path", file_path);

    //     const config = {
    //         method: "post",
    //         url:
    //             ReturnHostBackend(process.env.REACT_APP_SERVICES) +
    //             process.env.REACT_APP_ASSET_UPLOAD_FILE,
    //         headers: {
    //             authorization: getToken(),
    //         },
    //         data: formData,
    //     };

    //     try {
    //         const result = await axios(config);

    //         if (result.status === 200) {
    //             return file_path;
    //         } else {
    //             toast.error("Error uploading file");
    //         }
    //     } catch (e) {
    //         // console.log(e.message);
    //         toast.error("Error calling API to upload file");
    //     }
    // };

    // const deleteFile = async (file_path) => {
    //     const config = {
    //         method: "delete",
    //         url:
    //             ReturnHostBackend(process.env.REACT_APP_BACKEND_NODELINX) +
    //             "/api/uploadFileRepository",
    //         headers: {
    //             authorization: getToken(),
    //         },
    //         data: {
    //             path: file_path,
    //         },
    //     };

    //     try {
    //         const result = await axios(config);
    //         if (result.status === 200) {
    //         } else {
    //             // console.log("Error deleting file");
    //             // toast.error("Error deleting file");
    //         }
    //     } catch (e) {
    //         // console.log(e.message);
    //         // toast.error("Error calling API to delete file");
    //     }
    // };

    const handleInputClear = async () => {
        let proxy = {};

        proxy.area = selectedAsset.area;
        proxy.asset_id = selectedAsset.asset_id;
        proxy.asset_image = selectedAsset.asset_image;
        proxy.asset_name = selectedAsset.asset_name;
        proxy.asset_short_name = selectedAsset.short_name;
        proxy.asset_number = selectedAsset.asset_number;
        proxy.brand = selectedAsset.brand;
        proxy.commissioned_date = selectedAsset.commissioned_date;
        proxy.data_sheet = inputData.data_sheet;
        proxy.description = selectedAsset.description;
        proxy.floor = selectedAsset.floor;
        proxy.function = selectedAsset.function;
        proxy.model_number = selectedAsset.model_number;
        proxy.room = selectedAsset.room;
        // proxy.asset_image_file = null;
        // proxy.asset_image_file_name = "";
        proxy.data_sheet_file = null;
        // proxy.data_sheet_file_path = "";

        setInputData(proxy);
    };

    const lettersNumberTonumber = (inputText) => {
        const [letter, number] = inputText
            .replace(/\'/g, "")
            .split(/(\d+)/)
            .filter(Boolean);
        let output = 0;
        if (letter.split("").length === 1) {
            output = letter.split("")[0].toLowerCase().charCodeAt(0) - 97;
        } else if (letter.split("").length === 2) {
            output =
                26 *
                    (letter.split("")[0].toLowerCase().charCodeAt(0) - 97 + 1) -
                1 +
                letter.split("")[1].toLowerCase().charCodeAt(0) -
                97 +
                1;
        }

        return [output, parseInt(number)];
    };

    const handleInputUpdate = async (e) => {
        e.preventDefault();

        if (inputData.area == null) {
            // toast.error("Empty Area Input");
            setInputData((prev) => {
                return { ...prev, area: [""] };
            });
            return;
        }

        if (inputData.area.length < 2) {
            inputData.area.push("");
        }

        if (
            inputData.area[1] &&
            inputData.area[1].length > inputData.area[0].length
        ) {
            toast.error("Please start input Area in the first field", {
                toastId: "AU_error-inval-area-input",
            });
            return;
        }

        // Area Input Validation
        const areaArr = inputData.area;
        const valRegex = /^[A-Z]+[0-9]+$/;

        // Check for empty area input
        if (areaArr[0] && !valRegex.test(areaArr[0])) {
            toast.error("Invalid Input Area1.", {
                toastId: "AU_error-inval-area1-input",
            });
            return;
        }
        if (areaArr[1] && !valRegex.test(areaArr[1])) {
            toast.error("Invalid Input Area2.", {
                toastId: "AU_error-inval-area2-input",
            });
            return;
        }

        // Area Input Validation
        const A1 = areaArr[0] ? lettersNumberTonumber(areaArr[0]) : null;
        const A2 = areaArr[1] ? lettersNumberTonumber(areaArr[1]) : null;

        // Input Area1 and Area2 comparison
        if (A1 && A2) {
            if (A2[0] === A1[0] && A2[1] === A1[1]) {
                toast.error(
                    "Invalid input Area2 must be greater than input Area1.",
                    { toastId: "AU_error-invalid-area12-input" }
                );
                return;
            }
            if (A2[0] >= A1[0] && A2[1] >= A1[1]) {
            } else {
                toast.error(
                    "Invalid input Area2 must be greater than input Area1.",
                    { toastId: "AU_error-invalid-area12-input" }
                );
                return;
            }
        }

        // Queries Part 1 : Validation Empty Brand and Model Number Input and Existing Asset Number
        // Empty Brand Situation
        let checkEmptyBrand;
        if (inputData.brand === "") {
            checkEmptyBrand = await addBrand("");
        }
        // Empty Model Number Situation
        let checkModel;
        if (inputData.model_number === "") {
            checkModel = await addModel(
                inputData.brand === "" ? checkEmptyBrand : inputData.brand.id,
                inputData.function.id == undefined
                    ? inputData.function
                    : inputData.function.id,
                inputData.model_number
            );
        }
        // Check Existing Asset Number
        let checkAssetNUmber = await valAssetNum(
            inputData.asset_number,
            inputData.asset_id
        );
        if (checkAssetNUmber !== undefined) {
            toast.error("Asset number already exist", {
                toastId: "AU_error-asset-num-exist",
            });
            return;
        }

        // Queries Part 2: Update Asset
        const formData_Q2 = new FormData();
        formData_Q2.append("asset_number", inputData.asset_number);
        formData_Q2.append("asset_name", inputData.asset_name);
        formData_Q2.append("asset_short_name", inputData.asset_short_name);
        formData_Q2.append(
            "function_id",
            inputData.function.id === undefined
                ? inputData.function
                : inputData.function.id
        );
        formData_Q2.append(
            "floor_id",
            inputData.floor.id === undefined
                ? inputData.floor
                : inputData.floor.id
        );
        formData_Q2.append(
            "room_id",
            inputData.room.id === undefined ? inputData.room : inputData.room.id
        );
        formData_Q2.append("area_1", inputData.area[0]);
        formData_Q2.append("area_2", inputData.area[1]);
        formData_Q2.append(
            "commissioned_date",
            inputData.commissioned_date !== ""
                ? new Date(inputData.commissioned_date).toISOString()
                : ""
        );
        formData_Q2.append("brand", inputData.brand.id);
        formData_Q2.append(
            "model_number",
            inputData.model_number === ""
                ? checkModel
                : inputData.model_number.id
        );
        formData_Q2.append("description", inputData.description);
        formData_Q2.append("asset_id", inputData.asset_id);
        formData_Q2.append("asset_image", inputData.asset_image);
        formData_Q2.append(
            "asset_image_file",
            inputData.asset_image_file == null ||
                inputData.asset_image_file == undefined
                ? null
                : inputData.asset_image_file
        );
        formData_Q2.append(
            "asset_image_file_name",
            inputData.asset_image_file_name == undefined
                ? ""
                : inputData.asset_image_file_name
        );

        const config_Q2 = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_ASSET_UPDATE_ASSET_Q2,
            headers: {
                authorization: getToken(),
            },
            data: formData_Q2,
            onUploadProgress: (data) => {
                setProgressBarUpload(
                    Math.round((data.loaded / data.total) * 100)
                );
            },
        };

        setIsLoading(true);
        try {
            const result = await axios(config_Q2);
            setProgressBarUpload(0);
            // console.log(result.data.data);
            if (result.status !== 200) {
                toast.error("Error updating asset.", {
                    toastId: "AU_error-update-asset_S_400",
                });
                setIsLoading(false);
                return;
            }
        } catch (e) {
            setProgressBarUpload(0);
            // console.log(e.message);
            toast.error("Error calling API to update asset", {
                toastId: "AU_error-update-asset_API",
            });
            setIsLoading(false);
            return;
        }
        setIsLoading(false);

        // Queries Part 3: Update Data Sheets

        let old_data_sheets = inputData.data_sheet_file.filter((data) =>
            data.file_name.includes(inputData.asset_id)
        );

        const config_Q3_3 = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_ASSET_UPDATE_ASSET_Q3_3,
            headers: {
                authorization: getToken(),
            },
            data: {
                data_sheets: JSON.stringify(
                    old_data_sheets.map((data) => {
                        return "data_sheet/" + data.file_name;
                    })
                )
                    .slice(1, -1)
                    .replace(/\"/g, "'"),
                asset_id: inputData.asset_id,
            },
        };

        setIsLoading(true);
        try {
            const result = await axios(config_Q3_3);

            if (result.status !== 200) {
                toast.error("Error editing data sheets", {
                    toastId: "AU_error-edit-datasheet_S_400",
                });
                setIsLoading(false);
            }
        } catch (e) {
            // console.log(e.message);
            toast.error("Error calling API to edit data assets", {
                toastId: "AU_error-edit-datasheet_API",
            });
            setIsLoading(false);
        }
        setIsLoading(false);

        const new_data_sheets = inputData.data_sheet_file.filter(
            (data) => !data.file_name.includes(inputData.asset_id)
        );

        if (new_data_sheets.length > 0) {
            const formData_Q3 = new FormData();
            new_data_sheets.forEach((data) => {
                formData_Q3.append(
                    "pathFile",
                    "data_sheet/" + inputData.asset_id + "_" + data.file_name
                );
                formData_Q3.append("file", data.file);
            });

            const config_Q3 = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_BACKEND_NODELINX) +
                    process.env.REACT_APP_IMAGE_UPLOAD,
                headers: {
                    authorization: getToken(),
                },
                data: formData_Q3,
                onUploadProgress: (data) =>
                    setProgressBarUpload(
                        Math.round((data.loaded / data.total) * 100)
                    ),
            };

            setIsLoading(true);
            let data_sheets_arr = [];
            try {
                const result = await axios(config_Q3);
                setProgressBarUpload(0);
                if (result.status === 200) {
                    data_sheets_arr = result.data.pathFile;
                } else {
                    toast.error("Error uploading data sheets", {
                        toastId: "AU_error-upload-datasheet_S_400",
                    });
                }
            } catch (e) {
                // console.log(e.message);
                setProgressBarUpload(0);
                toast.error("Error calling API to upload data sheets", {
                    toastId: "AU_error-upload-datasheet_API",
                });
            }
            setIsLoading(false);

            if (data_sheets_arr.length > 0) {
                const config_Q3_2 = {
                    method: "post",
                    url:
                        ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                        process.env.REACT_APP_ASSET_ADD_ASSET_Q3_2,
                    headers: {
                        authorization: getToken(),
                    },
                    data: {
                        data_sheets: JSON.stringify(data_sheets_arr),
                        asset_id: inputData.asset_id,
                    },
                };

                setIsLoading(true);
                try {
                    const result = await axios(config_Q3_2);

                    if (result.status === 200) {
                        toast.success("Asset Edited");
                    } else {
                        toast.error("Error adding data sheets");
                        setIsLoading(false);
                    }
                } catch (e) {
                    // console.log(e.message);
                    toast.error("Error calling API to add data assets");
                    setIsLoading(false);
                }
                setIsLoading(false);
            } else {
                toast.success("Asset Edited");
            }
        } else {
            toast.success("Asset Edited");
        }

        updatedAsset();
        handleInputClear();
        onSubmit();

        // setIsLoading(true);
        // // Create form data
        // const formData = new FormData();
        // formData.append("asset_number", inputData.asset_number);
        // formData.append("asset_name", inputData.asset_name);
        // formData.append(
        //     "function_id",
        //     inputData.function.id === undefined
        //         ? inputData.function
        //         : inputData.function.id
        // );
        // formData.append(
        //     "floor_id",
        //     inputData.floor.id === undefined
        //         ? inputData.floor
        //         : inputData.floor.id
        // );
        // formData.append(
        //     "room_id",
        //     inputData.room.id === undefined ? inputData.room : inputData.room.id
        // );
        // formData.append("area_1", inputData.area[0]);
        // formData.append("area_2", inputData.area[1]);
        // formData.append(
        //     "commissioned_date",
        //     new Date(inputData.commissioned_date).toISOString()
        // );
        // formData.append("brand", inputData.brand.id);
        // formData.append(
        //     "model_number",
        //     inputData.model_number === ""
        //         ? checkModel
        //         : inputData.model_number.id
        // );
        // formData.append("description", inputData.description);
        // formData.append("asset_id", inputData.asset_id);
        // formData.append("asset_image", inputData.asset_image);
        // formData.append("data_sheet", inputData.data_sheet);
        // formData.append(
        //     "asset_image_file",
        //     inputData.asset_image_file == null ||
        //         inputData.asset_image_file == undefined
        //         ? null
        //         : inputData.asset_image_file
        // );
        // formData.append(
        //     "asset_image_file_name",
        //     inputData.asset_image_file_name == undefined
        //         ? ""
        //         : inputData.asset_image_file_name
        // );
        // formData.append(
        //     "data_sheet_file",
        //     // inputData.data_sheet_file == null ||
        //     //     inputData.data_sheet_file == undefined
        //     //     ? null
        //     //     :
        //     inputData.data_sheet_file
        // );
        // formData.append(
        //     "data_sheet_file_path",
        //     // inputData.data_sheet_file_path == undefined
        //     //     ? ""
        //     //     :
        //     inputData.data_sheet_file_path
        // );

        // const config = {
        //     method: "post",
        //     url:
        //         ReturnHostBackend(process.env.REACT_APP_SERVICES) +
        //         process.env.REACT_APP_ASSET_UPDATE_ASSET,
        //     headers: {
        //         authorization: getToken(),
        //     },
        //     data: formData,
        //     onUploadProgress: (data) => {
        //         setProgressBarUpload(
        //             Math.round((data.loaded / data.total) * 100)
        //         );
        //     },
        // };

        // try {
        //     const result = await axios(config);
        //     setProgressBarUpload(0);
        //     // console.log(result.data.data);
        //     if (result.status === 200) {
        //         if (
        //             result.data.data === undefined &&
        //             result.data.includes("violates unique constraint")
        //         ) {
        //             if (
        //                 result.data.includes("asset_number") &&
        //                 result.data.includes("duplicate key")
        //             ) {
        //                 toast.error("Asset Number already exists");
        //                 setIsLoading(false);
        //                 return;
        //             }
        //         } else {
        //             toast.success("Asset updated!");
        //         }
        //     } else {
        //         toast.error("Error updating asset.");
        //     }
        // } catch (e) {
        //     setProgressBarUpload(0);
        //     console.log(e.message);
        //     toast.error("Error calling API to update asset");
        // }

        // setIsLoading(false);
    };

    return (
        <ModalContainer
            formId={"update-asset"}
            width={"500px"}
            title={selectedAsset == null ? title : "Edit Asset " + title}
            isShowing={isShowing}
            hide={() => {
                handleInputClear();
                hide();
            }}
            isLoading={isLoading}
            submitName={submitName}
            showRequired={true}
            clearName={clearName}
            onClear={() => {
                handleInputClear();
            }}
            children={
                <form
                    id='update-asset'
                    onSubmit={handleInputUpdate}
                    className='asset-add-pop-container'>
                    <LoadingUploadFile percentage={progressBarUpload} />
                    <div
                        className='asset-add-pop-input-asset-number'
                        style={{ opacity: "0.7" }}>
                        <InputTextVertical
                            name='asset_number'
                            label='Asset Number'
                            value={
                                inputData == undefined
                                    ? null
                                    : inputData.asset_number
                            }
                            onChange={handleInputChange}
                            // isRequired={true}
                            isDisabled={true}
                        />
                    </div>
                    <div className='asset-add-pop-input-function'>
                        <InputDropdownVertical
                            width='100%'
                            name='function'
                            label='Function'
                            value={
                                inputData == undefined
                                    ? null
                                    : inputData.function.id === undefined
                                    ? inputData.function
                                    : inputData.function.id
                            }
                            options={inputOptions.functions}
                            onChange={handleInputChange}
                            isRequired={true}
                            isLoading={isLoadingFunction}
                        />
                    </div>
                    <div className='asset-add-pop-input-asset-name'>
                        <InputTextVertical
                            name='asset_name'
                            label='Asset Name'
                            value={
                                inputData == undefined
                                    ? null
                                    : inputData.asset_name
                            }
                            onChange={handleInputChange}
                            isRequired={true}
                        />
                    </div>
                    <div className='asset-add-pop-input-asset-short-name'>
                        <InputTextVertical
                            name='asset_short_name'
                            label='Asset Short Name'
                            value={
                                inputData == undefined
                                    ? null
                                    : inputData.asset_short_name
                            }
                            onChange={handleInputChange}
                            isRequired={true}
                        />
                    </div>
                    <div className='asset-add-pop-input-commissioned-date'>
                        <InputDateVertical
                            width={"100%"}
                            name='commissioned_date'
                            label='Commissioned Date'
                            value={
                                inputData == undefined
                                    ? null
                                    : formatDate(inputData.commissioned_date)
                            }
                            onChange={handleInputChange}
                            // isRequired={true}
                            hideClearData={false}
                            clearData={() => {
                                setInputData((prev) => {
                                    return {
                                        ...prev,
                                        commissioned_date: "",
                                    };
                                });
                            }}
                        />
                    </div>
                    <div className='asset-add-pop-input-brand'>
                        {/* <InputTextVertical
                            name='brand'
                            label='Brand'
                            value={
                                inputData == undefined ? null : inputData.brand
                            }
                            onChange={handleInputChange}
                        /> */}
                        <InputDropdownCreatableVertical
                            name='brand'
                            label='Brand'
                            value={
                                inputData == undefined
                                    ? null
                                    : // : inputData.brand.id == null
                                      // ? {
                                      //       id: inputData.brand_id,
                                      //       label: inputData.brand,
                                      //       value: inputData.brand,
                                      //   }
                                      inputData.brand
                            }
                            options={inputOptions.brands}
                            // onChange={handleInputChange}
                            onSelect={(selectedOption) => {
                                setInputData((prev) => {
                                    return {
                                        ...prev,
                                        brand: selectedOption,
                                        model_number: "",
                                    };
                                });
                            }}
                            onCreateOption={(createdItem) => {
                                addBrand(createdItem);
                            }}
                            onDeleteOption={(deletedItem) => {
                                deleteBrand(deletedItem.id);
                                setInputData((prev) => {
                                    return {
                                        ...prev,
                                        brand: "",
                                        model_number: "",
                                    };
                                });
                            }}
                            // isRequired={true}
                            // inputwWidth='100%'
                            width='100%'
                            isLoading={isLoadingBrand}
                        />
                    </div>
                    <div className='asset-add-pop-input-model-number'>
                        {/* <InputTextVertical
                            name='model_number'
                            label='Model Number'
                            value={
                                inputData == undefined
                                    ? null
                                    : inputData.model_number
                            }
                            onChange={handleInputChange}
                        /> */}
                        <InputDropdownCreatableVertical
                            name='model_number'
                            label='Model Number'
                            value={
                                inputData == undefined
                                    ? null
                                    : // : inputData.model_number.id == null
                                      // ? {
                                      //       id: inputData.model_number_id,
                                      //       label: inputData.model_number,
                                      //       value: inputData.model_number,
                                      //   }
                                      inputData.model_number
                            }
                            options={inputOptions.model_numbers}
                            // onChange={handleInputChange}
                            onSelect={(selectedOption) => {
                                setInputData((prev) => {
                                    return {
                                        ...prev,
                                        model_number: selectedOption,
                                    };
                                });
                            }}
                            onCreateOption={(createdItem) => {
                                addModel(
                                    inputData.brand.id,
                                    inputData.function.id == undefined
                                        ? inputData.function
                                        : inputData.function.id,
                                    createdItem
                                );
                            }}
                            onDeleteOption={(deletedItem) => {
                                deleteModel(deletedItem.id);
                                setInputData((prev) => {
                                    return {
                                        ...prev,
                                        model_number: "",
                                    };
                                });
                            }}
                            // isRequired={true}
                            // inputWidth='100%'
                            width='100%'
                            isDisabled={
                                inputData == undefined ||
                                inputData == null ||
                                inputData.function === "" ||
                                inputData.brand.id === ""
                            }
                            isLoading={isLoadingModel}
                        />
                    </div>
                    <div className='asset-add-pop-input-upload'>
                        <span>Asset Image</span>
                        <UploadPhoto
                            height='220px'
                            width='200px'
                            onUpload={(photoFile) => {
                                setInputData((prev) => {
                                    return {
                                        ...prev,
                                        asset_image_file: photoFile,
                                        asset_image_file_name:
                                            photoFile.name.replace(/\s/g, ""),
                                    };
                                });
                            }}
                            defaultImage={
                                inputData == undefined
                                    ? null
                                    : inputData.asset_image_file == undefined
                                    ? ReturnHostBackend(
                                          process.env.REACT_APP_BACKEND_NODELINX
                                      ) +
                                      "/filerepository/dcim/uploadFileFromAPI/" +
                                      inputData.asset_image
                                    : inputData.asset_image_file
                            }
                            triggerClear={
                                inputData == undefined
                                    ? null
                                    : inputData.asset_image_file
                            }
                        />
                    </div>
                    <div className='asset-add-pop-input-location'>
                        <div className='asset-add-pop-input-location-floor'>
                            <InputDropdownVertical
                                width='100%'
                                name='floor'
                                label='Floor'
                                value={
                                    inputData == undefined
                                        ? null
                                        : inputData.floor.id === undefined
                                        ? inputData.floor
                                        : inputData.floor.id
                                }
                                options={inputOptions.floors}
                                onChange={handleInputChange}
                                isRequired={true}
                                isLoading={isLoadingFloor}
                            />
                        </div>
                        <div className='asset-add-pop-input-location-room'>
                            <InputDropdownVertical
                                width='100%'
                                name='room'
                                label='Room'
                                value={
                                    inputData == undefined
                                        ? null
                                        : inputData.room.id
                                }
                                options={inputOptions.rooms}
                                isDisabled={
                                    inputData == undefined
                                        ? false
                                        : inputData.floor.id === undefined
                                        ? inputData.floor === ""
                                        : inputData.floor.id === ""
                                }
                                onChange={handleInputChange}
                                isRequired={true}
                                isLoading={isLoadingRoom}
                            />
                        </div>
                        <div className='asset-add-pop-input-location-area'>
                            <InputTextPairVertical
                                width='120px'
                                label='Area'
                                nameFirst='area1'
                                valueFirst={
                                    inputData == undefined ||
                                    inputData.area == null
                                        ? null
                                        : inputData.area[0]
                                }
                                onChangeFirst={handleInputChange}
                                nameSecond='area2'
                                valueSecond={
                                    inputData == undefined ||
                                    inputData.area == null
                                        ? null
                                        : inputData.area[1]
                                }
                                onChangeSecond={handleInputChange}
                                // isRequired={true}
                            />
                        </div>
                    </div>
                    <div className='asset-add-pop-input-data-sheet'>
                        <div className='asset-add-pop-input-data-sheet-label'>
                            Data Sheet
                        </div>
                        <div className='asset-add-pop-input-data-sheet-files'>
                            <AssetUploadFile
                                // height='30px'
                                // width='200px'
                                onUpload={(file, file_name) => {
                                    setInputData((prev) => {
                                        return {
                                            ...prev,
                                            data_sheet_file: file,
                                            // data_sheet_file_path: file_name,
                                        };
                                    });
                                }}
                                isLoadingUpload={(isLoading) => {
                                    setIsLoading(isLoading);
                                }}
                                defaultFiles={
                                    inputData == undefined
                                        ? []
                                        : //  inputData.data_sheet_file ==
                                        //       undefined ||
                                        //   inputData.data_sheet_file == null
                                        // ?
                                        typeof inputData.data_sheet !== "object"
                                        ? []
                                        : inputData.data_sheet
                                    // : inputData.data_sheet_file
                                }
                                triggerClear={inputData.data_sheet_file == null}
                                // isEdit={true}
                            />
                        </div>
                    </div>
                    <div className='asset-add-pop-input-description'>
                        <InputTextAreaVertical
                            name='description'
                            label='Description'
                            value={
                                inputData == undefined
                                    ? null
                                    : inputData.description
                            }
                            onChange={handleInputChange}
                            height='100px'
                            // isRequired={true}
                        />
                    </div>
                </form>
            }
        />
    );
}

export default AssetAddOrUpdatePop;
