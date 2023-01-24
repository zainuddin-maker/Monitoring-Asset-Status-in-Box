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

function AssetAddPop(props) {
    // Props
    const { title, submitName, clearName, isShowing, hide, onSubmit } = props;

    const [inputData, setInputData] = useState({
        asset_image_file: null,
        asset_image_file_name: "",
        asset_number: "",
        asset_name: "",
        asset_short_name: "",
        function_id: "",
        floor_id: "",
        room_id: "",
        area: [""],
        commissioned_date: "",
        // formatDate(new Date()),
        brand: "",
        model_number: "",
        description: "",
        data_sheet_file: null,
        data_sheet_file_path: "",
    });

    const [inputOptions, setInputOptions] = useState({
        floors: [],
        rooms: [],
        functions: [],
        brands: [],
        model_numbers: [],
    });

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

        if (name == "function_id") {
            setInputData((prev) => {
                return {
                    ...prev,
                    model_number: "",
                };
            });
        } else if (name == "floor_id") {
            setInputData((prev) => {
                return {
                    ...prev,
                    room_id: "",
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
                    toastId: "AA_error-get-brand_S_400",
                });
            }
        } catch (e) {
            // console.log(e.message);
            toast.error("Error calling API to get brands data", {
                toastId: "AA_error-get-brand_API",
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
    //             process.env.REACT_APP_JDBC +
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
    //         console.log(e.message);
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
                    toastId: "AA_error-add-brand_S_400",
                });
            }
        } catch (e) {
            // console.log(e.message)
            toast.error("Error calling API to add brand", {
                toastId: "AA_error-add-brand_API",
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
                        { toastId: "AA_error-del-brand" }
                    );
                }

                setIsLoading(true);
                await getBrands();
                setIsLoading(false);
            } else {
                toast.error("Error deleting brand", {
                    toastId: "AA_error-del-brand_S_400",
                });
            }
        } catch (e) {
            // console.log(e.message);
            toast.error("Error calling API to delete brand", {
                toastId: "AA_error-del-brand_API",
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
                                    // value: row.machine_model,
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
                    toastId: "AA_error-get-model_S_400",
                });
            }
        } catch (e) {
            // console.log(e.message);
            toast.error("Error calling API to get model numbers data", {
                toastId: "AA_error-get-model_API",
            });
        }
    };
    useEffect(() => {
        (async () => {
            setIsLoadingModel(true);
            await getModels(inputData.function_id, inputData.brand.id);
            setIsLoadingModel(false);
        })();
    }, [inputData.function_id, inputData.brand]);

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
            // console.log(result.data.data[0].id);
            if (result.status === 200) {
                setIsLoadingModel(true);
                await getModels(inputData.function_id, inputData.brand.id);
                setIsLoadingModel(false);
                return result.data.data[0].id;
            } else {
                toast.error("Error adding model number", {
                    toastId: "AA_error-add-model_S_400",
                });
            }
        } catch (e) {
            // console.log(e.message)
            toast.error("Error calling API to add model number", {
                toastId: "AA_error-add-model_API",
            });
        }
        setIsLoadingModel(false);
    };

    // const getModel = async (brand_id, function_id, model_number) => {
    //     let config = {
    //         method: "post",
    //         url:
    //             process.env.REACT_APP_JDBC +
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
    //         console.log(e.message);
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
            // console.log(result);
            if (result.status === 200) {
                if (
                    typeof result.data == "string" &&
                    result.data.includes("violates foreign key constraint")
                ) {
                    toast.error(
                        "Failed to delete model number option due to existing asset with this model number.",
                        { toastId: "AA_error-del-model" }
                    );
                }

                setIsLoadingModel(true);
                await getModels(inputData.function_id, inputData.brand.id);
                setIsLoadingModel(false);
            } else {
                toast.error("Error deleting model number", {
                    toastId: "AA_error-del-model_S_400",
                });
            }
        } catch (e) {
            // console.log(e.message);
            toast.error("Error calling API to delete model number", {
                toastId: "AA_error-del-model_API",
            });
        }
        setIsLoadingModel(false);
    };

    const valAssetNum = async (asset_number) => {
        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_ASSET_VAL_EXIST_ASSET_NUMBER,
            headers: {
                authorization: getToken(),
            },
            data: {
                asset_number: asset_number,
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
                    toastId: "AA_error-val-asset-num_S_400",
                });
            }
        } catch (e) {
            // console.log(e.message);
            toast.error("Error validating existing asset number", {
                toastId: "AA_error-val-asset-num_API",
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
                        toastId: "AA_error-get-floor_S_400",
                    });
                }
            } catch (e) {
                toast.error("Error calling API to get floors data", {
                    toastId: "AA_error-get-floor_API",
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
                        toastId: "AA_error-get-room_S_400",
                    });
                }
            } catch (e) {
                toast.error("Error calling API to get rooms data", {
                    toastId: "AA_error-get-room_API",
                });
            }
        };
        (async () => {
            setIsLoadingRoom(true);
            await getRooms(inputData.floor_id);
            setIsLoadingRoom(false);
        })();
    }, [inputData.floor_id]);

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
                        toastId: "AA_error-get-function_S_400",
                    });
                }
            } catch (e) {
                toast.error("Error calling API to get functions data", {
                    toastId: "AA_error-get-function_API",
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
    //     formData.append("file", file_path);

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
    //         console.log(e.message);
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
    //             toast.error("Error deleting temp data sheet file");
    //         }
    //     } catch (e) {
    //         console.log(e.message);
    //         // toast.error("Error calling API to delete file");
    //     }
    // };

    const handleInputClear = async () => {
        // Delete temp Data Sheet
        // if (
        //     inputData.data_sheet_file_name &&
        //     inputData.data_sheet_file_name.length > 0
        // ) {
        //     const temp_data_sheet_file_path =
        //         "temp/data_sheet/" + inputData.data_sheet_file_name;
        //     await deleteFile(temp_data_sheet_file_path);
        // }

        setInputData((prev) => {
            return {
                ...prev,
                asset_image_file: null,
                asset_image_file_name: "",
                asset_number: "",
                asset_name: "",
                asset_short_name: "",
                function_id: "",
                floor_id: "",
                room_id: "",
                area: ["", ""],
                commissioned_date: "",
                // formatDate(new Date()),
                brand: "",
                model_number: "",
                description: "",
                data_sheet_file: null,
                data_sheet_file_name: "",
            };
        });
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

    const handleInputAdd = async (e) => {
        e.preventDefault();
        // Area Input Validation
        const areaArr = inputData.area;
        const valRegex = /^[A-Z]+[0-9]+$/;

        // Check for empty area input
        if (areaArr[0] && !valRegex.test(areaArr[0])) {
            toast.error("Invalid Input Area1.", {
                toastId: "AA_error-invalid-area1-input",
            });
            return;
        }
        if (areaArr[1] && !valRegex.test(areaArr[1])) {
            toast.error("Invalid Input Area2.", {
                toastId: "AA_error-invalid-area2-input",
            });
            return;
        }

        if (areaArr[1] && areaArr[1].length > areaArr[0].length) {
            toast.error("Please start input Area in the first field", {
                toastId: "AA_error-invalid-area-input",
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
                    { toastId: "AA_error-invalid-area12-input" }
                );
                return;
            }
            if (A2[0] >= A1[0] && A2[1] >= A1[1]) {
            } else {
                toast.error(
                    "Invalid input Area2 must be greater than input Area1.",
                    { toastId: "AA_error-invalid-area12-input" }
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
                inputData.function_id,
                inputData.model_number
            );
        }
        // Check Existing Asset Number
        let checkAssetNUmber = await valAssetNum(inputData.asset_number);
        if (checkAssetNUmber !== undefined) {
            toast.error("Asset number already exist", {
                toastId: "AA_error-asset-num-exist",
            });
            return;
        }

        // Queries Part 2: Add New Asset
        const formData_Q2 = new FormData();
        formData_Q2.append(
            "asset_image_file",
            inputData.asset_image_file == null ? "" : inputData.asset_image_file
        );
        formData_Q2.append(
            "asset_image_file_name",
            inputData.asset_image_file_name == ""
                ? ""
                : inputData.asset_image_file_name.replace(/\s/g, "")
        );
        formData_Q2.append("asset_number", inputData.asset_number);
        formData_Q2.append("asset_name", inputData.asset_name);
        formData_Q2.append("asset_short_name", inputData.asset_short_name);
        formData_Q2.append("function_id", inputData.function_id);
        formData_Q2.append("floor_id", inputData.floor_id);
        formData_Q2.append("room_id", inputData.room_id);
        formData_Q2.append("area_1", inputData.area[0]);
        formData_Q2.append(
            "area_2",
            inputData.area[1] == undefined ? "" : inputData.area[1]
        );
        formData_Q2.append(
            "commissioned_date",
            inputData.commissioned_date !== ""
                ? new Date(inputData.commissioned_date).toISOString()
                : ""
        );
        formData_Q2.append(
            "brand",
            inputData.brand === "" ? checkEmptyBrand : inputData.brand.id
        );
        formData_Q2.append(
            "model_number",
            inputData.model_number === ""
                ? checkModel
                : inputData.model_number.id
        );

        formData_Q2.append("description", inputData.description);

        // Add New Asset API
        const config_Q2 = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_ASSET_ADD_ASSET_Q2,
            headers: {
                authorization: getToken(),
            },
            data: formData_Q2,
            onUploadProgress: (data) =>
                setProgressBarUpload(
                    Math.round((data.loaded / data.total) * 100)
                ),
        };

        setIsLoading(true);
        let new_added_asset_id;
        try {
            const result = await axios(config_Q2);
            setProgressBarUpload(0);
            if (result.status === 200) {
                new_added_asset_id = result.data.data[0].id;
            } else {
                toast.error("Error adding new asset", {
                    toastId: "AA_error-add-asset_S_400",
                });
                setIsLoading(false);
                return;
            }
        } catch (e) {
            // console.log(e);
            setProgressBarUpload(0);
            toast.error("Error calling API to add asset", {
                toastId: "AA_error-add-asset_API",
            });
            setIsLoading(false);
            return;
        }
        setIsLoading(false);

        // Queries Part 3: Add Data Sheets
        if (inputData.data_sheet_file.length > 0) {
            const formData_Q3 = new FormData();
            inputData.data_sheet_file.forEach((data) => {
                formData_Q3.append(
                    "pathFile",
                    "data_sheet/" + new_added_asset_id + "_" + data.file_name
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
                        toastId: "AA_error-upload-datasheet_S_400",
                    });
                }
            } catch (e) {
                // console.log(e.message);
                setProgressBarUpload(0);
                toast.error("Error calling API to upload data sheets", {
                    toastId: "AA_error-upload-datasheet_API",
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
                        asset_id: new_added_asset_id,
                    },
                };

                setIsLoading(true);
                try {
                    const result = await axios(config_Q3_2);

                    if (result.status === 200) {
                        toast.success("New Asset Added");
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
                toast.success("New Asset Added");
            }
        } else {
            toast.success("New Asset Added");
        }

        handleInputClear();
        onSubmit();

        // // Create form data
        // const formData = new FormData();
        // formData.append(
        //     "asset_image_file",
        //     inputData.asset_image_file == null ? "" : inputData.asset_image_file
        // );
        // formData.append(
        //     "asset_image_file_name",
        //     inputData.asset_image_file_name == ""
        //         ? ""
        //         : inputData.asset_image_file_name.replace(/\s/g, "")
        // );
        // formData.append("asset_number", inputData.asset_number);
        // formData.append("asset_name", inputData.asset_name);
        // formData.append("function_id", inputData.function_id);
        // formData.append("floor_id", inputData.floor_id);
        // formData.append("room_id", inputData.room_id);
        // formData.append("area_1", inputData.area[0]);
        // formData.append("area_2", inputData.area[1]);
        // formData.append(
        //     "commissioned_date",
        //     new Date(inputData.commissioned_date).toISOString()
        // );
        // formData.append(
        //     "brand",
        //     inputData.brand === "" ? checkEmptyBrand : inputData.brand.id
        // );
        // formData.append(
        //     "model_number",
        //     inputData.model_number === ""
        //         ? checkModel
        //         : inputData.model_number.id
        // );

        // formData.append("description", inputData.description);
        // formData.append(
        //     "data_sheet_file",
        //     inputData.data_sheet_file == null ? "" : inputData.data_sheet_file
        // );
        // formData.append("data_sheet_file_name", inputData.data_sheet_file_name);

        // // Add New Asset API
        // const config = {
        //     method: "post",
        //     url:
        //         ReturnHostBackend(process.env.REACT_APP_SERVICES) +
        //         process.env.REACT_APP_ASSET_ADD_ASSETS,
        //     headers: {
        //         authorization: getToken(),
        //     },
        //     data: formData,
        //     onUploadProgress: (data) =>
        //         setProgressBarUpload(
        //             Math.round((data.loaded / data.total) * 100)
        //         ),
        // };

        // setIsLoading(true);
        // try {
        //     const result = await axios(config);
        //     setProgressBarUpload(0);
        //     if (
        //         typeof result.data == "string" &&
        //         result.data.includes("asset_number") &&
        //         result.data.includes("duplicate key")
        //     ) {
        //         toast.error("Asset Number already exists");
        //         setIsLoading(false);
        //         return;
        //     } else {
        //         toast.success("Asset added!");
        //     }
        // } catch (e) {
        //     console.log(e);
        //     setProgressBarUpload(0);
        //     toast.error("Error calling API to add asset");
        //     toast.error("Please Make sure do not input existing asset number");
        // }

        // // Queries Part 2 : Insert into Table "assets"
        // const config_Q2 = {
        //     method: "post",
        //     url:
        //         ReturnHostBackend(process.env.REACT_APP_JDBC) +
        //         process.env.REACT_APP_ASSET_ADD_ASSET_NODELINX,
        //     headers: {
        //         authorization: getToken(),
        //     },
        //     data: {
        //         model_number:
        //             inputData.model_number === ""
        //                 ? checkModel
        //                 : inputData.model_number.id,
        //         room_id: inputData.room_id,
        //         asset_name: inputData.asset_name,
        //         asset_number: inputData.asset_number,
        //         commissioned_date: new Date(
        //             inputData.commissioned_date
        //         ).toISOString(),
        //         description: inputData.description,
        //     },
        // };

        // setIsLoading(true);
        // let new_added_asset_id;
        // try {
        //     const result = await axios(config_Q2);
        //     if (result.status === 200) {
        //         new_added_asset_id = result.data.data[0].id;
        //     } else {
        //         toast.error("Error adding new asset");
        //         return;
        //     }
        // } catch (e) {
        //     toast.error("Error calling API to add asset");
        //     return;
        // }
        // setIsLoading(false);

        // if (new_added_asset_id == undefined) {
        //     toast.error("Error calling API to add asset");
        //     return;
        // }

        // // Queries Part 3 : Insert into Table "cells" and "asset"
        // const config_Q3_1 = {
        //     method: "post",
        //     url:
        //         ReturnHostBackend(process.env.REACT_APP_JDBC) +
        //         process.env.REACT_APP_ASSET_ADD_ASSET_CELLS_ATC,
        //     headers: {
        //         authorization: getToken(),
        //     },
        //     data: {
        //         room_id: inputData.room_id,
        //         asset_id: new_added_asset_id,
        //         area: inputData.area[0],
        //     },
        // };

        // const config_Q3_2 = {
        //     method: "post",
        //     url:
        //         ReturnHostBackend(process.env.REACT_APP_JDBC) +
        //         process.env.REACT_APP_ASSET_ADD_ASSET_CELLS_ATC,
        //     headers: {
        //         authorization: getToken(),
        //     },
        //     data: {
        //         room_id: inputData.room_id,
        //         asset_id: new_added_asset_id,
        //         area: inputData.area[1],
        //     },
        // };

        // setIsLoading(true);
        // try {
        //     await axios(config_Q3_1);
        //     if (inputData.area[1].length > 0) {
        //         await axios(config_Q3_2);
        //     }
        // } catch (e) {
        //     toast.error("Error calling API to add new asset area");
        //     return;
        // }
        // setIsLoading(false);
    };

    return (
        <ModalContainer
            formId={"add-asset"}
            width={"500px"}
            title={title}
            isShowing={isShowing}
            isLoading={isLoading}
            hide={() => {
                setInputData({
                    asset_image_file: null,
                    asset_image_file_name: "",
                    asset_image_clear: "",
                    asset_number: "",
                    asset_name: "",
                    function_id: "",
                    floor_id: "",
                    room_id: "",
                    area: ["", ""],
                    commissioned_date: "",
                    // formatDate(new Date()),
                    brand: "",
                    model_number: "",
                    description: "",
                    data_sheet_file: null,
                    data_sheet_file_name: "",
                });
                hide();
            }}
            showRequired={true}
            submitName={submitName}
            clearName={clearName}
            onClear={() => {
                handleInputClear();
            }}
            children={
                <form
                    id='add-asset'
                    onSubmit={handleInputAdd}
                    className='asset-add-pop-container'>
                    <LoadingUploadFile percentage={progressBarUpload} />
                    <div className='asset-add-pop-input-asset-number'>
                        <InputTextVertical
                            name='asset_number'
                            label='Asset Number'
                            value={inputData.asset_number}
                            onChange={handleInputChange}
                            isRequired={true}
                        />
                    </div>

                    <div className='asset-add-pop-input-function'>
                        <InputDropdownVertical
                            width='100%'
                            name='function_id'
                            label='Function'
                            value={inputData.function_id}
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
                            value={inputData.asset_name}
                            onChange={handleInputChange}
                            isRequired={true}
                        />
                    </div>
                    <div className='asset-add-pop-input-asset-short-name'>
                        <InputTextVertical
                            name='asset_short_name'
                            label='Asset Short Name'
                            value={inputData.asset_short_name}
                            onChange={handleInputChange}
                            isRequired={true}
                        />
                    </div>
                    <div className='asset-add-pop-input-commissioned-date'>
                        <InputDateVertical
                            width={"100%"}
                            name='commissioned_date'
                            label='Commissioned Date'
                            value={inputData.commissioned_date}
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
                           onChange={handleInputChange}
                               value={inputData.brand}
                          isRequired={true}
                        /> */}
                        <InputDropdownCreatableVertical
                            name='brand'
                            label='Brand'
                            value={inputData.brand}
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
                            value={inputData.model_number}
                            onChange={handleInputChange}
                            isRequired={true}
                        /> */}
                        <InputDropdownCreatableVertical
                            name='model_number'
                            label='Model Number'
                            value={inputData.model_number}
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
                                    inputData.function_id,
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
                            // inputWidth='100%'
                            width='100%'
                            isDisabled={
                                inputData.function_id === "" ||
                                inputData.brand === ""
                            }
                            // isRequired={true}
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
                            defaultImage={inputData.asset_image_file}
                            triggerClear={inputData.asset_image_file}
                        />
                    </div>
                    <div className='asset-add-pop-input-location'>
                        <div className='asset-add-pop-input-location-floor'>
                            <InputDropdownVertical
                                width='100%'
                                name='floor_id'
                                label='Floor'
                                value={inputData.floor_id}
                                options={inputOptions.floors}
                                onChange={handleInputChange}
                                isRequired={true}
                                isLoading={isLoadingFloor}
                            />
                        </div>
                        <div className='asset-add-pop-input-location-room'>
                            <InputDropdownVertical
                                width='100%'
                                name='room_id'
                                label='Room'
                                value={inputData.room_id}
                                options={inputOptions.rooms}
                                onChange={handleInputChange}
                                isDisabled={inputData.floor_id === ""}
                                isRequired={true}
                                isLoading={isLoadingRoom}
                            />
                        </div>
                        <div className='asset-add-pop-input-location-area'>
                            <InputTextPairVertical
                                width='120px'
                                label='Area'
                                nameFirst='area1'
                                valueFirst={inputData.area[0]}
                                onChangeFirst={handleInputChange}
                                nameSecond='area2'
                                valueSecond={inputData.area[1]}
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
                                            // data_sheet_file_name: file_name,
                                        };
                                    });
                                }}
                                isLoadingUpload={(isLoading) => {
                                    setIsLoading(isLoading);
                                }}
                                defaultFiles={[]}
                                triggerClear={inputData.data_sheet_file == null}
                                // isEdit={false}
                            />
                        </div>
                    </div>
                    <div className='asset-add-pop-input-description'>
                        <InputTextAreaVertical
                            name='description'
                            label='Description'
                            value={inputData.description}
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

export default AssetAddPop;
