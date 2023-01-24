import React, { useState, useEffect } from "react";
import "./style.scss";

import { headerMenu } from "./Components/ComponentEnum.js";
import Overview from "./Components/Overview";
import Record from "./Components/Record";
import Request from "./Components/Request";
import Approval from "./Components/Approval";
import InProgress from "./Components/InProgress";
import { Timer } from "../../ComponentReuseable";
import { useHistory } from "react-router-dom";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    useLocation,
} from "react-router-dom";
import { getPageData } from "../../TokenParse/TokenParse";
import AccessDenied from "./Components/AccessDenied";

const Change = () => {
    const [menu, setMenu] = useState(headerMenu.OVERVIEW);
    const history = useHistory();
    const [contentMenusFiltered, setContentMenusFiltered] = useState([]);
    const [isMounted, setIsMounted] = useState(false);
    const [headerMenuFiltered, setHeaderMenuFiltered] = useState({});
    const contentMenus = [
        {
            path: "/operation/rack_and_server_management/change/overview",
            content: <Overview />,
            name: "Overview",
        },
        {
            path: "/operation/rack_and_server_management/change/record",
            content: <Record />,
            name: "Record",
        },
        {
            path: "/operation/rack_and_server_management/change/progress",
            content: <InProgress />,
            name: "In-Progress",
        },
        {
            path: "/operation/rack_and_server_management/change/approval",
            content: <Approval />,
            name: "Approval",
        },
        {
            path: "/operation/rack_and_server_management/change/request",
            content: <Request />,
            name: "Request",
        },
    ];
    const location = useLocation();
    useEffect(() => {
        if (location.pathname) {
            let findMenu = contentMenus.find((el) =>
                location.pathname.includes(el.path)
            );
            if (findMenu) {
                setMenu(findMenu.name);
            }
        }

        let pageData = getPageData();
        pageData = pageData.filter((el) =>
            el.page_url.includes("/operation/rack_and_server_management/change")
        );
        // Filter page and menu
        let tempArray = contentMenus.filter((el) => {
            return pageData.map((page) => page.page_url).includes(el.path);
        });
        // Mapping to array of menu name
        let nameTempArray = tempArray.map((el) => el.name);
        let tempHeader = {};
        Object.keys(headerMenu).map((key) => {
            if (nameTempArray.includes(headerMenu[key])) {
                tempHeader[key] = headerMenu[key];
            }
        });
        setHeaderMenuFiltered(tempHeader);
        setContentMenusFiltered((prev) => {
            return [...tempArray];
        });
        setIsMounted(true);
    }, []);

    // console.log(getPageData());
    return (
        <div className='change-container'>
            <div className='change-header-container'>
                <div className='change-header'>
                    <span id='title'>Change Management</span>
                    {isMounted &&
                        Object.keys(headerMenuFiltered).map((key) => (
                            <span
                                className='menu'
                                onClick={() => {
                                    setMenu(headerMenu[key]);
                                    history.push(
                                        contentMenus.find(
                                            (el) => el.name === headerMenu[key]
                                        ) &&
                                            contentMenus.find(
                                                (el) =>
                                                    el.name === headerMenu[key]
                                            ).path
                                    );
                                }}
                                id={menu === headerMenu[key] && "active"}>
                                {headerMenu[key]}
                            </span>
                        ))}
                </div>
                <div className='change-time'>
                    <Timer />
                </div>
            </div>

            <Switch>
                <Redirect
                    exact
                    from='/operation/rack_and_server_management/change'
                    to='/operation/rack_and_server_management/change/overview'
                />

                {contentMenusFiltered.length > 0 &&
                    contentMenusFiltered.map(({ path, content }) => (
                        <Route key={path} path={path}>
                            {content}
                        </Route>
                    ))}
                {/* {isMounted && <Route render={() => <AccessDenied />} />} */}
            </Switch>

            {/* {menu === headerMenu.OVERVIEW && <Overview />}
            {menu === headerMenu.RECORD && <Record />}
            {menu === headerMenu.REQUEST && <Request />}
            {menu === headerMenu.APPROVAL && <Approval />}
            {menu === headerMenu.IN_PROGRESS && <InProgress />} */}
        </div>
    );
};

export default Change;
