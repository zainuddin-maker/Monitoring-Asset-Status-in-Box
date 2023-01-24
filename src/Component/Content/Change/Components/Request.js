import react, { useState, useEffect } from "react";
import {
    InputDropdownVertical,
    ButtonSubmit,
    ButtonClear,
    TableDCIM,
    useModal,
    InputTextAutoSuggestVertical,
    InputDropdownCreatableVertical,
    PushNotification,
} from "../../../ComponentReuseable";
import ModalAddRequest from "./Request/ModalAddRequest";
import ModalAddAccess from "./Request/ModalAddAccess.";
import IconDeleteAccess from "../../../../svg/delete_access.svg";
import { requestAPI } from "./Utils/changeUtils";
import {
    getFloorsAPI,
    getRoomsByFloorAPI,
    getRackNumbersByRoomAPI,
    addItemRequests,
    getChangeTypesAPI,
    getCurrentRackParametersAPI,
    getRackAccessTypesNamesAPI,
    getClientsAPI,
    getPowerSourcesAPI,
    addRackRequest,
    createClientAPI,
    deleteClientAPI,
    getUACNotifChangeAPI,
} from "./ChangeAPI";
import { toast } from "react-toastify";
import { getUserDetails } from "../../../TokenParse/TokenParse";
import IconTrashBin from "../../../../svg/icon_trashbin.svg";
import { getUAC } from "../../../ComponentReuseable";
import { InvalidInput } from "./InvalidInput";

