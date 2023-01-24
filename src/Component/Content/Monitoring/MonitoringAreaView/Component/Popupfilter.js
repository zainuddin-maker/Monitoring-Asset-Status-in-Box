// React
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

// Style and Svgs
import "../style.scss";
// Component Reuseable
import {
    InputDateVertical,
    InputDropdownVertical,
    InputTextAreaVertical,
    InputTextVertical,
    InputTextPairVertical,
    UploadPhoto,
    ModalContainer,
    LoadingData,
    LoadingUploadFile,
    InputDropdownCreatableVertical,
    getUAC,
} from "../../../../ComponentReuseable/index";

import SVG_coolingwhite from "../svg/cooling_white.svg";
import SVG_firewihte from "../svg/fire_white.svg";
import SVG_powerwhite from "../svg/power_white.svg";
import SVG_networkwhite from "../svg/network_white.svg";
import SVG_sensorwhite from "../svg/sensor_white.svg";
import SVG_acceswhite from "../svg/acces_white.svg";
import SVG_cctvwhite from "../svg/cctv_white.svg";

function Popupfilter(props) {
    // Props

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
    const { isShowingfilter, toggleFilter, handlesubmitFilter } = props;

    return (
        <ModalContainer
            formId={"add-asset"}
            width={"590px"}
            title={"Filter Layout Display"}
            isShowing={isShowingfilter}
            hide={() => {
                setFilterlayout(filterlayoutbackup);
                setFilterlayoutlist(filterlayoutlistbackup);
                toggleFilter();
            }}
            submitName={"Submit"}
            children={
                <form id='add-asset' onSubmit={handlesubmitFilter}>
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
                            type='radio'
                            value='All'
                            checked={filterlayout.type === "All"}
                            onChange={() => {
                                setFilterlayoutlist((prevState) => {
                                    prevState.type = {
                                        environment: true,
                                        cooling: true,
                                        fire: true,
                                        network: true,
                                        power: true,
                                        camera: true,
                                        access: true,
                                    };
                                    return {
                                        ...prevState,
                                    };
                                });

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
                        Display All Asset Type
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
                        Filter Asset Type
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
                                    <div style={{ fontSize: "16px" }}>
                                        Environment Sensing
                                    </div>

                                    <input
                                        type='checkbox'
                                        checked={
                                            filterlayoutlist.type.environment
                                        }
                                        onChange={() =>
                                            setFilterlayoutlist((prevState) => {
                                                prevState.type.environment =
                                                    !prevState.type.environment;
                                                return {
                                                    ...prevState,
                                                };
                                            })
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
                                    <div style={{ fontSize: "16px" }}>
                                        Cooling System
                                    </div>

                                    <input
                                        type='checkbox'
                                        checked={filterlayoutlist.type.cooling}
                                        onChange={() =>
                                            setFilterlayoutlist((prevState) => {
                                                prevState.type.cooling =
                                                    !prevState.type.cooling;
                                                return {
                                                    ...prevState,
                                                };
                                            })
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
                                    <div style={{ fontSize: "16px" }}>
                                        Fire System
                                    </div>

                                    <input
                                        type='checkbox'
                                        checked={filterlayoutlist.type.fire}
                                        onChange={() =>
                                            setFilterlayoutlist((prevState) => {
                                                prevState.type.fire =
                                                    !prevState.type.fire;
                                                return {
                                                    ...prevState,
                                                };
                                            })
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
                                    <div style={{ fontSize: "16px" }}>
                                        Network
                                    </div>

                                    <input
                                        type='checkbox'
                                        checked={filterlayoutlist.type.network}
                                        onChange={() =>
                                            setFilterlayoutlist((prevState) => {
                                                prevState.type.network =
                                                    !prevState.type.network;
                                                return {
                                                    ...prevState,
                                                };
                                            })
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
                                    <div style={{ fontSize: "16px" }}>
                                        Power System
                                    </div>

                                    <input
                                        type='checkbox'
                                        checked={filterlayoutlist.type.power}
                                        onChange={() =>
                                            setFilterlayoutlist((prevState) => {
                                                prevState.type.power =
                                                    !prevState.type.power;
                                                return {
                                                    ...prevState,
                                                };
                                            })
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
                                    <div style={{ fontSize: "16px" }}>
                                        Camera
                                    </div>

                                    <input
                                        type='checkbox'
                                        checked={filterlayoutlist.type.camera}
                                        onChange={() =>
                                            setFilterlayoutlist((prevState) => {
                                                prevState.type.camera =
                                                    !prevState.type.camera;
                                                return {
                                                    ...prevState,
                                                };
                                            })
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
                                    <div style={{ fontSize: "16px" }}>
                                        Access System
                                    </div>

                                    <input
                                        type='checkbox'
                                        checked={filterlayoutlist.type.access}
                                        onChange={() =>
                                            setFilterlayoutlist((prevState) => {
                                                prevState.type.access =
                                                    !prevState.type.access;
                                                return {
                                                    ...prevState,
                                                };
                                            })
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
                                    type='radio'
                                    value='All'
                                    checked={filterlayout.condition === "All"}
                                    onChange={() => {
                                        setFilterlayoutlist((prevState) => {
                                            prevState.condition = {
                                                running: true,
                                                down: true,
                                                unknown: true,
                                            };
                                            return {
                                                ...prevState,
                                            };
                                        });
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
                                Display All Status
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
                                Filter Asset Type
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
                                    type='radio'
                                    value='All'
                                    checked={filterlayout.status === "All"}
                                    onChange={() => {
                                        setFilterlayoutlist((prevState) => {
                                            prevState.status = {
                                                good: true,
                                                warning: true,
                                                critical: true,
                                                unknown: true,
                                            };
                                            return {
                                                ...prevState,
                                            };
                                        });
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
                                Display All Condition
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
                                    type='radio'
                                    value='filter'
                                    checked={filterlayout.status === "filter"}
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
                                Filter Asset Type
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
                                    <div style={{ fontSize: "16px" }}>UP</div>

                                    <input
                                        type='checkbox'
                                        checked={
                                            filterlayoutlist.condition.running
                                        }
                                        onChange={() =>
                                            setFilterlayoutlist((prevState) => {
                                                prevState.condition.running =
                                                    !prevState.condition
                                                        .running;
                                                return {
                                                    ...prevState,
                                                };
                                            })
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
                                    <div style={{ fontSize: "16px" }}>Down</div>

                                    <input
                                        type='checkbox'
                                        checked={
                                            filterlayoutlist.condition.down
                                        }
                                        onChange={() =>
                                            setFilterlayoutlist((prevState) => {
                                                prevState.condition.down =
                                                    !prevState.condition.down;
                                                return {
                                                    ...prevState,
                                                };
                                            })
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
                                    <div style={{ fontSize: "16px" }}>
                                        Offline
                                    </div>

                                    <input
                                        type='checkbox'
                                        checked={
                                            filterlayoutlist.condition.unknown
                                        }
                                        onChange={() =>
                                            setFilterlayoutlist((prevState) => {
                                                prevState.condition.unknown =
                                                    !prevState.condition
                                                        .unknown;
                                                return {
                                                    ...prevState,
                                                };
                                            })
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
                                    <div style={{ fontSize: "16px" }}>Good</div>

                                    <input
                                        type='checkbox'
                                        checked={filterlayoutlist.status.good}
                                        onChange={() =>
                                            setFilterlayoutlist((prevState) => {
                                                prevState.status.good =
                                                    !prevState.status.good;
                                                return {
                                                    ...prevState,
                                                };
                                            })
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
                                    <div style={{ fontSize: "16px" }}>
                                        Warning
                                    </div>

                                    <input
                                        type='checkbox'
                                        checked={
                                            filterlayoutlist.status.warning
                                        }
                                        onChange={() =>
                                            setFilterlayoutlist((prevState) => {
                                                prevState.status.warning =
                                                    !prevState.status.warning;
                                                return {
                                                    ...prevState,
                                                };
                                            })
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
                                    <div style={{ fontSize: "16px" }}>
                                        Critical
                                    </div>

                                    <input
                                        type='checkbox'
                                        checked={
                                            filterlayoutlist.status.critical
                                        }
                                        onChange={() =>
                                            setFilterlayoutlist((prevState) => {
                                                prevState.status.critical =
                                                    !prevState.status.critical;
                                                return {
                                                    ...prevState,
                                                };
                                            })
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
                                    <div style={{ fontSize: "16px" }}>
                                        Offline
                                    </div>

                                    <input
                                        type='checkbox'
                                        checked={
                                            filterlayoutlist.status.unknown
                                        }
                                        onChange={() =>
                                            setFilterlayoutlist((prevState) => {
                                                prevState.status.unknown =
                                                    !prevState.status.unknown;
                                                return {
                                                    ...prevState,
                                                };
                                            })
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
    );
}

export default Popupfilter;
