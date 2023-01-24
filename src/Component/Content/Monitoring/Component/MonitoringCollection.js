import React from "react";


import rackconsumption from "../../../../svg/rack_consumption.svg";
import monitLayout from "../../../../svg/monitoring-layout.svg";
import monitOverview from "../../../../svg/monitoring-overview.svg";
import rackLayout from "../../../../svg/rack-layout.svg";

import SearchBar from "../../../ComponentReuseable/SearchBar";
import InputDropdown from "../../../ComponentReuseable/InputDropdownHorizontal";
import AssetCard from "./AssetCard";
import {
    Paging,
    LoadingData,
    InputTextAutoSuggestHorizontal,
    useModal,
    ButtonDetail,
    Tooltip,
} from "../../../ComponentReuseable/index";
import Legend from "../../Legend/Legend.index";

const MonitoringCollection = ({
    loadingFloor,
    loadingRoom,
    loadingFunction,
    loadingAsset,
    setSearchAndAsset,
    setFilter,
    filter,
    filterOptions,
    handleChange,
    handleChangeView,
    assetList,
    viewType,
    handleChangeRoute,
    validateInput,
    getAssetList,
    statusFilter,
    setStatusFilter,
    loading,
    disableRoom,
    handleClearAsset,
}) => {
    // collection paging function
    const firstPage = () => {
        setFilter((prev) => {
            return { ...prev, currentPage: 1 };
        });
    };
    const lastPage = () => {
        setFilter((prev) => {
            return { ...prev, currentPage: prev.lastPage };
        });
    };
    const nextPage = () => {
        if (filter.currentPage < filter.lastPage) {
            setFilter((prev) => {
                return { ...prev, currentPage: prev.currentPage + 1 };
            });
        }
    };
    const prevPage = () => {
        if (filter.currentPage > 1) {
            setFilter((prev) => {
                return { ...prev, currentPage: prev.currentPage - 1 };
            });
        }
    };
    const { isShowing: isShowingLegend, toggle: toggleLegend } = useModal();
    return (
        <>
            <Legend
                isShowing={isShowingLegend}
                hide={toggleLegend}
                type={"monitoring_grid"}
            />
            <div className='monitoring-header'>
                <div className='header-overview'>
                    <div className='page-filter'>
                        <SearchBar
                            name='search'
                            value={filter.search}
                            search={handleChange}
                            searchContent={() => {
                                setSearchAndAsset((prev) => {
                                    return { ...prev, search: filter.search };
                                });
                            }}
                        />
                        <InputDropdown
                            name='floor'
                            label='Floor'
                            value={filter.floor}
                            options={filterOptions.floor}
                            onChange={handleChange}
                            inputWidth='110px'
                            isLoading={loadingFloor}
                        />
                        <InputDropdown
                            name='room'
                            label='Room'
                            value={filter.room}
                            options={filterOptions.room}
                            onChange={handleChange}
                            inputWidth='110px'
                            isDisabled={disableRoom}
                            isLoading={loadingRoom}
                        />
                        <InputDropdown
                            name='function'
                            label='Function'
                            value={filter.function}
                            options={filterOptions.function}
                            onChange={handleChange}
                            inputWidth='140px'
                            isLoading={loadingFunction}
                        />
                        <InputTextAutoSuggestHorizontal
                            name='assetNo'
                            label='Asset No.'
                            value={filter.assetNo}
                            options={
                                filterOptions.assetNo
                                    ? filterOptions.assetNo.map(
                                          (data) => data.name
                                      )
                                    : []
                            }
                            onChange={handleChange}
                            validateInput={validateInput}
                            onClear={handleClearAsset}
                            isLoading={loadingAsset}
                        />
                    </div>
                </div>
                <div className={`monitoring-view-selector ${viewType}`}>
                    <div
                        className='rack_layout'
                        style={{ borderRight: "none" }}
                        onClick={() =>
                            handleChangeView(
                                "rack_layout",
                                filter.floor,
                                filter.room
                            )
                        }>
                        <Tooltip
                            tooltip={
                                <div
                                    style={{
                                        color: "white",
                                        minWidth: "100px",
                                        textAlign: "center",
                                    }}>
                                    <span>Rack Layout</span>
                                </div>
                            }>
                            <img src={rackLayout} alt='grid-view' />
                        </Tooltip>
                    </div>

                    <div
                        className='blueprint'
                        style={{ borderRight: "none" }}
                        onClick={() =>
                            handleChangeView(
                                "blueprint",
                                filter.floor,
                                filter.room
                            )
                        }>
                        <Tooltip
                            tooltip={
                                <div
                                    style={{
                                        color: "white",
                                        minWidth: "100px",
                                        textAlign: "center",
                                    }}>
                                    <span>Asset Monitoring Layout</span>
                                </div>
                            }>
                            <img src={monitLayout} alt='grid-view' />
                        </Tooltip>
                    </div>

                          <div
                                onClick={() => handleChangeView("rackconsumption",filter.floor,
                                filter.room)}
                                className='blueprint'
                                style={{
                                    borderRight: "none",
                                    backgroundColor:
                                        viewType === "rackconsumption"
                                            ? "#4244D4"
                                            : ""
                                }}>
                                <Tooltip
                                    tooltip={
                                        <div
                                            style={{
                                                color: "white",
                                                minWidth: "100px",
                                                textAlign: "center",
                                                
                                            }}>
                                            <span>Rack Consumption</span>
                                        </div>
                                    }>
                                    <img
                                        src={rackconsumption}
                                        style={{height:"23px"}}
                                        alt='grid-view'
                                    />
                                </Tooltip>
                            </div>
                    <div
                        className='grid'
                        onClick={() =>
                            handleChangeView("grid", filter.floor, filter.room)
                        }>
                        <Tooltip
                            tooltip={
                                <div
                                    style={{
                                        color: "white",
                                        minWidth: "100px",
                                        textAlign: "center",
                                    }}>
                                    <span>Asset Monitoring Overview</span>
                                </div>
                            }>
                            <img src={monitOverview} alt='grid-view' />
                        </Tooltip>
                    </div>
                </div>
            </div>
            <LoadingData isLoading={loading} />
            <div className='monitoring-header'>
                <div className='monitoring-overview'>
                    <div className='total'>
                        <div className='total-label'>Total</div>
                        <div className='total-value'>{assetList.count}</div>
                    </div>
                    <div
                        className={`condition-overview select-${statusFilter.replace(
                            " ",
                            "-"
                        )}`}>
                        <div
                            className='all'
                            onClick={() => {
                                setStatusFilter("all");
                            }}>
                            All
                        </div>
                        <div
                            className='running'
                            onClick={() => {
                                setStatusFilter("up");
                            }}>
                            <div>UP:</div>
                            <div className='value'>{`${assetList.countUP} ${
                                assetList.percentUP.toString() === "NaN" ||
                                assetList.percentUP.toString() === "Infinity"
                                    ? ""
                                    : `(${assetList.percentUP}%)`
                            }`}</div>
                        </div>
                        <div
                            className='down'
                            onClick={() => {
                                setStatusFilter("down");
                            }}>
                            <div>DOWN: </div>
                            <div className='value'>{`${assetList.countDOWN} ${
                                assetList.percentDOWN.toString() === "NaN" ||
                                assetList.percentDOWN.toString() === "Infinity"
                                    ? ""
                                    : `(${assetList.percentDOWN}%)`
                            }`}</div>
                        </div>
                        <div
                            className='unknown'
                            onClick={() => {
                                setStatusFilter("offline");
                            }}>
                            <div>OFFLINE: </div>
                            <div className='value'>{`${
                                assetList.countUNKNOWN
                            } ${
                                assetList.percentUNKNOWN.toString() === "NaN" ||
                                assetList.percentUNKNOWN.toString() ===
                                    "Infinity"
                                    ? ""
                                    : `(${assetList.percentUNKNOWN}%)`
                            }`}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='monitoring-card' id='limit-container-card-dcim'>
                <div>
                    <div className='monitoring-card-item'>
                        {assetList.list.length > 0 &&
                            assetList.list.map((asset, index) => {
                                return (
                                    <AssetCard
                                        key={index}
                                        assetData={asset}
                                        handleClick={handleChangeRoute}
                                        isHover={true}
                                    />
                                );
                            })}
                    </div>
                </div>
            </div>

            <Paging
                firstPage={firstPage}
                lastPage={lastPage}
                nextPage={nextPage}
                prevPage={prevPage}
                currentPageNumber={filter.currentPage}
                lastPageNumber={filter.lastPage}
            />
            <div style={{ zIndex: "100" }}>
                <ButtonDetail onClick={toggleLegend} />
            </div>
        </>
    );
};

export default MonitoringCollection;