const Request = () => {
    const [loadingButton, setLoadingButton] = useState(false);

    const [isLoadingDropdownCreateable, setIsLoadingDropdownCreateable] =
        useState(false);
    const { isShowing, toggle } = useModal();
    const { isShowing: isShowingAddAccess, toggle: toggleAddAccess } =
        useModal();
    const [inputData, setInputData] = useState({
        floor: "",
        room: "",
        rack_no: "",
        rack_id: "",
        requested_by: "",
        change: "",
        requester_username: "",
        number_of_u: "",
        u_position: [],
        u_needed: [],
        is_full: [],
        is_left: [],
    });
    const [currentRackParameters, setCurrentRackParameters] = useState({
        client_name: "",
        power_source_a: "",
        power_source_b: "",
        rack_access: [],
    });
    const requestMenu = {
        item: "Item",
        rack: "Rack",
    };
    const [menu, setMenu] = useState(requestMenu.item);
    const [inputOptions, setInputOptions] = useState({
        floor: [],
        room: [],
        rack_no: [],
        change: [],
    });
    const [isLoadingFilter, setIsLoadingFilter] = useState({
        floor: false,
        room: false,
        rack_no: false,
        change: false,
    });
    const [rackInputOptions, setRackInputOptions] = useState({
        access_type: [],
        access_names: [],
        power_source_a: [],
        power_source_b: [],
        client: [],
    });
    const [rackChangeTo, setRackChangeTo] = useState({
        client: "",
        power_source_a: "",
        power_source_b: "",
        rack_access: [],
    });

    const [itemChangeRequests, setItemChangeRequests] = useState([]);
    const [userGroupNotif, setUserGroupNotif] = useState([]);

    const requestTableHeader = {
        no: "No",
        change: "Change",
        item_no: "Item #",
        item_name: "Item Name",
        change_to: "Change to",
    };
    const requestTableBody = new Array(2).fill({}).map((item, index) => {
        return {
            no: index + 1,
            change: "Change",
            item_no: "SV2-001",
            item_name: "Rack Server",
            change_to: "U#02 - U#04",
        };
    });
    const handleChange = (e) => {
        let { name, value } = e.target;

        setInputData((prev) => {
            prev[name] = value;
            return { ...prev };
        });
    };
    const actions = [
        {
            iconSrc: IconTrashBin,
            onClick: (selectedItem, index) => {
                setItemChangeRequests((prev) => {
                    let filteredList = prev.filter(
                        (request, indexRequest) => indexRequest !== index
                    );
                    return [...filteredList];
                });
            },
        },
    ];

    const handleClear = () => {
        setInputData((prev) => ({
            ...prev,
            floor: "",
            room: "",
            rack_no: "",
            change: "",
        }));
        if (menu === requestMenu.item) {
            setItemChangeRequests((prev) => [...[]]);
        } else {
            setRackChangeTo((prev) => ({
                ...prev,
                client: "",
                power_source_a: "",
                power_source_b: "",
                rack_access: [],
            }));
        }
    };

    const pushRequestNotification = async (type) => {
        try {
            const message =
                "New " +
                type.charAt(0).toUpperCase() +
                type.slice(1) +
                " Change Request";
            const is_general = false;
            const user_group_name = userGroupNotif.user_group_name
                ? userGroupNotif.user_group_name
                : [];
            const notification_category_name = "change";
            const notification_sub_category_name = type;
            const result = await PushNotification(
                message,
                is_general,
                user_group_name,
                notification_category_name,
                notification_sub_category_name,
                "operation/rack_and_server_management/change/approval"
            );
        } catch (error) {
            toast.error("Failed to push notification message");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // let find_rack_number = inputOptions.rack_no.find(
        //     (rack) => rack.id.toString() === inputData.rack_no
        // );
        // let rack_number = find_rack_number ? find_rack_number.name : "";
        let rack_number = inputData.rack_no;
        if (menu === requestMenu.item) {
            if (itemChangeRequests.length > 0) {
                setLoadingButton(true);
                try {
                    let result = await requestAPI(
                        addItemRequests(
                            rack_number,
                            inputData.rack_id,
                            inputData.requester_username,
                            itemChangeRequests
                        )
                    );
                    toast.success("Success");
                    handleClear();

                    // Push Notification
                    pushRequestNotification(menu);
                    setLoadingButton(false);
                } catch (error) {
                    toast.error(error.toString());
                    setLoadingButton(false);
                }
            } else {
                toast.warning(
                    "Empty request. Please fill in the item change requests"
                );
            }
        } else {
            let change_to = {};
            let isValid = false;
            if (inputData.change === "Client") {
                change_to = {
                    client: rackChangeTo.client,
                    client_before: currentRackParameters.client_name
                        ? currentRackParameters.client_name
                        : "undefined",
                };
                isValid = rackChangeTo.client ? true : false;
            } else if (inputData.change === "Power Source") {
                change_to = {
                    power_source_a: rackChangeTo.power_source_a,
                    power_source_b: rackChangeTo.power_source_b,
                };
            } else if (inputData.change === "Access") {
                change_to = rackChangeTo.rack_access;
                isValid = rackChangeTo.rack_access.length > 0 ? true : false;
            }
            if (isValid) {
                setLoadingButton(true);
                try {
                    let result = await requestAPI(
                        addRackRequest(
                            rack_number,
                            inputData.change,
                            inputData.requester_username,
                            change_to,
                            inputData.rack_id
                        )
                    );
                    toast.success("Success");

                    handleClear();
                    pushRequestNotification(menu);
                    setLoadingButton(false);
                } catch (error) {
                    toast.error(error.toString());
                    setLoadingButton(false);
                }
            } else {
                toast.warning(
                    "Empty request. Please fill in the rack change requests"
                );
            }
        }
    };

    useEffect(async () => {
        setInputData((prev) => ({
            ...prev,
            requester_username: getUserDetails().fullname,
        }));
        try {
            setIsLoadingFilter((prev) => ({ ...prev, floor: true }));
            let result = await requestAPI(getFloorsAPI);
            setInputOptions((prev) => ({
                ...prev,
                floor: result.data.map((value) => ({
                    id: value.floor_id,
                    name: value.floor_name,
                })),
            }));
            setInputData((prev) => ({
                ...prev,
                room: "",
                rack_no: "",
            }));
            setIsLoadingFilter((prev) => ({ ...prev, floor: false }));
        } catch (error) {
            toast.error("Failed to fetch list of floors");
            setIsLoadingFilter((prev) => ({ ...prev, floor: false }));
        }
    }, []);

    useEffect(async () => {
        if (inputData.floor) {
            try {
                setIsLoadingFilter((prev) => ({ ...prev, room: true }));
                let result = await requestAPI(
                    getRoomsByFloorAPI(inputData.floor)
                );
                setInputOptions((prev) => ({
                    ...prev,
                    room: result.data.map((value) => ({
                        id: value.room_id,
                        name: value.room_name,
                    })),
                }));
                let tempFloors = result.data.map((value) => ({
                    id: value.room_id,
                    name: value.room_name,
                }));

                if (inputData.rack_no) {
                    let find = inputOptions.rack_no.find(
                        (el) => el.name === inputData.rack_no
                    );
                    let findRoom = tempFloors.find(
                        (room) => room.name === find.room_name
                    );
                    setInputData((prev) => ({
                        ...prev,
                        room: findRoom ? findRoom.id : "",
                    }));
                }
                setIsLoadingFilter((prev) => ({ ...prev, room: false }));
            } catch (error) {
                toast.error("Failed to fetch list of rooms");
                setIsLoadingFilter((prev) => ({ ...prev, room: false }));
            }
        } else {
            setInputOptions((prev) => ({
                ...prev,
                room: [],
                rack_no: [],
            }));
            setInputData((prev) => ({
                ...prev,
                rack_no: "",
                room: "",
            }));
        }
    }, [inputData.floor]);

    useEffect(async () => {
        // if (inputData.floor && inputData.room) {
        let findFloor = inputOptions.floor.find(
            (floor) => floor.id.toString() === inputData.floor.toString()
        );
        let findRoom = inputOptions.room.find(
            (room) => room.id.toString() === inputData.room.toString()
        );
        let floorName = findFloor ? findFloor.name : "";
        let roomName = findRoom ? findRoom.name : "";

        try {
            setIsLoadingFilter((prev) => ({ ...prev, rack_no: true }));
            let result = await requestAPI(
                getRackNumbersByRoomAPI(floorName, roomName)
            );
            setInputOptions((prev) => ({
                ...prev,
                rack_no: result.data.map((value) => ({
                    id: value.rack_id,
                    name: value.rack_number,
                    number_of_u: value.number_of_u,
                    u_position: JSON.parse(value.u_position),
                    u_needed: JSON.parse(value.u_needed),
                    is_full: JSON.parse(value.is_full),
                    is_left: JSON.parse(value.is_left),
                    floor_name: value.floor_name,
                    room_name: value.room_name,
                })),
            }));

            setIsLoadingFilter((prev) => ({ ...prev, rack_no: false }));
        } catch (error) {
            toast.error("Failed to fetch list of racks");
            setIsLoadingFilter((prev) => ({ ...prev, rack_no: false }));
        }
        // }
    }, [inputData.floor, inputData.room]);

    useEffect(async () => {
        if (menu === requestMenu.rack) {
            try {
                let result = await requestAPI(
                    getChangeTypesAPI(menu.toLowerCase())
                );
                setInputOptions((prev) => ({ ...prev, change: result }));
            } catch (error) {
                toast.error(error.toString());
            }
        }
    }, [menu]);

    useEffect(async () => {
        setCurrentRackParameters({
            client_name: "",
            power_source_a: "",
            power_source_b: "",
            rack_access: [],
        });
        if (inputData.rack_id) {
            try {
                let result = await requestAPI(
                    getCurrentRackParametersAPI(inputData.rack_id)
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
            } catch (error) {
                toast.error("Failed to fetch current rack parameters");
            }
        }
    }, [inputData.rack_id]);

    useEffect(async () => {
        if (inputData.change) {
            if (inputData.change === "Access") {
                try {
                    let result = await requestAPI(getRackAccessTypesNamesAPI());
                    if (result.length > 1) {
                        setRackInputOptions((prev) => ({
                            ...prev,
                            access_type:
                                result[0].data.length > 0 &&
                                result[0].data.map((el) => ({
                                    id: el.rack_access_type_id,
                                    name: el.rack_access_type_name,
                                })),
                            access_names:
                                result[1].data.length > 0 &&
                                result[1].data.map((el) => ({
                                    id: el.rack_access_name_id,
                                    name: el.rack_access_name_name,
                                })),
                        }));
                    }
                } catch (error) {
                    toast.error("Failed get rack access types and names");
                }
            }
            if (inputData.change === "Power Source") {
                try {
                    let result = await requestAPI(getPowerSourcesAPI());
                    if (result.data.length > 0) {
                        let powerSourceA = result.data.filter(
                            (el) => el.power_source_type === "A"
                        );
                        let powerSourceB = result.data.filter(
                            (el) => el.power_source_type === "B"
                        );
                        setRackInputOptions((prev) => ({
                            ...prev,
                            power_source_a: powerSourceA,
                            power_source_b: powerSourceB,
                        }));
                    }
                } catch (error) {
                    toast.error("Failed get power sources");
                }
            }
            if (inputData.change === "Client") {
                try {
                    let result = await requestAPI(getClientsAPI());
                    setRackInputOptions((prev) => ({
                        ...prev,
                        client: result.data,
                    }));
                } catch (error) {
                    toast.error("Failed get clients");
                }
            }
        }
    }, [inputData.change]);

    const handleRackChangeTo = (e) => {
        let { name, value } = e.target;

        setRackChangeTo((prev) => {
            prev[name] = value;
            return { ...prev };
        });
    };
    const deleteAccess = (index) => {
        // console.log(rackChangeTo.rack_access[index]);
        let filtered_rack_access = rackChangeTo.rack_access.map(
            (el, indexRack) => {
                if (
                    el.rack_access_type_name ===
                        rackChangeTo.rack_access[index].rack_access_type_name &&
                    indexRack > index
                ) {
                    el.index = el.index - 1;
                }
                return el;
            }
        );

        filtered_rack_access = filtered_rack_access.filter(
            (val, indexRack) => indexRack !== index
        );

        setRackChangeTo((prev) => {
            prev.rack_access = [...filtered_rack_access];
            return { ...prev };
        });
    };

    const handleCreateClient = async (client) => {
        setIsLoadingDropdownCreateable(true);
        try {
            let result = await requestAPI(createClientAPI(client));
            setRackInputOptions((prev) => {
                prev.client = [
                    ...prev.client,
                    {
                        client_name: client,
                    },
                ];
                return { ...prev };
            });
            setRackChangeTo((prev) => {
                prev["client"] = client;
                return {
                    ...prev,
                };
            });
            setIsLoadingDropdownCreateable(false);
        } catch (error) {
            toast.error("Failed to create new client");
            setIsLoadingDropdownCreateable(false);
        }
    };

    const handleDeleteClient = async (client) => {
        setIsLoadingDropdownCreateable(true);
        try {
            let result = await requestAPI(deleteClientAPI(client));
            setRackInputOptions((prev) => {
                prev.client = prev.client.filter(
                    (client_) => client_.client_name !== client
                );

                return { ...prev };
            });
            setRackChangeTo((prev) => {
                prev["client"] =
                    prev["client"] === client ? "" : prev["client"];
                return {
                    ...prev,
                };
            });
            setIsLoadingDropdownCreateable(false);
        } catch (error) {
            toast.error("Failed to delete client");
            setIsLoadingDropdownCreateable(false);
        }
    };

    const validateInput = (e) => {
        if (e.target.name === "rack_no") {
            let find = inputOptions.rack_no.find(
                (el) => el.name === e.target.value
            );

            if (find) {
                let findFloor = inputOptions.floor.find(
                    (floor) => floor.name === find.floor_name
                );

                setInputData((prev) => ({
                    ...prev,
                    rack_id: find.id,
                    number_of_u: find.number_of_u,
                    u_position: find.u_position,
                    u_needed: find.u_needed,
                    is_full: find.is_full,
                    is_left: find.is_left,
                    floor: findFloor ? findFloor.id : "",
                }));
            } else {
                setInputData((prev) => ({
                    ...prev,
                    rack_no: "",
                    rack_id: "",
                    number_of_u: "",
                    u_position: [],
                    u_needed: [],
                    is_full: [],
                    is_left: [],
                }));
                if (e.target.value !== "") {
                    toast.error(InvalidInput.rack_no);
                }
            }
        }
    };
    // UAC Get Notif
    useEffect(() => {
        (async () => {
            try {
                let result = await requestAPI(getUACNotifChangeAPI());
                if (result.request) {
                    setUserGroupNotif(result.request);
                }
            } catch (error) {
                toast.error("Failed to get change notification user group");
            }
        })();
    }, []);

    return (
        <div className='change-request-container'>
            <ModalAddRequest
                isShowing={isShowing}
                hide={toggle}
                setItemChangeRequests={setItemChangeRequests}
                request_type={menu.toLowerCase()}
                rack_id={inputData.rack_id}
                number_of_u={inputData.number_of_u}
                u_needed={inputData.u_needed}
                u_position={inputData.u_position}
                rack_no={inputData.rack_no}
                is_full={inputData.is_full}
                is_left={inputData.is_left}
            />
            <ModalAddAccess
                isShowing={isShowingAddAccess}
                hide={toggleAddAccess}
                setRackChangeTo={setRackChangeTo}
                accessTypeOptions={rackInputOptions.access_type}
                accessNameOptions={rackInputOptions.access_names}
                setRackInputOptions={setRackInputOptions}
            />
            <div className='request-form-container'>
                <div className='request-form-container__header'>
                    <div>Input Change Request</div>
                </div>
                <form
                    id='input-request'
                    onSubmit={(e) => getUAC("add") && handleSubmit(e)}
                    onKeyPress={(e) => {
                        e.key === "Enter" && e.preventDefault();
                    }}
                    className='request-form-container__body'>
                    <div className='request-form-menu'>
                        {Object.keys(requestMenu).map((key) => (
                            <span
                                key={key}
                                onClick={() => setMenu(requestMenu[key])}
                                id={requestMenu[key] === menu && "active"}>
                                {requestMenu[key]}
                            </span>
                        ))}
                    </div>

                    <div className='request-form-filter'>
                        <InputDropdownVertical
                            width='100px'
                            name='floor'
                            label='Floor'
                            value={inputData.floor}
                            options={inputOptions.floor}
                            onChange={handleChange}
                            isRequired={true}
                            isDisabled={
                                menu === requestMenu.item
                                    ? itemChangeRequests.length > 0
                                        ? true
                                        : false
                                    : false
                            }
                            isLoading={isLoadingFilter.floor}
                        />
                        <InputDropdownVertical
                            width='100px'
                            name='room'
                            label='Room'
                            value={inputData.room}
                            options={inputOptions.room}
                            onChange={handleChange}
                            isRequired={true}
                            isDisabled={
                                !inputData.floor
                                    ? true
                                    : menu === requestMenu.item
                                    ? itemChangeRequests.length > 0
                                        ? true
                                        : false
                                    : false

                                // : false
                            }
                            isLoading={isLoadingFilter.room}
                        />
                        {/* <InputDropdownVertical
                            width='120px'
                            name='rack_no'
                            label='Rack Number'
                            value={inputData.rack_no}
                            options={inputOptions.rack_no}
                            onChange={handleChange}
                            isDisabled={
                                !inputData.floor ||
                                !inputData.room ||
                                menu === requestMenu.item
                                    ? itemChangeRequests.length > 0
                                        ? true
                                        : false
                                    : false
                            }
                        /> */}
                        <InputTextAutoSuggestVertical
                            name='rack_no'
                            label='Rack Number'
                            value={inputData.rack_no}
                            options={inputOptions.rack_no.map((el) => el.name)}
                            onChange={handleChange}
                            isRequired={true}
                            validateInput={(e) => validateInput(e)}
                            width='200px'
                            onClear={() =>
                                setInputData((prev) => ({
                                    ...prev,
                                    rack_no: "",
                                    rack_id: "",
                                }))
                            }
                            isDisabled={
                                !inputData.floor ||
                                !inputData.room ||
                                menu === requestMenu.item
                                    ? itemChangeRequests.length > 0
                                        ? true
                                        : false
                                    : false
                            }
                            isLoading={isLoadingFilter.rack_no}
                        />
                        {menu === requestMenu.rack && (
                            <InputDropdownVertical
                                width='120px'
                                name='change'
                                label='Change'
                                value={inputData.change}
                                options={inputOptions.change}
                                onChange={handleChange}
                                isRequired={true}
                                // isDisabled={inputData.rack_no}
                            />
                        )}
                        <div className='requested_by'>
                            <label>Request By</label>
                            <div>{inputData.requester_username}</div>
                        </div>
                    </div>

                    {menu === requestMenu.item && (
                        <>
                            <div className='request-form-table'>
                                <TableDCIM
                                    header={requestTableHeader}
                                    body={
                                        itemChangeRequests.length > 0 &&
                                        itemChangeRequests.map(
                                            (request, index) => {
                                                return {
                                                    no: index + 1,
                                                    change: request.change_type,
                                                    item_no:
                                                        request.item_number,
                                                    item_name:
                                                        request.item_name,
                                                    change_to:
                                                        request.change_to_message,
                                                };
                                            }
                                        )
                                    }
                                    actions={actions}
                                    selectable={false}
                                    customCellClassNames={{}}
                                />
                            </div>
                            <span
                                className='add-request'
                                onClick={() =>
                                    getUAC("add") && inputData.rack_no
                                        ? toggle()
                                        : toast.warning(
                                              "Please fill in the rack number first"
                                          )
                                }
                                // style={{
                                //     visibility: inputData.rack_no
                                //         ? "visible"
                                //         : "hidden",
                                // }}
                            >
                                +Add Request
                            </span>
                        </>
                    )}
                    {menu === requestMenu.rack && (
                        <div className='request-rack-container'>
                            <div className='request-rack-content-container'>
                                <span>From</span>
                                <div className='request-rack-content-box'>
                                    {inputData.change === "Access" &&
                                        currentRackParameters.rack_access
                                            .length > 0 &&
                                        currentRackParameters.rack_access.map(
                                            (access) => (
                                                <span>
                                                    Access {access.access_type}{" "}
                                                    {access.index} :{" "}
                                                    {access.access_name}
                                                </span>
                                            )
                                        )}
                                    {inputData.change === "Power Source" && (
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
                                    {inputData.change === "Client" && (
                                        <span>
                                            {currentRackParameters.client_name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className='request-rack-content-container'>
                                <span>To</span>
                                <div className='request-rack-content-box'>
                                    <div className='request-input-container'>
                                        {inputData.change === "Client" && (
                                            <InputDropdownCreatableVertical
                                                name='client'
                                                value={{
                                                    value: rackChangeTo.client,
                                                    label: rackChangeTo.client,
                                                }}
                                                options={
                                                    rackInputOptions.client
                                                        .length > 0 &&
                                                    rackInputOptions.client.map(
                                                        (el) => ({
                                                            value: el.client_name,
                                                            label: el.client_name,
                                                        })
                                                    )
                                                }
                                                onSelect={(selectedOption) => {
                                                    if (
                                                        rackChangeTo.client !==
                                                        selectedOption.value
                                                    ) {
                                                        setRackChangeTo(
                                                            (prev) => {
                                                                prev["client"] =
                                                                    selectedOption.value;
                                                                return {
                                                                    ...prev,
                                                                };
                                                            }
                                                        );
                                                    }
                                                }}
                                                onCreateOption={(
                                                    createdItem
                                                ) => {
                                                    //console.log(createdItem); // client
                                                    handleCreateClient(
                                                        createdItem
                                                    );
                                                }}
                                                onDeleteOption={(
                                                    deletedItem
                                                ) => {
                                                    //console.log(deletedItem); // {value:,label:}
                                                    handleDeleteClient(
                                                        deletedItem.value || ""
                                                    );
                                                }}
                                                isLoading={
                                                    isLoadingDropdownCreateable
                                                }
                                            />
                                        )}
                                        {inputData.change === "Access" && (
                                            <>
                                                {rackChangeTo.rack_access
                                                    .length > 0 &&
                                                    rackChangeTo.rack_access.map(
                                                        (el, index) => (
                                                            <div className='access'>
                                                                <div className='access-input'>
                                                                    <span>
                                                                        {el.rack_access_type_name +
                                                                            " " +
                                                                            (el.index +
                                                                                1)}
                                                                    </span>
                                                                    <input
                                                                        type='text'
                                                                        value={
                                                                            el.rack_access_name
                                                                        }
                                                                        readOnly></input>
                                                                </div>
                                                                <img
                                                                    src={
                                                                        IconDeleteAccess
                                                                    }
                                                                    onClick={() =>
                                                                        deleteAccess(
                                                                            index
                                                                        )
                                                                    }
                                                                    alt='Delete Access'
                                                                />
                                                            </div>
                                                        )
                                                    )}
                                            </>
                                        )}
                                        {inputData.change ===
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
                                                        <datalist id='power_source_a'>
                                                            {rackInputOptions
                                                                .power_source_a
                                                                .length > 0 &&
                                                                rackInputOptions.power_source_a.map(
                                                                    (el) => (
                                                                        <option
                                                                            key={
                                                                                el.power_type_id
                                                                            }
                                                                            value={
                                                                                el.asset_number
                                                                            }>
                                                                            {
                                                                                el.asset_number
                                                                            }
                                                                        </option>
                                                                    )
                                                                )}
                                                        </datalist>
                                                        <input
                                                            type='text'
                                                            list={
                                                                "power_source_a"
                                                            }
                                                            name='power_source_a'
                                                            value={
                                                                rackChangeTo.power_source_a
                                                            }
                                                            onChange={
                                                                handleRackChangeTo
                                                            }
                                                            style={{
                                                                width: "180px",
                                                            }}></input>
                                                    </div>
                                                    <img
                                                        src={IconDeleteAccess}
                                                        alt='Delete Access'
                                                    />
                                                </div>
                                                <div className='access'>
                                                    <div className='access-input'>
                                                        <span
                                                            style={{
                                                                width: "140px",
                                                            }}>
                                                            Power Source B
                                                        </span>
                                                        <datalist id='power_source_b'>
                                                            {rackInputOptions
                                                                .power_source_b
                                                                .length > 0 &&
                                                                rackInputOptions.power_source_b.map(
                                                                    (el) => (
                                                                        <option
                                                                            key={
                                                                                el.power_type_id
                                                                            }
                                                                            value={
                                                                                el.asset_number
                                                                            }>
                                                                            {
                                                                                el.asset_number
                                                                            }
                                                                        </option>
                                                                    )
                                                                )}
                                                        </datalist>
                                                        <input
                                                            type='text'
                                                            list={
                                                                "power_source_b"
                                                            }
                                                            name='power_source_b'
                                                            value={
                                                                rackChangeTo.power_source_b
                                                            }
                                                            onChange={
                                                                handleRackChangeTo
                                                            }
                                                            style={{
                                                                width: "180px",
                                                            }}></input>
                                                    </div>
                                                    <img
                                                        src={IconDeleteAccess}
                                                        alt='Delete Access'
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {inputData.change === "Access" && (
                                        <div>
                                            <span
                                                className='add-access'
                                                onClick={toggleAddAccess}>
                                                +Add Access
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className='is-required'>*Required</div>
                    <div className='button-container'>
                        <ButtonSubmit
                            name='Submit'
                            formId='input-request'
                            isLoading={loadingButton}
                        />
                        <ButtonClear name='Clear' onClear={handleClear} />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Request;
