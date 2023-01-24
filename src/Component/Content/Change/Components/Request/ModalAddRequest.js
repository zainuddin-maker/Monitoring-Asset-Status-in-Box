import React, { useState, useEffect, useMemo } from "react";

import {
    InputDropdownVertical,
    InputTextVertical,
    InputTextPairVertical,
    ButtonClear,
    ButtonSubmit,
    ModalContainer,
    InputTextAutoSuggestVertical,
} from "../../../../ComponentReuseable";

import {
    getChangeTypesAPI,
    getItemNumbers,
    getAllRackNumbers,
    getItemNumbersByRack,
    getItemNumbersDisconnectAPI,
} from "../ChangeAPI";
import { requestAPI } from "../Utils/changeUtils";
import { toast } from "react-toastify";

const ModalAddRequest = ({
    isShowing,
    hide,
    setItemChangeRequests,
    request_type,
    rack_id,
    number_of_u,
    u_position,
    u_needed,
    rack_no,
    is_full,
    is_left,
}) => {
    const [loadingButton, setLoadingButton] = useState(false);
    const [itemsDataList, setItemsDataList] = useState([]);
    const [targetRackDataList, setTargetRackDataList] = useState([]);
    const [targetItemDataList, setTargetItemDataList] = useState([]);

    const [inputOptions, setInputOptions] = useState({
        change: [],
        isLeft: [
            {
                id: "left",
                name: "L",
            },
            {
                id: "right",
                name: "R",
            },
        ],
    });

    const [inputData, setInputData] = useState({
        change_type: "",
        item_number: "",
        item_name: "",
        rack_number: "",
        change_to: {},
        is_full: true,
        is_left: "",
        area_first: "",
        area_last: "",
        target_rack_number: "",
        target_item_number: "",
        search_rack_number: false,
        number_of_u,
    });
    const [isLoadingDropdown, setIsLoadingDropdown] = useState({
        change_type: false,
        item_number: false,
        target_rack_number: false,
        target_item_number: false,
    });

    const toastMessageInputNumber = "Input U# must be a positive number";

    useEffect(async () => {
        if (isShowing) {
            try {
                setIsLoadingDropdown((prev) => ({
                    ...prev,
                    change_type: true,
                }));
                let result = await requestAPI(getChangeTypesAPI(request_type));
                setInputOptions((prev) => ({ ...prev, change: result }));
                setIsLoadingDropdown((prev) => ({
                    ...prev,
                    change_type: false,
                }));
            } catch (error) {
                toast.error(error.toString());
                setIsLoadingDropdown((prev) => ({
                    ...prev,
                    change_type: false,
                }));
            }

            // Request if change_type is selected
            if (inputData.change_type) {
                setTargetRackDataList([...[]]);
                setIsLoadingDropdown((prev) => ({
                    ...prev,
                    item_number: true,
                }));
                try {
                    let result = await requestAPI(
                        getItemNumbers(
                            rack_id,
                            inputData.change_type === "Install"
                                ? "-1"
                                : inputData.change_type === "Disconnect" ||
                                  inputData.change_type ===
                                      "Disconnect and Move"
                                ? "-2"
                                : "0"
                        )
                    );
                    setItemsDataList(result.data);
                    setIsLoadingDropdown((prev) => ({
                        ...prev,
                        item_number: false,
                    }));
                } catch (error) {
                    toast.error(error.toString());
                    setIsLoadingDropdown((prev) => ({
                        ...prev,
                        item_number: false,
                    }));
                }
                if (inputData.change_type === "Connect") {
                    try {
                        let result = await requestAPI(getAllRackNumbers());
                        setIsLoadingDropdown((prev) => ({
                            ...prev,
                            target_rack_number: true,
                        }));
                        if (result.data && result.data.length > 0) {
                            let filteredData = result.data.filter(
                                (rack) => rack.rack_number !== rack_no
                            );
                            setTargetRackDataList([...filteredData]);
                        } else {
                            setTargetRackDataList([...[]]);
                        }
                        setIsLoadingDropdown((prev) => ({
                            ...prev,
                            target_rack_number: false,
                        }));
                    } catch (error) {
                        toast.error(error.toString());
                        setTargetRackDataList([...[]]);
                        setIsLoadingDropdown((prev) => ({
                            ...prev,
                            target_rack_number: false,
                        }));
                    }
                }

                if (
                    (inputData.change_type === "Disconnect" ||
                        inputData.change_type === "Disconnect and Move") &&
                    inputData.item_number
                ) {
                    try {
                        let result = await requestAPI(
                            getAllRackNumbers(inputData.item_number)
                        );
                        setIsLoadingDropdown((prev) => ({
                            ...prev,
                            target_rack_number: true,
                        }));
                        // setTargetRackDataList(result.data);
                        if (result.data && result.data.length > 0) {
                            let filteredData = result.data.filter(
                                (rack) => rack.rack_number !== rack_no
                            );
                            setTargetRackDataList([...filteredData]);
                        } else {
                            setTargetRackDataList([...[]]);
                        }
                        setIsLoadingDropdown((prev) => ({
                            ...prev,
                            target_rack_number: false,
                        }));
                    } catch (error) {
                        toast.error(error.toString());
                        setIsLoadingDropdown((prev) => ({
                            ...prev,
                            target_rack_number: false,
                        }));
                    }
                }
            }
        }
    }, [isShowing, inputData.change_type, inputData.search_rack_number]);

    useEffect(() => {
        if (isShowing) {
            const clearInputDataWhenTypeChange = () => {
                setInputData((prev) => ({
                    ...prev,
                    item_number: "",
                    item_name: "",
                    rack_number: "",
                    change_to: {},
                    is_full: true,
                    is_left: "",
                    area_first: "",
                    area_last: "",
                    target_rack_number: "",
                    target_item_number: "",
                    search_rack_number: false,
                    number_of_u: "",
                }));
            };
            clearInputDataWhenTypeChange();
        }
    }, [isShowing, inputData.change_type]);

    useEffect(async () => {
        setTargetItemDataList([...[]]);
        if (inputData.target_rack_number) {
            try {
                let temp_array = [];
                let result;
                if (
                    (inputData.change_type === "Disconnect" ||
                        inputData.change_type === "Disconnect and Move") &&
                    inputData.item_number
                ) {
                    setIsLoadingDropdown((prev) => ({
                        ...prev,
                        target_item_number: true,
                    }));
                    result = await requestAPI(
                        getItemNumbersDisconnectAPI(
                            inputData.item_number,
                            inputData.target_rack_number
                        )
                    );
                    if (result.data.length > 0) {
                        result.data.forEach((item) => {
                            if (
                                item.first_item_number === inputData.item_number
                            ) {
                                temp_array.push({
                                    item_number: item.second_item_number,
                                });
                            } else {
                                temp_array.push({
                                    item_number: item.first_item_number,
                                });
                            }
                        });
                    }
                } else {
                    result = await requestAPI(
                        getItemNumbersByRack(inputData.target_rack_number)
                    );
                    temp_array = [...result.data];
                }

                // Filtering by reference second item
                setTargetItemDataList([...temp_array]);
                setIsLoadingDropdown((prev) => ({
                    ...prev,
                    target_item_number: false,
                }));
            } catch (error) {
                toast.error(error.toString());
                setIsLoadingDropdown((prev) => ({
                    ...prev,
                    target_item_number: false,
                }));
            }
        }
    }, [inputData.target_rack_number]);

    const handleChange = (e) => {
        let { name, value } = e.target;

        setInputData((prev) => {
            prev[name] = value;
            return { ...prev };
        });

        if (
            [
                "area_first",
                "area_last",
                "is_left",
                "target_rack_number",
                "target_item_number",
            ].includes(e.target.name)
        ) {
            setInputData((prev) => {
                if (e.target.name === "area_first") {
                    prev.change_to["u_first"] = e.target.value;
                    let findItem = itemsDataList.find(
                        (val) => val.item_number === inputData.item_number
                    );
                    if (findItem) {
                        let numberOfU = findItem.number_of_u;
                        if (validateNumber(e.target.value)) {
                            prev["area_last"] = (
                                parseInt(e.target.value) +
                                parseInt(numberOfU) -
                                1
                            ).toString();
                            prev.change_to["u_last"] =
                                parseInt(e.target.value) +
                                parseInt(numberOfU) -
                                1;
                        }
                    }
                }
                if (e.target.name === "area_last") {
                    prev.change_to["u_last"] = e.target.value;
                }
                if (e.target.name === "is_left") {
                    prev.change_to["is_left"] = e.target.value;
                    if (e.target.value === "left") {
                        prev.is_left = "left";
                    } else {
                        prev.is_left = "right";
                    }
                }
                if (e.target.name === "target_rack_number") {
                    prev.change_to["rack_number"] = e.target.value;
                }
                if (e.target.name === "target_item_number") {
                    prev.change_to["item_number"] = e.target.value;
                }
                return { ...prev };
            });
        }
    };

    const handleClear = () => {
        setInputData({
            change_type: "",
            item_number: "",
            item_name: "",
            rack_number: "",
            change_to: {},
            is_full: true,
            area_first: "",
            area_last: "",
            target_rack_number: "",
            target_item_number: "",
        });
    };
    const validateInput = (e) => {
        if (e.target.name === "item_number") {
            let find = itemsDataList.find(
                (item) => item.item_number === e.target.value
            );
            if (find) {
                setInputData((prev) => ({
                    ...prev,
                    item_name: find.item_name,
                    is_full: find.is_full,
                    search_rack_number: !prev.search_rack_number,
                    number_of_u: find.number_of_u,
                }));
            } else if (inputData[e.target.name]) {
                e.target.value && toast.error("Item number doesn't exist");
                setInputData((prev) => ({
                    ...prev,
                    item_number: "",
                    item_name: "",
                    is_full: true,
                    area_first: "",
                    area_last: "",
                    number_of_u: "",
                    change_to: {},
                }));
            } else {
                setInputData((prev) => ({
                    ...prev,

                    item_name: "",
                    is_full: true,
                    area_first: "",
                    area_last: "",
                    number_of_u: "",
                    change_to: {},
                }));
            }
        }
    };

    const isItemConflict = (area_first, area_last) => {
        if (u_position.length > 0) {
            for (let i = 0; i < u_position.length; i++) {
                if (
                    (area_first >= u_position[i] &&
                        area_first <= u_position[i] + u_needed[i] - 1) ||
                    (area_last >= u_position[i] &&
                        area_last <= u_position[i] + u_needed[i] - 1) ||
                    (area_first <= u_position[i] &&
                        area_last >= u_position[i] + u_needed[i] - 1)
                ) {
                    // Check is_full = false (half) and is_left (left/right)
                    if (!is_full[i]) {
                        if (
                            (inputData.is_left === "left" && is_left[i]) ||
                            (inputData.is_left === "right" && !is_left[i])
                        ) {
                            if (inputData.change_type === "Move") {
                                let findItem = itemsDataList.find(
                                    (val) =>
                                        val.item_number ===
                                        inputData.item_number
                                );
                                if (findItem) {
                                    let item_u_position = findItem.u_position;
                                    if (item_u_position === u_position[i]) {
                                        return false;
                                    }
                                }
                            }
                            return true;
                        } else {
                            return false;
                        }
                    }
                    if (inputData.change_type === "Move") {
                        let findItem = itemsDataList.find(
                            (val) => val.item_number === inputData.item_number
                        );
                        if (findItem) {
                            let item_u_position = findItem.u_position;
                            if (item_u_position === u_position[i]) {
                                return false;
                            }
                        }
                    }

                    return true;
                }
            }
            return false;
        } else {
            return false;
        }
    };
    const memoizedisItemConflict = useMemo(
        () => isItemConflict(inputData.area_first, inputData.area_last),
        [
            inputData.area_first,
            inputData.area_last,
            inputData.is_left,
            u_position,
            u_needed,
            is_full,
            is_left,
        ]
    );
    const handleSubmit = (e) => {
        e.preventDefault();
        let isValid = false;
        if (
            inputData.change_type === "Install" ||
            inputData.change_type === "Move" ||
            inputData.change_type === "Disconnect and Move"
        ) {
            if (inputData.number_of_u > 0) {
                if (
                    validateNumber(inputData.area_first) &&
                    (inputData.area_last
                        ? validateNumber(inputData.area_last)
                        : true)
                ) {
                    if (
                        inputData.area_last &&
                        parseInt(inputData.area_last) <=
                            parseInt(inputData.area_first)
                    ) {
                        toast.warning("Last U# must be greater than first U#");
                    } else {
                        if (
                            inputData.area_first > number_of_u ||
                            inputData.area_last > number_of_u ||
                            inputData.area_first < 1 ||
                            inputData.area_last < 1
                        ) {
                            toast.warning(
                                `Input U# not in range 1 - ${number_of_u}`
                            );
                        } else {
                            // Check if conflict
                            // console.log(memoizedisItemConflict);
                            if (
                                // isItemConflict(
                                //     inputData.area_first,
                                //     inputData.area_last
                                // )
                                memoizedisItemConflict
                            ) {
                                toast.warning(`Item must be on empty U# slot`);
                            } else {
                                isValid = true;
                            }
                        }
                    }
                } else {
                    toast.warning(toastMessageInputNumber);
                }
            } else {
                isValid = true;
            }
        } else {
            isValid = true;
        }

        if (isValid) {
            setItemChangeRequests((prev) => [
                ...prev,
                {
                    change_type: inputData.change_type,
                    item_number: inputData.item_number,
                    item_name: inputData.item_name,
                    change_to: inputData.change_to,
                    change_to_message: formatChangeToMessage(),
                },
            ]);
            hide();
            handleClear();
        }
    };

    const formatChangeToMessage = () => {
        if (
            inputData.change_type === "Connect" ||
            inputData.change_type === "Disconnect"
        ) {
            return `Rack Number : ${inputData.change_to.rack_number} ; Item Number : ${inputData.change_to.item_number}`;
        } else if (
            inputData.change_type === "Install" ||
            inputData.change_type === "Move"
        ) {
            return inputData.number_of_u == 0
                ? "---"
                : inputData.change_to.u_last
                ? `U#${inputData.change_to.u_first}-U#${inputData.change_to.u_last}`
                : `U#${inputData.change_to.u_first}`;
        } else if (inputData.change_type === "Remove") {
            return `---`;
        } else if (inputData.change_type === "Disconnect and Move") {
            let message_1 = `Rack Number : ${inputData.change_to.rack_number} ; Item Number : ${inputData.change_to.item_number} ; `;
            let message_2 = inputData.change_to.u_last
                ? `U#${inputData.change_to.u_first}-U#${inputData.change_to.u_last}`
                : `U#${inputData.change_to.u_first}`;
            return message_1 + message_2;
        }
    };

    const validateNumber = (value) => {
        if (value.match(/^[0-9]+$/)) {
            return true;
        }
        return false;
    };

    return (
        <ModalContainer
            width='400px'
            title='Add Request'
            isShowing={isShowing}
            hide={() => {
                handleClear();
                hide();
            }}>
            <form
                id='add-request'
                className='add-request-form'
                onSubmit={handleSubmit}
                onKeyPress={(e) => {
                    e.key === "Enter" && e.preventDefault();
                }}>
                <InputDropdownVertical
                    width={"300px"}
                    label='Change'
                    name='change_type'
                    options={inputOptions.change}
                    value={inputData.change_type}
                    onChange={handleChange}
                    isRequired={true}
                    isLoading={isLoadingDropdown.change_type}
                />
                <InputTextAutoSuggestVertical
                    width={"300px"}
                    label='Item Number'
                    name='item_number'
                    options={
                        itemsDataList.length > 0 &&
                        itemsDataList.map((item) => item.item_number)
                    }
                    value={inputData.item_number}
                    onChange={handleChange}
                    validateInput={validateInput}
                    isRequired={true}
                    onClear={() => {
                        setInputData((prev) => ({ ...prev, item_number: "" }));
                        validateInput({
                            target: { name: "item_number", value: "" },
                        });
                    }}
                    isLoading={isLoadingDropdown.item_number}
                />
                <InputTextVertical
                    width={"300px"}
                    label='Item Name'
                    name='item_name'
                    value={inputData.item_name}
                    onChange={handleChange}
                    isDisabled={true}
                    isRequired={true}
                />

                {(inputData.change_type === "Install" ||
                    inputData.change_type === "Move") && (
                    <div className='change-to'>
                        {inputData.number_of_u > 0 ? (
                            <InputTextPairVertical
                                width='130px'
                                label={
                                    inputData.change_type === "Install"
                                        ? "Install To"
                                        : "Move To"
                                }
                                nameFirst='area_first'
                                nameSecond='area_last'
                                valueFirst={inputData.area_first}
                                onChangeFirst={handleChange}
                                valueSecond={inputData.area_last}
                                onChangeSecond={handleChange}
                                isDisabled={!inputData.item_number}
                                isDisabledSecond={true}
                                sideLabel='U#'
                            />
                        ) : (
                            <div></div>
                        )}
                        {!inputData.is_full && (
                            <InputDropdownVertical
                                width={"50px"}
                                label='L/R'
                                name='is_left'
                                options={inputOptions.isLeft}
                                onChange={handleChange}
                                isRequired={true}
                            />
                        )}
                    </div>
                )}
                {inputData.change_type === "Connect" && (
                    <div className='change-to'>
                        <span>Connect To</span>
                    </div>
                )}
                {inputData.change_type === "Disconnect" && (
                    <div className='change-to'>
                        <span>Disconnect From</span>
                    </div>
                )}

                {(inputData.change_type === "Connect" ||
                    inputData.change_type === "Disconnect") && (
                    <>
                        <InputDropdownVertical
                            width={"300px"}
                            label='Rack Number'
                            name='target_rack_number'
                            options={
                                targetRackDataList.length > 0
                                    ? targetRackDataList.map(
                                          (rack) => rack.rack_number
                                      )
                                    : []
                            }
                            isRequired={true}
                            onChange={handleChange}
                            isLoading={isLoadingDropdown.target_rack_number}
                        />
                        <InputDropdownVertical
                            width={"300px"}
                            label='Item Number'
                            name='target_item_number'
                            options={
                                targetItemDataList.length > 0
                                    ? targetItemDataList.map(
                                          (item) => item.item_number
                                      )
                                    : []
                            }
                            isRequired={true}
                            onChange={handleChange}
                            isLoading={isLoadingDropdown.target_item_number}
                        />
                    </>
                )}

                {inputData.change_type === "Disconnect and Move" && (
                    <>
                        <div className='change-to'>
                            <span>Disconnect From </span>
                        </div>
                        <InputDropdownVertical
                            width={"300px"}
                            label='Rack Number'
                            name='target_rack_number'
                            options={
                                targetRackDataList.length > 0
                                    ? targetRackDataList.map(
                                          (rack) => rack.rack_number
                                      )
                                    : []
                            }
                            isRequired={true}
                            onChange={handleChange}
                            isLoading={isLoadingDropdown.target_rack_number}
                        />
                        <InputDropdownVertical
                            width={"300px"}
                            label='Item Number'
                            name='target_item_number'
                            options={
                                targetItemDataList.length > 0
                                    ? targetItemDataList.map(
                                          (item) => item.item_number
                                      )
                                    : []
                            }
                            isRequired={true}
                            onChange={handleChange}
                            isLoading={isLoadingDropdown.target_item_number}
                        />

                        <div className='change-to'>
                            {inputData.number_of_u > 0 ? (
                                <InputTextPairVertical
                                    width='130px'
                                    label={
                                        inputData.change_type === "Install"
                                            ? "Install To"
                                            : "Move To"
                                    }
                                    nameFirst='area_first'
                                    nameSecond='area_last'
                                    valueFirst={inputData.area_first}
                                    onChangeFirst={handleChange}
                                    valueSecond={inputData.area_last}
                                    onChangeSecond={handleChange}
                                    isDisabled={!inputData.item_number}
                                    isDisabledSecond={true}
                                    sideLabel='U#'
                                />
                            ) : (
                                <div></div>
                            )}
                            {!inputData.is_full && (
                                <InputDropdownVertical
                                    width={"50px"}
                                    label='L/R'
                                    name='is_left'
                                    options={inputOptions.isLeft}
                                    onChange={handleChange}
                                    isRequired={true}
                                />
                            )}
                        </div>
                    </>
                )}
                <div className='button-container'>
                    <ButtonSubmit
                        name='Add'
                        formId='add-request'
                        isLoading={loadingButton}
                    />
                    <ButtonClear name='Clear' onClear={handleClear} />
                </div>
            </form>
        </ModalContainer>
    );
};

export default ModalAddRequest;
