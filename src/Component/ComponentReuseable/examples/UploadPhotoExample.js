// System library imports
import React from "react";

// Image imports
import DCIMIcon from "../../../image/DCIM.png";

// Custom library imports
import { UploadPhoto } from "../../ComponentReuseable/index";

const UploadPhotoExample = (props) => {
    return (
        <React.Fragment>
            <UploadPhoto
                defaultImage={DCIMIcon}
                height='200px'
                width='200px'
                onUpload={(photoFile) => {
                    console.log("Photo uploaded!");
                    console.log(photoFile);
                }}
            />
            <UploadPhoto
                height='200px'
                width='200px'
                onUpload={(photoFile) => {
                    console.log("Photo uploaded!");
                    console.log(photoFile);
                }}
            />
        </React.Fragment>
    );
};

export default UploadPhotoExample;
