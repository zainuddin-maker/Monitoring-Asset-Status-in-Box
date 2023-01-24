import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../../TokenParse/TokenParse";
import {
    useModal,
    InputTextVertical,
    InputDropdownVertical,
    InputDateVertical,
    UploadPhoto,
    ModalContainer,
    InputDropdownCreatableVertical,
    LoadingUploadFile,
} from "../../../ComponentReuseable/index";
import DatasheetModal from "../../Datasheet/DatasheetModal";
import xMark from "../../../../svg/delete-file-icon.svg";
import { toast } from "react-toastify";
import "./EditItem.style.scss";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";

const EditItemModal = (props) => {
    const {
        title,
        submitName,
        clearName,
        isShowing,
        hide,
        selectedItem,
        getItems,
        deleteFile,
        selectedDatasheet,
    } = props;

    const { isShowing: isShowingDatasheetModal, toggle: datasheetModal } =
        useModal();

    const [progressBarUpload, setProgressBarUpload] = useState();
    const [isDisabled, setIsDisabled] = useState(false);
    const dropdownOptions = ["Half", "Full"];
    const [loadingButton, setLoadingButton] = useState(false);
    const [datasheetPreview, setDatasheetPreview] = useState(null);
    const [isLoading, setIsLoading] = useState({
        model: false,
        brand: false,
        client: false,
        sub_category: false,
        category: false,
    });
    const [optionsModels, setOptionsModels] = useState([]);
    const [optionsBrands, setOptionsBrands] = useState([]);
    const [optionsCategories, setOptionsCategories] = useState([]);
    const [optionsSubCategories, setOptionsSubCategories] = useState([]);
    const [optionsClients, setOptionsClients] = useState([]);
    const [input, setInput] = useState({
        new_image: null,
        new_image_file: "",
        new_datasheet: null,
        new_datasheet_file: [],
        sub_category: "",
    });

    const getCategories = async () => {
        setIsLoading((prev) => {
            prev.category = true;
            return { ...prev };
        });
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACKITEM_GET_CATEGORIES,
            headers: {
                authorization: getToken(),
            },
        };
        try {
            const result = await axios(config);
            setOptionsCategories(result.data.data);
            setIsLoading((prev) => {
                prev.category = false;
                return { ...prev };
            });
        } catch (e) {
            // console.error(e);
            if (e.message === "Network Error") {
                setIsLoading((prev) => {
                    prev.category = true;
                    return { ...prev };
                });
            } else {
                setIsLoading((prev) => {
                    prev.category = false;
                    return { ...prev };
                });
            }
            toast.error("Failed to get categories", {
                toastId: "failed-get-categories",
            });
        }
    };

    const getSubCategories = async () => {
        setIsLoading((prev) => {
            prev.sub_category = true;
            return { ...prev };
        });
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACKITEM_GET_SUB_CATEGORIES,
            headers: {
                authorization: getToken(),
            },
        };
        try {
            const result = await axios(config);
            const data = result.data.data;
            let subCategories = [];
            if (data.length !== 0) {
                data.map((a) => {
                    subCategories.push({
                        value: a.id,
                        label: a.name,
                    });
                });
                setOptionsSubCategories(subCategories);
            } else {
                setOptionsSubCategories([]);
            }
            if (data.length === 1) {
                setInput((prev) => {
                    prev.sub_category = {
                        value: data[0].id,
                        label: data[0].name,
                    };
                    return { ...prev };
                });
            }
            setIsLoading((prev) => {
                prev.sub_category = false;
                return { ...prev };
            });
        } catch (e) {
            // console.error(e);
            if (e.message === "Network Error") {
                setIsLoading((prev) => {
                    prev.sub_category = true;
                    return { ...prev };
                });
            } else {
                setIsLoading((prev) => {
                    prev.sub_category = false;
                    return { ...prev };
                });
            }
            toast.error("Failed to get sub categories", {
                toastId: "failed-get-sub-categories",
            });
        }
    };

    const addSubCategory = async (category_name) => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACKITEM_ADD_SUB_CATEGORIES,
            headers: {
                authorization: getToken(),
            },
            data: { sub_category_name: category_name },
        };
        try {
            const result = await axios(config);
            toast.success("Success add sub category", {
                toastId: "success-add-sub-category",
            });
            getSubCategories();
            setInput((prev) => {
                return {
                    ...prev,
                    sub_category: {
                        value: result.data.data[0].item_sub_category_id,
                        label: result.data.data[0].item_sub_category_name,
                    },
                };
            });
        } catch (e) {
            // console.error(e);
            toast.error("Failed to add sub category", {
                toastId: "error-add-sub-category",
            });
        }
    };

    const delSubCategory = async (category_id) => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACKITEM_DELETE_SUB_CATEGORIES,
            headers: {
                authorization: getToken(),
            },
            data: { sub_category_id: category_id },
        };
        try {
            const result = await axios(config);
            toast.success("Success to delete sub category", {
                toastId: "success-delete-sub-category",
            });
            getSubCategories();
            setInput((prev) => {
                return {
                    ...prev,
                    sub_category: "",
                };
            });
        } catch (e) {
            // console.error(e);
            toast.error("Failed to delete sub category", {
                toastId: "error-delete-sub-category",
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
                type: "item",
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

    const addBrand = async (brand_name) => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_ADD_BRAND,
            headers: {
                authorization: getToken(),
            },
            data: { brand_name: brand_name, type: "item" },
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
            setIsDisabled(true);
        } catch (e) {
            // console.error(e);
            toast.error("Failed to delete brand", {
                toastId: "error-delete-brand",
            });
        }
    };

    const getModels = async (brandId) => {
        setIsDisabled(true);
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
                type: "item",
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
            setIsDisabled(false);
            setIsLoading((prev) => {
                prev.model = false;
                return { ...prev };
            });
        } catch (e) {
            // console.error(e);
            if (e.message === "Network Error") {
                setIsDisabled(true);
                setIsLoading((prev) => {
                    prev.model = true;
                    return { ...prev };
                });
            } else {
                setIsDisabled(false);
                setIsLoading((prev) => {
                    prev.model = false;
                    return { ...prev };
                });
            }
            toast.error("Failed to get model number", {
                toastId: "failed-get-model",
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
            data: { model_name: model_name, type: "item", brand_id: brand_id },
        };
        try {
            const result = await axios(config);
            toast.success("Success to add model number", {
                toastId: "success-add-model",
            });
            getModels(brand_id);
            setInput((prev) => {
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
            getModels(input.brand.value);
            setInput((prev) => {
                return {
                    ...prev,
                    model: "",
                };
            });
        } catch (e) {
            // console.error(e);
            toast.error("Failed to delete model", {
                toastId: "error-delete-model",
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
                process.env.REACT_APP_RACK_GET_CLIENTS,
            headers: {
                authorization: getToken(),
            },
        };
        try {
            const result = await axios(config);
            const data = result.data.data;
            let clients = [];
            if (data.length !== 0) {
                data.map((a) => {
                    clients.push({
                        value: a.client_id,
                        label: a.client_name,
                    });
                });
                setOptionsClients(clients);
            } else {
                setOptionsClients([]);
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
            toast.error("Failed to get clients", {
                toastId: "failed-get-clients",
            });
        }
    };

    const addClient = async (client_name) => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_ITEM_ADD_CLIENT,
            headers: {
                authorization: getToken(),
            },
            data: { client_name: client_name, type: "item" },
        };
        try {
            const result = await axios(config);
            toast.success("Success to add client", {
                toastId: "success-add-client",
            });
            getClients();
            setInput((prev) => {
                return {
                    ...prev,
                    client: {
                        value: result.data.data[0].client_id,
                        label: result.data.data[0].client_name,
                    },
                };
            });
        } catch (e) {
            // console.error(e);
            toast.error("Failed to add client", {
                toastId: "error-add-client",
            });
        }
    };

    const delClient = async (client_id) => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_ITEM_DELETE_CLIENT,
            headers: {
                authorization: getToken(),
            },
            data: { client_id: client_id },
        };
        try {
            const result = await axios(config);
            toast.success("Success to delete client", {
                toastId: "success-delete-client",
            });
            getClients();
            setInput((prev) => {
                return {
                    ...prev,
                    client: "",
                };
            });
        } catch (e) {
            // console.error(e);
            toast.error("Failed to delete client", {
                toastId: "error-delete-client",
            });
        }
    };

    const editItem = async (e) => {
        e.preventDefault();
        setLoadingButton(true);

        if (input.brand === "") {
            setLoadingButton(false);
            toast.error(`Please fill out the brand field.`, {
                toastId: "empty-value-brand",
            });
            return;
        }
        if (input.model === "") {
            setLoadingButton(false);
            toast.error(`Please fill out the model number field.`, {
                toastId: "empty-value-model",
            });
            return;
        }
        if (input.client === "") {
            setLoadingButton(false);
            toast.error(`Please fill out the client field.`, {
                toastId: "empty-value-client",
            });
            return;
        }
        if (input.sub_category === "" && checkCategory(input.category)) {
            setLoadingButton(false);
            toast.error(`Please fill out the sub category field.`, {
                toastId: "empty-value-sub-category",
            });
            return;
        }

        if (selectedDatasheet.length > 0) {
            await deleteDatasheet(input.item_id);
        }

        if (input.removedFiles.length > 0) {
            input.removedFiles.forEach(async (data, i) => {
                await deleteFile(data.slice(38));
            });
        }

        let imagePath =
            "/filerepository/dcim/uploadFileFromAPI/item_files/images/";
        let datasheetPath =
            "/filerepository/dcim/uploadFileFromAPI/item_files/datasheets/";

        if (input.image_location) {
            if (input.image_loc === null || !input.image_loc) {
                deleteFile(input.image_location.slice(38));
            }
        }

        // DATASHEET & IMAGE
        let image_path = "";
        let datasheet_path = [];
        let newFile = [];
        let newFilename = [];
        if (input.new_datasheets_file.length > 0) {
            input.new_datasheets_file.map((ds, i) =>
                newFilename.push(
                    "item_files/datasheets/" +
                        input.item_id +
                        "_" +
                        ds.name.replace(/\s/g, "")
                )
            );
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
                                input.item_id +
                                "_" +
                                ds.replace(/\s/g, "")
                        );
                    }
                } else {
                    datasheet_path.push(
                        datasheetPath +
                            input.item_id +
                            "_" +
                            ds.replace(/\s/g, "")
                    );
                }
            });
        }

        if (
            input.new_image ||
            (input.new_image !== null && input.new_image !== undefined)
        ) {
            newFile.push(input.new_image);
            newFilename.push(
                "item_files/images/" +
                    input.item_id +
                    "_" +
                    input.new_image_file
            );
            image_path = imagePath + input.item_id + "_" + input.new_image_file;
        } else {
            image_path = input.image_loc;
        }
        const formData = new FormData();
        formData.append("model_id", input.model.value);
        formData.append("client_id", input.client.value);
        formData.append("item_number", input.itemNo);
        formData.append("item_name", input.itemName);
        formData.append("item_category_id", input.category);
        formData.append(
            "item_sub_category_id",
            input.sub_category !== "" ? input.sub_category.value : ""
        );
        formData.append("number_of_u", parseInt(input.numberOfU));
        formData.append("is_full", input.isFull);
        formData.append("item_commissioned_date", input.commissionedDate);
        formData.append("item_id", parseInt(selectedItem.item_id));
        formData.append("image_location", image_path);
        formData.append("datasheet", JSON.stringify(datasheet_path));
        formData.append("type", "item");

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
                process.env.REACT_APP_ITEM_UPDATE_ITEM,
            headers: {
                authorization: getToken(),
            },
            data: formData,
            onUploadProgress: (data) =>
                setProgressBarUpload(
                    Math.round((data.loaded / data.total) * 100)
                ),
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
                    toastId: "success-edit-item",
                });
                hide();
                await getItems();
            } else {
                toast.error(result1.data, {
                    toastId: "error-edit-item",
                });
            }
            setLoadingButton(false);
        } catch (e) {
            // console.error(e);
            setLoadingButton(false);
            toast.error("Failed to edit item", {
                toastId: "error-edit-item",
            });
            setProgressBarUpload(0);
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
                type: "item",
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
            toast.error("Error deleting datasheet", {
                toastId: "error-delete-datasheet",
            });
        }
    };

    const handleClear = () => {
        let checkSubCategory = optionsSubCategories.find(
            (data) =>
                parseInt(data.value) ===
                parseInt(selectedItem.item_sub_category_id)
        );
        let checkBrand = optionsBrands.find(
            (data) => parseInt(data.value) === parseInt(selectedItem.brand_id)
        );
        let checkModel = optionsModels.find(
            (data) => parseInt(data.value) === parseInt(selectedItem.model_id)
        );
        let checkClient = optionsClients.find(
            (data) => parseInt(data.value) === parseInt(selectedItem.client_id)
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
            prev.itemNo = selectedItem.item_number;
            prev.itemName = selectedItem.item_name;
            prev.category = selectedItem.category_id;
            prev.sub_category =
                checkSubCategory !== undefined ? checkSubCategory : "";

            prev.brand = checkBrand !== undefined ? checkBrand : "";
            prev.model = checkModel !== undefined ? checkModel : "";
            prev.numberOfU = selectedItem.number_of_u;
            prev.isFull = selectedItem.is_full;
            prev.client = checkClient !== undefined ? checkClient : "";
            prev.commissionedDate = selectedItem.commissioned_date
                ? selectedItem.commissioned_date
                : "";
            prev.image_loc = selectedItem.image_location;
            prev.new_image = null;
            prev.new_image_file = null;
            prev.datasheet_loc = selectedItem.datasheet;
            prev.new_datasheet = null;
            prev.new_datasheet_file = "";
            prev.new_datasheets_name = new_datasheets_name;
            prev.new_datasheets_file = [];
            prev.removed = [];
            prev.removedFiles = [];
            return { ...prev };
        });
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
            // if (parseInt(value) < 0) {
            //     toast.warning("Invalid input Number of U field.");
            //     value = "";
            // }
        }

        if (name === "category") {
            setInput((prev) => {
                prev.sub_category = "";
                return { ...prev };
            });
        }

        setInput((prev) => {
            prev[name] =
                name === "itemNo" || name === "itemName"
                    ? value.toUpperCase()
                    : value;
            return { ...prev };
        });
    };

    const handleChangePhoto = (file) => {
        let imagePath = "item_files/image/";
        setInput((prev) => {
            prev.new_image = file;
            prev.new_image_file = file.name.replace(/\s/g, "");
            prev.image_loc = null;
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
                    (selectedItem.item_id + "_" + file.name).replace(/\s/g, "")
            );
            if (check === undefined) {
                new_datasheets_file.push(file);
                new_datasheets_name.push(file.name);
            } else {
                toast.error("This file  exist!", {
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

    const checkCategory = (id) => {
        if (id !== undefined) {
            let check = optionsCategories.find(
                (data) => parseInt(data.id) === parseInt(id)
            );
            if (check !== undefined && check.name === "Rack Item") {
                return true;
            } else {
                return false;
            }
        }
    };

    useEffect(() => {
        getCategories();
        getSubCategories();
        getBrands();
        getClients();
    }, []);

    useEffect(() => {
        if (selectedItem !== undefined) {
            let checkSubCategory = optionsSubCategories.find(
                (data) =>
                    parseInt(data.value) ===
                    parseInt(selectedItem.item_sub_category_id)
            );
            let dataSelected = selectedItem;
            dataSelected.itemNo = selectedItem.item_number;
            dataSelected.itemName = selectedItem.item_name;
            dataSelected.category = selectedItem.category_id;
            dataSelected.brand = {
                value: selectedItem.brand_id,
                label: selectedItem.brand_name,
            };
            dataSelected.model = {
                value: selectedItem.model_id,
                label: selectedItem.model_name,
            };
            dataSelected.numberOfU = selectedItem.number_of_u;
            dataSelected.isFull = selectedItem.is_full;
            dataSelected.client = {
                value: selectedItem.client_id,
                label: selectedItem.client_name,
            };
            dataSelected.commissionedDate = selectedItem.commissioned_date
                ? selectedItem.commissioned_date
                : "";
            dataSelected.datasheet_loc = selectedItem.datasheet;
            dataSelected.image_loc = selectedItem.image_location;

            dataSelected.sub_category =
                checkSubCategory !== undefined ? checkSubCategory : "";
            dataSelected.removed = [];
            dataSelected.removedFiles = [];

            setInput(dataSelected);
        }
    }, [selectedItem]);

    useEffect(() => {
        if (input.brand !== undefined) {
            getModels(input.brand.value);
        }
    }, [input.brand]);

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
        if (!isShowing) {
            handleClear();
        }
    }, [isShowing]);

    return (
        <ModalContainer
            width='500px'
            title={title}
            isShowing={isShowing}
            hide={hide}
            submitName={submitName}
            onSubmit={editItem}
            formId={"editItem"}
            clearName={clearName}
            onClear={() => handleClear()}
            isLoading={loadingButton}
            showRequired={true}
            children={
                <div className='Edit-item-modal'>
                    <LoadingUploadFile percentage={progressBarUpload} />
                    <form
                        id='editItem'
                        className='edit-item-form'
                        onSubmit={editItem}>
                        <div className='left-side'>
                            <InputTextVertical
                                label='Item Number'
                                name='itemNo'
                                value={input.itemNo}
                                onChange={handleChange}
                                isRequired={true}
                                isDisabled={true}
                            />
                            <InputTextVertical
                                label='Item Name'
                                name='itemName'
                                value={input.itemName}
                                onChange={handleChange}
                                isRequired={true}
                                isDisabled={input.itemName === "---"}
                            />
                            <InputDropdownVertical
                                label='Category'
                                name='category'
                                value={input.category}
                                onChange={handleChange}
                                options={
                                    input.category === "---"
                                        ? ["---"]
                                        : optionsCategories
                                }
                                isRequired={true}
                                noEmptyOption={input.category === "---"}
                                isLoading={isLoading.category}
                            />
                            {checkCategory(input.category) ? (
                                <InputDropdownCreatableVertical
                                    label='Sub Category'
                                    name='sub_category'
                                    value={input.sub_category}
                                    isLoading={isLoading.sub_category}
                                    options={optionsSubCategories}
                                    onChange={handleChange}
                                    isRequired={true}
                                    onSelect={(e) => {
                                        setInput((prev) => {
                                            return {
                                                ...prev,
                                                sub_category: e,
                                            };
                                        });
                                    }}
                                    onCreateOption={(e) => {
                                        let regex = /^\s*$/;
                                        if (!regex.test(e)) {
                                            addSubCategory(e);
                                        } else {
                                            toast.error("Invalid value!", {
                                                toastId:
                                                    "invalid-value-add-sub-category",
                                            });
                                            return;
                                        }
                                    }}
                                    onDeleteOption={(e) => {
                                        delSubCategory(e.value);
                                    }}
                                />
                            ) : (
                                ""
                            )}
                            <InputDropdownCreatableVertical
                                label='Brand'
                                name='brand'
                                value={input.brand}
                                options={optionsBrands}
                                onChange={handleChange}
                                isRequired={true}
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
                                            toastId: "invalid-value-add-brand",
                                        });
                                        return;
                                    }
                                }}
                                onDeleteOption={(e) => {
                                    delBrand(e.value);
                                }}
                                isLoading={isLoading.brand}
                            />
                            <InputDropdownCreatableVertical
                                label='Model Number'
                                name='model'
                                value={input.model}
                                options={optionsModels}
                                onChange={handleChange}
                                isRequired={true}
                                isDisabled={isDisabled || input.brand === ""}
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
                                            toastId: "invalid-value-add-model",
                                        });
                                        return;
                                    }
                                }}
                                onDeleteOption={(e) => {
                                    delModel(e.value);
                                }}
                                isLoading={isLoading.model}
                            />
                            <div className='flex-row'>
                                <InputTextVertical
                                    label='Number of U(s)'
                                    name='numberOfU'
                                    value={input.numberOfU}
                                    onChange={handleChange}
                                    isRequired={true}
                                    isDisabled={input.numberOfU === "---"}
                                />
                                <InputDropdownVertical
                                    labelWidth='50px'
                                    inputWidth='200px'
                                    name='isFull'
                                    label='Half / Full'
                                    value={input.isFull}
                                    options={dropdownOptions}
                                    onChange={handleChange}
                                    isRequired={true}
                                />
                            </div>
                            <InputDropdownCreatableVertical
                                label='Client'
                                name='client'
                                value={input.client}
                                onChange={handleChange}
                                isRequired={true}
                                options={optionsClients}
                                onSelect={(e) => {
                                    setInput((prev) => {
                                        return {
                                            ...prev,
                                            client: e,
                                        };
                                    });
                                }}
                                onCreateOption={(e) => {
                                    let regex = /^\s*$/;
                                    if (!regex.test(e)) {
                                        addClient(e);
                                    } else {
                                        toast.error("Invalid value!", {
                                            toastId: "invalid-value-add-client",
                                        });
                                        return;
                                    }
                                }}
                                onDeleteOption={(e) => {
                                    delClient(e.value);
                                }}
                                isLoading={isLoading.client}
                            />
                        </div>
                        <div className='right-side'>
                            <InputDateVertical
                                width='170px'
                                label='Commissioned Date'
                                name='commissionedDate'
                                value={input.commissionedDate}
                                isDisabled={input.commissionedDate === "---"}
                                onChange={handleChange}
                                clearData={() => {
                                    setInput((prev) => {
                                        return {
                                            ...prev,
                                            commissionedDate:
                                                selectedItem.commissioned_date
                                                    ? selectedItem.commissioned_date
                                                    : "",
                                        };
                                    });
                                }}
                            />
                            <UploadPhoto
                                height='270px'
                                width='260px'
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
                                                                                  fl !==
                                                                                  null
                                                                                      ? fl.split(
                                                                                            "/"
                                                                                        )[6] ===
                                                                                        ds
                                                                                      : undefined
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
                                                                  removeFile(i)
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

export default EditItemModal;
