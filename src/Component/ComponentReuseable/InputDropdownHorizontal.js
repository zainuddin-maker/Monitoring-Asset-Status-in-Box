// System library imports
import React from "react";

// Style imports
import "./style.scss";

// loading data
import loadingButton from "../../gif/loading_button.gif";

const InputDropdownHorizontal = (props) => {
    // Destructure props
    let {
        labelWidth,
        inputWidth,
        name,
        label,
        value,
        options,
        onChange,
        isRequired,
        isDisabled,
        noEmptyOption,
        useAltColor,
        isLoading,
    } = props;

    // Normalize boolean value to true or false (handle null or undefined value)
    isRequired = isRequired ? true : false;
    isDisabled = isDisabled ? true : false;
    noEmptyOption = noEmptyOption ? true : false;
    useAltColor = useAltColor ? true : false;

    return (
        <div className='reusable-input-horizontal'>
            {label ? (
                <label
                    className='reusable-input-horizontal__label'
                    style={labelWidth ? { width: labelWidth } : {}}>
                    {isRequired ? `${label}*:` : `${label}:`}
                </label>
            ) : null}
            <div className='reusable-button__loading'>
                <select
                    className={
                        useAltColor
                            ? "reusable-input-horizontal__input reusable-input-horizontal__select reusable-input-horizontal__input--alt-color"
                            : "reusable-input-horizontal__input reusable-input-horizontal__select"
                    }
                    name={name}
                    value={value}
                    required={isRequired}
                    disabled={isLoading || isDisabled}
                    onChange={onChange}
                    style={{
                        width:
                            options.length > 0 ? "auto" : inputWidth || "100px",
                    }}>
                    {!noEmptyOption && <option value=''>{""}</option>}
                    {options.map((item) => (
                        <option
                            value={item.id ? item.id : item}
                            key={`${name}_${item.id ? item.id : item}`}>
                            {item.name ? item.name : item}
                        </option>
                    ))}
                </select>
                {isLoading && <img src={loadingButton} alt='loading-button' />}
            </div>
        </div>
    );
};

export default InputDropdownHorizontal;
