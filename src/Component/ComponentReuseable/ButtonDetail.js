// System library imports
import React from "react";

// Image imports
import detailIcon from "../../svg/detail_icon.svg";

// Style imports
import "./style.scss";

const ButtonDetail = (props) => {
    // Destructure props
    let { onClick } = props;

    return (
        <div className='reusable-button--detail' onClick={() => onClick()}>
            <img
                className='reusable-button--detail__icon'
                src={detailIcon}
                alt='detail-icon'
            />
        </div>
    );
};

export default ButtonDetail;
