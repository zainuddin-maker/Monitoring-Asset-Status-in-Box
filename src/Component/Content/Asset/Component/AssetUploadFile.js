import React, { useState, useEffect } from "react";
// import axios from "axios";
import "../style.scss";

import { useModal } from "../../../ComponentReuseable/index";
// import DatasheetModal from "../../Rack/Component/DatasheetModal";
import DatasheetModal from "../../Datasheet/DatasheetModal";

import delete_file_icon from "../../../../svg/delete-file-icon.svg";
import { toast } from "react-toastify";
// import { getToken } from "../../../TokenParse/TokenParse";

function AssetUploadFile(props) {
    // Destructure props
    let { height, width, onUpload, defaultFiles, triggerClear, isEdit } = props;

    // States
    // const [fileUrl, setFileUrl] = useState(
    //     defaultFile === undefined
    //         ? null
    //         : process.env.REACT_APP_BACKEND_NODELINX +
    //               "/filerepository/dcim/uploadFileFromAPI/" +
    //               defaultFile
    // );
    // const [fileName, setFileName] = useState(
    //     defaultFile == undefined || defaultFile == ""
    //         ? null
    //         : defaultFile.includes("/")
    //         ? defaultFile.split("/")[1]
    //         : defaultFile
    // );

    // const [noFile, setNoFile] = useState(
    //     defaultFile == undefined || defaultFile == "" ? true : false
    // );

    const { isShowing: isShowingDataSheetPopup, toggle: toggleDataSheetPopup } =
        useModal();

    const [uploadedFiles, setUploadedFiles] = useState(
        defaultFiles == undefined || defaultFiles === "" ? [] : defaultFiles
    );

    const [selFile, setSelFile] = useState();

    // reset image
    // useEffect(() => {
    //     isEdit &&
    //         setFileUrl(
    //             defaultFile === undefined
    //                 ? null
    //                 : process.env.REACT_APP_BACKEND_NODELINX +
    //                       "/filerepository/dcim/uploadFileFromAPI/" +
    //                       defaultFile
    //         );
    //     isEdit &&
    //         setFileName(
    //             defaultFile == undefined || defaultFile == ""
    //                 ? null
    //                 : defaultFile.includes("/")
    //                 ? defaultFile.split("/")[1]
    //                 : defaultFile
    //         );
    //     setNoFile(defaultFile == null || defaultFile == "" ? true : false);
    // }, [triggerClear]);

    useEffect(() => {
        // console.log(defaultFiles);
        // isEdit &&
        setUploadedFiles(defaultFiles);
    }, [triggerClear]);

    // Functions
    const handleFileUpload = async (e) => {
        e.preventDefault();
        const { files } = e.target;
        const file = files[0];
        const file_name = files[0].name.replace(/\s/g, "");

        // await onUpload(file, file_name);

        // await setFileName(files[0].name);
        // await setFileUrl(file);
        // await setNoFile(false);

        // Validation Exact File Name
        const checkExist = uploadedFiles.find((file) =>
            file.file_name.includes(file_name)
        );
        if (checkExist) {
            toast.error("This file already exist", {
                toastId: "AUF_error-file-exist",
            });
            return;
        }

        // Multiple Files
        setUploadedFiles((prev) => [
            ...prev,
            {
                file: file,
                file_name: file_name,
            },
        ]);
    };

    const handleDelete = async (delete_file) => {
        // await onUpload(null, "");
        // await setFileName(null);
        // await setFileUrl(null);
        // await setNoFile(true);

        const removeSelFile = uploadedFiles.filter(
            (file) => file.file_name != delete_file
        );
        setUploadedFiles(removeSelFile);
    };

    useEffect(() => {
        onUpload(uploadedFiles);
    }, [uploadedFiles]);

    return (
        <div
            className='asset-upload-file'
            style={{
                height: height ? height : null,
                width: width ? width : null,
            }}>
            <DatasheetModal
                title={"Uploaded Data Sheet"}
                isShowing={isShowingDataSheetPopup}
                hide={toggleDataSheetPopup}
                level={2}
                file={selFile ? [selFile.file] : []}
            />
            <input
                className='asset-upload-file-input-form'
                type='file'
                id='uploadedFile'
                name='uploadedFile'
                accept='application/pdf'
                onChange={handleFileUpload}
            />
            <label className='asset-upload-file-label' htmlFor='uploadedFile'>
                Upload File
            </label>
            <div className='asset-uploaded-files'>
                {uploadedFiles.map((uploadedFile, index) => {
                    return (
                        <div className='asset-upload-file-name' key={index}>
                            <span
                                onClick={() => {
                                    setSelFile(uploadedFile);
                                    toggleDataSheetPopup();
                                }}
                                // onMouseEnter={() => setSelFile(uploadedFile)}
                            >
                                {uploadedFile.file_name}
                            </span>
                            <img
                                src={delete_file_icon}
                                alt='del'
                                onClick={() => {
                                    handleDelete(uploadedFile.file_name);
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default AssetUploadFile;
