// System library imports
import React, { useState, useEffect } from "react";

// Image imports
import exitButton from "../../svg/exit_button.svg";
import loadingButton from "../../gif/loading_button.gif";

// Style imports
import "./style.scss";

const InputTextAutoSuggestHorizontal = (props) => {
    // Destructure props
    let {
        labelWidth,
        inputWidth,
        name,
        label,
        value,
        options,
        onChange,
        onClear,
        validateInput,
        isRequired,
        isDisabled,
        useAltColor,
        isLoading,
        isResponsive,
    } = props;

    // Normalize boolean value to true or false (handle null or undefined value)
    isRequired = isRequired ? true : false;
    isDisabled = isDisabled ? true : false;
    isResponsive = isResponsive ? true : false;

    // States
    const [maxLabelLength, setMaxLabelLength] = useState(0);
    const [showClearButton, setShowClearButton] = useState(false);

    // Side-effects
    useEffect(() => {
        // Find maximum length of the options
        let max = 0;

        if (options && options.length > 0) {
            options.forEach((opt) => {
                if (opt.name) {
                    max = opt.name.length > max ? opt.name.length : max;
                } else if (opt.label) {
                    max = opt.label.length > max ? opt.label.length : max;
                } else if (opt) {
                    max = opt.length > max ? opt.length : max;
                }
            });
        }

        setMaxLabelLength(max);
    }, [options]);

    return (
        <div className='reusable-input-horizontal'>
            {label && (
                <label
                    className='reusable-input-horizontal__label'
                    style={labelWidth ? { width: labelWidth } : {}}>
                    {isRequired ? `${label}*:` : `${label}:`}
                </label>
            )}
            <div className='reusable-input-horizontal__datalist'>
                <div className='reusable-button__loading'>
                    <input
                        className={
                            useAltColor
                                ? "reusable-input-horizontal__datalist__input reusable-input-horizontal__datalist__input--alt-color"
                                : "reusable-input-horizontal__datalist__input"
                        }
                        type='text'
                        list={name}
                        name={name}
                        value={value}
                        required={isRequired}
                        disabled={isLoading || isDisabled}
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
                        autoComplete='off'
                        style={{
                            width:
                                options.length > 0
                                    ? isResponsive
                                        ? `${maxLabelLength * 16 + 16}px`
                                        : "auto"
                                    : inputWidth || "100px",
                            opacity: isDisabled ? "0.7" : null,
                        }}
                    />
                    {isLoading && (
                        <img src={loadingButton} alt='loading-button' />
                    )}
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
                </div>
                {onClear && showClearButton ? (
                    <div
                        className='reusable-input-horizontal__datalist__clear-button'
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

export default InputTextAutoSuggestHorizontal;
