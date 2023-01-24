// System library imports
import React from "react";

// Style imports
import "./style.scss";

import loadingButton from "../../gif/loading_button.gif";

const InputTextAreaVertical = (props) => {
    // Destructure props
    let {
        height,
        width,
        name,
        label,
        value,
        onChange,
        isRequired,
        isDisabled,
        isLogin,
        isLoading,
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
                <textarea
                    className='reusable-input-vertical__input reusable-input-vertical__input--textarea'
                    name={name}
                    value={value}
                    required={isRequired}
                    disabled={isDisabled}
                    onChange={onChange}
                    style={height ? { height: height } : {}}
                />
                {isLoading && <img src={loadingButton} alt='loading-button' />}
            </div>
        </div>
    );
};

export default InputTextAreaVertical;
