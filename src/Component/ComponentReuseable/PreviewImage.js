import React from "react";

// Custom library imports
import { ModalContainer } from "./index";
import blank_image_white from "../../svg/blank_image_white.svg";

const PreviewImage = ({ src, isShowing, hide, level }) => {
    return (
        <ModalContainer
            title='Preview Image'
            isShowing={isShowing}
            hide={hide}
            level={level}>
            <div
                style={{
                    display: "flex",
                    margin: "auto",
                    maxHeight: "80vh",
                    maxWidth: "80vw",
                    overflow: "auto",
                }}>
                <img
                    style={{
                        height: "100%",
                        width: "100%",
                    }}
                    src={src}
                    alt='review'
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = blank_image_white;
                    }}
                />
            </div>
        </ModalContainer>
    );
};

export default PreviewImage;
