import React from "react";

import "./style.scss";

const NotFound = (props) => {
    return (
        <div className='content-page-not-found-desktop'>
            <div>
                <span className='page-not-found-number'>404</span>
                <span className='page-not-found-value'>Not Found</span>
                <span className='page-not-found-description'>
                    The resource requested could not be found on this server
                </span>
            </div>
        </div>
    );
};

export default NotFound;
