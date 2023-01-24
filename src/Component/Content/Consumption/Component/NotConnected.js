// System library imports
import React from "react";

// Image imports
import notConnectSvg from "../../../../image/not-connected.png";

const NotConnected = (props) => {
    // Destructure props
    let {
        size,
        backgroundOffset,
        isConnected,
        useAltBackground,
        useDarkBackground,
    } = props;

    return (
        <React.Fragment>
            {!isConnected ? (
                <div
                    className={
                        useAltBackground
                            ? "reusable-loading-data reusable-loading-data--alt-background consumption-not-connected"
                            : useDarkBackground
                            ? "reusable-loading-data reusable-loading-data--dark-background consumption-not-connected"
                            : "reusable-loading-data consumption-not-connected"
                    }
                    style={{
                        height: backgroundOffset
                            ? `calc(100% - ${backgroundOffset})`
                            : null,
                        width: backgroundOffset
                            ? `calc(100% - ${backgroundOffset})`
                            : null,
                    }}>
                    <img
                        className='reusable-loading-data__gif'
                        src={notConnectSvg}
                        alt='loading-data'
                        style={{
                            height: size ? size : "200px",
                            width: size ? size : "200px",
                        }}
                    />
                </div>
            ) : null}
        </React.Fragment>
    );
};

export default NotConnected;
