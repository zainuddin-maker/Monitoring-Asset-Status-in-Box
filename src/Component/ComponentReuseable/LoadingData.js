// System library imports
import React from "react";

// Image imports
import loadingData from "../../gif/loading_data.gif";

// Style imports
import "./style.scss";

// circular progressbar loading
import {
    CircularProgressbarWithChildren,
    buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const LoadingData = (props) => {
    // Destructure props
    let {
        size,
        backgroundOffset,
        isLoading,
        useAltBackground,
        useDarkBackground,
    } = props;

    return (
        <React.Fragment>
            {isLoading ? (
                <div
                    className={
                        useAltBackground
                            ? "reusable-loading-data reusable-loading-data--alt-background"
                            : useDarkBackground
                            ? "reusable-loading-data reusable-loading-data--dark-background"
                            : "reusable-loading-data"
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
                        src={loadingData}
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

const LoadingUploadFile = (props) => {
    // Destructure props
    let {
        percentage,
        size,
        backgroundOffset,
        useAltBackground,
        useDarkBackground,
    } = props;

    return (
        <React.Fragment>
            {percentage > 0 && percentage < 100 ? (
                <div
                    className={
                        useAltBackground
                            ? "reusable-loading-data reusable-loading-data--alt-background"
                            : useDarkBackground
                            ? "reusable-loading-data reusable-loading-data--dark-background"
                            : "reusable-loading-data"
                    }
                    style={{
                        height: backgroundOffset
                            ? `calc(100% - ${backgroundOffset})`
                            : null,
                        width: backgroundOffset
                            ? `calc(100% - ${backgroundOffset})`
                            : null,
                    }}>
                    <div
                        style={{
                            width: size || "200px",
                            height: size || "200px",
                        }}>
                        <CircularProgressbarWithChildren
                            value={percentage || 0}
                            background
                            backgroundPadding={10}
                            styles={buildStyles({
                                strokeLinecap: "butt",
                                backgroundColor: "#4244D4",
                                textColor: "#fff",
                                pathColor: "#fff",
                                trailColor: "#6991FF",
                            })}>
                            <div className='loading-progress'>
                                <span className='loading-progress-data'>{`${
                                    percentage || 0
                                }%`}</span>
                                <span className='loading-progress-title'>
                                    Uploading File
                                </span>
                            </div>
                        </CircularProgressbarWithChildren>
                    </div>
                </div>
            ) : null}
        </React.Fragment>
    );
};

export { LoadingData, LoadingUploadFile };
