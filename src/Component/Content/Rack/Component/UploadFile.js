// System library imports
import React, { useState } from "react";

// Style imports
import "../../../ComponentReuseable/style.scss";

const UploadPhoto = (props) => {
    // Destructure props
    let { defaultImage, height, width, onUpload } = props;

    // States
    const [imageUrl, setImageUrl] = useState(null);

    // Functions
    const handleFileUpload = (e) => {
        let { files } = e.target;

        if (files.length > 0) {
            let file = e.target.files[0];

            const reader = new FileReader();

            reader.addEventListener(
                "load",
                () => {
                    // Set preview image to the uploaded photo
                    setImageUrl(reader.result);

                    // Call the user defined onUpload function with the uploaded file as the argument
                    onUpload(file);
                },
                false
            );

            if (file) {
                reader.readAsDataURL(file);
            }
        }
    };

    return (
        <div
            className='reusable-upload-photo'
            style={{
                height: height ? height : null,
                width: width ? width : null,
            }}>
            <input
                className='reusable-upload-photo__file-input-form'
                type='file'
                id='uploadedFile'
                accept='application/pdf'
                name='data_sheet'
                onChange={handleFileUpload}
            />
            <label
                className='reusable-upload-photo__label reusable-button reusable-button--upload-photo'
                htmlFor='uploadedPhoto'>
                Upload File
            </label>
        </div>
    );
};

export default UploadPhoto;
