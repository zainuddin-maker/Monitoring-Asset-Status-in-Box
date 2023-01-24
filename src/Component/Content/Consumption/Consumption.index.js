// System library imports
import React, { useState } from "react";

// Custom library imports
import ConsumptionHeader from "./Component/ConsumptionHeader";
import ConsumptionLoad from "./Component/ConsumptionLoad";
import ConsumptionChart from "./Component/ConsumptionChart";
import PUEChart from "./Component/PUEChart";
import Legend from "../Legend/Legend.index";
import {
    generateDateGMT8,
    ButtonDetail,
    useModal,
} from "../../ComponentReuseable";

// Style imports
import "./style.scss";

// Constants
const isConnectedWUE = {
    usage: true,
    supply: true,
    return: true,
};

const isConnectedPUE = {
    it: true,
    nonIt: true,
};

const Consumption = () => {
    // States
    const { isShowing: isShowingLegend, toggle: toggleLegend } = useModal();
    const [filter, setFilter] = useState({
        interval: {
            id: "daily",
            name: "Daily",
        },
    });
    const [startDate, setStartDate] = useState(
        generateDateGMT8(new Date()).toISOString().slice(0, 10)
    );

    return (
        <div className='consumption-container consumption-bg-darkblue'>
            <Legend
                isShowing={isShowingLegend}
                hide={toggleLegend}
                type={"consumption"}
            />
            <ConsumptionHeader
                filter={filter}
                setFilter={setFilter}
                startDate={startDate}
                setStartDate={setStartDate}
            />
            <div className='consumption-content-container'>
                <ConsumptionLoad
                    filter={filter}
                    startDate={startDate}
                    isConnectedWUE={isConnectedWUE}
                    isConnectedPUE={isConnectedPUE}
                />
                <div className='consumption-chart-container'>
                    <PUEChart
                        filter={filter}
                        startDate={startDate}
                        isConnectedWUE={isConnectedWUE}
                        isConnectedPUE={isConnectedPUE}
                    />
                    <ConsumptionChart
                        filter={filter}
                        startDate={startDate}
                        isConnectedWUE={isConnectedWUE}
                        isConnectedPUE={isConnectedPUE}
                    />
                </div>
            </div>
            <ButtonDetail onClick={toggleLegend} />
        </div>
    );
};

export default Consumption;
