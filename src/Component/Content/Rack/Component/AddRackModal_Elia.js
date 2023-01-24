import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
    InputTextVertical,
    InputDateVertical,
    UploadPhoto,
    ModalContainer,
    InputTextPairVertical,
    InputTextAutoSuggestVertical,
    ButtonClear,
    ButtonSubmit,
    InputDropdownHorizontal,
    useModal,
    InputDropdownVertical,
    InputDropdownCreatableVertical,
    InputTextAutoSuggestHorizontal,
    LoadingData,
} from "../../../ComponentReuseable/index";
import xMark from "../../../../svg/delete-file-icon.svg";
import "./AddRack.style.scss";

import AddAccessModal from "./AddAccessModal";
import { getToken } from "../../../TokenParse/TokenParse";
import UploadFile from "../../Asset/Component/AssetUploadFile";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";

const AddRackModal = (props) => {
    const today = new Date(
        new Date().getTime() - new Date().getTimezoneOffset() * 60000
    )
        .toISOString()
        .slice(0, 10);
    const {
        title,
        submitName,
        clearName,
        isShowing,
        hide,
        onSubmit,
        onClear,
        getRacks,
    } = props;

    const [isDisabled, setIsDisabled] = useState(true);

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
        commissioned_date: today,
        image: "",
        filename: "",
        file: "",
        power_source_a: "",
        power_source_b: "",
    });

    const [loadingButton, setLoadingButton] = useState(false);
    const [optionsBrands, setOptionsBrands] = useState([]);
    const [optionsModels, setOptionsModels] = useState([]);
    const [optionsClients, setOptionsClients] = useState([]);
    const [optionsFloors, setOptionsFloors] = useState([]);
    const [optionsRooms, setOptionsRooms] = useState([]);

    const { isShowing: isShowingAddAccessModal, toggle: addAccessModal } =
        useModal();
    const [optionsPowerSourceA, setOptionsPowerSourceA] = useState([]);
    const [optionsPowerSourceB, setOptionsPowerSourceB] = useState([]);

    const getBrands = async () => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend("https://192.168.7.121:2222") +
                "/api/jdbc/dcim/dcim_admin/dcim_db/rack/getBrand",
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
        } catch (e) {
            // console.error(e);
        }
    };

    const getModels = async (brand) => {
        setIsDisabled(true);
        let config = {
            method: "POST",
            url:
                ReturnHostBackend("https://192.168.7.121:2222/api") +
                "/jdbc/dcim/dcim_admin/dcim_db/rack/getModels",
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
            setIsDisabled(false);
        } catch (e) {
            // console.error(e);
        }
    };

    const getFloors = async () => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend("https://192.168.7.121:2222/api") +
                "/jdbc/dcim/dcim_admin/nodelinx_db/rack/getFloor",
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
        } catch (e) {
            // console.error(e);
        }
    };

    const getRooms = async (floor) => {
        setIsDisabled(true);
        let config = {
            method: "POST",
            url:
                ReturnHostBackend("https://192.168.7.121:2222/api") +
                "/jdbc/dcim/dcim_admin/nodelinx_db/rack/getRoom",
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
            setIsDisabled(false);
        } catch (e) {
            // console.error(e);
        }
    };

    const getPowerSource = async () => {
        let configA = {
            method: "POST",
            url:
                ReturnHostBackend("https://192.168.7.121:2222/api") +
                "/jdbc/dcim/dcim_admin/dcim_db/rack/getPowerSource",
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
                ReturnHostBackend("https://192.168.7.121:2222/api") +
                "/jdbc/dcim/dcim_admin/dcim_db/rack/getPowerSource",
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
            }

            if (dataB.length !== 0) {
                setOptionsPowerSourceB(dataB);
            } else {
                setOptionsPowerSourceB([]);
            }
        } catch (e) {
            // console.error(e);
        }
    };

    const addRack = async (e) => {
        e.preventDefault();
        setLoadingButton(true);
        if (
            rack.rack_number === "" ||
            rack.floor_name === "" ||
            rack.room_name === "" ||
            rack.first_area === "" ||
            rack.second_area === "" ||
            rack.brand === "" ||
            rack.model === "" ||
            rack.number_of_u === "" ||
            rack.access_id.length === 0 ||
            rack.access_name.length === 0 ||
            rack.commissioned_date === "" ||
            rack.image === "" ||
            rack.image === null ||
            rack.file === "" ||
            rack.file === null ||
            rack.power_source_a === "" ||
            rack.power_source_b === ""
        ) {
            setLoadingButton(false);
            toast.error(`Empty Input! \n Please fill in the information.`);
            return;
        }
        // Area Input Validation
        const valRegex = /^[A-Z]+[0-9]+$/;
        const checkNumber = /^\d+$/;
        let A1 = parseInt(rack.first_area.slice(1));
        let A2 = parseInt(rack.second_area.slice(1));

        // Check for empty area input
        if (rack.first_area === "" && rack.second_area === "") {
            toast.error(
                "Please fill the area information in the first column."
            );
            return;
        } else if (!valRegex.test(rack.first_area)) {
            toast.error("Invalid Input Area1.");
            return;
        } else if (!valRegex.test(rack.second_area)) {
            toast.error("Invalid Input Area2.");
            return;
        }

        // Input Area1 and Area2 comparison
        if (A1 > A2 || A1 === A2) {
            toast.error(
                "Invalid Input Area2 must be greater than Input Area1."
            );
            return;
        }

        if (!checkNumber.test(rack.number_of_u)) {
            toast.error("Invalid input Number of U field.");
            return;
        }

        let imagePath = "rack_files/image/";
        let datasheetPath = "rack_files/datasheet/";
        const formData = new FormData();
        formData.append("brand_id", rack.brand.value);
        formData.append("model_id", rack.model.value);
        formData.append("rack_number", rack.rack_number);
        formData.append("room_name", rack.room_name);
        formData.append("area_name", rack.first_area + "," + rack.second_area);
        formData.append("rack_commissioned_date", rack.commissioned_date);
        formData.append(
            "image_location",
            imagePath +
                rack.rack_number.replace(/\s/g, "") +
                "_image_." +
                rack.image.name.split(".")[1]
        );
        formData.append("image_file", rack.image);
        formData.append("number_of_u", rack.number_of_u);
        formData.append("power_source_a", rack.power_source_a);
        formData.append("power_source_b", rack.power_source_b);
        formData.append("floor_name", rack.floor_name);
        formData.append(
            "data_sheet_location",
            datasheetPath +
                rack.rack_number.replace(/\s/g, "") +
                "_datasheet_." +
                rack.file.name.split(".")[1]
        );
        formData.append("datasheet_file", rack.file);
        formData.append("rack_access", JSON.stringify(rack.access_id));

        let config = {
            method: "POST",
            url:
                ReturnHostBackend("https://192.168.7.121:1112/api") +
                "/jsexec/dcim/dcim_admin/rack/addRacks",
            headers: {
                authorization: getToken(),
            },
            data: formData,
        };
        try {
            const result = await axios(config);
            if (result.data.startsWith("Success")) {
                toast.success(result.data, {
                    toastId: "success-submit",
                });
                getRacks();
                hide();
            } else {
                toast.error(result.data, {
                    toastId: "error-submit",
                });
            }
            setLoadingButton(false);
        } catch (e) {
            setLoadingButton(false);
            // console.error(e);
            toast.error("Submission Failed: " + e.message, {
                toastId: "error-submit",
            });
        }
    };

    const addBrand = async (brand_name) => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend("https://192.168.7.121:2222/api") +
                "/jdbc/dcim/dcim_admin/dcim_db/rackAndServerManagement/addBrand",
            headers: {
                authorization: getToken(),
            },
            data: { brand_name: brand_name, type: "rack" },
        };
        try {
            const result = await axios(config);
            toast.success("Success Add Brand", {
                toastId: "success-submit",
            });
            getBrands();
            getModels();
        } catch (e) {
            // console.error(e);
            toast.error("Submission Failed: " + e.message, {
                toastId: "error-submit",
            });
        }
    };

    const delBrand = async (brand_id) => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend("https://192.168.7.121:2222/api") +
                "/jdbc/dcim/dcim_admin/dcim_db/rackAndServerManagement/deleteBrand",
            headers: {
                authorization: getToken(),
            },
            data: { brand_id: brand_id },
        };
        try {
            const result = await axios(config);
            toast.success("Success Delete Brand", {
                toastId: "success-submit",
            });
            getBrands();
        } catch (e) {
            // console.error(e);
            toast.error("Submission Failed: " + e.message, {
                toastId: "error-submit",
            });
        }
    };

    const addModel = async (model_name, brand_id) => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend("https://192.168.7.121:2222/api/") +
                "jdbc/dcim/dcim_admin/dcim_db/rackAndServerManagement/addModel",
            headers: {
                authorization: getToken(),
            },
            data: { model_name: model_name, type: "rack", brand_id: brand_id },
        };
        try {
            const result = await axios(config);
            toast.success("Success Add Model", {
                toastId: "success-submit",
            });
            getModels();
        } catch (e) {
            // console.error(e);
            toast.error("Submission Failed: " + e.message, {
                toastId: "error-submit",
            });
        }
    };

    const delModel = async (model_id) => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend("https://192.168.7.121:2222/api") +
                "/jdbc/dcim/dcim_admin/dcim_db/rackAndServerManagement/deleteModel",
            headers: {
                authorization: getToken(),
            },
            data: { model_id: model_id },
        };
        try {
            const result = await axios(config);
            toast.success("Success Delete Model", {
                toastId: "success-submit",
            });
            getModels();
        } catch (e) {
            // console.error(e);
            toast.error("Submission Failed: " + e.message, {
                toastId: "error-submit",
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
            prev.access_id = [];
            prev.access_name = [];
            prev.commissioned_date = today;
            prev.image = "";
            prev.file = "";
            prev.filename = "";
            prev.power_source_a = "";
            prev.power_source_b = "";
            return { ...prev };
        });
    };

    const handleChange = (e) => {
        let { name, value } = e.target;
        const checkNumber = /^\d+$/;

        if (name === "number_of_u") {
            if (!checkNumber.test(value)) {
                toast.error("Invalid input Number of U field.");
                value = "";
            }
            if (parseInt(value) <= 0) {
                toast.error("Value must be more than 0");
                value = "";
            }
        }
        if (name === "floor_name") {
            getRooms(value);
        }
        setRack((prev) => {
            prev[name] =
                name === "first_area" ||
                name === "second_area" ||
                name === "rack_number"
                    ? value.toUpperCase()
                    : value;
            prev.room_name = prev.floor_name === "" ? "" : prev.room_name;
            return { ...prev };
        });
    };

    const handleChangePhoto = (file) => {
        setRack((prev) => {
            prev.image = file;
            return { ...prev };
        });
    };

    const handleChangeFile = (e) => {
        const { files } = e.target;
        const file = files[0];

        setRack((prev) => {
            prev.filename = file.name.replace(/\s/g, "");
            prev.file = file;
            return { ...prev };
        });
    };

    const removeFile = () => {
        setRack((prev) => {
            prev.filename = "";
            prev.file = null;
            return { ...prev };
        });
    };

    const deleteAccess = (i) => {
        let delAccess_id = rack.access_id;
        let delAccess_name = rack.access_name;

        delAccess_id.splice(i, 1);
        delAccess_name.splice(i, 1);
        setRack((prev) => ({
            ...prev,
            access_id: delAccess_id,
            access_name: delAccess_name,
        }));
    };

    useEffect(() => {
        getPowerSource();
        getBrands();
        getFloors();
    }, []);

    return (
        <ModalContainer
            width='550px'
            title={title}
            isShowing={isShowing}
            hide={hide}
            submitName={submitName}
            onSubmit={addRack}
            formId={"addRack"}
            clearName={clearName}
            onClear={handleClear}
            isLoading={loadingButton}
            children={
                <div className='Add-rack-modal'>
                    <form
                        id='addRack'
                        className='add-rack-form'
                        onSubmit={addRack}>
                        <div className='left-side'>
                            <InputTextVertical
                                label='Rack Number'
                                name='rack_number'
                                value={rack.rack_number}
                                onChange={handleChange}
                                validateInput={true}
                            />
                            <div className='flex-row'>
                                <InputDropdownVertical
                                    label='Floor'
                                    name='floor_name'
                                    value={rack.floor_name}
                                    options={optionsFloors}
                                    onChange={handleChange}
                                />
                                <InputDropdownVertical
                                    label='Room'
                                    name='room_name'
                                    value={rack.room_name}
                                    onChange={handleChange}
                                    options={optionsRooms}
                                    isDisabled={
                                        isDisabled || rack.floor_name === ""
                                    }
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
                                />
                            </div>
                            <InputDropdownCreatableVertical
                                label='Brand'
                                name='brand'
                                value={rack.brand}
                                isLoading={true}
                                options={optionsBrands}
                                onChange={handleChange}
                                onSelect={(e) => {
                                    setRack((prev) => {
                                        return {
                                            ...prev,
                                            brand: e,
                                        };
                                    });
                                    getModels(e.value);
                                }}
                                onCreateOption={(e) => {
                                    addBrand(e);
                                }}
                                onDeleteOption={(e) => {
                                    delBrand(e.value);
                                }}
                                isLoading={false}
                            />
                            <InputDropdownCreatableVertical
                                label='Model Number'
                                name='model'
                                value={rack.model}
                                options={optionsModels}
                                onChange={handleChange}
                                isDisabled={isDisabled}
                                onSelect={(e) => {
                                    setRack((prev) => {
                                        return {
                                            ...prev,
                                            model: e,
                                        };
                                    });
                                }}
                                onCreateOption={(e) => {
                                    addModel(e, rack.brand);
                                }}
                                onDeleteOption={(e) => {
                                    delModel(e.value);
                                }}
                                isLoading={false}
                            />
                            <InputTextVertical
                                label='Number of U'
                                name='number_of_u'
                                value={rack.number_of_u}
                                onChange={handleChange}
                            />
                            <div className='flex-column'>
                                <span>Access</span>
                                <div className='access'>
                                    {rack.access_name.map((x, i) => {
                                        return (
                                            <div className='flex-row'>
                                                <div className='access-input'>
                                                    {x.type === "1" ? (
                                                        <span>
                                                            {`Access
                                                                Key
                                                                ${x.no}`}
                                                        </span>
                                                    ) : (
                                                        <span>{`Access
                                                        Card
                                                        ${x.no}`}</span>
                                                    )}
                                                    <input
                                                        type='text'
                                                        disabled
                                                        value={x.name}
                                                    />
                                                </div>
                                                <img
                                                    className='xMark'
                                                    src={xMark}
                                                    style={{
                                                        background: "none",
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
                            <InputDateVertical
                                width='170px'
                                label='Commissioned Date'
                                name='commissioned_date'
                                value={rack.commissioned_date}
                                onChange={handleChange}
                            />
                            <UploadPhoto
                                height='240px'
                                width='260px'
                                onUpload={(photoFile) => {
                                    handleChangePhoto(photoFile);
                                }}
                            />
                            <div className='flex-column'>
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
                                        style={{ width: "120px" }}
                                        className='reusable-upload-photo__label reusable-button reusable-button--upload-photo'
                                        htmlFor='uploadedFile'>
                                        Upload File
                                    </label>
                                    {rack.file ? (
                                        <div className='flex-row'>
                                            <div className='file'>
                                                <span className='file'>
                                                    {rack.filename}
                                                </span>
                                                <img
                                                    className='xMark'
                                                    src={xMark}
                                                    style={{
                                                        background: "none",
                                                    }}
                                                    onClick={removeFile}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        ""
                                    )}
                                </div>
                            </div>
                            <div className='flex-column'>
                                <span>Power Source</span>
                                <div className='powerSource'>
                                    <InputTextAutoSuggestHorizontal
                                        labelWidth='130px'
                                        inputWidth='120px'
                                        width='110px'
                                        label='Power Source A:'
                                        name='power_source_a'
                                        value={rack.power_source_a}
                                        options={optionsPowerSourceA}
                                        onChange={handleChange}
                                        validateInput={(e) => {
                                            let { value } = e.target;
                                            optionsPowerSourceA.map((a) => {
                                                if (value !== a.name) {
                                                    value = "";
                                                    toast.error(
                                                        "Invalid input Power Source A"
                                                    );
                                                    setRack((prev) => {
                                                        return {
                                                            ...prev,
                                                            power_source_a: "",
                                                        };
                                                    });
                                                }
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                            <div className='powerSource'>
                                <InputTextAutoSuggestHorizontal
                                    labelWidth='130px'
                                    inputWidth='120px'
                                    width='110px'
                                    label='Power Source B:'
                                    name='power_source_b'
                                    value={rack.power_source_b}
                                    options={optionsPowerSourceB}
                                    onChange={handleChange}
                                    validateInput={(e) => {
                                        let { value } = e.target;
                                        optionsPowerSourceB.map((a) => {
                                            if (value !== a.name) {
                                                value = "";
                                                toast.error(
                                                    "Invalid input Power Source B"
                                                );
                                                setRack((prev) => {
                                                    return {
                                                        ...prev,
                                                        power_source_b: "",
                                                    };
                                                });
                                            }
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    </form>
                    <AddAccessModal
                        title={"Add Access"}
                        isShowing={isShowingAddAccessModal}
                        setRack={setRack}
                        state={rack}
                        hide={addAccessModal}
                        submitName={"Add"}
                        onSubmit={() => {
                            addAccessModal();
                        }}
                        clearName={"Clear"}
                        onClear={() => {
                            addAccessModal();
                        }}
                        rackNo={rack.rack_number}
                    />
                </div>
            }
        />
    );
};

export default AddRackModal;
