// System library imports
import React from "react";

const ConnectedItemCard = (props) => {
    // Destructure props
    let { backgroundColor, rackNumber, itemNumber, uStart, uNeeded } = props;

    return (
        <div
            className='connectivity-card'
            style={backgroundColor ? { backgroundColor: backgroundColor } : {}}>
            <div className='connectivity-card__rack'>
                <span>{`Rack # ${rackNumber}`}</span>
            </div>
            <div className='connectivity-card__u-item'>
                <span className='connectivity-card__u-item__u'>{`U#${uStart}${
                    uNeeded > 1 ? `-${uStart + uNeeded - 1}` : ""
                }`}</span>
                <div className='connectivity-card__u-item__item'>
                    <span>{`Item #${itemNumber}`}</span>
                </div>
            </div>
        </div>
    );
};

export default ConnectedItemCard;
