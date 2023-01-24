import React, { useState } from "react";

import circleWhite from "../../../svg/circle-white.svg";
import squareWhite from "../../../svg/square-white.svg";
import goodIndicator from "../../../svg/circle-green-good.svg";
import warningIndicator from "../../../svg/circle-yellow-warning.svg";
import criticalIndicator from "../../../svg/circle-red-critical.svg";
import downIndicator from "../../../svg/square-red-down.svg";
import runningIndicator from "../../../svg/square-green-running.svg";
import squareYellow from "../../../svg/square-yellow.svg";
import environmentSensingIndicator from "../../../svg/environment-sensing.svg";
import coolingSystemIndicator from "../../../svg/cooling-system.svg";
import fireSystemIndicator from "../../../svg/fire-system.svg";
import powerSystemIndicator from "../../../svg/power-system.svg";
import securitySystemIndicator from "../../../svg/security-system.svg";
import camerasecuritySystemIndicator from "../../../svg/camera_security.svg";
import accessecuritySystemIndicator from "../../../svg/acces_system.svg";
import networkIndicator from "../../../svg/network.svg";
import yellowDot from "../../../svg/circle-yellow.svg";
import unknown from "../../../svg/square-brown-unknown.svg";
import circleUnknown from "../../../svg/circle-brown-unknown.svg";
import waterleak from "../../../svg/waterleak.svg";
import smoke from "../../../svg/smoke_white.svg";
import gasleak from "../../../svg/gasleak_white.svg";
import { ModalContainer } from "../../ComponentReuseable/index";

import ReactApexChart from "react-apexcharts";
import MathJax from "react-mathjax";

import "./style.scss";

const Legend = (props) => {
    // type: monitoring_grid, incident, monitoring_blueprint
    const { isShowing, hide, type } = props;

    return (
        <ModalContainer
            title={`Legend Information`}
            isShowing={isShowing}
            hide={hide}>
            {type === "monitoring_blueprint" ? (
                <LegendMonitoringBlueprint />
            ) : type === "monitoring_grid" ? (
                <LegendMonitoringGrid oriented='vertical' />
            ) : type === "layoutvisualization" ? (
                <LegendLayoutVisualisation />
            ) : type === "incident" ? (
                <LegendIncident />
            ) : type === "monitoring_asset" ? (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "50px",
                    }}>
                    <LegendMonitoringAssetStatus />
                    <LegendMonitoringAsset />
                </div>
            ) : type === "change_overview" ? (
                <LegendChangeOverview />
            ) : type === "consumption" ? (
                <LegendComsumptionChild />
            ) : type === "consumption_rack" ? (
                <LegendComsumptionRack />
            ) : null}
        </ModalContainer>
    );
};

export default Legend;

const LegendLayoutVisualisation = () => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}>
            <div
                style={{
                    backgroundColor: "",
                    width: "670px",
                    display: "flex",
                    flexDirection: "row",
                    gap: "50px",
                }}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "140px",
                    }}>
                    <div>Rack</div>
                    <div
                        style={{
                            width: "70px",
                            height: "70px",
                            border: "4px solid #fff",
                            position: "relative",
                            backgroundColor: "#000",
                            fontSize: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                        A01
                        <div
                            className='legend-tooltip-top legend-offset-rack-number'
                            style={{ fontWeight: "normal", fontSize: "16px" }}>
                            <div>Rack Number</div>
                        </div>
                    </div>
                </div>

                <div
                    className='legend-tooltip-visualization'
                    style={{
                        position: "relative",
                        height: "100%",

                        borderRadius: "0px",
                        padding: "10px",
                    }}>
                    <div style={{ border: "solid 1px white", padding: "10px" }}>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                gap: "10px",
                            }}>
                            <div style={{ fontSize: "20px" }}>A01</div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    width: "100%",
                                }}>
                                <div>Total item(s)</div>
                                <div>1</div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    width: "100%",
                                    flexDirection: "row",
                                }}>
                                <div style={{ marginRight: "30px" }}>
                                    U(s) Available
                                </div>
                                <div>48/48</div>
                            </div>
                        </div>
                    </div>

                    <div
                        className='legend-tooltip-right legend-offset-rack-number-tooltip'
                        style={{ height: "30px", marginTop: "20px" }}>
                        <div>Rack Number</div>
                    </div>

                    <div
                        className='legend-tooltip-right-rack-installed legend-offset-rack-number-tooltip-installed'
                        style={{ height: "30px", marginTop: "20px" }}>
                        <div>Total Item(s) Installed on Rack</div>
                    </div>
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    width: "100%",
                    alignItems: "center",
                    marginTop: "80px",
                }}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "20px",
                    }}>
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            border: "4px solid #fff",
                        }}></div>
                    <div style={{ fontSize: "18px" }}>Installed Rack</div>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "20px",
                    }}>
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            border: "4px solid rgba(255,255,255,0.5)",
                        }}></div>
                    <div style={{ fontSize: "18px" }}>Planned Rack</div>
                </div>
            </div>
        </div>
    );
};
const LegendMonitoringBlueprint = () => {
    return (
        <div className='Legend-information'>
            <div className='Information-left-side'>
                <div className='top-side'>
                    <div className='Indicator'>
                        <img
                            src={squareWhite}
                            alt='status-of-assets-indicator'
                        />
                        <span>Asset Status</span>
                    </div>
                    <div className='Indicator'>
                        <img
                            src={circleWhite}
                            alt='condition-of-assets-indicator'
                        />
                        <span>Asset Condition</span>
                    </div>
                </div>
                <div
                    className='bottom-side'
                    style={{ justifyContent: "space-between", gap: "60px" }}>
                    <div className='bottom-left-side'>
                        <div className='Indicator'>
                            <img
                                src={runningIndicator}
                                alt='running-indicator'
                            />
                            <span>Up</span>
                        </div>
                        <div className='Indicator'>
                            <img src={downIndicator} alt='down-indicator' />
                            <span>Down</span>
                        </div>
                        <div className='Indicator'>
                            <img src={unknown} alt='down-indicator' />
                            <span>Offline</span>
                        </div>
                    </div>
                    <div
                        className='bottom-right-side'
                        style={{ width: "100%" }}>
                        <div className='Indicator'>
                            <img src={goodIndicator} alt='good-indicator' />
                            <span>Good</span>
                        </div>
                        <div className='Indicator'>
                            <img
                                src={warningIndicator}
                                alt='warning-indicator'
                            />
                            <span>Warning</span>
                        </div>
                        <div className='Indicator'>
                            <img
                                src={criticalIndicator}
                                alt='critical-indicator'
                            />
                            <span>Critical</span>
                        </div>
                        {/* <div className='Indicator'>
                            <img src={circleUnknown} alt='critical-indicator' />
                            <span>Offline</span>
                        </div> */}
                    </div>
                </div>
            </div>
            <div className='Information-right-side'>
                <div className='Indicator'>
                    <img
                        src={powerSystemIndicator}
                        alt='power-system-indicator'
                    />
                    <span>Power System</span>
                </div>
                <div className='Indicator'>
                    <img
                        src={coolingSystemIndicator}
                        alt='cooling-system-indicator'
                    />
                    <span>Cooling System</span>
                </div>
                <div className='Indicator'>
                    <img
                        src={environmentSensingIndicator}
                        alt='environment-sensing-indicator'
                    />
                    <span>Temp & Hum Sensing</span>
                </div>
                <div className='Indicator'>
                    <img
                        src={camerasecuritySystemIndicator}
                        alt='security-system-indicator'
                    />
                    <span>Camera System</span>
                </div>

                <div className='Indicator'>
                    <img
                        src={accessecuritySystemIndicator}
                        alt='security-system-indicator'
                    />
                    <span>Access System</span>
                </div>

                <div className='Indicator'>
                    <img
                        src={fireSystemIndicator}
                        alt='fire-system-indicator'
                    />
                    <span>Fire System</span>
                </div>
                <div className='Indicator'>
                    <img src={smoke} alt='fire-system-indicator' />
                    <span>Smoke Detection</span>
                </div>
                <div className='Indicator'>
                    <img src={gasleak} alt='fire-system-indicator' />
                    <span>Gas Leak Detection</span>
                </div>
                <div className='Indicator'>
                    <img src={waterleak} alt='fire-system-indicator' />
                    <span>Water Leak Detection</span>
                </div>

                <div className='Indicator'>
                    <img src={networkIndicator} alt='network-indicator' />
                    <span>Network</span>
                </div>
            </div>
        </div>
    );
};

