import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../../TokenParse/TokenParse";
import WriteIcon from "./../image/write-icon.svg";
import DatasheetIcon from "./../image/data-sheet-icon.svg";
import DeleteIcon from "./../image/delete-icon.svg";
import EditRackModal from "./EditRackModal";
import DatasheetModal from "../../Datasheet/DatasheetModal";
import { toast } from "react-toastify";
import {
    useModal,
    ModalDelete,
    Tooltip,
    LoadingData,
    PreviewImage,
    getUAC,
    getUACWithoutToast,
} from "../../../ComponentReuseable/index";
import SVG_preview from "../../../../svg/preview.svg";
import "./../style.scss";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import SVG_blank_image from "../../../../svg/blank_image.svg";

const RackDataDetail = (props) => {
    const {
        selectedRack,
        setSelectedRack,
        isLoading,
        setIsLoading,
        getRacks,
        isActive,
        power,
        datasheet,
        getDatasheet,
        powerSource,
        isConnected,
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
    const [access, setAccess] = useState([]);
    const [selectedDatasheet, setSelectedDatasheet] = useState([]);

    const { isShowing: isShowingDatasheetModal, toggle: datasheetModal } =
        useModal();
    const { isShowing: isShowingEditRackModal, toggle: editRackModal } =
        useModal();
    const { isShowing: isShowingDeleteRackModal, toggle: deleteRackModal } =
        useModal();
    useModal();
    const { isShowing: isShowingPreview, toggle: togglePreview } = useModal();

    const getAccess = async () => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_GET_ACCESS,
            headers: {
                authorization: getToken(),
            },
            data: {
                rack_id:
                    selectedRack.rack_id === undefined
                        ? ""
                        : selectedRack.rack_id,
            },
        };
        try {
            const result = await axios(config);
            if (result.data.data.length > 0) {
                let cardType = result.data.data.filter(
                    (a) => a.type_name === "Card"
                );
                let keyType = result.data.data.filter(
                    (a) => a.type_name === "Key"
                );
                let biometricType = result.data.data.filter(
                    (a) => a.type_name === "Biometric"
                );

                setAccess((prev) => {
                    return {
                        ...prev,
                        keyType: keyType,
                        cardType: cardType,
                        biometricType: biometricType,
                    };
                });
            } else {
                setAccess([]);
            }
        } catch (e) {
            // console.error(e);
            toast.error("Failed to get rack access", {
                toastId: "failed-get-rack-access",
            });
        }
    };

    const deleteRack = async (e) => {
        e.preventDefault();
        setLoadingButton(true);
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_DELETE_RACK,
            headers: {
                authorization: getToken(),
            },
            data: {
                rack_id: selectedRack.rack_id,
            },
        };
        if (
            selectedRack.image_location ||
            selectedRack.image_location !== null
        ) {
            await deleteFile(selectedRack.image_location.slice(38));
        }

        if (datasheet.length > 0) {
            datasheet.forEach(async (data, i) => {
                if (data !== null || data) {
                    await deleteFile(data.slice(38));
                }
            });
        }
        try {
            const result = await axios(config);
            if (result.data.data) {
                toast.success("Success to delete rack", {
                    toastId: "success-delete-rack",
                });
                setLoadingButton(false);
                getRacks();
            }
            setLoadingButton(false);
            deleteRackModal();
        } catch (e) {
            // console.error(e);
            toast.error("Failed to delete rack", {
                toastId: "error-delete-rack",
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
                toast.error("Failed to delete file", {
                    toastId: "error-delete-file",
                });
            }
        } catch (e) {
            // console.log(e);
        }
    };

    useEffect(() => {
        if (selectedRack !== undefined) {
            if (selectedRack.rack_id !== undefined) {
                setIsLoading((prev) => {
                    return {
                        ...prev,
                        detail: true,
                    };
                });
                getAccess();
                setIsLoading((prev) => {
                    return {
                        ...prev,
                        detail: false,
                    };
                });
            }
        }
    }, [selectedRack]);

    return (
        <div className='content-table-detail-info'>
            <LoadingData
                isLoading={isLoading.detail}
                useAltBackground={false}
            />
            <div className='detail-top-side'>
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
                                    {"Edit Rack"}
                                </span>
                            }>
                            <img
                                className='icons write-icon'
                                src={WriteIcon}
                                alt='edit-icon'
                                onClick={() => editRackModal()}
                            />
                        </Tooltip>
                    ) : null}
                </div>
                <div className='info-details'>
                    <div className='rack-image'>
                        <img
                            src={
                                ReturnHostBackend(
                                    process.env.REACT_APP_BACKEND_NODELINX
                                ) + selectedRack.image_location
                            }
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = SVG_blank_image;
                            }}
                            alt='rack-image'
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
                        <p>Rack Number</p>
                        <span>
                            {selectedRack ? selectedRack.rack_number : "---"}
                        </span>
                    </div>
                    <div className='flex-column'>
                        <p>Location</p>
                        <div className='flex-row'>
                            <p>
                                Floor{" "}
                                <span>
                                    {selectedRack
                                        ? selectedRack.floor_name
                                        : "-"}
                                </span>
                            </p>
                            <p>
                                Room{" "}
                                <span>
                                    {selectedRack
                                        ? selectedRack.room_name
                                        : "-"}
                                </span>
                            </p>
                            <p>
                                Area{" "}
                                <span>
                                    {selectedRack
                                        ? selectedRack.area_name
                                        : "-"}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className='flex-column'>
                        <p>Brand</p>
                        <span>
                            {selectedRack ? selectedRack.brand_name : "---"}
                        </span>
                    </div>
                    <div className='flex-column'>
                        <p>Commisioned Date</p>
                        <span>
                            {selectedRack
                                ? selectedRack.commissioned_date !== "---"
                                    ? selectedRack.commissioned_date
                                        ? formatDate(
                                              selectedRack.commissioned_date
                                          )
                                        : "---"
                                    : selectedRack.commissioned_date
                                : "---"}
                        </span>
                    </div>
                    <div className='flex-column'>
                        <p>Model Number</p>
                        <span>
                            {selectedRack.model_name
                                ? selectedRack.model_name
                                : "---"}
                        </span>
                    </div>
                    <div className='flex-column'>
                        <p>Client</p>
                        <span>
                            {selectedRack ? selectedRack.client_name : "---"}
                        </span>
                    </div>
                    <div className='flex-column'>
                        <p>Number of U(s)</p>
                        <span>
                            {selectedRack ? selectedRack.number_of_u : "---"}
                        </span>
                    </div>
                    <div className='flex-column'>
                        <p>Status</p>
                        <span>
                            {selectedRack ? selectedRack.status : "---"}
                        </span>
                    </div>
                </div>
            </div>
            <div className='detail-bottom-side'>
                <div className='info-icons'>
                    {getUACWithoutToast("delete") ? (
                        <Tooltip
                            tooltip={
                                <span className='icon-tooltip'>
                                    {"Delete Rack"}
                                </span>
                            }>
                            <img
                                className='icons delete-icon'
                                src={DeleteIcon}
                                alt='delete-icon'
                                onClick={() => deleteRackModal()}
                            />
                        </Tooltip>
                    ) : null}
                </div>
                <div className='info-details'>
                    {selectedRack.power_source !== "---" ? (
                        powerSource.powerA.length !== 0 &&
                        powerSource.powerB.length !== 0 ? (
                            <div className='flex-column'>
                                <p>Power Source</p>
                                {powerSource.powerA.map((power, i) =>
                                    powerSource.powerA.length === 1 ? (
                                        <div className='flex-column'>
                                            <div className='flex-row'>
                                                <p>{`Power Source A:`}</p>
                                                <span>{power}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='flex-column'>
                                            <div className='flex-row'>
                                                <p>{`Power Source A${
                                                    i + 1
                                                }:`}</p>
                                                <span>{power}</span>
                                            </div>
                                        </div>
                                    )
                                )}
                                {powerSource.powerB.map((power, i) =>
                                    powerSource.powerB.length === 1 ? (
                                        <div className='flex-column'>
                                            <div className='flex-row'>
                                                <p>{`Power Source B:`}</p>
                                                <span>{power}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='flex-column'>
                                            <div className='flex-row'>
                                                <p>{`Power Source B${
                                                    i + 1
                                                }:`}</p>
                                                <span>{power}</span>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className='flex-column'>
                                <p>Power Source</p>
                                <span>---</span>
                            </div>
                        )
                    ) : (
                        <div className='flex-column'>
                            <p>Power Source</p>
                            <span>---</span>
                        </div>
                    )}
                    {access.length !== 0 ? (
                        <div className='flex-column'>
                            <p>Access</p>
                            {access.keyType.map((a, i) => (
                                <div className='flex-row'>
                                    <p>
                                        Access {a.type_name} {i + 1}:
                                    </p>
                                    <span>{a.access_name}</span>
                                </div>
                            ))}
                            {access.cardType.map((a, i) => (
                                <div className='flex-row'>
                                    <p>
                                        Access {a.type_name} {i + 1}:
                                    </p>
                                    <span>{a.access_name}</span>
                                </div>
                            ))}
                            {access.biometricType.map((a, i) => (
                                <div className='flex-row'>
                                    <p>
                                        Access {a.type_name} {i + 1}:
                                    </p>
                                    <span>{a.access_name}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='flex-column'>
                            <p>Access</p>
                            <span>---</span>
                        </div>
                    )}
                </div>
            </div>
            <DatasheetModal
                title={"Datasheet"}
                isShowing={isShowingDatasheetModal}
                hide={datasheetModal}
                file={datasheet}
            />
            <EditRackModal
                title={
                    selectedRack.rack_number !== "---"
                        ? "Edit Rack " + selectedRack.rack_number
                        : "Edit Rack"
                }
                isShowing={isShowingEditRackModal}
                hide={editRackModal}
                selectedRack={selectedRack}
                setSelectedRack={setSelectedRack}
                access={access}
                submitName={"Edit"}
                onSubmit={() => {
                    editRackModal();
                }}
                clearName={"Clear"}
                onClear={() => {
                    editRackModal();
                }}
                getRacks={getRacks}
                deleteFile={deleteFile}
                powerSource={powerSource}
                selectedDatasheet={datasheet}
                getDatasheet={getDatasheet}
                isConnected={isConnected}
            />
            <ModalDelete
                isShowing={isShowingDeleteRackModal}
                hide={deleteRackModal}
                deletedObjectType='Rack'
                deletedObjectName={
                    selectedRack.rack_number !== "---"
                        ? selectedRack.rack_number
                        : ""
                }
                onDelete={deleteRack}
                isLoading={loadingButton}
            />
            <PreviewImage
                src={
                    ReturnHostBackend(process.env.REACT_APP_BACKEND_NODELINX) +
                    selectedRack.image_location
                }
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = SVG_blank_image;
                }}
                isShowing={isShowingPreview}
                hide={togglePreview}
            />
        </div>
    );
};

export default RackDataDetail;
