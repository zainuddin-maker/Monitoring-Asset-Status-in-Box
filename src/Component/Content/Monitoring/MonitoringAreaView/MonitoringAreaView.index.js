import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getToken } from "../../../TokenParse/TokenParse";
import "./style.scss";
import {
    InputDropdownHorizontal,
    Tooltip,
    LoadingData,
    ButtonDetail,
    useModal,
    ModalContainer,
    Paging,
} from "../../../ComponentReuseable";
import rackconsumption from "../../../../svg/rack_consumption.svg";
import gridLayout from "../../../../svg/grid.svg";
import blueprintLayout from "../../../../svg/blueprint.svg";
import rackvisual from "../../../../svg/rackvisualization.svg";
import SVG_cooling from "./svg/cooling.svg";
import SVG_coolingwhite from "./svg/cooling_white.svg";
import SVG_fire from "./svg/fire.svg";
import SVG_firewihte from "./svg/fire_white.svg";
import SVG_power from "./svg/power.svg";
import SVG_powerwhite from "./svg/power_white.svg";
import SVG_security from "./svg/security.svg";
import SVG_network from "./svg/network.svg";
import SVG_networkwhite from "./svg/network_white.svg";
import SVG_sensor from "./svg/sensor.svg";
import SVG_sensorwhite from "./svg/sensor_white.svg";
import SVG_acces from "./svg/acces.svg";
import SVG_acceswhite from "./svg/acces_white.svg";
import SVG_cctv from "./svg/cctv.svg";
import SVG_cctvwhite from "./svg/cctv_white.svg";
import SVG_smokewhite from "./svg/smoke_white.svg";
import SVG_smoke from "./svg/smoke.svg";
import SVG_gasleakwhite from "./svg/gasleak_white.svg";
import SVG_gasleak from "./svg/gasleak.svg";
import SVG_waterleakwhite from "./svg/waterleak_white.svg";
import SVG_waterleak from "./svg/waterleak.svg";

import SVG_notconectedbrown from "../../../../svg/not_connected_black.svg";
import SVG_silveryellow from "../../../../svg/alarm_triangle.svg";

import SVG_filterlayout from "./svg/filterlayout.svg";
import { toast } from "react-toastify";
import Legend from "../../Legend/Legend.index";
import { useHistory, useLocation } from "react-router-dom";
import Popupfilter from "./Component/Popupfilter";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import AssetCard from "../Component/AssetCard";
import { wait } from "@testing-library/react";
import { getUserDetails } from "../../../TokenParse/TokenParse";

const baseURL = "/operation/cdc_asset_monitoring/monitoring";

const listfacilities = [
    [[], [], [], [], [], [], [], [], []],
    [[], [], [], [], [], [], [], [], []],
    [[], [], [], [], [], [], [], [], []],
    [[], [], [], [], [], [], [], [], []],
];

const filterpotionsview = [
    {
        id: 1,
        name: "All",
    },
    {
        id: 2,
        name: "Status",
    },
    {
        id: 3,
        name: "Condition",
    },
];

const newarraychild = new Array(37).fill([]);
const newarray = new Array(16).fill(newarraychild);

