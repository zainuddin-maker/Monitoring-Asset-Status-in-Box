// System library imports
import React from "react";

const RackItem = (props) => {
    const dummyArray = Array(45).fill({});

    return (
        <div className='connectivity-rack'>
            {dummyArray.map((item, index) => {
                return (
                    <div key={index} className='connectivity-rack__row'>
                        <span className='connectivity-rack__row__number'>{`${
                            index + 1
                        }`}</span>
                        <div className='connectivity-rack__row__content' />
                    </div>
                );
            })}
        </div>
    );
};

export default RackItem;
