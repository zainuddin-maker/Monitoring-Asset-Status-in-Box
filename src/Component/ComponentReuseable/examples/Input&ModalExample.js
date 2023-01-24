// Discard changes when committing. Only for testing
import React, { useState } from "react";

// Tested
import InputTextVertical from "../../ComponentReuseable/InputTextVertical";
import InputTextAreaVertical from "../../ComponentReuseable/InputTextAreaVertical";
import InputPasswordVertical from "../../ComponentReuseable/InputPasswordVertical";
import InputDropdownVertical from "../../ComponentReuseable/InputDropdownVertical";
import InputDateVertical from "../../ComponentReuseable/InputDateVertical";
import InputDatetimeVertical from "../../ComponentReuseable/InputDatetimeVertical";
import InputDropdownHorizontal from "../../ComponentReuseable/InputDropdownHorizontal";
import InputDateHorizontal from "../../ComponentReuseable/InputDateHorizontal";
import SearchBar from "../../ComponentReuseable/SearchBar";

import ModalDelete from "../../ComponentReuseable/ModalDelete";
import ModalContainer from "../../ComponentReuseable/ModalContainer";

import useModal from "../../ComponentReuseable/useModal";

const InputModalExample = () => {
    // Constants
    // const dropdownOptions = [
    //     { id: 1, name: "Option 1" },
    //     { id: 2, name: "Option 2" },
    //     { id: 3, name: "Option 3" },
    // ];

    const dropdownOptions = ["Option 1", "Option 2", "Option 3"];

    // States
    const [textValue, setTextValue] = useState("placeholder");
    const [passwordValue, setPasswordValue] = useState("placeholder_pass");
    const [dropdownValue, setDropdownValue] = useState(dropdownOptions[0].id);
    const [dateValue, setDateValue] = useState(new Date().toISOString());
    const [datetimeValue, setDatetimeValue] = useState(
        new Date().toISOString()
    );
    const [searchValue, setSearchValue] = useState("placeholder_search");

    // Modals
    const { isShowing: isShowingDeletePopup, toggle: toggleDeletePopup } =
        useModal();
    const { isShowing: isShowingCustomPopup, toggle: toggleCustomPopup } =
        useModal();
    const { isShowing: isShowingCustomPopup2, toggle: toggleCustomPopup2 } =
        useModal();

    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === "test") {
            setTextValue(value);
            console.log("Text: ", value);
        } else if (name === "testPassword") {
            setPasswordValue(value);
            console.log("Password: ", value);
        } else if (name === "testDropdown") {
            setDropdownValue(value);
            console.log("Dropdown: ", value);
        } else if (name === "testDate") {
            setDateValue(value);
            console.log("Date: ", value);
        } else if (name === "testDatetime") {
            setDatetimeValue(value);
            console.log("Datetime: ", value);
        }
    };

    return (
        <React.Fragment>
            <ModalDelete
                isShowing={isShowingDeletePopup}
                hide={toggleDeletePopup}
                deletedObjectType='Asset'
                deletedObjectName='CL-RCU-001'
                onDelete={() => {
                    console.log("Deleting Asset CL-RCU-001");
                    toggleDeletePopup();
                }}
                isLoading={false}
            />
            <ModalContainer
                title={`Custom Popup`}
                isShowing={isShowingCustomPopup}
                hide={toggleCustomPopup}
                submitName={"Submit"}
                onSubmit={() => {
                    console.log("Submitted!");
                    toggleCustomPopup2();
                }}
                clearName={"Clear"}
                onClear={() => {
                    console.log("Cleared!");
                    toggleCustomPopup();
                }}
                isLoading={false}
                showRequired={true}></ModalContainer>
            <ModalContainer
                level={2}
                title={`Custom Popup 2`}
                isShowing={isShowingCustomPopup2}
                hide={toggleCustomPopup2}></ModalContainer>
            <div className='reusable-test-container'>
                <InputTextVertical
                    width='200px'
                    name='test'
                    label='Test Label'
                    value={textValue}
                    onChange={handleChange}
                    isRequired={true}
                    isLogin={true}
                />
                <InputTextAreaVertical
                    height='100px'
                    width='200px'
                    name='test'
                    label='Test Label'
                    value={textValue}
                    onChange={handleChange}
                    isRequired={true}
                    isLogin={true}
                />
                <InputPasswordVertical
                    width='200px'
                    name='testPassword'
                    label='Test Label Password'
                    value={passwordValue}
                    onChange={handleChange}
                    isRequired={true}
                    isLogin={true}
                />
                <InputDropdownVertical
                    width='200px'
                    name='testDropdown'
                    label='Test Label Dropdown'
                    value={dropdownValue}
                    options={dropdownOptions}
                    onChange={handleChange}
                    isRequired={true}
                    isLogin={true}
                />
                <InputDateVertical
                    width='200px'
                    name='testDate'
                    label='Date:'
                    value={dateValue}
                    onChange={handleChange}
                    isRequired={true}
                />
                <InputDatetimeVertical
                    width='200px'
                    name='testDatetime'
                    label='Datetime:'
                    value={datetimeValue}
                    onChange={handleChange}
                    isRequired={true}
                />
                <div className='reusable-test-container__horizontal'>
                    <SearchBar
                        name='testSearch'
                        value={searchValue}
                        search={(item) => {
                            setSearchValue(item);
                            console.log(item);
                        }}
                        searchContent={() => {
                            console.log("Searching...");
                        }}
                    />
                    <InputDropdownHorizontal
                        labelWidth='50px'
                        inputWidth='200px'
                        name='testDropdown'
                        label='Test:'
                        value={dropdownValue}
                        options={dropdownOptions}
                        onChange={handleChange}
                        isRequired={true}
                    />
                    <InputDropdownHorizontal
                        labelWidth='50px'
                        inputWidth='200px'
                        name='testDropdown'
                        label='Test:'
                        value={dropdownValue}
                        options={dropdownOptions}
                        onChange={handleChange}
                        isRequired={true}
                        useAltColor={true}
                    />
                    <InputDateHorizontal
                        width='200px'
                        name='testDate'
                        label='Date:'
                        value={dateValue}
                        onChange={handleChange}
                        isRequired={true}
                    />
                    <InputDateHorizontal
                        width='200px'
                        name='testDate'
                        label='Date:'
                        value={dateValue}
                        onChange={handleChange}
                        isRequired={true}
                        useAltColor={true}
                    />
                </div>
                <button onClick={toggleDeletePopup}>Toggle Delete Popup</button>
                <button onClick={toggleCustomPopup}>Toggle Custom Popup</button>
                <button onClick={toggleCustomPopup2}>
                    Toggle Custom Popup 2
                </button>
            </div>
        </React.Fragment>
    );
};

export default InputModalExample;
