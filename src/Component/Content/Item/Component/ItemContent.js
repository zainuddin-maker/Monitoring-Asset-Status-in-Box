import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ItemDataTable from "./ItemDataTable";
import ItemDataDetail from "./ItemDataDetail";
import ItemHeader from "./ItemHeader";
import axios from "axios";
import { getToken } from "../../../TokenParse/TokenParse";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { getLimitTableDCIM } from "../../../ComponentReuseable";
import "../style.scss";

const ItemContent = () => {
    let detailDefault = {
        item_number: "---",
        item_name: "---",
        client_name: "---",
        commissioned_date: "---",
        brand_name: "---",
        model_name: "---",
        number_of_u: "---",
        is_full: "---",
        status: "---",
        rack_number: "---",
        category: "---",
    };
    const [isActive, setIsActive] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState({
        client: null,
        status: null,
        rack_number: null,
        category: null,
        item_number: null,
    });
    const [isLoading, setIsLoading] = useState({
        itemList: false,
        status: false,
        detail: false,
        export: false,
    });
    const [countItems, setCountItems] = useState(1);
    const [allItems, setAllItems] = useState([]);
    const [items, setItems] = useState([]);
    const [status, setStatus] = useState({
        total: "-",
        installed: "-",
        in_progress: "-",
        removed: "-",
    });
    const [selectedRow, setSelectedRow] = useState(0);
    const [selectedItem, setSelectedItem] = useState({
        item_number: "---",
        item_name: "---",
        client_name: "---",
        commissioned_date: "---",
        brand_name: "---",
        model_name: "---",
        number_of_u: "---",
        is_full: "---",
        status: "---",
        rack_number: "---",
        category: "---",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(null);
    const [datasheet, setDatasheet] = useState([]);

    const getItems = async () => {
        setIsLoading((prev) => {
            return {
                ...prev,
                itemList: true,
                detail: true,
                status: true,
            };
        });
        const limit = getLimitTableDCIM();
        let config1 = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_ITEM_GET_ITEMS,
            headers: {
                authorization: getToken(),
            },
            data: {
                search: search === null ? "" : search,
                client_name: filter.client === null ? "" : filter.client,
                status: filter.status === null ? "" : filter.status,
                rack_number:
                    filter.rack_number === null ? "" : filter.rack_number,
                item_number:
                    filter.item_number === null ? "" : filter.item_number,
                category: filter.category === null ? "" : filter.category,
                limit: limit,
                offset: (currentPage - 1) * limit,
            },
        };
        let config2 = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_ITEM_GET_ALL_ITEMS,
            headers: {
                authorization: getToken(),
            },
            data: {
                search: search === null ? "" : search,
                client_name: filter.client === null ? "" : filter.client,
                status: filter.status === null ? "" : filter.status,
                rack_number:
                    filter.rack_number === null ? "" : filter.rack_number,
                item_number:
                    filter.item_number === null ? "" : filter.item_number,
                category: filter.category === null ? "" : filter.category,
            },
        };
        try {
            const result1 = await axios(config1);
            const result2 = await axios(config2);
            let row = result1.data.data[selectedRow];
            let itemslength = items.length;

            if (result1.data.count > 0) {
                setItems(result1.data.data);
                setIsActive(true);
                if (selectedRow !== undefined) {
                    if (row !== undefined) {
                        setSelectedItem(row);
                    } else {
                        setSelectedItem(result1.data.data[0]);
                    }
                } else {
                    setSelectedItem(result1.data.data[0]);
                }
                if (itemslength !== result1.data.data.length) {
                    setSelectedItem(result1.data.data[0]);
                }
            } else {
                setItems(result1.data.data);
                setSelectedItem(detailDefault);
                setIsActive(false);
            }

            let total = result2.data.count;
            let installed = 0;
            let in_progress = 0;
            let removed = 0;
            result2.data.data.map((a) => {
                a.status === "Installed"
                    ? (installed += 1)
                    : a.status === "In-Progress"
                    ? (in_progress += 1)
                    : a.status === "Removed"
                    ? (removed += 1)
                    : (total += 0);
            });

            if (result2.data.count > 0) {
                setStatus((prev) => {
                    return {
                        ...prev,
                        total: total,
                        installed: installed,
                        in_progress: in_progress,
                        removed: removed,
                    };
                });
            } else {
                setStatus((prev) => {
                    return {
                        ...prev,
                        total: "-",
                        installed: "-",
                        in_progress: "-",
                        removed: "-",
                    };
                });
            }

            if (result2.data.count < limit) {
                setCurrentPage(1);
            }
            setCountItems(result2.data.count);
            setAllItems(result2.data.data);
            setIsLoading((prev) => {
                return {
                    ...prev,
                    itemList: false,
                    detail: false,
                    status: false,
                };
            });
        } catch (e) {
            // console.error(e);
            if (e.message === "Network Error") {
                toast.error(e.message, { toastId: "network-error" });
            }
            toast.error("Failed to get item data", {
                toastId: "failed-get-items",
            });
            setIsLoading((prev) => {
                return {
                    ...prev,
                    itemList: false,
                    detail: false,
                    status: false,
                };
            });
        }
    };

    const getDatasheet = async () => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACKITEM_GET_DATASHEETS,
            headers: {
                authorization: getToken(),
            },
            data: {
                id: selectedItem.item_id,
                type: "item",
            },
        };
        try {
            const result = await axios(config);
            const data = result.data.data;
            let ds = [];
            if (data.length !== 0) {
                data.map((a) => {
                    ds.push(a.datasheet);
                });
                setDatasheet(ds);
            } else {
                setDatasheet([]);
            }
        } catch (e) {
            // console.error(e);
            toast.error("Failed to get data sheet", {
                toastId: "failed-get-datasheet",
            });
        }
    };

    useEffect(() => {
        getItems();
    }, [filter, currentPage, selectedRow]);

    useEffect(() => {
        getDatasheet();
    }, [selectedItem]);

    useEffect(() => {
        const limit = getLimitTableDCIM();
        setTotalPage(
            Math.ceil(countItems / limit) == 0
                ? 1
                : Math.ceil(countItems / limit)
        );
    }, [countItems]);

    useEffect(() => {
        if (currentPage > totalPage) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPage]);

    return (
        <React.Fragment>
            <ItemHeader
                filter={filter}
                setFilter={setFilter}
                getItems={getItems}
                search={search}
                setSearch={setSearch}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
            />
            <div className='item-content'>
                <ItemDataTable
                    setSelectedItem={setSelectedItem}
                    items={items}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    setIsActive={setIsActive}
                    getItems={getItems}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPage={totalPage}
                    allItems={allItems}
                    setSelectedRow={setSelectedRow}
                />
                <ItemDataDetail
                    selectedItem={selectedItem}
                    setSelectedItem={setSelectedItem}
                    status={status}
                    isLoading={isLoading}
                    isActive={isActive}
                    getItems={getItems}
                    setIsLoading={setIsLoading}
                    datasheet={datasheet}
                />
            </div>
        </React.Fragment>
    );
};

export default ItemContent;
