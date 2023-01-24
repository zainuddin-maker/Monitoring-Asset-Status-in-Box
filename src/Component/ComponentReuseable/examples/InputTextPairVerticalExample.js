import React, { useState } from "react";

import "./style.scss";

import { InputTextPairVertical } from "../../ComponentReuseable/index";

const InputTextPairVerticalExample = (props) => {
    const [location, setLocation] = useState("B26");
    const [area, setArea] = useState("10");
    const [rackUnitNumberFirst, setRackUnitNumberFirst] = useState("10");
    const [rackUnitNumberSecond, setRackUnitNumberSecond] = useState("3");

    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === "location") {
            setLocation(value);
            console.log("Location: ", value);
        } else if (name === "area") {
            setArea(value);
            console.log("Area: ", value);
        } else if (name === "rack-unit-first") {
            setRackUnitNumberFirst(value);
            console.log("Rack Unit First: ", value);
        } else if (name === "rack-unit-second") {
            setRackUnitNumberSecond(value);
            console.log("Rack Unit Second: ", value);
        }
    };

    return (
        <React.Fragment>
            <InputTextPairVertical
                width='150px'
                label='Location - Area'
                nameFirst='location'
                valueFirst={location}
                onChangeFirst={handleChange}
                nameSecond='area'
                valueSecond={area}
                onChangeSecond={handleChange}
                isRequired={false}
            />
            <InputTextPairVertical
                width='150px'
                label='Change To'
                sideLabel='U#'
                nameFirst='rack-unit-first'
                valueFirst={rackUnitNumberFirst}
                onChangeFirst={handleChange}
                nameSecond='rack-unit-second'
                valueSecond={rackUnitNumberSecond}
                onChangeSecond={handleChange}
                isRequired={false}
            />
        </React.Fragment>
    );
};

export default InputTextPairVerticalExample;