const MonitoringAreaView = ({
    viewType,
    handleChangeView,
    filter,
    setFilter,
    setPageName,
}) => {
    const location = useLocation();
    const history = useHistory();
    const [time, setTime] = useState(Date.now());

    const { isShowing: isShowingLegend, toggle: toggleLegend } = useModal();
    const { isShowing: isShowingfilter, toggle: toggleFilter } = useModal();

    const [datatable, setDatatable] = useState(newarray);
    const [datatablefasilities, setDatatablefasilities] =
        useState(listfacilities);
    const [hidegride, setHidegride] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [hidefacilities, setHidefacilities] = useState(true);
    // const [filter, setFilter] = useState({
    //     floor: null,
    //     room: null,
    // });

    const [filterlayout, setFilterlayout] = useState({
        type: "All",
        status: "All",
        condition: "All",
    });

    const [filterlayoutbackup, setFilterlayoutbackup] = useState({
        type: "All",
        status: "All",
        condition: "All",
    });

    const [filterlayoutlist, setFilterlayoutlist] = useState({
        type: {
            environment: true,
            cooling: true,
            fire: true,
            network: true,
            power: true,
            camera: true,
            access: true,
            smokedetection: true,
            waterleak: true,
            gasleak: true,
        },
        status: {
            good: true,
            warning: true,
            critical: true,
            unknown: true,
        },
        condition: {
            running: true,
            down: true,
            unknown: true,
        },
    });

    const [filterlayoutlistbackup, setFilterlayoutlistbackup] = useState({
        type: {
            environment: true,
            cooling: true,
            fire: true,
            network: true,
            power: true,
            camera: true,
            access: true,
            smokedetection: true,
            waterleak: true,
            gasleak: true,
        },
        status: {
            good: true,
            warning: true,
            critical: true,
            unknown: true,
        },
        condition: {
            running: true,
            down: true,
            unknown: true,
        },
    });

    const [filterOptions, setFilterOptions] = useState({
        floor: null,
        room: null,
    });

    const [typedisplay, setTypedisplay] = useState(getUserDetails().username === 'dcim_admin'? 1 : 0);
    //dcim_admin

    const [arraydivabsoluteuse, setArraydivabsoluteuse] = useState([]);

    const [arraydivabsoluteusefacilities, setArraydivabsoluteusefacilities] =
        useState([]);

    const [displaydetail, setDisplaydetail] = useState(false);
    const [arrayrack, setArrayrack] = useState([]);
    const [liststuckselected, setliststuckselected] = useState([]);

    const [liststuckselectedbig, setliststuckselectedbig] = useState([]);

    const [liststuckselectedfacilities, setliststuckselectedfacilities] =
        useState([]);

    const [liststuckselectedbigfacilities, setliststuckselectedbigfacilities] =
        useState([]);

    const [paging, setPaging] = useState(1);

    const reloaddatacallback = useCallback(
        (floor, room, listfilter, isTimeLoading) => {
            if (floor) {
                let loading;

                if (isTimeLoading) {
                    loading = setTimeout(() => {
                        setIsLoadingData(true);
                    }, 5000);
                } else {
                    setIsLoadingData(true);
                }

                let stringcondition = "";
                let isnullcondition = "";
                let stringstatus = "";
                let isnullstatus = "";
                let stringtype = "";
                let arrayfilterstatus = [];
                let arrayfiltercondition = [];

                //Status
                if (listfilter.condition.down) {
                    stringcondition = stringcondition + "'DOWN'";
                    arrayfilterstatus.push("DOWN");
                }
                if (listfilter.condition.running) {
                    if (stringcondition !== "") {
                        stringcondition = stringcondition + ",";
                    }
                    stringcondition = stringcondition + "'UP'";

                    arrayfilterstatus.push("UP");
                }

                if (stringcondition === "") {
                    stringcondition = stringcondition + "''";
                }

                stringcondition = "(" + stringcondition + ")";

                if (listfilter.condition.unknown) {
                    isnullcondition = "YES";

                    arrayfilterstatus.push("OFFLINE");
                }

                //Condition
                if (listfilter.status.good) {
                    stringstatus = stringstatus + "'Good'";
                    arrayfiltercondition.push("Good");
                }
                if (listfilter.status.warning) {
                    if (stringstatus !== "") {
                        stringstatus = stringstatus + ",";
                    }
                    stringstatus = stringstatus + "'Warning'";
                    arrayfiltercondition.push("Warning");
                }

                if (listfilter.status.critical) {
                    if (stringstatus !== "") {
                        stringstatus = stringstatus + ",";
                    }
                    stringstatus = stringstatus + "'Critical'";

                    arrayfiltercondition.push("Critical");
                }

                if (stringstatus === "") {
                    stringstatus = stringstatus + "''";
                }

                stringstatus = "(" + stringstatus + ")";

                if (listfilter.status.unknown) {
                    isnullstatus = "YES";
                    arrayfiltercondition.push("Offline");
                }

                //Type

                if (listfilter.type.environment) {
                    stringtype =
                        stringtype + "'Temperature & Humidity Sensing'";
                }
                if (listfilter.type.cooling) {
                    if (stringtype !== "") {
                        stringtype = stringtype + ",";
                    }
                    stringtype = stringtype + "'Cooling System'";
                }

                if (listfilter.type.fire) {
                    if (stringtype !== "") {
                        stringtype = stringtype + ",";
                    }
                    stringtype = stringtype + "'Fire System'";
                }
                if (listfilter.type.network) {
                    if (stringtype !== "") {
                        stringtype = stringtype + ",";
                    }
                    stringtype = stringtype + "'Network'";
                }

                if (listfilter.type.power) {
                    if (stringtype !== "") {
                        stringtype = stringtype + ",";
                    }
                    stringtype = stringtype + "'Power System'";
                }
                if (listfilter.type.camera) {
                    if (stringtype !== "") {
                        stringtype = stringtype + ",";
                    }
                    stringtype = stringtype + "'Camera System'";
                }

                if (listfilter.type.access) {
                    if (stringtype !== "") {
                        stringtype = stringtype + ",";
                    }
                    stringtype = stringtype + "'Access System'";
                }

                if (listfilter.type.smokedetection) {
                    if (stringtype !== "") {
                        stringtype = stringtype + ",";
                    }
                    stringtype = stringtype + "'Smoke Detection'";
                }

                if (listfilter.type.waterleak) {
                    if (stringtype !== "") {
                        stringtype = stringtype + ",";
                    }
                    stringtype = stringtype + "'Water Leak Detection'";
                }

                if (listfilter.type.gasleak) {
                    if (stringtype !== "") {
                        stringtype = stringtype + ",";
                    }
                    stringtype = stringtype + "'Gas Leak Detection'";
                }

                if (stringtype === "") {
                    stringtype = stringtype + "''";
                }

                stringtype = "(" + stringtype + ")";

                const listtypedata = [
                    "Cooling System",
                    "Fire System",
                    "Power System",
                    "Security System",
                    "Network",
                    "Temperature & Humidity Sensing",
                    "Camera System",
                    "Access System",
                    "Smoke Detection",
                    "Water Leak Detection",
                    "Gas Leak Detection",
                ];
                let temparray = [];
                let tempfacilities = [];
                let tempfacilitiesfix = [];

                let arraydivabsolute = [];

                let arraydivabsolutefacilities = [];

                for (let i = 0; i < 16; i++) {
                    temparray.push([]);

                    for (let j = 0; j < 37; j++) {
                        temparray[i].push([]);
                    }
                }

                for (let i = 0; i < 4; i++) {
                    tempfacilities.push([]);

                    for (let j = 0; j < 9; j++) {
                        tempfacilities[i].push([]);
                    }
                }

                for (let i = 0; i < 4; i++) {
                    tempfacilitiesfix.push([]);

                    for (let j = 0; j < 9; j++) {
                        tempfacilitiesfix[i].push([]);
                    }
                }

                // process.env.REACT_APP_DATA_HUB +
                // "/api/datahub/dcim/dcim_admin/monitoring/asset_monitoring",

                // const datafilter = {room_name: room,
                //     floor_name: floor,
                //     isunknownstatus: isnullcondition,
                //     filterstatus: stringcondition,
                //     filtercondition: stringstatus,
                //     isunknowncondition: isnullstatus,
                //     filtertype: stringtype}
                //     ////console.log("datafilter")
                //     ////console.log(datafilter)

                // let config = {
                //     method: "post",
                //     url:
                //         process.env.REACT_APP_SERVICES +
                //         "/api/jsexec/dcim/dcim_admin/monitoring/getassetoverviewblueprintfacilities",
                //     headers: {
                //         authorization: getToken(),
                //     },
                //     data: {
                //         room_name: "",
                //         floor_name: "",
                //         isunknownstatus: isnullcondition,
                //         filterstatus: stringcondition,
                //         filtercondition: stringstatus,
                //         isunknowncondition: isnullstatus,
                //         filtertype: stringtype
                //     },
                // };

                // axios(config)
                //     .then(function (response) {
                //         ////console.log("servis_monitoring");
                //         ////console.log(response.data);

                //     })

                let config = {
                    method: "post",
                    url:
                        ReturnHostBackend(process.env.REACT_APP_DATA_HUB) +
                        process.env
                            .REACT_APP_MONITORING_BLUEPRINT_GET_ALL_FACILITIES_DATAHUB,
                    headers: {
                        authorization: getToken(),
                    },
                    data: {
                        room_name: "",
                        floor_name: "",
                        isunknownstatus: isnullcondition,
                        filterstatus: stringcondition,
                        filtercondition: stringstatus,
                        isunknowncondition: isnullstatus,
                        filtertype: stringtype,
                    },
                };

                axios(config)
                    .then(function (response) {
                        // ////console.log("facilities_monitoring");
                        // ////console.log(response.data.data);

                        // const responsedatadata = response.data.data;
                        const exampledata = response.data.data;
                        // config = {
                        //     method: "post",
                        //     url:
                        //         ReturnHostBackend(process.env.REACT_APP_JDBC) +
                        //         "/api/jdbc/dcim/dcim_admin/nodelinx_db/monitoring/getAssetBlueprintwithcondition",
                        //     headers: {
                        //         authorization: getToken(),
                        //     },
                        //     data: { asset_number: "" },
                        // };

                        // axios(config)
                        //     .then(function (response) {
                        //         //////console.log("getAssetBlueprintwithcondition")
                        //         //////console.log(response.data.data)
                        //         responsedatadata.forEach((elementdata, i) => {
                        //             // ////////////////console.log(elementdata.asset_number)

                        //             let found = response.data.data.find(
                        //                 (element) =>
                        //                     element.asset_number ===
                        //                     elementdata.asset_number
                        //             );

                        //             if (found) {
                        //                 const foundfiltercondition =
                        //                     arrayfiltercondition.find(
                        //                         (element) =>
                        //                             element === found.type
                        //                     );

                        //                 if (foundfiltercondition) {
                        //                     if (
                        //                         found.type === "unknown" ||
                        //                         found.type === null ||
                        //                         found.type === "UNKNOWN"
                        //                     ) {
                        //                         elementdata.condition = null;
                        //                     } else {
                        //                         elementdata.condition =
                        //                             found.type;
                        //                     }

                        //                     exampledata.push(elementdata);
                        //                 }
                        //             } else {
                        //                 const foundfiltercondition =
                        //                     arrayfiltercondition.find(
                        //                         (element) =>
                        //                             element ===
                        //                             elementdata.condition
                        //                     );

                        //                 if (foundfiltercondition) {
                        //                     elementdata.condition = null;

                        //                     exampledata.push(elementdata);
                        //                 }
                        //             }
                        //         });

                        exampledata.forEach((element) => {
                            if (listtypedata.includes(element.machine_type)) {
                                if (element.area.length === 1) {
                                    const datakomponent = {
                                        name: element.machine_type,
                                        header: element.asset_number,
                                        condition: element.condition,
                                        date: element.timestamp,
                                        status: element.status,
                                        asset_name: element.short_name,
                                        display: false,
                                        area: element.area[0],
                                        long_name: element.long_name,
                                        asset_image: element.asset_image,
                                    };

                                    var chars =
                                        element.area[0].match(/[a-zA-Z]+/g)[0];

                                    var numbs = element.area[0].replace(
                                        chars,
                                        ""
                                    );

                                    if (chars && numbs) {
                                        if (
                                            lettersTonumber(
                                                chars.toLowerCase()
                                            ) >= 156
                                        ) {
                                            if (
                                                parseInt(numbs) - 1 >=
                                                tempfacilitiesfix.length
                                            ) {
                                                expandArray(
                                                    tempfacilitiesfix,
                                                    parseInt(numbs) -
                                                        tempfacilitiesfix.length +
                                                        1,
                                                    0
                                                );
                                            }

                                            if (
                                                lettersTonumber(
                                                    chars.toLowerCase()
                                                ) -
                                                    156 >=
                                                tempfacilitiesfix[0].length
                                            ) {
                                                expandArray(
                                                    tempfacilitiesfix,
                                                    0,
                                                    lettersTonumber(
                                                        chars.toLowerCase()
                                                    ) -
                                                        156 -
                                                        tempfacilitiesfix[0]
                                                            .length +
                                                        1
                                                );
                                            }

                                            tempfacilitiesfix[
                                                parseInt(numbs) - 1
                                            ][
                                                lettersTonumber(
                                                    chars.toLowerCase()
                                                ) - 156
                                            ].push(datakomponent);
                                        }
                                    }
                                } else if (element.area.length === 2) {
                                    var chars1 =
                                        element.area[0].match(/[a-zA-Z]+/g)[0];
                                    let numbs1 = element.area[0].replace(
                                        chars1,
                                        ""
                                    );

                                    var chars2 =
                                        element.area[1].match(/[a-zA-Z]+/g)[0];
                                    let numbs2 = element.area[1].replace(
                                        chars2,
                                        ""
                                    );

                                    if (chars1 && numbs1 && chars2 && numbs2) {
                                        if (
                                            parseInt(numbs1) > parseInt(numbs2)
                                        ) {
                                            let temp = numbs1;
                                            numbs1 = numbs2;
                                            numbs2 = temp;
                                        }

                                        if (
                                            lettersTonumber(
                                                chars1.toLowerCase()
                                            ) >= 156
                                        ) {
                                            const datadiv = {
                                                height:
                                                    Math.abs(
                                                        parseInt(numbs2) -
                                                            parseInt(numbs1)
                                                    ) + 1,
                                                width:
                                                    Math.abs(
                                                        lettersTonumber(
                                                            chars2.toLowerCase()
                                                        ) -
                                                            lettersTonumber(
                                                                chars1.toLowerCase()
                                                            )
                                                    ) + 1,
                                                positionX:
                                                    Math.min(
                                                        lettersTonumber(
                                                            chars2.toLowerCase()
                                                        ),
                                                        lettersTonumber(
                                                            chars1.toLowerCase()
                                                        )
                                                    ) + 1,
                                                positionY: Math.min(
                                                    parseInt(numbs2),
                                                    parseInt(numbs1)
                                                ),

                                                size:
                                                    (Math.abs(
                                                        parseInt(numbs2) -
                                                            parseInt(numbs1)
                                                    ) +
                                                        1) *
                                                    (Math.abs(
                                                        lettersTonumber(
                                                            chars2.toLowerCase()
                                                        ) -
                                                            lettersTonumber(
                                                                chars1.toLowerCase()
                                                            )
                                                    ) +
                                                        1),
                                                datakomponent: [
                                                    {
                                                        name: element.machine_type,
                                                        header: element.asset_number,
                                                        condition:
                                                            element.condition,
                                                        date: element.timestamp,
                                                        status: element.status,
                                                        asset_name:
                                                            element.short_name,
                                                        display: false,
                                                        area:
                                                            element.area[0] +
                                                            "-" +
                                                            element.area[1],
                                                        long_name:
                                                            element.long_name,
                                                        asset_image:
                                                            element.asset_image,
                                                    },
                                                ],
                                            };

                                            arraydivabsolutefacilities.push(
                                                datadiv
                                            );

                                            if (
                                                parseInt(numbs1) >=
                                                tempfacilitiesfix.length
                                            ) {
                                                expandArray(
                                                    tempfacilitiesfix,
                                                    parseInt(numbs1) -
                                                        tempfacilitiesfix.length +
                                                        1,
                                                    0
                                                );
                                            }

                                            if (
                                                lettersTonumber(
                                                    chars1.toLowerCase()
                                                ) -
                                                    156 >=
                                                tempfacilitiesfix[0].length
                                            ) {
                                                expandArray(
                                                    tempfacilitiesfix,
                                                    0,
                                                    lettersTonumber(
                                                        chars1.toLowerCase()
                                                    ) -
                                                        tempfacilitiesfix[0]
                                                            .length +
                                                        1
                                                );
                                            }

                                            if (
                                                parseInt(numbs2) >=
                                                tempfacilitiesfix.length
                                            ) {
                                                expandArray(
                                                    tempfacilitiesfix,
                                                    parseInt(numbs2) -
                                                        tempfacilitiesfix.length +
                                                        1,
                                                    0
                                                );
                                            }

                                            if (
                                                lettersTonumber(
                                                    chars2.toLowerCase()
                                                ) -
                                                    156 >=
                                                tempfacilitiesfix[0].length
                                            ) {
                                                expandArray(
                                                    tempfacilitiesfix,
                                                    0,
                                                    lettersTonumber(
                                                        chars2.toLowerCase()
                                                    ) -
                                                        tempfacilitiesfix[0]
                                                            .length +
                                                        1
                                                );
                                            }

                                            for (
                                                let i =
                                                    lettersTonumber(
                                                        chars1.toLowerCase()
                                                    ) - 156;
                                                i <
                                                lettersTonumber(
                                                    chars2.toLowerCase()
                                                ) +
                                                    1 -
                                                    156;
                                                i++
                                            ) {
                                                for (
                                                    let j =
                                                        parseInt(numbs1) - 1;
                                                    j < parseInt(numbs2);
                                                    j++
                                                ) {
                                                    const datakomponent = {
                                                        name: element.machine_type,
                                                        header: element.asset_number,
                                                        condition:
                                                            element.condition,
                                                        date: element.timestamp,
                                                        status: element.status,
                                                        asset_name:
                                                            element.short_name,
                                                        display: false,
                                                        area:
                                                            element.area[0] +
                                                            "-" +
                                                            element.area[1],
                                                        long_name:
                                                            element.long_name,
                                                        asset_image:
                                                            element.asset_image,
                                                    };
                                                    tempfacilitiesfix[j][
                                                        i
                                                    ].push(datakomponent);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        });
                        //////console.log("tempfacilitiesfix")
                        //////console.log(tempfacilitiesfix)
                        setDatatablefasilities(tempfacilitiesfix);

                        if (arraydivabsolutefacilities.length > 1) {
                            makearrayabsolutebig(
                                tempfacilitiesfix,
                                arraydivabsolutefacilities
                            );
                        }

                        setArraydivabsoluteusefacilities(
                            arraydivabsolutefacilities
                        );
                        // })
                        // .catch((e) => {
                        //     toast.error(
                        //         "Failed to get Condition by Tag Facilities",
                        //         {
                        //             toastId:
                        //                 "get-condition-by-tag-facilities",
                        //         }
                        //     );
                        // });
                    })

                    .catch((e) => {
                        toast.error("Failed to get All Facilities", {
                            toastId: "get-all-facilities",
                        });
                    });

                const datainput = {
                    room_name: room,
                    floor_name: floor,
                    isunknownstatus: isnullcondition,
                    filterstatus: stringcondition,
                    filtercondition: stringstatus,
                    isunknowncondition: isnullstatus,
                    filtertype: stringtype,
                };
                // ////console.log("datainput")
                // ////console.log(datainput)
                // process.env.REACT_APP_JDBC +
                // "/api/jdbc/dcim/dcim_admin/nodelinx_db/monitoring/getAssetBlueprint",
                config = {
                    method: "post",
                    url:
                        ReturnHostBackend(process.env.REACT_APP_DATA_HUB) +
                        process.env
                            .REACT_APP_MONITORING_BLUEPRINT_GET_ALL_ASSET_DATAHUB,
                    headers: {
                        authorization: getToken(),
                    },
                    data: {
                        room_name: room,
                        floor_name: floor,
                        isunknownstatus: isnullcondition,
                        filterstatus: stringcondition,
                        filtercondition: stringstatus,
                        isunknowncondition: isnullstatus,
                        filtertype: stringtype,
                    },
                };

                axios(config)
                    .then(function (response) {
                        ////console.log("asset_monitoring");
                        ////console.log(response.data.data);

                        const exampledata = response.data.data;
                        // config = {
                        //     method: "post",
                        //     url:
                        //         process.env.REACT_APP_JDBC +
                        //         "/api/jdbc/dcim/dcim_admin/nodelinx_db/monitoring/getAssetBlueprintwithcondition",
                        //     headers: {
                        //         authorization: getToken(),
                        //     },
                        //     data: { asset_number: "" },
                        // };

                        // axios(config)
                        //     .then(function (response) {
                        //         // //////console.log("Condition_service");
                        //         // //////console.log(response.data.data);

                        //         responsedatadata.forEach((elementdata, i) => {
                        //             // ////////////////console.log(elementdata.asset_number)

                        //             let found = response.data.data.find(
                        //                 (element) =>
                        //                     element.asset_number ===
                        //                     elementdata.asset_number
                        //             );

                        //             if (found) {
                        //                 const foundfiltercondition =
                        //                     arrayfiltercondition.find(
                        //                         (element) =>
                        //                             element === found.type
                        //                     );

                        //                 if (foundfiltercondition) {
                        //                     if (
                        //                         found.type === "unknown" ||
                        //                         found.type === null ||
                        //                         found.type === "UNKNOWN"
                        //                     ) {
                        //                         elementdata.condition = null;
                        //                     } else {
                        //                         elementdata.condition =
                        //                             found.type;
                        //                     }

                        //                     exampledata.push(elementdata);
                        //                 }
                        //             } else {
                        //                 const foundfiltercondition =
                        //                     arrayfiltercondition.find(
                        //                         (element) =>
                        //                             element ===
                        //                             elementdata.condition
                        //                     );

                        //                 if (foundfiltercondition) {
                        //                     elementdata.condition = null;

                        //                     exampledata.push(elementdata);
                        //                 }
                        //             }
                        //         });

                        ////////////////console.log("responsedatadata")
                        ////////////////console.log(exampledata)

                        // const datenowinsecond = Math.floor( Date.now() /1000)

                        //  config = {
                        //     method: "post",
                        //     url:
                        //         process.env.REACT_APP_SERVICES +
                        //         "/api/jsexec/dcim/dcim_admin/monitoring/getAllStatus",
                        //     headers: {
                        //         authorization: getToken(),
                        //     },
                        //     data: {},
                        // };

                        //  axios(config)
                        //     .then(function (response) {
                        //         //////////////////console.log("status_service");
                        //         //////////////////console.log(response.data);

                        //         if(response.data.length > 0 &&  dataexmaple.length > 0 ){
                        //             dataexmaple.forEach((elementdata,i) => {
                        //                 // //////////////////console.log(elementdata.asset_number)
                        //                 let found = response.data.find(element => element.asset_number === elementdata.asset_number);

                        //                 if(found){
                        //                     // //////////////////console.log(found)
                        //                     const foundfiltersatus = arrayfilterstatus.find(element => element === found.tagValue);

                        //                      if(foundfiltersatus){
                        //                         if(found.tagValue === "UNKNOWN") {
                        //                             elementdata.status = null
                        //                         }else{
                        //                             elementdata.status = found.tagValue
                        //                         }

                        //                         //  //////////////////console.log(datenowinsecond)
                        //                          const datefound = new Date(found.timestamp)
                        //                          if(datefound){
                        //                             elementdata.timestamp = datenowinsecond -   datefound.getTime() /1000
                        //                          }
                        //                      }else{
                        //                         dataexmaple.splice(i, 1);
                        //                      }

                        //                 }
                        //             });
                        //         }
                        //////////////////console.log("dataexmaple")
                        //////////////////console.log(dataexmaple)

                        exampledata.forEach((element) => {
                            if (listtypedata.includes(element.machine_type)) {
                                if (
                                    element.area.length === 1 &&
                                    element.area[0] !== null
                                ) {
                                    const datakomponent = {
                                        name: element.machine_type,
                                        header: element.asset_number,
                                        condition: element.condition,
                                        date: element.timestamp,
                                        status: element.status,
                                        asset_name: element.short_name,
                                        display: false,
                                        area: element.area[0],
                                        long_name: element.long_name,
                                        asset_image: element.asset_image,
                                    };

                                    var chars =
                                        element.area[0].match(/[a-zA-Z]+/g)[0];

                                    var numbs = element.area[0].replace(
                                        chars,
                                        ""
                                    );

                                    if (chars && numbs) {
                                        if (
                                            lettersTonumber(
                                                chars.toLowerCase()
                                            ) >= 156
                                        ) {
                                            if (
                                                parseInt(numbs) - 1 >=
                                                tempfacilities.length
                                            ) {
                                                expandArray(
                                                    tempfacilities,
                                                    parseInt(numbs) -
                                                        tempfacilities.length +
                                                        1,
                                                    0
                                                );
                                            }

                                            if (
                                                lettersTonumber(
                                                    chars.toLowerCase()
                                                ) -
                                                    156 >=
                                                tempfacilities[0].length
                                            ) {
                                                expandArray(
                                                    tempfacilities,
                                                    0,
                                                    lettersTonumber(
                                                        chars.toLowerCase()
                                                    ) -
                                                        156 -
                                                        tempfacilities[0]
                                                            .length +
                                                        1
                                                );
                                            }

                                            tempfacilities[parseInt(numbs) - 1][
                                                lettersTonumber(
                                                    chars.toLowerCase()
                                                ) - 156
                                            ].push(datakomponent);
                                        } else {
                                            if (
                                                parseInt(numbs) - 1 >=
                                                temparray.length
                                            ) {
                                                expandArray(
                                                    temparray,
                                                    parseInt(numbs) -
                                                        temparray.length +
                                                        0,
                                                    0
                                                );
                                            }

                                            if (
                                                lettersTonumber(
                                                    chars.toLowerCase()
                                                ) >= temparray[0].length
                                            ) {
                                                expandArray(
                                                    temparray,
                                                    0,
                                                    lettersTonumber(
                                                        chars.toLowerCase()
                                                    ) -
                                                        temparray[0].length +
                                                        0
                                                );
                                            }

                                            temparray[parseInt(numbs) - 1][
                                                lettersTonumber(
                                                    chars.toLowerCase()
                                                )
                                            ].push(datakomponent);
                                        }
                                    }
                                } else if (
                                    element.area.length === 2 &&
                                    element.area[0] !== null &&
                                    element.area[1] !== null
                                ) {
                                    var chars1 =
                                        element.area[0].match(/[a-zA-Z]+/g)[0];
                                    let numbs1 = element.area[0].replace(
                                        chars1,
                                        ""
                                    );

                                    var chars2 =
                                        element.area[1].match(/[a-zA-Z]+/g)[0];
                                    let numbs2 = element.area[1].replace(
                                        chars2,
                                        ""
                                    );

                                    if (chars1 && numbs1 && chars2 && numbs2) {
                                        if (
                                            parseInt(numbs1) > parseInt(numbs2)
                                        ) {
                                            let temp = numbs1;
                                            numbs1 = numbs2;
                                            numbs2 = temp;
                                        }

                                        if (
                                            lettersTonumber(
                                                chars1.toLowerCase()
                                            ) >= 156
                                        ) {
                                            if (
                                                parseInt(numbs1) >=
                                                tempfacilities.length
                                            ) {
                                                expandArray(
                                                    tempfacilities,
                                                    parseInt(numbs1) -
                                                        tempfacilities.length +
                                                        1,
                                                    0
                                                );
                                            }

                                            if (
                                                lettersTonumber(
                                                    chars1.toLowerCase()
                                                ) -
                                                    156 >=
                                                tempfacilities[0].length
                                            ) {
                                                expandArray(
                                                    tempfacilities,
                                                    0,
                                                    lettersTonumber(
                                                        chars1.toLowerCase()
                                                    ) -
                                                        tempfacilities[0]
                                                            .length +
                                                        1
                                                );
                                            }

                                            if (
                                                parseInt(numbs2) >=
                                                tempfacilities.length
                                            ) {
                                                expandArray(
                                                    tempfacilities,
                                                    parseInt(numbs2) -
                                                        tempfacilities.length +
                                                        1,
                                                    0
                                                );
                                            }

                                            if (
                                                lettersTonumber(
                                                    chars2.toLowerCase()
                                                ) -
                                                    156 >=
                                                tempfacilities[0].length
                                            ) {
                                                expandArray(
                                                    tempfacilities,
                                                    0,
                                                    lettersTonumber(
                                                        chars2.toLowerCase()
                                                    ) -
                                                        tempfacilities[0]
                                                            .length +
                                                        1
                                                );
                                            }

                                            for (
                                                let i =
                                                    lettersTonumber(
                                                        chars1.toLowerCase()
                                                    ) - 156;
                                                i <
                                                lettersTonumber(
                                                    chars2.toLowerCase()
                                                ) +
                                                    1 -
                                                    156;
                                                i++
                                            ) {
                                                for (
                                                    let j =
                                                        parseInt(numbs1) - 1;
                                                    j < parseInt(numbs2);
                                                    j++
                                                ) {
                                                    const datakomponent = {
                                                        name: element.machine_type,
                                                        header: element.asset_number,
                                                        condition:
                                                            element.condition,
                                                        date: element.timestamp,
                                                        status: element.status,
                                                        asset_name:
                                                            element.short_name,
                                                        display: false,
                                                        area:
                                                            element.area[0] +
                                                            "-" +
                                                            element.area[1],
                                                        long_name:
                                                            element.long_name,
                                                        asset_image:
                                                            element.asset_image,
                                                    };
                                                    tempfacilities[j][i].push(
                                                        datakomponent
                                                    );
                                                }
                                            }
                                        } else {
                                            const datadiv = {
                                                height:
                                                    Math.abs(
                                                        parseInt(numbs2) -
                                                            parseInt(numbs1)
                                                    ) + 1,
                                                width:
                                                    Math.abs(
                                                        lettersTonumber(
                                                            chars2.toLowerCase()
                                                        ) -
                                                            lettersTonumber(
                                                                chars1.toLowerCase()
                                                            )
                                                    ) + 1,
                                                positionX:
                                                    Math.min(
                                                        lettersTonumber(
                                                            chars2.toLowerCase()
                                                        ),
                                                        lettersTonumber(
                                                            chars1.toLowerCase()
                                                        )
                                                    ) + 1,
                                                positionY: Math.min(
                                                    parseInt(numbs2),
                                                    parseInt(numbs1)
                                                ),

                                                size:
                                                    (Math.abs(
                                                        parseInt(numbs2) -
                                                            parseInt(numbs1)
                                                    ) +
                                                        1) *
                                                    (Math.abs(
                                                        lettersTonumber(
                                                            chars2.toLowerCase()
                                                        ) -
                                                            lettersTonumber(
                                                                chars1.toLowerCase()
                                                            )
                                                    ) +
                                                        1),
                                                datakomponent: [
                                                    {
                                                        name: element.machine_type,
                                                        header: element.asset_number,
                                                        condition:
                                                            element.condition,
                                                        date: element.timestamp,
                                                        status: element.status,
                                                        asset_name:
                                                            element.short_name,
                                                        display: false,
                                                        area:
                                                            element.area[0] +
                                                            "-" +
                                                            element.area[1],
                                                        long_name:
                                                            element.long_name,
                                                        asset_image:
                                                            element.asset_image,
                                                    },
                                                ],
                                            };

                                            arraydivabsolute.push(datadiv);

                                            if (
                                                parseInt(numbs1) >=
                                                temparray.length
                                            ) {
                                                expandArray(
                                                    temparray,
                                                    parseInt(numbs1) -
                                                        temparray.length +
                                                        0,
                                                    0
                                                );
                                            }

                                            if (
                                                lettersTonumber(
                                                    chars1.toLowerCase()
                                                ) >= temparray[0].length
                                            ) {
                                                expandArray(
                                                    temparray,
                                                    0,
                                                    lettersTonumber(
                                                        chars1.toLowerCase()
                                                    ) -
                                                        temparray[0].length +
                                                        0
                                                );
                                            }

                                            if (
                                                parseInt(numbs2) >=
                                                temparray.length
                                            ) {
                                                expandArray(
                                                    temparray,
                                                    parseInt(numbs2) -
                                                        temparray.length +
                                                        0,
                                                    0
                                                );
                                            }

                                            if (
                                                lettersTonumber(
                                                    chars2.toLowerCase()
                                                ) >= temparray[0].length
                                            ) {
                                                expandArray(
                                                    temparray,
                                                    0,
                                                    lettersTonumber(
                                                        chars2.toLowerCase()
                                                    ) -
                                                        temparray[0].length +
                                                        0
                                                );
                                            }

                                            for (
                                                let i = lettersTonumber(
                                                    chars1.toLowerCase()
                                                );
                                                i <
                                                lettersTonumber(
                                                    chars2.toLowerCase()
                                                ) +
                                                    1;
                                                i++
                                            ) {
                                                for (
                                                    let j =
                                                        parseInt(numbs1) - 1;
                                                    j <
                                                    parseInt(numbs2) - 1 + 1;
                                                    j++
                                                ) {
                                                    const datakomponentnow = {
                                                        name: element.machine_type,
                                                        header: element.asset_number,
                                                        condition:
                                                            element.condition,
                                                        date: element.timestamp,
                                                        status: element.status,
                                                        asset_name:
                                                            element.short_name,
                                                        display: false,
                                                        area:
                                                            element.area[0] +
                                                            "-" +
                                                            element.area[1],
                                                        long_name:
                                                            element.long_name,
                                                        asset_image:
                                                            element.asset_image,
                                                    };

                                                    temparray[j][i].push(
                                                        datakomponentnow
                                                    );
                                                }

                                                // }
                                            }
                                        }
                                    }
                                }
                            }
                        });

                        config = {
                            method: "post",
                            url:
                                ReturnHostBackend(
                                    process.env.REACT_APP_DATA_HUB
                                ) +
                                process.env
                                    .REACT_APP_MONITORING_BLUEPRINT_GET_ALL_RACK,
                            headers: {
                                authorization: getToken(),
                            },
                            data: { room: room, floor: floor },
                        };

                        axios(config)
                            .then(function (response) {
                                // //////////////////////////console.log("rackmonitoring");
                                // //////////////////////////console.log(response.data.data);

                                response.data.data.forEach((element) => {
                                    if (
                                        element.area_name.split(",").length ===
                                        1
                                    ) {
                                        var chars =
                                            element.area_name.match(
                                                /[a-zA-Z]+/g
                                            )[0];
                                        var numbs = element.area_name.replace(
                                            chars,
                                            ""
                                        );

                                        const datakomponent = {
                                            name: "rack",
                                            header: element.rack_number,
                                            condition: "rack",
                                            statusinstall: element.status,
                                            status: "rack",
                                            display: false,
                                        };

                                        if (parseInt(numbs) > 0) {
                                            if (
                                                lettersTonumber(
                                                    chars.toLowerCase()
                                                ) >= 156
                                            ) {
                                                if (
                                                    parseInt(numbs) - 1 >=
                                                    tempfacilities.length
                                                ) {
                                                    expandArray(
                                                        tempfacilities,
                                                        parseInt(numbs) -
                                                            tempfacilities.length +
                                                            1,
                                                        0
                                                    );
                                                }

                                                if (
                                                    lettersTonumber(
                                                        chars.toLowerCase()
                                                    ) -
                                                        156 >=
                                                    tempfacilities[0].length
                                                ) {
                                                    expandArray(
                                                        tempfacilities,
                                                        0,
                                                        lettersTonumber(
                                                            chars.toLowerCase()
                                                        ) -
                                                            156 -
                                                            tempfacilities[0]
                                                                .length +
                                                            1
                                                    );
                                                }

                                                tempfacilities[
                                                    parseInt(numbs) - 1
                                                ][
                                                    lettersTonumber(
                                                        chars.toLowerCase()
                                                    ) - 156
                                                ].push(datakomponent);
                                            } else {
                                                if (
                                                    parseInt(numbs) >=
                                                    temparray.length
                                                ) {
                                                    expandArray(
                                                        temparray,
                                                        parseInt(numbs) -
                                                            temparray.length +
                                                            0,
                                                        0
                                                    );
                                                }

                                                if (
                                                    lettersTonumber(
                                                        chars.toLowerCase()
                                                    ) >= temparray[0].length
                                                ) {
                                                    expandArray(
                                                        temparray,
                                                        0,
                                                        lettersTonumber(
                                                            chars.toLowerCase()
                                                        ) -
                                                            temparray[0]
                                                                .length +
                                                            0
                                                    );
                                                }

                                                temparray[parseInt(numbs) - 1][
                                                    lettersTonumber(
                                                        chars.toLowerCase()
                                                    )
                                                ].push(datakomponent);
                                            }
                                        }
                                    } else if (
                                        element.area_name.split(",").length ===
                                        2
                                    ) {
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

                                        if (
                                            parseInt(numbs1) > parseInt(numbs2)
                                        ) {
                                            let temp = numbs1;
                                            numbs1 = numbs2;
                                            numbs2 = temp;
                                        }

                                        if (
                                            lettersTonumber(
                                                chars1.toLowerCase()
                                            ) >= 156
                                        ) {
                                            if (
                                                parseInt(numbs1) >=
                                                tempfacilities.length
                                            ) {
                                                expandArray(
                                                    tempfacilities,
                                                    parseInt(numbs1) -
                                                        tempfacilities.length +
                                                        1,
                                                    0
                                                );
                                            }

                                            if (
                                                lettersTonumber(
                                                    chars1.toLowerCase()
                                                ) -
                                                    156 >=
                                                tempfacilities[0].length
                                            ) {
                                                expandArray(
                                                    tempfacilities,
                                                    0,
                                                    lettersTonumber(
                                                        chars1.toLowerCase()
                                                    ) -
                                                        tempfacilities[0]
                                                            .length +
                                                        1
                                                );
                                            }

                                            if (
                                                parseInt(numbs2) >=
                                                tempfacilities.length
                                            ) {
                                                expandArray(
                                                    tempfacilities,
                                                    parseInt(numbs2) -
                                                        tempfacilities.length +
                                                        1,
                                                    0
                                                );
                                            }

                                            if (
                                                lettersTonumber(
                                                    chars2.toLowerCase()
                                                ) -
                                                    156 >=
                                                tempfacilities[0].length
                                            ) {
                                                expandArray(
                                                    tempfacilities,
                                                    0,
                                                    lettersTonumber(
                                                        chars2.toLowerCase()
                                                    ) -
                                                        tempfacilities[0]
                                                            .length +
                                                        1
                                                );
                                            }

                                            for (
                                                let i =
                                                    lettersTonumber(
                                                        chars1.toLowerCase()
                                                    ) - 156;
                                                i <
                                                lettersTonumber(
                                                    chars2.toLowerCase()
                                                ) +
                                                    1 -
                                                    156;
                                                i++
                                            ) {
                                                for (
                                                    let j =
                                                        parseInt(numbs1) - 1;
                                                    j < parseInt(numbs2);
                                                    j++
                                                ) {
                                                    // ////////////////////////////console.log("kali")
                                                    const datakomponent = {
                                                        name: "rack",
                                                        header: element.rack_number,
                                                        condition: "rack",
                                                        statusinstall:
                                                            element.status,
                                                        status: "rack",
                                                        display: false,
                                                    };
                                                    tempfacilities[j][i].push(
                                                        datakomponent
                                                    );
                                                }
                                            }
                                        } else {
                                            if (
                                                parseInt(numbs1) >=
                                                temparray.length
                                            ) {
                                                expandArray(
                                                    temparray,
                                                    parseInt(numbs1) -
                                                        temparray.length +
                                                        0,
                                                    0
                                                );
                                            }

                                            if (
                                                lettersTonumber(
                                                    chars1.toLowerCase()
                                                ) >= temparray[0].length
                                            ) {
                                                expandArray(
                                                    temparray,
                                                    0,
                                                    lettersTonumber(
                                                        chars1.toLowerCase()
                                                    ) -
                                                        temparray[0].length +
                                                        0
                                                );
                                            }

                                            if (
                                                parseInt(numbs2) >=
                                                temparray.length
                                            ) {
                                                expandArray(
                                                    temparray,
                                                    parseInt(numbs2) -
                                                        temparray.length +
                                                        0,
                                                    0
                                                );
                                            }

                                            if (
                                                lettersTonumber(
                                                    chars2.toLowerCase()
                                                ) >= temparray[0].length
                                            ) {
                                                expandArray(
                                                    temparray,
                                                    0,
                                                    lettersTonumber(
                                                        chars2.toLowerCase()
                                                    ) -
                                                        temparray[0].length +
                                                        0
                                                );
                                            }

                                            for (
                                                let i = lettersTonumber(
                                                    chars1.toLowerCase()
                                                );
                                                i <
                                                lettersTonumber(
                                                    chars2.toLowerCase()
                                                ) +
                                                    1;
                                                i++
                                            ) {
                                                for (
                                                    let j =
                                                        parseInt(numbs1) - 1;
                                                    j <
                                                    parseInt(numbs2) - 1 + 1;
                                                    j++
                                                ) {
                                                    // //////////////////////////////console.log("kali")
                                                    const datakomponent = {
                                                        name: "rack",
                                                        header: element.rack_number,
                                                        condition: "rack",
                                                        statusinstall:
                                                            element.status,
                                                        status: "rack",
                                                        display: false,
                                                    };
                                                    temparray[j][i].push(
                                                        datakomponent
                                                    );
                                                }
                                            }
                                        }
                                    }
                                });

                                if (arraydivabsolute.length > 1) {
                                    makearrayabsolutebig(
                                        temparray,
                                        arraydivabsolute
                                    );
                                }

                                setArraydivabsoluteuse(arraydivabsolute);
                                // //console.log("temparrayarraydivabsolute")
                                // //console.log(arraydivabsolute)
                                setDatatable(temparray);

                                if (isTimeLoading) {
                                    clearTimeout(loading);
                                }
                                setIsLoadingData(false);
                            })
                            .catch(() => {
                                toast.error("Failed to get Rack data", {
                                    toastId: "get-rack-data-monitoring",
                                });
                                if (isTimeLoading) {
                                    clearTimeout(loading);
                                }
                                setIsLoadingData(false);
                            });
                        // })
                        // .catch((e) => {
                        //     toast.error("Failed to get Condition by Tag", {
                        //         toastId: "get-condition-by-tag",
                        //     });
                        // });

                        // })
                        // .catch((e) => {
                        //     toast.error("Failed to get Status by Tag");
                        // });
                    })
                    .catch((error) => {
                        ////console.log(error)
                        toast.error("Failed to get Asset data", {
                            toastId: "get-asset-data",
                        });
                        clearTimeout(loading);
                        setIsLoadingData(false);
                    });
            }
        },
        [filter, filterlayoutlistbackup]
    );

    function counnoTrack(data) {
        let count = 0;
        data.forEach((element) => {
            if (element.status === "rack") {
                count++;
            }
        });

        return data.length - count;
    }

    const makearrayabsolutebig = (arraytabel, arraybig) => {
        let smallarrayabsolute = [];

        arraytabel.forEach((elementtabel, i) => {
            elementtabel.forEach((elementj, j) => {
                if (elementj.length > 0 && counnoTrack(elementj) > 1) {
                    let samename = false;
                    elementj.forEach((element) => {
                        arraybig.forEach((elementbig, k) => {
                            if (element.name !== "rack" && !samename) {
                                if (
                                    element.header ===
                                    elementbig.datakomponent[0].header
                                ) {
                                    const datatemp = {
                                        height: 1,
                                        width: 1,
                                        positionX: j + 1,
                                        positionY: i + 1,
                                        datakomponent: elementj,
                                    };

                                    samename = true;
                                    smallarrayabsolute.push(datatemp);
                                }
                            }
                        });
                    });
                }

                if (elementj.length > 0) {
                }
            });
        });

        smallarrayabsolute.forEach((elementabs1, i) => {
            let datatemple = {};
            smallarrayabsolute.forEach((elementabs2, j) => {
                if (i !== j && i < j) {
                    //  //////////////////////////console.log(i,j)
                    samesmallarrayabsolute(
                        elementabs1.datakomponent,
                        elementabs2.datakomponent
                    );
                    if (
                        samesmallarrayabsolute(
                            elementabs1.datakomponent,
                            elementabs2.datakomponent
                        )
                    ) {
                        datatemple = elementabs1;
                        datatemple.width =
                            datatemple.width +
                            (elementabs2.positionX - datatemple.positionX);
                        datatemple.height =
                            datatemple.height +
                            (elementabs2.positionY - datatemple.positionY);
                    }
                }
            });

            if (datatemple.height != null) {
                arraybig.push(datatemple);
            }
        });

        return arraybig;
    };

    function samesmallarrayabsolute(data1, data2) {
        let same = false;
        let count = 0;
        if (counnoTrack(data1) === counnoTrack(data2)) {
            data1.forEach((element1) => {
                data2.forEach((element2) => {
                    if (element1.name !== "rack" && element2.name !== "rack") {
                        // //////////////////////////console.log(element1.asset_name , '',element2.asset_name)
                        if (element1.header === element2.header) {
                            count++;
                        }
                    }
                });
            });
            // //////////////////////////console.log(count)
            if (count === counnoTrack(data1)) {
                same = true;
            }
        }

        // //////////////////////////console.log(same)

        return same;
    }

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

    function getFloor() {
        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_DATA_HUB) +
                process.env.REACT_APP_MONITORING_BLUEPRINT_GET_FLOORS_WITH_RACK,
            headers: {
                authorization: getToken(),
            },
        };

        axios(config).then(function (response) {
            if (response.data.data.length > 0) {
                if (location.state) {
                    setFilter((prev) => ({
                        ...prev,
                        floor: location.state.floor,
                    }));
                } else if (filter.floor) {
                    // do nothing
                } else {
                    setFilter((prev) => ({
                        ...prev,
                        floor: response.data.data[0].id,
                    }));
                }

                // //////console.log("location.state");
                // //////console.log(location.state);

                if (location.state) {
                    getRoomex(location.state.floor, response.data.data);
                } else if (filter.floor) {
                    getRoomex(filter.floor, response.data.data);
                } else {
                    getRoomex(response.data.data[0].id, response.data.data);
                }
            }

            setFilterOptions((prevState) => ({
                ...prevState,
                floor: response.data.data,
            }));
        });
    }

    function getRoomex(floor, floorarray) {
        setFilterOptions((prevState) => ({
            ...prevState,
            room: null,
        }));
        const config = {
            method: "post",
            url:
                ReturnHostBackend(process.env.REACT_APP_DATA_HUB) +
                process.env.REACT_APP_MONITORING_BLUEPRINT_GET_ROOMS_WITH_RACK,
            headers: {
                authorization: getToken(),
            },
            data: { plant_id: floor },
        };
        axios(config)
            .then(function (response) {
                const floor1 = floorarray.find(
                    (dataFloor) => parseInt(dataFloor.id) === parseInt(floor)
                );
                // ////////////////////////console.log("room");
                // ////////////////////////console.log(response.data.data);
                if (response.data.data.length > 0) {
                    if (location.state) {
                        setFilter((prev) => ({
                            ...prev,
                            room: location.state.room,
                        }));

                        const room = response.data.data.find(
                            (dataRoom) =>
                                parseInt(dataRoom.id) ===
                                parseInt(location.state.room)
                        );

                        reloaddatacallback(
                            floor1 ? floor1.name : "",
                            room ? room.name : "",
                            filterlayoutlistbackup
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

                        reloaddatacallback(
                            floor1 ? floor1.name : "",
                            room ? room.name : "",
                            filterlayoutlistbackup
                        );
                    }
                } else {
                    // ////////////////////////console.log(floor1)

                    reloaddatacallback(
                        floor1 ? floor1.name : "",
                        "",
                        filterlayoutlistbackup
                    );
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
    }

    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === "floor") {
            setFilter((prev) => ({ ...prev, floor: value, room: "" }));
            getRoomex(value, filterOptions.floor);

            setPaging(1);
            setArrayrack([]);
            setDisplaydetail(false);
            setliststuckselected([]);
        } else if (name === "room") {
            setFilter((prev) => ({ ...prev, [name]: value }));
            const floor = filterOptions.floor.find(
                (dataFloor) => parseInt(dataFloor.id) === parseInt(filter.floor)
            );
            const room = filterOptions.room.find(
                (dataRoom) => parseInt(dataRoom.id) === parseInt(value)
            );

            reloaddatacallback(
                floor ? floor.name : "",
                room ? room.name : "",
                filterlayoutlistbackup
            );
            setPaging(1);
            setArrayrack([]);
            setDisplaydetail(false);
            setliststuckselected([]);
        } else if (name === "view") {
            setTypedisplay(parseInt(value) - 1);
        }
    };

    const numberToLetters = (num) => {
        let letters = "";
        while (num >= 0) {
            letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[num % 26] + letters;
            num = Math.floor(num / 26) - 1;
        }
        return letters;
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

    const handeleurgencycountsameex = (data) => {
        let count = 0;
        let same = true;
        let inbigbox = false;

        const dataout = {
            condition: "",
            status: "",
            same: false,
            count: 0,
            inbigbox: false,
        };
        let arraydata = [
            {
                name: "Fire System",
                header: "FS-FSS-005",
                condition: "Critical",
                date: "235135",
                status: "UP",
                asset_name: "Fire Suppression System 5",
            },
        ];

        // let  arraycondition = arraydata
        const urgency = ["Critical", "Warning", "Good", null, "rack"];
        arraydata.sort(function (a, b) {
            return urgency.indexOf(a.condition) - urgency.indexOf(b.condition);
        });

        dataout.condition = arraydata[0].condition;

        // let arraystatus = arraydata

        const urgencystatus = ["DOWN", "UP", null, "rack"];
        arraydata.sort(function (a, b) {
            return (
                urgencystatus.indexOf(a.status) -
                urgencystatus.indexOf(b.status)
            );
        });

        dataout.status = arraydata[0].status;

        arraydata.forEach((datai, i) => {
            if (datai.name !== "rack") {
                count++;
            }
            arraydata.forEach((dataj, j) => {
                if (datai.name !== "rack" && dataj.name !== "rack" && i !== j) {
                    // //////////////////////////console.log(datai.name ,'',dataj.name)
                    if (datai.name !== dataj.name) {
                        same = false;
                    }
                }
            });
        });

        // // //////////////////////////console.log(arraydivabsoluteuse)
        arraydivabsoluteuse.forEach((element) => {
            // //////////////////////////console.log(element.datakomponent[0].header)
            arraydata.forEach((elementdata) => {
                // //////////////////////////console.log(element.datakomponent[0].header,"",elementdata.header)
                if (element.datakomponent[0].header === elementdata.header) {
                    inbigbox = true;
                }
            });
        });
        dataout.same = same;
        dataout.inbigbox = inbigbox;

        dataout.count = count;

        return dataout;
    };

    const handeleurgencycountsame = (arraydata) => {
        let count = 0;
        let same = true;
        let inbigbox = false;

        const dataout = {
            condition: "",
            status: "",
            same: false,
            count: 0,
            inbigbox: false,
        };

        const urgency = ["Critical", "Warning", "Good", null, "rack"];
        arraydata.sort(function (a, b) {
            return urgency.indexOf(a.condition) - urgency.indexOf(b.condition);
        });

        dataout.condition = arraydata[0].condition;

        // let arraystatus = arraydata

        const urgencystatus = ["DOWN", "UP", null, "rack"];
        arraydata.sort(function (a, b) {
            return (
                urgencystatus.indexOf(a.status) -
                urgencystatus.indexOf(b.status)
            );
        });

        dataout.status = arraydata[0].status;

        arraydata.forEach((datai, i) => {
            if (datai.name !== "rack") {
                count++;
            }
            arraydata.forEach((dataj, j) => {
                if (datai.name !== "rack" && dataj.name !== "rack" && i !== j) {
                    // //////////////////////////console.log(datai.name ,'',dataj.name)
                    if (datai.name !== dataj.name) {
                        same = false;
                    }
                }
            });
        });

        arraydivabsoluteuse.forEach((element) => {
            arraydata.forEach((elementdata) => {
                if (element.datakomponent[0].header === elementdata.header) {
                    inbigbox = true;
                }
            });
        });
        dataout.same = same;
        dataout.inbigbox = inbigbox;
        // //////////////////////////console.log(count)
        dataout.count = count;
        return dataout;
    };

    const handleurgency = (data) => {
        const urgency = [
            "Critical",
            "Warning",
            "Good",
            "Down",
            "Up",
            ,
            null,
            "rack",
        ];
        data.sort(function (a, b) {
            return urgency.indexOf(a.condition) - urgency.indexOf(b.condition);
        });
        return data;
    };

    const handlesubmitFilter = () => {
        ////////////////////console.log("handlesubmitFilter")
        ////////////////////console.log(filterlayoutlist)
        const floor = filterOptions.floor.find(
            (dataFloor) => parseInt(dataFloor.id) === parseInt(filter.floor)
        );
        const room = filterOptions.room.find(
            (dataRoom) => parseInt(dataRoom.id) === parseInt(filter.room)
        );
        reloaddatacallback(
            floor ? floor.name : "",
            room ? room.name : "",
            filterlayoutlist
        );

        setFilterlayoutbackup(filterlayout);
        setFilterlayoutlistbackup(filterlayoutlist);

        toggleFilter();
    };
    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        ////////console.log(query)//"app=article&act=news_content&aid=160990"
        var vars = query.split("&");
        ////////console.log(vars) //[ 'app=article', 'act=news_content', 'aid=160990' ]
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            ////////console.log(pair)//[ 'app', 'article' ][ 'act', 'news_content' ][ 'aid', '160990' ]
            if (pair[0] == variable) {
                return pair[1];
            }
        }
        return false;
    }

    useEffect(() => {

        console.log(getUserDetails().username)
        getFloor();
        history.replace();
    }, []);

    useEffect(() => {
        let floor = {};
        if (filterOptions.floor) {
            if (filterOptions.floor.length > 0) {
                floor = filterOptions.floor.find(
                    (dataFloor) =>
                        parseInt(dataFloor.id) === parseInt(filter.floor)
                );
            }
        }
        let room = {};
        if (filterOptions.room) {
            if (filterOptions.room.length > 0) {
                room = filterOptions.room.find(
                    (dataRoom) =>
                        parseInt(dataRoom.id) === parseInt(filter.room)
                );
            }
        }

        const interval = setInterval(() => {
            if (!isShowingfilter) {
                reloaddatacallback(
                    floor.name ? floor.name : "",
                    room.name ? room.name : "",
                    filterlayoutlistbackup,
                    true
                );
            }

            setTime(Date.now());
        }, 5 * 1000);

        return () => {
            clearInterval(interval);
        };
    }, [time, isShowingfilter, filter, filterOptions]);

    // useEffect(() => {
    //     handleDisplaydetail(false); // This is be executed when `loading` state changes
    // }, [datatable])

    const handletoVisualisation = () => {
        history.push({
            pathname:
                "/operation/rack_and_server_management/layout_visualization",
            state: { floor: filter.floor, room: filter.room },
        });
    };

    function handleDisplaydetail(
        id,
        indexHeader,
        indexRow,
        rack_id,
        bigorno,
        facilitiesorno
    ) {
        //arraydivabsoluteusefacilities
        //console.log("datatable");
        //console.log(datatable);

        setPaging(1);

        let tempdisplaydatafacilities = [];

        for (let i = 0; i < datatablefasilities.length; i++) {
            tempdisplaydatafacilities.push([]);

            for (let j = 0; j < datatablefasilities[0].length; j++) {
                tempdisplaydatafacilities[i].push([{ display: false }]);
            }
        }

        let tempdisplaydata = [];

        for (let i = 0; i < datatable.length; i++) {
            tempdisplaydata.push([]);
            for (let j = 0; j < datatable[0].length; j++) {
                tempdisplaydata[i].push([{ display: false }]);
            }
        }

        let tempdisplaybigdata = [];
        for (let i = 0; i < arraydivabsoluteuse.length; i++) {
            tempdisplaybigdata.push(false);
        }

        let tempdisplaybigdatafacilities = [];
        for (let i = 0; i < arraydivabsoluteusefacilities.length; i++) {
            tempdisplaybigdatafacilities.push(false);
        }

        if (id) {
            if (rack_id.length > 0) {
                setArrayrack(rack_id);
            } else {
                setArrayrack([]);
            }

            if (bigorno) {
                if (facilitiesorno) {
                    for (
                        let i = 0;
                        i < tempdisplaybigdatafacilities.length;
                        i++
                    ) {
                        if (i === indexHeader) {
                            tempdisplaybigdatafacilities[i] = true;
                        } else {
                            tempdisplaybigdatafacilities[i] = false;
                        }
                    }
                } else {
                    for (let i = 0; i < tempdisplaybigdata.length; i++) {
                        if (i === indexHeader) {
                            tempdisplaybigdata[i] = true;
                        } else {
                            tempdisplaybigdata[i] = false;
                        }
                    }
                }
            } else {
                if (facilitiesorno) {
                    for (let i = 0; i < tempdisplaydatafacilities.length; i++) {
                        for (
                            let j = 0;
                            j < tempdisplaydatafacilities[0].length;
                            j++
                        ) {
                            if (i === indexHeader && j === indexRow) {
                                tempdisplaydatafacilities[indexHeader][
                                    indexRow
                                ][0].display = true;
                            } else {
                                if (tempdisplaydatafacilities[i][j][0]) {
                                    tempdisplaydatafacilities[i][
                                        j
                                    ][0].display = false;
                                }
                            }
                        }
                    }
                } else {
                    for (let i = 0; i < tempdisplaydata.length; i++) {
                        for (let j = 0; j < tempdisplaydata[0].length; j++) {
                            if (i === indexHeader && j === indexRow) {
                                tempdisplaydata[indexHeader][
                                    indexRow
                                ][0].display = true;
                            } else {
                                if (tempdisplaydata[i][j][0]) {
                                    tempdisplaydata[i][j][0].display = false;
                                }
                            }
                        }
                    }
                }
            }
        } else {
            setArrayrack([]);
        }

        // //console.log("facilitiesorno");
        // //console.log(tempdisplaydata)

        setliststuckselectedfacilities(tempdisplaydatafacilities);
        setliststuckselected(tempdisplaydata);
        setliststuckselectedbig(tempdisplaybigdata);
        setliststuckselectedbigfacilities(tempdisplaybigdatafacilities);
        setDisplaydetail(id);
    }

    const handleChangeRoute = (value) => {
        history.push(`${baseURL}/${value}`);
        // handleChangeView("grid");
        // window.location.reload();
    };

    function toHHMMSS(seconds_sum) {
        var sec_num = parseInt(seconds_sum, 10);
        var days = Math.floor(sec_num / (3600 * 24));
        var hoursdays = Math.floor((sec_num - days * 3600 * 24) / 3600);
        var minutesdays = Math.floor(
            (sec_num - hoursdays * 3600 - days * 3600 * 24) / 60
        );
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - hours * 3600) / 60);
        var seconds = sec_num - hours * 3600 - minutes * 60;

        if (days < 10) {
            days = "0" + days;
        }
        if (hoursdays < 10) {
            hoursdays = "0" + hoursdays;
        }
        if (minutesdays < 10) {
            minutesdays = "0" + minutesdays;
        }
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }

        return days + ":" + hoursdays + ":" + minutesdays;
    }

    useEffect(() => {
        const elmnt = document.getElementById("clickedRack");
        if (elmnt) {
            elmnt.scrollIntoView({
                block: "center",
                inline: "center",
                behavior: "smooth",
            });
        }
    }, [liststuckselectedbig, liststuckselected]);

    return (
        <React.Fragment>
            {/* <Popupfilter toggleFilter={()=>{ toggleFilter()} } isShowingfilter={isShowingfilter} /> */}
            <ModalContainer
                formId={"filter-add"}
                width={"590px"}
                title={"Filter Layout Display"}
                isShowing={isShowingfilter}
                hide={() => {
                    ////////////////////console.log("hide")
                    ////////////////////console.log(filterlayoutlistbackup)
                    setFilterlayout(filterlayoutbackup);
                    setFilterlayoutlist(filterlayoutlistbackup);
                    toggleFilter();
                }}
                submitName={"Submit"}
                // onSubmit={handlesubmitFilter}
                children={
                    <form id='filter-add' onSubmit={handlesubmitFilter}>
                        <div style={{ fontSize: "20px", marginBottom: "15px" }}>
                            Asset Type Display
                        </div>

                        <div
                            style={{
                                fontSize: "16px",
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "10px",
                                fontWeight: "600",
                            }}>
                            <input
                                id='DisplayAllAssetType'
                                type='radio'
                                value='All'
                                checked={filterlayout.type === "All"}
                                onChange={() => {
                                    setFilterlayoutlist((prevState) => ({
                                        ...prevState,
                                        type: {
                                            ...prevState.type,
                                            environment: true,
                                            cooling: true,
                                            fire: true,
                                            network: true,
                                            power: true,
                                            camera: true,
                                            access: true,
                                            smokedetection: true,
                                            waterleak: true,
                                            gasleak: true,
                                        },
                                    }));

                                    setFilterlayout((prev) => ({
                                        ...prev,
                                        type: "All",
                                    }));
                                }}
                                style={{
                                    width: "25px",
                                    height: "25px",
                                    marginRight: "20px",
                                }}
                            />{" "}
                            <label htmlFor='DisplayAllAssetType'>
                                {" "}
                                Display All Asset Type
                            </label>
                        </div>
                        <div
                            style={{
                                fontSize: "16px",
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "20px",
                                fontWeight: "600",
                            }}>
                            <input
                                id='FilterAssetType'
                                type='radio'
                                value='filter'
                                checked={filterlayout.type === "filter"}
                                onChange={() => {
                                    setFilterlayout((prev) => ({
                                        ...prev,
                                        type: "filter",
                                    }));
                                }}
                                style={{
                                    width: "25px",
                                    height: "25px",
                                    marginRight: "20px",
                                }}
                            />{" "}
                            <label htmlFor='FilterAssetType'>
                                {" "}
                                Filter Asset Type
                            </label>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                marginBottom: "30px",
                                gap: "40px",
                                position: "relative",
                            }}>
                            <div
                                style={{
                                    width: "50%",
                                    display: "flex",
                                    flexDirection: "column",
                                    rowGap: "20px",
                                }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                        justifyContent: "space-between",
                                    }}>
                                    <div
                                        style={{
                                            width: "15%",
                                            justifyContent: "center",
                                            display: "flex",
                                        }}>
                                        <img
                                            style={{ width: "25px" }}
                                            src={SVG_powerwhite}
                                            alt='grid-view'
                                        />
                                    </div>
                                    <div
                                        style={{
                                            width: "100%",
                                            paddingLeft: "25px",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                        }}>
                                        <label
                                            style={{ fontSize: "16px" }}
                                            htmlFor='PowerSystem<'>
                                            Power System
                                        </label>

                                        <input
                                            id='PowerSystem'
                                            type='checkbox'
                                            checked={
                                                filterlayoutlist.type.power
                                            }
                                            onChange={() =>
                                                setFilterlayoutlist(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        type: {
                                                            ...prevState.type,
                                                            power: !filterlayoutlist
                                                                .type.power,
                                                        },
                                                    })
                                                )
                                            }
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                            }}
                                        />
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                        justifyContent: "space-between",
                                    }}>
                                    <div
                                        style={{
                                            width: "15%",
                                            justifyContent: "center",
                                            display: "flex",
                                        }}>
                                        <img
                                            style={{ width: "25px" }}
                                            src={SVG_coolingwhite}
                                            alt='grid-view'
                                        />
                                    </div>
                                    <div
                                        style={{
                                            width: "100%",
                                            paddingLeft: "25px",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                        }}>
                                        <label
                                            style={{ fontSize: "16px" }}
                                            htmlFor='CoolingSystem'>
                                            Cooling System{" "}
                                        </label>

                                        <input
                                            id='CoolingSystem'
                                            type='checkbox'
                                            checked={
                                                filterlayoutlist.type.cooling
                                            }
                                            onChange={() =>
                                                setFilterlayoutlist(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        type: {
                                                            ...prevState.type,
                                                            cooling:
                                                                !filterlayoutlist
                                                                    .type
                                                                    .cooling,
                                                        },
                                                    })
                                                )
                                            }
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                            }}
                                        />
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                        justifyContent: "space-between",
                                    }}>
                                    <div
                                        style={{
                                            width: "15%",
                                            justifyContent: "center",
                                            display: "flex",
                                        }}>
                                        <img
                                            style={{ width: "15px" }}
                                            src={SVG_sensorwhite}
                                            alt='grid-view'
                                        />
                                    </div>
                                    <div
                                        style={{
                                            width: "100%",
                                            paddingLeft: "25px",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                        }}>
                                        <label
                                            style={{
                                                fontSize: "16px",
                                                width: "170px",
                                            }}
                                            htmlFor='EnvironmentSensing'>
                                            Temperature & Humidity Sensing
                                        </label>

                                        <input
                                            id='EnvironmentSensing'
                                            type='checkbox'
                                            checked={
                                                filterlayoutlist.type
                                                    .environment
                                            }
                                            onChange={() =>
                                                setFilterlayoutlist(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        type: {
                                                            ...prevState.type,
                                                            environment:
                                                                !filterlayoutlist
                                                                    .type
                                                                    .environment,
                                                        },
                                                    })
                                                )
                                            }
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                            }}
                                        />
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                        justifyContent: "space-between",
                                    }}>
                                    <div
                                        style={{
                                            width: "15%",
                                            justifyContent: "center",
                                            display: "flex",
                                        }}>
                                        <img
                                            style={{ width: "25px" }}
                                            src={SVG_cctvwhite}
                                            alt='grid-view'
                                        />
                                    </div>
                                    <div
                                        style={{
                                            width: "100%",
                                            paddingLeft: "25px",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                        }}>
                                        <label
                                            style={{ fontSize: "16px" }}
                                            htmlFor='Camera'>
                                            Camera System
                                        </label>

                                        <input
                                            id='Camera'
                                            type='checkbox'
                                            checked={
                                                filterlayoutlist.type.camera
                                            }
                                            onChange={() =>
                                                setFilterlayoutlist(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        type: {
                                                            ...prevState.type,
                                                            camera: !filterlayoutlist
                                                                .type.camera,
                                                        },
                                                    })
                                                )
                                            }
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                            }}
                                        />
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                        justifyContent: "space-between",
                                    }}>
                                    <div
                                        style={{
                                            width: "15%",
                                            justifyContent: "center",
                                            display: "flex",
                                        }}>
                                        <img
                                            style={{ width: "25px" }}
                                            src={SVG_acceswhite}
                                            alt='grid-view'
                                        />
                                    </div>
                                    <div
                                        style={{
                                            width: "100%",
                                            paddingLeft: "25px",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                        }}>
                                        <label
                                            style={{ fontSize: "16px" }}
                                            htmlFor='AccessSystem'>
                                            Access System
                                        </label>

                                        <input
                                            id='AccessSystem'
                                            type='checkbox'
                                            checked={
                                                filterlayoutlist.type.access
                                            }
                                            onChange={() =>
                                                setFilterlayoutlist(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        type: {
                                                            ...prevState.type,
                                                            access: !filterlayoutlist
                                                                .type.access,
                                                        },
                                                    })
                                                )
                                            }
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div
                                style={{
                                    width: "50%",
                                    display: "flex",
                                    flexDirection: "column",
                                    rowGap: "20px",
                                }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                        justifyContent: "space-between",
                                    }}>
                                    <div
                                        style={{
                                            width: "15%",
                                            justifyContent: "center",
                                            display: "flex",
                                        }}>
                                        <img
                                            style={{ width: "25px" }}
                                            src={SVG_firewihte}
                                            alt='grid-view'
                                        />
                                    </div>
                                    <div
                                        style={{
                                            width: "100%",
                                            paddingLeft: "25px",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                        }}>
                                        <label
                                            style={{ fontSize: "16px" }}
                                            htmlFor='FireSystem'>
                                            Fire System
                                        </label>

                                        <input
                                            id='FireSystem'
                                            type='checkbox'
                                            checked={filterlayoutlist.type.fire}
                                            onChange={() =>
                                                setFilterlayoutlist(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        type: {
                                                            ...prevState.type,
                                                            fire: !filterlayoutlist
                                                                .type.fire,
                                                        },
                                                    })
                                                )
                                            }
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                            }}
                                        />
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                        justifyContent: "space-between",
                                    }}>
                                    <div
                                        style={{
                                            width: "15%",
                                            justifyContent: "center",
                                            display: "flex",
                                        }}>
                                        <img
                                            style={{ width: "25px" }}
                                            src={SVG_smokewhite}
                                            alt='grid-view'
                                        />
                                    </div>
                                    <div
                                        style={{
                                            width: "100%",
                                            paddingLeft: "25px",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                        }}>
                                        <label
                                            style={{ fontSize: "16px" }}
                                            htmlFor='SmokeDetection'>
                                            Smoke Detection
                                        </label>

                                        <input
                                            id='SmokeDetection'
                                            type='checkbox'
                                            checked={
                                                filterlayoutlist.type
                                                    .smokedetection
                                            }
                                            onChange={() =>
                                                setFilterlayoutlist(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        type: {
                                                            ...prevState.type,
                                                            smokedetection:
                                                                !filterlayoutlist
                                                                    .type
                                                                    .smokedetection,
                                                        },
                                                    })
                                                )
                                            }
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                            }}
                                        />
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                        justifyContent: "space-between",
                                    }}>
                                    <div
                                        style={{
                                            width: "15%",
                                            justifyContent: "center",
                                            display: "flex",
                                        }}>
                                        <img
                                            style={{ width: "25px" }}
                                            src={SVG_gasleakwhite}
                                            alt='grid-view'
                                        />
                                    </div>
                                    <div
                                        style={{
                                            width: "100%",
                                            paddingLeft: "25px",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                        }}>
                                        <label
                                            style={{ fontSize: "16px" }}
                                            htmlFor='GasLeakDetection'>
                                            Gas Leak Detection
                                        </label>

                                        <input
                                            id='GasLeakDetection'
                                            type='checkbox'
                                            checked={
                                                filterlayoutlist.type.gasleak
                                            }
                                            onChange={() =>
                                                setFilterlayoutlist(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        type: {
                                                            ...prevState.type,
                                                            gasleak:
                                                                !filterlayoutlist
                                                                    .type
                                                                    .gasleak,
                                                        },
                                                    })
                                                )
                                            }
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                            }}
                                        />
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                        justifyContent: "space-between",
                                    }}>
                                    <div
                                        style={{
                                            width: "15%",
                                            justifyContent: "center",
                                            display: "flex",
                                        }}>
                                        <img
                                            style={{ width: "25px" }}
                                            src={SVG_waterleakwhite}
                                            alt='grid-view'
                                        />
                                    </div>
                                    <div
                                        style={{
                                            width: "100%",
                                            paddingLeft: "25px",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                        }}>
                                        <label
                                            style={{ fontSize: "16px" }}
                                            htmlFor='WaterLeakDetection'>
                                            Water Leak Detection
                                        </label>

                                        <input
                                            id='WaterLeakDetection'
                                            type='checkbox'
                                            checked={
                                                filterlayoutlist.type.waterleak
                                            }
                                            onChange={() =>
                                                setFilterlayoutlist(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        type: {
                                                            ...prevState.type,
                                                            waterleak:
                                                                !filterlayoutlist
                                                                    .type
                                                                    .waterleak,
                                                        },
                                                    })
                                                )
                                            }
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                            }}
                                        />
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                        justifyContent: "space-between",
                                    }}>
                                    <div
                                        style={{
                                            width: "15%",
                                            justifyContent: "center",
                                            display: "flex",
                                        }}>
                                        <img
                                            style={{ width: "25px" }}
                                            src={SVG_networkwhite}
                                            alt='grid-view'
                                        />
                                    </div>
                                    <div
                                        style={{
                                            width: "100%",
                                            paddingLeft: "25px",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                        }}>
                                        <label
                                            style={{ fontSize: "16px" }}
                                            htmlFor='Network'>
                                            Network
                                        </label>

                                        <input
                                            id='Network'
                                            type='checkbox'
                                            checked={
                                                filterlayoutlist.type.network
                                            }
                                            onChange={() =>
                                                setFilterlayoutlist(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        type: {
                                                            ...prevState.type,
                                                            network:
                                                                !filterlayoutlist
                                                                    .type
                                                                    .network,
                                                        },
                                                    })
                                                )
                                            }
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div
                                style={{
                                    position: "absolute",
                                    backgroundColor: "#08091b",
                                    width: "100%",
                                    height: "100%",
                                    opacity: "0.5",
                                    display:
                                        filterlayout.type === "All"
                                            ? "flex"
                                            : "none",
                                }}
                            />
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: "40px",
                            }}>
                            <div style={{ width: "50%" }}>
                                <div
                                    style={{
                                        fontSize: "20px",
                                        marginBottom: "15px",
                                    }}>
                                    Status Display
                                </div>

                                <div
                                    style={{
                                        fontSize: "16px",
                                        display: "flex",
                                        alignItems: "center",
                                        marginBottom: "10px",
                                        fontWeight: "600",
                                    }}>
                                    <input
                                        id='DisplayAllStatus'
                                        type='radio'
                                        value='All'
                                        checked={
                                            filterlayout.condition === "All"
                                        }
                                        onChange={() => {
                                            setFilterlayoutlist(
                                                (prevState) => ({
                                                    ...prevState,
                                                    condition: {
                                                        ...prevState.condition,
                                                        running: true,
                                                        down: true,
                                                        unknown: true,
                                                    },
                                                })
                                            );
                                            setFilterlayout((prev) => ({
                                                ...prev,
                                                condition: "All",
                                            }));
                                        }}
                                        style={{
                                            width: "25px",
                                            height: "25px",
                                            marginRight: "20px",
                                        }}
                                    />{" "}
                                    <label htmlFor='DisplayAllStatus'>
                                        Display All Status
                                    </label>
                                </div>
                                <div
                                    style={{
                                        fontSize: "16px",
                                        display: "flex",
                                        alignItems: "center",
                                        marginBottom: "20px",
                                        fontWeight: "600",
                                    }}>
                                    <input
                                        id='FilterAssetStatus'
                                        type='radio'
                                        value='filter'
                                        checked={
                                            filterlayout.condition === "filter"
                                        }
                                        onChange={() => {
                                            setFilterlayout((prev) => ({
                                                ...prev,
                                                condition: "filter",
                                            }));
                                        }}
                                        style={{
                                            width: "25px",
                                            height: "25px",
                                            marginRight: "20px",
                                        }}
                                    />{" "}
                                    <label htmlFor='FilterAssetStatus'>
                                        Filter Asset Status
                                    </label>
                                </div>
                            </div>
                            <div style={{ width: "50%" }}>
                                <div
                                    style={{
                                        fontSize: "20px",
                                        marginBottom: "15px",
                                    }}>
                                    Condition Display
                                </div>

                                <div
                                    style={{
                                        fontSize: "16px",
                                        display: "flex",
                                        alignItems: "center",
                                        marginBottom: "10px",
                                        fontWeight: "600",
                                    }}>
                                    <input
                                        id='DisplayAllCondition'
                                        type='radio'
                                        value='All'
                                        checked={filterlayout.status === "All"}
                                        onChange={() => {
                                            setFilterlayoutlist(
                                                (prevState) => ({
                                                    ...prevState,
                                                    status: {
                                                        ...prevState.status,
                                                        good: true,
                                                        warning: true,
                                                        critical: true,
                                                        unknown: true,
                                                    },
                                                })
                                            );
                                            setFilterlayout((prev) => ({
                                                ...prev,
                                                status: "All",
                                            }));
                                        }}
                                        style={{
                                            width: "25px",
                                            height: "25px",
                                            marginRight: "20px",
                                        }}
                                    />{" "}
                                    <label htmlFor='DisplayAllCondition'>
                                        Display All Condition
                                    </label>
                                </div>
                                <div
                                    style={{
                                        fontSize: "16px",
                                        display: "flex",
                                        alignItems: "center",
                                        marginBottom: "20px",
                                        fontWeight: "600",
                                    }}>
                                    <input
                                        id='FilterAssetCondition'
                                        type='radio'
                                        value='filter'
                                        checked={
                                            filterlayout.status === "filter"
                                        }
                                        onChange={() => {
                                            setFilterlayout((prev) => ({
                                                ...prev,
                                                status: "filter",
                                            }));
                                        }}
                                        style={{
                                            width: "25px",
                                            height: "25px",
                                            marginRight: "20px",
                                        }}
                                    />{" "}
                                    <label htmlFor='FilterAssetCondition'>
                                        Filter Asset Condition
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                marginBottom: "30px",
                                gap: "40px",
                            }}>
                            <div
                                style={{
                                    width: "50%",
                                    display: "flex",
                                    flexDirection: "column",
                                    rowGap: "20px",
                                    position: "relative",
                                }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                    }}>
                                    <div
                                        style={{
                                            width: "15%",
                                            justifyContent: "center",
                                            display: "flex",
                                        }}>
                                        <div
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                                backgroundColor: "#00F23D",
                                            }}></div>
                                    </div>
                                    <div
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            paddingLeft: "25px",
                                            alignItems: "center",
                                        }}>
                                        <label
                                            htmlFor='UP'
                                            style={{ fontSize: "16px" }}>
                                            UP
                                        </label>

                                        <input
                                            id='UP'
                                            type='checkbox'
                                            checked={
                                                filterlayoutlist.condition
                                                    .running
                                            }
                                            onChange={() =>
                                                setFilterlayoutlist(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        condition: {
                                                            ...prevState.condition,
                                                            running:
                                                                !filterlayoutlist
                                                                    .condition
                                                                    .running,
                                                        },
                                                    })
                                                )
                                            }
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                            }}
                                        />
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                    }}>
                                    <div
                                        style={{
                                            width: "15%",
                                            justifyContent: "center",
                                            display: "flex",
                                        }}>
                                        <div
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                                backgroundColor: "#F11B2A",
                                            }}></div>
                                    </div>
                                    <div
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            paddingLeft: "25px",
                                            alignItems: "center",
                                        }}>
                                        <label
                                            htmlFor='Down'
                                            style={{ fontSize: "16px" }}>
                                            Down
                                        </label>

                                        <input
                                            id='Down'
                                            type='checkbox'
                                            checked={
                                                filterlayoutlist.condition.down
                                            }
                                            onChange={() =>
                                                setFilterlayoutlist(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        condition: {
                                                            ...prevState.condition,
                                                            down: !filterlayoutlist
                                                                .condition.down,
                                                        },
                                                    })
                                                )
                                            }
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                            }}
                                        />
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                    }}>
                                    <div
                                        style={{
                                            width: "15%",
                                            justifyContent: "center",
                                            display: "flex",
                                        }}>
                                        <div
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                                backgroundColor: "#735A57",
                                            }}></div>
                                    </div>
                                    <div
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            paddingLeft: "25px",
                                            alignItems: "center",
                                        }}>
                                        <label
                                            htmlFor='UnknownStatus'
                                            style={{ fontSize: "16px" }}>
                                            Offline
                                        </label>

                                        <input
                                            id='UnknownStatus'
                                            type='checkbox'
                                            checked={
                                                filterlayoutlist.condition
                                                    .unknown
                                            }
                                            onChange={() =>
                                                setFilterlayoutlist(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        condition: {
                                                            ...prevState.condition,
                                                            unknown:
                                                                !filterlayoutlist
                                                                    .condition
                                                                    .unknown,
                                                        },
                                                    })
                                                )
                                            }
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                            }}
                                        />
                                    </div>
                                </div>
                                <div
                                    style={{
                                        position: "absolute",
                                        backgroundColor: "#08091b",
                                        width: "100%",
                                        height: "100%",
                                        opacity: "0.5",
                                        display:
                                            filterlayout.condition === "All"
                                                ? "flex"
                                                : "none",
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    width: "50%",
                                    display: "flex",
                                    flexDirection: "column",
                                    rowGap: "20px",
                                    position: "relative",
                                }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                    }}>
                                    <div
                                        style={{
                                            width: "15%",
                                            justifyContent: "center",
                                            display: "flex",
                                        }}>
                                        <div
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                                backgroundColor: "#00F23D",
                                                borderRadius: "50%",
                                            }}></div>
                                    </div>
                                    <div
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            paddingLeft: "25px",
                                            alignItems: "center",
                                        }}>
                                        <label
                                            htmlFor='Good'
                                            style={{ fontSize: "16px" }}>
                                            Good
                                        </label>

                                        <input
                                            id='Good'
                                            type='checkbox'
                                            checked={
                                                filterlayoutlist.status.good
                                            }
                                            onChange={() =>
                                                setFilterlayoutlist(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        status: {
                                                            ...prevState.status,
                                                            good: !filterlayoutlist
                                                                .status.good,
                                                        },
                                                    })
                                                )
                                            }
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                            }}
                                        />
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                    }}>
                                    <div
                                        style={{
                                            width: "15%",
                                            justifyContent: "center",
                                            display: "flex",
                                        }}>
                                        <div
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                                backgroundColor: "#FEBC2C",
                                                borderRadius: "50%",
                                            }}></div>
                                    </div>
                                    <div
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            paddingLeft: "25px",
                                            alignItems: "center",
                                        }}>
                                        <label
                                            htmlFor='Warning'
                                            style={{ fontSize: "16px" }}>
                                            Warning
                                        </label>

                                        <input
                                            id='Warning'
                                            type='checkbox'
                                            checked={
                                                filterlayoutlist.status.warning
                                            }
                                            onChange={() =>
                                                setFilterlayoutlist(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        status: {
                                                            ...prevState.status,
                                                            warning:
                                                                !filterlayoutlist
                                                                    .status
                                                                    .warning,
                                                        },
                                                    })
                                                )
                                            }
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                            }}
                                        />
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                    }}>
                                    <div
                                        style={{
                                            width: "15%",
                                            justifyContent: "center",
                                            display: "flex",
                                        }}>
                                        <div
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                                backgroundColor: "#F11B2A",
                                                borderRadius: "50%",
                                            }}></div>
                                    </div>
                                    <div
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            paddingLeft: "25px",
                                            alignItems: "center",
                                        }}>
                                        <label
                                            htmlFor='Critical'
                                            style={{ fontSize: "16px" }}>
                                            Critical
                                        </label>

                                        <input
                                            id='Critical'
                                            type='checkbox'
                                            checked={
                                                filterlayoutlist.status.critical
                                            }
                                            onChange={() =>
                                                setFilterlayoutlist(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        status: {
                                                            ...prevState.status,
                                                            critical:
                                                                !filterlayoutlist
                                                                    .status
                                                                    .critical,
                                                        },
                                                    })
                                                )
                                            }
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                            }}
                                        />
                                    </div>
                                </div>
                                {/* <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        width: "100%",
                                    }}>
                                    <div
                                        style={{
                                            width: "15%",
                                            justifyContent: "center",
                                            display: "flex",
                                        }}>
                                        <div
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                                backgroundColor: "#735A57",
                                                borderRadius: "50%",
                                            }}></div>
                                    </div>
                                    <div
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            paddingLeft: "25px",
                                            alignItems: "center",
                                        }}>
                                        <label
                                            htmlFor='UnknownCondition'
                                            style={{ fontSize: "16px" }}>
                                            Offline
                                        </label>

                                        <input
                                            id='UnknownCondition'
                                            type='checkbox'
                                            checked={
                                                filterlayoutlist.status.unknown
                                            }
                                            onChange={() =>
                                                setFilterlayoutlist(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        status: {
                                                            ...prevState.status,
                                                            unknown:
                                                                !filterlayoutlist
                                                                    .status
                                                                    .unknown,
                                                        },
                                                    })
                                                )
                                            }
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                            }}
                                        />
                                    </div>
                                </div> */}

                                <div
                                    style={{
                                        position: "absolute",
                                        backgroundColor: "#08091b",
                                        width: "100%",
                                        height: "100%",
                                        opacity: "0.5",
                                        display:
                                            filterlayout.status === "All"
                                                ? "flex"
                                                : "none",
                                    }}
                                />
                            </div>
                        </div>
                    </form>
                }
            />

            <Legend
                isShowing={isShowingLegend}
                hide={toggleLegend}
                type={"monitoring_blueprint"}
            />
            <div className='monitoringareaview-middle'>
                <div className='page-filter'>
                    <InputDropdownHorizontal
                        name='floor'
                        label='Floor'
                        value={filter.floor}
                        options={filterOptions.floor ? filterOptions.floor : []}
                        onChange={handleChange}
                        inputWidth='110px'
                        noEmptyOption={true}
                        isLoading={filterOptions.floor === null}
                    />
                    <InputDropdownHorizontal
                        name='room'
                        label='Room'
                        value={filter.room}
                        options={filterOptions.room ? filterOptions.room : []}
                        onChange={handleChange}
                        inputWidth='110px'
                        isDisabled={
                            filter.floor === "" ||
                            filter.floor === undefined ||
                            filter.floor === null
                        }
                        noEmptyOption={true}
                        isLoading={filterOptions.room === null}
                    />

                    <InputDropdownHorizontal
                        name='view'
                        label='View'
                        value={typedisplay + 1}
                        options={filterpotionsview}
                        onChange={handleChange}
                        inputWidth='110px'
                        noEmptyOption={true}
                    />
                </div>

                <div className='monitoring-hide-show-grid'>
                    <div
                        style={{ cursor: "pointer", width: "30px" }}
                        className='hide-facilities'
                        onClick={() => {
                            toggleFilter();
                        }}>
                        <img
                            style={{ width: "20px" }}
                            src={SVG_filterlayout}
                            alt='grid-view'
                        />
                    </div>

                    <div
                        style={{ cursor: "pointer" }}
                        className='hide-facilities'
                        onClick={() => {
                            setHidefacilities(!hidefacilities);
                        }}>
                        {hidefacilities ? "Show Facilities" : "Hide Facilities"}
                    </div>
                    <div
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                            setHidegride(!hidegride);
                        }}
                        className='hide-facilities'>
                        {hidegride ? "Show Grid" : "Hide Grid"}
                    </div>

                    {/* backgroundColor:!changewindow? #4244D4:, */}

                    <div className={`monitoring-view-selector grid`}>
                        <div
                            onClick={() => {
                                setPageName("Rack Layout");
                                handletoVisualisation();
                            }}
                            className='rack_layout'
                            style={{
                                borderRight: "none",
                                backgroundColor:
                                    viewType === "racklayout" ? "#4244D4" : "",
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
                            onClick={() => {
                                setPageName("Monitoring Layout");
                                handleChangeView(
                                    "blueprint",
                                    filter.floor,
                                    filter.room
                                );
                            }}
                            className='blueprint'
                            style={{
                                borderRight: "none",
                                backgroundColor:
                                    viewType === "blueprint" ? "#4244D4" : "",
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
                                <img src={blueprintLayout} alt='grid-view' />
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
                            onClick={() => {
                                setPageName("Monitoring Overview");
                                handleChangeView(
                                    "grid",
                                    filter.floor,
                                    filter.room
                                );
                            }}
                            className='grid'
                            style={{
                                backgroundColor:
                                    viewType === "grid"
                                        ? "#4244D4"
                                        : "transparent",
                            }}>
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
                                <img src={gridLayout} alt='grid-view' />
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
            <div className='monitoring-area-blueprint-content'>
                <LoadingData isLoading={isLoadingData} />
                <div
                    style={{
                        width: "100%",
                        overflow: "auto",
                    }}>
                    <BlueprintAssetMonitoringexample
                        liststuckselectedbig={liststuckselectedbig}
                        liststuckselected={liststuckselected}
                        onClick={handleDisplaydetail}
                        typedisplay={typedisplay}
                        handleurgency={handleurgency}
                        hidegride={hidegride}
                        data={datatable}
                        numberToLetters={numberToLetters}
                        isFasilities={false}
                        arraydivabsoluteuse={arraydivabsoluteuse}
                        handeleurgencycountsame={handeleurgencycountsame}
                    />
                </div>

                <div
                    style={{
                        // transition: "all 0.3s ease-in",
                        // width: displaydetail ? "550px" : "0px",
                        // display: "flex",
                        minWidth: "430px",
                        paddingTop: "40px",
                        display: displaydetail ? "flex" : "none",
                        flexDirection: "column",
                        gap: "20px",
                        justifyContent: "space-between",
                        overflow: "auto",
                    }}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "20px",
                            height: "100%",
                            overflowY: "auto",
                        }}>
                        {arrayrack.slice((paging - 1) * 3, paging * 3).map(
                            (datarack, i) =>
                                datarack.name !== "rack" && (
                                    <AssetCard
                                        key={i}
                                        assetData={{
                                            asset_number: datarack.header,
                                            asset_name: datarack.long_name,
                                            asset_image: datarack.asset_image,
                                            floor_room:
                                                filterOptions.floor &&
                                                filterOptions.room &&
                                                filter.floor &&
                                                filter.room &&
                                                filterOptions.floor.find(
                                                    (dataFloor) =>
                                                        parseInt(
                                                            dataFloor.id
                                                        ) ===
                                                        parseInt(filter.floor)
                                                ).name +
                                                    "-" +
                                                    filterOptions.room.find(
                                                        (dataFloor) =>
                                                            parseInt(
                                                                dataFloor.id
                                                            ) ===
                                                            parseInt(
                                                                filter.room
                                                            )
                                                    ).name,
                                            area: datarack.area,
                                            status: datarack.status
                                                ? datarack.status
                                                : "Offline",
                                            condition: datarack.condition
                                                ? datarack.condition
                                                : "Offline",
                                            total_timestamp: datarack.date
                                                ? toHHMMSS(
                                                      parseInt(datarack.date)
                                                  )
                                                : toHHMMSS(0),
                                            function: datarack.name,
                                        }}
                                        handleClick={handleChangeRoute}
                                        isHover={true}
                                        isPreview={false}
                                    />
                                )
                        )}
                    </div>

                    <Paging
                        firstPage={() => {
                            if (paging !== 1) {
                                setPaging(1);
                            }
                        }}
                        lastPage={() => {
                            if (Math.ceil(arrayrack.length / 3) < 1) {
                                setPaging(1);
                            } else {
                                if (
                                    paging !== Math.ceil(arrayrack.length / 3)
                                ) {
                                    setPaging(Math.ceil(arrayrack.length / 3));
                                }
                            }
                        }}
                        nextPage={() => {
                            if (Math.ceil(arrayrack.length / 3) < 1) {
                                setPaging(1);
                            } else {
                                if (
                                    paging === Math.ceil(arrayrack.length / 3)
                                ) {
                                    setPaging(Math.ceil(arrayrack.length / 3));
                                } else {
                                    setPaging(paging + 1);
                                }
                            }
                        }}
                        prevPage={() => {
                            if (paging === 1) {
                                setPaging(1);
                            } else {
                                setPaging(paging - 1);
                            }
                        }}
                        currentPageNumber={paging}
                        lastPageNumber={
                            Math.ceil(arrayrack.length / 3) < 1
                                ? 1
                                : Math.ceil(arrayrack.length / 3)
                        }
                    />
                </div>
            </div>
            <div className='monitoring-fasilities-view'>
                {!hidefacilities && (
                    <div
                        style={{
                            width: "100%",
                            backgroundColor: "#12133A",
                            position: "relative",
                        }}>
                        <div
                            style={{
                                textAlign: "center",
                                fontSize: "22px",
                                fontWeight: "bold",
                            }}>
                            Facilities
                        </div>

                        <LoadingData isLoading={isLoadingData} size='150px' />
                        <BlueprintAssetMonitoringexample
                            liststuckselectedbig={
                                liststuckselectedbigfacilities
                            }
                            liststuckselected={liststuckselectedfacilities}
                            onClick={handleDisplaydetail}
                            typedisplay={typedisplay}
                            handleurgency={handleurgency}
                            data={datatablefasilities}
                            numberToLetters={numberToLetters}
                            isFasilities={true}
                            hidegride={hidegride}
                            arraydivabsoluteuse={arraydivabsoluteusefacilities}
                            handeleurgencycountsame={handeleurgencycountsame}
                        />
                    </div>
                )}
            </div>

            <div style={{ zIndex: "100" }}>
                <ButtonDetail onClick={toggleLegend} />
            </div>
        </React.Fragment>
    );
};

