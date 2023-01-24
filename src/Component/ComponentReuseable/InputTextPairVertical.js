// System library imports
import React from "react";

// Style imports
import "./style.scss";

import loadingButton from "../../gif/loading_button.gif";

const InputTextPairVertical = (props) => {
    // Destructure props
    let {
        width,
        label,
        sideLabel,
        nameFirst,
        valueFirst,
        onChangeFirst,
        nameSecond,
        valueSecond,
        onChangeSecond,
        isRequired,
        isRequiredSecond,
        isDisabled,
        isDisabledSecond,
        isLogin,
        isLoading,
        secondIsLoading,
    } = props;

    // Normalize boolean value to true or false (handle null or undefined value)
    isRequired = isRequired ? true : false;
    isRequiredSecond = isRequiredSecond ? true : false;
    isDisabled = isDisabled ? true : false;
    isDisabledSecond = isDisabledSecond ? true : false;
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
            <div className='reusable-input-vertical__pair-container'>
                {sideLabel ? <span>{sideLabel}</span> : null}
                <div className='reusable-button__loading'>
                    <input
                        className='reusable-input-vertical__input reusable-input-vertical__input--pair'
                        type='text'
                        name={nameFirst}
                        value={valueFirst}
                        required={isRequired}
                        disabled={isDisabled}
                        onChange={onChangeFirst}
                    />
                    {isLoading && (
                        <img src={loadingButton} alt='loading-button' />
                    )}
                </div>
                <span>{"-"}</span>
                <div className='reusable-button__loading'>
                    <input
                        className='reusable-input-vertical__input reusable-input-vertical__input--pair'
                        type='text'
                        name={nameSecond}
                        value={valueSecond}
                        required={isRequiredSecond}
                        disabled={isDisabledSecond}
                        onChange={onChangeSecond}
                    />
                    {secondIsLoading && (
                        <img src={loadingButton} alt='loading-button' />
                    )}
                </div>
            </div>
        </div>
    );
};

export default InputTextPairVertical;