const LegendMonitoringGrid = ({ oriented }) => {
    return (
        <div style={{ margin: "auto" }}>
            <div
                className='card-container card-container-legend'
                style={{
                    marginLeft: oriented === "horizontal" && "auto",
                    marginRight: oriented === "horizontal" && "auto",
                }}>
                <div className='card-header'>
                    <div>Asset Number</div>
                    <div className='status-container up'>
                        <div style={{ position: "relative" }}>
                            <span>UP</span>
                            <div className='legend-tooltip legend-offset-asset-status'>
                                <div>Asset Status</div>
                            </div>
                        </div>
                        <div style={{ position: "relative" }}>
                            <span>DD:HH:MM</span>
                            <div className='legend-tooltip-top legend-offset-asset-timestamp'>
                                <div>Status Time Count</div>
                            </div>
                        </div>
                    </div>
                    <div
                        className='condition-container'
                        style={{ position: "relative" }}>
                        <img src={yellowDot} alt='asset-condition' />
                        <div className='legend-tooltip legend-offset-asset-condition'>
                            <div>Asset Condition</div>
                        </div>
                    </div>
                </div>
                <div className='legend-card'></div>
            </div>
            <br />
            <br />
            <br />
            <div className='bottom-side' style={{ justifyContent: "center" }}>
                <div className='bottom-right-side'>
                    <div
                        className='Indicator'
                        style={{
                            justifyContent:
                                oriented === "horizontal" && "center",
                        }}>
                        <span style={{ fontSize: "18px", fontWeight: "600" }}>
                            Asset Status
                        </span>
                    </div>
                    <div
                        className={
                            oriented === "horizontal"
                                ? "status-horizontal"
                                : "status-vertical"
                        }>
                        <div className='Indicator'>
                            <img
                                src={runningIndicator}
                                alt='running-indicator'
                            />
                            <span>Up</span>
                        </div>
                        <div className='Indicator'>
                            <img src={downIndicator} alt='down-indicator' />
                            <span>Down</span>
                        </div>
                        <div className='Indicator'>
                            <img src={unknown} alt='unknown-indicator' />
                            <span>Offline</span>
                        </div>
                    </div>
                </div>
                <div className='bottom-left-side'>
                    <div
                        className='Indicator'
                        style={{
                            justifyContent:
                                oriented === "horizontal" && "center",
                        }}>
                        <span style={{ fontSize: "18px", fontWeight: "600" }}>
                            Asset Condition
                        </span>
                    </div>
                    <div
                        className={
                            oriented === "horizontal"
                                ? "status-horizontal"
                                : "status-vertical"
                        }>
                        <div className='Indicator'>
                            <img src={goodIndicator} alt='good-indicator' />
                            <span>Good</span>
                        </div>
                        <div className='Indicator'>
                            <img
                                src={warningIndicator}
                                alt='warning-indicator'
                            />
                            <span>Warning</span>
                        </div>
                        <div className='Indicator'>
                            <img
                                src={criticalIndicator}
                                alt='critical-indicator'
                            />
                            <span>Critical</span>
                        </div>
                        {/* <div className='Indicator'>
                            <img src={circleUnknown} alt='unknown-indicator' />
                            <span>Offline</span>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

const LegendIncident = () => {
    return (
        <div>
            <div className='card-container card-container-legend'>
                <div className='legend-header-incident'>
                    <div className='status-container'>
                        <div style={{ position: "relative" }}>
                            <span>TITLE</span>
                        </div>
                    </div>
                    <div
                        className='legend-condition'
                        style={{ position: "relative" }}>
                        <img
                            style={{ width: "20px", height: "20px" }}
                            src={downIndicator}
                            alt='asset-condition'
                        />
                        <div className='legend-tooltip-top legend-offset-asset-incident-status'>
                            <div>Priority</div>
                        </div>
                        <img
                            style={{ width: "20px", height: "20px" }}
                            src={warningIndicator}
                            alt='asset-condition'
                        />
                        <div className='legend-tooltip legend-offset-asset-incident-condition'>
                            <div>Severity</div>
                        </div>
                    </div>
                </div>
                <div className='legend-card'></div>
            </div>
            <br />
            <br />
            <br />
            <div className='bottom-side' style={{ justifyContent: "center" }}>
                <div className='bottom-right-side'>
                    <div className='Indicator'>
                        <span style={{ fontSize: "18px", fontWeight: "600" }}>
                            Priority
                        </span>
                    </div>
                    <div className='Indicator'>
                        <img src={runningIndicator} alt='running-indicator' />
                        <span>Low</span>
                    </div>
                    <div className='Indicator'>
                        <img src={squareYellow} alt='down-indicator' />
                        <span>Medium</span>
                    </div>
                    <div className='Indicator'>
                        <img src={downIndicator} alt='unknown-indicator' />
                        <span>High</span>
                    </div>
                </div>
                <div className='bottom-left-side'>
                    <div className='Indicator'>
                        <span style={{ fontSize: "18px", fontWeight: "600" }}>
                            Severity
                        </span>
                    </div>
                    <div className='Indicator'>
                        <img src={goodIndicator} alt='running-indicator' />
                        <span>Low</span>
                    </div>
                    <div className='Indicator'>
                        <img src={warningIndicator} alt='down-indicator' />
                        <span>Medium</span>
                    </div>
                    <div className='Indicator'>
                        <img src={criticalIndicator} alt='unknown-indicator' />
                        <span>High</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LegendMonitoringAssetStatus = () => {
    const date = new Date("2001-01-01 06:00:01");
    const [lineChart, setLineChart] = useState({
        series: [
            {
                name: "UP",
                data: [
                    {
                        x: "Status",
                        y: [
                            new Date("2001-01-01 00:00:01").getTime(),
                            new Date("2001-01-01 08:00:01").getTime(),
                        ],
                    },
                ],
            },
            {
                name: "DOWN",
                data: [
                    {
                        x: "Status",
                        y: [
                            new Date("2001-01-01 08:00:01").getTime(),
                            new Date("2001-01-01 16:00:01").getTime(),
                        ],
                    },
                ],
            },
            {
                name: "UNKNOWN",
                data: [
                    {
                        x: "Status",
                        y: [
                            new Date("2001-01-01 16:00:01").getTime(),
                            new Date("2001-01-01 23:59:59").getTime(),
                        ],
                    },
                ],
            },
            {
                name: "Good",
                data: [
                    {
                        x: "Condition",
                        y: [
                            new Date("2001-01-01 00:00:01").getTime(),
                            new Date("2001-01-01 08:00:01").getTime(),
                        ],
                    },
                ],
            },
            {
                name: "Warning",
                data: [
                    {
                        x: "Condition",
                        y: [
                            new Date("2001-01-01 08:00:01").getTime(),
                            new Date("2001-01-01 16:00:01").getTime(),
                        ],
                    },
                ],
            },
            {
                name: "Critical",
                data: [
                    {
                        x: "Condition",
                        y: [
                            new Date("2001-01-01 16:00:01").getTime(),
                            new Date("2001-01-01 23:59:59").getTime(),
                        ],
                    },
                ],
            },
        ],
        options: {
            chart: {
                animations: {
                    enabled: false,
                },
                id: "status-condition",
                toolbar: {
                    show: false,
                    // offsetX: -25,
                    tools: {
                        download: false,
                        selection: false,
                        zoom: false,
                        reset: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,
                    },
                },
                background: "#08091B",
            },
            grid: {
                show: true,
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: "50%",
                    rangeBarGroupRows: true,
                },
            },
            colors: [
                (params) => {
                    const values = params.seriesIndex;
                    const state = params.w.globals.seriesNames[values];
                    return state === "UP" || state === "Good"
                        ? "#00A629"
                        : state === "Warning"
                        ? "#FEBC2C"
                        : state === "Critical" || state === "DOWN"
                        ? "#F11B2A"
                        : state === null
                        ? ""
                        : "#51414C";
                },
            ],
            fill: {
                type: "solid",
            },
            yaxis: {
                labels: {
                    show: false,
                    style: {
                        colors: ["white"],
                        fontSize: "18px",
                        fontWeight: 600,
                    },
                },
            },
            xaxis: {
                axisBorder: {
                    show: false,
                    color: "#c3c3c5",
                    offsetX: 922,
                    offsetY: -1,
                    height: 10,
                },
                type: "datetime",
                // YYYY-MM-DD
                min: date.setHours(0, 0, 0),
                max: new Date(date.setHours(23, 59, 59)).getTime(),
                // max: new Date(
                //     new Date(
                //         new Date().setDate(new Date().getDate() + 1)
                //     ).setHours(1, 30, 0)
                // ).getTime(),
                tickAmount: 24,
                tickPlacement: "on",
                labels: {
                    show: true,
                    style: {
                        colors: ["white"],
                        fontSize: "12px",

                        fontWeight: 500,
                        // cssClass: "apexcharts-xaxis-label",
                    },
                    datetimeUTC: false,
                    format: "HH:mm",
                },
            },
            legend: {
                show: false,
            },
            tooltip: {
                custom: (opts) => {
                    const padZero = (number) => {
                        if (number > 9) {
                            return number.toString();
                        } else {
                            return String(number).padStart(2, "0");
                        }
                    };
                    const start = new Date(opts.y1);
                    const finish = new Date(opts.y2);
                    const condition =
                        opts.w.globals.seriesNames[opts.seriesIndex];
                    return `<div class="chart-tooltip">
                    <div>${padZero(start.getHours())}:${padZero(
                        start.getMinutes()
                    )}:${padZero(start.getSeconds())} - ${padZero(
                        finish.getHours()
                    )}:${padZero(finish.getMinutes())}:${padZero(
                        finish.getSeconds()
                    )}</div>
                    <div>${condition}</div>
                    <div>`;
                },
            },
        },
    });
    return (
        <div className='margin-line-legend'>
            <div className='legend-chart'>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip legend-offset-monit-value-status'>
                        <div>Status Value</div>
                    </div>
                </div>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip-top legend-offset-monit-value-condition'>
                        <div>Condition Value</div>
                    </div>
                </div>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip legend-offset-monit-value-status-timestamp'>
                        <div>Total Timestamp Status</div>
                    </div>
                </div>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip-top legend-offset-monit-value-condition-timestamp'>
                        <div>Total Timestamp Condition</div>
                    </div>
                </div>
                <div style={{ display: "flex", width: "100%" }}>
                    <div className='status-chart-legend-top'>
                        <div className='status-chart-data'>
                            <span style={{ fontSize: "18px" }}>Status</span>
                            <div className={`status-chart-data-2 UP`}>
                                <span style={{ fontSize: "16px" }}>UP</span>
                                <span
                                    className='status-chart-timestamp'
                                    style={{ fontSize: "16px" }}>
                                    DD:HH:MM
                                </span>
                            </div>
                        </div>
                        <div className='status-chart-data'>
                            <span style={{ fontSize: "18px" }}>Condition</span>
                            <div className={`status-chart-data-2 Good`}>
                                <span style={{ fontSize: "16px" }}>Good</span>
                                <span
                                    className='status-chart-timestamp'
                                    style={{ fontSize: "16px" }}>
                                    DD:HH:MM
                                </span>
                            </div>
                        </div>
                    </div>
                    <div style={{ width: "100%" }}>
                        <ReactApexChart
                            series={lineChart.series}
                            options={lineChart.options}
                            type='rangeBar'
                            height={140}
                        />
                    </div>
                </div>

                <div className='legend-chart-line'>
                    <div className='legend-chart-line-in'></div>
                    <div
                        className='condition-container'
                        style={{ position: "relative" }}>
                        <div className='legend-tooltip-top legend-offset-monit-chart-x-2'>
                            <div>Time</div>
                        </div>
                    </div>
                </div>
                <div
                    className='bottom-side'
                    style={{ justifyContent: "center" }}>
                    <div className='bottom-right-side'>
                        <div
                            className='Indicator'
                            style={{
                                justifyContent: "center",
                            }}>
                            <span
                                style={{ fontSize: "18px", fontWeight: "600" }}>
                                Asset Status
                            </span>
                        </div>
                        <div className={"status-horizontal"}>
                            <div className='Indicator'>
                                <img
                                    src={runningIndicator}
                                    alt='running-indicator'
                                />
                                <span>Up</span>
                            </div>
                            <div className='Indicator'>
                                <img src={downIndicator} alt='down-indicator' />
                                <span>Down</span>
                            </div>
                            <div className='Indicator'>
                                <img src={unknown} alt='unknown-indicator' />
                                <span>Offline</span>
                            </div>
                        </div>
                    </div>
                    <div className='bottom-left-side'>
                        <div
                            className='Indicator'
                            style={{
                                justifyContent: "center",
                            }}>
                            <span
                                style={{ fontSize: "18px", fontWeight: "600" }}>
                                Asset Condition
                            </span>
                        </div>
                        <div className={"status-horizontal"}>
                            <div className='Indicator'>
                                <img
                                    src={runningIndicator}
                                    alt='good-indicator'
                                />
                                <span>Good</span>
                            </div>
                            <div className='Indicator'>
                                <img
                                    src={squareYellow}
                                    alt='warning-indicator'
                                />
                                <span>Warning</span>
                            </div>
                            <div className='Indicator'>
                                <img
                                    src={downIndicator}
                                    alt='critical-indicator'
                                />
                                <span>Critical</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
const LegendMonitoringAsset = () => {
    const [lineChart, setLineChart] = useState({
        series: [
            // actual value
            {
                data: [
                    {
                        x: "2021-07-07 00:00:00.0",
                        y: 100,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 00:30:00.0",
                        y: 102,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 01:00:00.0",
                        y: 100,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 01:30:00.0",
                        y: 102,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 02:00:00.0",
                        y: 105,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 02:30:00.0",
                        y: 104,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 03:00:00.0",
                        y: 112,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 03:30:00.0",
                        y: 117,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 04:00:00.0",
                        y: 113,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 04:30:00.0",
                        y: 107,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 05:00:00.0",
                        y: 105,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 05:30:00.0",
                        y: 113,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 06:00:00.0",
                        y: 114,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 06:30:00.0",
                        y: 114,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 07:00:00.0",
                        y: 102,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 07:30:00.0",
                        y: 117,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 08:00:00.0",
                        y: 116,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 08:30:00.0",
                        y: 102,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 09:00:00.0",
                        y: 105,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 09:30:00.0",
                        y: 102,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 10:00:00.0",
                        y: 114,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 10:30:00.0",
                        y: 104,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 11:00:00.0",
                        y: 120,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 11:30:00.0",
                        y: 102,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 12:00:00.0",
                        y: 105,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 12:30:00.0",
                        y: 100,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 13:00:00.0",
                        y: 111,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 13:30:00.0",
                        y: 111,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 14:00:00.0",
                        y: 111,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 14:30:00.0",
                        y: 120,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 15:00:00.0",
                        y: 102,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 15:30:00.0",
                        y: 109,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 16:00:00.0",
                        y: 107,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 16:30:00.0",
                        y: 107,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 17:00:00.0",
                        y: 103,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 17:30:00.0",
                        y: 112,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 18:00:00.0",
                        y: 102,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 18:30:00.0",
                        y: 118,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 19:00:00.0",
                        y: 111,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 19:30:00.0",
                        y: 115,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 20:00:00.0",
                        y: 120,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 20:30:00.0",
                        y: 111,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 21:00:00.0",
                        y: 101,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 21:30:00.0",
                        y: 111,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 22:00:00.0",
                        y: 116,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 22:30:00.0",
                        y: 110,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 23:00:00.0",
                        y: 103,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 23:30:00.0",
                        y: 113,
                        fillColor: "#FEBC2C",
                    },
                ],
            },
        ],
        options: {
            chart: {
                type: "area",
                height: 140,
                animations: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
                toolbar: {
                    show: false,
                    // offsetX: -25,
                    tools: {
                        download: false,
                        selection: false,
                        zoom: false,
                        reset: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,
                    },
                },
                background: "#08091B",
            },
            stroke: {
                width: 2,
            },
            legend: {
                show: false,
            },
            grid: {
                show: true,
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
            },
            dataLabels: {
                enabled: false,
            },
            markers: {
                // colors: "#e5131d",
                strokeColors: [
                    () => {
                        return "#e5131d";
                    },
                ],
                size: [3, 0, 0],
                hover: {
                    size: [3, 0, 0],
                    sizeOffset: 3,
                },
            },
            yaxis: [
                {
                    min: 100,
                    max: 120,
                    tickAmount: 2,
                    labels: {
                        style: {
                            colors: ["white"],
                        },
                    },
                },
                {
                    labels: {
                        show: false,
                    },
                },
                {
                    labels: {
                        show: false,
                    },
                },
            ],
            xaxis: {
                type: "datetime",
                min: new Date(
                    new Date("2021-07-07").setHours(0, 0, 0)
                ).getTime(),
                max: new Date(
                    new Date("2021-07-07").setHours(23, 30)
                ).getTime(),
                labels: {
                    style: {
                        colors: "white",
                    },
                    datetimeUTC: false,
                    format: "HH:mm",
                },
                tooltip: {
                    // enabled: false,
                },
            },
            tooltip: {
                enabled: false,
            },
            colors: ["#00A629", "#FEBC2C", "#F11B2A"],
            fill: {
                colors: ["#00A629", "#FEBC2C", "#F11B2A"],
                type: "gradient",
                gradient: {
                    shadeIntensity: 0.8,
                    opacityFrom: 0.7,
                    opacityTo: 0.1,
                    // stops: [10, 100],
                },
            },
            annotations: {
                position: "back",
                yaxis: [
                    {
                        y: 105,
                        y2: 115,
                        fillColor: "#FEBC2C",
                    },
                    {
                        y: 100,
                        y2: 105,
                        fillColor: "#F11B2A",
                    },
                ],
            },
        },
    });
    return (
        <div className='margin-line-legend'>
            <div className='legend-chart'>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip-right legend-offset-monit-chart-current-value'>
                        <div>Current Value</div>
                    </div>
                </div>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip legend-offset-monit-chart-parameter-name'>
                        <div>Parameter Name</div>
                    </div>
                </div>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip legend-offset-monit-chart-parameter-unit'>
                        <div>Unit of Measure</div>
                    </div>
                </div>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip-top legend-offset-monit-chart-parameter-warning'>
                        <div>Warning Threshold</div>
                    </div>
                </div>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip-top legend-offset-monit-chart-parameter-critical'>
                        <div>Critical Threshold</div>
                    </div>
                </div>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip legend-offset-monit-value'>
                        <div>Data Point</div>
                    </div>
                </div>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip legend-offset-monit-chart-max'>
                        <div>Chart Max Value</div>
                    </div>
                </div>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip-right legend-offset-monit-chart-min'>
                        <div>Chart Min Value</div>
                    </div>
                </div>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip-right legend-offset-monit-chart-warning'>
                        <div>Warning Area</div>
                    </div>
                </div>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip-right legend-offset-monit-chart-critical'>
                        <div>Critical Area</div>
                    </div>
                </div>

                <div className='line-chart-child'>
                    <div className='chart-info'>
                        <div className='chart-info-title'>Parameter 1</div>
                        <span>Value</span>
                        <div className='value-container'>
                            <div>7</div>
                            <div>UoM</div>
                        </div>
                        <div className='condition-container'>
                            <div>
                                <span>Warning</span>
                                <div className='condition-parameter'>
                                    <div>{"x < 115"}</div>
                                </div>
                            </div>
                            <div>
                                <span>Critical</span>
                                <div className='condition-parameter'>
                                    <div>{"x < 105"}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ width: "100%" }}>
                        <ReactApexChart
                            series={lineChart.series}
                            options={lineChart.options}
                            type='area'
                            height={140}
                        />
                    </div>
                </div>

                <div className='legend-chart-line'>
                    <div className='legend-chart-line-in'></div>
                    <div
                        className='condition-container'
                        style={{ position: "relative" }}>
                        <div className='legend-tooltip-top legend-offset-monit-chart-x'>
                            <div>Time</div>
                        </div>
                    </div>
                </div>
                <div
                    className='bottom-side bottom-chart'
                    style={{ justifyContent: "center" }}>
                    <div className='legend-chart-value'>Data Point</div>
                    <div className='line-chart-legend'>
                        <div className='Indicator-line'>
                            <img src={goodIndicator} alt='good-indicator' />
                            <span>Good</span>
                        </div>
                        <div className='Indicator-line'>
                            <img
                                src={warningIndicator}
                                alt='warning-indicator'
                            />
                            <span>Warning</span>
                        </div>
                        <div className='Indicator-line'>
                            <img
                                src={criticalIndicator}
                                alt='critical-indicator'
                            />
                            <span>Critical</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LegendChangeOverview = () => {
    const occupied_change = `Occupied~Change = Total~Occupied - Previous~Occupancy`;
    const occupied_change_1 = `Occupied~Change`;
    const occupied_change_2 = `Total~Occupied - Previous~Occupancy`;

    const total_item_registered = `Total~Item~Registered = Total~Items~(Status = Installed~or~\\text{In-Progress}~or~Registered) - Total~Items~(Status = Removed)`;
    const total_item_registered_1 = "Total~Item~Registered";
    const total_item_registered_2 =
        "Total~Items~(Status = Installed~or~\\text{In-Progress}~or~Registered) - Total~Items~(Status = Removed)";

    const item_registered_change = `Item~Registered~Change = Total~Item~Registered - Previous~Total~Item`;
    const item_registered_change_1 = "Item~Registered~Change";
    const item_registered_change_2 =
        "Total~Item~Registered - Previous~Total~Item";

    const previous_occupancy_rate = `Previous~Occupancy~Rate = (\\dfrac{Previous~Occupancy}{Total~Rack}~\\times~100) \\text{ %}`;
    const previous_occupancy_rate_1 = `Previous~Occupancy~Rate`;
    const previous_occupancy_rate_2 = `(\\dfrac{Previous~Occupancy}{Total~Rack}~\\times~100) \\text{ %}`;

    return (
        <div className='legend-change-overview'>
            <MathJax.Provider input='tex'>
                <div className='grid-change-legend'>
                    <MathJax.Node formula={occupied_change_1} />
                    <MathJax.Node formula={" = "} />
                    <MathJax.Node formula={occupied_change_2} />
                </div>
                <div className='grid-change-legend'>
                    <MathJax.Node formula={previous_occupancy_rate_1} />
                    <MathJax.Node formula={" = "} />
                    <MathJax.Node formula={previous_occupancy_rate_2} />
                </div>
                <div className='grid-change-legend'>
                    <MathJax.Node formula={total_item_registered_1} />
                    <MathJax.Node formula={" = "} />
                    <MathJax.Node formula={total_item_registered_2} />
                </div>
                <div className='grid-change-legend'>
                    <MathJax.Node formula={item_registered_change_1} />
                    <MathJax.Node formula={" = "} />
                    <MathJax.Node formula={item_registered_change_2} />
                </div>
            </MathJax.Provider>
        </div>
    );
};

const LegendComsumptionChild = () => {
    const current_pue_1 = `
    Current~PUE \\\\ 
          (Power~Usage~Effectiveness)
    `;
    const current_pue_2 = `\\dfrac{Total~Facility~Power}{IT~Equipment~Power}~\\small{[1]} `;

    const daily_Weekly_Monthly_pue_1 = `
    (Daily/Weekly/Monthly)~PUE \\\\ 
          (Power~Usage~Effectiveness)`;
    const daily_Weekly_Monthly_pue_2 = `\\dfrac{Total~Facility~Energy}{IT~Equipment~Energy}~\\small{[1]} `;

    const wue_1 = `
    WUE  \\\\ 
    (Water~Usage~Effectiveness)`;
    const wue_2 = `\\dfrac{Site~Water~Usage}{IT~Equipment~Energy}~\\  l/kWh ~\\small{[2]} `;

    const site_water_usage_1 = `
    Site~Water~Usage \\\\ 
    (Cooling~Water~Usage)`;
    const site_water_usage_2 =
        "Cooling~Water~Supply - Cooling~Water~Return ~litres";

    const text = `\\begin{align}
    x &=√(t ) \\\\ 
    \\mathrm{V}=\\frac{d x}{d t}&=\\frac{1}{2} t^{\\frac{-1}{2}} \\\\
\\end{align}`;

    return (
        <div className='legend-consumption'>
            <div>
                <div style={{ fontSize: "20px", marginBottom: "10px" }}>
                    Formula
                </div>
                <div className='first-column-legend-consumption'>
                    <MathJax.Provider input='tex'>
                        <div className='grid-consumption-legend'>
                            <MathJax.Node formula={current_pue_1} />

                            <MathJax.Node formula={" = "} />
                            <MathJax.Node formula={current_pue_2} />
                        </div>

                        <div className='grid-consumption-legend'>
                            <MathJax.Node
                                formula={daily_Weekly_Monthly_pue_1}
                            />
                            <MathJax.Node formula={" = "} />
                            <MathJax.Node
                                formula={daily_Weekly_Monthly_pue_2}
                            />
                        </div>
                        <div className='grid-consumption-legend'>
                            <MathJax.Node formula={wue_1} />
                            <MathJax.Node formula={" = "} />
                            <MathJax.Node formula={wue_2} />
                        </div>
                        <div className='grid-consumption-legend'>
                            <MathJax.Node formula={site_water_usage_1} />
                            <MathJax.Node formula={" = "} />
                            <MathJax.Node formula={site_water_usage_2} />
                        </div>
                    </MathJax.Provider>
                </div>
            </div>
            <div className='line-vertical-legend-consumption'></div>
            <div className='second-column-legend-consumption'>
                <div className='second-column-legend-consumption-table'>
                    <div className='table_wue_pue'>
                        <div className='grid-table_wue_pue'>
                            <div style={{ width: "30%", fontSize: "20px" }}>
                                PUE
                            </div>
                            <div
                                style={{
                                    width: "70%",
                                    fontSize: "20px",
                                    display: "flex",
                                    justifyContent: "center",
                                }}>
                                Level Of Efficiency
                            </div>
                        </div>
                        <div className='grid-table_wue_pue'>
                            <div style={{ width: "30%", fontSize: "20px" }}>
                                3.0
                            </div>
                            <div
                                style={{
                                    width: "70%",
                                    fontSize: "20px",
                                    display: "flex",
                                    justifyContent: "center",
                                    backgroundColor: "#F11B2A",
                                    alignItems: "center",
                                    height: "35px",
                                    fontWeight: "bold",
                                }}>
                                Very Inefficient
                            </div>
                        </div>
                        <div className='grid-table_wue_pue'>
                            <div style={{ width: "30%", fontSize: "20px" }}>
                                2.5
                            </div>
                            <div
                                style={{
                                    width: "70%",
                                    fontSize: "20px",
                                    display: "flex",
                                    justifyContent: "center",
                                    backgroundColor: "#FEBC2C",
                                    alignItems: "center",
                                    height: "35px",
                                    fontWeight: "bold",
                                }}>
                                Inefficient
                            </div>
                        </div>
                        <div className='grid-table_wue_pue'>
                            <div style={{ width: "30%", fontSize: "20px" }}>
                                2.0
                            </div>
                            <div
                                style={{
                                    width: "70%",
                                    fontSize: "20px",
                                    display: "flex",
                                    justifyContent: "center",
                                    backgroundColor: "#BF9791",
                                    alignItems: "center",
                                    height: "35px",
                                    fontWeight: "bold",
                                }}>
                                Average
                            </div>
                        </div>
                        <div className='grid-table_wue_pue'>
                            <div style={{ width: "30%", fontSize: "20px" }}>
                                1.5
                            </div>
                            <div
                                style={{
                                    width: "70%",
                                    fontSize: "20px",
                                    display: "flex",
                                    justifyContent: "center",
                                    backgroundColor: "#4244D4",
                                    alignItems: "center",
                                    height: "35px",
                                    fontWeight: "bold",
                                }}>
                                Efficient
                            </div>
                        </div>
                        <div className='grid-table_wue_pue'>
                            <div style={{ width: "30%", fontSize: "20px" }}>
                                1.2
                            </div>
                            <div
                                style={{
                                    width: "70%",
                                    fontSize: "20px",
                                    display: "flex",
                                    justifyContent: "center",
                                    backgroundColor: "#00F23D",
                                    alignItems: "center",
                                    height: "35px",
                                    fontWeight: "bold",
                                }}>
                                Very Efficient
                            </div>
                        </div>
                        <div
                            style={{
                                position: "absolute",
                                fontSize: "15px",
                                bottom: "5px",
                                right: "5px",
                            }}>
                            [3]
                        </div>
                    </div>
                    <div className='table_wue_pue'>
                        <div className='grid-table_wue_pue'>
                            <div style={{ width: "30%", fontSize: "20px" }}>
                                WUE
                            </div>
                            <div
                                style={{
                                    width: "70%",
                                    fontSize: "20px",
                                    display: "flex",
                                    justifyContent: "center",
                                }}>
                                Level Of Efficiency
                            </div>
                        </div>
                        <div className='grid-table_wue_pue'>
                            <div style={{ width: "30%", fontSize: "20px" }}>
                                {">"} 2
                            </div>
                            <div
                                style={{
                                    width: "70%",
                                    fontSize: "20px",
                                    display: "flex",
                                    justifyContent: "center",
                                    backgroundColor: "#F11B2A",
                                    alignItems: "center",
                                    height: "35px",
                                    fontWeight: "bold",
                                }}>
                                Inefficient
                            </div>
                        </div>
                        <div className='grid-table_wue_pue'>
                            <div style={{ width: "30%", fontSize: "20px" }}>
                                1.8
                            </div>
                            <div
                                style={{
                                    width: "70%",
                                    fontSize: "20px",
                                    display: "flex",
                                    justifyContent: "center",
                                    backgroundColor: "#BF9791",
                                    alignItems: "center",
                                    height: "35px",
                                    fontWeight: "bold",
                                }}>
                                Industrial Average
                            </div>
                        </div>
                        <div className='grid-table_wue_pue'>
                            <div style={{ width: "30%", fontSize: "20px" }}>
                                {"<"}1
                            </div>
                            <div
                                style={{
                                    width: "70%",
                                    fontSize: "20px",
                                    display: "flex",
                                    justifyContent: "center",
                                    backgroundColor: "#00F23D",
                                    alignItems: "center",
                                    height: "35px",
                                    fontWeight: "bold",
                                }}>
                                Efficient
                            </div>
                        </div>
                        <div
                            style={{
                                position: "absolute",
                                fontSize: "15px",
                                bottom: "202px",
                                right: "15px",
                            }}>
                            [4]
                        </div>
                    </div>
                </div>
                <div className='second-column-legend-consumption-note'>
                    <div className='source-note'>Source</div>
                    <div>[1] The Green Grid® 2007</div>
                    <div>
                        [2]
                        https://www.nature.com/articles/s41545-021-00101-w.pdf
                    </div>
                    <div>[3] https://www.42u.com/measurement/pue-dcie.htm</div>
                    <div>
                        [4]
                        https://sustainability.fb.com/report/2020-sustainability-report/#section-Water
                    </div>
                </div>
            </div>
        </div>
    );
};

const CardConsumption = ({ name, value, unit, warning, critical }) => {
    return (
        <div>
            <div className='chart-info-rack'>
                <div className='chart-info-title-rack'>{name}</div>

                <span>Value</span>
                <div className='value-container-rack'>
                    <div>{value}</div>
                    <div>{unit}</div>
                </div>
                <div className='condition-container-rack'>
                    <div>
                        <span>Warning</span>
                        <div className='condition-parameter-rack'>
                            <div>{warning}</div>
                        </div>
                    </div>
                    <div>
                        <span>Critical</span>
                        <div className='condition-parameter-rack'>
                            <div>{critical}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LegendComsumptionRack = () => {
    const [lineChart, setLineChart] = useState({
        series: [
            // actual value
            {
                data: [
                    {
                        x: "2021-07-07 00:00:00.0",
                        y: 100,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 00:30:00.0",
                        y: 102,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 01:00:00.0",
                        y: 100,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 01:30:00.0",
                        y: 102,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 02:00:00.0",
                        y: 105,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 02:30:00.0",
                        y: 104,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 03:00:00.0",
                        y: 112,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 03:30:00.0",
                        y: 117,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 04:00:00.0",
                        y: 113,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 04:30:00.0",
                        y: 107,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 05:00:00.0",
                        y: 105,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 05:30:00.0",
                        y: 113,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 06:00:00.0",
                        y: 114,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 06:30:00.0",
                        y: 114,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 07:00:00.0",
                        y: 102,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 07:30:00.0",
                        y: 117,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 08:00:00.0",
                        y: 116,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 08:30:00.0",
                        y: 102,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 09:00:00.0",
                        y: 105,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 09:30:00.0",
                        y: 102,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 10:00:00.0",
                        y: 114,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 10:30:00.0",
                        y: 104,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 11:00:00.0",
                        y: 115,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 11:30:00.0",
                        y: 102,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 12:00:00.0",
                        y: 105,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 12:30:00.0",
                        y: 100,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 13:00:00.0",
                        y: 111,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 13:30:00.0",
                        y: 111,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 14:00:00.0",
                        y: 111,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 14:30:00.0",
                        y: 115,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 15:00:00.0",
                        y: 102,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 15:30:00.0",
                        y: 109,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 16:00:00.0",
                        y: 107,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 16:30:00.0",
                        y: 107,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 17:00:00.0",
                        y: 103,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 17:30:00.0",
                        y: 112,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 18:00:00.0",
                        y: 102,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 18:30:00.0",
                        y: 118,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 19:00:00.0",
                        y: 111,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 19:30:00.0",
                        y: 115,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 20:00:00.0",
                        y: 116,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 20:30:00.0",
                        y: 110,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 21:00:00.0",
                        y: 101,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 21:30:00.0",
                        y: 110,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 22:00:00.0",
                        y: 116,
                        fillColor: "#F11B2A",
                    },
                    {
                        x: "2021-07-07 22:30:00.0",
                        y: 110,
                        fillColor: "#FEBC2C",
                    },
                    {
                        x: "2021-07-07 23:00:00.0",
                        y: 103,
                        fillColor: "#00A629",
                    },
                    {
                        x: "2021-07-07 23:30:00.0",
                        y: 116,
                        fillColor: "#F11B2A",
                    },
                ],
            },
        ],
        options: {
            chart: {
                type: "area",
                animations: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
                toolbar: {
                    show: false,
                    // offsetX: -25,
                    tools: {
                        download: false,
                        selection: false,
                        zoom: false,
                        reset: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,
                    },
                },
                background: "#08091B",
            },
            stroke: {
                width: 2,
            },
            legend: {
                show: false,
            },
            grid: {
                show: true,
                xaxis: {
                    lines: {
                        show: false,
                    },
                },
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
            },
            dataLabels: {
                enabled: false,
            },
            markers: {
                // colors: "#e5131d",
                strokeColors: [
                    () => {
                        return "#e5131d";
                    },
                ],
                size: [3, 0, 0],
                hover: {
                    size: [3, 0, 0],
                    sizeOffset: 3,
                },
            },
            yaxis: [
                {
                    min: 100,
                    max: 120,
                    tickAmount: 4,
                    labels: {
                        style: {
                            colors: ["white"],
                        },
                    },
                },
                {
                    labels: {
                        show: false,
                    },
                },
                {
                    labels: {
                        show: false,
                    },
                },
            ],
            xaxis: {
                type: "datetime",
                min: new Date(
                    new Date("2021-07-07").setHours(0, 0, 0)
                ).getTime(),
                max: new Date(
                    new Date("2021-07-07").setHours(23, 30)
                ).getTime(),
                labels: {
                    style: {
                        colors: "white",
                    },
                    datetimeUTC: false,
                    format: "HH:mm",
                },
                tooltip: {
                    // enabled: false,
                },
            },
            tooltip: {
                enabled: false,
            },
            colors: ["#00A629", "#FEBC2C", "#F11B2A"],
            fill: {
                colors: ["#00A629", "#FEBC2C", "#F11B2A"],
                type: "gradient",
                gradient: {
                    shadeIntensity: 0.8,
                    opacityFrom: 0.7,
                    opacityTo: 0.1,
                    // stops: [10, 100],
                },
            },
            annotations: {
                position: "back",
                yaxis: [
                    {
                        y: 108,
                        y2: 111,
                        fillColor: "#FEBC2C",
                    },
                    {
                        y: 113,
                        y2: 118,
                        fillColor: "#F11B2A",
                    },
                ],
            },
        },
    });
    const total = {
        name: "Total Energy/Power",
        value: 3.95,
        unit: "kVA",
        warning: "X > 6.4",
        critical: "X > 7.2",
    };
    const [rackList, setRackList] = useState([
        {
            name: "Energy/Power 1",
            value: 1.27,
            unit: "kVA",
            warning: "X > 1.6",
            critical: "X > 1.8",
        },
        {
            name: "Energy/Power 2",
            value: 1.34,
            unit: "kVA",
            warning: "X > 1.6",
            critical: "X > 1.8",
        },
        {
            name: "Energy/Power 3",
            value: 0.81,
            unit: "kVA",
            warning: "X > 1.6",
            critical: "X > 1.8",
        },
        {
            name: "Energy/Power 4",
            value: 0.53,
            unit: "kVA",
            warning: "X > 1.6",
            critical: "X > 1.8",
        },
    ]);
    return (
        <div className='margin-line-legend-rack'>
            <div className='legend-upper-rack'>
                <div className='legend-upper-rack__left'>
                    <div className='rack-square-container'>
                        <div className='rack-square'>
                            <span>A01</span>
                        </div>

                        <div className='rack-number-tooltip'>Rack Number</div>
                    </div>
                    <div className='color-container'>
                        <div className='color-sub-container'>
                            <div className='border-white container-small color-green'></div>
                            <span>Good</span>
                        </div>
                        <div className='color-sub-container'>
                            <div className='border-white container-small color-yellow'></div>
                            <span>Warning</span>
                        </div>
                        <div className='color-sub-container'>
                            <div className='border-white container-small color-red'></div>
                            <span>Critical</span>
                        </div>
                    </div>
                </div>
                <div className='legend-upper-rack__right'>
                    <div className='summary-container'>
                        <div className='span-title'>A01</div>
                        <div className='span-child-container'>
                            <div>Apparent Power</div>
                            <div>1.96 kVA</div>
                        </div>
                        <div className='span-child-container'>
                            <div>Active Power</div>
                            <div>3.92 kW</div>
                        </div>
                        <div className='span-child-container'>
                            <div>Apparent Energy</div>
                            <div>45.21 kVAh</div>
                        </div>
                        <div className='span-child-container'>
                            <div>Apparent Power</div>
                            <div>41.21 kWh</div>
                        </div>
                    </div>
                    <div className='summarry-tooltip-container'>
                        <div
                            className='condition-container'
                            style={{ position: "relative" }}>
                            <div className='legend-tooltip-rack-right legend-offset-rack-number'>
                                <div>Rack Number</div>
                            </div>
                        </div>
                        <div
                            className='condition-container'
                            style={{ position: "relative" }}>
                            <div className='legend-tooltip-rack-right legend-offset-total-po-en'>
                                <div>Total Power or Energy Consumption</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='legend-middle-rack'>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip-rack-left legend-offset-rack-card-top'>
                        <div>Total Energy/Power</div>
                    </div>
                </div>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip-rack-left legend-offset-rack-card-top legend-offset-rack-card-bottom'>
                        <div>Latest Value</div>
                    </div>
                </div>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip-rack-top legend-offset-rack-warn-crit-th'>
                        <div>Warning - Critical Threshold</div>
                    </div>
                </div>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-offset-rack-default-th'>
                        <div>*Default: Total Sum PDU Energy/Power</div>
                    </div>
                </div>
                <div className='edit-button-container'>
                    <div>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='15.066'
                            height='15.344'
                            viewBox='0 0 21.066 21.344'>
                            <g
                                id='Icon_feather-edit-3'
                                data-name='Icon feather-edit-3'
                                transform='translate(1 1)'>
                                <path
                                    id='Path_782'
                                    data-name='Path 782'
                                    d='M18,30h8.565'
                                    transform='translate(-7.499 -10.656)'
                                    fill='none'
                                    stroke='#fff'
                                    stroke-linecap='round'
                                    stroke-linejoin='round'
                                    stroke-width='2'
                                />
                                <path
                                    id='Path_783'
                                    data-name='Path 783'
                                    d='M18.874,5.02a2.168,2.168,0,0,1,3.194,0,2.5,2.5,0,0,1,0,3.389L8.759,22.532,4.5,23.662l1.065-4.519Z'
                                    transform='translate(-4.5 -4.318)'
                                    fill='none'
                                    stroke='#fff'
                                    stroke-linecap='round'
                                    stroke-linejoin='round'
                                    stroke-width='2'
                                />
                            </g>
                        </svg>
                    </div>
                    <div className='edit-threshold-tooltip'>Edit Threshold</div>
                </div>
                <div className='card-container-rack'>
                    <CardConsumption
                        name={total.name}
                        value={total.value}
                        unit={total.unit}
                        warning={total.warning}
                        critical={total.critical}
                    />
                    <div className='card-container-rack-individual'>
                        {rackList.map((rack, idx) => {
                            return (
                                <CardConsumption
                                    key={idx}
                                    name={rack.name}
                                    value={rack.value}
                                    unit={rack.unit}
                                    warning={rack.warning}
                                    critical={rack.critical}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className='legend-chart legend-chart-rack'>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip legend-offset-monit-value legend-offset-rack-value'>
                        <div>Data Point</div>
                    </div>
                </div>

                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip-right legend-offset-monit-rack-chart-warning'>
                        <div>Warning Area</div>
                    </div>
                </div>
                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip-right legend-offset-monit-rack-chart-critical'>
                        <div>Critical Area</div>
                    </div>
                </div>

                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip-rack-left legend-offset-rack-max'>
                        <div>Chart Max Value</div>
                    </div>
                </div>

                <div
                    className='condition-container'
                    style={{ position: "relative" }}>
                    <div className='legend-tooltip-rack-left legend-offset-rack-min'>
                        <div>Chart Min Value</div>
                    </div>
                </div>

                <div className='line-chart-child'>
                    <div style={{ width: "900px" }}>
                        <ReactApexChart
                            series={lineChart.series}
                            options={lineChart.options}
                            type='area'
                            height={180}
                        />
                    </div>
                </div>

                <div className='legend-chart-line'>
                    <div className='legend-chart-line-in line-with-rack'></div>
                    <div
                        className='condition-container'
                        style={{ position: "relative" }}>
                        <div className='legend-tooltip-top legend-offset-monit-rack-chart-x'>
                            <div>Time</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
