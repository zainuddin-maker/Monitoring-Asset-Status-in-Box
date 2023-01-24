import React, { useState, useEffect } from "react"; // System library imports
import RackContent from "./Component/RackContent";
import { Timer } from "../../ComponentReuseable";
import "./style.scss";

const Rack = () => {
    return (
        <div className='rack-container'>
            <div className='rack-header'>
                <div className='header-overview'>
                    <div className='page-title'>Rack Management</div>
                </div>
                <Timer />
            </div>
            <RackContent />
        </div>
    );
};

export default Rack;
