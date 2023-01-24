// System library imports
import React from "react";

// Custom library imports
import Tooltip from "./Tooltip";

// Image imports
import plusIcon from "../../svg/plus_icon.svg";

// Style imports
import "./style.scss";

const ButtonPlus = (props) => {
    // Destructure props
    let { name, onClick } = props;

    return (
        <Tooltip
            tooltip={
                <span className='reusable-button--plus__tooltip'>{`Add ${name}`}</span>
            }>
            <div className='reusable-button--plus' onClick={() => onClick()}>
                <img
                    className='reusable-button--plus__icon'
                    src={plusIcon}
                    alt='plus-icon'
                />
            </div>
        </Tooltip>
    );
};

export default ButtonPlus;
