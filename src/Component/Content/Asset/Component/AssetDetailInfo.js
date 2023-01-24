import React, { useState, useEffect } from "react";
import axios from "axios";
import "../style.scss";
import data_sheet_icon from "../../../../svg/data-sheet-icon.svg";
import write_icon from "../../../../svg/write-icon.svg";
import delete_icon from "../../../../svg/delete-icon.svg";

import {
    Tooltip,
    ModalDelete,
    useModal,
    LoadingData,
    PreviewImage,
    getUAC,
    getUACWithoutToast,
} from "../../../ComponentReuseable/index";

import { ReturnHostBackend } from "../../../BackendHost/BackendHost";

import { getToken } from "../../../TokenParse/TokenParse";
import { toast } from "react-toastify";
import ModalContainerAssetUpdatePop from "./AssetUpdatePop";
// import DatasheetModal from "../../Rack/Component/DatasheetModal";
import DatasheetModal from "../../Datasheet/DatasheetModal";
import SVG_preview from "../../../../svg/preview.svg";
import SVG_blank_image from "../../../../svg/blank_image.svg";

function formatDate(date) {
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    var d = new Date(date),
        month = months[d.getMonth()],
        day = d.getDate(),
        year = d.getFullYear();

    return [day, month, year].join(" ");
}

