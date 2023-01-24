// System library imports
import React, { useState } from "react";

// Image imports
import exitButton from "../../svg/exit_button.svg";
import loadingButton from "../../gif/loading_button.gif";

// Style imports
import "./style.scss";

const InputTextAutoSuggestVertical = (props) => {
    // Destructure props
    let {
        width,
        name,
        label,
        value,
        options,
        onChange,
        onClear,
        validateInput,
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
    const [showClearButton, setShowClearButton] = useState(false);

    return (
        <div
            className='reusable-input-vertical'
            style={width ? { width: width } : {}}>
            {options.length > 0 ? (
                <datalist id={name}>
                    {options.map((item, index) => (
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
                </datalist>
            ) : null}

            <label
                className={
                    isLogin
                        ? "reusable-input-vertical__label reusable-input-vertical__label--login"
                        : "reusable-input-vertical__label"
                }>
                {isRequired ? `${label}*` : label}
            </label>
            <div className='reusable-input-vertical__datalist'>
                <div className='reusable-button__loading'>
                    <input
                        className='reusable-input-vertical__datalist__input'
                        type='text'
                        list={name}
                        name={name}
                        value={value}
                        required={isRequired}
                        disabled={isDisabled}
                        onChange={onChange}
                        onFocus={() => {
                            setShowClearButton(true);
                        }}
                        onBlur={
                            validateInput
                                ? (e) => {
                                      setShowClearButton(false);
                                      validateInput(e);
                                  }
                                : () => {
                                      setShowClearButton(false);
                                  }
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && validateInput) {
                                validateInput(e);
                            }
                        }}
                        style={{
                            opacity: isDisabled ? "0.7" : null,
                        }}
                        autoComplete='off'
                    />
                    {isLoading && (
                        <img src={loadingButton} alt='loading-button' />
                    )}
                </div>
                {onClear && showClearButton ? (
                    <div
                        className='reusable-input-vertical__datalist__clear-button'
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClear && onClear();
                        }}>
                        <img src={exitButton} alt='clear-datalist-icon'></img>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default InputTextAutoSuggestVertical;
