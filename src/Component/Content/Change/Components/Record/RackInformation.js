import React, { useState, useEffect, useCallback } from "react";
import IconSearch from "../../../../../svg/search_blue_box.svg";
import {
    InputDropdownHorizontal,
    InputDateHorizontal,
    TableDCIM,
    Paging,
    useModal,
} from "../../../../ComponentReuseable";
import { getRackChangesHistoryAPI, getChangeTypesAPI } from "../ChangeAPI";
import { requestAPI } from "../Utils/changeUtils";
import { toast } from "react-toastify";
import { LoadingData } from "../../../../ComponentReuseable";
import ModalRackDataDetail from "./ModalRackDataDetail";
import { timestampWithoutDayParse } from "../../../../ComponentReuseable";
import { formatDate } from "../Record";

const RackInformation = ({ selectedRow }) => {
    const maxData = 10;
    const [filter, setFilter] = useState({
        change: "",
        timestamp: "",
    });
    const [rackHistory, setRackHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [filterOptions, setFilterOptions] = useState({
        change: [
            {
                id: 1,
                name: "Install",
            },
        ],
    });
    const { isShowing: isShowingRackDetail, toggle: toggleShowingRackDetail } =
        useModal();
    const [pagination, setPagination] = useState({
        currPage: 1,
        totalPage: Math.ceil(1 / maxData),
    });
    const handleChange = (e) => {
        let { name, value } = e.target;

        setFilter((prev) => {
            prev[name] = value;
            return { ...prev };
        });
    };
    const rackTableHeader = {
        change: "Change",
        change_timestamp: "Change Timestamp",
        change_to: "Change To",
    };
    const rackTableBody = new Array(5).fill({}).map((item, index) => {
        return {
            change: "Connect",
            change_timestamp: "21 Jun 2021 14:30",
            change_to: "Acces Key 1 : Garena - Tom Karl",
        };
    });

    // Get Changes history
    const getRackChangesHistory = useCallback(
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
                    getRackChangesHistoryAPI(
                        pageLimit,
                        offset,
                        rack_number,
                        change_type,
                        change_timestamp
                    )
                );
                if (result.data) {
                    setRackHistory([...result.data]);
                } else {
                    setRackHistory([...[]]);
                }
                setIsLoading(false);
            } catch (error) {
                toast.error(error.toString());
                setRackHistory([...[]]);
                setIsLoading(false);
            }
        }
    );
    useEffect(() => {
        setPagination((prev) => ({ ...prev, currPage: 1 }));
        if (selectedRow && selectedRow.rack_number) {
            getRackChangesHistory(
                maxData,
                parseInt((pagination.currPage - 1) * maxData),
                selectedRow.rack_number,
                filter.change,
                filter.timestamp
            );
        }
    }, [filter.change, filter.timestamp, selectedRow]);
    // Get Change Type
    useEffect(async () => {
        try {
            let result = await requestAPI(getChangeTypesAPI("rack"));
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
                    <div className='information'>
                        <div>
                            <span className='header'>Rack Number</span>
                            <span className='content'>
                                {selectedRow.rack_number || "---"}
                            </span>
                        </div>
                        <div>
                            <span className='header'>Number of U</span>
                            <span className='content'>
                                {selectedRow.number_of_u || "---"}
                            </span>
                        </div>
                        <div>
                            <span className='header'>Client</span>
                            <span className='content'>
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
                                    {selectedRow.floor_name || "---"}
                                </span>
                            </div>
                            <div>
                                <span className='header'>Room</span>
                                <span className='content'>
                                    {selectedRow.room_name || "---"}
                                </span>
                            </div>
                            <div>
                                <span className='header'>Area</span>
                                <span className='content'>
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
                        inputWidth='110px'
                    />
                    <InputDateHorizontal
                        name='timestamp'
                        label='Timestamp'
                        value={filter.timestamp}
                        onChange={handleChange}
                        inputWidth='110px'
                        inputWidth='180px'
                        clearData={() => {
                            setFilter((prev) => ({ ...prev, timestamp: "" }));
                        }}
                    />
                </div>
                <div className='table-container'>
                    <div className='rack-information-table'>
                        <TableDCIM
                            header={rackTableHeader}
                            body={
                                rackHistory.length > 0
                                    ? rackHistory.map((el) => ({
                                          change: el.change_type,
                                          change_timestamp: el.change_timestamp
                                              ? timestampWithoutDayParse(
                                                    el.change_timestamp
                                                )
                                              : "---",
                                          change_to: el.change_to,
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

export default RackInformation;
