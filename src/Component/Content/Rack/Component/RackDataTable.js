import React, { useState, useEffect } from "react"; // System library imports
import {
    TableDCIM,
    Paging,
    LoadingData,
    useModal,
    Tooltip,
    getUACWithoutToast,
} from "../../../ComponentReuseable/index";
import addIcon from "../../../../svg/add-asset-icon.svg";
import AddRackModal from "./AddRackModal";
import "./../style.scss";

const RackDataTable = (props) => {
    const {
        power,
        racks,
        isLoading,
        setIsLoading,
        getRacks,
        currentPage,
        setCurrentPage,
        totalPage,
        allRacks,
        setSelectedRow,
        getPowerSource,
        getDatasheet,
        isConnected,
    } = props;

    const { isShowing: isShowingAddRackModal, toggle: addRackModal } =
        useModal();

    const body = racks.map((rack) => {
        let area = rack.area_name ? rack.area_name.split(",") : "-";

        return {
            rack_number: rack.rack_number,
            floor_name: rack.floor_name ? rack.floor_name : "-",
            room_name: rack.room_name ? rack.room_name : "-",
            area_name: area.length > 1 ? area[0] + "-" + area[1] : area,
            brand_name: rack.brand_name ? rack.brand_name : "-",
            model_name: rack.model_name ? rack.model_name : "-",
            number_of_u: rack.number_of_u ? rack.number_of_u : "-",
            power_source: rack.power ? rack.power : "-",
            client_name: rack.client_name,
            status: rack.status,
        };
    });

    const header = {
        rack_number: { width: "150px", name: "Rack #" },
        floor_name: { width: "80px", name: "Floor" },
        room_name: { width: "80px", name: "Room" },
        area_name: { width: "80px", name: "Area" },
        brand_name: { width: "100px", name: "Brand" },
        model_name: { width: "100px", name: "Model" },
        number_of_u: { width: "80px", name: "# of U(s)" },
        power_source: { width: "130px", name: "Power Source" },
        client_name: { width: "200px", name: "Client" },
        status: { width: "150px", name: "Status" },
    };

    return (
        <div className='content-table'>
            {getUACWithoutToast("add") ? (
                <Tooltip
                    tooltip={
                        <span className='icon-tooltip'>{"Add Rack"}</span>
                    }>
                    <img
                        className='icons add-icon'
                        src={addIcon}
                        alt='add-icon'
                        onClick={() => addRackModal()}
                    />
                </Tooltip>
            ) : null}
            <div className='table'>
                <LoadingData
                    isLoading={isLoading.rackList}
                    useAltBackground={false}
                />
                <TableDCIM
                    header={header}
                    body={body}
                    actions={[]}
                    selectable={true}
                    onSelect={(e, index) => {
                        setSelectedRow(index);
                    }}
                    customCellClassNames={[]}
                />

                <div className='paging'>
                    <Paging
                        firstPage={() => {
                            setCurrentPage(1);
                        }}
                        lastPage={() => {
                            setCurrentPage(totalPage);
                        }}
                        nextPage={() => {
                            currentPage !== totalPage &&
                                setCurrentPage(currentPage + 1);
                        }}
                        prevPage={() => {
                            currentPage !== 1 &&
                                setCurrentPage(currentPage - 1);
                        }}
                        currentPageNumber={currentPage}
                        lastPageNumber={totalPage}
                    />
                </div>
            </div>
            <AddRackModal
                title={"Add New Rack"}
                isShowing={isShowingAddRackModal}
                hide={addRackModal}
                submitName={"Add"}
                onSubmit={() => {
                    addRackModal();
                }}
                clearName={"Clear"}
                onClear={() => {
                    addRackModal();
                }}
                getRacks={getRacks}
                allRacks={allRacks}
                powerSourceData={getPowerSource}
                getDatasheet={getDatasheet}
                isConnected={isConnected}
            />
        </div>
    );
};

export default RackDataTable;
