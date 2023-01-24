// System library imports
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useHistory, useLocation } from "react-router-dom";

// Custom library imports
import { getToken } from "../../TokenParse/TokenParse";
import { ReturnHostBackend } from "../../BackendHost/BackendHost";
import {
    Timer,
    LoadingData,
    Tooltip,
    ButtonDetail,
    useModal,
    InputDropdownHorizontal,
} from "../../ComponentReuseable";
import Legend from "../Legend/Legend.index";
import RackInformation from "./Component/DetailRackConsumption";
import ConsumptionRackBlueprint from "./Component/ConsumptionRackBlueprint";
import { normalizeValueUnit } from "./Utilities/NormalizeValueUnit";

// Image imports
import gridLayout from "../../../svg/grid.svg";
import rackConsumption from "../../../svg/rack_consumption.svg";
import blueprintLayout from "../../../svg/blueprint.svg";
import rackVisual from "../../../svg/rackvisualization.svg";

// Constants
const REFRESH_PERIOD_MS = 5000;
const REFRESH_LOADING_THRESHOLD_MS = 10000;
const MAX_ROWS = 16;
const MAX_COLS = 37;
const urlMonitoringBlueprint = "/operation/cdc_asset_monitoring/monitoring";
const urlLayoutVisualization =
    "/operation/rack_and_server_management/layout_visualization";

