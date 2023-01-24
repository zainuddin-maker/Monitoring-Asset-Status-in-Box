// System library imports
import React, { useEffect, useState } from "react";
import { useHistory, withRouter } from "react-router-dom";
import media_access from "../image/cdc.png";

import {
    Asset,
    Monitoring,
    Incident,
    Power,
    Rack,
    Item,
    Change,
    Connectifity,
    LayoutVisualization,
    Consumption,
    ConsumptionRack,
} from "./Header/HeaderIcon";
import { getPageData } from "./TokenParse/TokenParse";

const Header = (props) => {
    const history = useHistory();
    const headerMenus = [
        {
            parent: "/operation/cdc_asset_monitoring",
            children: [
                {
                    name: "Asset",
                    path: "/asset",
                    icon: <Asset />,
                },
                {
                    name: "Monitoring",
                    path: "/monitoring",
                    icon: <Monitoring />,
                },
                {
                    name: "Incident",
                    path: "/incident",
                    icon: <Incident />,
                },
                {
                    name: "Power",
                    path: "/power",
                    icon: <Power />,
                },
            ],
        },
        {
            parent: "/operation/rack_and_server_management",
            children: [
                {
                    name: "Rack",
                    path: "/rack",
                    icon: <Rack />,
                },
                {
                    name: "Item",
                    path: "/item",
                    icon: <Item />,
                },
                {
                    name: "Change",
                    path: "/change",
                    icon: <Change />,
                },
                {
                    name: "Connectivity",
                    path: "/connectivity",
                    icon: <Connectifity />,
                },
                {
                    name: "Layout Visualization",
                    path: "/layout_visualization",
                    icon: <LayoutVisualization />,
                },
            ],
        },

        {
            parent: "/operation/consumption",
            children: [
                {
                    name: "Data Centre",
                    path: "/data_centre",
                    icon: <Consumption />,
                },
                {
                    name: "Rack",
                    path: "/rack",
                    icon: <ConsumptionRack />,
                },
            ],
        },
        {
            parent: "/connectivity",
            children: [],
        },
        {
            parent: "/operation/consumption",
            children: [
                {
                    name: "Consumption",
                    path: "/",
                    icon: <Consumption />,
                },
            ],
        },
    ];

    const [headerMenuFiltered, setHeaderMenuFiltered] = useState([]);

    useEffect(() => {
        const pageDataUAC = getPageData();

        // find header menu with current location
        const currentPath = headerMenus.find((data) =>
            history.location.pathname.startsWith(data.parent)
        );

        if (
            currentPath &&
            currentPath.children &&
            currentPath.children.length > 0
        ) {
            // get count path parent split by "/"
            const countPathParent = currentPath.parent.split("/").length;

            // filter header by uac
            const headerDataFiltered = currentPath.children.filter(
                (dataHeaderChildren) =>
                    pageDataUAC.find(
                        (dataUAC) =>
                            dataUAC.page_url ===
                                currentPath.parent + dataHeaderChildren.path ||
                            dataHeaderChildren.name === "Consumption"
                    )
            );

            // update path header after filtered
            const headerDataFilteredWithParentPath = headerDataFiltered.map(
                (data) => ({ ...data, path: currentPath.parent + data.path })
            );
            setHeaderMenuFiltered(headerDataFilteredWithParentPath);

            // handle if location is parent path from header
            if (
                history.location.pathname.split("/").length === countPathParent
            ) {
                history.push(headerDataFilteredWithParentPath[0].path);
            }
        } else {
            setHeaderMenuFiltered([]);
        }
    }, [props.pageName]);

    return (
        <div className='header-content'>
            <div className='header-menu-content'>
                <div className='header-menu-line' />
                <div className='header-menu-list'>
                    {headerMenuFiltered.length > 0 &&
                        headerMenuFiltered.map((data, index) => (
                            <div
                                key={index}
                                onClick={() => {
                                    props.setPageName(data.name);
                                    history.push(data.path);
                                }}
                                className={`header-menu ${
                                    history.location.pathname
                                        .split("/")
                                        .slice(0, data.path.split("/").length)
                                        .join("/") === data.path &&
                                    "header-selected-menu"
                                }`}>
                                <div className='header-menu-image'>
                                    {data.icon}
                                </div>
                                <div className='header-menu-text'>
                                    <span>{data.name}</span>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
            <div className='header-mediaaccess'>
                <img src={media_access} alt='media_access' />
            </div>
        </div>
    );
};

export default withRouter(Header);