export default MonitoringAreaView;

const BlueprintAssetMonitoringexample = ({
    liststuckselectedbig,
    liststuckselected,
    onClick,
    typedisplay,
    handleurgency,
    hidegride,
    data,
    numberToLetters,
    isFasilities,
    arraydivabsoluteuse,
    handeleurgencycountsame,
}) => {
    function counTrack(data) {
        let count = 0;
        data.forEach((element) => {
            if (element.status === "rack") {
                count++;
            }
        });

        return count;
    }

    // //console.log(liststuckselected[indexHeader][indexRow][0].display)

    return (
        <table
            className={`table-no-border-header ${
                isFasilities && "table-facilities"
            } ${hidegride && "table-monitoring-hide-grid"}`}
            style={{ display: "inline-block" }}>
            <thead>
                <tr>
                    <th>{numberToLetters(-1)}</th>
                    {data[0].map((dataHeader, indexHeader) => (
                        <th key={indexHeader} style={{ height: "40px" }}>
                            {hidegride
                                ? ""
                                : isFasilities
                                ? "F" + numberToLetters(indexHeader)
                                : numberToLetters(indexHeader)}
                        </th>
                    ))}
                </tr>
            </thead>
            {/* &&
            handleurgency(dataRow)[0]
                .name !==
                "Environment Sensing" */}
            <tbody>
                {data.map((dataHeader, indexHeader) => (
                    <tr key={indexHeader}>
                        <td className='first-data'>
                            {!hidegride && indexHeader + 1}
                        </td>
                        {dataHeader.map((dataRow, indexRow) => (
                            <td
                                className={
                                    dataRow.length > 0 &&
                                    "td-hover-element-select"
                                }
                                id={
                                    dataRow.length > 0 &&
                                    liststuckselected.length > 0 &&
                                    liststuckselected[indexHeader][indexRow][0]
                                        .display &&
                                    "clickedRack"
                                }
                                //  onMouseOver={changeBackground}
                                //     onMouseOut={changeBackgroundagain}

                                onClick={
                                    dataRow.length <= 0
                                        ? () => {
                                              onClick(
                                                  false,
                                                  indexHeader,
                                                  indexRow
                                              );
                                          }
                                        : dataRow.length - counTrack(dataRow) <=
                                          0
                                        ? () => {
                                              onClick(
                                                  false,
                                                  indexHeader,
                                                  indexRow
                                              );
                                          }
                                        : isFasilities
                                        ? () => {
                                              onClick(
                                                  true,
                                                  indexHeader,
                                                  indexRow,
                                                  dataRow,
                                                  false,
                                                  true
                                              );
                                          }
                                        : () => {
                                              onClick(
                                                  true,
                                                  indexHeader,
                                                  indexRow,
                                                  dataRow
                                              );
                                          }
                                }
                                key={indexRow}
                                style={{
                                    outline:
                                        dataRow.length > 0 &&
                                        liststuckselected.length > 0 &&
                                        liststuckselected[indexHeader][
                                            indexRow
                                        ][0].display &&
                                        "5px solid #4244D4",
                                    zIndex:
                                        dataRow.length > 0 &&
                                        handeleurgencycountsame(dataRow).count >
                                            1 &&
                                        handeleurgencycountsame(dataRow)
                                            .inbigbox === true
                                            ? "2"
                                            : dataRow.length > 0 &&
                                              liststuckselected.length > 0 &&
                                              liststuckselected[indexHeader][
                                                  indexRow
                                              ][0].display
                                            ? "11"
                                            : "",
                                    backgroundColor:
                                        dataRow.length === 0
                                            ? ""
                                            : (typedisplay === 0 ||
                                                  typedisplay === 1) &&
                                              handleurgency(dataRow)[0]
                                                  .status === null
                                            ? "#735A57"
                                            : (typedisplay === 0 ||
                                                  typedisplay === 1) &&
                                              handeleurgencycountsame(
                                                  dataRow
                                              ).status.toLowerCase() === "down"
                                            ? "#F11B2A"
                                            : (typedisplay === 0 ||
                                                  typedisplay === 1) &&
                                              handeleurgencycountsame(
                                                  dataRow
                                              ).status.toLowerCase() === "up"
                                            ? "#00F23D"
                                            : handleurgency(dataRow)[
                                                  handleurgency(dataRow)
                                                      .length - 1
                                              ].status === "rack" &&
                                              handleurgency(dataRow)[
                                                  handleurgency(dataRow)
                                                      .length - 1
                                              ].statusinstall !== "Installed"
                                            ? "rgb(0,0,0,0.5)"
                                            : handleurgency(dataRow)[
                                                  handleurgency(dataRow)
                                                      .length - 1
                                              ].status === "rack" &&
                                              handleurgency(dataRow)[
                                                  handleurgency(dataRow)
                                                      .length - 1
                                              ].statusinstall === "Installed"
                                            ? "rgb(0,0,0)"
                                            : null,
                                }}>
                                {dataRow.length > 0 && (
                                    <Tooltip
                                        tooltip={
                                            dataRow.length === 1 ? (
                                                <TooltipTableData
                                                    data={dataRow[0]}
                                                />
                                            ) : (
                                                <TooltipMultipleData
                                                    datalist={dataRow}
                                                />
                                            )
                                        }>
                                        {handleurgency(dataRow)[
                                            handleurgency(dataRow).length - 1
                                        ].status === "rack" && (
                                            <div
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                    position: "absolute",
                                                    top: -1,
                                                    left: -1,
                                                    border:
                                                        dataRow.length === 0
                                                            ? ""
                                                            : dataRow.length >
                                                                  0 &&
                                                              handleurgency(
                                                                  dataRow
                                                              )[
                                                                  handleurgency(
                                                                      dataRow
                                                                  ).length - 1
                                                              ].status ===
                                                                  "rack" &&
                                                              handleurgency(
                                                                  dataRow
                                                              )[
                                                                  handleurgency(
                                                                      dataRow
                                                                  ).length - 1
                                                              ]
                                                                  .statusinstall !==
                                                                  "Installed"
                                                            ? "2px solid rgba(250,250,250,0.2)"
                                                            : dataRow.length >
                                                                  0 &&
                                                              handleurgency(
                                                                  dataRow
                                                              )[
                                                                  handleurgency(
                                                                      dataRow
                                                                  ).length - 1
                                                              ].status ===
                                                                  "rack" &&
                                                              dataRow.length >
                                                                  0 &&
                                                              handleurgency(
                                                                  dataRow
                                                              )[
                                                                  handleurgency(
                                                                      dataRow
                                                                  ).length - 1
                                                              ]
                                                                  .statusinstall ===
                                                                  "Installed"
                                                            ? "2px solid rgba(250,250,250,1)"
                                                            : "",
                                                    boxSizing: "border-box",
                                                    zIndex: "7",
                                                }}></div>
                                        )}
                                        {handleurgency(dataRow)[0].name !==
                                            "rack" &&
                                            handeleurgencycountsame(dataRow)
                                                .same && (
                                                <div className='monitoring-item-sensor'>
                                                    <img
                                                        style={{
                                                            width: "20px",
                                                            height: "20px",
                                                            //  zIndex: "0",
                                                            zIndex:
                                                                handeleurgencycountsame(
                                                                    dataRow
                                                                ).count > 1 &&
                                                                handeleurgencycountsame(
                                                                    dataRow
                                                                ).inbigbox ===
                                                                    true
                                                                    ? "4"
                                                                    : "",
                                                        }}
                                                        src={
                                                            handleurgency(
                                                                dataRow
                                                            )[0].name ===
                                                            "Power System"
                                                                ? SVG_power
                                                                : handleurgency(
                                                                      dataRow
                                                                  )[0].name ===
                                                                  "Fire System"
                                                                ? SVG_fire
                                                                : handleurgency(
                                                                      dataRow
                                                                  )[0].name ===
                                                                  "Cooling System"
                                                                ? SVG_cooling
                                                                : handleurgency(
                                                                      dataRow
                                                                  )[0].name ===
                                                                  "Network"
                                                                ? SVG_network
                                                                : handleurgency(
                                                                      dataRow
                                                                  )[0].name ===
                                                                  "Security System"
                                                                ? SVG_security
                                                                : handleurgency(
                                                                      dataRow
                                                                  )[0].name ===
                                                                  "Temperature & Humidity Sensing"
                                                                ? SVG_sensor
                                                                : handleurgency(
                                                                      dataRow
                                                                  )[0].name ===
                                                                  "Camera System"
                                                                ? SVG_cctv
                                                                : handleurgency(
                                                                      dataRow
                                                                  )[0].name ===
                                                                  "Access System"
                                                                ? SVG_acces
                                                                : handleurgency(
                                                                      dataRow
                                                                  )[0].name ===
                                                                  "Smoke Detection"
                                                                ? SVG_smoke
                                                                : handleurgency(
                                                                      dataRow
                                                                  )[0].name ===
                                                                  "Gas Leak Detection"
                                                                ? SVG_gasleak
                                                                : handleurgency(
                                                                      dataRow
                                                                  )[0].name ===
                                                                  "Water Leak Detection"
                                                                ? SVG_waterleak
                                                                : ""
                                                        }
                                                        alt='sensor'
                                                    />
                                                </div>
                                            )}
                                        {handleurgency(dataRow)[0].name !==
                                            "rack" &&
                                            !handeleurgencycountsame(dataRow)
                                                .same && (
                                                <div
                                                    style={{
                                                        zIndex:
                                                            handeleurgencycountsame(
                                                                dataRow
                                                            ).count > 1 &&
                                                            handeleurgencycountsame(
                                                                dataRow
                                                            ).inbigbox === true
                                                                ? "4"
                                                                : "",
                                                    }}
                                                    className='monitoring-item-sensor'>
                                                    {
                                                        handeleurgencycountsame(
                                                            dataRow
                                                        ).count
                                                    }
                                                </div>
                                            )}

                                        {(typedisplay === 0 ||
                                            typedisplay === 2) &&
                                            handleurgency(dataRow)[0].name !==
                                                "rack" && (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "center",
                                                    }}>
                                                    <div
                                                        style={{
                                                            width: "30px",
                                                            height: "30px",
                                                            borderRadius: "50%",
                                                            zIndex:
                                                                handeleurgencycountsame(
                                                                    dataRow
                                                                ).count > 1 &&
                                                                handeleurgencycountsame(
                                                                    dataRow
                                                                ).inbigbox ===
                                                                    true
                                                                    ? "3"
                                                                    : "",
                                                            backgroundColor:
                                                                handleurgency(
                                                                    dataRow
                                                                )[0].status ===
                                                                    null ||
                                                                handeleurgencycountsame(
                                                                    dataRow
                                                                ).status.toLowerCase() ===
                                                                    "down"
                                                                    ? ""
                                                                    : dataRow[0]
                                                                          .condition ===
                                                                      null
                                                                    ? "#735A57"
                                                                    : handeleurgencycountsame(
                                                                          dataRow
                                                                      ).condition.toLowerCase() ===
                                                                      "critical"
                                                                    ? "#F11B2A"
                                                                    : handeleurgencycountsame(
                                                                          dataRow
                                                                      ).condition.toLowerCase() ===
                                                                      "good"
                                                                    ? "#00F23D"
                                                                    : handeleurgencycountsame(
                                                                          dataRow
                                                                      ).condition.toLowerCase() ===
                                                                      "warning"
                                                                    ? "#FEBC2C"
                                                                    : "",
                                                        }}
                                                    />
                                                </div>
                                            )}

                                        {/* {typedisplay === 1 &&
                                            handleurgency(dataRow)[0].name !==
                                                "rack" && (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "center",
                                                    }}>
                                                    <div
                                                        style={{
                                                            width: "30px",
                                                            height: "30px",
                                                            borderRadius: "50%",
                                                        }}
                                                    />
                                                </div>
                                            )} */}

                                        {/* {handleurgency(dataRow)[0].name ===
                                            "rack" && (
                                            <div
                                                style={{
                                                    backgroundColor: "#000",
                                                    width: "30px",
                                                    height: "30px",
                                                }}/>
                                        )} */}
                                    </Tooltip>
                                )}
                                {dataRow.length > 0 &&
                                    handeleurgencycountsame(dataRow).same && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: 1,
                                                right: 5,
                                                zIndex:
                                                    handeleurgencycountsame(
                                                        dataRow
                                                    ).count > 1 &&
                                                    handeleurgencycountsame(
                                                        dataRow
                                                    ).inbigbox === true
                                                        ? "4"
                                                        : "",
                                            }}>
                                            {dataRow.length -
                                                counTrack(dataRow) <=
                                            1
                                                ? ""
                                                : dataRow.length -
                                                  counTrack(dataRow)}
                                        </div>
                                    )}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
            {arraydivabsoluteuse.map((data, i) => (
                <Tooltip
                    tooltip={
                        data.datakomponent.length === 1 ? (
                            <TooltipTableData data={data.datakomponent[0]} />
                        ) : (
                            <TooltipMultipleData
                                datalist={data.datakomponent}
                            />
                        )
                    }>
                    <div
                        className='td-hover-element-select'
                        id={liststuckselectedbig[i] && "clickedRack"}
                        onClick={() => {
                            onClick(true, i, i, data.datakomponent, true);
                        }}
                        style={{
                            outline:
                                liststuckselectedbig[i] && "5px solid #4244D4",
                            width: "calc(40px*" + data.width + ")",
                            height: "calc(40px*" + data.height + ")",

                            backgroundColor:
                                (typedisplay === 0 || typedisplay === 1) &&
                                handleurgency(data.datakomponent)[0].status ===
                                    null
                                    ? "#735A57"
                                    : (typedisplay === 0 ||
                                          typedisplay === 1) &&
                                      handeleurgencycountsame(
                                          data.datakomponent
                                      ).status.toLowerCase() === "down"
                                    ? "#F11B2A"
                                    : (typedisplay === 0 ||
                                          typedisplay === 1) &&
                                      handeleurgencycountsame(
                                          data.datakomponent
                                      ).status.toLowerCase() === "up"
                                    ? "#00F23D"
                                    : "#12133A",

                            zIndex:
                                data.datakomponent.length > 1
                                    ? "6"
                                    : liststuckselectedbig[i]
                                    ? "11"
                                    : "",
                            position: "absolute",
                            top: "calc(40px*" + data.positionY + ")",
                            left: "calc(40px*" + data.positionX + ")",
                            border: !hidegride && "1px solid #89899d",
                            boxSizing: "border-box",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                        {handleurgency(data.datakomponent)[0].name !== "rack" &&
                            handeleurgencycountsame(data.datakomponent)
                                .same && (
                                <div className='monitoring-item-sensor'>
                                    <img
                                        style={{
                                            width: "20px",
                                            height: "20px",
                                        }}
                                        src={
                                            handleurgency(data.datakomponent)[0]
                                                .name === "Power System"
                                                ? SVG_power
                                                : handleurgency(
                                                      data.datakomponent
                                                  )[0].name === "Fire System"
                                                ? SVG_fire
                                                : handleurgency(
                                                      data.datakomponent
                                                  )[0].name === "Cooling System"
                                                ? SVG_cooling
                                                : handleurgency(
                                                      data.datakomponent
                                                  )[0].name === "Network"
                                                ? SVG_network
                                                : handleurgency(
                                                      data.datakomponent
                                                  )[0].name ===
                                                  "Security System"
                                                ? SVG_security
                                                : handleurgency(
                                                      data.datakomponent
                                                  )[0].name ===
                                                  "Temperature & Humidity Sensing"
                                                ? SVG_sensor
                                                : handleurgency(
                                                      data.datakomponent
                                                  )[0].name === "Camera System"
                                                ? SVG_cctv
                                                : handleurgency(
                                                      data.datakomponent
                                                  )[0].name === "Access System"
                                                ? SVG_acces
                                                : handleurgency(
                                                      data.datakomponent
                                                  )[0].name ===
                                                  "Smoke Detection"
                                                ? SVG_smoke
                                                : handleurgency(
                                                      data.datakomponent
                                                  )[0].name ===
                                                  "Gas Leak Detection"
                                                ? SVG_gasleak
                                                : handleurgency(
                                                      data.datakomponent
                                                  )[0].name ===
                                                  "Water Leak Detection"
                                                ? SVG_waterleak
                                                : ""
                                        }
                                        alt='sensor'
                                    />
                                </div>
                            )}

                        {data.datakomponent.length > 0 &&
                            handeleurgencycountsame(data.datakomponent)
                                .same && (
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom:
                                            "calc(20px*" + data.height + ")",
                                        right:
                                            "calc( -17px + 20px*" +
                                            data.width +
                                            ")",
                                        // zIndex:
                                        //     handeleurgencycountsame(
                                        //         data.datakomponent
                                        //     ).count > 1 &&
                                        //     handeleurgencycountsame(
                                        //         data.datakomponent
                                        //     ).inbigbox === true
                                        //         ? "7"
                                        //         : "",
                                    }}>
                                    {data.datakomponent.length -
                                        counTrack(data.datakomponent) <=
                                    1
                                        ? ""
                                        : data.datakomponent.length -
                                          counTrack(data.datakomponent)}
                                </div>
                            )}

                        {handleurgency(data.datakomponent)[0].name !== "rack" &&
                            !handeleurgencycountsame(data.datakomponent)
                                .same && (
                                <div
                                    style={
                                        {
                                            // zIndex :handeleurgencycountsame(data.datakomponent).count > 1   ? "9":""
                                        }
                                    }
                                    className='monitoring-item-sensor'>
                                    {
                                        handeleurgencycountsame(
                                            data.datakomponent
                                        ).count
                                    }
                                </div>
                            )}
                        {(typedisplay === 0 || typedisplay === 2) && (
                            <div
                                style={{
                                    width:
                                        "calc( -5px + 40px*" +
                                        Math.min(data.width, data.height) +
                                        ")",
                                    height:
                                        "calc(-5px + 40px*" +
                                        Math.min(data.width, data.height) +
                                        ")",
                                    borderRadius: "50%",
                                    backgroundColor:
                                        handleurgency(data.datakomponent)[0]
                                            .status === null ||
                                        handeleurgencycountsame(
                                            data.datakomponent
                                        ).status.toLowerCase() === "down"
                                            ? ""
                                            : data.datakomponent[0]
                                                  .condition === null
                                            ? "#735A57"
                                            : handeleurgencycountsame(
                                                  data.datakomponent
                                              ).condition.toLowerCase() ===
                                              "critical"
                                            ? "#F11B2A"
                                            : handeleurgencycountsame(
                                                  data.datakomponent
                                              ).condition.toLowerCase() ===
                                              "good"
                                            ? "#00F23D"
                                            : handeleurgencycountsame(
                                                  data.datakomponent
                                              ).condition.toLowerCase() ===
                                              "warning"
                                            ? "#FEBC2C"
                                            : "",
                                }}
                            />
                        )}
                    </div>
                </Tooltip>
            ))}
        </table>
    );
};

