// System library imports
import React from "react";

// Style imports
import "./style.scss";

import loadingButton from "../../gif/loading_button.gif";

const InputDropdownVertical = (props) => {
    // Destructure props
    let {
        width,
        name,
        label,
        value,
        options,
        onChange,
        isRequired,
        isDisabled,
        noEmptyOption,
        isLogin,
        isLoading,
    } = props;

    // Normalize boolean value to true or false (handle null or undefined value)
    isRequired = isRequired ? true : false;
    isDisabled = isDisabled ? true : false;
    noEmptyOption = noEmptyOption ? true : false;
    isLogin = isLogin ? true : false;
    isDisabled = isDisabled ? true : false;

    return (
        <div
            className='reusable-input-vertical'
            style={width ? { width: width } : {}}>
            <label
                className={
                    isLogin
                        ? "reusable-input-vertical__label reusable-input-vertical__label--login"
                        : "reusable-input-vertical__label"
                }>
                {isRequired ? `${label}*` : label}
            </label>
            <div className='reusable-button__loading'>
                <select
                    className='reusable-input-vertical__input reusable-input-vertical__select'
                    name={name}
                    value={value}
                    required={isRequired}
                    disabled={isLoading || isDisabled}
                    onChange={onChange}>
                    {!noEmptyOption && <option value=''>{""}</option>}
                    {options.map((item) => (
                        <option
                            value={
                                item.id
                                    ? item.id
                                    : item.value
                                    ? item.value
                                    : item
                            }
                            key={`${name}_${
                                item.id
                                    ? item.id
                                    : item.value
                                    ? item.value
                                    : item
                            }`}>
                            {item.name
                                ? item.name
                                : item.label
                                ? item.label
                                : item}
                        </option>
                    ))}
                </select>
                {isLoading && <img src={loadingButton} alt='loading-button' />}
            </div>
        </div>
    );
};

export default InputDropdownVertical;
