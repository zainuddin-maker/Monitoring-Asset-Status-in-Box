import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
    InputTextVertical,
    InputDateVertical,
    UploadPhoto,
    ModalContainer,
    InputTextPairVertical,
    useModal,
    InputDropdownVertical,
    InputDropdownCreatableVertical,
    InputTextAutoSuggestHorizontal,
    LoadingUploadFile,
    LoadingData,
} from "../../../ComponentReuseable/index";
import DatasheetModal from "../../Datasheet/DatasheetModal";
import xMark from "../../../../svg/delete-file-icon.svg";
import "./AddRack.style.scss";

import AddAccessModal from "./AddAccessModal";
import { getToken } from "../../../TokenParse/TokenParse";
import UploadFile from "../../Asset/Component/AssetUploadFile";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";

const AddRackModal = (props) => {
    const {
        title,
        submitName,
        clearName,
        isShowing,
        hide,
        getRacks,
        powerSourceData,
        getDatasheet,
        isConnected,
    } = props;

    const [rack, setRack] = useState({
        rack_number: "",
        floor_name: "",
        room_name: "",
        first_area: "",
        second_area: "",
        brand_name: "",
        brand: "",
        model: "",
        model_number: "",
        number_of_u: "",
        client: "",
        access: [],
        access_id: [],
        access_name: [],
        commissioned_date: "",
        image: null,
        filename: "",
        file: null,
        datasheet: [],
        power_source_a: [
            {
                id: "",
                name: "",
            },
        ],
        powerA: {
            id: "",
            name: "",
        },
        power_source_b: [
            {
                id: "",
                name: "",
            },
        ],
        powerB: {
            id: "",
            name: "",
        },
        status: "",
    });

    const [isDisabled, setIsDisabled] = useState({
        room: true,
        model: true,
    });
    const [loadingButton, setLoadingButton] = useState(false);
    const [isLoading, setIsLoading] = useState({
        floor: false,
        room: false,
        model: false,
        brand: false,
        access_type: false,
        access_name: false,
        status: false,
        power: false,
    });
    const [optionsBrands, setOptionsBrands] = useState([]);
    const [optionsModels, setOptionsModels] = useState([]);
    const [optionsFloors, setOptionsFloors] = useState([]);
    const [optionsRooms, setOptionsRooms] = useState([]);
    const [optionsStatus, setOptionsStatus] = useState([]);
    const [optionsAccessName, setOptionsAccessName] = useState([]);
    const [optionsAccessType, setOptionsAccessType] = useState([]);
    const [progressBarUpload, setProgressBarUpload] = useState();
    const [datasheetPreview, setDatasheetPreview] = useState(null);

    const { isShowing: isShowingAddAccessModal, toggle: addAccessModal } =
        useModal();
    const { isShowing: isShowingDatasheetModal, toggle: datasheetModal } =
        useModal();
    const [optionsPowerSourceA, setOptionsPowerSourceA] = useState([]);
    const [optionsPowerSourceB, setOptionsPowerSourceB] = useState([]);

    const getAccessNames = async () => {
        setIsLoading((prev) => {
            prev.access_name = true;
            return { ...prev };
        });
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_GET_ACCESS_NAME,
            headers: {
                authorization: getToken(),
            },
        };
        try {
            const result = await axios(config);
            setOptionsAccessName(result.data.data);
            setIsLoading((prev) => {
                prev.access_name = false;
                return { ...prev };
            });
        } catch (e) {
            // console.error(e);
            if (e.message === "Network Error") {
                setIsLoading((prev) => {
                    prev.access_name = true;
                    return { ...prev };
                });
            } else {
                setIsLoading((prev) => {
                    prev.access_name = false;
                    return { ...prev };
                });
            }
            toast.error("Failed to get access name", {
                toastId: "failed-get-access-name",
            });
        }
    };

    const getAccessTypes = async () => {
        setIsLoading((prev) => {
            prev.access_type = true;
            return { ...prev };
        });
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_GET_ACCESS_TYPE,
            headers: {
                authorization: getToken(),
            },
        };
        try {
            const result = await axios(config);
            setOptionsAccessType(result.data.data);
            setIsLoading((prev) => {
                prev.access_type = false;
                return { ...prev };
            });
        } catch (e) {
            // console.error(e);
            if (e.message === "Network Error") {
                setIsLoading((prev) => {
                    prev.access_type = true;
                    return { ...prev };
                });
            } else {
                setIsLoading((prev) => {
                    prev.access_type = false;
                    return { ...prev };
                });
            }
            toast.error("Failed to get access type", {
                toastId: "failed-get-access-type",
            });
        }
    };

    const getBrands = async () => {
        setIsLoading((prev) => {
            prev.brand = true;
            return { ...prev };
        });
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_GET_BRANDS,
            headers: {
                authorization: getToken(),
            },
            data: {
                type: "rack",
            },
        };
        try {
            const result = await axios(config);
            const data = result.data.data;
            let brands = [];
            if (data.length !== 0) {
                data.map((a) => {
                    brands.push({
                        value: a.brand_id,
                        label: a.brand_name,
                    });
                });
                setOptionsBrands(brands);
            } else {
                setOptionsBrands([]);
            }
            setIsLoading((prev) => {
                prev.brand = false;
                return { ...prev };
            });
        } catch (e) {
            // console.error(e);
            if (e.message === "Network Error") {
                setIsLoading((prev) => {
                    prev.brand = true;
                    return { ...prev };
                });
            } else {
                setIsLoading((prev) => {
                    prev.brand = false;
                    return { ...prev };
                });
            }
            toast.error("Failed to get brands", {
                toastId: "failed-get-brands",
            });
        }
    };

    const getModels = async (brand) => {
        setIsDisabled((prev) => {
            return {
                ...prev,
                model: true,
            };
        });
        setIsLoading((prev) => {
            prev.model = true;
            return { ...prev };
        });
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_GET_MODELS,
            headers: {
                authorization: getToken(),
            },
            data: {
                type: "rack",
                brand_id: brand,
            },
        };
        try {
            const result = await axios(config);
            const data = result.data.data;
            let models = [];
            if (data.length !== 0) {
                data.map((a) => {
                    models.push({
                        value: a.model_id,
                        label: a.model_name,
                    });
                });
                setOptionsModels(models);
            } else {
                setOptionsModels([]);
            }
            if (data.length === 1) {
                setRack((prev) => {
                    prev.model = {
                        value: data[0].model_id,
                        label: data[0].model_name,
                    };
                    return { ...prev };
                });
            }
            setIsDisabled((prev) => {
                return {
                    ...prev,
                    model: false,
                };
            });
            setIsLoading((prev) => {
                prev.model = false;
                return { ...prev };
            });
        } catch (e) {
            // console.error(e);
            if (e.message === "Network Error") {
                setIsDisabled((prev) => {
                    return {
                        ...prev,
                        model: true,
                    };
                });
                setIsLoading((prev) => {
                    prev.model = true;
                    return { ...prev };
                });
            } else {
                setIsDisabled((prev) => {
                    return {
                        ...prev,
                        model: false,
                    };
                });
                setIsLoading((prev) => {
                    prev.model = false;
                    return { ...prev };
                });
            }
            toast.error("Failed to get model number", {
                toastId: "failed-get-models",
            });
        }
    };

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
            const data = result.data.data;
            if (data.length !== 0) {
                setOptionsFloors(data);
            } else {
                setOptionsFloors([]);
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
            toast.error("Failed to get floors", {
                toastId: "failed-get-floors",
            });
        }
    };

    const getRooms = async (floor) => {
        setIsDisabled((prev) => {
            return {
                ...prev,
                room: true,
            };
        });
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
            const data = result.data.data;
            if (data.length !== 0) {
                setOptionsRooms(data);
            } else {
                setOptionsRooms([]);
            }
            setIsDisabled((prev) => {
                return {
                    ...prev,
                    room: false,
                };
            });
            setIsLoading((prev) => {
                prev.room = false;
                return { ...prev };
            });
        } catch (e) {
            // console.error(e);
            if (e.message === "Network Error") {
                setIsDisabled((prev) => {
                    return {
                        ...prev,
                        room: true,
                    };
                });
                setIsLoading((prev) => {
                    prev.room = true;
                    return { ...prev };
                });
            } else {
                setIsDisabled((prev) => {
                    return {
                        ...prev,
                        room: false,
                    };
                });
                setIsLoading((prev) => {
                    prev.room = false;
                    return { ...prev };
                });
            }
            toast.error("Failed to get rooms", {
                toastId: "failed-get-rooms",
            });
        }
    };

    const getPowerSource = async () => {
        setIsLoading((prev) => {
            prev.power = true;
            return { ...prev };
        });
        let configA = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_GET_POWER_SOURCE,
            headers: {
                authorization: getToken(),
            },
            data: {
                type: "A",
            },
        };
        let configB = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_GET_POWER_SOURCE,
            headers: {
                authorization: getToken(),
            },
            data: {
                type: "B",
            },
        };
        try {
            const resultA = await axios(configA);
            const resultB = await axios(configB);
            const dataA = resultA.data.data;
            const dataB = resultB.data.data;

            if (dataA.length !== 0) {
                setOptionsPowerSourceA(dataA);
            } else {
                setOptionsPowerSourceA([]);
                toast.error("Power Source A is empty", {
                    toastId: "powerA-empty",
                });
            }

            if (dataB.length !== 0) {
                setOptionsPowerSourceB(dataB);
            } else {
                setOptionsPowerSourceB([]);
                toast.error("Power Source B is empty", {
                    toastId: "powerB-empty",
                });
            }
            setIsLoading((prev) => {
                prev.power = false;
                return { ...prev };
            });
        } catch (e) {
            // console.error(e);
            if (e.message === "Network Error") {
                setIsLoading((prev) => {
                    prev.power = true;
                    return { ...prev };
                });
            } else {
                setIsLoading((prev) => {
                    prev.power = false;
                    return { ...prev };
                });
            }
            toast.error("Failed to get power source", {
                toastId: "failed-get-power",
            });
        }
    };

    const getStatus = async () => {
        // setOptionsStatus(["Installed", "Planned"]);
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
            if (result.data.count > 0) {
                result.data.data.map((r) => {
                    status.push(r.status);
                });
                setOptionsStatus(status);
            } else {
                setOptionsStatus([]);
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

    const addRack = async (e) => {
        e.preventDefault();
        setLoadingButton(true);
        if (rack.brand === "") {
            setLoadingButton(false);
            toast.error(`Please fill out the brand field.`, {
                toastId: "empty-value-brand",
            });
            return;
        }
        // if (rack.model === "") {
        //     setLoadingButton(false);
        //     toast.error(`Please fill out the model number field.`, {
        //         toast: "empty-value-model",
        //     });
        //     return;
        // }

        const valRegex = /^[A-Z]+[0-9]+$/;
        // Check for empty area input
        if (rack.first_area && !valRegex.test(rack.first_area)) {
            toast.error("Invalid input Area1.", {
                toastId: "invalid-input-area1",
            });
            setLoadingButton(false);
            return;
        }

        if (rack.second_area && !valRegex.test(rack.second_area)) {
            toast.error("Invalid input Area2.", {
                toastId: "invalid-input-area2",
            });
            setLoadingButton(false);
            return;
        }

        // Area Input Validation
        const A1 = lettersNumberTonumber(rack.first_area);
        const A2 = rack.second_area
            ? lettersNumberTonumber(rack.second_area)
            : null;

        // Input Area1 and Area2 comparison
        if (A1 && A2) {
            if (A2[0] === A1[0] && A2[1] === A1[1]) {
                toast.error(
                    "Invalid input Area2 must be greater than input Area1.",
                    {
                        toastId: "area2-greater-area1",
                    }
                );
                setLoadingButton(false);
                return;
            }
            if (A2[0] >= A1[0] && A2[1] >= A1[1]) {
            } else {
                toast.error(
                    "Invalid input Area2 must be greater than input Area1.",
                    {
                        toastId: "area2-greater-area1",
                    }
                );
                setLoadingButton(false);
                return;
            }
        }
        let powerA = rack.power_source_a;
        powerA = powerA
            .map((power) => power.id)
            .filter((power) => power !== "");
        let powerB = rack.power_source_b;
        powerB = powerB
            .map((power) => power.id)
            .filter((power) => power !== "");

        let imagePath =
            "/filerepository/dcim/uploadFileFromAPI/rack_files/images/";
        let datasheet_path = [];
        rack.datasheet.map((ds, i) =>
            datasheet_path.push(
                ds.name.split(".")[0].replace(/\s/g, "") +
                    "." +
                    ds.name.split(".")[1]
            )
        );

        const formData = new FormData();
        // const datasheetUpload = new FormData();

        formData.append("datasheet", JSON.stringify(datasheet_path));
        formData.append("brand_id", rack.brand.value);
        formData.append("model_id", rack.model !== "" ? rack.model.value : "");
        formData.append("rack_number", rack.rack_number);
        formData.append("room_name", rack.room_name);
        formData.append(
            "area_name",
            rack.second_area
                ? rack.first_area + "," + rack.second_area
                : rack.first_area
        );
        formData.append("rack_commissioned_date", rack.commissioned_date);
        formData.append(
            "image_location",
            rack.image
                ? imagePath +
                      rack.rack_number.replace(/\s/g, "") +
                      "_" +
                      rack.image.name.replace(/\s/g, "")
                : ""
        );
        formData.append("number_of_u", rack.number_of_u);
        formData.append("power_source_a", JSON.stringify(powerA));
        formData.append("power_source_b", JSON.stringify(powerB));
        formData.append("floor_name", rack.floor_name);
        formData.append("rack_access", JSON.stringify(rack.access));
        formData.append("status", rack.status);
        formData.append("type", "rack");

        let config1 = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_RACK_ADD_RACK,
            headers: {
                authorization: getToken(),
            },
            data: formData,
            onUploadProgress: (data) =>
                setProgressBarUpload(
                    Math.round((data.loaded / data.total) * 100)
                ),
        };
        try {
            const result1 = await axios(config1);
            setProgressBarUpload(0);
            if (result1.data.status.startsWith("Success")) {
                if (rack.datasheet.length !== 0 || rack.image) {
                    await uploadFile(result1.data.id);
                }
                toast.success(result1.data.status, {
                    toastId: "success-add-rack",
                });
                hide();
                await getRacks();
                await getDatasheet();
            } else {
                toast.error(result1.data.status, {
                    toastId: "error-add-rack",
                });
            }

            setLoadingButton(false);
        } catch (e) {
            // console.error(e);
            toast.error("Failed to add rack", {
                toastId: "failed-add-rack",
            });
            setLoadingButton(false);
            setProgressBarUpload(0);
        }
    };

    const uploadFile = async (id) => {
        let datasheetPath = "rack_files/datasheets/";
        let imagePath = "rack_files/images/";

        let file = [];
        let pathFile = [];
        if (rack.datasheet.length !== 0) {
            rack.datasheet.map((ds) =>
                pathFile.push(
                    datasheetPath +
                        id +
                        "_" +
                        ds.name.split(".")[0].replace(/\s/g, "") +
                        "." +
                        ds.name.split(".")[1]
                )
            );
            rack.datasheet.map((ds) => file.push(ds));
        }

        if (rack.image) {
            file.push(rack.image);

            pathFile.push(
                imagePath +
                    rack.rack_number.replace(/\s/g, "") +
                    "_" +
                    rack.image.name.replace(/\s/g, "")
            );
        }

        const datasheetUpload = new FormData();
        file.forEach((data, i) => {
            datasheetUpload.append("file", data);
        });
        pathFile.forEach((data, i) => {
            datasheetUpload.append("pathFile", data);
        });
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_BACKEND_NODELINX) +
                process.env.REACT_APP_IMAGE_UPLOAD,
            headers: {
                authorization: getToken(),
            },
            data: datasheetUpload,
            onUploadProgress: (data) =>
                setProgressBarUpload(
                    Math.round((data.loaded / data.total) * 100)
                ),
        };
        try {
            await axios(config);
        } catch (e) {
            // console.error(e);
            toast.error("Failed to upload datasheet", {
                toastId: "failed-add-datasheet",
            });
        }
    };

    const addBrand = async (brand_name) => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_ADD_BRAND,
            headers: {
                authorization: getToken(),
            },
            data: { brand_name: brand_name, type: "rack" },
        };
        try {
            const result = await axios(config);
            toast.success("Success to add brand", {
                toastId: "success-add-brand",
            });
            getBrands();
            setRack((prev) => {
                return {
                    ...prev,
                    brand: {
                        value: result.data.data[0].brand_id,
                        label: result.data.data[0].brand_name,
                    },
                    model: "",
                };
            });
            getModels(result.data.data[0].brand_id);
        } catch (e) {
            // console.error(e);
            toast.error("Failed to add brand", {
                toastId: "failed-add-brand",
            });
        }
    };

    const delBrand = async (brand_id) => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_DELETE_BRAND,
            headers: {
                authorization: getToken(),
            },
            data: { brand_id: brand_id },
        };
        try {
            const result = await axios(config);
            toast.success("Success to delete brand", {
                toastId: "success-delete-brand",
            });
            getBrands();
            setRack((prev) => {
                return {
                    ...prev,
                    brand: "",
                    model: "",
                };
            });
        } catch (e) {
            // console.error(e);
            toast.error("Failed to delete brand", {
                toastId: "failed-delete-brand",
            });
        }
    };

    const addModel = async (model_name, brand_id) => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_ADD_MODEL,
            headers: {
                authorization: getToken(),
            },
            data: { model_name: model_name, type: "rack", brand_id: brand_id },
        };
        try {
            const result = await axios(config);
            toast.success("Success to add model number", {
                toastId: "success-add-model",
            });
            getModels(brand_id);
            setRack((prev) => {
                return {
                    ...prev,
                    model: {
                        value: result.data.data[0].model_id,
                        label: result.data.data[0].model_name,
                    },
                };
            });
        } catch (e) {
            // console.error(e);
            toast.error("Failed to add model number", {
                toastId: "error-add-model",
            });
        }
    };

    const delModel = async (model_id) => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_DELETE_MODEL,
            headers: {
                authorization: getToken(),
            },
            data: { model_id: model_id },
        };
        try {
            const result = await axios(config);
            toast.success("Success to delete model number", {
                toastId: "success-delete-model",
            });
            getModels(rack.brand.value);
            setRack((prev) => {
                return {
                    ...prev,
                    model: "",
                };
            });
        } catch (e) {
            // console.error(e);
            toast.error("Failed to delete model number", {
                toastId: "error-delete-model",
            });
        }
    };

    const handleClear = () => {
        setRack((prev) => {
            prev.rack_number = "";
            prev.floor_name = "";
            prev.room_name = "";
            prev.first_area = "";
            prev.second_area = "";
            prev.brand = "";
            prev.model = "";
            prev.number_of_u = "";
            prev.access = [];
            prev.commissioned_date = "";
            prev.image = null;
            prev.file = null;
            prev.filename = "";
            prev.power_source_a = [
                {
                    id: "",
                    name: "",
                },
            ];
            prev.power_source_b = [
                {
                    id: "",
                    name: "",
                },
            ];
            prev.imagePreview = null;
            prev.status = "";
            prev.datasheet = [];
            return { ...prev };
        });
    };

    const handleChange = (e) => {
        let { name, value } = e.target;
        const checkNumber = /^\d+$/;

        if (name === "number_of_u") {
            if (!checkNumber.test(value)) {
                toast.warning("Invalid input Number of U field.", {
                    toastId: "invalid-inpur-numberOfU",
                });
                value = "";
            }
            // if (parseInt(value) <= 0) {
            //     toast.warning("Value must be more than 0");
            //     value = "";
            // }
        }
        if (name === "floor_name") {
            getRooms(value);
            setRack((prev) => ({ ...prev, room_name: "" }));
        }
        setRack((prev) => {
            prev[name] =
                name === "first_area" ||
                name === "second_area" ||
                name === "rack_number"
                    ? value.toUpperCase()
                    : value;
            return { ...prev };
        });
    };

    const handleChangePhoto = (file) => {
        setRack((prev) => {
            prev.image = file;
            prev.imagePreview = URL.createObjectURL(file);
            return { ...prev };
        });
    };

    const handleChangeFile = (e) => {
        const { files } = e.target;
        const file = files[0];
        let datasheets = rack.datasheet;
        if (file !== undefined) {
            datasheets.push(file);
        }

        setRack((prev) => {
            prev.datasheet = datasheets;
            return { ...prev };
        });
    };

    const removeFile = (i) => {
        const data = rack.datasheet;
        data.splice(i, 1);

        setRack((prev) => {
            prev.datasheet = data;
            return { ...prev };
        });
    };

    const deleteAccess = (i) => {
        const data = rack.access;

        data.splice(i, 1);

        data.sort((a, b) => {
            if (a.rack_access_type_id < b.rack_access_type_id) return -1;
            if (a.rack_access_type_id > b.rack_access_type_id) return 1;
            return 0;
        });

        const uniqueType = [
            ...new Set(data.map((item) => item.rack_access_type_id)),
        ];

        const newIndexObjectType = {};
        uniqueType.forEach((data) => (newIndexObjectType[data] = 1));

        const newData = data.map((dat) => ({
            ...dat,
            index: newIndexObjectType[dat.rack_access_type_id]++,
        }));

        setRack((prev) => ({
            ...prev,
            access: newData,
        }));
    };

    const delPowerA = (i) => {
        let data = rack.power_source_a;

        data.splice(i, 1);
        data = data
            .filter((power) => power.id !== "")
            .concat([
                {
                    id: "",
                    name: "",
                },
            ]);

        setRack((prev) => ({
            ...prev,
            power_source_a: data,
        }));
    };

    const delPowerB = (i) => {
        let data = rack.power_source_b;

        data.splice(i, 1);
        data = data
            .filter((power) => power.id !== "")
            .concat([
                {
                    id: "",
                    name: "",
                },
            ]);

        setRack((prev) => ({
            ...prev,
            power_source_b: data,
        }));
    };

    useEffect(async () => {
        setIsLoading((prev) => {
            prev.status = true;
            return { ...prev };
        });
        await getStatus();
        await setIsLoading((prev) => {
            prev.status = false;
            return { ...prev };
        });
    }, []);

    useEffect(() => {
        getPowerSource();
        getBrands();
        getFloors();
    }, []);

    useEffect(() => {
        if (!isShowing) {
            handleClear();
        }
    }, [isShowing]);

    // Add Access
    useEffect(() => {
        getAccessNames();
        getAccessTypes();
    }, []);

    return (
        <ModalContainer
            width={"665px" || "auto"}
            title={title}
            isShowing={isShowing}
            hide={hide}
            submitName={submitName}
            onSubmit={addRack}
            formId={"addRack"}
            clearName={clearName}
            onClear={handleClear}
            isLoading={loadingButton}
            showRequired={true}
            children={
                <div className='Add-rack-modal'>
                    <LoadingUploadFile percentage={progressBarUpload} />
                    <form
                        id='addRack'
                        className='add-rack-form'
                        onSubmit={addRack}>
                        <div className='top-side'>
                            <div className='left-side'>
                                <InputTextVertical
                                    label='Rack Number'
                                    name='rack_number'
                                    value={rack.rack_number}
                                    onChange={handleChange}
                                    validateInput={true}
                                    isRequired={true}
                                />
                                <div className='flex-row'>
                                    <InputDropdownVertical
                                        label='Floor'
                                        name='floor_name'
                                        value={rack.floor_name}
                                        options={optionsFloors}
                                        onChange={handleChange}
                                        isRequired={true}
                                        isLoading={isLoading.floor}
                                    />
                                    <InputDropdownVertical
                                        label='Room'
                                        name='room_name'
                                        value={rack.room_name}
                                        onChange={handleChange}
                                        options={optionsRooms}
                                        isDisabled={
                                            rack.floor_name === "" ||
                                            isDisabled.room
                                        }
                                        isLoading={isLoading.room}
                                        isRequired={true}
                                    />
                                    <InputTextPairVertical
                                        width='150px'
                                        label='Area'
                                        nameFirst='first_area'
                                        nameSecond='second_area'
                                        valueFirst={rack.first_area}
                                        valueSecond={rack.second_area}
                                        onChangeFirst={handleChange}
                                        onChangeSecond={handleChange}
                                        isRequired={true}
                                    />
                                </div>
                                <InputDropdownCreatableVertical
                                    label='Brand'
                                    name='brand'
                                    value={rack.brand}
                                    isLoading={isLoading.brand}
                                    options={optionsBrands}
                                    onChange={handleChange}
                                    onSelect={(e) => {
                                        setRack((prev) => {
                                            return {
                                                ...prev,
                                                brand: e,
                                                model: "",
                                            };
                                        });
                                        getModels(e.value);
                                    }}
                                    onCreateOption={(e) => {
                                        let regex = /^\s*$/;
                                        if (!regex.test(e)) {
                                            addBrand(e);
                                        } else {
                                            toast.error("Invalid value!", {
                                                toastId:
                                                    "invalid-input-add-brand",
                                            });
                                            return;
                                        }
                                    }}
                                    onDeleteOption={(e) => {
                                        delBrand(e.value);
                                    }}
                                    isRequired={true}
                                />
                                <InputDropdownCreatableVertical
                                    label='Model Number'
                                    name='model'
                                    value={rack.model}
                                    options={optionsModels}
                                    onChange={handleChange}
                                    isLoading={
                                        isLoading.model || isLoading.brand
                                    }
                                    isDisabled={
                                        isDisabled.model || rack.brand === ""
                                    }
                                    onSelect={(e) => {
                                        setRack((prev) => {
                                            return {
                                                ...prev,
                                                model: e,
                                            };
                                        });
                                    }}
                                    onCreateOption={(e) => {
                                        let regex = /^\s*$/;
                                        if (!regex.test(e)) {
                                            addModel(e, rack.brand.value);
                                        } else {
                                            toast.error("Invalid value!", {
                                                toastId:
                                                    "invalid-input-add-model",
                                            });
                                            return;
                                        }
                                    }}
                                    onDeleteOption={(e) => {
                                        delModel(e.value);
                                    }}
                                />
                                <InputTextVertical
                                    label='Number of U(s)'
                                    name='number_of_u'
                                    value={rack.number_of_u}
                                    onChange={handleChange}
                                    isRequired={true}
                                />
                                <InputDropdownVertical
                                    label='Status'
                                    name='status'
                                    value={rack.status}
                                    options={optionsStatus}
                                    onChange={handleChange}
                                    isRequired={true}
                                    isLoading={isLoading.status}
                                />
                                <InputDateVertical
                                    label='Commissioned Date'
                                    name='commissioned_date'
                                    value={rack.commissioned_date}
                                    onChange={handleChange}
                                    clearData={() => {
                                        setRack((prev) => {
                                            return {
                                                ...prev,
                                                commissioned_date: "",
                                            };
                                        });
                                    }}
                                />
                            </div>
                            <div className='right-side'>
                                <div className='flex-column'>
                                    <span>Rack Image</span>
                                    <UploadPhoto
                                        height='260px'
                                        width='363px'
                                        defaultImage={rack.image}
                                        onUpload={(photoFile) => {
                                            handleChangePhoto(photoFile);
                                        }}
                                        triggerClear={rack.image}
                                    />
                                </div>
                                <div className='datasheet'>
                                    <span>Data Sheet</span>
                                    <div className='upload-file'>
                                        <input
                                            className='reusable-upload-photo__file-input-form'
                                            type='file'
                                            id='uploadedFile'
                                            accept='application/pdf'
                                            onChange={handleChangeFile}
                                        />
                                        <label
                                            className='reusable-upload-photo__label reusable-button reusable-button--upload-photo'
                                            htmlFor='uploadedFile'>
                                            Upload File
                                        </label>
                                    </div>
                                    <div className='upload-datasheet'>
                                        {rack.datasheet.map((ds, i) => (
                                            <div className='file'>
                                                <span
                                                    className='file'
                                                    onClick={() => {
                                                        setDatasheetPreview([
                                                            ds,
                                                        ]);
                                                        datasheetModal();
                                                    }}>
                                                    {ds.name}
                                                </span>
                                                <img
                                                    className='xMark'
                                                    src={xMark}
                                                    style={{
                                                        background: "none",
                                                    }}
                                                    onClick={() =>
                                                        removeFile(i)
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='bottom-side'>
                            <div className='left-side'>
                                <div className='flex-column'>
                                    <span>Access</span>
                                    <div className='access'>
                                        {rack.access.length > 0 &&
                                            rack.access.map((x, i) => {
                                                return (
                                                    <div
                                                        className='flex-row'
                                                        key={i}>
                                                        <div className='access-input'>
                                                            <span>{`Access ${
                                                                optionsAccessType.find(
                                                                    (data) =>
                                                                        parseInt(
                                                                            data.value
                                                                        ) ===
                                                                        parseInt(
                                                                            x.rack_access_type_id
                                                                        )
                                                                ).label
                                                            } ${
                                                                x.index
                                                            }`}</span>
                                                            <input
                                                                type='text'
                                                                name='access'
                                                                value={
                                                                    optionsAccessName.find(
                                                                        (
                                                                            data
                                                                        ) =>
                                                                            parseInt(
                                                                                data.value
                                                                            ) ===
                                                                            parseInt(
                                                                                x.rack_access_name_id
                                                                            )
                                                                    ).label
                                                                }
                                                                disabled
                                                            />
                                                        </div>
                                                        <img
                                                            className='xMark'
                                                            src={xMark}
                                                            style={{
                                                                background:
                                                                    "none",
                                                            }}
                                                            onClick={() =>
                                                                deleteAccess(i)
                                                            }
                                                        />
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                                <span
                                    className='add-access'
                                    onClick={() => addAccessModal()}>
                                    + Add Access
                                </span>
                            </div>
                            <div className='right-side'>
                                <div className='flex-column'>
                                    <span>Power Source</span>
                                    <div className='power'>
                                        {rack.power_source_a.map((power, i) => {
                                            if (power.name !== "") {
                                                return (
                                                    <div className='flex-row'>
                                                        <div className='powerSource'>
                                                            <InputTextAutoSuggestHorizontal
                                                                labelWidth='150px'
                                                                inputWidth='100%'
                                                                label={`Power Source A${
                                                                    i + 1
                                                                }`}
                                                                name='powerA'
                                                                value={
                                                                    power.name
                                                                }
                                                                isDisabled={
                                                                    true
                                                                }
                                                                options={[]}
                                                            />
                                                        </div>
                                                        <img
                                                            className='xMark'
                                                            src={xMark}
                                                            style={{
                                                                background:
                                                                    "none",
                                                            }}
                                                            onClick={() =>
                                                                delPowerA(i)
                                                            }
                                                        />
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <div className='powerSource'>
                                                        <InputTextAutoSuggestHorizontal
                                                            labelWidth='130px'
                                                            label='Power Source A'
                                                            name='powerA'
                                                            isLoading={
                                                                isLoading.power
                                                            }
                                                            value={
                                                                rack.powerA.name
                                                            }
                                                            options={optionsPowerSourceA.map(
                                                                (data) =>
                                                                    data.name
                                                            )}
                                                            onChange={(e) => {
                                                                let { value } =
                                                                    e.target;
                                                                setRack(
                                                                    (prev) => {
                                                                        return {
                                                                            ...prev,
                                                                            powerA: {
                                                                                name: value,
                                                                            },
                                                                        };
                                                                    }
                                                                );
                                                            }}
                                                            isRequired={
                                                                power.id ===
                                                                    "" &&
                                                                rack
                                                                    .power_source_a
                                                                    .length ===
                                                                    1
                                                                    ? true
                                                                    : false
                                                            }
                                                            validateInput={(
                                                                e
                                                            ) => {
                                                                let { value } =
                                                                    e.target;

                                                                let power =
                                                                    optionsPowerSourceA.find(
                                                                        (p) =>
                                                                            p.name ===
                                                                            value
                                                                    );

                                                                let duplicateCheck =
                                                                    rack.power_source_a.find(
                                                                        (p) =>
                                                                            p.name ===
                                                                            value
                                                                    );
                                                                let powerA = [];
                                                                if (
                                                                    rack
                                                                        .power_source_a
                                                                        .length ===
                                                                    1
                                                                ) {
                                                                    powerA = [];
                                                                } else {
                                                                    powerA =
                                                                        rack.power_source_a;
                                                                    powerA =
                                                                        powerA.filter(
                                                                            (
                                                                                power
                                                                            ) =>
                                                                                power.id !==
                                                                                ""
                                                                        );
                                                                }
                                                                if (
                                                                    value !== ""
                                                                ) {
                                                                    if (
                                                                        power &&
                                                                        power !==
                                                                            undefined &&
                                                                        duplicateCheck ===
                                                                            undefined
                                                                    ) {
                                                                        powerA.push(
                                                                            power
                                                                        );
                                                                        if (
                                                                            powerA.length !==
                                                                            optionsPowerSourceA.length
                                                                        ) {
                                                                            powerA =
                                                                                powerA.concat(
                                                                                    [
                                                                                        {
                                                                                            id: "",
                                                                                            name: "",
                                                                                        },
                                                                                    ]
                                                                                );
                                                                        }
                                                                        setRack(
                                                                            (
                                                                                prev
                                                                            ) => {
                                                                                return {
                                                                                    ...prev,
                                                                                    power_source_a:
                                                                                        powerA,
                                                                                    powerA: {
                                                                                        id: "",
                                                                                        name: "",
                                                                                    },
                                                                                };
                                                                            }
                                                                        );
                                                                    } else {
                                                                        setRack(
                                                                            (
                                                                                prev
                                                                            ) => {
                                                                                return {
                                                                                    ...prev,
                                                                                    powerA: {
                                                                                        id: "",
                                                                                        name: "",
                                                                                    },
                                                                                };
                                                                            }
                                                                        );
                                                                        toast.error(
                                                                            duplicateCheck ===
                                                                                undefined
                                                                                ? "Invalid input Power Source A"
                                                                                : "Invalid input! Power Source A can't be double",
                                                                            {
                                                                                toastId:
                                                                                    "invalid-input-powerA",
                                                                            }
                                                                        );
                                                                        return;
                                                                    }
                                                                } else {
                                                                    setRack(
                                                                        (
                                                                            prev
                                                                        ) => {
                                                                            return {
                                                                                ...prev,
                                                                                powerA: {
                                                                                    id: "",
                                                                                    name: "",
                                                                                },
                                                                            };
                                                                        }
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                </div>
                                <div className='power'>
                                    {rack.power_source_b.map((power, i) => {
                                        if (power.name !== "") {
                                            return (
                                                <div className='flex-row'>
                                                    <div className='powerSource'>
                                                        <InputTextAutoSuggestHorizontal
                                                            labelWidth='150px'
                                                            inputWidth='100%'
                                                            label={`Power Source B${
                                                                i + 1
                                                            }`}
                                                            name='powerB'
                                                            value={power.name}
                                                            isDisabled={true}
                                                            options={[]}
                                                        />
                                                    </div>
                                                    <img
                                                        className='xMark'
                                                        src={xMark}
                                                        style={{
                                                            background: "none",
                                                        }}
                                                        onClick={() =>
                                                            delPowerB(i)
                                                        }
                                                    />
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className='powerSource'>
                                                    <InputTextAutoSuggestHorizontal
                                                        labelWidth='130px'
                                                        label='Power Source B'
                                                        name='powerB'
                                                        isLoading={
                                                            isLoading.power
                                                        }
                                                        value={rack.powerB.name}
                                                        options={optionsPowerSourceB.map(
                                                            (data) => data.name
                                                        )}
                                                        onChange={(e) => {
                                                            let { value } =
                                                                e.target;
                                                            setRack((prev) => {
                                                                return {
                                                                    ...prev,
                                                                    powerB: {
                                                                        name: value,
                                                                    },
                                                                };
                                                            });
                                                        }}
                                                        isRequired={
                                                            power.id === "" &&
                                                            rack.power_source_b
                                                                .length === 1
                                                                ? true
                                                                : false
                                                        }
                                                        validateInput={(e) => {
                                                            let { value } =
                                                                e.target;

                                                            let power =
                                                                optionsPowerSourceB.find(
                                                                    (p) =>
                                                                        p.name ===
                                                                        value
                                                                );
                                                            let duplicateCheck =
                                                                rack.power_source_b.find(
                                                                    (p) =>
                                                                        p.name ===
                                                                        value
                                                                );
                                                            let powerB = [];
                                                            if (
                                                                rack
                                                                    .power_source_b
                                                                    .length ===
                                                                1
                                                            ) {
                                                                powerB = [];
                                                            } else {
                                                                powerB =
                                                                    rack.power_source_b;
                                                                powerB =
                                                                    powerB.filter(
                                                                        (
                                                                            power
                                                                        ) =>
                                                                            power.id !==
                                                                            ""
                                                                    );
                                                            }
                                                            if (value !== "") {
                                                                if (
                                                                    power &&
                                                                    power !==
                                                                        undefined &&
                                                                    duplicateCheck ===
                                                                        undefined
                                                                ) {
                                                                    powerB.push(
                                                                        power
                                                                    );
                                                                    if (
                                                                        powerB.length !==
                                                                        optionsPowerSourceB.length
                                                                    ) {
                                                                        powerB =
                                                                            powerB.concat(
                                                                                [
                                                                                    {
                                                                                        id: "",
                                                                                        name: "",
                                                                                    },
                                                                                ]
                                                                            );
                                                                    }
                                                                    setRack(
                                                                        (
                                                                            prev
                                                                        ) => {
                                                                            return {
                                                                                ...prev,
                                                                                power_source_b:
                                                                                    powerB,
                                                                                powerB: {
                                                                                    id: "",
                                                                                    name: "",
                                                                                },
                                                                            };
                                                                        }
                                                                    );
                                                                } else {
                                                                    setRack(
                                                                        (
                                                                            prev
                                                                        ) => {
                                                                            return {
                                                                                ...prev,
                                                                                powerB: {
                                                                                    id: "",
                                                                                    name: "",
                                                                                },
                                                                            };
                                                                        }
                                                                    );
                                                                    toast.error(
                                                                        duplicateCheck ===
                                                                            undefined
                                                                            ? "Invalid input Power Source B"
                                                                            : "Invalid input! Power Source B can't be double",
                                                                        {
                                                                            toastId:
                                                                                "invalid-input-powerB",
                                                                        }
                                                                    );
                                                                    return;
                                                                }
                                                            } else {
                                                                setRack(
                                                                    (prev) => {
                                                                        return {
                                                                            ...prev,
                                                                            powerB: {
                                                                                id: "",
                                                                                name: "",
                                                                            },
                                                                        };
                                                                    }
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            </div>
                        </div>
                    </form>
                    <DatasheetModal
                        title={"Datasheet"}
                        isShowing={isShowingDatasheetModal}
                        hide={datasheetModal}
                        file={datasheetPreview}
                        level={3}
                    />
                    <AddAccessModal
                        title={"Add Access"}
                        isShowing={isShowingAddAccessModal}
                        isLoading={isLoading}
                        setRack={setRack}
                        state={rack}
                        hide={addAccessModal}
                        submitName={"Add"}
                        onSubmit={addAccessModal}
                        rackNo={rack.rack_number}
                        getAccessNames={getAccessNames}
                        optionsAccessName={optionsAccessName}
                        optionsAccessType={optionsAccessType}
                        deleteAccess={deleteAccess}
                    />
                </div>
            }
        />
    );
};

export default AddRackModal;
