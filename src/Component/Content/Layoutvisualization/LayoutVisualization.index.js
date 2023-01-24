import React, { useState, useEffect } from "react";
import "./style.scss";
import {
    InputDropdownHorizontal,
    TableDCIM,
    Paging,
} from "../../ComponentReuseable";
import {
    Timer,
    Rack,
    LoadingData,
    InputTextAutoSuggestHorizontal,
    Tooltip,
    ButtonDetail,
    useModal,
} from "../../ComponentReuseable";
import { useHistory, useLocation } from "react-router-dom";
import BlueprintAssetMonitoring from "./component/BlueprintAssetMonitoring";
import RackInfromation from "./component/RackInformation";
import axios from "axios";
import { getToken } from "../../TokenParse/TokenParse";
import { toast } from "react-toastify";
import rackconsumption from "../../../svg/rack_consumption.svg";
import gridLayout from "../../../svg/grid.svg";
import blueprintLayout from "../../../svg/blueprint.svg";
import rackvisual from "../../../svg/rackvisualization.svg";


import Legend from "../Legend/Legend.index";
import { ReturnHostBackend } from "../../BackendHost/BackendHost";

function LayoutVisualization({ setPageName }) {
    const baseURLmonitoringblueprint =
        "/operation/cdc_asset_monitoring/monitoring";
    const baseRackConsumption =  "/operation/consumption/rack"
    const header = {
        No: "No",
        Category: "Category",
        SubCategory: "Sub Category",
        Item: "Item #",
    };
    const { isShowing: isShowingLegend, toggle: toggleLegend } = useModal();
    const customCellClassNames = {};
    const location = useLocation();
    const history = useHistory();
    const newarraychild = new Array(37).fill([]);
    const newarray = new Array(16).fill(newarraychild);
    const [datatable, setDatatable] = useState(newarray);
    const [datatabledetails, setDatatabledetails] = useState();
    const [hidegride, setHidegride] = useState(true);
    const [filter, setFilter] = useState({
        floor: "",
        room: "",
    });

    const [filterOptions, setFilterOptions] = useState({
        floor: null,
        room: null,
    });
    const [displaydetail, setDisplaydetail] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isLoadingrackandinformation, setisLoadingrackandinformation] =
        useState(false);
    const [isLoadingDatadetails, setisLoadingDatadetails] = useState(false);
    const [boxdetailrack, setBoxdetailrack] = useState([]);
    const [tabeldetailrack, setTabeldetailrack] = useState([]);

    const [rackid, setRackid] = useState();
    const [indexHeader, setIndexheader] = useState();
    const [indexRow, setIndexrow] = useState();

    const [paging, setPaging] = useState(1);

    const [arrayrack, setArrayrack] = useState([]);
    const [rackselect, setRackselect] = useState();
    const [rackselectname, setRackselectname] = useState();
    const [viewType, setViewType] = useState("racklayout");

    const reloaddata = (floor, room) => {
        if (floor) {
            setIsLoadingData(true);
            let temparray = [];

            for (let i = 0; i < 16; i++) {
                temparray.push([]);

                for (let j = 0; j < 37; j++) {
                    temparray[i].push([]);
                }
            }

            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_DATA_HUB) +
                    process.env.REACT_APP_MONITORING_RACK_LAYOUT_GET_ALL_RACK,
                headers: {
                    authorization: getToken(),
                },
                data: { room: room, floor: floor },
            };

            axios(config)
                .then(function (response) {
                    // //console.log("rackmonitoring");
                    // //console.log(response.data.data);

                    response.data.data.forEach((element) => {
                        if (element.area_name.split(",").length === 1) {
                            var chars =
                                element.area_name.match(/[a-zA-Z]+/g)[0];
                            var numbs = element.area_name.replace(chars, "");
                            if (parseInt(numbs) > 0) {
                                //  ////console.log(element)
                                //  ////console.log(element.area_name)
                                //   ////console.log( lettersTonumber(chars.toLowerCase()), parseInt(numbs) -1);
                                if (parseInt(numbs) >= temparray.length) {
                                    expandArray(
                                        temparray,
                                        parseInt(numbs) - temparray.length + 0,
                                        0
                                    );
                                }

                                if (
                                    lettersTonumber(chars.toLowerCase()) >=
                                    temparray[0].length
                                ) {
                                    expandArray(
                                        temparray,
                                        0,
                                        lettersTonumber(chars.toLowerCase()) -
                                            temparray[0].length +
                                            0
                                    );
                                }

                                const datakomponent = {
                                    rack_id: element.rack_id,
                                    racknumber: element.rack_number,
                                    floor: element.floor,
                                    room: element.room,
                                    area: element.area_name,
                                    status: element.status,
                                    client:
                                        element.client_name !== null
                                            ? element.client_name
                                            : "--",
                                    numberOfU: element.numberofu,
                                    total_unit:
                                        element.total_unit !== null
                                            ? element.total_unit
                                            : 0,
                                    total_item:
                                        element.total_item !== null
                                            ? element.total_item
                                            : 0,
                                    display: false,
                                };

                                temparray[parseInt(numbs) - 1][
                                    lettersTonumber(chars.toLowerCase())
                                ].push(datakomponent);
                            }
                        }
                        if (element.area_name.split(",").length === 2) {
                            var chars1 = element.area_name
                                .split(",")[0]
                                .match(/[a-zA-Z]+/g)[0];
                            var numbs1 = element.area_name
                                .split(",")[0]
                                .replace(chars1, "");

                            var chars2 = element.area_name
                                .split(",")[1]
                                .match(/[a-zA-Z]+/g)[0];
                            var numbs2 = element.area_name
                                .split(",")[1]
                                .replace(chars2, "");

                            if (parseInt(numbs1) > parseInt(numbs2)) {
                                let temp = numbs1;
                                numbs1 = numbs2;
                                numbs2 = temp;
                            }

                            if (parseInt(numbs1) >= temparray.length) {
                                expandArray(
                                    temparray,
                                    parseInt(numbs1) - temparray.length + 0,
                                    0
                                );
                            }

                            if (
                                lettersTonumber(chars1.toLowerCase()) >=
                                temparray[0].length
                            ) {
                                expandArray(
                                    temparray,
                                    0,
                                    lettersTonumber(chars1.toLowerCase()) -
                                        temparray[0].length +
                                        0
                                );
                            }

                            if (parseInt(numbs2) >= temparray.length) {
                                expandArray(
                                    temparray,
                                    parseInt(numbs2) - temparray.length + 0,
                                    0
                                );
                            }

                            if (
                                lettersTonumber(chars2.toLowerCase()) >=
                                temparray[0].length
                            ) {
                                expandArray(
                                    temparray,
                                    0,
                                    lettersTonumber(chars2.toLowerCase()) -
                                        temparray[0].length +
                                        0
                                );
                            }

                            for (
                                let i = lettersTonumber(chars1.toLowerCase());
                                i < lettersTonumber(chars2.toLowerCase()) + 1;
                                i++
                            ) {
                                for (
                                    let j = parseInt(numbs1) - 1;
                                    j < parseInt(numbs2);
                                    j++
                                ) {
                                    // ////console.log("kali")
                                    const datakomponent = {
                                        rack_id: element.rack_id,
                                        racknumber: element.rack_number,
                                        floor: element.floor,
                                        room: element.room,
                                        area: element.area_name,
                                        status: element.status,
                                        client:
                                            element.client_name !== null
                                                ? element.client_name
                                                : "--",
                                        numberOfU: element.numberofu,
                                        total_unit:
                                            element.total_unit !== null
                                                ? element.total_unit
                                                : 0,
                                        total_item:
                                            element.total_item !== null
                                                ? element.total_item
                                                : 0,
                                        display: false,
                                    };
                                    temparray[j][i].push(datakomponent);
                                }
                            }
                        }
                    });
                    // ////console.log(temparray);
                    setDatatable(temparray);
                    ////console.log(temparray);
                    setIsLoadingData(false);
                })
                .catch(() => {
                    toast.error("Failed to get Rack data", {
                        toastId: "get-rack-data",
                    });
                    setIsLoadingData(false);
                });
        }
    };

    const lettersTonumber = (letter) => {
        let number = 0;
        if (letter.split("").length === 1) {
            number = letter.split("")[0].toLowerCase().charCodeAt(0) - 97;
        } else if (letter.split("").length === 2) {
            number =
                26 *
                    (letter.split("")[0].toLowerCase().charCodeAt(0) - 97 + 1) -
                1 +
                letter.split("")[1].toLowerCase().charCodeAt(0) -
                97 +
                1;
        }

        return number;
    };

    const expandArray = (array, addcolumn, addrow) => {
        const lenrow = array[0].length;
        const lencolumn = array.length;

        if (addcolumn !== 0) {
            for (let i = 0; i < addcolumn; i++) {
                array.push([]);

                for (let j = 0; j < lenrow; j++) {
                    array[i + lencolumn].push([]);
                }
            }
        }

        if (addrow !== 0) {
            for (let i = 0; i < lencolumn; i++) {
                for (let j = 0; j < addrow; j++) {
                    array[i].push([]);
                }
            }
        }

        return array;
    };

    const handleChangerackid = (e) => {
        // ////console.log(e.target.value)

        setRackselectname(e.target.value);
        // ////console.log(arrayrack)
        let selectedname = arrayrack.findIndex(
            (dataFloor) => dataFloor.name === e.target.value
        );

        // ////console.log(selectedname)
        if (selectedname > -1) {
            ////console.log(arrayrack[selectedname].id)
            setRackselect(arrayrack[selectedname].id);

            setPaging(1);
            setRackid(arrayrack[selectedname].id);

            reloadDetailrack(arrayrack[selectedname].id);
            reloadDetail(arrayrack[selectedname].id, 6, 0);
            setDatatabledetails(datatable[indexHeader][indexRow][selectedname]);
        } else {
            setRackselect(-1);
        }
    };
    const handleChange = (e) => {
        setDisplaydetail(false);

        setArrayrack([]);
        let { name, value } = e.target;
        if (name === "floor") {
            setFilter((prev) => ({ ...prev, floor: value, room: "" }));
            getRoomex(value, filterOptions.floor);
        } else {
            setFilter((prev) => ({ ...prev, [name]: value }));
            const floor = filterOptions.floor.find(
                (dataFloor) => parseInt(dataFloor.id) === parseInt(filter.floor)
            );
            const room = filterOptions.room.find(
                (dataRoom) => parseInt(dataRoom.id) === parseInt(value)
            );
            ////console.log("floor ,'',room")
            ////console.log(floor ,'',room)
            reloaddata(floor ? floor.name : "", room ? room.name : "");
        }
    };

    const reloadDetailrack = (rack_id) => {
        setisLoadingrackandinformation(true);

        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_DATA_HUB) +
                process.env
                    .REACT_APP_MONITORING_RACK_LAYOUT_GET_DETAIL_ALL_RACK,
            headers: {
                authorization: getToken(),
            },
            data: { rack_id: rack_id },
        };

        axios(config)
            .then(function (response) {
                ////console.log("rack detail all");
                ////console.log(response.data.data);
                let listboxitem = [];
                if (response.data.data.length > 0) {
                    response.data.data.forEach((element) => {
                        const databoxitem = {
                            id: element.item_id,
                            itemNumber: element.item_number,
                            isFull:
                                element.isfull !== null ? element.isfull : true,
                            isLeft:
                                element.isleft !== null
                                    ? element.isleft
                                    : false,
                            uStart: element.ustart ? element.ustart : 0,
                            uNeeded:
                                element.uneeded && element.ustart
                                    ? element.uneeded
                                    : 0,
                        };

                        listboxitem.push(databoxitem);
                    });

                    ////console.log(listboxitem);
                    setBoxdetailrack(listboxitem);
                } else {
                    setBoxdetailrack(listboxitem);
                }
                setisLoadingrackandinformation(false);
            })
            .catch(() => {
                toast.error("Failed to get Detail Rack Item All", {
                    toastId: "get-detail-rack-all",
                });
                setisLoadingrackandinformation(false);
            });
    };

    const reloadDetail = (rack_id, limit, offset) => {
        setisLoadingDatadetails(true);

        //console.log(rack_id);
        //console.log(limit);
        //console.log(offset);

        let config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_DATA_HUB) +
                process.env
                    .REACT_APP_MONITORING_RACK_LAYOUT_GET_DETAIL_ALL_RACK_ITEM,
            headers: {
                authorization: getToken(),
            },
            data: { rack_id: rack_id, limit: limit, offset: offset },
        };

        axios(config)
            .then(function (response) {
                //console.log("rack detail");
                //console.log(response.data.data);
                let listtabelitem = [];
                if (response.data.data.length > 0) {
                    response.data.data.forEach((element) => {
                        const datatabel = {
                            No: listtabelitem.length + 1 + offset,
                            Category: element.category,
                            SubCategory: element.sub_category
                                ? element.sub_category
                                : "-",
                            Item: element.item_number,
                        };

                        listtabelitem.push(datatabel);
                    });

                    ////console.log("data table")
                    ////console.log(listtabelitem)
                    setTabeldetailrack(listtabelitem);
                } else {
                    setTabeldetailrack(listtabelitem);
                }

                setisLoadingDatadetails(false);
            })
            .catch(() => {
                toast.error("Failed to get Detail Rack Item", {
                    toastId: "get-detail-rack-item",
                });
                setisLoadingDatadetails(false);
            });
    };

    function handleDisplaydetail(id, indexHeader, indexRow, rack_id) {
        // console.log("rack_id");
        // console.log(datatable);
        if (id) {
            if (rack_id.length > 1) {
                ////console.log("list rack")
                ////console.log(rack_id)

                let arrayrack = [];
                rack_id.forEach((element) => {
                    const data = {
                        id: element.rack_id,
                        name: element.racknumber,
                    };

                    arrayrack.push(data);
                });
                ////console.log(arrayrack[0])

                ////console.log(arrayrack)
                setArrayrack(arrayrack);
                setRackselect(arrayrack[0].id);

                setRackselectname(arrayrack[0].name);
            } else {
                setArrayrack([]);
            }

            const tempdatatable = datatable;

            for (let i = 0; i < tempdatatable.length; i++) {
                for (let j = 0; j < tempdatatable[0].length; j++) {
                    if (i === indexHeader && j === indexRow) {
                        tempdatatable[indexHeader][indexRow][0].display = true;
                    } else {
                        if (tempdatatable[i][j][0]) {
                            tempdatatable[i][j][0].display = false;
                        }
                    }
                }
            }

            setPaging(1);
            setRackid(rack_id[0].rack_id);

            reloadDetailrack(rack_id[0].rack_id);
            reloadDetail(rack_id[0].rack_id, 6, 0);

            setDatatable(tempdatatable);
            setIndexheader(indexHeader);
            setIndexrow(indexRow);
            setDatatabledetails(datatable[indexHeader][indexRow][0]);
        } else {
            const tempdatatable = datatable;

            for (let i = 0; i < tempdatatable.length; i++) {
                for (let j = 0; j < tempdatatable[0].length; j++) {
                    if (tempdatatable[i][j][0]) {
                        tempdatatable[i][j][0].display = false;
                    }
                }
            }

            // ////console.log(tempdatatable)
            setDatatable(tempdatatable);
            setArrayrack([]);
        }
        setDisplaydetail(id);
    }

    const getFloor = () => {
        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_DATA_HUB) +
                process.env
                    .REACT_APP_MONITORING_RACK_LAYOUT_GET_FLOORS_WITH_RACK,
            headers: {
                authorization: getToken(),
            },
        };

        axios(config).then(function (response) {
            if (response.data.data.length > 0) {
                ////console.log(response.data.data[0].id);

                // console.log("location.state");
                // console.log(location.state);

                if (location.state && location.state.floor !== "") {
                    setFilter((prev) => ({
                        ...prev,
                        floor: location.state.floor,
                    }));
                    getRoomex(location.state.floor, response.data.data);
                } else {
                    setFilter((prev) => ({
                        ...prev,
                        floor: response.data.data[0].id,
                    }));
                    getRoomex(response.data.data[0].id, response.data.data);
                }
            }

            setFilterOptions((prevState) => ({
                ...prevState,
                floor: response.data.data,
            }));
        });
    };

    const getRoomex = (floor, floorarray) => {
        setFilterOptions((prevState) => ({
            ...prevState,
            room: null,
        }));
        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_DATA_HUB) +
                process.env
                    .REACT_APP_MONITORING_RACK_LAYOUT_GET_ROOMS_WITH_RACK,
            headers: {
                authorization: getToken(),
            },
            data: { plant_id: floor },
        };
        axios(config)
            .then(function (response) {
                ////console.log("room")
                ////console.log(response.data.data);
                const floor1 = floorarray.find(
                    (dataFloor) => parseInt(dataFloor.id) === parseInt(floor)
                );
                if (response.data.data.length > 0) {
                    if (location.state && location.state.room !== "") {
                        setFilter((prev) => ({
                            ...prev,
                            room: location.state.room,
                        }));

                        const room = response.data.data.find(
                            (dataRoom) =>
                                parseInt(dataRoom.id) ===
                                parseInt(location.state.room)
                        );

                        reloaddata(
                            floor1 ? floor1.name : "",
                            room ? room.name : ""
                        );
                    } else {
                        setFilter((prev) => ({
                            ...prev,
                            room: response.data.data[0].id,
                        }));

                        const room = response.data.data.find(
                            (dataRoom) =>
                                parseInt(dataRoom.id) ===
                                parseInt(response.data.data[0].id)
                        );

                        reloaddata(
                            floor1 ? floor1.name : "",
                            room ? room.name : ""
                        );
                    }
                } else {
                    reloaddata(floor1 ? floor1.name : "", "");
                }
                setFilterOptions((prevState) => ({
                    ...prevState,
                    room: response.data.data,
                }));
            })
            .catch((e) => {
                setFilterOptions((prevState) => ({
                    ...prevState,
                    room: [],
                }));
            });
    };

    // useEffect(() => {

    //     setDisplaydetail(false)
    //     const floor = filterOptions.floor.find(
    //         (dataFloor) => parseInt(dataFloor.id) === parseInt(filter.floor)
    //     );
    //     const room = filterOptions.room.find(
    //         (dataRoom) => parseInt(dataRoom.id) === parseInt(filter.room)
    //     );
    //     reloaddata(floor ? floor.name : "", room ? room.name : "");
    // }, [filter]);

    // useEffect(() => {

    //     if (filter.floor) {
    //         getRoom(filter.floor);
    //     } else {
    //         setFilterOptions((prevState) => ({
    //             ...prevState,
    //             room: [],
    //         }));
    //     }
    // }, [filter.floor]);

    useEffect(() => {
        getFloor();
        history.replace();
    }, []);

    const numberToLetters = (num) => {
        let letters = "";
        while (num >= 0) {
            letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[num % 26] + letters;
            num = Math.floor(num / 26) - 1;
        }

        return letters;
    };

    const handleChangeView = (view) => {
        if (view === "blueprint") {
            setPageName("blueprint");
            history.push({
                pathname: baseURLmonitoringblueprint,
                state: {
                    floor: filter.floor,
                    room: filter.room,
                    viewType: "blueprint",
                },
            });
            // window.location.reload();
        } else if (view === "grid") {
            setPageName("grid");
            history.push({
                pathname: baseURLmonitoringblueprint,
                state: {
                    floor: filter.floor,
                    room: filter.room,
                    viewType: "grid",
                },
            });
        } else if ( view === "rackconsumption"){
            setPageName("rackconsumption");
            history.push({
                pathname: baseRackConsumption,
                state: {
                    floor: filter.floor,
                    room: filter.room,
                    viewType: "rackconsumption",
                },
            });
        }



        setViewType(view);
    };

    return (
        <React.Fragment>
            <div className='layout_visualization-container'>
                <Legend
                    isShowing={isShowingLegend}
                    hide={toggleLegend}
                    type={"layoutvisualization"}
                />

                <div className='monitoring-header'>
                    <div className='page-title'>Layout Visualization</div>

                    <Timer />
                </div>
                <div className='monitoringareaview-middle'>
                    <div className='page-filter'>
                        <InputDropdownHorizontal
                            name='floor'
                            label='Floor'
                            value={filter.floor}
                            options={
                                filterOptions.floor ? filterOptions.floor : []
                            }
                            onChange={handleChange}
                            inputWidth='110px'
                            noEmptyOption={true}
                            isLoading={filterOptions.floor === null}
                        />
                        <InputDropdownHorizontal
                            name='room'
                            label='Room'
                            value={filter.room}
                            options={
                                filterOptions.room ? filterOptions.room : []
                            }
                            onChange={handleChange}
                            isDisabled={true}
                            inputWidth='110px'
                            isDisabled={
                                filter.floor === "" ||
                                filter.floor === undefined ||
                                filter.floor === null
                            }
                            noEmptyOption={true}
                            isLoading={filterOptions.room === null}
                        />
                    </div>

                    <div className='monitoring-hide-show-grid'>
                        {arrayrack.length > 1 && (
                            <InputTextAutoSuggestHorizontal
                                name='arrayrack'
                                label='Rack No:'
                                value={rackselectname}
                                options={arrayrack.map((client) => client.name)}
                                onChange={handleChangerackid}
                                noEmptyOption={false}
                                inputWidth='220px'
                                onClear={() => {
                                    setRackselectname("");
                                }}
                            />
                        )}

                        <div
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                setHidegride(!hidegride);
                            }}
                            className='hide-facilities'>
                            {hidegride ? "Show Grid" : "Hide Grid"}
                        </div>

                        <div className={`monitoring-view-selector`}>
                            <div
                                onClick={() => handleChangeView("racklayout")}
                                className='rack_layout'
                                style={{
                                    borderRight: "none",
                                    backgroundColor:
                                        viewType === "racklayout"
                                            ? "#4244D4"
                                            : "",
                                }}>
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
                                    <img src={rackvisual} alt='grid-view' />
                                </Tooltip>
                            </div>
                            <div
                                onClick={() => handleChangeView("blueprint")}
                                className='blueprint'
                                style={{
                                    borderRight: "none",
                                    backgroundColor:
                                        viewType === "blueprint"
                                            ? "#4244D4"
                                            : "",
                                }}>
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
                                    <img
                                        src={blueprintLayout}
                                        alt='grid-view'
                                    />
                                </Tooltip>
                            </div>
                            <div
                                onClick={() => handleChangeView("rackconsumption")}
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
                                onClick={() => handleChangeView("grid")}
                                className='grid'
                                style={{
                                    backgroundColor:
                                        viewType === "grid" ? "#4244D4" : "",
                                }}>
                                <Tooltip
                                    tooltip={
                                        <div
                                            style={{
                                                color: "white",
                                                minWidth: "100px",
                                                textAlign: "center",
                                            }}>
                                            <span>
                                                Asset Monitoring Overview
                                            </span>
                                        </div>
                                    }>
                                    <img src={gridLayout} alt='grid-view' />
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        overflow: "auto",
                        gap: "20px",
                        position: "relative",
                        height: "100%",
                    }}>
                    <div className='monitoring-area-blueprint-content'>
                        <LoadingData isLoading={isLoadingData} />
                        <BlueprintAssetMonitoring
                            onClick={handleDisplaydetail}
                            hidegride={hidegride}
                            data={datatable}
                            numberToLetters={numberToLetters}
                        />
                    </div>
                    <div
                        style={{
                            display: displaydetail ? "flex" : "none",
                            // display: "flex",
                            gap: "20px",
                            position: "relative",
                        }}>
                        <div
                            style={{
                                // transition: "all 0.3s ease-in",
                                // width: displaydetail ? "210px" : "0px",
                                width: "210px",
                                overflow: "auto",
                                display: "flex",
                                alignItems: "center",
                                position: "relative",
                            }}>
                            <LoadingData
                                isLoading={isLoadingrackandinformation}
                            />
                            <Rack
                                rack={datatabledetails}
                                rackItems={boxdetailrack}
                                // isHide={hidegride}
                            />
                        </div>
                        <div
                            style={{
                                // transition: "all 0.3s ease-in",
                                // width: displaydetail ? "450px" : "0px",
                                width: "450px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                                justifyContent: "space-between",
                                // overflow: "hidden",
                                // overflow: displaydetail ? "auto" : "hidden",
                            }}>
                            <div style={{ position: "relative" }}>
                                <LoadingData
                                    isLoading={isLoadingrackandinformation}
                                />
                                <RackInfromation data={datatabledetails} />
                            </div>

                            <div
                                style={{
                                    height: "100%",
                                    width: "450px",
                                    border: "1px solid #5F5F7A",
                                    boxSizing: "border-box",
                                    padding: "10px",
                                    overflow: "auto",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                    justifyContent: "space-between",
                                    position: "relative",
                                }}>
                                <LoadingData
                                    backgroundOffset={"10px"}
                                    isLoading={isLoadingDatadetails}
                                />
                                <div
                                    style={{
                                        fontSize: "20px",
                                        fontWeight: "500",
                                    }}>
                                    Item List(s)
                                </div>

                                <TableDCIM
                                    header={header}
                                    body={tabeldetailrack}
                                    actions={[]}
                                    selectable={false}
                                    onSelect={() => {}}
                                    customCellClassNames={customCellClassNames}
                                />
                                <div className='paging'>
                                    <Paging
                                        firstPage={() => {
                                            if (paging !== 1) {
                                                setPaging(1);
                                                reloadDetail(rackid, 6, 0);
                                            }
                                        }}
                                        lastPage={() => {
                                            if (
                                                Math.ceil(
                                                    boxdetailrack.length / 6
                                                ) < 1
                                            ) {
                                                setPaging(1);
                                            } else {
                                                if (
                                                    paging !==
                                                    Math.ceil(
                                                        boxdetailrack.length / 6
                                                    )
                                                ) {
                                                    setPaging(
                                                        Math.ceil(
                                                            boxdetailrack.length /
                                                                6
                                                        )
                                                    );
                                                    reloadDetail(
                                                        rackid,
                                                        (Math.ceil(
                                                            boxdetailrack.length /
                                                                6
                                                        ) -
                                                            1) *
                                                            6 +
                                                            6,
                                                        (Math.ceil(
                                                            boxdetailrack.length /
                                                                6
                                                        ) -
                                                            1) *
                                                            6
                                                    );
                                                }
                                            }
                                        }}
                                        nextPage={() => {
                                            if (
                                                Math.ceil(
                                                    boxdetailrack.length / 6
                                                ) < 1
                                            ) {
                                                setPaging(1);
                                            } else {
                                                if (
                                                    paging ===
                                                    Math.ceil(
                                                        boxdetailrack.length / 6
                                                    )
                                                ) {
                                                    setPaging(
                                                        Math.ceil(
                                                            boxdetailrack.length /
                                                                6
                                                        )
                                                    );
                                                } else {
                                                    setPaging(paging + 1);
                                                    reloadDetail(
                                                        rackid,
                                                        paging * 6 + 6,
                                                        paging * 6
                                                    );
                                                }
                                            }
                                        }}
                                        prevPage={() => {
                                            if (paging === 1) {
                                                setPaging(1);
                                            } else {
                                                setPaging(paging - 1);
                                                reloadDetail(
                                                    rackid,
                                                    (paging - 2) * 6 + 6,
                                                    (paging - 2) * 6
                                                );
                                            }
                                        }}
                                        currentPageNumber={paging}
                                        lastPageNumber={
                                            Math.ceil(
                                                boxdetailrack.length / 6
                                            ) < 1
                                                ? 1
                                                : Math.ceil(
                                                      boxdetailrack.length / 6
                                                  )
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ zIndex: "100" }}>
                        <ButtonDetail onClick={toggleLegend} />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default LayoutVisualization;
