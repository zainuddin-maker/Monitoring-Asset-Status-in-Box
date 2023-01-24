import React from "react";
import {
    TableDCIM,
    Paging,
    useModal,
    Tooltip,
    LoadingData,
    getUAC,
    getUACWithoutToast,
} from "../../../ComponentReuseable/index";
import addIcon from "../../../../svg/add-asset-icon.svg";
import AddItemModal from "./AddItemModal";
import "./../style.scss";

const ItemDataTable = (props) => {
    const {
        items,
        setSelectedItem,
        isLoading,
        setIsLoading,
        setIsActive,
        getItems,
        currentPage,
        setCurrentPage,
        totalPage,
        allItems,
        setSelectedRow,
    } = props;

    const { isShowing: isShowingAddItemModal, toggle: addItemModal } =
        useModal();

    const body = items.map((item) => {
        return {
            item_id: item.item_id,
            item_number: item.item_number,
            item_name: item.item_name,
            brand_name: item.brand_name ? item.brand_name : "-",
            model_name: item.model_name ? item.model_name : "-",
            category: item.category_name,
            number_of_u: item.number_of_u,
            client_name: item.client_name,
            status: item.status,
        };
    });

    const header = {
        item_number: { width: "100px", name: "Item #" },
        item_name: { width: "150px", name: "Item Name" },
        brand_name: { width: "90px", name: "Brand" },
        model_name: { width: "90px", name: "Model #" },
        category: { width: "100px", name: "Category" },
        number_of_u: { width: "70px", name: "U(s) Needed" },
        client_name: { width: "100px", name: "Client" },
        status: { width: "90px", name: "Status" },
    };

    const actions = "";
    const customCellClassNames = {
        status: [
            { value: "Installed", className: "installed" },
            { value: "Removed", className: "removed" },
            { value: "In-Progress", className: "in-progress" },
        ],
    };

    return (
        <div className='content-table'>
            {getUACWithoutToast("add") ? (
                <Tooltip
                    tooltip={
                        <span className='icon-tooltip'>{"Add Item"}</span>
                    }>
                    <img
                        className='icons add-icon'
                        src={addIcon}
                        alt='add-icon'
                        onClick={() => addItemModal()}
                    />
                </Tooltip>
            ) : null}
            <div className='table'>
                <LoadingData
                    isLoading={isLoading.itemList}
                    useAltBackground={false}
                />
                <TableDCIM
                    header={header}
                    body={body}
                    actions={[]}
                    selectable={true}
                    onSelect={(e, index) => {
                        setSelectedRow(index);
                    }}
                    customCellClassNames={customCellClassNames}
                />
                <div className='paging'>
                    <Paging
                        firstPage={() => {
                            setCurrentPage(1);
                        }}
                        lastPage={() => {
                            setCurrentPage(totalPage);
                        }}
                        nextPage={() => {
                            currentPage !== totalPage &&
                                setCurrentPage(currentPage + 1);
                        }}
                        prevPage={() => {
                            currentPage !== 1 &&
                                setCurrentPage(currentPage - 1);
                        }}
                        currentPageNumber={currentPage}
                        lastPageNumber={totalPage}
                    />
                </div>
            </div>
            <AddItemModal
                title={"Add New Item"}
                isShowing={isShowingAddItemModal}
                hide={addItemModal}
                submitName={"Add"}
                onSubmit={() => {
                    addItemModal();
                }}
                clearName={"Clear"}
                onClear={() => {
                    addItemModal();
                }}
                getItems={getItems}
                setIsLoading={setIsLoading}
                allItems={allItems}
            />
        </div>
    );
};

export default ItemDataTable;
