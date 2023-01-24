// System library imports
import React from "react";

// Image imports
import itemToConnectedsArrow from "../../../../svg/item_to_connecteds_arrow.svg";

const RackToConnectedItems = () => {
    return (
        <div className='connectivity-rack-to-connected-items'>
            <img
                src={itemToConnectedsArrow}
                alt='rack-to-connected-item-arrow'
            />
        </div>
    );
};

export default RackToConnectedItems;
