import React, { useState, useEffect } from "react";
import { generateDateGMT8 } from "./index";

const Timer = () => {
    const [today, setToday] = useState(generateDateGMT8(new Date()));
    const [todayDate, setTodayDate] = useState();
    // handling timer
    const addZero = (i) => {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    };
    useEffect(() => {
        const timer = setInterval(() => {
            setToday(generateDateGMT8(new Date()));
        }, 1 * 1000);
        return () => {
            clearInterval(timer);
        };
    }, []);

    useEffect(() => {
        const dayList = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        const monthList = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Des",
        ];
        const dayName = dayList[today.getDay()];
        const monthName = monthList[today.getMonth()];
        const day = today.getDate();
        const year = today.getFullYear();
        const hour = addZero(today.getHours());
        const minutes = addZero(today.getMinutes());
        setTodayDate(
            `${dayName}, ${day} ${monthName} ${year} ${hour}:${minutes}`
        );
    }, [today]);
    return <div className='header-time'>{todayDate} (SGT)</div>;
};

export default Timer;
