import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

import {
    Timer,
    SearchBar,
    LoadingData,
    TableDCIM,
    Paging,
    InputDateHorizontal,
    exportCSVFile,
    timestampWithDayParse,
    ExportButton,
    generateDateGMT8,
} from "../../ComponentReuseable";

import "./style.scss";

import { getToken, getUserDetails } from "../../TokenParse/TokenParse";

import SVG_right_arrow from "../../../svg/right-arrow-button.svg";

import { ReturnHostBackend } from "../../BackendHost/BackendHost";

const Notification = () => {
    const limitDataOnePage = 15;
    const [filter, setFilter] = useState({
        search: "",
        date: generateDateGMT8(new Date()).toLocaleDateString("sv-SE"),
        category: "All",
        currentPage: 1,
        lastPage: 1,
    });
    const [categoriesList, setCategoriesList] = useState([]);

    const [loading, setLoading] = useState({
        data: false,
        export: false,
    });

    const [dataTable, setDataTable] = useState({
        header: {
            timestamp: { width: "200px", name: "Timestamp" },
            category: { width: "150px", name: "Category" },
            sub_category: { width: "150px", name: "Sub Category" },
            message: { width: "300px", name: "Message" },
        },
        body: [],
    });

    const getNotificationCategories = async () => {
        try {
            let config = {
                method: "POST",
                url:
                    ReturnHostBackend(process.env.REACT_APP_JDBC) +
                    process.env
                        .REACT_APP_NOTIFICATION_LIST_NOTIFICATION_CATEGORY,
                headers: {
                    authorization: getToken(),
                },
            };

            const result = await axios(config);
            if (result.data.data) {
                setCategoriesList(result.data.data);
            } else {
                setCategoriesList([]);
                toast.error("Failed to get Notification categories");
            }
        } catch (e) {
            setCategoriesList([]);
            toast.error("Failed to get Notification categories");
        }
    };
    const getDataNotification = async (date, category, page) => {
        try {
            setLoading((prev) => ({ ...prev, data: true }));
            const createdAt = new Date(
                getUserDetails().createdAt
            ).toLocaleString("sv-SE");
            const userGroupName =
                getUserDetails().userGroupName &&
                getUserDetails().userGroupName.join(",");
            const username = getUserDetails().username;

            let config = {
                method: "POST",
                url:
                    ReturnHostBackend(process.env.REACT_APP_JDBC) +
                    process.env.REACT_APP_NOTIFICATION_LIST_NOTIFICATION,
                headers: {
                    authorization: getToken(),
                },
                data: {
                    username: username,
                    user_group_name: userGroupName,
                    user_created_at: createdAt,
                    search: filter.search,
                    limit: limitDataOnePage,
                    offset: (page - 1) * limitDataOnePage,
                    category: category === "All" ? "" : category,
                    date: date,
                },
            };

            const result = await axios(config);
            if (result.data.length > 0) {
                const bodyTable = result.data[0];
                const countData =
                    parseInt(result.data[1].data[0].count) > 0
                        ? parseInt(result.data[1].data[0].count)
                        : 1;
                // console.log(result.data[1]);
                setDataTable((prev) => ({
                    ...prev,
                    body: bodyTable.data.map((prev) => ({
                        ...prev,
                        timestamp: timestampWithDayParse(
                            new Date(prev.timestamp)
                        ),
                    })),
                }));
                setFilter((prev) => ({
                    ...prev,
                    lastPage: Math.ceil(countData / limitDataOnePage),
                }));
            } else {
                setDataTable((prev) => ({
                    ...prev,
                    body: [],
                }));
                setFilter((prev) => ({
                    ...prev,
                    lastPage: 1,
                }));
            }
            setLoading((prev) => ({ ...prev, data: false }));
        } catch (e) {
            // console.log(e.toString());
            setDataTable((prev) => ({
                ...prev,
                body: [],
            }));
            setFilter((prev) => ({
                ...prev,
                lastPage: 1,
            }));
            toast.error("Failed to get Notification list");
            setLoading((prev) => ({ ...prev, data: false }));
        }
    };

    useEffect(() => {
        setFilter((prev) => ({ ...prev, currentPage: 1 }));
        getDataNotification(filter.date, filter.category, 1);
    }, [filter.date, filter.category]);

    useEffect(() => {
        getNotificationCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilter((prev) => {
            return { ...prev, [name]: value };
        });
    };

    const handleChangeSearch = (e) => {
        setFilter((prev) => {
            return { ...prev, search: e };
        });
    };
    const searchContent = () => {
        getDataNotification(filter.date, filter.category, 1);
        setFilter((prev) => ({ ...prev, currentPage: 1 }));
    };
    const handleSelectRow = (selectedItem, index) => {
        // console.log(selectedItem, index);
    };

    // table paging function
    const firstPage = () => {
        if (filter.currentPage !== 1) {
            setFilter((prev) => {
                return { ...prev, currentPage: 1 };
            });
            getDataNotification(filter.date, filter.category, 1);
        }
    };
    const lastPage = () => {
        if (filter.currentPage !== filter.lastPage) {
            setFilter((prev) => {
                return { ...prev, currentPage: prev.lastPage };
            });
            getDataNotification(filter.date, filter.category, filter.lastPage);
        }
    };
    const nextPage = () => {
        if (filter.currentPage < filter.lastPage) {
            setFilter((prev) => {
                return { ...prev, currentPage: prev.currentPage + 1 };
            });
            getDataNotification(
                filter.date,
                filter.category,
                filter.currentPage + 1
            );
        }
    };
    const prevPage = () => {
        if (filter.currentPage > 1) {
            setFilter((prev) => {
                return { ...prev, currentPage: prev.currentPage - 1 };
            });
            getDataNotification(
                filter.date,
                filter.category,
                filter.currentPage - 1
            );
        }
    };

    const exportDataNotification = async () => {
        try {
            setLoading((prev) => ({ ...prev, export: true }));
            const createdAt = new Date(
                getUserDetails().createdAt
            ).toLocaleString("sv-SE");
            const userGroupName =
                getUserDetails().userGroupName &&
                getUserDetails().userGroupName.join(",");
            const username = getUserDetails().username;

            let config = {
                method: "POST",
                url:
                    ReturnHostBackend(process.env.REACT_APP_JDBC) +
                    process.env.REACT_APP_NOTIFICATION_LIST_NOTIFICATION,
                headers: {
                    authorization: getToken(),
                },
                data: {
                    username: username,
                    user_group_name: userGroupName,
                    user_created_at: createdAt,
                    search: "",
                    limit: 500,
                    offset: 0,
                    category: filter.category === "All" ? "" : filter.category,
                    date: filter.date,
                },
            };

            const result = await axios(config);
            if (result.data.length > 0) {
                const fileName = `Notification_[${new Date()
                    .toLocaleString("sv-SE")
                    .replace(" ", ",")}]_[${
                    filter.date ? filter.date : "AllDay"
                }]_[${
                    filter.category === "All" ? "AllCategory" : filter.category
                }]`;
                const dataExport = [
                    {
                        sheetName: "sheet1",
                        header: [
                            "timestamp",
                            "category",
                            "sub_category",
                            "message",
                        ],
                        body: result.data[0].data.map((prev) => ({
                            ...prev,
                            timestamp: timestampWithDayParse(
                                new Date(prev.timestamp)
                            ),
                        })),
                    },
                ];
                exportCSVFile(dataExport, fileName);
            } else {
                toast.error("Failed to export Notification");
            }
            setLoading((prev) => ({ ...prev, export: false }));
        } catch (e) {
            // console.log(e.toString());
            toast.error("Failed to export Notification");
            setLoading((prev) => ({ ...prev, export: false }));
        }
    };

    const actions = [
        {
            iconSrc: SVG_right_arrow,
            onClick: (selectedItem, index) => {
                window.location.href = `${window.location.protocol}//${
                    window.location.host
                }/${selectedItem.notification_url || ""}`;
            },
        },
    ];

    return (
        <div className='asset-container'>
            <div className='asset-header'>
                <div className='page-title'>Notification</div>
                <div className='header-time'>
                    <Timer />
                </div>
            </div>
            <div className='record-filter-container'>
                <SearchBar
                    name='search'
                    value={filter.search}
                    search={handleChangeSearch}
                    searchContent={searchContent}
                />
                <InputDateHorizontal
                    inputWidth='200px'
                    name='date'
                    label='Date'
                    value={filter.date}
                    onChange={handleChange}
                    clearData={() =>
                        setFilter((prev) => ({ ...prev, date: "" }))
                    }
                />
            </div>
            <div className='notification-content'>
                <div className='notification-content-flex'>
                    <div className='notification-categories'>
                        <div className='tab-menu-container'>
                            <div
                                onClick={() =>
                                    setFilter((prev) => ({
                                        ...prev,
                                        category: "All",
                                    }))
                                }
                                className={
                                    filter.category === "All" ? "selected" : ""
                                }>
                                <span>All</span>
                            </div>
                            {categoriesList.length > 0 &&
                                categoriesList.map((data, index) => (
                                    <div
                                        onClick={() => {
                                            setFilter((prev) => ({
                                                ...prev,
                                                category: data.name,
                                            }));
                                        }}
                                        key={index}
                                        className={
                                            filter.category === data.name
                                                ? "selected"
                                                : ""
                                        }>
                                        <span>{data.name}</span>
                                    </div>
                                ))}
                        </div>
                        <div>
                            <ExportButton
                                isLoading={loading.export}
                                onClick={exportDataNotification}
                            />
                        </div>
                    </div>
                    <div className='notification-tables'>
                        <LoadingData isLoading={loading.data} />
                        <TableDCIM
                            header={dataTable.header}
                            body={dataTable.body}
                            actions={actions}
                            actionWidth={"50px"}
                            customCellClassNames={{}}
                            selectable={false}
                            onSelect={(selectedItem, index) => {
                                handleSelectRow(selectedItem, index);
                            }}
                        />
                    </div>
                    <div className='notification-paging'>
                        <Paging
                            firstPage={firstPage}
                            lastPage={lastPage}
                            nextPage={nextPage}
                            prevPage={prevPage}
                            currentPageNumber={filter.currentPage}
                            lastPageNumber={filter.lastPage}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notification;
