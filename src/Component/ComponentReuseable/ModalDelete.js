// System library imports
import { React } from "react";

// Custom library imports
import ModalContainer from "./ModalContainer";

const ModalDelete = (props) => {
    // Destructure props
    let {
        isShowing,
        hide,
        deletedObjectType,
        deletedObjectName,
        onDelete,
        isLoading,
        level,
    } = props;

    return (
        <ModalContainer
            width='300px'
            title={`Delete ${deletedObjectType}`}
            isShowing={isShowing}
            hide={hide}
            submitName={"Yes"}
            onSubmit={onDelete}
            clearName={"No"}
            onClear={hide}
            isLoading={isLoading}
            level={level ? level : 1}>
            <div className='reusable-modal-delete'>
                <span>{`Are you sure to delete ${deletedObjectType}`}</span>
                <span>{`${deletedObjectName}?`}</span>
            </div>
        </ModalContainer>
    );
};

export default ModalDelete;
