import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import {
    ModalContainer,
    InputDropdownVertical,
    InputDropdownCreatableVertical,
} from "../../../ComponentReuseable/index";
import { getToken } from "../../../TokenParse/TokenParse";
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";

const AddAccessModal = (props) => {
    const {
        state,
        setRack,
        title,
        submitName,
        isShowing,
        hide,
        getAccessNames,
        onSubmit,
        optionsAccessName,
        optionsAccessType,
        isLoading,
        deleteAccess,
    } = props;

    const [access, setAccess] = useState({
        rack_access_name_id: null,
        rack_access_type_id: null,
    });

    const addRackAccessName = async (access_name) => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_ADD_RACK_ACCESS,
            headers: {
                authorization: getToken(),
            },
            data: { access_name: access_name },
        };
        try {
            const result = await axios(config);
            if (result.data.data.length > 0) {
                toast.success("Success to add access name", {
                    toastId: "success-add-access-name",
                });
                getAccessNames();
                setAccess((prev) => {
                    return {
                        ...prev,
                        rack_access_name_id: {
                            value: result.data.data[0].rack_access_name_id,
                            label: result.data.data[0].rack_access_name_name,
                        },
                    };
                });
            } else {
                toast.error("Failed to add access name", {
                    toastId: "error-add-access-name",
                });
            }
        } catch (e) {
            // console.error(e);
            toast.error("Failed to add access name", {
                toastId: "error-add-access-name",
            });
        }
    };

    const delRackAccessName = async (access_name_id) => {
        let config = {
            method: "POST",
            url:
                ReturnHostBackend(process.env.REACT_APP_JDBC) +
                process.env.REACT_APP_RACK_DELETE_RACK_ACCESS,
            headers: {
                authorization: getToken(),
            },
            data: { access_name_id: access_name_id },
        };
        try {
            const result = await axios(config);
            if (result.data.data.length > 0) {
                toast.success("Success to delete access name", {
                    toastId: "success-delete-access-name",
                });
                getAccessNames();
                setAccess((prev) => {
                    return {
                        ...prev,
                        rack_access_name_id: "",
                    };
                });
            } else {
                toast.error("Failed to delete access name", {
                    toastId: "error-delete-access-name",
                });
            }
        } catch (e) {
            // console.error(e);
            toast.error("Failed to delete access name", {
                toastId: "error-delete-access-name",
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setAccess((prev) => {
            prev[name] = value;
            return { ...prev };
        });
    };

    const addAccess = () => {
        if (
            !access.rack_access_type_id ||
            access.rack_access_type_id === null
        ) {
            toast.error(`Please fill out the access type field.`, {
                toastId: "empty-value-access-type",
            });
            return;
        }
        if (
            !access.rack_access_name_id ||
            access.rack_access_name_id === null
        ) {
            toast.error(`Please fill out the access name field.`, {
                toastId: "empty-value-access-name",
            });
            return;
        }
        const data = state.access;

        if (
            access.rack_access_name_id !== null &&
            access.rack_access_type_id.value !== null
        ) {
            data.push({
                rack_access_name_id: access.rack_access_name_id.value,
                rack_access_type_id: access.rack_access_type_id,
            });

            data.sort((a, b) => {
                if (a.rack_access_type_id < b.rack_access_type_id) return -1;
                if (a.rack_access_type_id > b.rack_access_type_id) return 1;
                return 0;
            });

            const uniqueType = [
                ...new Set(data.map((item) => item.rack_access_type_id)),
            ];

            const newIndexObjectType = {};
            uniqueType.forEach((data) => (newIndexObjectType[data] = 1));

            const newData = data.map((dat) => ({
                ...dat,
                index: newIndexObjectType[dat.rack_access_type_id]++,
            }));

            setRack((prev) => ({
                ...prev,
                access: newData,
            }));
            onSubmit();
        }
    };

    useEffect(() => {
        if (isShowing) {
            setAccess({
                rack_access_name_id: "",
                rack_access_type_id: "",
            });
        }
    }, [isShowing]);

    return (
        <ModalContainer
            width='200px'
            title={title}
            isShowing={isShowing}
            hide={hide}
            submitName={submitName}
            level={2}
            onSubmit={addAccess}
            clearName={"Clear"}
            onClear={() => {
                setAccess({
                    rack_access_name_id: null,
                    rack_access_type_id: null,
                });
            }}
            showRequired={true}
            children={
                <div className='Add-rack-modal'>
                    <form id='accessForm' onSubmit={addAccess}>
                        <div className='flex-column'>
                            <InputDropdownVertical
                                label='Access Type'
                                name='rack_access_type_id'
                                value={access.rack_access_type_id}
                                options={optionsAccessType}
                                onChange={handleChange}
                                isRequired={true}
                                isLoading={isLoading.access_type}
                            />
                            <InputDropdownCreatableVertical
                                label='Access Name'
                                name='rack_access_name_id'
                                value={access.rack_access_name_id}
                                options={optionsAccessName}
                                onSelect={(e) => {
                                    setAccess((prev) => {
                                        return {
                                            ...prev,
                                            rack_access_name_id: e,
                                        };
                                    });
                                }}
                                onCreateOption={(e) => {
                                    let regex = /^\s*$/;
                                    if (!regex.test(e)) {
                                        addRackAccessName(e);
                                    } else {
                                        toast.error("Invalid value!", {
                                            toastId:
                                                "invalid-input-add-access-name",
                                        });
                                        return;
                                    }
                                }}
                                onDeleteOption={(e) => {
                                    let check = state.access.filter(
                                        (acc) =>
                                            acc.rack_access_name_id === e.value
                                    );

                                    if (check.length !== 0) {
                                        check.map((ck) =>
                                            deleteAccess(
                                                state.access.findIndex(
                                                    (find) => find === ck
                                                )
                                            )
                                        );
                                    }
                                    delRackAccessName(e.value);
                                }}
                                isLoading={isLoading.access_name}
                                isRequired={true}
                            />
                        </div>
                    </form>
                </div>
            }
        />
    );
};

export default AddAccessModal;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import {
//     ModalContainer,
//     ButtonClear,
//     ButtonSubmit,
//     InputDropdownHorizontal,
//     InputTextVertical,
//     InputDropdownVertical,
//     InputDropdownCreatableVertical,
// } from "../../../ComponentReuseable/index";
// import { getToken } from "../../../TokenParse/TokenParse";

// const AddAccessModal = (props) => {
//     const {
//         state,
//         setRack,
//         title,
//         submitName,
//         clearName,
//         isShowing,
//         hide,
//         onSubmit,
//     } = props;

//     const [optionsAccessName, setOptionsAccessName] = useState([]);
//     const [optionsAccessType, setOptionsAccessType] = useState([]);
//     const [access, setAccess] = useState({
//         name: "",
//         type: "",
//         key: 0,
//         card: 0,
//     });

//     const getAccessNames = async () => {
//         let config = {
//             method: "POST",
//             url: "https://192.168.7.121:2222/api/jdbc/dcim/dcim_admin/dcim_db/rack/getRackAccessNames",
//             headers: {
//                 authorization: getToken(),
//             },
//         };
//         try {
//             const result = await axios(config);
//             setOptionsAccessName(result.data.data);
//         } catch (e) {
//             // console.error(e);
//         }
//     };

//     const getAccessTypes = async () => {
//         let config = {
//             method: "POST",
//             url: "https://192.168.7.121:2222/api/jdbc/dcim/dcim_admin/dcim_db/rack/getRackAccessTypes",
//             headers: {
//                 authorization: getToken(),
//             },
//         };
//         try {
//             const result = await axios(config);
//             setOptionsAccessType(result.data.data);
//         } catch (e) {
//             // console.error(e);
//         }
//     };

//     const addRackAccessName = async (access_name) => {
//         console.log(access_name);
//         let config = {
//             method: "POST",
//             url: "https://192.168.7.121:2222/api/jdbc/dcim/dcim_admin/dcim_db/rack/addRackAccessName",
//             headers: {
//                 authorization: getToken(),
//             },
//             data: { access_name: access_name },
//         };
//         try {
//             const result = await axios(config);
//             toast.success("Success Add Access Name", {
//                 toastId: "success-submit",
//             });
//             getAccessNames();
//         } catch (e) {
//             // console.error(e);
//             toast.error("Submission Failed: " + e.message, {
//                 toastId: "error-submit",
//             });
//         }
//     };

//     const delRackAccessName = async (access_name_id) => {
//         let config = {
//             method: "POST",
//             url: "https://192.168.7.121:2222/api/jdbc/dcim/dcim_admin/dcim_db/rack/deleteRackAccessName",
//             headers: {
//                 authorization: getToken(),
//             },
//             data: { access_name_id: access_name_id },
//         };
//         try {
//             const result = await axios(config);
//             toast.success("Success Delete Access Name", {
//                 toastId: "success-submit",
//             });
//             getAccessNames();
//         } catch (e) {
//             // console.error(e);
//             toast.error("Submission Failed: " + e.message, {
//                 toastId: "error-submit",
//             });
//         }
//     };

//     useEffect(() => {
//         getAccessNames();
//         getAccessTypes();
//     }, []);

//     useEffect(() => {
//         let key = 0;
//         let card = 0;
//         if (state.access_name.length === 0) {
//             setAccess((prev) => {
//                 return { ...prev, key: 1, card: 1 };
//             });
//         }
//     }, [state]);

//     const handleChange = (e) => {
//         let { name, value } = e.target;

//         setAccess((prev) => {
//             prev[name] = value;
//             return { ...prev };
//         });
//     };

//     const handleClear = () => {
//         setAccess((prev) => {
//             prev.name = "";
//             prev.type = "";
//             return { ...prev };
//         });
//     };

//     const addAccess = () => {
//         if (access.type === "" || access.name === "") {
//             toast.error(`Empty Input! \n Please fill in the information.`);
//             return;
//         }
//         setAccess((prev) => ({
//             ...prev,
//             key: access.type === "1" ? access.key + 1 : access.key,
//             card: access.type === "2" ? access.card + 1 : access.card,
//         }));

//         let dataAccess_id = state.access_id;
//         let dataAccess_name = state.access_name;

//         dataAccess_id.push({
//             rack_access_type_id: access.type,
//             rack_access_name_id: access.name.value,
//         });
//         dataAccess_name.push({
//             no: access.type === "1" ? access.key : access.card,
//             type: access.type,
//             name: access.name.label,
//         });

//         setRack((prev) => ({
//             ...prev,
//             access_id: dataAccess_id,
//             access_name: dataAccess_name,
//         }));
//         handleClear();
//         onSubmit();
//     };

//     return (
//         <ModalContainer
//             width='200px'
//             title={title}
//             isShowing={isShowing}
//             hide={hide}
//             submitName={submitName}
//             level={2}
//             onSubmit={addAccess}
//             clearName={clearName}
//             onClear={handleClear}
//             children={
//                 <div className='Add-rack-modal'>
//                     <form id='accessForm' onSubmit={addAccess}>
//                         <div className='flex-column'>
//                             <InputDropdownVertical
//                                 label='Access Type'
//                                 name='type'
//                                 value={access.type}
//                                 options={optionsAccessType}
//                                 onChange={handleChange}
//                             />
//                             <InputDropdownCreatableVertical
//                                 label='Access Name'
//                                 name='name'
//                                 value={access.name}
//                                 options={optionsAccessName}
//                                 onChange={handleChange}
//                                 onSelect={(e) => {
//                                     setAccess((prev) => {
//                                         return {
//                                             ...prev,
//                                             name: e,
//                                         };
//                                     });
//                                 }}
//                                 onCreateOption={(e) => {
//                                     addRackAccessName(e);
//                                 }}
//                                 onDeleteOption={(e) => {
//                                     delRackAccessName(e.value);
//                                 }}
//                                 isLoading={false}
//                             />
//                         </div>
//                     </form>
//                 </div>
//             }
//         />
//     );
// };

// export default AddAccessModal;
