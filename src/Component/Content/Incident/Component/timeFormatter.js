export const timeFormatter = (currentTime) => {
    const addZero = (i) => {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    };

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
    const today = new Date(currentTime);

    const monthName = monthList[today.getMonth()];
    const day = today.getDate();
    const year = today.getFullYear();
    const hour = addZero(today.getHours());
    const minutes = addZero(today.getMinutes());
    if (day.toString() !== "NaN") {
        return `${day} ${monthName} ${year} ${hour}:${minutes}`;
    } else {
        return "";
    }
};
