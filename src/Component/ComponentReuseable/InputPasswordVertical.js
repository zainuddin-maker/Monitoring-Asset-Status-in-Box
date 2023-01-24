// System library imports
import React, { useState } from "react";

// Image imports
import EyeSolid from "../../svg/eye-icon.svg";
import EyeSlash from "../../svg/eye-icon-slashed.svg";
import loadingButton from "../../gif/loading_button.gif";

// Style imports
import "./style.scss";

const InputPasswordVertical = (props) => {
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
    } = props;

    // Normalize boolean value to true or false (handle null or undefined value)
    isRequired = isRequired ? true : false;
    isDisabled = isDisabled ? true : false;
    isLogin = isLogin ? true : false;

    // States
    const [isVisible, setVisibility] = useState(false);

    // Functions
    const toggleVisibility = () => {
        setVisibility((prevState) => !prevState);
    };

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
            <div className='reusable-input-vertical__password'>
                <input
                    className='reusable-input-vertical__input'
                    type={isVisible ? "text" : "password"}
                    name={name}
                    value={value}
                    required={isRequired}
                    disabled={isDisabled}
                    onChange={onChange}
                />
                <img
                    className='reusable-input-vertical__password__eye-icon'
                    src={isVisible ? EyeSolid : EyeSlash}
                    alt='eye-icon'
                    onClick={() => {
                        toggleVisibility();
                    }}
                />
                {isLoading && (
                    <div className='reusable-filter-data-loading'>
                        <img src={loadingButton} alt='loading-button' />
                    </div>
                )}
            </div>
        </div>
    );
};

export default InputPasswordVertical;
