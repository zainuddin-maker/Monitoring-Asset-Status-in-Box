import React, { useState, useEffect } from "react";
import ItemContent from "./Component/ItemContent";
import { Timer } from "../../ComponentReuseable";
import { LoadingData } from "../../ComponentReuseable";
import "./style.scss";

const Item = () => {
    return (
        <div className='item-container'>
            <div className='item-header'>
                <div className='header-overview'>
                    <div className='page-title'>Item Management</div>
                </div>
                <Timer />
            </div>
            <ItemContent />
        </div>
    );
};

export default Item;
