import React, { useState, useEffect } from "react";
import { Switch, Route, Redirect, withRouter } from "react-router-dom";

import { getPageData } from "./TokenParse/TokenParse";

import Asset from "./Content/Asset/Asset.index";
import Monitoring from "./Content/Monitoring/Monitoring.index";
import Rack from "./Content/Rack/Rack.index";
import Item from "./Content/Item/Item.index";
import PageNotFound from "./Content/PageNotFound/PageNotFound.index";
import IncidentIndex from "./Content/Incident/Incident.index";
import Power from "./Content/Power/Power.index";
import Change from "./Content/Change/Change.index";
import Connectivity from "./Content/Connectivity/Connectivity.index";
import LayoutVisualization from "./Content/Layoutvisualization/LayoutVisualization.index";
import UpdateProfile from "./Content/UpdateProfile/UpdateProfile.index";
import Notification from "./Content/Notification/Notification.index";
import Consumption from "./Content/Consumption/Consumption.index";
import ConsumptionRack from "./Content/Consumption/ConsumptionRack.index";

const Content = (props) => {
    const contentMenus = [
        {
            path: "/operation/cdc_asset_monitoring/asset",
            content: <Asset />,
        },
        {
            path: "/operation/cdc_asset_monitoring/monitoring",
            content: <Monitoring setPageName={props.setPageName} />,
        },
        {
            path: "/operation/cdc_asset_monitoring/incident",
            content: <IncidentIndex />,
        },
        {
            path: "/operation/cdc_asset_monitoring/power",
            content: <Power />,
        },
        {
            path: "/operation/rack_and_server_management/rack",
            content: <Rack />,
        },
        {
            path: "/operation/rack_and_server_management/item",
            content: <Item />,
        },
        {
            path: "/operation/rack_and_server_management/change",
            content: <Change />,
        },
        {
            path: "/operation/rack_and_server_management/connectivity",
            content: <Connectivity />,
        },
        {
            path: "/operation/rack_and_server_management/layout_visualization",
            content: <LayoutVisualization setPageName={props.setPageName} />,
        },
        {
            path: "/update_profile",
            content: <UpdateProfile />,
        },
        {
            path: "/notification",
            content: <Notification />,
        },
        {
            path: "/operation/consumption/data_centre",
            content: <Consumption />,
        },
        {
            path: "/operation/consumption/rack",
            content: <ConsumptionRack setPageName={props.setPageName} />,
        },
    ];

    const [contentMenuFiltered, setContentMenuFiltered] = useState([]);
    useEffect(() => {
        const pageDataUAC = getPageData();

        const contentDataFiltered = contentMenus.filter((data) =>
            pageDataUAC.find((dataUAC) => dataUAC.page_url === data.path)
        );
        setContentMenuFiltered(contentDataFiltered);
    }, [props.pageName]);

    return (
        <div className='content-content'>
            {contentMenuFiltered.length > 0 && (
                <Switch>
                    {contentMenuFiltered.map((content, index) => (
                        <Route
                            key={index}
                            path={content.path}
                            render={() => content.content}
                        />
                    ))}
                    <Route render={() => <PageNotFound />} />
                </Switch>
            )}
        </div>
    );
};

export default withRouter(Content);
