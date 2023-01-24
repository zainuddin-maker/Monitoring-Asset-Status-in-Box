// System library imports
import React from "react";

// Style imports
import "./style.scss";

import loadingButton from "../../gif/loading_button.gif";
import exitButton from "../../svg/exit_button.svg";
import { dateParse } from ".";

const InputDateHorizontal = (props) => {
    // Destructure props
    let {
        labelWidth,
        inputWidth,
        name,
        label,
        value,
        onChange,
        isRequired,
        isDisabled,
        useAltColor,
        isLoading,
        clearData,
        hideClearData,
    } = props;

    // Normalize boolean value to true or false (handle null or undefined value)
    isRequired = isRequired ? true : false;
    isDisabled = isDisabled ? true : false;
    useAltColor = useAltColor ? true : false;

    return (
        <div className='reusable-input-horizontal'>
            <label
                className='reusable-input-horizontal__label'
                style={labelWidth ? { width: labelWidth } : {}}>
                {isRequired ? `${label}*:` : `${label}:`}
            </label>
            <div className='reusable-button__loading'>
                <input
                    className={
                        useAltColor
                            ? `reusable-input-horizontal__input reusable-input-horizontal__input--date reusable-input-horizontal__input--alt-color ${
                                  value &&
                                  !hideClearData &&
                                  "reusable-hide-clear-date"
                              }`
                            : `reusable-input-horizontal__input reusable-input-horizontal__input--date ${
                                  value &&
                                  !hideClearData &&
                                  "reusable-hide-clear-date"
                              }`
                    }
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
                    style={inputWidth ? { width: inputWidth } : {}}
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

export default InputDateHorizontal;
