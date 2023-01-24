import React, { useState, useEffect, useCallback } from "react";
import IconSearch from "../../../../../svg/search_blue_box.svg";
import {
    InputDropdownHorizontal,
    InputDateHorizontal,
    TableDCIM,
    Paging,
    useModal,
} from "../../../../ComponentReuseable";
import { requestAPI } from "../Utils/changeUtils";
import { getChangeTypesAPI, getItemChangesHistoryAPI } from "../ChangeAPI";
import { toast } from "react-toastify";
import { LoadingData } from "../../../../ComponentReuseable";
import ModalRackDataDetail from "./ModalRackDataDetail";
import { formatDate } from "../Record";
import { timestampWithoutDayParse } from "../../../../ComponentReuseable";
const ItemInformation = ({ selectedRow }) => {
    const maxData = 10;
    const [filter, setFilter] = useState({
        change: "",
        timestamp: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [filterOptions, setFilterOptions] = useState({
        change: [],
    });
    const [pagination, setPagination] = useState({
        currPage: 1,
        totalPage: Math.ceil(1 / maxData),
    });
    const [itemHistory, setItemHistory] = useState([]);
    const { isShowing: isShowingRackDetail, toggle: toggleShowingRackDetail } =
        useModal();
    const handleChange = (e) => {
        let { name, value } = e.target;

        setFilter((prev) => {
            prev[name] = value;
            return { ...prev };
        });
    };
    const itemTableHeader = {
        change: "Change",
        change_timestamp: "Change Timestamp",
        item_no: "Item #",
        item_name: "Item Name",
    };
    const itemTableBody = new Array(5).fill({}).map((item, index) => {
        return {
            change: "Connect",
            change_timestamp: "21 Jun 2021 14:30",
            item_no: "SV2-001",
            item_name: "Rack Server",
        };
    });

    const getItemChangesHistory = useCallback(
        async (
            pageLimit,
            offset,
            rack_number,
            change_type,
            change_timestamp
        ) => {
            setIsLoading(true);
            try {
                let result = await requestAPI(
                    getItemChangesHistoryAPI(
                        pageLimit,
                        offset,
                        rack_number,
                        change_type,
                        change_timestamp
                    )
                );
                if (result.data && result.data.length > 0) {
                    result.data.map((el) => {
                        let parsedParameter = JSON.parse(el.parameter);
                        el.change_to = parsedParameter.find(
                            (val) => val["Change To"]
                        )
                            ? parsedParameter.find((val) => val["Change To"])[
                                  "Change To"
                              ]
                            : "";
                        el.item_number = parsedParameter.find(
                            (val) => val["Item Number"]
                        )
                            ? parsedParameter.find((val) => val["Item Number"])[
                                  "Item Number"
                              ]
                            : "";
                        el.item_name = parsedParameter.find(
                            (val) => val["Item Name"]
                        )
                            ? parsedParameter.find((val) => val["Item Name"])[
                                  "Item Name"
                              ]
                            : "";
                    });
                    setItemHistory([...result.data]);
                    setPagination((prev) => ({
                        ...prev,
                        totalPage: Math.ceil(
                            result.data[0].total_data / pageLimit
                        ),
                    }));
                } else {
                    setItemHistory([...[]]);
                    setPagination((prev) => ({
                        ...prev,
                        totalPage: Math.ceil(1 / pageLimit),
                    }));
                }
                setIsLoading(false);
            } catch (error) {
                toast.error(error.toString());
                setItemHistory([...[]]);
                setIsLoading(false);
                setPagination((prev) => ({
                    ...prev,
                    totalPage: Math.ceil(1 / pageLimit),
                }));
            }
        }
    );
    useEffect(() => {
        setPagination((prev) => ({ ...prev, currPage: 1 }));
        if (selectedRow && selectedRow.rack_number) {
            getItemChangesHistory(
                maxData,
                0,
                selectedRow.rack_number,
                filter.change,
                filter.timestamp
            );
        } else {
            setItemHistory([...[]]);
            setPagination((prev) => ({ ...prev, lastPage: 1 }));
        }
    }, [filter.change, filter.timestamp, selectedRow]);

    useEffect(() => {
        if (selectedRow && selectedRow.rack_number) {
            getItemChangesHistory(
                maxData,
                parseInt((pagination.currPage - 1) * maxData),
                selectedRow.rack_number,
                filter.change,
                filter.timestamp
            );
        } else {
            setItemHistory([...[]]);
        }
    }, [pagination.currPage]);

    // Get Change Type
    useEffect(async () => {
        try {
            let result = await requestAPI(getChangeTypesAPI("item"));
            setFilterOptions((prev) => ({ ...prev, change: result }));
        } catch (error) {
            toast.error(error.toString());
        }
    }, []);

    selectedRow = selectedRow || {
        rack_number: "",
        number_of_u: "",
        client_name: "",
        floor_name: "",
        room_name: "",
        client_name: "",
    };
    return (
        <div className='rack-information-container'>
            <ModalRackDataDetail
                isShowing={isShowingRackDetail}
                hide={toggleShowingRackDetail}
                selectedRow={selectedRow}
            />
            <div className='rack-information-box'>
                <div className='rack-information-content'>
                    <span className='title'>Rack information</span>
                    <div className='item-information'>
                        <div>
                            <span className='header'>Rack Number</span>
                            <span className='content'>
                                {" "}
                                {selectedRow.rack_number || "---"}
                            </span>
                        </div>
                        <div>
                            <span className='header'>Number of U</span>
                            <span className='content'>
                                {" "}
                                {selectedRow.number_of_u || "---"}
                            </span>
                        </div>
                        <div>
                            <span className='header'>Client</span>
                            <span className='content'>
                                {" "}
                                {selectedRow.client_name || "---"}
                            </span>
                        </div>
                    </div>
                    <div className='location'>
                        <span>Location</span>
                        <div className='location-detail'>
                            <div>
                                <span className='header'>Floor</span>
                                <span className='content'>
                                    {" "}
                                    {selectedRow.floor_name || "---"}
                                </span>
                            </div>
                            <div>
                                <span className='header'>Room</span>
                                <span className='content'>
                                    {" "}
                                    {selectedRow.room_name || "---"}
                                </span>
                            </div>
                            <div>
                                <span className='header'>Area</span>
                                <span className='content'>
                                    {" "}
                                    {selectedRow.area_name || "---"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='rack-information-search'>
                    <img
                        src={IconSearch}
                        alt='Search'
                        onClick={() => toggleShowingRackDetail()}
                    />
                </div>
            </div>
            <div className='rack-information-table-container'>
                <LoadingData isLoading={isLoading} />
                <div className='rack-information-table-filter'>
                    <span>Change History</span>
                </div>
                <div className='rack-information-filter-input'>
                    <InputDropdownHorizontal
                        name='change'
                        label='Change'
                        value={filter.change}
                        options={filterOptions.change}
                        onChange={handleChange}
                        // isRequired={true}
                    />
                    <InputDateHorizontal
                        name='timestamp'
                        label='Timestamp'
                        value={filter.timestamp}
                        onChange={handleChange}
                        clearData={() => {
                            setFilter((prev) => ({ ...prev, timestamp: "" }));
                        }}
                    />
                </div>
                <div className='table-container'>
                    <div className='rack-information-table'>
                        <TableDCIM
                            header={itemTableHeader}
                            body={
                                itemHistory.length > 0
                                    ? itemHistory.map((el) => ({
                                          change: el.change_type,
                                          change_timestamp: el.change_timestamp
                                              ? timestampWithoutDayParse(
                                                    el.change_timestamp
                                                )
                                              : "---",
                                          item_no: el.item_number,
                                          item_name: el.item_name,
                                      }))
                                    : []
                            }
                            actions={[]}
                            selectable={false}
                            onSelect={(e, index) => {}}
                            customCellClassNames={{}}
                        />
                    </div>
                    <div className='rack-information-paging'>
                        <Paging
                            firstPage={() => {
                                setPagination({
                                    currPage: 1,
                                    totalPage: pagination.totalPage,
                                });
                            }}
                            lastPage={() => {
                                setPagination({
                                    currPage: pagination.totalPage,
                                    totalPage: pagination.totalPage,
                                });
                            }}
                            nextPage={() => {
                                pagination.currPage !== pagination.totalPage &&
                                    setPagination({
                                        currPage: pagination.currPage + 1,
                                        totalPage: pagination.totalPage,
                                    });
                            }}
                            prevPage={() => {
                                pagination.currPage !== 1 &&
                                    setPagination({
                                        currPage: pagination.currPage - 1,
                                        totalPage: pagination.totalPage,
                                    });
                            }}
                            currentPageNumber={pagination.currPage}
                            lastPageNumber={pagination.totalPage}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemInformation;
