import { toast } from "react-toastify";
import { getPageData } from "../TokenParse/TokenParse";

const addZero = (i) => {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
};

const dateParse = (date) => {
    let newDate = date;
    if (typeof date === "string") {
        newDate = new Date(date);
    }
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
    const monthName = monthList[newDate.getMonth()];
    const day = newDate.getDate();
    const year = newDate.getFullYear();
    return `${day} ${monthName} ${year}`;
};

const timestampWithoutDayParse = (timestamp) => {
    let newTimestamp = timestamp;
    if (typeof timestamp === "string") {
        newTimestamp = new Date(timestamp);
    }
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
    const monthName = monthList[newTimestamp.getMonth()];
    const day = newTimestamp.getDate();
    const year = newTimestamp.getFullYear();
    const hour = addZero(newTimestamp.getHours());
    const minutes = addZero(newTimestamp.getMinutes());
    return `${day} ${monthName} ${year}, ${hour}:${minutes}`;
};

const timestampWithDayParse = (timestamp) => {
    let newTimestamp = timestamp;
    if (typeof timestamp === "string") {
        newTimestamp = new Date(timestamp);
    }
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
    const dayName = dayList[newTimestamp.getDay()];
    const monthName = monthList[newTimestamp.getMonth()];
    const day = newTimestamp.getDate();
    const year = newTimestamp.getFullYear();
    const hour = addZero(newTimestamp.getHours());
    const minutes = addZero(newTimestamp.getMinutes());
    return `${dayName}, ${day} ${monthName} ${year} ${hour}:${minutes}`;
};

const getLimitCard = (widthCard, heightCard, gap) => {
    const heightCardContainer = document.getElementById(
        "limit-container-card-dcim"
    ).clientHeight;
    const widthCardContainer = document.getElementById(
        "limit-container-card-dcim"
    ).clientWidth;
    const maxHorizontal = Math.floor(widthCardContainer / (widthCard + gap));
    const maxVertical = Math.floor(heightCardContainer / (heightCard + gap));
    return maxHorizontal * maxVertical;
};

const getLimitTableDCIM = () => {
    if (document.getElementById("limit-table-dcim")) {
        const heightTableContainer =
            document.getElementById("limit-table-dcim").clientHeight;
        const limit = Math.floor((heightTableContainer - 50) / 40);
        return limit < 0 ? 0 : limit;
    } else {
        return 10;
    }
};

// type: add, edit, delete
const getUAC = (type) => {
    const pageData = getPageData();
    const currentURL = window.location.pathname;
    const findAccessPage = pageData.find(
        (data) => data.page_url === currentURL
    );

    if (findAccessPage && findAccessPage[type]) {
        return true;
    } else {
        toast.error("Access Denied", { toastId: "error-uac" });
        return false;
    }
};

const getUACWithoutToast = (type) => {
    const pageData = getPageData();
    const currentURL = window.location.pathname;
    const findAccessPage = pageData.find(
        (data) => data.page_url === currentURL
    );

    if (findAccessPage && findAccessPage[type]) {
        return true;
    } else {
        return false;
    }
};

const generateDateGMT8 = (date) => {
    const dateInput = date;
    dateInput.setTime(
        dateInput.getTime() + dateInput.getTimezoneOffset() * 60 * 1000
    );
    dateInput.setTime(dateInput.getTime() + 8 * 60 * 60 * 1000);
    return dateInput;
};

export {
    dateParse,
    timestampWithoutDayParse,
    timestampWithDayParse,
    getLimitTableDCIM,
    getLimitCard,
    getUAC,
    getUACWithoutToast,
    generateDateGMT8,
};
