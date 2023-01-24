import React, { useState } from "react";
import { encode } from "js-base64";
import { useHistory } from "react-router-dom";
import axios from "axios";
import media_access from "../../image/cdc.png";
import DCIM from "../../image/DCIM.png";
import "./style.scss";

import {
    InputTextVertical,
    InputPasswordVertical,
    ButtonSubmit,
    LoadingData,
} from "../ComponentReuseable";

import background_login from "../../image/background_login.png";

import { ReturnHostBackend } from "../BackendHost/BackendHost";

import { toast } from "react-toastify";

export default function Login(props) {
    const history = useHistory();

    const initialState = {
        username: "",
        password: "",
    };
    const [state, setState] = useState(initialState);
    const [loadingLogin, setLoadingLogin] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setState((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const login = async (e) => {
        try {
            setLoadingLogin(true);
            e.preventDefault();
            let config = {
                method: "post",
                url:
                    ReturnHostBackend(process.env.REACT_APP_BACKEND_NODELINX) +
                    process.env.REACT_APP_LOGIN,
                data: {
                    username: state.username,
                    password: state.password,
                    application_name: "dcim",
                },
            };

            const result = await axios(config);
            localStorage.setItem("nodelinx_application", "dcim");
            localStorage.setItem("token", encode(result.data.token));
            localStorage.setItem(
                "refresh",
                encode(
                    JSON.stringify({
                        username: state.username,
                        password: state.password,
                    })
                )
            );
            localStorage.setItem(
                "user_details",
                encode(JSON.stringify(result.data.user_details))
            );
            localStorage.setItem(
                "pageData",
                encode(JSON.stringify(result.data.pageData))
            );

            setLoadingLogin(false);
            if (
                props.location.realLocation === "/login" ||
                props.location.realLocation === "/"
            ) {
                history.push("/operation/cdc_asset_monitoring/monitoring");
            } else {
                history.push(props.location.realLocation);
            }
            window.location.reload();
        } catch (error) {
            if (error.response) {
                toast.error(error.response.data, { toastId: "error-login" });
            } else {
                toast.error("DCIM Under Maintenance", {
                    toastId: "error-login",
                });
            }
            setLoadingLogin(false);
        }
    };

    return (
        <div className='Main-login'>
            <div className='login-background'>
                <img src={background_login} alt='background-login' />
            </div>
            <div className='Login-page'>
                <div className='Logo-image'>
                    <img src={media_access} alt='Media Access Logo' />
                </div>
                <div className='Login-container'>
                    <div className='Logo-content'>
                        <div className='Logo'>
                            <img src={DCIM} alt='DCIM Logo' />
                        </div>
                        <span>
                            Data Centre <br /> Infrastructure Management
                        </span>
                    </div>
                    <div className='Vertical-line'></div>
                    <div className='Login-content'>
                        <div className='Header'>Log in</div>
                        <form id='Login-form' className='Form' onSubmit={login}>
                            <div className='login-username-password'>
                                <InputTextVertical
                                    name='username'
                                    label='Username'
                                    value={state.username}
                                    onChange={handleChange}
                                    isLogin={true}
                                    isRequired={true}
                                />
                                <InputPasswordVertical
                                    name='password'
                                    label='Password'
                                    value={state.password}
                                    onChange={handleChange}
                                    isLogin={true}
                                    isRequired={true}
                                />
                                <span className='login-required'>
                                    *Required
                                </span>
                            </div>
                            <ButtonSubmit
                                name='Log in'
                                formId='Login-form'
                                onSubmit={login}
                                isLoading={loadingLogin}
                            />
                        </form>
                    </div>
                </div>
                <span className='copyright'>© 2021 NodeLinx</span>
            </div>
        </div>
    );
}
