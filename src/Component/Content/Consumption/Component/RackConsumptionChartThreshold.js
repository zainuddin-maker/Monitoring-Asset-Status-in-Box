import React, { useEffect, useState } from "react";
import loadingButton from "../../../../gif/loading_button.gif";
import {
    ModalContainer,
    TableDCIM,
    useModal,
    InputDropdownHorizontal,
    LoadingData,
    Tooltip,
} from "../../../ComponentReuseable/index";

import editIcon from "../../../../svg/edit_pencil.svg";
import { getToken } from "../../../TokenParse/TokenParse";
import axios from "axios";
import { toast } from "react-toastify";

import { ReturnHostBackend } from "../../../BackendHost/BackendHost";

const RackConsumptionChartThreshold = ({
    isShowing,
    hide,
    menu,
    subMenu,
    rackId,
    generateOverview,
}) => {
    const dummyDataTotal = {
        chart_id: "default",
        name: "Total",
        asset_number: "",
        tag_name: `${subMenu}`.toLowerCase(),
        warning_overview: "Default",
        warning_comparison: null,
        warning_threshold: null,
        second_warning_threshold: null,
        critical_overview: "Default",
        critical_comparison: null,
        critical_threshold: null,
        second_critical_threshold: null,
        is_connect: true,
    };
    const [loadingTable, setLoadingTable] = useState(false);
    const [required, setRequired] = useState({
        warning: false,
        second_warning: false,
        critical: false,
        second_critical: false,
    });
    const { isShowing: isShowingEdit, toggle: toggleEdit } = useModal();
    const [tableBody, setTableBody] = useState([]);
    const [selectedTag, setSelectedTag] = useState();
    const [inputVal, setInputVal] = useState({
        name: "",
        chart_id: "",
        asset_number: "",
        tag_name: "",
        warning_threshold: "",
        critical_threshold: "",
        unit: "",
        warning_comparison: "",
        critical_comparison: "",
        second_warning_threshold: "",
        second_critical_threshold: "",
        is_connect: false,
    });
    const [loading, setLoading] = useState(false);
    const [comparisons, setComparisons] = useState([
        {
            id: "LOWER_THAN",
            name: "Lower Than",
        },
        {
            id: "LOWER_THAN_EQUAL",
            name: "Lower Than Equal",
        },
        {
            id: "HIGHER_THAN",
            name: "Higher Than",
        },
        {
            id: "HIGHER_THAN_EQUAL",
            name: "Higher Than Equal",
        },
        {
            id: "HIGHER_THAN_AND_LOWER",
            name: "Higher Than and Lower Than",
        },
        {
            id: "HIGHER_THAN_EQUAL_AND_LOWER",
            name: "Higher Than Equal and Lower Than",
        },
        {
            id: "HIGHER_THAN_AND_LOWER_EQUAL",
            name: "Higher Than and Lower Than Equal",
        },
        {
            id: "HIGHER_THAN_EQUAL_AND_LOWER_EQUAL",
            name: "Higher Than Equal and Lower Than Equal",
        },
        {
            id: "BETWEEN",
            name: "Between",
        },
    ]);

    const handleSelectRow = (selected) => {
        setSelectedTag(selected);
    };
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (parseInt(value) >= 0 || parseInt(value) < 0) {
            if (name === "second_warning") {
                if (parseInt(value) >= parseInt(inputVal.warning_threshold)) {
                    toast.warning(
                        "Second Warning Must Lower Than First Warning",
                        {
                            toastId: "error-limit",
                        }
                    );
                } else {
                    setInputVal((prev) => {
                        prev[name] = value;
                        return { ...prev };
                    });
                }
            } else if (name === "second_critical") {
                if (parseInt(value) >= parseInt(inputVal.critical_threshold)) {
                    toast.warning(
                        "Second Critical Must Lower Than First Critical",
                        {
                            toastId: "error-limit",
                        }
                    );
                } else {
                    setInputVal((prev) => {
                        prev[name] = value;
                        return { ...prev };
                    });
                }
            } else {
                setInputVal((prev) => {
                    prev[name] = value;
                    return { ...prev };
                });
            }
        } else {
            if (
                value &&
                name !== "critical_comparison" &&
                name !== "warning_comparison"
            ) {
                toast.warning("Value must be positive", {
                    toastId: "error-limit",
                });
            } else {
                if (name === "critical_comparison") {
                    setInputVal((prev) => {
                        prev[name] = value;
                        prev.critical_threshold = "";
                        prev.second_critical_threshold = "";
                        return { ...prev };
                    });
                } else if (name === "warning_comparison") {
                    setInputVal((prev) => {
                        prev[name] = value;
                        prev.warning_threshold = "";
                        prev.second_warning_threshold = "";
                        return { ...prev };
                    });
                } else {
                    setInputVal((prev) => {
                        prev[name] = value;
                        return { ...prev };
                    });
                }
            }
        }
    };
    const handleClear = () => {
        setInputVal((prev) => {
            prev.critical_threshold = "";
            prev.warning_threshold = "";
            prev.critical_comparison = "";
            prev.second_critical_threshold = "";
            prev.warning_comparison = "";
            prev.second_warning_threshold = "";
            return { ...prev };
        });
    };
    const resetValue = (val) => {
        if (val === 0) {
            return 0;
        } else if (val) {
            return val;
        } else {
            return "";
        }
    };
    const handleClearEdit = () => {
        setInputVal((prev) => {
            prev.critical_threshold = resetValue(
                selectedTag.critical_threshold
            );
            prev.warning_threshold = resetValue(selectedTag.warning_threshold);
            prev.critical_comparison = resetValue(
                selectedTag.critical_comparison
            );
            prev.second_critical_threshold = resetValue(
                selectedTag.second_critical_threshold
            );
            prev.warning_comparison = resetValue(
                selectedTag.warning_comparison
            );
            prev.second_warning_threshold = resetValue(
                selectedTag.second_warning_threshold
            );
            return { ...prev };
        });
    };
    const parseValueOrNull = (value, type) => {
        let returnData = null;
        if (value !== null && value !== undefined && value !== "") {
            returnData = value;
        } else {
            returnData = null;
        }
        if (type === "string" && returnData !== null) {
            return "'" + returnData + "'";
        } else {
            return returnData;
        }
    };
    const handleSubmit = (e, paramType) => {
        e.preventDefault();
        if (validateInputRange(true)) {
            setLoading(true);
            const formData = new FormData();
            formData.append(
                "warning",
                parseValueOrNull(inputVal.warning_threshold)
            );
            formData.append(
                "critical",
                parseValueOrNull(inputVal.critical_threshold)
            );
            formData.append(
                "warning_comparison",
                parseValueOrNull(inputVal.warning_comparison, "string")
            );
            formData.append(
                "critical_comparison",
                parseValueOrNull(inputVal.critical_comparison, "string")
            );
            formData.append(
                "second_warning",
                parseValueOrNull(inputVal.second_warning_threshold)
            );
            formData.append(
                "second_critical",
                parseValueOrNull(inputVal.second_critical_threshold)
            );

            // for total type
            let url =
                process.env.REACT_APP_CONSUMPTION_RACK_UPDATE_THRESHOLD_TOTAL;

            if (paramType !== "total") {
                formData.append(
                    "asset_number",
                    parseValueOrNull(inputVal.asset_number)
                );
                formData.append("chart_id", inputVal.chart_id || "default");
                url =
                    process.env
                        .REACT_APP_CONSUMPTION_RACK_UPDATE_THRESHOLD_RACK;
            } else {
                formData.append(
                    "chart_id",
                    inputVal.chart_id === "default" ? rackId : inputVal.chart_id
                );
                formData.append("tag_name", `${subMenu}`.toLowerCase());
            }

            const config = {
                method: "post",
                url: ReturnHostBackend(process.env.REACT_APP_JDBC) + url,
                data: formData,
                headers: {
                    authorization: getToken(),
                },
            };
            axios(config)
                .then((response) => {
                    if (response.data.data) {
                        toast.success("Chart Configuration Updated", {
                            toastId: "update",
                        });
                    }
                    getAllThreshold(`${subMenu} ${menu}`.toLowerCase(), rackId);
                    toggleEdit();
                    setLoading(false);
                })
                .catch((err) => {
                    // console.log(err);
                    toast.error(
                        "Cannot update chart configutation: " + err.message,
                        { toastId: "update" }
                    );
                    setLoading(false);
                });
        }
    };

    const connectTrigger = (selectedData, index) => {
        console.log(selectedData, index);
        if (index >= 0) {
            setTableBody((prev) => {
                prev[index].is_loading = true;
                return [...prev];
            });
            const formData = new FormData();
            formData.append("trigger_name", selectedData.trigger_name);
            const config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env.REACT_APP_MONITORING_CONNECT,
                data: formData,
                headers: {
                    authorization: getToken(),
                },
            };
            axios(config)
                .then((response) => {
                    if (
                        response.data.message.toLowerCase().includes("success")
                    ) {
                        if (
                            response.data.message ===
                            "Success to disconnect trigger"
                        ) {
                            toast.success("Alerts changed to OFF", {
                                toastId: "alerts-off",
                            });
                        } else if (
                            response.data.message ===
                            "Success to connect trigger"
                        ) {
                            toast.success("Alerts changed to ON", {
                                toastId: "alerts-on",
                            });
                        }
                        setTableBody((prev) => {
                            prev[index].is_connect = !prev[index].is_connect;
                            return [...prev];
                        });
                    } else {
                        toast.error(
                            "Failed to change alert status " +
                                response.data.message,
                            {
                                toastId: "alerts",
                            }
                        );
                    }
                    if (response.data.isShowWarning) {
                        toast.warning(
                            `Active alerts running is: ${response.data.count}.
                            Beware of resources being used`,
                            { toastId: "warning" }
                        );
                    }
                    setTableBody((prev) => {
                        prev[index].is_loading = false;
                        return [...prev];
                    });
                })
                .catch((error) => {
                    console.log(error);
                    setTableBody((prev) => {
                        prev[index].is_loading = false;
                        return [...prev];
                    });
                });
        }
    };

    const tableHeader = {
        name: { width: "150px", name: "Parameter" },
        warning_overview: { width: "150px", name: "Warning Threshold" },
        critical_overview: { width: "150px", name: "Critical Threshold" },
    };

    const actions = [
        {
            src: (props) => {
                // console.log("props", props.data);
                return props.data.trigger_name ||
                    props.data.name.toLowerCase() === "total" ? (
                    <div className='trigger-connect-container'>
                        {props.data.is_loading ? (
                            <img src={loadingButton} alt='loading-button' />
                        ) : (
                            <Tooltip
                                tooltip={
                                    <div
                                        style={{
                                            color: "white",
                                            minWidth: "50px",
                                            textAlign: "center",
                                        }}>
                                        <span>Alerts</span>
                                    </div>
                                }>
                                <label className='switch'>
                                    <input
                                        checked={props.data.is_connect}
                                        type='checkbox'
                                        onChange={() => {}}
                                    />
                                    <span
                                        onClick={(e) => {
                                            props.onClick();
                                        }}
                                        className='slider round'></span>
                                </label>
                            </Tooltip>
                        )}
                    </div>
                ) : (
                    <div>---</div>
                );
            },
            onClick: (selectedItem, index) => {
                // console.log("click");
                if (index === 0) {
                    toast.warning("Cannot Disable Alert For Total Data", {
                        toastId: "default",
                    });
                } else {
                    connectTrigger(selectedItem, index);
                }
            },
        },
        {
            iconSrc: editIcon,
            onClick: (selectedItem, index) => {
                toggleEdit();
            },
        },
    ];

    useEffect(() => {
        let isClear = false;
        if (inputVal.warning_comparison !== "") {
            if (
                inputVal.warning_comparison === "LOWER_THAN" ||
                inputVal.warning_comparison === "LOWER_THAN_EQUAL" ||
                inputVal.warning_comparison === "HIGHER_THAN" ||
                inputVal.warning_comparison === "HIGHER_THAN_EQUAL"
            ) {
                if (inputVal.warning_threshold) {
                } else {
                    isClear = true;
                }
                setRequired((prev) => {
                    return { ...prev, warning: true };
                });
            } else {
                if (
                    inputVal.warning_threshold &&
                    inputVal.second_warning_threshold
                ) {
                    setRequired((prev) => {
                        return { ...prev, warning: true, second_warning: true };
                    });
                } else {
                    isClear = true;
                }
            }
        } else {
            isClear = true;
        }

        if (inputVal.critical_comparison) {
            // set the required value for critical
            if (
                inputVal.critical_comparison === "LOWER_THAN" ||
                inputVal.critical_comparison === "LOWER_THAN_EQUAL" ||
                inputVal.critical_comparison === "HIGHER_THAN" ||
                inputVal.critical_comparison === "HIGHER_THAN_EQUAL"
            ) {
                setRequired((prev) => {
                    return { ...prev, critical: true };
                });
            } else if (
                inputVal.critical_comparison.startsWith("HIGHER_THAN_AND") ||
                inputVal.critical_comparison.startsWith(
                    "HIGHER_THAN_EQUAL_AND"
                ) ||
                inputVal.critical_comparison === "BETWEEN"
            ) {
                setRequired((prev) => {
                    return { ...prev, critical: true, second_critical: true };
                });
            } else {
                setRequired((prev) => {
                    return { ...prev, critical: false, second_critical: false };
                });
            }
        }

        // isClear ?
        if (isClear) {
            // setInputVal((prev) => {
            //     prev.critical = "";
            //     prev.critical_comparison = "";
            //     prev.second_critical = "";
            //     return { ...prev };
            // });
        }
        // reset second value
        if (!inputVal.warning_threshold) {
            setInputVal((prev) => {
                prev.second_warning_threshold = "";
                return { ...prev };
            });
        }
        if (!inputVal.critical_threshold) {
            setInputVal((prev) => {
                prev.second_critical_threshold = "";
                return { ...prev };
            });
        }
    }, [
        inputVal.warning_threshold,
        inputVal.warning_comparison,
        inputVal.second_warning_threshold,
        inputVal.critical_comparison,
        inputVal.critical_threshold,
    ]);

    // get all tags
    const getAllThreshold = (type, rackId) => {
        setLoadingTable(true);
        let formData = new FormData();
        formData.append("type", type);
        formData.append("rack_id", rackId);
        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_DATA_HUB) +
                process.env.REACT_APP_CONSUMPTION_RACK_GET_ALL_THRESHOLD,
            data: formData,
            headers: {
                authorization: getToken(),
            },
        };
        axios(config)
            .then((response) => {
                if (response.data.data) {
                    if (response.data.data.length > 0) {
                        let allThreshold = response.data.data;
                        allThreshold.forEach((data) => {
                            data.warning_overview = generateOverview(
                                data.warning_comparison,
                                data.warning_threshold,
                                data.second_warning_threshold
                            );
                            data.critical_overview = generateOverview(
                                data.critical_comparison,
                                data.critical_threshold,
                                data.second_critical_threshold
                            );
                        });
                        if (allThreshold[0].name.toLowerCase() !== "total") {
                            allThreshold.unshift(dummyDataTotal);
                        } else {
                            const totalWarnOverview = generateOverview(
                                allThreshold[0].warning_comparison,
                                allThreshold[0].warning_threshold,
                                allThreshold[0].second_warning_threshold
                            );
                            const totalCriticalOverview = generateOverview(
                                allThreshold[0].critical_comparison,
                                allThreshold[0].critical_threshold,
                                allThreshold[0].second_critical_threshold
                            );
                            if (
                                totalWarnOverview === "---" &&
                                totalCriticalOverview === "---"
                            ) {
                                allThreshold[0].warning_overview = "Default";
                                allThreshold[0].critical_overview = "Default";
                            }
                        }
                        setTableBody(allThreshold);
                    } else {
                        setTableBody([]);
                    }
                } else {
                    setTableBody([]);
                }
                setLoadingTable(false);
            })
            .catch((err) => {
                setLoadingTable(false);
                toast.error("Cannot threshold list", {
                    toastId: "error",
                });
            });
    };

    // generate threshold overview
    useEffect(() => {
        if (isShowing && menu && subMenu && rackId) {
            getAllThreshold(`${subMenu} ${menu}`.toLowerCase(), rackId);
        }
    }, [isShowing, menu, subMenu, rackId]);

    useEffect(() => {
        if (isShowingEdit && isShowing) {
            setInputVal({ ...selectedTag });
        }
    }, [selectedTag, isShowingEdit, isShowing]);

    const validateInputRange = (isReturn) => {
        let isNext = true;
        if (
            isShowing &&
            inputVal.critical_comparison &&
            inputVal.critical_threshold
        ) {
            // effect for validation
            if (
                validateCritical(
                    inputVal.warning_comparison,
                    inputVal.warning_threshold,
                    inputVal.second_warning_threshold,
                    inputVal.critical_comparison,
                    inputVal.critical_threshold,
                    inputVal.second_critical_threshold
                )
            ) {
                isNext = false;
                toast.warning("Value inside warning area", {
                    toastId: "error-limit",
                });
                setInputVal((prev) => ({
                    ...prev,
                    critical_threshold: "",
                    second_critical_threshold: "",
                }));
            }
        }
        if (isReturn) {
            return isNext;
        }
    };

    return (
        <ModalContainer
            title={`Threshold and Limit Value ${subMenu} ${menu}`}
            isShowing={isShowing}
            hide={hide}>
            <div className='monitoring-threshold-container'>
                <LoadingData
                    // size='100px'
                    isLoading={loadingTable}
                    useAltBackground={false}
                />
                {/* input container */}
                <ModalContainer
                    title={selectedTag ? selectedTag.name : ""}
                    isShowing={isShowingEdit}
                    hide={() => {
                        toggleEdit();
                        handleClear();
                    }}
                    level={2}
                    submitName='Save'
                    onSubmit={(e) =>
                        handleSubmit(
                            e,
                            selectedTag ? selectedTag.name.toLowerCase() : ""
                        )
                    }
                    clearName='Clear'
                    onClear={handleClearEdit}
                    formId='threshold'
                    isLoading={loading}
                    showRequired={true}>
                    <form
                        id='threshold'
                        onSubmit={(e) =>
                            handleSubmit(
                                e,
                                selectedTag
                                    ? selectedTag.name.toLowerCase()
                                    : ""
                            )
                        }
                        className='threshold'>
                        <InputDropdownHorizontal
                            labelWidth='100%'
                            inputWidth='342px'
                            name='warning_comparison'
                            label='Warning Condition'
                            value={inputVal.warning_comparison}
                            options={comparisons}
                            onChange={handleChange}
                            isRequired={inputVal.warning_threshold}
                            useAltColor={true}
                        />

                        <div className='reusable-input-horizontal'>
                            <label
                                className='reusable-input-horizontal__label'
                                style={{ width: "100%" }}>
                                {`Warning Threshold 1${
                                    inputVal.warning_comparison !== "" &&
                                    inputVal.warning_comparison !== "null" &&
                                    inputVal.warning_comparison !== null
                                        ? "*"
                                        : ""
                                }:`}
                            </label>
                            <div className='reusable-button__loading'>
                                <input
                                    className='reusable-input-horizontal__input reusable-input-horizontal__input--alt-color'
                                    type='number'
                                    name='warning_threshold'
                                    value={inputVal.warning_threshold}
                                    onChange={handleChange}
                                    required={
                                        inputVal.warning_comparison !== "" &&
                                        inputVal.warning_comparison !==
                                            "null" &&
                                        inputVal.warning_comparison !== null
                                    }
                                    onBlur={validateInputRange}
                                    style={{
                                        width: "342px",
                                        textAlign: "center",
                                    }}></input>
                            </div>
                        </div>

                        {!(
                            inputVal.warning_comparison === "LOWER_THAN" ||
                            inputVal.warning_comparison ===
                                "LOWER_THAN_EQUAL" ||
                            inputVal.warning_comparison === "HIGHER_THAN" ||
                            inputVal.warning_comparison ===
                                "HIGHER_THAN_EQUAL" ||
                            inputVal.warning_comparison === "null" ||
                            !inputVal.warning_comparison
                        ) && (
                            <div className='reusable-input-horizontal'>
                                <label
                                    className='reusable-input-horizontal__label'
                                    style={{ width: "100%" }}>
                                    {`Warning Threshold 2${
                                        required.second_warning ? "*" : ""
                                    }:`}
                                </label>
                                <div className='reusable-button__loading'>
                                    <input
                                        className='reusable-input-horizontal__input reusable-input-horizontal__input--alt-color'
                                        type='number'
                                        name='second_warning_threshold'
                                        value={
                                            inputVal.second_warning_threshold
                                        }
                                        onChange={handleChange}
                                        required={required.second_warning}
                                        onBlur={validateInputRange}
                                        style={{
                                            width: "342px",
                                            textAlign: "center",
                                        }}></input>
                                </div>
                            </div>
                        )}
                        <div className='reusable-input-horizontal'>
                            <label
                                className='reusable-input-horizontal__label'
                                style={{ width: "100%" }}>
                                Warning Condition Overview:
                            </label>
                            <div className='reusable-button__loading'>
                                <label className='reusable-input-horizontal__overview'>
                                    {generateOverview(
                                        inputVal.warning_comparison,
                                        inputVal.warning_threshold,
                                        inputVal.second_warning_threshold
                                    )}
                                </label>
                            </div>
                        </div>
                        {/* CRITICAL */}

                        <>
                            <InputDropdownHorizontal
                                labelWidth='100%'
                                inputWidth='342px'
                                name='critical_comparison'
                                label='Critical Condition'
                                value={inputVal.critical_comparison}
                                options={comparisons}
                                onChange={handleChange}
                                isRequired={inputVal.critical_threshold}
                                useAltColor={true}
                            />

                            <div className='reusable-input-horizontal'>
                                <label
                                    className='reusable-input-horizontal__label'
                                    style={{ width: "100%" }}>
                                    {`Critical Threshold 1${
                                        inputVal.critical_comparison !== "" &&
                                        inputVal.critical_comparison !==
                                            "null" &&
                                        inputVal.critical_comparison !== null
                                            ? "*"
                                            : ""
                                    }:`}
                                </label>
                                <div className='reusable-button__loading'>
                                    <input
                                        className='reusable-input-horizontal__input reusable-input-horizontal__input--alt-color'
                                        type='number'
                                        name='critical_threshold'
                                        value={inputVal.critical_threshold}
                                        onChange={handleChange}
                                        required={
                                            inputVal.critical_comparison !==
                                                "" &&
                                            inputVal.critical_comparison !==
                                                "null" &&
                                            inputVal.critical_comparison !==
                                                null
                                        }
                                        onBlur={validateInputRange}
                                        style={{
                                            width: "342px",
                                            textAlign: "center",
                                        }}></input>
                                    {/* <label className='threshold-input-container__unit'>
                                                {inputVal.unit || " --- "}
                                            </label> */}
                                </div>
                            </div>

                            {!(
                                inputVal.critical_comparison === "LOWER_THAN" ||
                                inputVal.critical_comparison ===
                                    "LOWER_THAN_EQUAL" ||
                                inputVal.critical_comparison ===
                                    "HIGHER_THAN" ||
                                inputVal.critical_comparison ===
                                    "HIGHER_THAN_EQUAL" ||
                                inputVal.critical_comparison === "null" ||
                                !inputVal.critical_comparison
                            ) && (
                                <div className='reusable-input-horizontal'>
                                    <label
                                        className='reusable-input-horizontal__label'
                                        style={{ width: "100%" }}>
                                        {`Critical Threshold 2${
                                            required.second_critical ? "*" : ""
                                        }:`}
                                    </label>
                                    <div className='reusable-button__loading'>
                                        <input
                                            className='reusable-input-horizontal__input reusable-input-horizontal__input--alt-color'
                                            type='number'
                                            name='second_critical_threshold'
                                            value={
                                                inputVal.second_critical_threshold
                                            }
                                            onChange={handleChange}
                                            required={required.second_critical}
                                            onBlur={validateInputRange}
                                            style={{
                                                width: "342px",
                                                textAlign: "center",
                                            }}></input>
                                    </div>
                                </div>
                            )}
                            <div className='reusable-input-horizontal'>
                                <label
                                    className='reusable-input-horizontal__label'
                                    style={{ width: "100%" }}>
                                    Critical Condition Overview:
                                </label>
                                <div className='reusable-button__loading'>
                                    <label className='reusable-input-horizontal__overview'>
                                        {generateOverview(
                                            inputVal.critical_comparison,
                                            inputVal.critical_threshold,
                                            inputVal.second_critical_threshold
                                        )}
                                    </label>
                                    {/* <label className='threshold-input-container__blank'>
                                            {inputVal.unit || " --- "}
                                        </label> */}
                                </div>
                            </div>
                        </>
                    </form>
                </ModalContainer>

                <TableDCIM
                    header={tableHeader}
                    body={tableBody}
                    actions={actions}
                    selectable={true}
                    onSelect={(selectedRow, index) => {
                        handleSelectRow(selectedRow);
                    }}
                    customCellClassNames={[]}
                />
            </div>
        </ModalContainer>
    );
};

