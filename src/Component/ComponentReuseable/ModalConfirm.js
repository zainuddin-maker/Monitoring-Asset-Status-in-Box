// System library imports
import { React } from "react";

// Custom library imports
import ModalContainer from "./ModalContainer";

const ModalConfirm = (props) => {
    // Destructure props
    let {
        isShowing,
        hide,
        actionName,
        objectType,
        objectName,
        onConfirm,
        isLoading,
    } = props;

    return (
        <ModalContainer
            width='300px'
            title={`${actionName} ${objectType}`}
            isShowing={isShowing}
            hide={hide}
            submitName={"Yes"}
            onSubmit={onConfirm}
            clearName={"No"}
            onClear={hide}
            isLoading={isLoading}>
            <div className='reusable-modal-delete'>
                <span>{`Are you sure to ${actionName.toLowerCase()} ${objectType}`}</span>
                <span>{`${objectName}?`}</span>
            </div>
        </ModalContainer>
    );
};

export default ModalConfirm;
