// System library imports
import React from "react";

const DetailRackBox = (props) => {
    // Destructure props
    let {
        selected, // boolean
        onClick, // function
        menu, // string
        subMenu, // string
        pduName, // string
        value, // number
        unit, // string
        warningThreshold, // string
        criticalThreshold, // string
    } = props;

    return (
        <div
            className='boxofapparentandactive'
            style={{ border: selected ? "5px solid #4244D4" : "" }}
            onClick={onClick}>
            <div className='boxofapparentandactive__header'>
                {`${pduName} ${subMenu} ${menu}`}
            </div>

            <div className='boxofapparentandactive__valuetittle'>Value</div>

            <div className='boxofapparentandactive__value'>
                <div className='boxofapparentandactive__value__number'>
                    {value !== null && !isNaN(value) ? value : "---"}
                </div>
                <div className='boxofapparentandactive__value__satuan'>
                    {unit ? unit : "---"}
                </div>
            </div>

            <div className='threshold-rack-consumption'>
                <div className='threshold-rack-consumption__warning'>
                    <div className='threshold-rack-consumption__warning__tittle'>
                        Warning
                    </div>
                    <div className='threshold-rack-consumption__warning__value'>
                        {warningThreshold ? warningThreshold : "---"}
                    </div>
                </div>
                <div className='threshold-rack-consumption__warning'>
                    <div className='threshold-rack-consumption__warning__tittle'>
                        Critical
                    </div>
                    <div className='threshold-rack-consumption__warning__value'>
                        {criticalThreshold ? criticalThreshold : "---"}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailRackBox;