const BlueprintAssetMonitoring = ({
    typedisplay,
    handleurgency,
    hidegride,
    data,
    numberToLetters,
    isFasilities,
}) => {
    function counTrack(data) {
        let count = 0;
        data.forEach((element) => {
            if (element.status === "rack") {
                count++;
            }
        });

        return count;
    }
    return (
        <table
            className={`table-no-border-header ${
                isFasilities && "table-facilities"
            } ${hidegride && "table-monitoring-hide-grid"}`}>
            <thead>
                <tr>
                    <th>{numberToLetters(-1)}</th>
                    {data[0].map((dataHeader, indexHeader) => (
                        <th key={indexHeader} style={{ height: "40px" }}>
                            {hidegride
                                ? ""
                                : isFasilities
                                ? "F" + numberToLetters(indexHeader)
                                : numberToLetters(indexHeader)}
                        </th>
                    ))}
                </tr>
            </thead>
            {/* &&
            handleurgency(dataRow)[0]
                .name !==
                "Environment Sensing" */}
            <tbody>
                {data.map((dataHeader, indexHeader) => (
                    <tr key={indexHeader}>
                        <td className='first-data'>
                            {!hidegride && indexHeader + 1}
                        </td>
                        {dataHeader.map((dataRow, indexRow) => (
                            <td
                                key={indexRow}
                                style={{
                                    backgroundColor:
                                        dataRow.length === 0
                                            ? ""
                                            : (typedisplay === 0 ||
                                                  typedisplay === 1) &&
                                              handleurgency(dataRow)[0]
                                                  .status === null
                                            ? "#735A57"
                                            : (typedisplay === 0 ||
                                                  typedisplay === 1) &&
                                              (handleurgency(dataRow)[0]
                                                  .status === null ||
                                                  handleurgency(
                                                      dataRow
                                                  )[0].status.toLowerCase() ===
                                                      "down")
                                            ? "#F11B2A"
                                            : (typedisplay === 0 ||
                                                  typedisplay === 1) &&
                                              handleurgency(
                                                  dataRow
                                              )[0].status.toLowerCase() === "up"
                                            ? "#00F23D"
                                            : handleurgency(dataRow)[
                                                  handleurgency(dataRow)
                                                      .length - 1
                                              ].status === "rack" &&
                                              (handleurgency(dataRow)[
                                                  handleurgency(dataRow)
                                                      .length - 1
                                              ].statusinstall === "Planned" ||
                                                  handleurgency(dataRow)[
                                                      handleurgency(dataRow)
                                                          .length - 1
                                                  ].statusinstall ===
                                                      undefined ||
                                                  handleurgency(dataRow)[
                                                      handleurgency(dataRow)
                                                          .length - 1
                                                  ].statusinstall === "")
                                            ? "rgb(0,0,0,0.5)"
                                            : handleurgency(dataRow)[
                                                  handleurgency(dataRow)
                                                      .length - 1
                                              ].status === "rack" &&
                                              handleurgency(dataRow)[
                                                  handleurgency(dataRow)
                                                      .length - 1
                                              ].statusinstall === "Installed"
                                            ? "rgb(0,0,0)"
                                            : null,
                                    border:
                                        dataRow.length === 0
                                            ? ""
                                            : dataRow.length > 0 &&
                                              handleurgency(dataRow)[
                                                  handleurgency(dataRow)
                                                      .length - 1
                                              ].status === "rack" &&
                                              (handleurgency(dataRow)[
                                                  handleurgency(dataRow)
                                                      .length - 1
                                              ].statusinstall === "Planned" ||
                                                  handleurgency(dataRow)[
                                                      handleurgency(dataRow)
                                                          .length - 1
                                                  ].statusinstall ===
                                                      undefined ||
                                                  handleurgency(dataRow)[
                                                      handleurgency(dataRow)
                                                          .length - 1
                                                  ].statusinstall === "")
                                            ? "5px solid #89899D"
                                            : dataRow.length > 0 &&
                                              handleurgency(dataRow)[
                                                  handleurgency(dataRow)
                                                      .length - 1
                                              ].status === "rack" &&
                                              dataRow.length > 0 &&
                                              handleurgency(dataRow)[
                                                  handleurgency(dataRow)
                                                      .length - 1
                                              ].statusinstall === "Installed"
                                            ? "5px solid rgba(250,250,250,1)"
                                            : "",
                                    boxSizing: "border-box",
                                    position: "relative",
                                }}>
                                {dataRow.length > 0 && (
                                    <Tooltip
                                        tooltip={
                                            dataRow.length === 1 ? (
                                                <TooltipTableData
                                                    data={dataRow[0]}
                                                />
                                            ) : (
                                                <TooltipMultipleData
                                                    datalist={handleurgency(
                                                        dataRow
                                                    )}
                                                />
                                            )
                                        }>
                                        {handleurgency(dataRow)[0].name !==
                                            "rack" && (
                                            <div className='monitoring-item-sensor'>
                                                <img
                                                    style={{
                                                        width: "20px",
                                                        height: "20px",
                                                    }}
                                                    src={
                                                        handleurgency(
                                                            dataRow
                                                        )[0].name ===
                                                        "Power System"
                                                            ? SVG_power
                                                            : handleurgency(
                                                                  dataRow
                                                              )[0].name ===
                                                              "Fire System"
                                                            ? SVG_fire
                                                            : handleurgency(
                                                                  dataRow
                                                              )[0].name ===
                                                              "Cooling System"
                                                            ? SVG_cooling
                                                            : handleurgency(
                                                                  dataRow
                                                              )[0].name ===
                                                              "Network"
                                                            ? SVG_network
                                                            : handleurgency(
                                                                  dataRow
                                                              )[0].name ===
                                                              "Security System"
                                                            ? SVG_security
                                                            : handleurgency(
                                                                  dataRow
                                                              )[0].name ===
                                                              "Temperature & Humidity Sensing"
                                                            ? SVG_sensor
                                                            : handleurgency(
                                                                  dataRow
                                                              )[0].name ===
                                                              "Camera System"
                                                            ? SVG_cctv
                                                            : handleurgency(
                                                                  dataRow
                                                              )[0].name ===
                                                              "Access System"
                                                            ? SVG_acces
                                                            : handleurgency(
                                                                  dataRow
                                                              )[0].name ===
                                                              "Smoke Detection"
                                                            ? SVG_smoke
                                                            : handleurgency(
                                                                  dataRow
                                                              )[0].name ===
                                                              "Gas Leak Detection"
                                                            ? SVG_gasleak
                                                            : handleurgency(
                                                                  dataRow
                                                              )[0].name ===
                                                              "Water Leak Detection"
                                                            ? SVG_waterleak
                                                            : ""
                                                    }
                                                    alt='sensor'
                                                />
                                            </div>
                                        )}

                                        {(typedisplay === 0 ||
                                            typedisplay === 2) &&
                                            handleurgency(dataRow)[0].name !==
                                                "rack" && (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "center",
                                                    }}>
                                                    <div
                                                        style={{
                                                            width: "30px",
                                                            height: "30px",
                                                            borderRadius: "50%",
                                                            backgroundColor:
                                                                dataRow[0]
                                                                    .condition ===
                                                                null
                                                                    ? "#735A57"
                                                                    : dataRow[0].condition.toLowerCase() ===
                                                                      "critical"
                                                                    ? "#F11B2A"
                                                                    : dataRow[0].condition.toLowerCase() ===
                                                                      "good"
                                                                    ? "#00F23D"
                                                                    : dataRow[0].condition.toLowerCase() ===
                                                                      "warning"
                                                                    ? "#FEBC2C"
                                                                    : "",
                                                        }}
                                                    />
                                                </div>
                                            )}

                                        {/* {typedisplay === 1 &&
                                            handleurgency(dataRow)[0].name !==
                                                "rack" && (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "center",
                                                    }}>
                                                    <div
                                                        style={{
                                                            width: "30px",
                                                            height: "30px",
                                                            borderRadius: "50%",
                                                        }}
                                                    />
                                                </div>
                                            )} */}

                                        {/* {handleurgency(dataRow)[0].name ===
                                            "rack" && (
                                            <div
                                                style={{
                                                    backgroundColor: "#000",
                                                    width: "30px",
                                                    height: "30px",
                                                }}/>
                                        )} */}
                                    </Tooltip>
                                )}

                                <div
                                    style={{
                                        position: "absolute",
                                        top: -5,
                                        right: 0,
                                    }}>
                                    {dataRow.length - counTrack(dataRow) <= 1
                                        ? ""
                                        : dataRow.length - counTrack(dataRow)}
                                </div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const TooltipTableData = ({ data }) => {
    function toHHMMSS(seconds_sum) {
        var sec_num = parseInt(seconds_sum, 10);
        var days = Math.floor(sec_num / (3600 * 24));
        var hoursdays = Math.floor((sec_num - days * 3600 * 24) / 3600);
        var minutesdays = Math.floor(
            (sec_num - hoursdays * 3600 - days * 3600 * 24) / 60
        );
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - hours * 3600) / 60);
        var seconds = sec_num - hours * 3600 - minutes * 60;

        if (days < 10) {
            days = "0" + days;
        }
        if (hoursdays < 10) {
            hoursdays = "0" + hoursdays;
        }
        if (minutesdays < 10) {
            minutesdays = "0" + minutesdays;
        }
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }

        return days + ":" + hoursdays + ":" + minutesdays;
    }
    return (
        <div
            className='tooltip-data-table-monitoring'
            style={{
                border: data.status === "rack" ? "" : "1px solid #fff",
                boxSizing: "border-box",
                padding: "4px",
                width: "150px",
            }}>
            <div
                className='tooltip-data-table-monitoring--header'
                style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}>
                <span>{data.header}</span>
            </div>
            <div
                className='tooltip-data-table-monitoring--header'
                style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}>
                <span style={{ fontSize: "16px" }}>{data.asset_name}</span>
            </div>
            <div
                style={{ display: data.status === "rack" ? "none" : "flex" }}
                className='tooltip-data-table-monitoring--status'>
                <div>
                    <span
                        className={`tooltip-data-table-monitoring--status--${
                            data.status ? data.status : "Offline"
                        }
                       `}>
                        {data.status ? data.status : "Offline"}
                    </span>
                </div>
                <div>
                    <span>{data.date ? toHHMMSS(data.date) : toHHMMSS(0)}</span>
                </div>
            </div>

            {!data.status ? (
                <img
                    style={{ width: "25px" }}
                    src={SVG_notconectedbrown}
                    alt='grid-view'
                />
            ) : data.status === "DOWN" ? (
                <img
                    style={{ width: "25px" }}
                    src={SVG_silveryellow}
                    alt='grid-view'
                />
            ) : (
                <div
                    style={{
                        display: data.status === "rack" ? "none" : "flex",
                    }}
                    className='tooltip-data-table-monitoring--condition'>
                    <span
                        className={`tooltip-data-table-monitoring--condition--${
                            data.condition ? data.condition : "Offline"
                        }
                    `}>
                        {data.condition ? data.condition : "Offline"}
                    </span>
                </div>
            )}
        </div>
    );
};

const TooltipMultipleData = ({ datalist }) => {
    function counTrack(data) {
        let count = 0;
        data.forEach((element) => {
            if (element.status === "rack") {
                count++;
            }
        });

        return count;
    }

    function toHHMMSS(seconds_sum) {
        var sec_num = parseInt(seconds_sum, 10);
        var days = Math.floor(sec_num / (3600 * 24));
        var hoursdays = Math.floor((sec_num - days * 3600 * 24) / 3600);
        var minutesdays = Math.floor(
            (sec_num - hoursdays * 3600 - days * 3600 * 24) / 60
        );
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - hours * 3600) / 60);
        var seconds = sec_num - hours * 3600 - minutes * 60;

        if (days < 10) {
            days = "0" + days;
        }
        if (hoursdays < 10) {
            hoursdays = "0" + hoursdays;
        }
        if (minutesdays < 10) {
            minutesdays = "0" + minutesdays;
        }
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }

        return days + ":" + hoursdays + ":" + minutesdays;
    }

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <div
                style={{
                    width: counTrack(datalist) > 1 ? "300px" : "150px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "5px",
                }}>
                {datalist.map((data, i) => (
                    <div
                        key={i}
                        style={{
                            display: data.status === "rack" ? "flex" : "none",
                            color: "#fff",
                        }}>
                        {data.header}
                    </div>
                ))}
            </div>
            <div
                style={{
                    width:
                        datalist.length - counTrack(datalist) > 1
                            ? "300px"
                            : "150px",
                    display: "flex",
                    flexWrap: "wrap",
                }}>
                {datalist.map((data, i) => (
                    <div
                        key={i}
                        className='tooltip-data-table-monitoring'
                        style={{
                            border: "1px solid #fff",
                            display: data.status === "rack" ? "none" : "flex",
                            boxSizing: "border-box",
                            padding: "4px",
                            width: "150px",
                            overflowWrap: "break-word",
                        }}>
                        <div
                            className='tooltip-data-table-monitoring--header'
                            style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}>
                            <span>{data.header}</span>
                        </div>
                        <div
                            className='tooltip-data-table-monitoring--header'
                            style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}>
                            <span style={{ fontSize: "16px" }}>
                                {data.asset_name}
                            </span>
                        </div>

                        <div className='tooltip-data-table-monitoring--status'>
                            <div>
                                <span
                                    className={`tooltip-data-table-monitoring--status--${
                                        data.status ? data.status : "Offline"
                                    }
                                   `}>
                                    {data.status ? data.status : "Offline"}
                                </span>
                            </div>
                            <div>
                                <span>
                                    {data.date
                                        ? toHHMMSS(data.date)
                                        : toHHMMSS(0)}
                                </span>
                            </div>
                        </div>
                        {!data.status ? (
                            <img
                                style={{ width: "25px" }}
                                src={SVG_notconectedbrown}
                                alt='grid-view'
                            />
                        ) : data.status === "DOWN" ? (
                            <img
                                style={{ width: "25px" }}
                                src={SVG_silveryellow}
                                alt='grid-view'
                            />
                        ) : (
                            <div
                                style={{
                                    display:
                                        data.status === "rack"
                                            ? "none"
                                            : "flex",
                                }}
                                className='tooltip-data-table-monitoring--condition'>
                                <span
                                    className={`tooltip-data-table-monitoring--condition--${
                                        data.condition
                                            ? data.condition
                                            : "Offline"
                                    }
                                        `}>
                                    {data.condition
                                        ? data.condition
                                        : "Offline"}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
