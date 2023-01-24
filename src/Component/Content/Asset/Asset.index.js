// React
import React, { useState, useEffect } from "react";
import axios from "axios";

// Style and Svgs
import "./style.scss";

// Component Reuseable
import {
    TableDCIM,
    Paging,
    useModal,
    ButtonPlus,
    Timer,
    LoadingData,
    getLimitTableDCIM,
    getUAC,
    getUACWithoutToast,
    exportCSVFile,
} from "../../ComponentReuseable/index";

import AssetFilter from "./Component/AssetFilter";
import AssetDetailInfo from "./Component/AssetDetailInfo";
import AssetDetailCount from "./Component/AssetDetailCount";
import ModalContainerAssetAddPop from "./Component/AssetAddPop";

import { getToken } from "../../TokenParse/TokenParse";
import { ReturnHostBackend } from "../../BackendHost/BackendHost";
import { toast } from "react-toastify";

const Asset = () => {
    // Fixed Constant
    const header = {
        asset_number: { width: "150px", name: "Asset #" },
        asset_name: { width: "200px", name: "Asset Name" },
        asset_short_name: { width: "200px", name: "Asset Short Name" },
        function: { width: "150px", name: "Function" },
        floor: { width: "80px", name: "Floor" },
        room: { width: "80px", name: "Room" },
        area: { width: "80px", name: "Area" },
    };

    //Modals
    const { isShowing: isShowingAddAssetPopup, toggle: toggleAddAssetPopup } =
        useModal();

    // useState
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingExport, setIsLoadingExport] = useState(false);

    // Searchs and filters
    const [searchs, setSearchs] = useState(null);
    const [filters, setFilters] = useState({
        floorId: null,
        roomId: null,
        functionId: null,
        assetNo: null,
    });

    // Pagination
    const [currPage, setCurrPage] = useState(1);
    const [totalPage, setTotalPage] = useState(null);

    const [assets, setAssets] = useState([]);
    const [assetCount, setAssetCount] = useState({});
    const [selAsset, setSelAsset] = useState();
    const [selAssetIndex, setSelAssetIndex] = useState();

    const getAssets = async (searchs, filters, currPage) => {
        const limit = getLimitTableDCIM();

        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_ASSET_GET_ASSETS,
            headers: {
                authorization: getToken(),
            },
            data: {
                search:
                    searchs === null || searchs === undefined ? "" : searchs,
                floor_id:
                    filters.floorId === null || filters.floorId === undefined
                        ? ""
                        : filters.floorId,
                room_id:
                    filters.roomId === null || filters.roomId === undefined
                        ? ""
                        : filters.roomId,
                function_id:
                    filters.functionId === null ||
                    filters.functionId === undefined
                        ? ""
                        : filters.functionId,
                asset_number:
                    filters.assetNo === null || filters.assetNo === undefined
                        ? ""
                        : filters.assetNo,
                limit: limit,
                offset: (currPage - 1) * limit,
            },
        };

        try {
            const result = await axios(config);

            let { data } = result.data;
            // console.log(data);
            data = data.map((row) => {
                row.floor = row.floor.replace(/[{}\"]/g, "").split(",");
                row.room = row.room.replace(/[{}\"]/g, "").split(",");
                row.function = row.function.replace(/[{}\"]/g, "").split(",");
                row.brand = row.brand.replace(/[{}\"]/g, "").split(",");
                row.model_number = row.model_number
                    .replace(/[{}\"]/g, "")
                    .split(",");
                row.area = row.area == null ? [""] : row.area.split(",");
                row.commissioned_date =
                    row.commissioned_date == null ? "" : row.commissioned_date;

                row.floor = {
                    id: row.floor[0],
                    value: row.floor[1],
                };
                row.room = {
                    id: row.room[0],
                    value: row.room[1],
                };
                row.function = {
                    id: row.function[0],
                    value: row.function[1],
                };
                row.brand = {
                    id: row.brand[0],
                    value: row.brand[1],
                    label: row.brand[1],
                };
                row.model_number = {
                    id: row.model_number[0],
                    value: row.model_number[1],
                    label: row.model_number[1],
                };
                return row;
            });
            if (result.status === 200) {
                setAssets(data);
            } else {
                toast.error("Error getting assets data", {
                    toastId: "AI_error-get-assets_S_400",
                });
            }
        } catch (e) {
            // console.log(e.message);
            toast.error("Error calling API to get assets data", {
                toastId: "AI_error-get-assets_API",
            });
        }
    };

    const getAssetsTotalCount = async (searchs, filters) => {
        const limit = getLimitTableDCIM();
        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_ASSET_GET_ASSETS_TOTAL_COUNT,
            headers: {
                authorization: getToken(),
            },
            data: {
                search:
                    searchs === null || searchs === undefined ? "" : searchs,
                floor_id:
                    filters.floorId === null || filters.floorId === undefined
                        ? ""
                        : filters.floorId,
                room_id:
                    filters.roomId === null || filters.roomId === undefined
                        ? ""
                        : filters.roomId,
                function_id:
                    filters.functionId === null ||
                    filters.functionId === undefined
                        ? ""
                        : filters.functionId,
                asset_number:
                    filters.assetNo === null || filters.assetNo === undefined
                        ? ""
                        : filters.assetNo,
            },
        };

        try {
            const result = await axios(config);
            if (result.status === 200) {
                let { data } = result.data;
                setTotalPage(
                    Math.ceil(parseInt(data[0].count) / limit) == 0
                        ? 1
                        : Math.ceil(parseInt(data[0].count) / limit)
                );
            } else {
                toast.error("Error getting asset total count data", {
                    toastId: "AI_error-get-assets-total_S_400",
                });
            }
        } catch (e) {
            // console.log(e.message);
            toast.error("Error calling API to get assets data", {
                toastId: "AI_error-get-assets-total_API",
            });
        }
    };

    const getAssetCount = async () => {
        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_ASSET_GET_COUNTS,
            headers: {
                authorization: getToken(),
            },
        };

        try {
            const result = await axios(config);

            if (result.status === 200) {
                setAssetCount(result.data);
            } else {
                toast.error("Error getting asset counts data", {
                    toastId: "AI_error-get-assets-count_S_400",
                });
            }
        } catch (e) {
            toast.error("Error calling APi to get asset counts data", {
                toastId: "AI_error-get-assets-count_API",
            });
        }
    };

    const deleteFile = async (file_path) => {
        const config = {
            method: "delete",
            url:
                ReturnHostBackend(process.env.REACT_APP_BACKEND_NODELINX) +
                process.env.REACT_APP_IMAGE_UPLOAD,
            headers: {
                authorization: getToken(),
            },
            data: {
                path: file_path,
            },
        };

        try {
            const result = await axios(config);
            if (result.status === 200) {
            } else {
                toast.error("Error deleting file", {
                    toastId: "AI_error-del-file_S_400",
                });
            }
        } catch (e) {
            // console.log(e.message);
            // toast.error("Error calling API to delete file", {toastId :"AI_error-del-file_API"});
        }
    };

    const deleteAsset = async (
        asset_id,
        asset_image,
        asset_data_sheet,
        asset_name,
        asset_number
    ) => {
        // API to delete asset_image
        await deleteFile(asset_image);
        // API to delete data_sheet
        if (asset_data_sheet.length > 0) {
            asset_data_sheet.forEach(async (data) => {
                data = data.split("/").slice(-2).join("/");
                await deleteFile(data);
            });
        }

        // API to delete record in assets
        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_ASSET_DELETE_ASSET,
            headers: {
                authorization: getToken(),
            },
            data: {
                asset_id: asset_id,
                asset_name: asset_name,
                asset_number: asset_number,
            },
        };

        try {
            const result = await axios(config);

            if (result.status === 200) {
                toast.success("Asset Deleted");
            } else {
                toast.error("Error deleting asset", {
                    toastId: "AI_error-del-asset_S_400",
                });
            }
        } catch (e) {
            // console.log(e.message);
            toast.error("Error calling API to delete asset", {
                toastId: "AI_error-del-asset_API",
            });
        }
    };

    const handleDeleteAsset = async (
        asset_id,
        asset_image,
        asset_data_sheet,
        asset_name,
        asset_number
    ) => {
        setIsLoading(true);
        await deleteAsset(
            asset_id,
            asset_image,
            asset_data_sheet,
            asset_name,
            asset_number
        );
        await getAssetsTotalCount(searchs, filters);

        await getAssetCount();
        await getAssets(searchs, filters, currPage);
        await setSelAsset(assets[selAssetIndex]);

        setIsLoading(false);
    };

    const exportDataAsset = async (filtered) => {
        // console.log(filtered);
        // return;
        try {
            setIsLoadingExport(true);
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_JDBC) +
                    process.env.REACT_APP_ASSET_GET_ASSETS_EXPORT,
                headers: {
                    authorization: getToken(),
                },
                data: {
                    floor_id: filtered.floor == "" ? "" : filtered.floor.id,
                    room_id: filtered.room == "" ? "" : filtered.room.id,
                    function_id:
                        filtered.function == "" ? "" : filtered.function.id,
                    asset_number: filtered.assetNo,
                },
            };
            const result = await axios(config);
            const fileName = `Assets_[${new Date()
                .toLocaleString("sv-SE")
                .replace(" ", ",")}]_[${
                filtered.floor == ""
                    ? "AllFloor"
                    : "Floor " + filtered.floor.name
            }]_[${
                filtered.room == "" ? "AllRoom" : "Room " + filtered.room.name
            }]_[${
                filtered.function == ""
                    ? "AllFunction"
                    : "Function " + filtered.function.name
            }]_[${
                filtered.assetNo == ""
                    ? "AllAssetNumber"
                    : "Asset Number " + filtered.assetNo
            }]`;

            // console.log(result.data);

            const dataExport = [
                {
                    sheetName: "sheet1",
                    header: [
                        "asset_number",
                        "asset_name",
                        "asset_short_name",
                        "function",
                        "floor",
                        "room",
                        "area",
                        "commissioned_date",
                        "brand",
                        "model_number",
                        "description",
                    ],
                    body: result.data.data,
                },
            ];
            exportCSVFile(dataExport, fileName);
            setIsLoadingExport(false);
        } catch (e) {
            toast.error("Failed to export Assets", {
                toastId: "AI_error-export-assets",
            });
            setIsLoadingExport(false);
        }
    };

    // Every Render
    useEffect(() => {
        (async () => {
            setIsLoading(true);
            await getAssetCount();
            await getAssetsTotalCount(searchs, filters);
            await getAssets(searchs, filters, currPage);
            setIsLoading(false);
        })();
    }, [filters]);

    // Pagination
    useEffect(() => {
        (async () => {
            setIsLoading(true);
            await getAssetCount();
            await getAssetsTotalCount(searchs, filters);
            await getAssets(searchs, filters, currPage);
            await setIsLoading(false);
        })();
    }, [currPage]);

    // Select Asset
    useEffect(() => {
        if (selAssetIndex == undefined) {
            setSelAsset(assets[0]);
        } else {
            setSelAsset(assets[selAssetIndex]);
        }
    }, [assets]);

    useEffect(() => {
        setSelAsset(assets[selAssetIndex]);
    }, [selAssetIndex]);

    // Limitation
    useEffect(() => {
        if (currPage > totalPage && totalPage >= 1) {
            setCurrPage(totalPage);
        }
    }, [totalPage]);

    return (
        <div className='asset-container'>
            <ModalContainerAssetAddPop
                title={"Add New Asset"}
                isShowing={isShowingAddAssetPopup}
                hide={toggleAddAssetPopup}
                submitName={"Add"}
                onSubmit={async () => {
                    toggleAddAssetPopup();
                    setIsLoading(true);
                    await getAssetCount();
                    await getAssetsTotalCount(null, filters);
                    await getAssets(searchs, filters, currPage);
                    await setSelAsset(assets[selAssetIndex]);
                    setIsLoading(false);
                }}
                clearName={"Clear"}
                onClear={() => {
                    toggleAddAssetPopup();
                }}
            />

            <div className='asset-header'>
                <div className='page-title'>Asset Management</div>
                <div className='header-time'>
                    <Timer />
                </div>
            </div>
            <div className='asset-header'>
                <AssetFilter
                    searchValue={(value) => {
                        setSearchs(value);
                    }}
                    searchContent={async () => {
                        setIsLoading(true);
                        await getAssets(searchs, filters, currPage);
                        await getAssetsTotalCount(searchs, filters);
                        setIsLoading(false);
                    }}
                    filterValue={(value) => {
                        setIsLoading(true);
                        setCurrPage(1);
                        setFilters((prev) => {
                            return {
                                ...prev,
                                floorId: value.floorId,
                                roomId: value.roomId,
                                functionId: value.functionId,
                                assetNo: value.assetNo,
                            };
                        });
                        setIsLoading(false);
                    }}
                    isLoadingExport={isLoadingExport}
                    exportData={(filtered) => exportDataAsset(filtered)}
                />
            </div>
            <div className='asset-content'>
                <div className='asset-list'>
                    <LoadingData
                        isLoading={isLoading}
                        useAltBackground={false}
                    />
                    <div className='asset-list-table'>
                        <TableDCIM
                            header={header}
                            body={assets.map((item) => {
                                return {
                                    asset_id: item.asset_id,
                                    asset_number: item.asset_number,
                                    asset_name: item.asset_name,
                                    asset_short_name: item.short_name,
                                    function: item.function.value,
                                    floor: item.floor.value,
                                    room: item.room.value,
                                    area:
                                        item.area !== null &&
                                        item.area.length > 1
                                            ? item.area[0] + "-" + item.area[1]
                                            : item.area,
                                };
                            })}
                            actions={[]}
                            selectable={true}
                            onSelect={(e, index) => {
                                setSelAssetIndex(index);
                            }}
                            customCellClassNames={{}}
                        />
                    </div>
                    <div className='asset-list-paging'>
                        <Paging
                            firstPage={() => {
                                setCurrPage(1);
                            }}
                            lastPage={() => {
                                setCurrPage(totalPage);
                            }}
                            nextPage={() => {
                                currPage !== totalPage &&
                                    setCurrPage(currPage + 1);
                            }}
                            prevPage={() => {
                                currPage !== 1 && setCurrPage(currPage - 1);
                            }}
                            currentPageNumber={currPage}
                            lastPageNumber={totalPage}
                        />
                        {getUACWithoutToast("add") ? (
                            <ButtonPlus
                                name={"Asset"}
                                onClick={() => {
                                    getUAC("add") && toggleAddAssetPopup();
                                }}
                            />
                        ) : (
                            ""
                        )}
                    </div>
                </div>
                <div className='asset-split-data-details'>
                    <AssetDetailInfo
                        selectedAsset={selAsset}
                        deleteAsset={(
                            asset_id,
                            asset_image,
                            asset_data_sheet,
                            asset_name,
                            asset_number
                        ) => {
                            handleDeleteAsset(
                                asset_id,
                                asset_image,
                                asset_data_sheet,
                                asset_name,
                                asset_number
                            );
                        }}
                        updateAsset={async () => {
                            setIsLoading(true);
                            await getAssetCount();
                            await getAssetsTotalCount(searchs, filters);
                            await getAssets(searchs, filters, currPage);
                            setIsLoading(false);
                        }}
                        isLoadingAssetDetail={isLoading}
                    />
                    <AssetDetailCount
                        assetCounts={assetCount}
                        isLoadingAssetCount={isLoading}
                    />
                </div>
            </div>
        </div>
    );
};

export default Asset;
