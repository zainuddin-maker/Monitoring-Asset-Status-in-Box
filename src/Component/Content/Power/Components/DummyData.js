import { generateDateGMT8 } from "../../../ComponentReuseable";
export const emptyDataAll = [
    {
        name: "Main",
        data: [
            {
                x: "Power Source A",
                y: [
                    generateDateGMT8(new Date()).setHours(0),
                    generateDateGMT8(new Date()).setHours(0),
                ],
            },
            {
                x: "Power Source B",
                y: [
                    generateDateGMT8(new Date()).setHours(0),
                    generateDateGMT8(new Date()).setHours(0),
                ],
            },
        ],
    },
    {
        name: "Backup",
        data: [],
    },
    {
        name: "Battery",
        data: [],
    },
    {
        name: "Down",
        data: [],
    },
    {
        name: "Offline",
        data: [],
    },
];

export const emptyDataA = [
    {
        name: "Main",
        data: [
            {
                x: "Power Source A",
                y: [
                    generateDateGMT8(new Date()).setHours(0),
                    generateDateGMT8(new Date()).setHours(0),
                ],
            },
        ],
    },
    {
        name: "Backup",
        data: [],
    },
    {
        name: "Battery",
        data: [],
    },
    {
        name: "Down",
        data: [],
    },
    {
        name: "Offline",
        data: [],
    },
];

export const emptyDataB = [
    {
        name: "Main",
        data: [
            {
                x: "Power Source B",
                y: [
                    generateDateGMT8(new Date()).setHours(0),
                    generateDateGMT8(new Date()).setHours(0),
                ],
            },
        ],
    },
    {
        name: "Backup",
        data: [],
    },
    {
        name: "Battery",
        data: [],
    },
    {
        name: "Down",
        data: [],
    },
    {
        name: "Offline",
        data: [],
    },
];

export const dataDummyChartPowerAll = [
    {
        name: "Main",
        data: [
            {
                x: "Power Source A",
                y: [
                    generateDateGMT8(new Date()).setHours(0),
                    generateDateGMT8(new Date()).setHours(3),
                ],
            },
            {
                x: "Power Source A",
                y: [
                    generateDateGMT8(new Date()).setHours(6),
                    generateDateGMT8(new Date()).setHours(8),
                ],
            },
            {
                x: "Power Source B",
                y: [
                    generateDateGMT8(new Date()).setHours(3),
                    generateDateGMT8(new Date()).setHours(6),
                ],
            },
        ],
    },
    {
        name: "Backup",
        data: [
            {
                x: "Power Source A",
                y: [
                    generateDateGMT8(new Date()).setHours(3),
                    generateDateGMT8(new Date()).setHours(6),
                ],
            },
            {
                x: "Power Source B",
                y: [
                    generateDateGMT8(new Date()).setHours(0),
                    generateDateGMT8(new Date()).setHours(3),
                ],
            },
            {
                x: "Power Source B",
                y: [
                    generateDateGMT8(new Date()).setHours(6),
                    generateDateGMT8(new Date()).setHours(8),
                ],
            },
        ],
    },
];
export const dataDummyChartPowerA = [
    {
        name: "Main",
        data: [
            {
                x: "Power Source A",
                y: [
                    generateDateGMT8(new Date()).setHours(0),
                    generateDateGMT8(new Date()).setHours(3),
                ],
            },
            {
                x: "Power Source A",
                y: [
                    generateDateGMT8(new Date()).setHours(6),
                    generateDateGMT8(new Date()).setHours(8),
                ],
            },
        ],
    },
    {
        name: "Backup",
        data: [
            {
                x: "Power Source A",
                y: [
                    generateDateGMT8(new Date()).setHours(3),
                    generateDateGMT8(new Date()).setHours(6),
                ],
            },
        ],
    },
];

export const dataDummyChartPowerB = [
    {
        name: "Main",
        data: [
            {
                x: "Power Source B",
                y: [
                    generateDateGMT8(new Date()).setHours(3),
                    generateDateGMT8(new Date()).setHours(6),
                ],
            },
        ],
    },
    {
        name: "Backup",
        data: [
            {
                x: "Power Source B",
                y: [
                    generateDateGMT8(new Date()).setHours(0),
                    generateDateGMT8(new Date()).setHours(3),
                ],
            },
            {
                x: "Power Source B",
                y: [
                    generateDateGMT8(new Date()).setHours(6),
                    generateDateGMT8(new Date()).setHours(8),
                ],
            },
        ],
    },
];
