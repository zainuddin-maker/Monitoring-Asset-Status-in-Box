// System library imports
import React from "react";

// Style imports
import "./style.scss";

const TableAction = (props) => {
    // Destructure props
    let { index, iconSrc, onClick, Src, row } = props;
    return (
        <React.Fragment>
            {iconSrc ? (
                <img
                    className='reusable-table-dcim__action-icon'
                    onClick={onClick}
                    src={iconSrc}
                    alt='action-icon'
                />
            ) : Src ? (
                <Src data={row} onClick={onClick} />
            ) : (
                <div
                    className='reusable-table-dcim__action-icon reusable-table-dcim__action-icon--default'
                    onClick={onClick}>
                    {index}
                </div>
            )}
        </React.Fragment>
    );
};

export default TableAction;
