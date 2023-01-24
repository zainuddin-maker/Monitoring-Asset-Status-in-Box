// System library imports
import React from "react";
import CreatableSelect from "react-select/creatable";
import { components } from "react-select";

// Image imports
import exitButton from "../../svg/exit_button.svg";
import loadingButton from "../../gif/loading_button.gif";

// Style imports
import "./style.scss";

const Option = (props) => {
    return (
        <div className='reusable-input-vertical__dropdown-creatable__option-container'>
            <components.Option {...props} />
            {!props.options.find((item) => item.__isNew__) && (
                <img
                    className='reusable-input-vertical__dropdown-creatable__delete-icon'
                    src={exitButton}
                    alt='flag'
                    onClick={() =>
                        props.selectProps.onDeleteOption(
                            props.data,
                            props.value
                        )
                    }
                />
            )}
        </div>
    );
};

const InputDropdownCreatableVertical = (props) => {
    // Destructure props
    let {
        labelWidth,
        inputWidth,
        label,
        value,
        options,
        onSelect,
        onCreateOption,
        onDeleteOption,
        isLoading,
        isRequired,
        isDisabled,
    } = props;

    const customStyles = {
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? "#4244d4" : "#333454",
        }),
        container: (provided) => ({
            ...provided,
            width: inputWidth ? inputWidth : null,
        }),
    };

    return (
        <div className='reusable-input-horizontal'>
            {label && (
                <label
                    className='reusable-input-horizontal__label'
                    style={labelWidth ? { width: labelWidth } : {}}>
                    {isRequired ? `${label}*:` : `${label}:`}
                </label>
            )}
            <div style={{ position: "relative" }}>
                {isLoading && (
                    <div className='reusable-filter-data-loading'>
                        <img src={loadingButton} alt='loading-button' />
                    </div>
                )}

                <CreatableSelect
                    formatCreateLabel={(userInput) => `Create "${userInput}"`}
                    placeholder={""}
                    noOptionsMessage={() => "---"}
                    components={{ Option }}
                    className='reusable-input-horizontal__dropdown-creatable'
                    classNamePrefix='reusable-input-horizontal__dropdown-creatable'
                    isDisabled={isDisabled || isLoading}
                    onChange={onSelect}
                    onCreateOption={onCreateOption}
                    onDeleteOption={onDeleteOption}
                    options={options}
                    value={value}
                    styles={customStyles}
                />
            </div>
        </div>
    );
};

export default InputDropdownCreatableVertical;
