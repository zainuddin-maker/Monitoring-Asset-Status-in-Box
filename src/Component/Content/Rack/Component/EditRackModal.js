import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getToken } from "../../../TokenParse/TokenParse";
import {
    useModal,
    InputTextVertical,
    InputDateVertical,
    UploadPhoto,
    ModalContainer,
    InputTextPairVertical,
    InputDropdownVertical,
    InputDropdownCreatableVertical,
    InputTextAutoSuggestHorizontal,
    LoadingUploadFile,
    LoadingData,
} from "../../../ComponentReuseable/index";
import DatasheetModal from "../../Datasheet/DatasheetModal";
import xMark from "../../../../svg/delete-file-icon.svg";
import "./EditRack.style.scss";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";

const EditRackModal = (props) => {
    const {
        title,
        submitName,
        clearName,
        isShowing,
        hide,
        onSubmit,
        onClear,
        selectedRack,
        setSelectedRack,
        getRacks,
        deleteFile,
        access,
        powerSource,
        selectedDatasheet,
        getDatasheet,
        isConnected,
    } = props;

    const { isShowing: isShowingDatasheetModal, toggle: datasheetModal } =
        useModal();

    const [isDisabled, setIsDisabled] = useState({
        room: false,
        model: false,
    });
    const [progressBarUpload, setProgressBarUpload] = useState();
    const [optionsPowerSourceA, setOptionsPowerSourceA] = useState([]);
    const [optionsPowerSourceB, setOptionsPowerSourceB] = useState([]);
    const [loadingButton, setLoadingButton] = useState(false);
    const [isLoading, setIsLoading] = useState({
        room: false,
        model: false,
        brand: false,
        datasheet: false,
        floor: false,
        status: false,
        power: false,
    });
    const [optionsBrands, setOptionsBrands] = useState([]);
    const [optionsModels, setOptionsModels] = useState([]);
    const [optionsFloors, setOptionsFloors] = useState([]);
    const [optionsRooms, setOptionsRooms] = useState([]);
    const [optionsStatus, setOptionsStatus] = useState([]);
    const [rack, setrack] = useState([]);
    const [datasheetPreview, setDatasheetPreview] = useState(null);
    const [input, setInput] = useState({
        new_image: null,
        new_image_file: "",
        new_datasheet: null,
        new_datasheet_file: [],
        floorName: "",
        powerA: [],
        powerB: [],
    });

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
                toastId: "failed-get-brand",
            });
        }
    };

    const getModels = async (brandId) => {
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
                brand_id:
                    brandId === undefined || input.brand === null
                        ? ""
                        : brandId,
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
                setInput((prev) => {
                    prev.model = "";
                    return { ...prev };
                });
            }
            if (data.length === 1) {
                setInput((prev) => {
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
        setOptionsRooms([]);
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
            setInput((prev) => {
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
                toastId: "error-add-brand",
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
            setInput((prev) => {
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
        let regExp = /[a-zA-Z]/g;
        if (!regExp.test(model_name)) {
            toast.error("Invalid input", {
                toastId: "invalid-input-model",
            });
            return;
        }
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
            toast.success("Success add model number", {
                toastId: "success-add-model",
            });
            setInput((prev) => {
                return {
                    ...prev,
                    model: {
                        value: result.data.data[0].model_id,
                        label: result.data.data[0].model_name,
                    },
                };
            });
            getModels(brand_id);
        } catch (e) {
            // console.error(e);
            toast.error("Failed add model number", {
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
            toast.success("Success delete model number", {
                toastId: "success-delete-model",
            });
            setInput((prev) => {
                return {
                    ...prev,
                    model: "",
                };
            });
            getModels(input.brand.value);
        } catch (e) {
            // console.error(e);
            toast.error("Failed to delete model number", {
                toastId: "error-delete-model",
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

    const editRack = async (e) => {
        e.preventDefault();
        setLoadingButton(true);
        if (input.brand === "") {
            setLoadingButton(false);
            toast.error(`Please fill out the brand field.`, {
                toastId: "empty-brand",
            });
            return;
        }
        // if (input.model === "") {
        //     setLoadingButton(false);
        //     toast.error(`Please fill out the model number field.`, {
        //         toastId: "empty-model",
        //     });
        //     return;
        // }

        // Check for empty area input
        const valRegex = /^[A-Z]+[0-9]+$/;
        if (input.first_area && !valRegex.test(input.first_area)) {
            toast.error("Invalid input Area1.", {
                toastId: "invalid-input-area1",
            });
            setLoadingButton(false);
            return;
        }
        if (input.second_area && !valRegex.test(input.second_area)) {
            toast.error("Invalid input Area2.", {
                toastId: "invalid-input-area2",
            });
            setLoadingButton(false);
            return;
        }

        // Area Input Validation
        const A1 = lettersNumberTonumber(input.first_area);
        const A2 = input.second_area
            ? lettersNumberTonumber(input.second_area)
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
        if (selectedDatasheet.length > 0) {
            await deleteDatasheet(input.rack_id);
        }
        if (powerSource.powerA.length > 0 && powerSource.powerA.length > 0) {
            await deletePower(input.rack_id);
        }

        let imagePath =
            "/filerepository/dcim/uploadFileFromAPI/rack_files/images/";
        let datasheetPath =
            "/filerepository/dcim/uploadFileFromAPI/rack_files/datasheets/";

        if (input.image_location) {
            if (input.image_loc === null || !input.image_loc) {
                deleteFile(input.image_location.slice(38));
            }
        }

        if (input.removedFiles.length > 0) {
            input.removedFiles.forEach(async (data, i) => {
                await deleteFile(data.slice(38));
            });
        }

        // DATASHEET & IMAGE
        let image_path = "";
        let datasheet_path = [];
        let newFile = [];
        let newFilename = [];
        if (input.new_datasheets_file.length > 0) {
            input.new_datasheets_file.map((ds, i) => {
                if (ds !== undefined) {
                    newFilename.push(
                        "rack_files/datasheets/" +
                            input.rack_id +
                            "_" +
                            ds.name.replace(/\s/g, "")
                    );
                }
            });
            newFile = input.new_datasheets_file;
        }

        if (input.new_datasheets_name.length > 0) {
            input.new_datasheets_name.map((ds) => {
                if (input.old_datasheets_name[0] !== null) {
                    let check = input.old_datasheets_name.find(
                        (fd) => fd.split("/")[6] === ds
                    );
                    if (check !== undefined) {
                        datasheet_path.push(check);
                    } else {
                        datasheet_path.push(
                            datasheetPath +
                                input.rack_id +
                                "_" +
                                ds.replace(/\s/g, "")
                        );
                    }
                } else {
                    datasheet_path.push(
                        datasheetPath +
                            input.rack_id +
                            "_" +
                            ds.replace(/\s/g, "")
                    );
                }
            });
        }

        if (input.new_image && input.new_image !== undefined) {
            newFile.push(input.new_image);
            newFilename.push(
                "rack_files/images/" +
                    input.rack_id +
                    "_" +
                    input.new_image_file
            );
            image_path = imagePath + input.rack_id + "_" + input.new_image_file;
        } else {
            image_path = input.image_loc;
        }
        let powerA = input.powerA;
        powerA = powerA
            .map((power) => power.id)
            .filter((power) => power !== "");
        let powerB = input.powerB;
        powerB = powerB
            .map((power) => power.id)
            .filter((power) => power !== "");

        const formData = new FormData();
        formData.append("rack_id", parseInt(selectedRack.rack_id));
        formData.append("rack_number", input.rackNo);
        formData.append("room_name", input.roomName);
        formData.append(
            "area_name",
            input.second_area
                ? input.first_area + "," + input.second_area
                : input.first_area
        );
        formData.append("rack_commissioned_date", input.commissionedDate);
        formData.append("number_of_u", input.numberOfU);
        formData.append("floor_name", input.floorName);
        formData.append("image_location", image_path);
        formData.append("brand_id", input.brand.value);
        formData.append(
            "model_id",
            input.model !== "" ? input.model.value : ""
        );
        formData.append("power_source_a", JSON.stringify(powerA));
        formData.append("power_source_b", JSON.stringify(powerB));
        formData.append("status", input.statusRack);
        formData.append("type", "rack");
        formData.append("datasheet", JSON.stringify(datasheet_path));

        const formDatasheet = new FormData();
        newFile.forEach((data, i) => {
            formDatasheet.append("file", data);
        });
        newFilename.forEach((data, i) => {
            formDatasheet.append("pathFile", data);
        });

        let config1 = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_RACK_UPDATE_RACK,
            headers: {
                authorization: getToken(),
            },
            data: formData,
        };
        let config2 = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_BACKEND_NODELINX) +
                process.env.REACT_APP_IMAGE_UPLOAD,
            headers: {
                authorization: getToken(),
            },
            data: formDatasheet,
            onUploadProgress: (data) =>
                setProgressBarUpload(
                    Math.round((data.loaded / data.total) * 100)
                ),
        };
        try {
            const result1 = await axios(config1);
            if (newFile.length !== 0) {
                await axios(config2);
            }
            setProgressBarUpload(0);
            if (result1.data.startsWith("Success")) {
                toast.success(result1.data, {
                    toastId: "success-edit-rack",
                });
                hide();
                await getRacks();
                await getDatasheet();
            } else {
                toast.error(result1.data, {
                    toastId: "error-edit-rack",
                });
            }
            console.log(input.new_datasheets_name);
            setLoadingButton(false);
        } catch (e) {
            // console.error(e);
            toast.error("Failed to edit rack", {
                toastId: "failed-edit-rack",
            });
            setLoadingButton(false);
            setProgressBarUpload(0);
        }
    };

    const deletePower = async (id) => {
        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_DELETE_POWER_SOURCE,
            headers: {
                authorization: getToken(),
            },
            data: {
                rack_id: parseInt(id),
            },
        };
        try {
            const result = await axios(config);
            if (result.status === 200) {
                return;
            } else {
                toast.error("Failed to delete power source", {
                    toastId: "error-delete-power",
                });
            }
        } catch (e) {
            console.log(e);
            toast.error("Failed to delete power source", {
                toastId: "error-delete-power",
            });
        }
    };

    const deleteDatasheet = async (id) => {
        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_DELETE_DATASHEETS,
            headers: {
                authorization: getToken(),
            },
            data: {
                id: parseInt(id),
                type: "rack",
            },
        };
        try {
            const result = await axios(config);
            if (result.status === 200) {
                return;
            } else {
                toast.error("Failed to delete datasheet", {
                    toastId: "error-delete-datasheet",
                });
            }
        } catch (e) {
            console.log(e);
            toast.error("Failed to delete datasheet", {
                toastId: "error-delete-datasheet",
            });
        }
    };

    const handleChange = (e) => {
        let { name, value } = e.target;
        const checkNumber = /^\d+$/;

        if (name === "numberOfU") {
            if (!checkNumber.test(value)) {
                toast.warning("Invalid input Number of U field.", {
                    toastId: "invalid-input-numberOfU",
                });
                value = "";
            }
        }

        if (name === "floorName") {
            if (value === "") {
                setOptionsRooms([]);
            } else {
                getRooms(input.floorName);
            }
            setInput((prev) => ({ ...prev, roomName: "" }));
        }

        setInput((prev) => {
            prev[name] =
                name === "first_area" ||
                name === "second_area" ||
                name === "rackNo"
                    ? value.toUpperCase()
                    : value;
            return { ...prev };
        });
    };

    const handleChangePhoto = (file) => {
        setInput((prev) => {
            prev.image_loc = null;
            prev.new_image = file;
            prev.new_image_file = file.name.replace(/\s/g, "");
            prev.imagePreview = URL.createObjectURL(file);
            return { ...prev };
        });
    };

    const handleChangeFile = (e) => {
        const { files } = e.target;
        const file = files[0];
        let new_datasheets_name =
            input.new_datasheets_name === undefined
                ? []
                : input.new_datasheets_name;
        let new_datasheets_file =
            input.new_datasheets_file === undefined
                ? []
                : input.new_datasheets_file;

        if (file) {
            let check = input.new_datasheets_name.find(
                (fl) =>
                    fl ===
                    (selectedRack.rack_id + "_" + file.name).replace(/\s/g, "")
            );
            if (check === undefined) {
                new_datasheets_file.push(file);
                new_datasheets_name.push(file.name);
            } else {
                toast.error("This file already exist!", {
                    toastId: "error-add-file",
                });
            }
        }

        setInput((prev) => {
            prev.new_datasheets_name = new_datasheets_name;
            prev.new_datasheets_file = new_datasheets_file;
            return { ...prev };
        });
    };

    const removeFile = (i) => {
        let new_datasheets_name = input.new_datasheets_name;
        let new_datasheets_file = input.new_datasheets_file;
        let removed = new_datasheets_name.find((ds, ind) => ind === i);
        let removedFiles = input.removedFiles;
        new_datasheets_name.splice(i, 1);

        let check1 = new_datasheets_file.find((ds) => ds.filename === removed);
        let check2 = input.old_datasheets_name.find(
            (ds) => removed === ds.split("/")[6]
        );
        if (check1 || check1 !== undefined) {
            new_datasheets_file.filter((ds) => ds.name !== removed);
        }
        if (check2 || check2 !== undefined) {
            removedFiles.push(check2);
        }

        setInput((prev) => {
            prev.new_datasheets_name = new_datasheets_name;
            prev.new_datasheets_file = new_datasheets_file;
            prev.removed = removed;
            prev.removedFiles = removedFiles;
            return { ...prev };
        });
    };

    const handleClear = () => {
        let checkBrand = optionsBrands.find(
            (data) => parseInt(data.value) === parseInt(selectedRack.brand_id)
        );
        let checkModel = optionsModels.find(
            (data) => parseInt(data.value) === parseInt(selectedRack.model_id)
        );
        let new_datasheets_name = [];
        if (selectedDatasheet !== undefined && selectedDatasheet.length > 0) {
            selectedDatasheet.map((ds) => {
                if (ds === null || ds === undefined || ds === "null") {
                    new_datasheets_name = [];
                } else {
                    new_datasheets_name.push(ds.split("/")[6]);
                }
            });
        }

        setInput((prev) => {
            prev.rackNo = selectedRack.rack_number;
            prev.floorName = selectedRack.floor_name;
            prev.roomName = selectedRack.room_name;
            prev.first_area = selectedRack.area_name
                ? selectedRack.area_name.split(",")[0]
                : "";
            prev.second_area = selectedRack.area_name
                ? selectedRack.area_name.split(",")[1] !== undefined
                    ? selectedRack.area_name.split(",")[1]
                    : ""
                : "";
            prev.brand = checkBrand !== undefined ? checkBrand : "";
            prev.model = selectedRack.model_id
                ? checkModel !== undefined
                    ? checkModel
                    : {
                          value: selectedRack.model_id,
                          label: selectedRack.model_name,
                      }
                : "";
            prev.numberOfU = selectedRack.number_of_u;
            prev.commissionedDate = selectedRack.commissioned_date
                ? selectedRack.commissioned_date
                : "";
            prev.image_loc = selectedRack.image_location;
            prev.new_image = null;
            prev.new_image_file = null;
            prev.datasheet_loc = selectedRack.data_sheet_location;
            prev.new_datasheet = null;
            prev.new_datasheet_file = [];
            prev.statusRack = selectedRack.status;
            prev.new_datasheets_name = new_datasheets_name;
            prev.new_datasheets_file = [];
            prev.removed = [];
            prev.removedFiles = [];
            return { ...prev };
        });
        let powerSourceA = [];
        let powerSourceB = [];

        if (powerSource.powerA.length === optionsPowerSourceA.length) {
            powerSource.powerA.map((power) => {
                let ps = optionsPowerSourceA.find((p) => p.name === power);
                powerSourceA.push(ps);
            });
        } else {
            powerSource.powerA.map((power) => {
                let ps = optionsPowerSourceA.find((p) => p.name === power);
                powerSourceA.push(ps);
            });
            powerSourceA.push({ id: "", name: "" });
        }
        if (powerSource.powerB.length === optionsPowerSourceB.length) {
            powerSource.powerB.map((power) => {
                let ps = optionsPowerSourceB.find((p) => p.name === power);
                powerSourceB.push(ps);
            });
        } else {
            powerSource.powerB.map((power) => {
                let ps = optionsPowerSourceB.find((p) => p.name === power);

                powerSourceB.push(ps);
            });
            powerSourceB.push({ id: "", name: "" });
        }
        setInput((prev) => ({
            ...prev,
            powerA: powerSourceA,
            powerB: powerSourceB,
        }));
    };

    const delPowerA = (i) => {
        let data = input.powerA;

        data.splice(i, 1);
        data = data
            .filter((power) => power.id !== "")
            .concat([
                {
                    id: "",
                    name: "",
                },
            ]);

        setInput((prev) => ({
            ...prev,
            powerA: data,
        }));
    };

    const delPowerB = (i) => {
        let data = input.powerB;

        data.splice(i, 1);
        data = data
            .filter((power) => power.id !== "")
            .concat([
                {
                    id: "",
                    name: "",
                },
            ]);

        setInput((prev) => ({
            ...prev,
            powerB: data,
        }));
    };

    useEffect(() => {
        if (selectedRack !== undefined) {
            let dataSelected = selectedRack;
            dataSelected.rackNo = selectedRack.rack_number;
            dataSelected.floorName = selectedRack.floor_name;
            dataSelected.roomName = selectedRack.room_name;
            dataSelected.first_area = selectedRack.area_name
                ? selectedRack.area_name.split(",")[0]
                : "";
            dataSelected.second_area = selectedRack.area_name
                ? selectedRack.area_name.split(",").length > 0
                    ? selectedRack.area_name.split(",")[1]
                    : ""
                : "";
            dataSelected.brand = {
                value: selectedRack.brand_id,
                label: selectedRack.brand_name,
            };
            dataSelected.model = selectedRack.model_id
                ? {
                      value: selectedRack.model_id,
                      label: selectedRack.model_name,
                  }
                : "";
            dataSelected.numberOfU = selectedRack.number_of_u;
            dataSelected.commissionedDate = selectedRack.commissioned_date
                ? selectedRack.commissioned_date
                : "";
            dataSelected.image_loc = selectedRack.image_location;
            dataSelected.datasheet_loc = selectedRack.data_sheet_location;
            dataSelected.statusRack = selectedRack.status;
            dataSelected.datasheets = [];
            dataSelected.powerSource_a = { id: "", name: "" };
            dataSelected.powerSource_b = { id: "", name: "" };
            dataSelected.new_datasheet_file = [];
            dataSelected.removed = [];
            dataSelected.removedFiles = [];
            setInput(dataSelected);
        }
    }, [selectedRack]);

    useEffect(() => {
        getBrands();
        getPowerSource();
        getFloors();
        getStatus();
    }, []);

    useEffect(async () => {
        let powerSourceA = [];
        let powerSourceB = [];
        if (powerSource !== undefined) {
            if (powerSource.powerA.length === optionsPowerSourceA.length) {
                powerSource.powerA.map((power) => {
                    let ps = optionsPowerSourceA.find((p) => p.name === power);

                    powerSourceA.push(ps);
                });
            } else {
                powerSource.powerA.map((power) => {
                    let ps = optionsPowerSourceA.find((p) => p.name === power);
                    powerSourceA.push(ps);
                });
                powerSourceA.push({ id: "", name: "" });
            }
            if (powerSource.powerB.length === optionsPowerSourceB.length) {
                powerSource.powerB.map((power) => {
                    let ps = optionsPowerSourceB.find((p) => p.name === power);
                    powerSourceB.push(ps);
                });
            } else {
                powerSource.powerB.map((power) => {
                    let ps = optionsPowerSourceB.find((p) => p.name === power);

                    powerSourceB.push(ps);
                });
                powerSourceB.push({ id: "", name: "" });
            }
            setInput((prev) => ({
                ...prev,
                powerA: powerSourceA,
                powerB: powerSourceB,
            }));
        } else {
            setInput((prev) => ({
                ...prev,
                powerA: [],
                powerB: [],
            }));
        }
    }, [powerSource]);

    useEffect(() => {
        if (
            selectedDatasheet !== undefined &&
            selectedDatasheet.length > 0 &&
            selectedDatasheet
        ) {
            let new_datasheets_name = [];
            let old_datasheets_name = [];
            selectedDatasheet.map((ds) => {
                if (ds === null || ds === undefined || ds === "null") {
                    new_datasheets_name = [];
                    old_datasheets_name = [];
                } else {
                    new_datasheets_name.push(ds.split("/")[6]);
                    old_datasheets_name.push(ds);
                }
            });
            setInput((prev) => {
                prev.old_datasheets_name = old_datasheets_name;
                prev.new_datasheets_name = new_datasheets_name;
                prev.new_datasheets_file = [];
                return { ...prev };
            });
        } else {
            setInput((prev) => {
                prev.old_datasheets_name = [];
                prev.new_datasheets_name = [];
                prev.new_datasheets_file = [];
                return { ...prev };
            });
        }
    }, [selectedDatasheet]);

    useEffect(() => {
        if (!input.floorName || input.floorName !== undefined) {
            if (input.floorName === "") {
                setOptionsRooms([]);
            } else {
                getRooms(input.floorName);
            }
        } else {
            setOptionsRooms([]);
        }
    }, [input.floorName]);

    useEffect(() => {
        if (input.brand !== undefined) {
            getModels(input.brand.value);
        }
    }, [input.brand]);

    useEffect(() => {
        if (!isShowing) {
            handleClear();
        }
    }, [isShowing]);

    return (
        <ModalContainer
            width={"auto" || "650px"}
            title={title}
            isShowing={isShowing}
            hide={hide}
            submitName={submitName}
            onSubmit={editRack}
            formId={"editRack"}
            clearName={clearName}
            onClear={handleClear}
            isLoading={
                loadingButton ||
                input.powerA === undefined ||
                input.powerB === undefined
            }
            showRequired={true}
            children={
                <div className='Edit-rack-modal'>
                    <LoadingUploadFile percentage={progressBarUpload} />
                    <form
                        className='edit-rack-form'
                        id='editRack'
                        onSubmit={editRack}>
                        <div className='top-side'>
                            <div className='left-side'>
                                <InputTextVertical
                                    label='Rack Number'
                                    name='rackNo'
                                    value={input.rackNo}
                                    onChange={handleChange}
                                    isRequired={true}
                                    isDisabled={true}
                                />
                                <div className='flex-row'>
                                    <InputDropdownVertical
                                        label='Floor'
                                        name='floorName'
                                        value={input.floorName}
                                        options={
                                            input.floorName === "-"
                                                ? ["-"]
                                                : optionsFloors
                                        }
                                        onChange={handleChange}
                                        isRequired={true}
                                        noEmptyOption={
                                            input.floorName === "-"
                                                ? true
                                                : false
                                        }
                                        isDisabled={
                                            input.floorName === "-" ||
                                            input.floorName === undefined
                                        }
                                        isLoading={
                                            input.floorName === "-" ||
                                            input.floorName === undefined
                                        }
                                    />
                                    <InputDropdownVertical
                                        label='Room'
                                        name='roomName'
                                        value={input.roomName}
                                        onChange={handleChange}
                                        options={
                                            input.roomName === "-"
                                                ? ["-"]
                                                : optionsRooms
                                        }
                                        isDisabled={
                                            isDisabled.room ||
                                            input.floorName === "" ||
                                            input.roomName === "-" ||
                                            input.roomName === undefined
                                        }
                                        isRequired={true}
                                        isLoading={
                                            isLoading.room ||
                                            input.roomName === "-" ||
                                            input.roomName === undefined
                                        }
                                        noEmptyOption={
                                            input.roomName === "-" ||
                                            input.roomName === undefined
                                        }
                                    />
                                    <InputTextPairVertical
                                        width='150px'
                                        label='Area'
                                        nameFirst='first_area'
                                        nameSecond='second_area'
                                        valueFirst={input.first_area}
                                        valueSecond={
                                            input.first_area === "-"
                                                ? "-"
                                                : input.second_area
                                        }
                                        onChangeFirst={handleChange}
                                        onChangeSecond={handleChange}
                                        isRequired={true}
                                        isDisabled={
                                            input.first_area === "-" ||
                                            input.first_area === undefined
                                        }
                                        isDisabledSecond={
                                            input.first_area === "-"
                                        }
                                    />
                                </div>
                                <InputDropdownCreatableVertical
                                    label='Brand'
                                    name='brand'
                                    value={input.brand}
                                    options={optionsBrands}
                                    onChange={handleChange}
                                    isLoading={isLoading.brand}
                                    onSelect={(e) => {
                                        setInput((prev) => {
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
                                    value={input.model}
                                    options={optionsModels}
                                    onChange={handleChange}
                                    isLoading={isLoading.model}
                                    isDisabled={
                                        isDisabled.model || input.brand === ""
                                    }
                                    onSelect={(e) => {
                                        setInput((prev) => {
                                            return {
                                                ...prev,
                                                model: e,
                                            };
                                        });
                                    }}
                                    onCreateOption={(e) => {
                                        let regex = /^\s*$/;
                                        if (!regex.test(e)) {
                                            addModel(e, input.brand.value);
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
                                    name='numberOfU'
                                    value={input.numberOfU}
                                    onChange={handleChange}
                                    isRequired={true}
                                    isDisabled={
                                        input.number_of_u === undefined ||
                                        input.number_of_u === "---"
                                    }
                                />
                                <InputDropdownVertical
                                    label='Status'
                                    name='statusRack'
                                    value={input.statusRack}
                                    options={
                                        input.statusRack === "---"
                                            ? ["---"]
                                            : optionsStatus
                                    }
                                    onChange={handleChange}
                                    isRequired={true}
                                    noEmptyOption={
                                        input.statusRack === "---" ||
                                        input.statusRack === undefined
                                    }
                                    isDisabled={
                                        input.statusRack === "---" ||
                                        input.statusRack === undefined
                                    }
                                    isLoading={isLoading.status}
                                />
                                <InputDateVertical
                                    label='Commissioned Date'
                                    name='commissionedDate'
                                    value={input.commissionedDate}
                                    onChange={handleChange}
                                    isDisabled={
                                        input.commissionedDate === undefined ||
                                        input.commissionedDate === "---"
                                    }
                                    clearData={() => {
                                        setInput((prev) => {
                                            return {
                                                ...prev,
                                                commissionedDate:
                                                    selectedRack.commissioned_date
                                                        ? selectedRack.commissioned_date
                                                        : "",
                                            };
                                        });
                                    }}
                                />
                            </div>
                            <div className='right-side'>
                                <span>Rack Image</span>
                                <UploadPhoto
                                    height='260px'
                                    width='363px'
                                    defaultImage={
                                        input.new_image
                                            ? input.new_image
                                            : !input.image_loc ||
                                              input.image_loc === "null" ||
                                              input.image_loc === null
                                            ? null
                                            : ReturnHostBackend(
                                                  process.env
                                                      .REACT_APP_BACKEND_NODELINX
                                              ) + input.image_loc
                                    }
                                    onUpload={(photoFile) => {
                                        handleChangePhoto(photoFile);
                                    }}
                                    triggerClear={input.new_image}
                                />
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
                                        <LoadingData
                                            isLoading={
                                                input.new_datasheets_name ===
                                                undefined
                                            }
                                            useAltBackground={false}
                                            size='30px'
                                        />
                                        {input.new_datasheets_name !== undefined
                                            ? input.new_datasheets_name.map(
                                                  (ds, i) => (
                                                      <div
                                                          className='files'
                                                          key={i}>
                                                          <div className='file'>
                                                              <span
                                                                  className='file'
                                                                  onClick={() => {
                                                                      let dtsheet =
                                                                          [];
                                                                      if (
                                                                          input
                                                                              .old_datasheets_name[0] !==
                                                                          null
                                                                      ) {
                                                                          let check1 =
                                                                              input.old_datasheets_name.find(
                                                                                  (
                                                                                      fl
                                                                                  ) =>
                                                                                      fl.split(
                                                                                          "/"
                                                                                      )[6] ===
                                                                                      ds
                                                                              );

                                                                          if (
                                                                              check1 !==
                                                                              undefined
                                                                          ) {
                                                                              dtsheet.push(
                                                                                  check1
                                                                              );
                                                                          }
                                                                      }

                                                                      let check2 =
                                                                          input.new_datasheets_file.find(
                                                                              (
                                                                                  fl
                                                                              ) =>
                                                                                  fl.name ===
                                                                                  ds
                                                                          );
                                                                      if (
                                                                          check2 !==
                                                                          undefined
                                                                      ) {
                                                                          dtsheet.push(
                                                                              check2
                                                                          );
                                                                      }

                                                                      setDatasheetPreview(
                                                                          dtsheet
                                                                      );

                                                                      datasheetModal();
                                                                  }}>
                                                                  {ds}
                                                              </span>
                                                              <img
                                                                  className='xMark'
                                                                  src={xMark}
                                                                  style={{
                                                                      background:
                                                                          "none",
                                                                  }}
                                                                  onClick={() =>
                                                                      removeFile(
                                                                          i
                                                                      )
                                                                  }
                                                              />
                                                          </div>
                                                      </div>
                                                  )
                                              )
                                            : ""}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='bottom-side'>
                            <div className='left-side'>
                                <div className='client'>
                                    <span>Client</span>
                                    <p>{input.client_name}</p>
                                </div>
                                {access.length !== 0 ? (
                                    <div className='flex-column'>
                                        <span>Access</span>
                                        <div className='access'>
                                            {access.keyType.map((a, i) => (
                                                <div className='flex-row'>
                                                    <span>
                                                        Access {a.type_name}{" "}
                                                        {i + 1}:
                                                    </span>
                                                    <span>{a.access_name}</span>
                                                </div>
                                            ))}
                                            {access.cardType.map((a, i) => (
                                                <div className='flex-row'>
                                                    <span>
                                                        Access {a.type_name}{" "}
                                                        {i + 1}:
                                                    </span>
                                                    <span>{a.access_name}</span>
                                                </div>
                                            ))}
                                            {access.biometricType.map(
                                                (a, i) => (
                                                    <div className='flex-row'>
                                                        <span>
                                                            Access {a.type_name}{" "}
                                                            {i + 1}:
                                                        </span>
                                                        <span>
                                                            {a.access_name}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className='flex-column'>
                                        <span>Access</span>
                                        <span>{"---"}</span>
                                    </div>
                                )}
                            </div>
                            <div className='right-side'>
                                <div className='flex-column'>
                                    <span>Power Source</span>
                                    {input.powerA !== undefined &&
                                    input.powerA.length !== 0 ? (
                                        <div className='power'>
                                            {input.powerA.map((power, i) => {
                                                if (power !== undefined) {
                                                    if (power.name !== "") {
                                                        return (
                                                            <div className='flex-row'>
                                                                <div className='powerSource'>
                                                                    <InputTextAutoSuggestHorizontal
                                                                        labelWidth='145px'
                                                                        inputWidth='100%'
                                                                        label={`Power Source A${
                                                                            i +
                                                                            1
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
                                                                        delPowerA(
                                                                            i
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        );
                                                    } else {
                                                        return (
                                                            <div className='powerSource'>
                                                                <InputTextAutoSuggestHorizontal
                                                                    labelWidth='130px'
                                                                    inputWidth='100%'
                                                                    width='110px'
                                                                    label='Power Source A'
                                                                    name='powerSource_a'
                                                                    isLoading={
                                                                        isLoading.power
                                                                    }
                                                                    value={
                                                                        input
                                                                            .powerSource_a
                                                                            .name
                                                                    }
                                                                    options={optionsPowerSourceA.map(
                                                                        (
                                                                            data
                                                                        ) =>
                                                                            data.name
                                                                    )}
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        let {
                                                                            value,
                                                                        } =
                                                                            e.target;
                                                                        setInput(
                                                                            (
                                                                                prev
                                                                            ) => {
                                                                                return {
                                                                                    ...prev,
                                                                                    powerSource_a:
                                                                                        {
                                                                                            name: value,
                                                                                        },
                                                                                };
                                                                            }
                                                                        );
                                                                    }}
                                                                    isRequired={
                                                                        power.id ===
                                                                            "" &&
                                                                        input
                                                                            .powerA
                                                                            .length ===
                                                                            1
                                                                            ? true
                                                                            : false
                                                                    }
                                                                    validateInput={(
                                                                        e
                                                                    ) => {
                                                                        let {
                                                                            value,
                                                                        } =
                                                                            e.target;

                                                                        let power =
                                                                            optionsPowerSourceA.find(
                                                                                (
                                                                                    p
                                                                                ) =>
                                                                                    p.name ===
                                                                                    value
                                                                            );

                                                                        let duplicateCheck =
                                                                            input.powerA.find(
                                                                                (
                                                                                    p
                                                                                ) =>
                                                                                    p !==
                                                                                    undefined
                                                                                        ? p.name ===
                                                                                          value
                                                                                        : p
                                                                            );
                                                                        let powerA =
                                                                            [];
                                                                        if (
                                                                            input
                                                                                .powerA
                                                                                .length ===
                                                                            1
                                                                        ) {
                                                                            powerA =
                                                                                [];
                                                                        } else {
                                                                            powerA =
                                                                                input.powerA;
                                                                            powerA =
                                                                                powerA.filter(
                                                                                    (
                                                                                        power
                                                                                    ) =>
                                                                                        power !==
                                                                                        undefined
                                                                                            ? power.id !==
                                                                                              ""
                                                                                            : power
                                                                                );
                                                                        }
                                                                        if (
                                                                            value !==
                                                                            ""
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
                                                                                setInput(
                                                                                    (
                                                                                        prev
                                                                                    ) => {
                                                                                        return {
                                                                                            ...prev,
                                                                                            powerA: powerA,
                                                                                            powerSource_a:
                                                                                                {
                                                                                                    id: "",
                                                                                                    name: "",
                                                                                                },
                                                                                        };
                                                                                    }
                                                                                );
                                                                            } else {
                                                                                setInput(
                                                                                    (
                                                                                        prev
                                                                                    ) => {
                                                                                        return {
                                                                                            ...prev,
                                                                                            powerSource_a:
                                                                                                {
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
                                                                            setInput(
                                                                                (
                                                                                    prev
                                                                                ) => {
                                                                                    return {
                                                                                        ...prev,
                                                                                        powerSource_a:
                                                                                            {
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
                                                }
                                            })}
                                        </div>
                                    ) : (
                                        <div className='power'>
                                            <div className='flex-row'>
                                                <div className='powerSource'>
                                                    <InputTextAutoSuggestHorizontal
                                                        labelWidth='130px'
                                                        inputWidth='100%'
                                                        label='Power Source A'
                                                        name='powerA'
                                                        value='---'
                                                        options={[]}
                                                        isDisabled={true}
                                                        isLoading={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {input.powerB !== undefined &&
                                input.powerB.length !== 0 ? (
                                    <div className='power'>
                                        {input.powerB.map((power, i) => {
                                            if (power !== undefined) {
                                                if (power.name !== "") {
                                                    return (
                                                        <div className='flex-row'>
                                                            <div className='powerSource'>
                                                                <InputTextAutoSuggestHorizontal
                                                                    labelWidth='145px'
                                                                    inputWidth='100%'
                                                                    width='110px'
                                                                    label={`Power Source B${
                                                                        i + 1
                                                                    }`}
                                                                    name='powerB'
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
                                                                inputWidth='100%'
                                                                width='110px'
                                                                label='Power Source B'
                                                                name='powerSource_b'
                                                                isLoading={
                                                                    isLoading.power
                                                                }
                                                                value={
                                                                    input
                                                                        .powerSource_b
                                                                        .name
                                                                }
                                                                options={optionsPowerSourceB.map(
                                                                    (data) =>
                                                                        data.name
                                                                )}
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    let {
                                                                        value,
                                                                    } =
                                                                        e.target;
                                                                    setInput(
                                                                        (
                                                                            prev
                                                                        ) => {
                                                                            return {
                                                                                ...prev,
                                                                                powerSource_b:
                                                                                    {
                                                                                        name: value,
                                                                                    },
                                                                            };
                                                                        }
                                                                    );
                                                                }}
                                                                isRequired={
                                                                    power.id ===
                                                                        "" &&
                                                                    input.powerB
                                                                        .length ===
                                                                        1
                                                                        ? true
                                                                        : false
                                                                }
                                                                validateInput={(
                                                                    e
                                                                ) => {
                                                                    let {
                                                                        value,
                                                                    } =
                                                                        e.target;

                                                                    let power =
                                                                        optionsPowerSourceB.find(
                                                                            (
                                                                                p
                                                                            ) =>
                                                                                p.name ===
                                                                                value
                                                                        );
                                                                    let duplicateCheck =
                                                                        input.powerB.find(
                                                                            (
                                                                                p
                                                                            ) =>
                                                                                p !==
                                                                                undefined
                                                                                    ? p.name ===
                                                                                      value
                                                                                    : p
                                                                        );
                                                                    let powerB =
                                                                        [];
                                                                    if (
                                                                        input
                                                                            .powerB
                                                                            .length ===
                                                                        1
                                                                    ) {
                                                                        powerB =
                                                                            [];
                                                                    } else {
                                                                        powerB =
                                                                            input.powerB;
                                                                        powerB =
                                                                            powerB.filter(
                                                                                (
                                                                                    power
                                                                                ) =>
                                                                                    power !==
                                                                                    undefined
                                                                                        ? power.id !==
                                                                                          ""
                                                                                        : power
                                                                            );
                                                                    }
                                                                    if (
                                                                        value !==
                                                                        ""
                                                                    ) {
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
                                                                            setInput(
                                                                                (
                                                                                    prev
                                                                                ) => {
                                                                                    return {
                                                                                        ...prev,
                                                                                        powerB: powerB,
                                                                                        powerSource_b:
                                                                                            {
                                                                                                id: "",
                                                                                                name: "",
                                                                                            },
                                                                                    };
                                                                                }
                                                                            );
                                                                        } else {
                                                                            setInput(
                                                                                (
                                                                                    prev
                                                                                ) => {
                                                                                    return {
                                                                                        ...prev,
                                                                                        powerSource_b:
                                                                                            {
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
                                                                                        "invalid-input-powerA",
                                                                                }
                                                                            );
                                                                            return;
                                                                        }
                                                                    } else {
                                                                        setInput(
                                                                            (
                                                                                prev
                                                                            ) => {
                                                                                return {
                                                                                    ...prev,
                                                                                    powerSource_b:
                                                                                        {
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
                                            }
                                        })}
                                    </div>
                                ) : (
                                    <div className='power'>
                                        <div className='flex-row'>
                                            <div className='powerSource'>
                                                <InputTextAutoSuggestHorizontal
                                                    labelWidth='130px'
                                                    inputWidth='100%'
                                                    label='Power Source B'
                                                    value='---'
                                                    options={[]}
                                                    isDisabled={true}
                                                    isLoading={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                    <DatasheetModal
                        title={"Datasheet"}
                        isShowing={isShowingDatasheetModal}
                        hide={datasheetModal}
                        file={datasheetPreview}
                        level={2}
                    />
                </div>
            }
        />
    );
};

export default EditRackModal;