function AssetDetailInfo(props) {
    const { selectedAsset, deleteAsset, isLoadingAssetDetail, updateAsset } =
        props;
    const [isLoading, setIsLoading] = useState(isLoadingAssetDetail);
    const { isShowing: isShowingPreview, toggle: togglePreview } = useModal();

    useEffect(() => {
        setIsLoading(isLoadingAssetDetail);
    }, [isLoadingAssetDetail]);

    const getDataSheet = async (asset_id) => {
        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_ASSET_GET_DATA_SHEET,
            headers: {
                authorization: getToken(),
            },
            data: {
                asset_id:
                    asset_id === null || asset_id === undefined ? "" : asset_id,
            },
        };

        try {
            const result = await axios(config);

            if (result.status === 200) {
                let { data } = result.data;

                let resultArr = [];
                data = data.filter(
                    (data) => data.data_sheet_location.length !== 0
                );

                data.map((data) => {
                    resultArr.push(
                        // file:
                        //     process.env.REACT_APP_BACKEND_NODELINX +
                        //     "/filerepository/dcim/uploadFileFromAPI/" +
                        //     data.data_sheet_location,
                        "/filerepository/dcim/uploadFileFromAPI/" +
                            data.data_sheet_location
                    );
                });
                selectedAsset.data_sheet = resultArr;
                // selectedAsset.data_sheet = data[0].data_sheet_location;
            } else {
                toast.error("Error getting asset data sheet", {
                    toastId: "ADI_error-get-datasheet_S_400",
                });
            }
        } catch (e) {
            selectedAsset.data_sheet = "";
            // console.log(e.message);
            // toast.warning("No data sheet for selected asset.", {
            //     toastId: "error-get-data-sheet" + asset_id,
            // });
        }
    };
    useEffect(() => {
        (async () => {
            if (selectedAsset !== undefined) {
                setIsLoading(true);
                await getDataSheet(selectedAsset.asset_id);
                setIsLoading(false);
            }
        })();
    }, [selectedAsset]);
    // useEffect(() => {
    //     if (selectedAsset === undefined) {
    //         setIsLoading(true);
    //     } else {
    //         setIsLoading(false);
    //     }
    // }, [selectedAsset]);

    const {
        isShowing: isShowingUpdateAssetPopup,
        toggle: toggleUpdateAssetPopup,
    } = useModal();
    const {
        isShowing: isShowingDeleteAssetPopup,
        toggle: toggleDeleteAssetPopup,
    } = useModal();
    const { isShowing: isShowingDataSheetPopup, toggle: toggleDataSheetPopup } =
        useModal();

    return (
        <div className='asset-info'>
            <PreviewImage
                src={
                    selectedAsset === undefined
                        ? null
                        : ReturnHostBackend(
                              process.env.REACT_APP_BACKEND_NODELINX
                          ) +
                          "/filerepository/dcim/uploadFileFromAPI/" +
                          selectedAsset.asset_image
                }
                isShowing={isShowingPreview}
                hide={togglePreview}
            />
            <DatasheetModal
                title={"Data Sheet"}
                isShowing={isShowingDataSheetPopup}
                hide={toggleDataSheetPopup}
                level={1}
                file={
                    selectedAsset == undefined ? [] : selectedAsset.data_sheet
                }
            />
            <ModalContainerAssetUpdatePop
                selectedAsset={selectedAsset}
                title={
                    selectedAsset == undefined
                        ? "---"
                        : selectedAsset.asset_number
                }
                isShowing={isShowingUpdateAssetPopup}
                hide={toggleUpdateAssetPopup}
                submitName={"Edit"}
                onSubmit={() => {
                    toggleUpdateAssetPopup();
                }}
                clearName={"Clear"}
                onClear={() => {
                    toggleUpdateAssetPopup();
                }}
                updatedAsset={() => {
                    updateAsset();
                }}
            />
            <ModalDelete
                isShowing={isShowingDeleteAssetPopup}
                hide={toggleDeleteAssetPopup}
                deletedObjectType={"Asset"}
                deletedObjectName={
                    selectedAsset == undefined
                        ? "---"
                        : selectedAsset.asset_number
                }
                onDelete={() => {
                    deleteAsset(
                        selectedAsset.asset_id,
                        selectedAsset.asset_image,
                        selectedAsset.data_sheet,
                        selectedAsset.asset_name,
                        selectedAsset.asset_number
                    );
                    toggleDeleteAssetPopup();
                }}
            />
            <LoadingData
                isLoading={isLoading}
                useAltBackground={false}
                // style={{ zIndex: "100" }}
            />
            <div className='asset-info-icons'>
                <Tooltip
                    tooltip={
                        <span className='icon-tooltip'>{"Data Sheet"}</span>
                    }>
                    <img
                        className={
                            getUACWithoutToast("edit")
                                ? "icons data-sheet-icon"
                                : "icons write-icon"
                        }
                        src={data_sheet_icon}
                        alt='data-sheet-icon'
                        onClick={toggleDataSheetPopup}></img>
                </Tooltip>
                {getUACWithoutToast("edit") ? (
                    <Tooltip
                        tooltip={
                            <span className='icon-tooltip'>{"Edit Asset"}</span>
                        }>
                        <img
                            className='icons write-icon'
                            src={write_icon}
                            alt='write-icon'
                            onClick={() => {
                                getUAC("edit") && toggleUpdateAssetPopup();
                            }}></img>
                    </Tooltip>
                ) : (
                    ""
                )}
                {getUACWithoutToast("delete") ? (
                    <Tooltip
                        tooltip={
                            <span className='icon-tooltip'>
                                {"Delete Asset"}
                            </span>
                        }>
                        <img
                            className='icons delete-icon'
                            src={delete_icon}
                            alt='delete-icon'
                            onClick={() => {
                                getUAC("delete") && toggleDeleteAssetPopup();
                            }}></img>
                    </Tooltip>
                ) : (
                    ""
                )}
            </div>
            <div className='asset-info-details'>
                <div className='asset-img'>
                    <img
                        src={
                            selectedAsset === undefined
                                ? SVG_blank_image
                                : ReturnHostBackend(
                                      process.env.REACT_APP_BACKEND_NODELINX
                                  ) +
                                  "/filerepository/dcim/uploadFileFromAPI/" +
                                  selectedAsset.asset_image
                        }
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = SVG_blank_image;
                        }}
                        alt='Asset'
                    />
                    <div className='asset-image-preview'>
                        <img
                            src={SVG_preview}
                            alt='preview'
                            onClick={togglePreview}
                        />
                    </div>
                </div>
                <div className='asset-number'>
                    <p>Asset Number</p>
                    <span>
                        {selectedAsset === undefined
                            ? "---"
                            : selectedAsset.asset_number}
                    </span>
                </div>
                <div className='asset-name'>
                    <p>Asset Name</p>
                    <span>
                        {selectedAsset === undefined
                            ? "---"
                            : selectedAsset.asset_name}
                    </span>
                </div>
                <div className='asset-short-name'>
                    <p>Asset Short Name</p>
                    <span>
                        {selectedAsset === undefined
                            ? "---"
                            : selectedAsset.short_name}
                    </span>
                </div>
                <div className='asset-function'>
                    <p>Function</p>
                    <span>
                        {selectedAsset === undefined
                            ? "---"
                            : selectedAsset.function.value}
                    </span>
                </div>
                <div className='asset-commissioned-date'>
                    <p>Commissioned Date</p>
                    <span>
                        {selectedAsset === undefined
                            ? "---"
                            : selectedAsset.commissioned_date == ""
                            ? ""
                            : formatDate(selectedAsset.commissioned_date)}
                    </span>
                </div>
                <div className='asset-location'>
                    <p>Location</p>

                    <div className='asset-location-detail'>
                        <p>
                            Floor{" "}
                            <span>
                                {selectedAsset === undefined
                                    ? "---"
                                    : selectedAsset.floor.value}
                            </span>
                        </p>
                        <p>
                            Room{" "}
                            <span>
                                {selectedAsset === undefined
                                    ? "---"
                                    : selectedAsset.room.value}
                            </span>
                        </p>
                        <p>
                            Area{" "}
                            <span>
                                {selectedAsset === undefined ||
                                selectedAsset.area == null
                                    ? "---"
                                    : selectedAsset.area.length > 1
                                    ? selectedAsset.area[0] +
                                      "," +
                                      selectedAsset.area[1]
                                    : selectedAsset.area}
                            </span>
                        </p>
                    </div>
                </div>
                <div className='asset-brand'>
                    <p>Brand</p>
                    <span>
                        {selectedAsset === undefined
                            ? "---"
                            : selectedAsset.brand.value}
                    </span>
                </div>
                <div className='asset-model-number'>
                    <p>Model Number</p>
                    <span>
                        {selectedAsset === undefined
                            ? "---"
                            : selectedAsset.model_number.value}
                    </span>
                </div>
                <div className='asset-description'>
                    <p>Description</p>
                    <span>
                        {selectedAsset === undefined
                            ? "---"
                            : selectedAsset.description}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default AssetDetailInfo;
