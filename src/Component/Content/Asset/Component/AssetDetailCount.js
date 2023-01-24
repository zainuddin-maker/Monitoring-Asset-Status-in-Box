import React, { useState, useEffect } from "react";
import axios from "axios";

import "../style.scss";

import { LoadingData } from "../../../ComponentReuseable/index";
import { getToken } from "../../../TokenParse/TokenParse";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { toast } from "react-toastify";

function AssetDetailCount(props) {
    const { assetCounts, isLoadingAssetCount } = props;
    const [isLoading, setIsLoading] = useState(isLoadingAssetCount);
    const [assetCount, setAssetCount] = useState({});

    useEffect(() => {
        setAssetCount(assetCounts);
    }, [assetCounts]);

    useEffect(() => {
        setIsLoading(isLoadingAssetCount);
    }, [isLoadingAssetCount]);

    // // Call API to get Asset count
    // useEffect(() => {
    //     const getAssetCount = async () => {
    //         let config = {
    //             method: "post",
    //             url:
    //                 ReturnHostBackend(process.env.REACT_APP_SERVICES) +
    //                 process.env.REACT_APP_ASSET_GET_COUNTS,
    //             headers: {
    //                 authorization: getToken(),
    //             },
    //         };

    //         try {
    //             const result = await axios(config);

    //             if (result.status === 200) {
    //                 setAssetCount(result.data);
    //             } else {
    //                 toast.error("Error getting asset counts data");
    //             }
    //         } catch (e) {
    //             toast.error("Error calling APi to get asset counts data");
    //         }
    //     };
    //     (async () => {
    //         setIsLoading(true);
    //         await getAssetCount();
    //         setIsLoading(false);
    //     })();
    // }, []);

    return (
        <div className='asset-count'>
            <LoadingData isLoading={isLoading} useAltBackground={false} />
            <div className='asset-count-total'>
                <h1>Total</h1>
                <span>
                    {assetCount === undefined || assetCount === null
                        ? "---"
                        : assetCount.total}
                </span>
            </div>
            <div className='asset-count-power-system'>
                <p>Power</p>
                <span
                    style={{
                        backgroundColor: "hsla(52, 86%, 33%, 0.3)",
                        color: "hsla(41, 100%, 50%, 1)",
                    }}>
                    {assetCount == undefined
                        ? "---"
                        : assetCount["Power System"] === undefined
                        ? 0
                        : assetCount["Power System"]}
                </span>
            </div>
            <div className='asset-count-coolling-system'>
                <p>Cooling</p>
                <span
                    style={{
                        backgroundColor: "hsla(239, 63%, 55%, 0.3)",
                        color: "hsla(203, 99%, 63%, 1)",
                    }}>
                    {assetCount == undefined
                        ? "---"
                        : assetCount["Cooling System"] === undefined
                        ? 0
                        : assetCount["Cooling System"]}
                </span>
            </div>
            <div className='asset-count-environment-sensing'>
                <p>Temp & Hum</p>
                <span
                    style={{
                        backgroundColor: "hsla(135, 100%, 33%, 0.3)",
                        color: "hsla(135, 87%, 62%, 1)",
                    }}>
                    {assetCount == undefined
                        ? "---"
                        : assetCount["Temperature & Humidity Sensing"] ===
                          undefined
                        ? 0
                        : assetCount["Temperature & Humidity Sensing"]}
                </span>
            </div>
            <div className='asset-count-camera'>
                <p>Camera</p>
                <span
                    style={{
                        backgroundColor: "hsla(6, 14%, 40%, 0.3)",
                        color: "hsla(8, 26%, 66%, 1)",
                    }}>
                    {assetCount == undefined
                        ? "---"
                        : assetCount["Camera System"] === undefined
                        ? 0
                        : assetCount["Camera System"]}
                </span>
            </div>
            <div className='asset-count-access-system'>
                <p>Access</p>
                <span
                    style={{
                        backgroundColor: "hsla(104, 100%, 60%, 0.3)",
                        color: "hsla(104, 100%, 60%, 1)",
                    }}>
                    {assetCount == undefined
                        ? "---"
                        : assetCount["Access System"] === undefined
                        ? 0
                        : assetCount["Access System"]}
                </span>
            </div>
            <div className='asset-count-fire-system'>
                <p>Fire</p>
                <span
                    style={{
                        backgroundColor: "hsla(356, 90%, 34%, 0.3)",
                        color: "hsla(356, 88%, 53%, 1)",
                    }}>
                    {assetCount == undefined
                        ? "---"
                        : assetCount["Fire System"] === undefined
                        ? 0
                        : assetCount["Fire System"]}
                </span>
            </div>
            <div className='asset-count-smoke-detection'>
                <p>Smoke</p>
                <span
                    style={{
                        backgroundColor: "hsla(0, 0%, 62%, 0.3)",
                        color: "hsla(0, 0%, 62%, 1)",
                    }}>
                    {assetCount == undefined
                        ? "---"
                        : assetCount["Smoke Detection"] === undefined
                        ? 0
                        : assetCount["Smoke Detection"]}
                </span>
            </div>
            <div className='asset-count-water-leak-detection'>
                <p>Water Leak</p>
                <span
                    style={{
                        backgroundColor: "hsla(240, 100%, 61%, 0.3)",
                        color: "hsla(240, 100%, 61%, 1)",
                    }}>
                    {assetCount == undefined
                        ? "---"
                        : assetCount["Water Leak Detection"] === undefined
                        ? 0
                        : assetCount["Water Leak Detection"]}
                </span>
            </div>
            <div className='asset-count-gas-leak-detection'>
                <p>Gas Leak</p>
                <span
                    style={{
                        backgroundColor: "hsla(300, 100%, 51%, 0.3)",
                        color: "hsla(300, 100%, 51%, 1)",
                    }}>
                    {assetCount == undefined
                        ? "---"
                        : assetCount["Gas Leak Detection"] === undefined
                        ? 0
                        : assetCount["Gas Leak Detection"]}
                </span>
            </div>
            <div className='asset-count-network'>
                <p>Network</p>
                <span
                    style={{
                        backgroundColor: "hsla(180, 100%, 50%, 0.3)",
                        color: "hsla(180, 100%, 50%, 1)",
                    }}>
                    {assetCount == undefined
                        ? "---"
                        : assetCount["Network"] === undefined
                        ? 0
                        : assetCount["Network"]}
                </span>
            </div>
        </div>
    );
}

export default AssetDetailCount;
