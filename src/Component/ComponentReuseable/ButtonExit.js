// System library imports
import React from "react";

// Image imports
import exitButton from "../../svg/exit_button.svg";

// Style imports
import "./style.scss";

const ButtonExit = (props) => {
    // Destructure props
    let { hide } = props;

    return (
        <img
            className="reusable-button--exit"
            src={exitButton}
            alt="exit-button"
            onClick={() => {
                hide();
            }}
        />
    );
};

export default ButtonExit;
