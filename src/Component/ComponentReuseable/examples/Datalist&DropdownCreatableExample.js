import React, { useState } from "react";

import "./style.scss";

import InputDropdownCreatableVertical from "../../ComponentReuseable/InputDropdownCreatableVertical";
import InputDropdownVertical from "../../ComponentReuseable/InputDropdownVertical";
import InputTextAutoSuggestVertical from "../../ComponentReuseable/InputTextAutoSuggestVertical";
import InputTextAutoSuggestHorizontal from "../../ComponentReuseable/InputTextAutoSuggestHorizontal";

const DatalistDropdownCreatableExample = (props) => {
    const dropdownOptions = [
        { value: 1, label: "Option 1" },
        { value: 2, label: "Option 2" },
        { value: 3, label: "Option 3" },
    ];

    const autoSuggestOptions = [
        "Option Auto Suggest 1",
        "Option Auto Suggest 2",
        "Option Auto Suggest 3",
    ];

    const [dropdownValue, setDropdownValue] = useState(dropdownOptions[0]);
    const [textValue, setTextValue] = useState("");

    return (
        <React.Fragment>
            <InputDropdownCreatableVertical
                width='200px'
                name='testDropdown'
                label='Test Label Dropdown Creatable'
                value={dropdownValue}
                options={dropdownOptions}
                onSelect={(selectedOption) => {
                    if (dropdownValue !== selectedOption.value) {
                        console.log("Selected!");
                        console.log(selectedOption);
                        setDropdownValue(selectedOption);
                    }
                }}
                onCreateOption={(createdItem) => {
                    console.log("Created!");
                    console.log(createdItem);
                }}
                onDeleteOption={(deletedItem) => {
                    console.log("Deleted!");
                    console.log(deletedItem);
                }}
                isLoading={false}
            />
            <InputDropdownVertical
                width='200px'
                name='testDropdown'
                label='Test Label Dropdown'
                value={dropdownValue}
                options={dropdownOptions}
                onChange={(e) => {
                    setDropdownValue(e.target.value);
                }}
            />
            <InputTextAutoSuggestVertical
                width='200px'
                name='testAutoSuggest'
                label='Test Label Auto Suggest'
                value={textValue}
                options={autoSuggestOptions}
                onChange={(e) => {
                    let { value } = e.target;
                    setTextValue(value);
                    console.log("Text Auto Suggest: ", value);
                }}
                onClear={() => {
                    setTextValue("");
                }}
                validateInput={(e) => {
                    let { value } = e.target;
                    console.log("Validating input...");
                    console.log("Validated input: ", value);
                }}
            />
            <InputTextAutoSuggestHorizontal
                inputWidth='200px'
                name='testAutoSuggest'
                label='Test Label Auto Suggest'
                value={textValue}
                options={autoSuggestOptions}
                onChange={(e) => {
                    let { value } = e.target;
                    setTextValue(value);
                    console.log("Text Auto Suggest: ", value);
                }}
                onClear={() => {
                    setTextValue("");
                }}
                validateInput={(e) => {
                    let { value } = e.target;
                    console.log("Validating input...");
                    console.log("Validated input: ", value);
                }}
            />
        </React.Fragment>
    );
};

export default DatalistDropdownCreatableExample;
