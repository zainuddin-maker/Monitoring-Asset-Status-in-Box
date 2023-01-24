import React, { useState, useEffect, useCallback } from "react";
import {
    BrowserRouter as Router,
    Link,
    Route,
    useLocation,
    matchPath,
    Switch,
    useHistory,
} from "react-router-dom";
import "./style.scss";

import IncidentForm from "./Component/IncidentForm";
import IncidentRecord from "./Component/IncidentRecord";
import IncidentConfirmation from "./Component/IncidentConfirmation";
import { Timer, ButtonDetail, useModal } from "../../ComponentReuseable/index";
import Legend from "../Legend/Legend.index";
import AccessDenied from "../Change/Components/AccessDenied";

import { getPageData } from "../../TokenParse/TokenParse";

const IncidentIndex = () => {
    const history = useHistory();
    const { isShowing: isShowingLegend, toggle: toggleLegend } = useModal();
    const [tabMenu, setTabMenu] = useState("");

    // filter option states
    const [status, setStatus] = useState([
        {
            id: "OPEN",
            name: "OPEN",
        },
        {
            id: "CLOSED",
            name: "CLOSED",
        },
        {
            id: "WAITING",
            name: "Waiting Confirmation",
        },
    ]);

    // handle change menu
    const handleChangeMenu = (value) => {
        setTabMenu(value);
    };

    const currentLocation = useLocation().pathname;
    const [contentDataFiltered, setcontentDataFiltered] = useState([]);

    // menu URL
    const [menuUrl, setMenuUrl] = useState([
        {
            url: "/operation/cdc_asset_monitoring/incident/record",
            name: "Record",
        },
        {
            url: "/operation/cdc_asset_monitoring/incident/confirmation",
            name: "Confirmation",
        },
        {
            url: "/operation/cdc_asset_monitoring/incident/input",
            name: "Input",
        },
    ]);

    const contentData = [
        {
            path: "/operation/cdc_asset_monitoring/incident/record",
            content: <IncidentRecord status={status} />,
        },
        {
            path: "/operation/cdc_asset_monitoring/incident/confirmation",
            content: <IncidentConfirmation />,
        },
        {
            path: "/operation/cdc_asset_monitoring/incident/input",
            content: <IncidentForm />,
        },
    ];

    // useEffect for content
    useEffect(() => {
        const match = matchPath(currentLocation, {
            path: `/operation/cdc_asset_monitoring/incident/:menu`,
            exact: true,
            strict: false,
        });
        if (match) {
            if (match.params) {
                if (match.params.menu) {
                    setTabMenu(match.params.menu);
                }
            }
        } else {
            const match2 = matchPath(currentLocation, {
                path: `/operation/cdc_asset_monitoring/incident`,
                exact: true,
                strict: false,
            });
            if (match2) {
                history.push("/operation/cdc_asset_monitoring/incident/record");
                setTabMenu("record");
            }
        }

        // GET THE PAGE
        const pageDataUAC = getPageData();

        const contentFiltered = contentData.filter((data) =>
            pageDataUAC.find((dataUAC) => dataUAC.page_url === data.path)
        );
        setMenuUrl((prev) => {
            let newMenu = prev.filter((data) =>
                pageDataUAC.find((dataUAC) => dataUAC.page_url === data.url)
            );
            return [...newMenu];
        });
        setcontentDataFiltered(contentFiltered);
    }, []);

    return (
        contentDataFiltered.length > 0 && (
            <div className='asset-container lodaing-location'>
                <Legend
                    isShowing={isShowingLegend}
                    hide={toggleLegend}
                    type={"incident"}
                />
                <Router>
                    <div className='asset-header'>
                        <div className='incident-header-child-container'>
                            <div className='page-title'>
                                Incident Management
                            </div>
                            <div className='incident-header-children'>
                                {menuUrl.map((value) => {
                                    return (
                                        <Link
                                            style={{ textDecoration: "none" }}
                                            key={value.url}
                                            to={value.url}
                                            className={
                                                tabMenu ===
                                                value.name.toLowerCase()
                                                    ? "clicked"
                                                    : ""
                                            }>
                                            <span
                                                onClick={() =>
                                                    handleChangeMenu(
                                                        value.name.toLowerCase()
                                                    )
                                                }>
                                                {value.name}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                        <Timer />
                    </div>

                    {contentDataFiltered.length > 0 && (
                        <Switch>
                            {contentDataFiltered.map((data, index) => {
                                return (
                                    <Route
                                        key={index}
                                        path={data.path}
                                        render={() => data.content}
                                    />
                                );
                            })}
                            {/* <Redirect to={contentDataFiltered[0].path} /> */}
                            {/* <Route render={() => <AccessDenied />} /> */}
                        </Switch>
                    )}
                </Router>
                {tabMenu === "confirmation" ? (
                    <div style={{ zIndex: "100" }}>
                        <ButtonDetail onClick={toggleLegend} />
                    </div>
                ) : null}
            </div>
        )
    );
};

export default IncidentIndex;

// change options id to name
const changeIdToName = (array) => {
    if (array.length > 0) {
        array.forEach((data) => {
            data.id = data.name;
        });
    }
    return array;
};
