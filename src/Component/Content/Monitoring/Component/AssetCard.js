import React from "react";
import dummyImage from "../../../../image/image.png";
import redDot from "../../../../svg/circle-red.svg";
import greenDot from "../../../../svg/circle-green.svg";
import yellowDot from "../../../../svg/circle-yellow.svg";
import unknown from "../../../../svg/unknown.svg";
import SVG_preview from "../../../../svg/preview.svg";
import offline from "../../../../svg/not_connected_white.svg";
import alarmTriangle from "../../../../svg/alarm_triangle.svg";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";

import {
    Tooltip,
    PreviewImage,
    useModal,
} from "../../../ComponentReuseable/index";

const AssetCard = ({ assetData, handleClick, isHover, isPreview }) => {
    const image_prefix = "/filerepository/dcim/uploadFileFromAPI/";
    const { isShowing: isShowingPreview, toggle: togglePreview } = useModal();
    if (!assetData.status) {
        let dummy = {
            asset_number: "",
            asset_name: "",
            asset_image: dummyImage,
            floor_room: "",
            area: "",
            status: "",
            condition: "",
            total_timestamp: "",
        };
        assetData = { ...assetData, ...dummy };
    }
    return assetData ? (
        <div
            className={`${
                isHover ? "card-container" : "card-container-no-hover"
            }`}
            onClick={
                isHover ? () => handleClick(assetData.asset_number) : () => {}
            }>
            <PreviewImage
                src={
                    assetData.asset_image
                        ? ReturnHostBackend(
                              process.env.REACT_APP_BACKEND_NODELINX
                          ) +
                          image_prefix +
                          assetData.asset_image
                        : dummyImage
                }
                isShowing={isShowingPreview}
                hide={togglePreview}
            />
            <div className='card-header'>
                <div>{assetData.asset_number}</div>
                {!isPreview && (
                    <React.Fragment>
                        <div
                            className={`status-container ${assetData.status.toLowerCase()}`}>
                            <div>{assetData.status}</div>
                            <div>
                                {assetData.total_timestamp &&
                                    (assetData.total_timestamp[1] === ":"
                                        ? `0${assetData.total_timestamp}`
                                        : assetData.total_timestamp)}
                            </div>
                        </div>
                        <div className='condition-container'>
                            <img
                                style={
                                    assetData.status.toLowerCase() === "down"
                                        ? {
                                              paddingTop: "2px",
                                              paddingBottom: "2px",
                                              width: "20px",
                                          }
                                        : assetData.status.toLowerCase() ===
                                          "offline"
                                        ? {
                                              paddingTop: "2px",
                                              paddingBottom: "2px",
                                              width: "20px",
                                          }
                                        : { width: "20px" }
                                }
                                src={
                                    assetData.status.toLowerCase() === "down"
                                        ? alarmTriangle
                                        : assetData.status.toLowerCase() ===
                                          "offline"
                                        ? offline
                                        : assetData.condition.toLowerCase() ===
                                          "good"
                                        ? greenDot
                                        : assetData.condition.toLowerCase() ===
                                          "warning"
                                        ? yellowDot
                                        : assetData.condition.toLowerCase() ===
                                          "critical"
                                        ? redDot
                                        : unknown
                                }
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = dummyImage;
                                }}
                                alt='asset-condition'
                            />
                        </div>
                    </React.Fragment>
                )}
            </div>
            <div className='card-info'>
                <div className='image-container'>
                    <img
                        src={
                            assetData.asset_image
                                ? ReturnHostBackend(
                                      process.env.REACT_APP_BACKEND_NODELINX
                                  ) +
                                  image_prefix +
                                  assetData.asset_image
                                : dummyImage
                        }
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = dummyImage;
                        }}
                        alt='asset-image'
                    />
                    {isPreview && (
                        <div
                            className='image-container-preview'
                            onClick={
                                isPreview ? () => togglePreview() : () => {}
                            }>
                            <img src={SVG_preview} />
                        </div>
                    )}
                </div>
                <div className='info-container'>
                    <div className='asset-name'>
                        <span>Asset Name</span>
                        <div>{assetData.asset_name}</div>
                    </div>

                    <div className='card-grid'>
                        <div>
                            <span
                                style={{
                                    display: "block",
                                    width: "100%",
                                    textAlign: "left",
                                }}>
                                Function
                            </span>
                            <div>{assetData.function}</div>
                        </div>
                        <div>
                            <span>Floor-Room</span>
                            <div>{assetData.floor_room}</div>
                        </div>
                        <div>
                            <span>Area</span>
                            <div>{assetData.area}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : null;
};

export default AssetCard;