export default RackConsumptionChartThreshold;

// validate critical value
const validateCritical = (
    warningComp,
    warning1,
    warning2,
    criticalComp,
    critical1,
    critical2
) => {
    /* TRUE mean reset the value and give toast warning */
    warning1 = parseFloat(warning1);
    warning2 = parseFloat(warning2);
    critical1 = parseFloat(critical1);
    critical2 = parseFloat(critical2);
    let reset = false;
    if (warningComp) {
        if (warningComp.startsWith("LOWER_THAN")) {
            if (
                criticalComp === "HIGHER_THAN" ||
                criticalComp === "HIGHER_THAN_EQUAL"
            ) {
                if (critical1 <= warning1 && critical1 && warning1) {
                    reset = true;
                } else {
                    reset = false;
                }
            } else if (
                criticalComp.startsWith("HIGHER_THAN_AND") ||
                criticalComp.startsWith("HIGHER_THAN_EQUAL_AND")
            ) {
                // check upper part
                if (critical1 <= warning1 && critical1 && warning1) {
                    reset = true;
                }
            } else if (
                criticalComp.startsWith("LOWER") &&
                critical1 >= warning1
            ) {
                reset = true;
            } else {
                if (
                    critical2 &&
                    critical2 <= warning1 &&
                    critical1 >= warning1
                ) {
                    reset = true;
                } else {
                    reset = false;
                }
            }
        } else if (
            warningComp.startsWith("HIGHER_THAN_AND") ||
            warningComp.startsWith("HIGHER_THAN_EQUAL_AND")
        ) {
            if (criticalComp.startsWith("LOWER")) {
                if (critical1 >= warning1) {
                    reset = true;
                }
            } else if (
                criticalComp === "HIGHER_THAN" ||
                criticalComp === "HIGHER_THAN_EQUAL"
            ) {
                if (critical1 <= warning2) {
                    reset = true;
                }
            } else if (
                criticalComp.startsWith("HIGHER_THAN_AND") ||
                (criticalComp.startsWith("HIGHER_THAN_EQUAL_AND") && critical2)
            ) {
                if (critical2 >= warning1) {
                    reset = true;
                }
                if (critical1 <= warning2 && critical1) {
                    reset = true;
                }
            } else if (criticalComp === "BETWEEN" && critical2) {
                if (
                    critical1 >= warning1 &&
                    (critical2 <= warning1 || critical2 <= warning2)
                ) {
                    reset = true;
                } else if (
                    critical2 <= warning2 &&
                    (critical1 >= warning2 || critical1 >= warning1)
                ) {
                    reset = true;
                } else {
                    reset = false;
                }
            } else {
                reset = false;
            }
        } else if (warningComp.startsWith("HIGHER_THAN")) {
            if (criticalComp.startsWith("LOWER")) {
                if (critical1 >= warning1 && critical1 && warning1) {
                    reset = true;
                } else {
                    reset = false;
                }
            } else if (
                criticalComp === "HIGHER_THAN" ||
                criticalComp === "HIGHER_THAN_EQUAL"
            ) {
                if (critical1 <= warning1) {
                    reset = true;
                }
            } else if (
                criticalComp.startsWith("HIGHER_THAN_AND") ||
                criticalComp.startsWith("HIGHER_THAN_EQUAL_AND")
            ) {
                if (warning1 <= critical2 && critical2) {
                    reset = true;
                }
            } else {
                if (criticalComp === "BETWEEN" && critical2) {
                    if (critical1 >= warning1 && critical2 <= warning1) {
                        reset = true;
                    }
                } else {
                    reset = false;
                }
            }
        } else if (warningComp === "BETWEEN") {
            if (
                criticalComp.startsWith("LOWER") ||
                criticalComp.startsWith("HIGHER_THAN")
            ) {
                if (critical1 <= warning1 && critical1 >= warning2) {
                    reset = true;
                }
            } else if (
                criticalComp.startsWith("HIGHER_THAN_AND") ||
                criticalComp.startsWith("HIGHER_THAN_EQUAL_AND")
            ) {
                if (
                    (critical1 <= warning1 && critical1 >= warning2) ||
                    (critical2 <= warning1 && critical2 >= warning2)
                ) {
                    reset = true;
                }
            } else {
                // between
                if (
                    (critical1 <= warning1 &&
                        critical1 >= warning2 &&
                        critical2 <= warning2) ||
                    (critical1 >= warning1 &&
                        critical2 <= warning1 &&
                        critical2 >= warning2)
                ) {
                    reset = true;
                }
            }
        } else {
            // warning comparator === between
            if (
                critical1 <= warning1 &&
                critical1 >= warning2 &&
                criticalComp !== "BETWEEN"
            ) {
                reset = true;
            } else {
                reset = false;
            }
        }
    }
    // return
    return reset;
};