const ConsumptionRack = (props) => {
    // Destructure props
    let { setPageName } = props;

    // States
    const [filter, setFilter] = useState({
        floor: "",
        room: "",
    });
    const [filterOptions, setFilterOptions] = useState({
        floor: null,
        room: null,
    });
    const [viewType, setViewType] = useState("rackconsumption");
    const [hideGrid, setHideGrid] = useState(true);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isLoadingDropdown, setIsLoadingDropdown] = useState({
        floor: false,
        room: false,
    });

    // State for 2D layout of the racks
    const columns = new Array(MAX_COLS).fill([]);
    const rows = new Array(MAX_ROWS).fill(columns);
    const [racksMatrix, setRacksMatrix] = useState(rows);

    // State for selected rack's data
    const [selectedRack, setSelectedRack] = useState(null);

    // Modals
    const { isShowing: isShowingLegend, toggle: toggleLegend } = useModal();

    // Custom hooks
    const location = useLocation();
    const history = useHistory();

    // Functions
    function handleClickedRack(isValidRack, indexHeader, indexRow) {
        if (isValidRack) {
            const tempRacksMatrix = racksMatrix;

            for (let i = 0; i < tempRacksMatrix.length; i++) {
                for (let j = 0; j < tempRacksMatrix[0].length; j++) {
                    if (i === indexHeader && j === indexRow) {
                        tempRacksMatrix[indexHeader][
                            indexRow
                        ][0].display = true;
                    } else {
                        if (tempRacksMatrix[i][j][0]) {
                            tempRacksMatrix[i][j][0].display = false;
                        }
                    }
                }
            }

            setSelectedRack(racksMatrix[indexHeader][indexRow][0]);
            setRacksMatrix(tempRacksMatrix);
        } else {
            const tempRacksMatrix = racksMatrix;

            for (let i = 0; i < tempRacksMatrix.length; i++) {
                for (let j = 0; j < tempRacksMatrix[0].length; j++) {
                    if (tempRacksMatrix[i][j][0]) {
                        tempRacksMatrix[i][j][0].display = false;
                    }
                }
            }

            setSelectedRack(null);
            setRacksMatrix(tempRacksMatrix);
        }
    }

    // Function to switch views
    const handleChangeView = (view) => {
        if (view === "blueprint") {
            setPageName("blueprint");
            history.push({
                pathname: urlMonitoringBlueprint,
                state: {
                    floor: filter.floor,
                    room: filter.room,
                    viewType: "blueprint",
                },
            });
        } else if (view === "grid") {
            setPageName("grid");
            history.push({
                pathname: urlMonitoringBlueprint,
                state: {
                    floor: filter.floor,
                    room: filter.room,
                    viewType: "grid",
                },
            });
        } else if (view === "racklayout") {
            setPageName("racklayout");
            history.push({
                pathname: urlLayoutVisualization,
                state: {
                    floor: filter.floor,
                    room: filter.room,
                    viewType: "racklayout",
                },
            });
        }

        setViewType(view);
    };

    // Function to convert letter in area name to number
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

    const getRooms = async (floorId) => {
        setIsLoadingDropdown((prevState) => ({ ...prevState, room: true }));

        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_DATA_HUB) +
                process.env
                    .REACT_APP_MONITORING_RACK_LAYOUT_GET_ROOMS_WITH_RACK,
            headers: {
                authorization: getToken(),
            },
            data: { plant_id: floorId ? floorId : "" },
        };

        try {
            const result = await axios(config);

            if (result.status === 200) {
                let { data } = result;

                if (data.count > 0) {
                    let { data: queryData } = data;

                    setFilter((prevState) => ({
                        ...prevState,
                        room:
                            location.state && location.state.room !== ""
                                ? location.state.room
                                : queryData[0].id,
                    }));
                    setFilterOptions((prevState) => ({
                        ...prevState,
                        room: queryData,
                    }));
                } else {
                    toast.info("No rooms found for selected floor", {
                        toastId: "info-get-rooms",
                    });
                    // Set room state to null
                    setFilter((prevState) => ({
                        ...prevState,
                        room: null,
                    }));
                    setFilterOptions((prevState) => ({
                        ...prevState,
                        room: [],
                    }));
                }
            } else {
                toast.error("Error getting rooms data", {
                    toastId: "error-get-rooms",
                });
                // Set room state to null
                setFilter((prevState) => ({
                    ...prevState,
                    room: null,
                }));
                setFilterOptions((prevState) => ({
                    ...prevState,
                    room: null,
                }));
            }
        } catch (e) {
            if (!axios.isCancel(e)) {
                toast.error("Error calling API to get rooms", {
                    toastId: "error-get-rooms",
                });
            }

            // Set room state to null
            setFilter((prevState) => ({
                ...prevState,
                room: null,
            }));
            setFilterOptions((prevState) => ({
                ...prevState,
                room: null,
            }));
        }

        // Set isLoading to FALSE
        setIsLoadingDropdown((prevState) => ({ ...prevState, room: false }));
    };

    const handleChange = (e) => {
        let { name, value } = e.target;

        // Check if value is a number
        if (!isNaN(value)) {
            value = parseInt(value);
        }

        if (name === "floor") {
            setFilter((prevState) => ({
                ...prevState,
                floor: value,
                room: null,
            }));
            getRooms(value);
        } else if (name === "room") {
            setFilter((prev) => ({ ...prev, room: value }));
        }
    };

    // Side-effects
    // Get floors on component load
    useEffect(() => {
        // Internal variable
        let mounted = true;
        let cancelToken = axios.CancelToken.source();

        // Internal functions
        const getFloors = async () => {
            const config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_DATA_HUB) +
                    process.env
                        .REACT_APP_MONITORING_RACK_LAYOUT_GET_FLOORS_WITH_RACK,
                headers: {
                    authorization: getToken(),
                },
                cancelToken: cancelToken.token,
            };

            try {
                const result = await axios(config);

                if (result.status === 200) {
                    let { data } = result;

                    if (data.count > 0) {
                        let { data: queryData } = data;

                        // Set selected floor as the first element of the array
                        let selectedFloorId =
                            location.state && location.state.floor !== ""
                                ? location.state.floor
                                : queryData[0].id;

                        if (mounted) {
                            // Set floor state
                            setFilter((prevState) => ({
                                ...prevState,
                                floor: selectedFloorId,
                            }));
                            setFilterOptions((prevState) => ({
                                ...prevState,
                                floor: queryData,
                            }));

                            // Get rooms based on selected floors
                            await getRooms(selectedFloorId);
                        }
                    } else {
                        toast.info("No floors found", {
                            toastId: "info-get-floors",
                        });

                        if (mounted) {
                            // Set floor state to null
                            setFilter((prevState) => ({
                                ...prevState,
                                floor: null,
                            }));
                            setFilterOptions((prevState) => ({
                                ...prevState,
                                floor: [],
                            }));
                        }
                    }
                } else {
                    toast.error("Error getting floors", {
                        toastId: "error-get-floors",
                    });

                    if (mounted) {
                        // Set floor state to null
                        setFilter((prevState) => ({
                            ...prevState,
                            floor: null,
                        }));
                        setFilterOptions((prevState) => ({
                            ...prevState,
                            floor: null,
                        }));
                    }
                }
            } catch (e) {
                if (!axios.isCancel(e)) {
                    toast.error("Error calling API to get floors", {
                        toastId: "error-get-floors",
                    });
                }

                if (mounted) {
                    // Set floor state to null
                    setFilter((prevState) => ({
                        ...prevState,
                        floor: null,
                    }));
                    setFilterOptions((prevState) => ({
                        ...prevState,
                        floor: null,
                    }));
                }
            }
        };

        (async () => {
            // Set isLoading to TRUE
            setIsLoadingDropdown((prevState) => ({
                ...prevState,
                floor: true,
            }));

            await getFloors();

            // Set isLoading to FALSE
            setIsLoadingDropdown((prevState) => ({
                ...prevState,
                floor: false,
            }));
        })();

        history.replace();

        return () => {
            cancelToken.cancel();
            mounted = false;
        };
    }, []);

    // Load racks based on floor and room
    useEffect(() => {
        // Internal variable
        let mounted = true;
        let cancelToken = axios.CancelToken.source();
        let fetchTimer = null;
        let loadingTimer = null;
        let isFirstCall = true;

        // Internal functions
        const expandArray = (array, addColumn, addRow) => {
            const lenRow = array[0].length;
            const lenColumn = array.length;

            if (addColumn !== 0) {
                for (let i = 0; i < addColumn; i++) {
                    array.push([]);

                    for (let j = 0; j < lenRow; j++) {
                        array[i + lenColumn].push([]);
                    }
                }
            }

            if (addRow !== 0) {
                for (let i = 0; i < lenColumn; i++) {
                    for (let j = 0; j < addRow; j++) {
                        array[i].push([]);
                    }
                }
            }

            return array;
        };

        const parseRacks = (racks) => {
            if (!racks) {
                return;
            }

            const temparray = [];

            for (let i = 0; i < 16; i++) {
                temparray.push([]);

                for (let j = 0; j < 37; j++) {
                    temparray[i].push([]);
                }
            }

            racks.forEach((rack) => {
                if (rack.area_name.split(",").length === 1) {
                    let chars = rack.area_name.match(/[a-zA-Z]+/g)[0];
                    let numbs = rack.area_name.replace(chars, "");

                    if (parseInt(numbs) > 0) {
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

                        // Normalize value
                        let normalizedApparentPower = normalizeValueUnit(
                            rack.apparent_power,
                            rack.apparent_power_unit
                        );
                        let normalizedActivePower = normalizeValueUnit(
                            rack.active_power,
                            rack.active_power_unit
                        );
                        let normalizedApparentEnergy = normalizeValueUnit(
                            rack.apparent_energy,
                            rack.apparent_energy_unit
                        );
                        let normalizedActiveEnergy = normalizeValueUnit(
                            rack.active_energy,
                            rack.active_energy_unit
                        );

                        const rackData = {
                            rack_id: rack.rack_id,
                            racknumber: rack.rack_number,
                            area: rack.area_name,
                            statusRack: rack.status,
                            display: false,
                            statusPower: rack.rack_condition.toLowerCase(),
                            ApparentPower:
                                normalizedApparentPower.value +
                                " " +
                                normalizedApparentPower.unit,
                            ActivePower:
                                normalizedActivePower.value +
                                " " +
                                normalizedActivePower.unit,
                            ApparentEnergy:
                                normalizedApparentEnergy.value +
                                " " +
                                normalizedApparentEnergy.unit,
                            ActiveEnergy:
                                normalizedActiveEnergy.value +
                                " " +
                                normalizedActiveEnergy.unit,
                        };

                        temparray[parseInt(numbs) - 1][
                            lettersTonumber(chars.toLowerCase())
                        ].push(rackData);
                    }
                } else if (rack.area_name.split(",").length === 2) {
                    var chars1 = rack.area_name
                        .split(",")[0]
                        .match(/[a-zA-Z]+/g)[0];
                    var numbs1 = rack.area_name
                        .split(",")[0]
                        .replace(chars1, "");

                    var chars2 = rack.area_name
                        .split(",")[1]
                        .match(/[a-zA-Z]+/g)[0];
                    var numbs2 = rack.area_name
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
                            // Normalize value
                            let normalizedApparentPower = normalizeValueUnit(
                                rack.apparent_power,
                                rack.apparent_power_unit
                            );
                            let normalizedActivePower = normalizeValueUnit(
                                rack.active_power,
                                rack.active_power_unit
                            );
                            let normalizedApparentEnergy = normalizeValueUnit(
                                rack.apparent_energy,
                                rack.apparent_energy_unit
                            );
                            let normalizedActiveEnergy = normalizeValueUnit(
                                rack.active_energy,
                                rack.active_energy_unit
                            );

                            const rackData = {
                                rack_id: rack.rack_id,
                                racknumber: rack.rack_number,
                                area: rack.area_name,
                                statusRack: rack.status,
                                display: false,
                                statusPower: rack.rack_condition.toLowerCase(),
                                ApparentPower:
                                    normalizedApparentPower.value +
                                    " " +
                                    normalizedApparentPower.unit,
                                ActivePower:
                                    normalizedActivePower.value +
                                    " " +
                                    normalizedActivePower.unit,
                                ApparentEnergy:
                                    normalizedApparentEnergy.value +
                                    " " +
                                    normalizedApparentEnergy.unit,
                                ActiveEnergy:
                                    normalizedActiveEnergy.value +
                                    " " +
                                    normalizedActiveEnergy.unit,
                            };
                            temparray[j][i].push(rackData);
                        }
                    }
                }
            });

            if (mounted) {
                setRacksMatrix(temparray);
            }
        };

        const setNullRack = () => {
            if (mounted) {
                // Set racks state to null
                setRacksMatrix(rows);
                setSelectedRack(null);
            }
        };

        const getRacks = async (floorId, roomId) => {
            const config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                    process.env.REACT_APP_CONSUMPTION_RACK_GET_RACKS,
                headers: {
                    authorization: getToken(),
                },
                data: {
                    floor_id: floorId ? floorId : "",
                    room_id: roomId ? roomId : "",
                },
                cancelToken: cancelToken.token,
            };

            try {
                const result = await axios(config);

                if (result.status === 200) {
                    let { data } = result;

                    if (data.status === "SUCCESS") {
                        let { racks } = data;

                        if (racks.length > 0) {
                            parseRacks(racks);
                        } else {
                            toast.info("No racks data found", {
                                toastId: "info-get-racks",
                            });

                            // Set racks state to null
                            setNullRack();
                        }
                    } else {
                        toast.error(data.message, {
                            toastId: "error-get-racks",
                        });

                        // Set racks state to null
                        setNullRack();
                    }
                } else {
                    toast.error("Error getting racks data", {
                        toastId: "error-get-racks",
                    });

                    // Set racks state to null
                    setNullRack();
                }
            } catch (e) {
                if (!axios.isCancel(e)) {
                    toast.error("Error calling API to get racks data", {
                        toastId: "error-get-racks",
                    });
                }

                // Set racks state to null
                setNullRack();
            }
        };

        const fetchData = async () => {
            if (isFirstCall) {
                // Set isLoading to TRUE
                if (mounted) {
                    setIsLoadingData(true);
                }
            } else {
                loadingTimer = setTimeout(() => {
                    // Set isLoading to TRUE
                    setIsLoadingData(true);
                }, REFRESH_LOADING_THRESHOLD_MS);
            }

            await getRacks(filter.floor, filter.room);

            if (!isFirstCall) {
                // Clear timeout for setting loading to TRUE
                clearTimeout(loadingTimer);
                loadingTimer = null;
            } else {
                isFirstCall = false;
            }

            // Set isLoading to FALSE
            if (mounted) {
                setIsLoadingData(false);
            }

            if (mounted && fetchTimer) {
                fetchTimer = setTimeout(fetchData, REFRESH_PERIOD_MS);
            }
        };

        // Check if floor and room is valid
        if (filter.floor && filter.room) {
            fetchTimer = setTimeout(fetchData, 10);
        } else {
            if (mounted) {
                // Set racks state to null
                setNullRack();
            }
        }

        return () => {
            clearTimeout(fetchTimer);
            fetchTimer = null;
            clearTimeout(loadingTimer);
            loadingTimer = null;
            cancelToken.cancel();
            mounted = false;
        };
    }, [filter.floor, filter.room]);

    return (
        <React.Fragment>
            <div className='layout_visualization-container'>
                <Legend
                    isShowing={isShowingLegend}
                    hide={toggleLegend}
                    type={"consumption_rack"}
                />
                {/* MODAL */}
                <div className='monitoring-header'>
                    <div className='page-title'>
                        Rack Power Consumption Report
                    </div>
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
                            isLoading={isLoadingDropdown.floor}
                        />
                        <InputDropdownHorizontal
                            name='room'
                            label='Room'
                            value={filter.room}
                            options={
                                filterOptions.room ? filterOptions.room : []
                            }
                            onChange={handleChange}
                            inputWidth='110px'
                            isDisabled={
                                filter.floor === undefined ||
                                filter.floor === null
                            }
                            noEmptyOption={true}
                            isLoading={isLoadingDropdown.floor}
                        />
                    </div>

                    <div className='monitoring-hide-show-grid'>
                        <div
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                setHideGrid(!hideGrid);
                            }}
                            className='hide-facilities'>
                            {hideGrid ? "Show Grid" : "Hide Grid"}
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
                                    <img src={rackVisual} alt='grid-view' />
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
                                onClick={() =>
                                    handleChangeView("rackconsumption")
                                }
                                className='blueprint'
                                style={{
                                    borderRight: "none",
                                    backgroundColor:
                                        viewType === "rackconsumption"
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
                                            <span>Rack Consumption</span>
                                        </div>
                                    }>
                                    <img
                                        src={rackConsumption}
                                        style={{ height: "23px" }}
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
                        // overflow: "auto",
                        gap: "20px",
                        position: "relative",
                        height: "100%",
                    }}>
                    <div className='monitoring-area-blueprint-content monitoring-area-blueprint-content--rack-consumption'>
                        <LoadingData isLoading={isLoadingData} />
                        <ConsumptionRackBlueprint
                            onClick={handleClickedRack}
                            hidegride={hideGrid}
                            data={racksMatrix}
                            selectedRackId={
                                selectedRack ? selectedRack.rack_id : null
                            }
                        />
                    </div>
                    {selectedRack ? (
                        <div
                            style={{
                                display: selectedRack ? "flex" : "none",
                                width: "100%",
                                height: "calc(100% - 60px)",
                                marginTop: "40px",
                                // position: "relative",
                            }}>
                            {/* <div
                            style={{
                                width: "50%%",
                                height:"100%",
                                overflow:"auto",
                                display: "flex",
                                backgroundColor: "#08091B",
                                padding: "10px",
                            }}> */}
                            {/* <div style={{ position: "relative" }}> */}
                            <RackInformation
                                rackId={
                                    selectedRack ? selectedRack.rack_id : null
                                }
                                rackNumber={
                                    selectedRack
                                        ? selectedRack.racknumber
                                        : null
                                }
                            />
                            {/* </div> */}
                            {/* </div> */}
                        </div>
                    ) : null}
                </div>
                {/* CONTENT
                <div></div> */}
                <ButtonDetail onClick={toggleLegend} />
            </div>
        </React.Fragment>
    );
};

export default ConsumptionRack;
