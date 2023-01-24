import React, { useState, useEffect } from "react";
import {
    InputTextVertical,
    InputDropdownVertical,
    InputDateVertical,
    UploadPhoto,
    ModalContainer,
    InputTextAutoSuggestVertical,
    InputDropdownCreatableVertical,
    useModal,
    LoadingUploadFile,
} from "../../../ComponentReuseable/index";
import DatasheetModal from "../../Datasheet/DatasheetModal";
import xMark from "../../../../svg/delete-file-icon.svg";
import axios from "axios";
import { getToken } from "../../../TokenParse/TokenParse";
import "./AddItem.style.scss";
import { toast } from "react-toastify";
import { isCompositeComponentWithType } from "react-dom/test-utils";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";

const AddItemModal = (props) => {
    const {
        title,
        submitName,
        clearName,
        isShowing,
        hide,
        getItems,
        allItems,
    } = props;

    const [progressBarUpload, setProgressBarUpload] = useState();
    const [isDisabled, setIsDisabled] = useState(true);
    const [datasheetPreview, setDatasheetPreview] = useState(null);
    const dropdownOptions = ["Half", "Full"];
    const [loadingButton, setLoadingButton] = useState(false);
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
    const [item, setItem] = useState({
        item_number: "",
        item_name: "",
        category: "",
        sub_category: "",
        brand: "",
        model: "",
        number_of_u: "",
        is_full: "",
        client: "",
        commissioned_date: "",
        image: null,
        filename: "",
        file: null,
        datasheet: [],
    });
    const { isShowing: isShowingDatasheetModal, toggle: datasheetModal } =
        useModal();

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
                setItem((prev) => {
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
            setItem((prev) => {
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
            setItem((prev) => {
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
            setItem((prev) => {
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
            setItem((prev) => {
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

    const getModels = async (brand) => {
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
                setItem((prev) => {
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
                toastId: "failed-get-models",
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
            setItem((prev) => {
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
            getModels(item.brand.value);
            setItem((prev) => {
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
            data: { client_name: client_name },
        };
        try {
            const result = await axios(config);
            toast.success("Success to add client", {
                toastId: "success-add-client",
            });
            getClients();
            setItem((prev) => {
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
            setItem((prev) => {
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

    const addItem = async (e) => {
        e.preventDefault();
        setLoadingButton(true);

        if (item.brand === "") {
            setLoadingButton(false);
            toast.error(`Please fill out the brand field.`, {
                toastId: "empty-value-brand",
            });
            return;
        }
        if (item.model === "") {
            setLoadingButton(false);
            toast.error(`Please fill out the model number field.`, {
                toastId: "empty-value-model",
            });
            return;
        }
        if (item.client === "") {
            setLoadingButton(false);
            toast.error(`Please fill out the client field.`, {
                toastId: "empty-value-client",
            });
            return;
        }
        if (item.sub_category === "" && checkCategory(item.category)) {
            setLoadingButton(false);
            toast.error(`Please fill out the sub category field.`, {
                toastId: "empty-value-sub-category",
            });
            return;
        }

        let imagePath =
            "/filerepository/dcim/uploadFileFromAPI/item_files/images/";

        let datasheet_path = [];
        item.datasheet.map((ds, i) =>
            datasheet_path.push(
                ds.name.split(".")[0].replace(/\s/g, "") +
                    "." +
                    ds.name.split(".")[1]
            )
        );

        const formData = new FormData();

        formData.append("item_number", item.item_number);
        formData.append("item_name", item.item_name);
        formData.append("model_id", item.model.value);
        formData.append("client_id", item.client.value);
        formData.append("item_category_id", item.category);
        formData.append(
            "item_sub_category_id",
            item.sub_category !== "" ? item.sub_category.value : ""
        );
        formData.append("number_of_u", item.number_of_u);
        formData.append("is_full", item.is_full);
        formData.append("item_commissioned_date", item.commissioned_date);
        formData.append(
            "image_location",
            item.image
                ? imagePath +
                      item.item_number.replace(/\s/g, "") +
                      "_" +
                      item.image.name.replace(/\s/g, "")
                : ""
        );
        formData.append("datasheet", JSON.stringify(datasheet_path));
        formData.append("type", "item");

        let config1 = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_ITEM_ADD_ITEM,
            headers: {
                authorization: getToken(),
            },
            data: formData,
        };
        try {
            const result1 = await axios(config1);
            if (result1.data.status.startsWith("Success")) {
                if (item.datasheet.length !== 0 || item.image) {
                    await uploadFile(result1.data.id);
                }
                toast.success(result1.data.status, {
                    toastId: "success-add-item",
                });
                setProgressBarUpload(0);
                hide();
                await getItems();
            } else {
                toast.error(result1.data.status, {
                    toastId: "error-add-item",
                });
                setProgressBarUpload(0);
            }
            setLoadingButton(false);
        } catch (e) {
            // console.error(e);
            toast.error("Failed to add item", {
                toastId: "failed-add-item",
            });
            setLoadingButton(false);
            setProgressBarUpload(0);
        }
    };

    const uploadFile = async (id) => {
        let datasheetPath = "item_files/datasheets/";
        let imagePath = "item_files/images/";

        let file = [];
        let pathFile = [];
        if (item.datasheet.length !== 0) {
            item.datasheet.map((ds) =>
                pathFile.push(
                    datasheetPath +
                        id +
                        "_" +
                        ds.name.split(".")[0].replace(/\s/g, "") +
                        "." +
                        ds.name.split(".")[1]
                )
            );
            item.datasheet.map((ds) => file.push(ds));
        }

        if (item.image) {
            file.push(item.image);

            pathFile.push(
                imagePath +
                    item.item_number.replace(/\s/g, "") +
                    "_" +
                    item.image.name.replace(/\s/g, "")
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

    const handleChangePhoto = (file) => {
        setItem((prev) => {
            prev.image = file;
            return { ...prev };
        });
    };

    const handleChangeFile = (e) => {
        const { files } = e.target;
        const file = files[0];
        let datasheets = item.datasheet;
        if (file !== undefined) {
            datasheets.push(file);
        }

        setItem((prev) => {
            prev.datasheet = datasheets;
            return { ...prev };
        });
    };

    const handleClear = () => {
        setItem((prev) => {
            prev.item_number = "";
            prev.item_name = "";
            prev.category = "";
            prev.sub_category = "";
            prev.brand = "";
            prev.model = "";
            prev.number_of_u = "";
            prev.is_full = "";
            prev.client = "";
            prev.image = null;
            prev.file = null;
            prev.filename = null;
            prev.commissioned_date = "";
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
                    toastId: "invalid-input-numberOfU",
                });
                value = "";
            }
        }

        if (name === "category") {
            setItem((prev) => {
                prev.sub_category = "";
                return { ...prev };
            });
        }

        setItem((prev) => {
            prev[name] =
                name === "item_number" || name === "item_name"
                    ? value.toUpperCase()
                    : value;
            return { ...prev };
        });
    };

    const removeFile = (i) => {
        const data = item.datasheet;
        data.splice(i, 1);

        setItem((prev) => {
            prev.datasheet = data;
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
        getBrands();
        getCategories();
        getClients();
        getSubCategories();
    }, []);

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
            onSubmit={addItem}
            formId={"addItem"}
            clearName={clearName}
            onClear={handleClear}
            isLoading={loadingButton}
            showRequired={true}
            children={
                <div className='Add-item-modal'>
                    <LoadingUploadFile percentage={progressBarUpload} />
                    <form
                        id='addItem'
                        className='add-item-form'
                        onSubmit={addItem}>
                        <div className='left-side'>
                            <InputTextVertical
                                label='Item Number'
                                name='item_number'
                                value={item.item_number}
                                onChange={handleChange}
                                isRequired={true}
                            />
                            <InputTextVertical
                                label='Item Name'
                                name='item_name'
                                value={item.item_name}
                                onChange={handleChange}
                                isRequired={true}
                            />
                            <InputDropdownVertical
                                label='Category'
                                name='category'
                                value={item.category}
                                options={optionsCategories}
                                onChange={handleChange}
                                isRequired={true}
                                isLoading={isLoading.category}
                            />
                            {checkCategory(item.category) ? (
                                <InputDropdownCreatableVertical
                                    label='Sub Category'
                                    name='sub_category'
                                    value={item.sub_category}
                                    isLoading={isLoading.sub_category}
                                    options={optionsSubCategories}
                                    onChange={handleChange}
                                    isRequired={true}
                                    onSelect={(e) => {
                                        setItem((prev) => {
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
                                value={item.brand}
                                isLoading={isLoading.brand}
                                options={optionsBrands}
                                onChange={handleChange}
                                isRequired={true}
                                onSelect={(e) => {
                                    setItem((prev) => {
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
                            />
                            <InputDropdownCreatableVertical
                                label='Model Number'
                                name='model'
                                value={item.model}
                                options={optionsModels}
                                onChange={handleChange}
                                isRequired={true}
                                isDisabled={isDisabled || item.brand === ""}
                                onSelect={(e) => {
                                    setItem((prev) => {
                                        return {
                                            ...prev,
                                            model: e,
                                        };
                                    });
                                }}
                                onCreateOption={(e) => {
                                    let regex = /^\s*$/;
                                    if (!regex.test(e)) {
                                        addModel(e, item.brand.value);
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
                                isLoading={isLoading.model || isLoading.brand}
                            />
                            <div className='flex-row'>
                                <InputTextVertical
                                    label='Number of U(s)'
                                    name='number_of_u'
                                    value={item.number_of_u}
                                    onChange={handleChange}
                                    isRequired={true}
                                />
                                <InputDropdownVertical
                                    labelWidth='50px'
                                    inputWidth='200px'
                                    name='is_full'
                                    label='Half / Full'
                                    value={item.is_full}
                                    onChange={handleChange}
                                    isRequired={true}
                                    options={dropdownOptions}
                                />
                            </div>
                            <InputDropdownCreatableVertical
                                label='Client'
                                name='client'
                                value={item.client}
                                onChange={handleChange}
                                isRequired={true}
                                options={optionsClients}
                                onSelect={(e) => {
                                    setItem((prev) => {
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
                                name='commissioned_date'
                                value={item.commissioned_date}
                                onChange={handleChange}
                                clearData={() => {
                                    setItem((prev) => {
                                        return {
                                            ...prev,
                                            commissioned_date: "",
                                        };
                                    });
                                }}
                            />
                            <UploadPhoto
                                height='240px'
                                width='260px'
                                defaultImage={item.image}
                                onUpload={(photoFile) => {
                                    handleChangePhoto(photoFile);
                                }}
                                triggerClear={item.image}
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
                                    {item.datasheet.map((ds, i) => (
                                        <div className='file'>
                                            <span
                                                className='file'
                                                onClick={() => {
                                                    setDatasheetPreview([ds]);
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
                                                onClick={() => removeFile(i)}
                                            />
                                        </div>
                                    ))}
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
                </div>
            }
        />
    );
};

export default AddItemModal;
