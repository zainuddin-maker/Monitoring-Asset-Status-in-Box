import React, { useState, useEffect } from "react"; // System library imports
import { toast } from "react-toastify";
import RackDataTable from "./RackDataTable";
import RackDataDetail from "./RackDataDetail";
import RackHeader from "./RackHeader";
import axios from "axios";
import { getLimitTableDCIM, getUAC } from "../../../ComponentReuseable";
import { getToken } from "../../../TokenParse/TokenParse";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import "./../style.scss";

const RackContent = () => {
    const detailDefault = {
        rack_number: "---",
        floor_name: "-",
        room_name: "-",
        area_name: "-",
        brand_name: "---",
        model_name: "---",
        commissioned_date: "---",
        client_name: "---",
        date_of_item_entry: "---",
        number_of_u: "---",
        power_source: "---",
        status: "---",
    };
    const [isConnected, setIsConnected] = useState(true);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState({
        floor_name: "",
        room_name: "",
        client_name: "",
        rack_number: "",
        status: "",
    });
    const [isLoading, setIsLoading] = useState({
        rackList: false,
        detail: false,
    });
    const [isActive, setIsActive] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(null);

    const [allRacks, setAllRacks] = useState([]);
    const [countRacks, setCountRacks] = useState(1);
    const [racks, setRacks] = useState([]);
    const [power, setPower] = useState([]);
    const [datasheet, setDatasheet] = useState([]);
    const [selectedRow, setSelectedRow] = useState();
    const [selectedRack, setSelectedRack] = useState({
        rack_number: "---",
        floor_name: "-",
        room_name: "-",
        area_name: "-",
        brand_name: "---",
        model_name: "---",
        commissioned_date: "---",
        client_name: "---",
        number_of_u: "---",
        power_source: [],
        status: "---",
    });
    const [powerSource, setPowerSource] = useState({
        powerA: [],
        powerB: [],
    });

    const getRacks = async () => {
        const limit = getLimitTableDCIM();
        let filterData = {
            search: search === "" ? "" : search,
            floor_name: filter.floor_name === "" ? "" : filter.floor_name,
            room_name: filter.room_name === "" ? "" : filter.room_name,
            client_name: filter.client_name === "" ? "" : filter.client_name,
            rack_number: filter.rack_number === "" ? "" : filter.rack_number,
            status: filter.status === "" ? "" : filter.status,
            limit: limit,
            offset: (currentPage - 1) * limit,
        };
        let config1 = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_GET_RACK,
            headers: {
                authorization: getToken(),
            },
            data: filterData,
        };
        let config2 = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_GET_ALL_RACKS,
            headers: {
                authorization: getToken(),
            },
            data: filterData,
        };
        try {
            setIsLoading((prev) => {
                return {
                    ...prev,
                    rackList: true,
                    detail: true,
                };
            });

            const result1 = await axios(config1);
            const result2 = await axios(config2);
            const data1 = result1.data.data;
            const data2 = result2.data.data;

            let row = result1.data.data[selectedRow];
            let rackslength = racks.length;
            if (data1.length > 0) {
                setRacks(data1);
                setIsLoading((prev) => {
                    return { ...prev, rackList: false, detail: false };
                });
                setIsActive(true);
                if (selectedRow !== undefined) {
                    if (row !== undefined) {
                        setSelectedRack(row);
                    } else {
                        setSelectedRack(data1[0]);
                    }
                } else {
                    setSelectedRack(data1[0]);
                }
                if (rackslength !== data1.length) {
                    setSelectedRack(data1[0]);
                }
            } else {
                setRacks(data1);
                setSelectedRack(detailDefault);
                setIsLoading((prev) => {
                    return { ...prev, rackList: false, detail: false };
                });
                setIsActive(false);
            }
            if (data2[0].count < limit) {
                setCurrentPage(1);
            }
            setCountRacks(data2[0].count);
            setAllRacks(data2);
        } catch (e) {
            // console.error(e);
            if (e.message === "Network Error") {
                setIsConnected(false);
                toast.error(e.message, {
                    toastId: "network-error",
                });
            }
            toast.error("Failed to get rack data", {
                toastId: "failed-get-racks",
            });

            setIsLoading((prev) => {
                return { ...prev, rackList: false, detail: false };
            });
        }
    };

    // const getPowerSource = async () => {
    //     let config = {
    //         method: "POST",
    //         url: "https://192.168.7.121:2222/api/jdbc/dcim/dcim_admin/dcim_db/rack/getPowerRack",
    //         headers: {
    //             authorization: getToken(),
    //         },
    //     };
    //     try {
    //         const result = await axios(config);
    //         const data = result.data.data;
    //         if (data.length > 0) {
    //             setPower(data);
    //             let powerA = data.filter(
    //                 (power) =>
    //                     power.rack_id === selectedRack.rack_id &&
    //                     power.type_name === "Power Source A"
    //             );
    //             let powerB = data.filter(
    //                 (power) =>
    //                     power.rack_id === selectedRack.rack_id &&
    //                     power.type_name === "Power Source B"
    //             );
    //             if (powerA.length > 0 || powerB.length > 0) {
    //                 setPowerSource((prev) => {
    //                     prev.powerA = powerA;
    //                     prev.powerB = powerB;
    //                     return {
    //                         ...prev,
    //                     };
    //                 });
    //             } else {
    //                 setPowerSource((prev) => {
    //                     prev.powerA = [];
    //                     prev.powerB = [];
    //                     return {
    //                         ...prev,
    //                     };
    //                 });
    //             }
    //         } else {
    //             setPower([]);
    //         }
    //     } catch (e) {
    //         // console.error(e);
    //         toast.error("Failed to get power source data", {
    //             toastId: "failed-get-power-source",
    //         });
    //     }
    // };

    const getDatasheet = async () => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACKITEM_GET_DATASHEETS,
            headers: {
                authorization: getToken(),
            },
            data: {
                id: selectedRack.rack_id,
                type: "rack",
            },
        };
        try {
            const result = await axios(config);
            const data = result.data.data;
            let ds = [];
            if (data.length !== 0) {
                data.map((a) => {
                    ds.push(a.datasheet);
                });
                setDatasheet(ds);
            } else {
                setDatasheet([]);
            }
        } catch (e) {
            // console.error(e);
            toast.error("Failed to get data sheet", {
                toastId: "failed-get-datasheet",
            });
        }
    };

    useEffect(() => {
        getRacks();
    }, [filter, currentPage, selectedRow]);

    useEffect(async () => {
        await getDatasheet();
    }, [selectedRack]);

    useEffect(async () => {
        if (selectedRack.powera !== undefined) {
            setPowerSource((prev) => {
                prev.powerA = selectedRack.powera.split(",");
                prev.powerB = selectedRack.powerb.split(",");
                return {
                    ...prev,
                };
            });
        }
    }, [selectedRack]);

    useEffect(() => {
        const limit = getLimitTableDCIM();
        setTotalPage(
            Math.ceil(countRacks / limit) == 0
                ? 1
                : Math.ceil(countRacks / limit)
        );
    }, [countRacks]);

    useEffect(() => {
        if (currentPage > totalPage) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPage]);

    return (
        <React.Fragment>
            <RackHeader
                setRacks={setRacks}
                racks={racks}
                filter={filter}
                setFilter={setFilter}
                getRacks={getRacks}
                search={search}
                setSearch={setSearch}
                power={power}
            />
            <div className='rack-content'>
                <RackDataTable
                    setSelectedRack={setSelectedRack}
                    racks={racks}
                    power={power}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    getRacks={getRacks}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPage={totalPage}
                    allRacks={allRacks}
                    setSelectedRow={setSelectedRow}
                    getDatasheet={getDatasheet}
                    isConnected={isConnected}
                />
                <RackDataDetail
                    powerSource={powerSource}
                    datasheet={datasheet}
                    selectedRack={selectedRack}
                    setSelectedRack={setSelectedRack}
                    isLoading={isLoading}
                    getRacks={getRacks}
                    setIsLoading={setIsLoading}
                    isActive={isActive}
                    getDatasheet={getDatasheet}
                    isConnected={isConnected}
                />
            </div>
        </React.Fragment>
    );
};

export default RackContent;
