import React, { useState, useEffect } from "react";
import { Link, useHistory, withRouter } from "react-router-dom";
import socketIOClient from "socket.io-client";
import axios from "axios";
import { toast } from "react-toastify";

import {
    timestampWithoutDayParse,
    generateDateGMT8,
} from "./ComponentReuseable";
import {
    IconOne,
    IconTwo,
    IconThree,
    IconFour,
    IconFive,
    IconNotification,
    IconConsumption,
} from "./Sidebar/SidebarIcon";

import notification_sound from "../sound/notification_sound.mp3";

import update_profile from "../svg/profile_empty.svg";
import dcim_logo from "../image/DCIM.png";
import dcim_mini_logo from "../image/DCIM_mini.png";
import edit_pencil from "../svg/edit_pencil.svg";
import sign_out from "../svg/sign_out.svg";
import loadingButton from "../gif/loading_button.gif";

import { getToken, getPageData, getUserDetails } from "./TokenParse/TokenParse";

import { ReturnHostBackend } from "./BackendHost/BackendHost";

const Sidebar = ({ setPageName, pageName }) => {
    const history = useHistory();

    const sidebarMenus = [
        {
            url: "/operation",
            icon: <IconOne />,
            name: "Operation",
            children: [
                {
                    url: "/cdc_asset_monitoring",
                    name: "CDC Asset Management",
                    icon: <IconTwo />,
                },
                {
                    url: "/rack_and_server_management",
                    name: "Rack and Server Management",
                    icon: <IconThree />,
                },
                {
                    url: "/consumption",
                    icon: <IconConsumption />,
                    name: "Consumption",
                },
            ],
        },
        {
            url: "/connectivity",
            icon: <IconFour />,
            name: "Connectivity",
        },
        {
            url: "/setting",
            icon: <IconFive />,
            name: "Setting",
        },
    ];
    const [notification, setNotification] = useState([]);
    const [countNotification, setCountNotification] = useState(0);
    const [showNotification, setShowNotification] = useState(false);

    const [loading, setLoading] = useState({
        notification: false,
    });

    const [socketIO, setSocketIO] = useState(
        socketIOClient(process.env.REACT_APP_SOCKET_IO_ENDPOINT, {
            rejectUnauthorized: false,
        })
    );

    const isPushNotificationSupported = () => {
        return "serviceWorker" in navigator && "PushManager" in window;
    };

    const askUserPermission = async () => {
        return await Notification.requestPermission();
    };

    const playNotificationSound = () => {
        const audio = new Audio(notification_sound);
        return audio.play();
    };

    const sendNotification = (title, options, url) => {
        navigator.serviceWorker.ready
            .then(() => {
                new Notification(title, options).onclick = (event) => {
                    window.open(url, "DCIM Application");
                };
            })
            .catch(
                (e) => {}
                // console.log(e.toString())
            );
    };

    const registerServiceWorker = () => {
        return navigator.serviceWorker.register("/sw.js");
    };

    const notifyUser = (title, text, url) => {
        let options = {
            body: text,
            action: [{ action: "open_url", title: "View" }],
            icon: dcim_mini_logo,
        };
        if (!isPushNotificationSupported) {
            alert("This browser does not support push notification");
        } else if (Notification.permission === "granted") {
            registerServiceWorker();
            sendNotification(title, options, url);
        } else if (Notification.permission !== "denied") {
            askUserPermission();
        }
    };

    const updateChangeLogNotification = async () => {
        try {
            const userGroupName =
                getUserDetails().userGroupName &&
                getUserDetails().userGroupName.join(",");
            const username = getUserDetails().username;

            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_JDBC) +
                    process.env
                        .REACT_APP_NOTIFICATION_UPDATE_CHANGE_LOG_NOTIFICATION,
                data: {
                    username: username,
                    user_group_name: userGroupName,
                },
                headers: {
                    authorization: getToken(),
                },
            };

            const result = await axios(config);
            setNotification((prev) =>
                prev.map((data) => ({ ...data, isRead: true }))
            );
            setCountNotification(0);
        } catch (error) {
            // console.log(error.toString());
            if (error.response) {
                // console.log(error.response.data);
            }
        }
    };

    const getNotification = async () => {
        try {
            setLoading((prev) => ({ ...prev, notification: true }));
            const createdAt = new Date(
                getUserDetails().createdAt
            ).toLocaleString("sv-SE");
            // console.log(getUserDetails().userGroupName);
            const userGroupName =
                getUserDetails().userGroupName &&
                getUserDetails().userGroupName.join(",");
            const username = getUserDetails().username;

            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_JDBC) +
                    process.env.REACT_APP_NOTIFICATION_GET_NOTIFICATION,
                data: {
                    username: username,
                    user_group_name: userGroupName,
                    user_created_at: createdAt,
                },
                headers: {
                    authorization: getToken(),
                },
            };

            const result = await axios(config);
            if (result.data.data) {
                const newNotification = result.data.data.map((data) => ({
                    isRead: data.is_read,
                    message: data.message,
                    timestamp: data.created_at,
                    category: data.category,
                    subCategory: data.sub_category,
                    notificationUrl: data.notification_url,
                }));

                setNotification(newNotification);

                setCountNotification(
                    newNotification.filter((data) => data.isRead === false)
                        .length
                );
            } else {
                setNotification([]);
                setCountNotification(0);
                toast.error("Failed to get notification", {
                    toastId: "error-notif",
                });
            }
            setLoading((prev) => ({ ...prev, notification: false }));
        } catch (error) {
            // console.log(error.toString());
            setNotification([]);
            setCountNotification(0);
            toast.error("Failed to get notification", {
                toastId: "error-notif",
            });
            if (error.response) {
                // console.log(error.response.data);
            }
            setLoading((prev) => ({ ...prev, notification: false }));
        }
    };

    useEffect(() => {
        getNotification();
        setSocketIO(
            socketIOClient(process.env.REACT_APP_SOCKET_IO_ENDPOINT, {
                rejectUnauthorized: false,
            })
        );
        socketIO.on("connect", () => {
            // console.log("Client Connect");
        });

        socketIO.on("disconnect", () => {
            // console.log("Client Disconnect");
        });

        socketIO.on(process.env.REACT_APP_TOPIC_NOTIFICATION, (data) => {
            // isRead: true,
            // timestamp: new Date(),
            // message: "New Notif",
            // category: 'asset',
            // subCategory: 'critical alarm'
            if (
                data.isRead !== undefined &&
                data.timestamp !== undefined &&
                data.message !== undefined &&
                data.category !== undefined &&
                data.subCategory !== undefined &&
                data.notificationUrl !== undefined &&
                data.userGroup !== undefined
            ) {
                let userGroupName = getUserDetails().userGroupName || [];
                let userGroupList = data.userGroup.split(",");

                let found = false;

                userGroupList.forEach((data) => {
                    if (userGroupName.find((e) => e === data)) {
                        found = true;
                        return;
                    }
                });

                if (userGroupList.includes("all") || found) {
                    let newData = data;
                    newData.timestamp = generateDateGMT8(
                        new Date()
                    ).toLocaleString();
                    setNotification((prev) =>
                        prev.length <=
                        parseInt(process.env.REACT_APP_MAX_NOTIFICATION || 30) -
                            1
                            ? [newData, ...prev]
                            : [newData, ...prev.slice(0, -1)]
                    );
                    setCountNotification((prev) => prev + 1);
                    notifyUser(
                        `${data.category
                            .split(" ")
                            .map(
                                (dataC) =>
                                    dataC.charAt(0).toUpperCase() +
                                    dataC.slice(1)
                            )
                            .join(" ")} - ${data.subCategory
                            .split(" ")
                            .map(
                                (dataSC) =>
                                    dataSC.charAt(0).toUpperCase() +
                                    dataSC.slice(1)
                            )
                            .join(" ")}`,
                        data.message,
                        `${window.location.protocol}//${window.location.host}/${data.notificationUrl}`
                    );
                    playNotificationSound();
                }
            }
        });

        if (isPushNotificationSupported()) {
            askUserPermission();
        }

        // stop socket io
        return () => socketIO.disconnect();
    }, []);

    const [sidebarMenuFiltered, setSidebarMenuFiltered] = useState([]);

    const [photoProfile, setPhotoProfile] = useState(null);

    useEffect(() => {
        const pageDataUAC = getPageData();
        let parsedPage = [];

        // filter sidebar by UAC
        sidebarMenus.forEach((page) => {
            const isPageRegister = pageDataUAC.findIndex(
                (pageUAC) =>
                    pageUAC.page_url.split("/")[1] === page.url.split("/")[1]
            );
            if (isPageRegister > -1) {
                if (page.children && page.children.length > 0) {
                    let newDataChildren = page.children.filter(
                        (pageChildren) =>
                            pageDataUAC.findIndex(
                                (pageUAC) =>
                                    pageUAC.page_url.split("/")[2] ===
                                    pageChildren.url.split("/")[1]
                            ) > -1
                    );
                    parsedPage.push({
                        ...page,
                        children: newDataChildren,
                    });
                } else {
                    parsedPage.push(page);
                }
            }
        });

        // handle if current location is "/"
        if (history.location.pathname === "/") {
            let firstPath = null;
            if (parsedPage.length > 0) {
                firstPath = parsedPage[0].url;
                if (parsedPage[0].children.length > 0) {
                    firstPath += parsedPage[0].children[0].url;
                }
            }
            history.push(firstPath || "/");
        }
        setSidebarMenuFiltered(parsedPage);
    }, []);

    useEffect(() => {
        setPhotoProfile(
            ReturnHostBackend(process.env.REACT_APP_BACKEND_NODELINX) +
                getUserDetails().image
        );
    }, [pageName]);

    return (
        <div className='sidebar-content'>
            <div className='sidebar-logo-dcim'>
                <img src={dcim_logo} alt='dcim-logo' />
            </div>
            <div className='sidebar-menu'>
                <div className='sidebar-list'>
                    {sidebarMenuFiltered.length > 0 &&
                        sidebarMenuFiltered.map((menu, index) => {
                            if (
                                menu.children !== undefined &&
                                menu.children.length > 0
                            ) {
                                return (
                                    <div
                                        key={index}
                                        className={
                                            history.location.pathname.split(
                                                "/"
                                            )[1] === menu.url.split("/")[1]
                                                ? "side-tooltip-choosen"
                                                : "side-tooltip-unchoosen"
                                        }>
                                        <div className='sidebar-tooltip'>
                                            <div className='sidebar-tooltip-image'>
                                                {menu.icon}
                                            </div>
                                            <div className='sidebar-tooltip-text'>
                                                <div className='sidebar-tooltip-text-content'>
                                                    <span className='side-tooltip-text'>
                                                        {menu.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='sidebar-tooltip-child'>
                                            {menu.children.length > 0 &&
                                                menu.children.map(
                                                    (child, index) => (
                                                        <Link
                                                            key={index}
                                                            onClick={() => {
                                                                if (
                                                                    history.location.pathname.split(
                                                                        "/"
                                                                    )[2] ===
                                                                    child.url.split(
                                                                        "/"
                                                                    )[1]
                                                                ) {
                                                                    setPageName(
                                                                        child.name
                                                                    );
                                                                } else {
                                                                    setPageName(
                                                                        child.name
                                                                    );
                                                                }
                                                                // window.location.href =
                                                                //     menu.url +
                                                                //     child.url;
                                                            }}
                                                            className={
                                                                history.location.pathname.split(
                                                                    "/"
                                                                )[2] ===
                                                                child.url.split(
                                                                    "/"
                                                                )[1]
                                                                    ? "side-tooltip-choosen-child"
                                                                    : "side-tooltip-unchoosen-child"
                                                            }
                                                            to={
                                                                history.location.pathname.split(
                                                                    "/"
                                                                )[2] !==
                                                                    child.url.split(
                                                                        "/"
                                                                    )[1] &&
                                                                menu.url +
                                                                    child.url
                                                            }>
                                                            <div className='sidebar-tooltip-text-child'>
                                                                <div className='sidebar-tooltip-text-content'>
                                                                    <span className='side-tooltip-text'>
                                                                        {
                                                                            child.name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className='sidebar-tooltip-image-child'>
                                                                {child.icon}
                                                            </div>
                                                        </Link>
                                                    )
                                                )}
                                        </div>
                                    </div>
                                );
                            } else {
                                // have no child
                                return (
                                    <div
                                        key={index}
                                        className={
                                            history.location.pathname.split(
                                                "/"
                                            )[1] === menu.url.split("/")[1]
                                                ? "side-tooltip-choosen"
                                                : "side-tooltip-unchoosen"
                                        }>
                                        <Link
                                            onClick={() => {
                                                if (
                                                    history.location.pathname.split(
                                                        "/"
                                                    )[1] ===
                                                    menu.url.split("/")[1]
                                                ) {
                                                    setPageName(menu.name);
                                                } else {
                                                    setPageName(menu.name);
                                                }
                                                // window.location.href = menu.url;
                                            }}
                                            className='sidebar-tooltip'
                                            to={
                                                history.location.pathname.split(
                                                    "/"
                                                )[1] !==
                                                    menu.url.split("/")[1] &&
                                                menu.url
                                            }>
                                            <div className='sidebar-tooltip-image'>
                                                {menu.icon}
                                            </div>
                                            <div className='sidebar-tooltip-text'>
                                                <div className='sidebar-tooltip-text-content'>
                                                    <span className='side-tooltip-text'>
                                                        {menu.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            }
                        })}
                </div>
            </div>
            <div className='sidebar-profile-notification'>
                <div
                    className='sidebar-notification sidebar-tooltip-bottom'
                    onClick={() => {
                        showNotification && updateChangeLogNotification();
                        setShowNotification(!showNotification);
                    }}
                    tabIndex='0'
                    onBlur={() => {
                        updateChangeLogNotification();
                        setShowNotification(false);
                    }}>
                    {loading.notification && (
                        <div className='sidebar-loading-notification'>
                            <img src={loadingButton} alt='loading' />
                        </div>
                    )}
                    <IconNotification />
                    {countNotification > 0 && (
                        <div className='sidebar-sum-notification'>
                            <span>
                                {countNotification > 9
                                    ? "9+"
                                    : countNotification}
                            </span>
                        </div>
                    )}
                    <div
                        className='sidebar-tooltip-location'
                        style={{ display: showNotification && "none" }}>
                        <div className='sidebar-tooltip-content'>
                            Notification
                        </div>
                    </div>
                    {showNotification && (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className='sidebar-notification-location'>
                            <div className='sidebar-notification-content'>
                                <div className='sidebar-notification-list-content'>
                                    <div className='sidebar-notification-list'>
                                        <div className='sidebar-notification-padding-scroll'>
                                            {notification.length > 0 &&
                                                notification.map(
                                                    (data, index) => (
                                                        <div
                                                            className={`sidebar-notification-item${
                                                                data.isRead
                                                                    ? "--readed"
                                                                    : ""
                                                            }`}
                                                            onClick={() => {
                                                                window.location.href = `${
                                                                    window
                                                                        .location
                                                                        .protocol
                                                                }//${
                                                                    window
                                                                        .location
                                                                        .host
                                                                }/${
                                                                    data.notificationUrl ||
                                                                    ""
                                                                }`;
                                                            }}
                                                            key={index}>
                                                            <div className='sidebar-notification-item-time'>
                                                                <div className='sidebar-notification-item-category'>
                                                                    <span>
                                                                        {`${data.category
                                                                            .split(
                                                                                " "
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    data
                                                                                ) =>
                                                                                    data
                                                                                        .charAt(
                                                                                            0
                                                                                        )
                                                                                        .toUpperCase() +
                                                                                    data.slice(
                                                                                        1
                                                                                    )
                                                                            )
                                                                            .join(
                                                                                " "
                                                                            )} - ${data.subCategory
                                                                            .split(
                                                                                " "
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    data
                                                                                ) =>
                                                                                    data
                                                                                        .charAt(
                                                                                            0
                                                                                        )
                                                                                        .toUpperCase() +
                                                                                    data.slice(
                                                                                        1
                                                                                    )
                                                                            )
                                                                            .join(
                                                                                " "
                                                                            )}`}
                                                                    </span>
                                                                </div>
                                                                <div className='sidebar-notification-item-timestamp'>
                                                                    <span>
                                                                        {timestampWithoutDayParse(
                                                                            data.timestamp
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className='sidebar-notification-line' />
                                                            <div className='sidebar-notification-item-message'>
                                                                <span>
                                                                    {
                                                                        data.message
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className='sidebar-notification-to'
                                    onClick={() => {
                                        setPageName("Notification");
                                        history.push("/notification");
                                        setShowNotification(false);
                                    }}>
                                    See more details
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className='sidebar-profile-notification-line' />
                <div className='sidebar-profile sidebar-tooltip-bottom'>
                    <img
                        src={photoProfile}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = update_profile;
                        }}
                        alt='photo_profile'
                        className='sidebar-logo-user'
                    />
                    <div
                        className='sidebar-tooltip-location'
                        style={{
                            height: "auto",
                        }}>
                        <div className='sidebar-tooltip-content'>
                            <div className='sidebar-tooltip-profile-logout'>
                                <div
                                    className='sidebar-tooltip-profile'
                                    onClick={() => {
                                        setPageName("Update Profile");
                                        history.push("/update_profile");
                                    }}>
                                    <img
                                        src={edit_pencil}
                                        alt='update-profile'
                                    />
                                    <span>Edit Profile</span>
                                </div>
                                <div className='sidebar-tooltip-line' />
                                <div
                                    className='sidebar-tooltip-profile'
                                    onClick={() => {
                                        localStorage.clear();
                                        window.location.reload();
                                    }}>
                                    <img src={sign_out} alt='sign-off' />
                                    <span>Sign Out</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ height: "20px" }} />
        </div>
    );
};

export default withRouter(Sidebar);
