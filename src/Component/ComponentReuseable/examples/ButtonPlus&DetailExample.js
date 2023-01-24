import React from "react";

import "./style.scss";

import ButtonDetail from "../../ComponentReuseable/ButtonDetail";
import ButtonPlus from "../../ComponentReuseable/ButtonPlus";

const ButtonPlusDetailExample = (props) => {
    return (
        <React.Fragment>
            <ButtonDetail
                onClick={() => {
                    console.log("Detail Button is clicked!");
                }}
            />
            <ButtonPlus
                onClick={() => {
                    console.log("Plus Button is clicked!");
                }}
            />
        </React.Fragment>
    );
};

export default ButtonPlusDetailExample;
