import { useState } from "react";
import { PushNotification } from "../../ComponentReuseable/index";

const PushNotif = () => {
    const [loading, setLoading] = useState(false);

    const pushNotif = async () => {
        try {
            setLoading(true);
            const message = "New Notification";
            const is_general = true;
            const user_group_name = ["dcim_admin"];
            const notification_category_name = "asset";
            const notification_sub_category_name = "critical alarm";
            const result = await PushNotification(
                message,
                is_general,
                user_group_name,
                notification_category_name,
                notification_sub_category_name
            );
            setLoading(false);
        } catch (e) {
            // console.log(e.toString());
            setLoading(false);
        }
    };
    return <button onClick={pushNotif}>{loading ? "loading" : "Push"}</button>;
};

export default PushNotif;
