// System library imports
import React from "react";

// Image imports
import loadingButton from "../../gif/loading_button.gif";

// Style imports
import "./style.scss";

const ButtonSubmit = (props) => {
    // Destructure props
    let { name, formId, onSubmit, isLoading, isDisabled } = props;

    // Normalize boolean value to true or false (handle null or undefined value)
    isLoading = isLoading ? true : false;
    isDisabled = isDisabled ? true : false;

    return (
        <React.Fragment>
            {isLoading ? (
                <button
                    className='reusable-button reusable-button--submit'
                    type='button'>
                    <div className='reusable-button__loading'>
                        <img src={loadingButton} alt='loading-button' />
                    </div>
                </button>
            ) : (
                <button
                    className={
                        !isDisabled
                            ? "reusable-button reusable-button--submit"
                            : "reusable-button reusable-button--submit reusable-button reusable-button--disabled"
                    }
                    onClick={
                        formId || isLoading || isDisabled ? () => {} : onSubmit
                    }
                    type={isLoading || isDisabled ? "button" : "submit"}
                    form={formId}>
                    <span>{name}</span>
                </button>
            )}
        </React.Fragment>
    );
};

export default ButtonSubmit;
