// System library imports
import React from "react";

// Style imports
import "./style.scss";

import loadingButton from "../../gif/loading_button.gif";
import exitButton from "../../svg/exit_button.svg";
import { dateParse } from ".";

const InputDateVertical = (props) => {
    // Destructure props
    let {
        width,
        name,
        label,
        value,
        onChange,
        isRequired,
        isDisabled,
        isLogin,
        isLoading,
        clearData,
        hideClearData,
    } = props;

    // Normalize boolean value to true or false (handle null or undefined value)
    isRequired = isRequired ? true : false;
    isDisabled = isDisabled ? true : false;
    isLogin = isLogin ? true : false;

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
                <input
                    className={`reusable-input-vertical__input reusable-input-vertical__input--date ${
                        value && !hideClearData && "reusable-hide-clear-date"
                    }`}
                    value-with-format={
                        value !== "" &&
                        value !== undefined &&
                        value !== null &&
                        !value.includes("NaN")
                            ? dateParse(value)
                            : "dd mon yyyy"
                    }
                    type='date'
                    name={name}
                    value={value}
                    required={isRequired}
                    disabled={isDisabled}
                    onChange={onChange}
                />
                {value && !hideClearData && (
                    <div className='reusable-clear-date'>
                        <img src={exitButton} alt='flag' onClick={clearData} />
                    </div>
                )}
                {isLoading && <img src={loadingButton} alt='loading-button' />}
            </div>
        </div>
    );
};

export default InputDateVertical;
