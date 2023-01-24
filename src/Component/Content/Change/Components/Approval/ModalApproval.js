import React, { useState, useEffect } from "react";
import {
    ModalContainer,
    TableDCIM,
    InputTextAutoSuggestHorizontal,
} from "../../../../ComponentReuseable";
import { LoadingData } from "../../../../ComponentReuseable";
import { requestAPI } from "../Utils/changeUtils";
import {
    getDetailedRequestAPI,
    getCurrentRackParametersAPI,
} from "../ChangeAPI";
import { toast } from "react-toastify";
import { timestampWithoutDayParse } from "../../../../ComponentReuseable/Functions";
import { formatDate } from "../Record";
const ModalApproval = ({ isShowing, hide, detailedRequest, status }) => {
    const itemChangesTableHeader = {
        no: "No",
        change: "Change",
        item_no: "Item #",
        item_name: "Item Name",
        change_to: "Change To",
    };
    const itemChangesTableBody = new Array(3).fill({}).map((item, index) => {
        return {
            no: index + 1,
            change: "Install",
            item_no: "SV2-001",
            item_name: "Rack Server",
            change_to: "U#02 - U#04",
        };
    });
    const [itemRequest, setItemRequest] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentRackParameters, setCurrentRackParameters] = useState({});
    const [changeTo, setChangeTo] = useState({});

    useEffect(async () => {
        setItemRequest([]);
        if (isShowing) {
            try {
                setIsLoading(true);
                let result = await requestAPI(
                    getDetailedRequestAPI(
                        detailedRequest.type,
                        detailedRequest.request_timestamp,
                        detailedRequest.requester_username
                    )
                );
                if (detailedRequest.type === "item") {
                    result.data.length > 0 &&
                        result.data.map((item) => {
                            let parameter = JSON.parse(item.parameter);
                            let item_number =
                                parameter.find((x) => x["Item Number"]) &&
                                parameter.find((x) => x["Item Number"])[
                                    "Item Number"
                                ];
                            let item_name =
                                parameter.find((x) => x["Item Name"]) &&
                                parameter.find((x) => x["Item Name"])[
                                    "Item Name"
                                ];
                            let change_to_message =
                                parameter.find((x) => x["Change To"]) &&
                                parameter.find((x) => x["Change To"])[
                                    "Change To"
                                ];
                            setItemRequest((prev) => [
                                ...prev,
                                {
                                    change_type: item.change_type,
                                    item_number: item_number,
                                    item_name: item_name,
                                    change_to: change_to_message,
                                },
                            ]);
                        });
                } else {
                    // if (status === "in_progress") {
                    let changeTo = JSON.parse(result.data[0].change_to);

                    if (detailedRequest.change_type === "Power Source") {
                        setChangeTo((prev) => ({
                            ...prev,
                            power_source: changeTo,
                        }));
                    } else if (detailedRequest.change_type === "Client") {
                        setChangeTo((prev) => ({
                            ...prev,
                            client: changeTo.client,
                        }));
                    } else if (detailedRequest.change_type === "Access") {
                        setChangeTo((prev) => ({
                            ...prev,
                            access: changeTo,
                        }));
                    }
                    // }
                }
                setIsLoading(false);
            } catch (error) {
                toast.error(error.toString());
                setIsLoading(false);
            }
        }
    }, [isShowing]);
    // get Current Rack Paramters
    useEffect(async () => {
        if (detailedRequest.rack_id) {
            try {
                let result = await requestAPI(
                    getCurrentRackParametersAPI(detailedRequest.rack_id)
                );
                if (result.data && result.data.length > 0) {
                    let rack_access = result.data[0].rack_access
                        ? JSON.parse(result.data[0].rack_access)
                        : [];
                    result.data[0].rack_access = rack_access;
                    if (rack_access.length > 0) {
                        let rack_access_key = rack_access.filter(
                            (access) => access.access_type === "Key"
                        );
                        // Assign Index
                        rack_access_key.map((el, index) => {
                            el.index = index + 1;
                        });
                        let rack_access_card = rack_access.filter(
                            (access) => access.access === "Card"
                        );
                        rack_access_card.map((el, index) => {
                            el.index = index + 1;
                        });
                        result.data[0].rack_access = [
                            ...rack_access_key,
                            ...rack_access_card,
                        ];
                    }
                }
                setCurrentRackParameters(result.data[0]);
                // console.log(result.data[0]);
            } catch (error) {
                toast.error(error.toString());
            }
        }
    }, [detailedRequest.rack_id]);

    // useEffect(async () => {
    //     // if (status === "in_progress") {
    //     if (detailedRequest.change_type === "Power Source") {
    //         let parsedChangeTo = JSON.parse(detailedRequest.json_change_to);
    //         setChangeTo((prev) => ({
    //             ...prev,
    //             power_source: parsedChangeTo,
    //         }));
    //     } else if (detailedRequest.change_type === "Client") {
    //         let parsedChangeTo = JSON.parse(detailedRequest.json_change_to);
    //         setChangeTo((prev) => ({
    //             ...prev,
    //             client: parsedChangeTo.client,
    //         }));
    //     }
    //     // }
    // }, [detailedRequest.json_change_to]);

    return (
        <ModalContainer
            width='900px'
            title={`${
                detailedRequest.type.charAt(0).toUpperCase() +
                detailedRequest.type.slice(1)
            } Change Request`}
            isShowing={isShowing}
            hide={hide}>
            <div className='modal-approval-container'>
                <div className='modal-approval-parameter-container'>
                    <div className='parameter'>
                        <div className='left'>Floor</div>
                        <div className='right'>
                            <span>:</span>
                            <div>{detailedRequest.floor_name || "---"}</div>
                        </div>
                    </div>
                    <div className='parameter'>
                        <div className='left'>Rack Number</div>
                        <div className='right'>
                            <span>:</span>
                            <div>{detailedRequest.rack_number || "---"}</div>
                        </div>
                    </div>
                </div>
                <div className='modal-approval-parameter-container'>
                    <div className='parameter'>
                        <div className='left'>Room</div>
                        <div className='right'>
                            <span>:</span>
                            <div>{detailedRequest.room_name || "---"}</div>
                        </div>
                    </div>
                    <div className='parameter'>
                        <div className='left'>Client</div>
                        <div className='right'>
                            <span>:</span>
                            <div>{detailedRequest.client_name || "---"}</div>
                        </div>
                    </div>
                </div>
                <div className='modal-approval-parameter-container'>
                    <div className='parameter'>
                        <div className='left'>Requested By</div>
                        <div className='right'>
                            <span>:</span>
                            <div>
                                {detailedRequest.requester_username || "---"}
                            </div>
                        </div>
                    </div>
                    {status === "in_progress" && (
                        <div className='parameter'>
                            <div className='left'>Approved by</div>
                            <div className='right'>
                                <span>:</span>
                                <div>
                                    {detailedRequest.approved_by || "---"}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className='modal-approval-parameter-container'>
                    <div className='parameter'>
                        <div className='left'>Request Timestamp</div>
                        <div className='right'>
                            <span>:</span>
                            <div>
                                {timestampWithoutDayParse(
                                    detailedRequest.request_timestamp
                                ) || "---"}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='modal-approval-parameter-container'>
                    <div className='parameter'>
                        <div className='left'>Change</div>
                        <div className='right'>
                            <span>:</span>
                            <div>{detailedRequest.change_type || "---"}</div>
                        </div>
                    </div>
                    {detailedRequest.type === "item" && (
                        <div className='parameter'>
                            <div className='left'>Total Change Request</div>
                            <div className='right'>
                                <span>:</span>
                                <div>{itemRequest.length || "---"}</div>
                            </div>
                        </div>
                    )}
                </div>
                {detailedRequest.type === "rack" && (
                    <div className='modal-approval-item-center'>
                        <LoadingData isLoading={isLoading} />
                        <div className='modal-approval-item-container'>
                            <div className='request-rack-content-container'>
                                <span>From</span>
                                <div className='request-rack-content-box'>
                                    {detailedRequest.change_type ===
                                        "Client" && (
                                        <span>
                                            {currentRackParameters.client_name}
                                        </span>
                                    )}
                                    {detailedRequest.change_type ===
                                        "Power Source" &&
                                        !isLoading && (
                                            <>
                                                <span>
                                                    Power Source A :{" "}
                                                    {
                                                        currentRackParameters.power_source_a
                                                    }
                                                </span>
                                                <span>
                                                    Power Source B :{" "}
                                                    {
                                                        currentRackParameters.power_source_b
                                                    }
                                                </span>
                                            </>
                                        )}
                                    {detailedRequest.change_type === "Access" &&
                                        !isLoading &&
                                        currentRackParameters.rack_access &&
                                        currentRackParameters.rack_access.map(
                                            (el) => (
                                                <span>
                                                    Access {el.access_type}{" "}
                                                    {el.index} :{" "}
                                                    {el.access_name}
                                                </span>
                                            )
                                        )}
                                </div>
                            </div>
                            <div className='request-rack-content-container'>
                                <span>To</span>
                                <div className='request-rack-content-box'>
                                    <div className='request-input-container'>
                                        {detailedRequest.change_type ===
                                            "Power Source" && (
                                            <>
                                                <div className='access'>
                                                    <div className='access-input'>
                                                        <span
                                                            style={{
                                                                width: "140px",
                                                            }}>
                                                            Power Source A
                                                        </span>
                                                        <input
                                                            style={{
                                                                width: "180px",
                                                            }}
                                                            type='text'
                                                            value={
                                                                changeTo.power_source &&
                                                                changeTo
                                                                    .power_source
                                                                    .power_source_a
                                                            }
                                                            disabled={
                                                                true
                                                            }></input>
                                                    </div>
                                                </div>
                                                <div className='access'>
                                                    <div className='access-input'>
                                                        <span
                                                            style={{
                                                                width: "140px",
                                                            }}>
                                                            Power Source B
                                                        </span>
                                                        <input
                                                            style={{
                                                                width: "180px",
                                                            }}
                                                            value={
                                                                changeTo.power_source &&
                                                                changeTo
                                                                    .power_source
                                                                    .power_source_b
                                                            }
                                                            type='text'
                                                            disabled={
                                                                true
                                                            }></input>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {detailedRequest.change_type ===
                                            "Client" && (
                                            <InputTextAutoSuggestHorizontal
                                                name='client'
                                                label=''
                                                options={[]}
                                                labelWidth={"0%"}
                                                inputWidth={"95%"}
                                                value={changeTo.client}
                                                isDisabled={true}
                                            />
                                        )}
                                        {detailedRequest.change_type ===
                                            "Access" &&
                                            changeTo.access &&
                                            changeTo.access.length > 0 &&
                                            changeTo.access.map((el) => (
                                                <div className='access'>
                                                    <div className='access-input'>
                                                        <span
                                                            style={{
                                                                width: "150px",
                                                            }}>
                                                            Access{" "}
                                                            {
                                                                el.rack_access_type_name
                                                            }{" "}
                                                            {el.index + 1}
                                                        </span>
                                                        <span
                                                            style={{
                                                                width: "10px",
                                                            }}>
                                                            :
                                                        </span>
                                                        <input
                                                            style={{
                                                                width: "150px",
                                                            }}
                                                            type='text'
                                                            value={
                                                                el.rack_access_name
                                                            }
                                                            disabled={true}
                                                            readOnly></input>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {detailedRequest.type === "item" && (
                    <div
                        className='modal-approval-table'
                        style={{ position: "relative" }}>
                        <LoadingData isLoading={isLoading} />
                        <TableDCIM
                            header={itemChangesTableHeader}
                            body={
                                itemRequest.length > 0 &&
                                itemRequest.map((item, index) => ({
                                    no: index + 1,
                                    change: item.change_type,
                                    item_no: item.item_number,
                                    item_name: item.item_name,
                                    change_to: item.change_to,
                                }))
                            }
                            actions={[]}
                            selectable={false}
                            onSelect={(e, index) => {}}
                            customCellClassNames={{}}
                        />
                    </div>
                )}
            </div>
        </ModalContainer>
    );
};

export default ModalApproval;
