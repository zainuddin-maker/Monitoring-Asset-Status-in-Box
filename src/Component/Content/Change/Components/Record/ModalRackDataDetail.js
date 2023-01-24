import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../../../TokenParse/TokenParse";

import WriteIcon from "../../../../Content/Rack/image/write-icon.svg";
import DatasheetIcon from "../../../../Content/Rack/image/data-sheet-icon.svg";
import DeleteIcon from "../../../../Content/Rack/image/delete-icon.svg";

import DatasheetModal from "../../../Datasheet/DatasheetModal";
import { toast } from "react-toastify";
import {
    useModal,
    ModalDelete,
    Tooltip,
    LoadingData,
    PreviewImage,
} from "../../../../ComponentReuseable/index";
import SVG_preview from "../../../../../svg/preview.svg";
import SVG_blank_image from "../../../../../svg/blank_image.svg";
import { requestAPI } from "../Utils/changeUtils";
import { getDetailedRackAPI } from "../ChangeAPI";

import { ModalContainer } from "../../../../ComponentReuseable";
import { ReturnHostBackend } from "../../../../BackendHost/BackendHost";

const ModalRackDataDetail = ({ isShowing, hide, selectedRow }) => {
    // const { selectedRack, setSelectedRack, isLoading, getRacks } = props;
    const [selectedRack, setSelectedRack] = useState({
        image_location: "",
        rack_number: "",
        floor_name: "",
        room_name: "",
        area_name: "",
        brand_name: "",
        commissioned_date: "",
        model_name: "",
        client_name: "",
        number_of_u: "",
        power_source_a: "",
        power_source_b: "",
        data_sheet_location: "",
    });
    const [access, setAccess] = useState({
        key: [],
        card: [],
        biometric: [],
    });
    const [isLoading, setIsLoading] = useState(false);

    const [loadingButton, setLoadingButton] = useState(false);

    const { isShowing: isShowingDatasheetModal, toggle: datasheetModal } =
        useModal();
    const { isShowing: isShowingPreview, toggle: togglePreview } = useModal();
    useEffect(async () => {
        if (isShowing && selectedRow && selectedRow.rack_number) {
            setIsLoading(true);
            try {
                let result = await requestAPI(
                    getDetailedRackAPI(selectedRow.rack_number)
                );
                if (result.data && result.data.length > 0) {
                    result.data.map((el) => {
                        el["data_sheet_location"] = JSON.parse(
                            el["data_sheet_location"]
                        );
                        el["power_source_a"] = JSON.parse(el["power_source_a"]);
                        el["power_source_b"] = JSON.parse(el["power_source_b"]);
                    });

                    setSelectedRack((prev) => ({
                        ...prev,
                        ...result.data[0],
                    }));
                    let rack_access = result.data[0].rack_access
                        ? JSON.parse(result.data[0].rack_access)
                        : [];
                    if (rack_access.length > 0) {
                        let rack_access_key =
                            rack_access.filter(
                                (x) => x.access_type === "Key"
                            ) || [];
                        let rack_access_card =
                            rack_access.filter(
                                (x) => x.access_type === "Card"
                            ) || [];
                        let rack_access_biometric =
                            rack_access.filter(
                                (x) => x.access_type === "Biometric"
                            ) || [];
                        setAccess((prev) => ({
                            ...prev,
                            key: [...rack_access_key],
                            card: [...rack_access_card],
                            biometric: [...rack_access_biometric],
                        }));
                    }
                }
                setIsLoading(false);
            } catch (error) {
                toast.error("Failed to get detailed rack information");
                setIsLoading(false);
            }
        } else {
            setSelectedRack((prev) => ({
                ...prev,
                image_location: "",
                rack_number: "",
                floor_name: "",
                room_name: "",
                area_name: "",
                brand_name: "",
                commissioned_date: "",
                model_name: "",
                client_name: "",
                number_of_u: "",
                power_source_a: "",
                power_source_b: "",
                data_sheet_location: "",
            }));
            setAccess((prev) => ({ ...prev, key: [], card: [] }));
        }
    }, [isShowing]);

    return (
        <ModalContainer width='700px' isShowing={isShowing} hide={hide}>
            <div className='content-table-detail'>
                <LoadingData
                    size='100px'
                    isLoading={isLoading}
                    useAltBackground={false}
                />
                <div className='detail-top-side'>
                    <div className='info-details'>
                        <div className='rack-image'>
                            <img
                                src={
                                    !selectedRack.image_location
                                        ? ReturnHostBackend(
                                              process.env
                                                  .REACT_APP_BACKEND_NODELINX
                                          ) +
                                          "/filerepository/dcim/uploadFileFromAPI/rack_files/image/default.jpg"
                                        : ReturnHostBackend(
                                              process.env
                                                  .REACT_APP_BACKEND_NODELINX
                                          ) + selectedRack.image_location
                                }
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
                        <div className='first-column'>
                            <div className='flex-column'>
                                <p>Rack Number</p>
                                <span>{selectedRack.rack_number || "---"}</span>
                            </div>
                            <div className='info-icons'>
                                <Tooltip
                                    tooltip={
                                        <span className='icon-tooltip'>
                                            {"Data Sheet"}
                                        </span>
                                    }>
                                    <img
                                        className='icons datasheet-icon'
                                        src={DatasheetIcon}
                                        alt='rack-image'
                                        onClick={() => datasheetModal()}
                                    />
                                </Tooltip>
                            </div>
                        </div>
                        <div className='flex-column'>
                            <p>Location</p>
                            <div className='flex-row'>
                                <p>
                                    Floor{" "}
                                    <span>
                                        {selectedRack.floor_name || "---"}
                                    </span>
                                </p>
                                <p>
                                    Room{" "}
                                    <span>
                                        {selectedRack.room_name || "---"}
                                    </span>
                                </p>
                                <p>
                                    Area{" "}
                                    <span>
                                        {selectedRack.area_name || "----"}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className='flex-column'>
                            <p>Brand</p>
                            <span>{selectedRack.brand_name || "---"}</span>
                        </div>
                        <div className='flex-column'>
                            <p>Commisioned Date</p>
                            <span>
                                {selectedRack.commissioned_date || "---"}
                            </span>
                        </div>
                        <div className='flex-column'>
                            <p>Model Number</p>
                            <span>{selectedRack.model_name || "---"}</span>
                        </div>
                        <div className='flex-column'>
                            <p>Client</p>
                            <span>{selectedRack.client_name || "---"}</span>
                        </div>
                        <div className='flex-column'>
                            <p>Number of U</p>
                            <span>{selectedRack.number_of_u || "---"}</span>
                        </div>
                    </div>
                </div>
                <div className='detail-bottom-side'>
                    <div className='info-details'>
                        <div className='flex-column'>
                            <p>Power Source</p>
                            <div className='flex-row'>
                                <p>Power Source A: </p>
                                {selectedRack.power_source_a.length > 0 ? (
                                    <div className='power-source'>
                                        {selectedRack.power_source_a.map(
                                            (el, index) => (
                                                <span>{el}</span>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <span>---</span>
                                )}
                            </div>
                            <div className='flex-row'>
                                <p>Power Source B:</p>
                                {selectedRack.power_source_b.length > 0 ? (
                                    <div className='power-source'>
                                        {selectedRack.power_source_b.map(
                                            (el, index) => (
                                                <span>{el}</span>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <span>---</span>
                                )}
                            </div>
                        </div>
                        {access.key.length > 0 ||
                        access.card.length > 0 ||
                        access.biometric.length > 0 ? (
                            <div className='flex-column'>
                                <p>Access</p>
                                {access.key.map((a, i) => (
                                    <div className='flex-row'>
                                        <p>
                                            Access {a.access_type} {i + 1}:
                                        </p>
                                        <span>{a.access_name}</span>
                                    </div>
                                ))}
                                {access.card.map((a, i) => (
                                    <div className='flex-row'>
                                        <p>
                                            Access {a.access_type} {i + 1}:
                                        </p>
                                        <span>{a.access_name}</span>
                                    </div>
                                ))}
                                {access.biometric.map((a, i) => (
                                    <div className='flex-row'>
                                        <p>
                                            Access {a.access_type} {i + 1}:
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
                    level={2}
                    file={
                        selectedRack.data_sheet_location || []
                        // ? process.env.REACT_APP_BACKEND_NODELINX +
                        //   selectedRack.data_sheet_location
                        // : null
                    }
                />
                <PreviewImage
                    src={
                        ReturnHostBackend(
                            process.env.REACT_APP_BACKEND_NODELINX
                        ) + selectedRack.image_location
                    }
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = SVG_blank_image;
                    }}
                    isShowing={isShowingPreview}
                    level={2}
                    hide={togglePreview}
                />
            </div>
        </ModalContainer>
    );
};

export default ModalRackDataDetail;
