import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { encode } from "js-base64";
import axios from "axios";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from "react-router-dom";
import { useIdleTimer } from "react-idle-timer";

import { generateDateGMT8 } from "./Component/ComponentReuseable";
import { ReturnHostBackend } from "./Component/BackendHost/BackendHost";
import Login from "./Component/Login/Login.index";
import {
    getToken,
    getUserDetails,
    getPassword,
} from "./Component/TokenParse/TokenParse";

import Header from "./Component/Header";
import Sidebar from "./Component/Sidebar";
import Content from "./Component/Content";

import "./scss/App.scss";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
    toast.configure();
    const [pageName, setPageName] = useState("");
    const [idleTimer, setIdleTimer] = useState(undefined);

    useEffect(() => {
        const intervalLogin = setInterval(async () => {
            try {
                const currentHour = generateDateGMT8(new Date()).getHours();
                if (parseInt(currentHour) >= 6 && parseInt(currentHour) <= 8) {
                    const config = {
                        method: "post",
                        url:
                            ReturnHostBackend(
                                process.env.REACT_APP_BACKEND_NODELINX
                            ) + process.env.REACT_APP_LOGIN,
                        data: {
                            username: getPassword().username,
                            password: getPassword().password,
                            application_name: "dcim",
                        },
                    };

                    const result = await axios(config);
                    localStorage.setItem("token", encode(result.data.token));
                }
            } catch (e) {}
        }, 1000 * 60 * 60 * 1);
        return () => clearInterval(intervalLogin);
    }, []);

    useEffect(async () => {
        try {
            if (getToken()) {
                const config = {
                    method: "post",
                    url:
                        ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                        process.env.REACT_APP_CHECK_AUTO_LOGOUT,
                    headers: {
                        authorization: getToken(),
                    },
                };

                const result = await axios(config);

                const ug_list_auto_logout = result.data;
                const userGroupName = getUserDetails().userGroupName || [];

                let found = false;
                let newIdleTimer = undefined;

                ug_list_auto_logout.forEach((data) => {
                    if (userGroupName.find((e) => e === data.user_group_name)) {
                        found = true;
                        newIdleTimer = data.idle_timer;
                        return;
                    }
                });

                if (found) {
                    setIdleTimer(newIdleTimer);
                } else {
                    setIdleTimer(undefined);
                }
            }
        } catch (e) {
            setIdleTimer(undefined);
        }
    }, []);

    const handleOnIdle = () => {
        if (getToken()) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleOnActive = (event) => {
        // console.log("user is active", event);
        // console.log("time remaining", getRemainingTime());
    };

    const handleOnAction = (event) => {
        // console.log("user is active", event);
        // console.log("time remaining", getRemainingTime());
    };

    const { getRemainingTime, getLastActiveTime } = useIdleTimer({
        timeout: idleTimer,
        onIdle: handleOnIdle,
        onActive: handleOnActive,
        onAction: handleOnAction,
        debounce: 500,
    });

    // document.title = 'DCIM'
    return (
        <div className='app'>
            <ToastContainer
                position='top-center'
                autoClose={3000}
                limit={3}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            {!localStorage.getItem("nodelinx_application") ||
            !localStorage.getItem("nodelinx_application") === "dcim" ? (
                <Router>
                    <Route>
                        <Redirect
                            to={{
                                pathname: "/login",
                                realLocation: window.location.pathname,
                            }}
                        />
                        <Route
                            path='/login'
                            render={(props) => <Login {...props} />}
                        />
                    </Route>
                </Router>
            ) : (
                <Router>
                    <Switch>
                        <Route path='/'>
                            <div className='app-split-sidebar-others'>
                                <div className='app-sidebar'>
                                    <Sidebar
                                        setPageName={setPageName}
                                        pageName={pageName}
                                    />
                                </div>
                                <div className='app-split-header-content'>
                                    <div className='app-header'>
                                        <Header
                                            pageName={pageName}
                                            setPageName={setPageName}
                                        />
                                    </div>
                                    <div className='app-content'>
                                        <Content
                                            pageName={pageName}
                                            setPageName={setPageName}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Route>
                    </Switch>
                </Router>
            )}
        </div>
    );
};

export default App;
