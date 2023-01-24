import React, { useState, useEffect } from "react";

import {
    InputDropdownVertical,
    InputTextVertical,
    InputTextPairVertical,
    ButtonClear,
    ButtonSubmit,
    ModalContainer,
    InputTextAutoSuggestVertical,
    InputDropdownCreatableVertical,
} from "../../../../ComponentReuseable";

import {
    getChangeTypesAPI,
    getItemNumbers,
    getAllRackNumbers,
    getItemNumbersByRack,
    createRackAccessNameAPI,
    deleteRackAccessNameAPI,
} from "../ChangeAPI";
import { requestAPI } from "../Utils/changeUtils";
import { toast } from "react-toastify";

const ModalAddAccess = ({
    isShowing,
    hide,
    accessTypeOptions,
    accessNameOptions,
    setRackChangeTo,
    setRackInputOptions,
}) => {
    const [loadingButton, setLoadingButton] = useState(false);
    const [isLoadingDropdownCreateable, setIsLoadingDropdownCreateable] =
        useState(false);
    const [inputData, setInputData] = useState({
        access_type: "",
        access_name: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        let change_to = {
            rack_access_type_id: inputData.access_type,
            rack_access_type_name: accessTypeOptions.find(
                (el) => el.id == inputData.access_type
            ).name,
            rack_access_name_id: accessNameOptions.find(
                (el) => el.name == inputData.access_name
            ).id,

            rack_access_name: inputData.access_name,
        };

        setRackChangeTo((prev) => {
            let arrayOfCard =
                prev.rack_access.filter(
                    (el) => el.rack_access_type_name === "Card"
                ) || [];
            let arrayOfKey =
                prev.rack_access.filter(
                    (el) => el.rack_access_type_name === "Key"
                ) || [];
            let arrayOfBiometric =
                prev.rack_access.filter(
                    (el) => el.rack_access_type_name === "Biometric"
                ) || [];
            if (change_to.rack_access_type_name === "Card") {
                arrayOfCard = [
                    ...arrayOfCard,
                    { ...change_to, index: arrayOfCard.length },
                ];
            } else if (change_to.rack_access_type_name === "Key") {
                arrayOfKey = [
                    ...arrayOfKey,
                    { ...change_to, index: arrayOfKey.length },
                ];
            } else {
                arrayOfBiometric = [
                    ...arrayOfBiometric,
                    { ...change_to, index: arrayOfBiometric.length },
                ];
            }
            return {
                ...prev,
                rack_access: [
                    ...arrayOfCard,
                    ...arrayOfKey,
                    ...arrayOfBiometric,
                ],
            };
        });
        handleClear();
        hide();
    };

    const handleChange = (e) => {
        let { name, value } = e.target;

        setInputData((prev) => {
            prev[name] = value;
            return { ...prev };
        });
    };
    const handleClear = () => {
        setInputData((prev) => ({ ...prev, access_type: "", access_name: "" }));
    };

    const handleCreateAccessName = async (access_name) => {
        setIsLoadingDropdownCreateable(true);
        try {
            let result = await requestAPI(createRackAccessNameAPI(access_name));
            if (result.data && result.data.length > 0) {
                let rack_access_name_id = result.data[0].rack_access_name_id;

                setRackInputOptions((prev) => {
                    prev.access_names = [
                        ...prev.access_names,
                        {
                            id: rack_access_name_id,
                            name: access_name,
                        },
                    ];
                    return { ...prev };
                });
                setInputData((prev) => {
                    prev["access_name"] = access_name;
                    return {
                        ...prev,
                    };
                });
            }
            setIsLoadingDropdownCreateable(false);
        } catch (error) {
            toast.error("Failed to create rack access name");
            setIsLoadingDropdownCreateable(false);
        }
    };

    const handleDeleteRackAccessName = async (access_name) => {
        setIsLoadingDropdownCreateable(true);
        try {
            let result = await requestAPI(deleteRackAccessNameAPI(access_name));
            if (result.data && result.data.length > 0) {
                setInputData((prev) => {
                    prev["access_name"] =
                        prev["access_name"] === access_name
                            ? ""
                            : prev["access_name"];
                    return {
                        ...prev,
                    };
                });
                setRackInputOptions((prev) => {
                    prev.access_names = prev.access_names.filter(
                        (access) => access.name !== access_name
                    );

                    return { ...prev };
                });
            }

            setIsLoadingDropdownCreateable(false);
        } catch (error) {
            toast.error("Failed to delete access name");
            setIsLoadingDropdownCreateable(false);
        }
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
                    label='Access Type'
                    name='access_type'
                    options={accessTypeOptions}
                    value={inputData.access_type}
                    onChange={handleChange}
                    isRequired={true}
                />
                {/* <InputDropdownVertical
                    width={"300px"}
                    label='Access Name'
                    name='access_name'
                    options={accessNameOptions}
                    value={inputData.access_name}
                    onChange={handleChange}
                    isRequired={true}
                /> */}
                <InputDropdownCreatableVertical
                    name='access_name'
                    label='Access Name'
                    width={"300px"}
                    isRequired={true}
                    value={{
                        value: inputData.access_name,
                        label: inputData.access_name,
                    }}
                    options={
                        accessNameOptions.length > 0 &&
                        accessNameOptions.map((el) => ({
                            value: el.name,
                            label: el.name,
                        }))
                    }
                    onSelect={(selectedOption) => {
                        if (inputData.access_name !== selectedOption.value) {
                            setInputData((prev) => {
                                prev["access_name"] = selectedOption.value;
                                return {
                                    ...prev,
                                };
                            });
                        }
                    }}
                    onCreateOption={(createdItem) => {
                        handleCreateAccessName(createdItem);
                    }}
                    onDeleteOption={(deletedItem) => {
                        handleDeleteRackAccessName(deletedItem.value || "");
                    }}
                    isLoading={isLoadingDropdownCreateable}
                />

                <div className='button-container'>
                    <ButtonSubmit
                        name='Add'
                        formId='add-request'
                        // isLoading={loadingButton}
                    />
                    <ButtonClear name='Clear' onClear={handleClear} />
                </div>
            </form>
        </ModalContainer>
    );
};

export default ModalAddAccess;
