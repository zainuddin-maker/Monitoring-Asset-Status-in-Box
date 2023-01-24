import NotConnected from "./NotConnected";
const PowerCard = (props) => {
    const {
        title,
        value,
        unit,
        isChange,
        date,
        changeValue,
        changeType,
        icon,
        isConnected,
    } = props;
    return (
        <div className='consumption-card' style={{ position: "relative" }}>
            <NotConnected
                size='80px'
                isConnected={isConnected}
                backgroundOffset='10px'
            />
            <div className='consumption-card-title'>
                <span>{title}</span>
            </div>
            <div className='consumption-card-body'>
                <div className='left-body'>{parseSvg(icon)}</div>
                <div className='right-body'>
                    <div style={{ height: "15px" }}></div>
                    <div className='value-container'>
                        <span className='value'>{value}</span>
                        <span className='unit'>{unit}</span>
                    </div>
                    {isChange ? (
                        <div className='compare-card'>
                            <span className='old-date'>
                                {date ? `vs ${date}` : "vs ---"}
                            </span>
                            <span
                                className={`compare-value ${
                                    changeType === "down"
                                        ? "green"
                                        : changeType === "up"
                                        ? "red"
                                        : ""
                                }`}>
                                {parseSvg(changeType || "")}{" "}
                                {`${
                                    changeType === "down"
                                        ? ""
                                        : changeType === "up"
                                        ? "+"
                                        : ""
                                }${changeValue || "---"}`}
                            </span>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
const parseSvg = (val) => {
    let svgList = {
        up: (
            <svg
                xmlns='http://www.w3.org/2000/svg'
                width='9.644'
                height='13.589'
                viewBox='0 0 9.644 13.589'>
                <g
                    id='Group_11807'
                    data-name='Group 11807'
                    transform='translate(-708.227 -783.925)'>
                    <line
                        id='Line_606'
                        data-name='Line 606'
                        y2='10.498'
                        transform='translate(713.05 786.016)'
                        fill='none'
                        stroke='#f11b2a'
                        stroke-linecap='round'
                        stroke-width='2'
                    />
                    <line
                        id='Line_614'
                        data-name='Line 614'
                        y1='4.097'
                        x2='3.414'
                        transform='translate(709.636 785.333)'
                        fill='none'
                        stroke='#f11b2a'
                        stroke-linecap='round'
                        stroke-width='2'
                    />
                    <line
                        id='Line_622'
                        data-name='Line 622'
                        x1='3.414'
                        y1='4.097'
                        transform='translate(713.05 785.333)'
                        fill='none'
                        stroke='#f11b2a'
                        stroke-linecap='round'
                        stroke-width='2'
                    />
                </g>
            </svg>
        ),
        down: (
            <svg
                xmlns='http://www.w3.org/2000/svg'
                width='9.644'
                height='13.589'
                viewBox='0 0 9.644 13.589'>
                <g
                    id='Group_11743'
                    data-name='Group 11743'
                    transform='translate(717.872 797.513) rotate(180)'>
                    <line
                        id='Line_606'
                        data-name='Line 606'
                        y2='10.498'
                        transform='translate(713.05 786.016)'
                        fill='none'
                        stroke='#00a629'
                        stroke-linecap='round'
                        stroke-width='2'
                    />
                    <line
                        id='Line_614'
                        data-name='Line 614'
                        y1='4.097'
                        x2='3.414'
                        transform='translate(709.636 785.333)'
                        fill='none'
                        stroke='#00a629'
                        stroke-linecap='round'
                        stroke-width='2'
                    />
                    <line
                        id='Line_622'
                        data-name='Line 622'
                        x1='3.414'
                        y1='4.097'
                        transform='translate(713.05 785.333)'
                        fill='none'
                        stroke='#00a629'
                        stroke-linecap='round'
                        stroke-width='2'
                    />
                </g>
            </svg>
        ),
        PUE: (
            <svg
                xmlns='http://www.w3.org/2000/svg'
                width='45.378'
                height='69'
                viewBox='0 0 45.378 79.94'>
                <g id='flash' transform='translate(-110.682)'>
                    <g
                        id='Group_11740'
                        data-name='Group 11740'
                        transform='translate(110.682)'>
                        <path
                            id='Path_23682'
                            data-name='Path 23682'
                            d='M155.914,27.446a1.281,1.281,0,0,0-1.2-.8H138.994L154.582,2a1.21,1.21,0,0,0,0-1.332,1.4,1.4,0,0,0-1.2-.666H132.066a1.4,1.4,0,0,0-1.2.666l-19.985,39.97a1.21,1.21,0,0,0,0,1.332,1.59,1.59,0,0,0,1.2.666H125.8L110.882,78.208a1.33,1.33,0,0,0,.533,1.6,1,1,0,0,0,.666.133,1.513,1.513,0,0,0,1.066-.4l42.635-50.629A1.43,1.43,0,0,0,155.914,27.446Zm-39.17,43.567L129,41.7a1.3,1.3,0,0,0-.133-1.2,1.645,1.645,0,0,0-1.066-.533h-13.59L132.865,2.665h18.12L135.263,27.313a1.21,1.21,0,0,0,0,1.332,1.4,1.4,0,0,0,1.2.666h15.455Z'
                            transform='translate(-110.682)'
                            fill='#febc2c'
                        />
                    </g>
                </g>
            </svg>
        ),
        WUE: (
            <svg
                xmlns='http://www.w3.org/2000/svg'
                width='64.362'
                height='74.244'
                viewBox='0 0 64.362 74.244'>
                <g
                    id='water_1_'
                    data-name='water (1)'
                    transform='translate(-0.438 0)'>
                    <path
                        id='Path_23683'
                        data-name='Path 23683'
                        d='M19,51.965c11.972,0,18.566-7.033,18.566-19.8C37.57,20.2,20.645,1.195,19.925.393a1.276,1.276,0,0,0-1.842,0C17.362,1.195.438,20.2.438,32.161c0,12.771,6.594,19.8,18.566,19.8ZM19,3.107c3.543,4.159,16.09,19.55,16.09,29.055C35.094,40.066,32.3,49.49,19,49.49S2.913,40.066,2.913,32.161C2.913,22.657,15.46,7.266,19,3.107Zm0,0'
                        fill='#4244d4'
                    />
                    <path
                        id='Path_23684'
                        data-name='Path 23684'
                        d='M283.578,176.148c7.079,0,11.14-4.724,11.14-12.964,0-7.737-9.817-18.372-10.234-18.822a1.275,1.275,0,0,0-1.812,0c-.417.45-10.234,11.085-10.234,18.822,0,8.24,4.059,12.964,11.14,12.964Zm0-29.074c2.387,2.778,8.664,10.605,8.664,16.11,0,6.96-2.915,10.489-8.664,10.489s-8.664-3.529-8.664-10.489C274.913,157.679,281.19,149.852,283.578,147.074Zm0,0'
                        transform='translate(-229.918 -121.708)'
                        fill='#4244d4'
                    />
                    <path
                        id='Path_23685'
                        data-name='Path 23685'
                        d='M184.174,320.4c-.315.358-7.736,8.833-7.736,14.435,0,6.293,3.158,9.9,8.664,9.9s8.664-3.609,8.664-9.9c0-5.6-7.42-14.077-7.736-14.435a1.278,1.278,0,0,0-1.857,0Zm.928,21.861c-4.105,0-6.189-2.5-6.189-7.426,0-3.365,3.873-8.841,6.189-11.694,2.317,2.847,6.189,8.325,6.189,11.694C191.291,339.757,189.207,342.256,185.1,342.256Zm0,0'
                        transform='translate(-148.77 -270.488)'
                        fill='#4244d4'
                    />
                    <path
                        id='Path_23686'
                        data-name='Path 23686'
                        d='M42.33,202.627a1.207,1.207,0,0,0,.124.006,1.238,1.238,0,0,0,.124-2.469,9.068,9.068,0,0,1-6.613-3.377c-3.292-4.292-2.2-11.211-2.192-11.28a1.238,1.238,0,0,0-2.44-.406c-.055.327-1.282,8.028,2.66,13.182a11.439,11.439,0,0,0,8.338,4.345Zm0,0'
                        transform='translate(-25.926 -155.619)'
                        fill='#4244d4'
                    />
                    <path
                        id='Path_23687'
                        data-name='Path 23687'
                        d='M329.676,265.935a8.617,8.617,0,0,0,6.054-2.608,7.4,7.4,0,0,0,1.355-6.261,1.238,1.238,0,0,0-2.44.409,5.078,5.078,0,0,1-.795,4.241,6.162,6.162,0,0,1-4.174,1.743,1.238,1.238,0,1,0,0,2.475Zm0,0'
                        transform='translate(-277.253 -216.445)'
                        fill='#4244d4'
                    />
                    <path
                        id='Path_23688'
                        data-name='Path 23688'
                        d='M209.633,411.713a1.42,1.42,0,0,1-.683-2.052,1.238,1.238,0,0,0-2.216-1.107,3.9,3.9,0,0,0,1.792,5.381,1.238,1.238,0,1,0,1.107-2.216Zm0,0'
                        transform='translate(-173.986 -344.765)'
                        fill='#4244d4'
                    />
                </g>
            </svg>
        ),
    };

    if (val) {
        return svgList[val];
    } else {
        return "";
    }
};
export default PowerCard;
