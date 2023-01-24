// System library imports
import { useState } from "react";

const useModal = () => {
    // State
    const [isShowing, setIsShowing] = useState(false);

    // Function
    const toggle = () => {
        setIsShowing(!isShowing);
    };

    return {
        isShowing,
        toggle,
    };
};

export default useModal;
