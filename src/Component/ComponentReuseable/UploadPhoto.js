// System library imports
import React, { useEffect, useState } from "react";

// Image imports
import photoPlaceholder from "../../svg/photo_placeholder.svg";

// Style imports
import "./style.scss";

const UploadPhoto = (props) => {
    // Destructure props
    let { defaultImage, height, width, onUpload, triggerClear } = props;

    // States
    const [imageUrl, setImageUrl] = useState(null);

    // Functions
    const handlePhotoUpload = (e) => {
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

    // reset image
    useEffect(() => {
        setImageUrl(defaultImage);
    }, [triggerClear]);

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
                id='uploadedPhoto'
                name='uploadedPhoto'
                accept='image/*'
                onChange={handlePhotoUpload}
            />
            <div
                className={
                    imageUrl === null && !defaultImage
                        ? "reusable-upload-photo__preview reusable-upload-photo__preview--placeholder"
                        : "reusable-upload-photo__preview"
                }
                style={{
                    backgroundImage: `url(${
                        imageUrl === null
                            ? defaultImage
                                ? defaultImage
                                : photoPlaceholder
                            : imageUrl
                    })`,
                }}
            />
            <label
                className='reusable-upload-photo__label reusable-button reusable-button--upload-photo'
                htmlFor='uploadedPhoto'>
                Upload Photo
            </label>
        </div>
    );
};

export default UploadPhoto;
