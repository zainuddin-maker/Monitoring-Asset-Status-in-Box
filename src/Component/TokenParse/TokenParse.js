import { decode } from "js-base64";

const getToken = () => {
    return localStorage.getItem("token")
        ? decode(localStorage.getItem("token"))
        : null;
};

const getUserDetails = () => {
    return localStorage.getItem("user_details")
        ? JSON.parse(decode(localStorage.getItem("user_details")))
        : null;
};

const getPassword = () => {
    return localStorage.getItem("refresh")
        ? JSON.parse(decode(localStorage.getItem("refresh")))
        : null;
};

const getPageData = () => {
    return localStorage.getItem("pageData")
        ? JSON.parse(decode(localStorage.getItem("pageData")))
        : null;
};

// const getAutoLogout = () => {
//     return localStorage.getItem("autoLogout")
//         ? decode(localStorage.getItem("autoLogout"))
//         : null;
// };

export { getToken, getUserDetails, getPageData, getPassword };
