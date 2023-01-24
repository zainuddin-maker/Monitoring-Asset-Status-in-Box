import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../../TokenParse/TokenParse";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import WriteIcon from "./../image/write-icon.svg";
import DatasheetIcon from "./../image/data-sheet-icon.svg";
import DeleteIcon from "./../image/delete-icon.svg";
import {
    useModal,
    ModalDelete,
    Tooltip,
    PreviewImage,
    LoadingData,
    getUAC,
    getUACWithoutToast,
} from "../../../ComponentReuseable/index";
import DatasheetModal from "../../Datasheet/DatasheetModal";
import EditItemModal from "./EditItemModal";
import { toast } from "react-toastify";
import SVG_preview from "../../../../svg/preview.svg";
import SVG_blank_image from "../../../../svg/blank_image.svg";
import "./../style.scss";

const ItemDataDetail = (props) => {
    const {
        selectedItem,
        setSelectedItem,
        status,
        isLoading,
        isActive,
        getItems,
        setIsLoading,
        datasheet,
    } = props;

    function formatDate(date) {
        const months = [
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
            "Dec",
        ];
        var d = new Date(date),
            month = months[d.getMonth()],
            day = d.getDate(),
            year = d.getFullYear();

        return [day, month, year].join(" ");
    }

    const [loadingButton, setLoadingButton] = useState(false);
    const [selectedDatasheet, setSelectedDatasheet] = useState([]);
    const { isShowing: isShowingDatasheetModal, toggle: datasheetModal } =
        useModal();
    const { isShowing: isShowingEditItemModal, toggle: editItemModal } =
        useModal();
    const { isShowing: isShowingDeleteItemModal, toggle: deleteItemModal } =
        useModal();
    const { isShowing: isShowingPreview, toggle: togglePreview } = useModal();

    const deleteItem = async (e) => {
        e.preventDefault();
        setLoadingButton(true);
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_ITEM_DELETE_ITEM,
            headers: {
                authorization: getToken(),
            },
            data: {
                item_id: selectedItem.item_id,
            },
        };
        if (
            selectedItem.image_location ||
            selectedItem.image_location !== null
        ) {
            await deleteFile(selectedItem.image_location.slice(38));
        }

        if (datasheet.length > 0) {
            datasheet.forEach(async (data) => {
                if (data !== null || data) {
                    await deleteFile(data.slice(38));
                }
            });
        }
        try {
            const result = await axios(config);
            if (result.data.data) {
                toast.success("Success to delete item", {
                    toastId: "success-delete-item",
                });
                setLoadingButton(false);
                getItems();
            }
            setLoadingButton(false);
            deleteItemModal();
        } catch (e) {
            // console.error(e);
            toast.error("Failed to delete item", {
                toastId: "error-delete-item",
            });
            setLoadingButton(false);
        }
    };

    const deleteFile = async (files) => {
        // let file = "";
        // if (files) {
        //     file = files.slice(38);
        // } else {
        //     file = files;
        // }
        // console.log(file);

        const config = {
            method: "delete",
            url:
                ReturnHostBackend(process.env.REACT_APP_BACKEND_NODELINX) +
                process.env.REACT_APP_IMAGE_UPLOAD,
            headers: {
                authorization: getToken(),
            },
            data: {
                path: files,
            },
        };
        try {
            const result = await axios(config);
            if (result.status === 200) {
            } else {
                toast.error("Failed to delete datasheet file", {
                    toastId: "error-delete-datasheet",
                });
            }
        } catch (e) {
            // console.log(e);
        }
    };

    return (
        <div className='item-table-detail'>
            <div className='detail-top-side'>
                <LoadingData
                    isLoading={isLoading.detail}
                    useAltBackground={false}
                />
                <div className='info-icons'>
                    <Tooltip
                        tooltip={
                            <span className='icon-tooltip'>{"Data Sheet"}</span>
                        }>
                        <img
                            className={
                                getUACWithoutToast("edit")
                                    ? "icons datasheet-icon"
                                    : "icons datasheet-icon-noedit"
                            }
                            src={DatasheetIcon}
                            alt='datasheet-icon'
                            onClick={() => datasheetModal()}
                        />
                    </Tooltip>
                    {getUACWithoutToast("edit") ? (
                        <Tooltip
                            tooltip={
                                <span className='icon-tooltip'>
                                    {"Edit Item"}
                                </span>
                            }>
                            <img
                                className='icons write-icon'
                                src={WriteIcon}
                                alt='edit-icon'
                                onClick={() => editItemModal()}
                            />
                        </Tooltip>
                    ) : null}
                    {getUACWithoutToast("delete") ? (
                        <Tooltip
                            tooltip={
                                <span className='icon-tooltip'>
                                    {"Delete Item"}
                                </span>
                            }>
                            <img
                                className='icons delete-icon'
                                src={DeleteIcon}
                                alt='delete-icon'
                                onClick={() => deleteItemModal()}
                            />
                        </Tooltip>
                    ) : null}
                </div>
                <div className='info-details'>
                    <div className='item-image'>
                        <img
                            src={
                                ReturnHostBackend(
                                    process.env.REACT_APP_BACKEND_NODELINX
                                ) + selectedItem.image_location
                            }
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = SVG_blank_image;
                            }}
                            alt='item-image'
                        />
                        <div className='image-preview'>
                            <img
                                src={SVG_preview}
                                alt='preview'
                                onClick={() => togglePreview()}
                            />
                        </div>
                    </div>
                    <div className='flex-column'>
                        <p>Item Number</p>
                        <span>{selectedItem.item_number}</span>
                    </div>
                    <div className='flex-column'>
                        <p>Item Name</p>
                        <span>{selectedItem.item_name}</span>
                    </div>
                    <div className='flex-column'>
                        <p>Client</p>
                        <span>{selectedItem.client_name}</span>
                    </div>
                    <div className='flex-column'>
                        <p>Date of Item Entry</p>
                        <span>
                            {selectedItem.commissioned_date !== "---"
                                ? selectedItem.commissioned_date
                                    ? formatDate(selectedItem.commissioned_date)
                                    : "---"
                                : selectedItem.commissioned_date}
                        </span>
                    </div>
                    <div className='flex-column'>
                        <p>Brand</p>
                        <span>{selectedItem.brand_name}</span>
                    </div>
                    <div className='flex-column'>
                        <p>Model Number</p>
                        <span>{selectedItem.model_name}</span>
                    </div>
                    <div className='flex-row'>
                        <div className='flex-column'>
                            <p>U(s) Needed</p>
                            <span>{selectedItem.number_of_u}</span>
                        </div>
                        <div className='flex-column'>
                            <p>Half / Full</p>
                            <span>{selectedItem.is_full}</span>
                        </div>
                    </div>
                    <div className='flex-row'>
                        <div className='flex-column'>
                            <p>Status</p>
                            <span
                                className={
                                    selectedItem.status === "Installed"
                                        ? "installed"
                                        : selectedItem.status === "In-Progress"
                                        ? "in-progress"
                                        : selectedItem.status === "Removed"
                                        ? "removed"
                                        : ""
                                }>
                                {selectedItem.status}
                            </span>
                        </div>
                        <div className='flex-column'>
                            <p>Rack #</p>
                            <span>
                                {selectedItem.rack_number === null
                                    ? "Not Installed"
                                    : selectedItem.rack_number}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className='detail-bottom-side'>
                <LoadingData
                    size='100px'
                    isLoading={isLoading.status}
                    useAltBackground={false}
                />
                <div className='detail-total'>
                    <div className='box total'>
                        <p>Total</p>
                        <span>{status.total}</span>
                    </div>
                    <div className='box progress'>
                        <p>In-Progress</p>
                        <span>{status.in_progress}</span>
                    </div>
                    <div className='box install'>
                        <p>Installed</p>
                        <span>{status.installed}</span>
                    </div>
                    <div className='box remove'>
                        <p>Removed</p>
                        <span>{status.removed}</span>
                    </div>
                </div>
            </div>
            <DatasheetModal
                title={"Datasheet"}
                isShowing={isShowingDatasheetModal}
                hide={datasheetModal}
                file={datasheet}
            />
            <EditItemModal
                title={
                    selectedItem.item_number !== "---"
                        ? "Edit Item " + selectedItem.item_number
                        : "Edit Item"
                }
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                isShowing={isShowingEditItemModal}
                hide={editItemModal}
                submitName={"Edit"}
                onSubmit={() => {
                    editItemModal();
                }}
                clearName={"Clear"}
                onClear={() => {
                    editItemModal();
                }}
                getItems={getItems}
                setIsLoading={setIsLoading}
                deleteFile={deleteFile}
                selectedDatasheet={datasheet}
            />
            <ModalDelete
                isShowing={isShowingDeleteItemModal}
                hide={deleteItemModal}
                deletedObjectType='Item'
                deletedObjectName={
                    selectedItem.item_number !== "---"
                        ? selectedItem.item_number
                        : ""
                }
                onDelete={deleteItem}
                isLoading={loadingButton}
            />
            <PreviewImage
                src={
                    ReturnHostBackend(process.env.REACT_APP_BACKEND_NODELINX) +
                    selectedItem.image_location
                }
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = SVG_blank_image;
                }}
                isShowing={isShowingPreview}
                hide={togglePreview}
                width='200px'
            />
        </div>
    );
};

export default ItemDataDetail;
