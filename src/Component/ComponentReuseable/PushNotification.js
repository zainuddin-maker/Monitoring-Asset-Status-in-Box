import { toast } from "react-toastify";
import axios from "axios";

import { getToken } from "../TokenParse/TokenParse";

import { generateDateGMT8 } from "./index";
import { ReturnHostBackend } from "../BackendHost/BackendHost";


// notification_category_name ||| notification_sub_category_name
// asset                               warning alarm
//                                     critical alarm
//                                     down

// change                              rack
//                                     item

// incident                            asset
//                                     security
//                                     fire
//                                     power
//                                     environtment
//                                     network

// power                               status

export const PushNotification = (
    message,
    is_general,
    user_group_name,
    notification_category_name,
    notification_sub_category_name,
    notification_url
) => {
    return new Promise((resolve, reject) => {
        const config = {
            method: "post",
            url:
            ReturnHostBackend(process.env.REACT_APP_SERVICES) +
                process.env.REACT_APP_NOTIFICATION_PUSH_NOTIFICATION,
            headers: {
                authorization: getToken(),
            },
            data: {
                topic: process.env.REACT_APP_TOPIC_NOTIFICATION,
                message,
                is_general: is_general === true ? 1 : 0,
                user_group_name: user_group_name.join(","),
                notification_category_name,
                notification_sub_category_name,
                timestamp: generateDateGMT8(new Date()).toLocaleString("en-ZA"),
                notification_url: notification_url,
            },
        };
        axios(config)
            .then((response) => {
                resolve(response.data);
            })
            .catch((err) => {
                reject("Failed to push or add notification");
            });
    });
};
