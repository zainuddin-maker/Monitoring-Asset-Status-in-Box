// System library imports
import React from "react";

// Custom library imports
import { TableDCIM, Paging } from "../../ComponentReuseable/index";

const TableDCIMExample = () => {
    // Constants
    const SIZE = 200;

    const header = {
        id: { width: "50px", name: "ID" },
        assetName: { width: "300px", name: "Asset Name" },
        assetNumber: "Asset Number",
        supplier: "Supplier",
        type: "Type",
        brand: "Brand",
        model: "Model",
        purchaseDate: "Purchase Date",
        status: "Status",
    };

    const body = new Array(SIZE).fill({}).map((item, index) => {
        return {
            id: index,
            assetName: "TEMPLATE_ASSET ASDADA ASDASDADSA ADSSADSAKDJ",
            assetNumber: "CL-RCU-004",
            supplier: "MY_SUPPLIER",
            type: "TEMPLATE_TYPE",
            brand: "TEMPLATE_BRAND",
            model: "TEMPLATE_MODEL",
            purchaseDate: new Date().toLocaleString(),
            status: index % 2 === 0 ? "UP" : "DOWN",
        };
    });

    const actions = [
        {
            iconSrc: null,
            onClick: (selectedItem, index) => {
                console.log(`1-Item-${index}:`);
                console.log(selectedItem);
            },
            checkFunction: (selectedItem, index) => {
                return selectedItem.status === "DOWN";
            },
        },
        {
            iconSrc: null,
            onClick: (selectedItem, index) => {
                console.log(`2-Item-${index}:`);
                console.log(selectedItem);
            },
        },
        {
            iconSrc: null,
            onClick: (selectedItem, index) => {
                console.log(`3-Item-${index}:`);
                console.log(selectedItem);
            },
        },
    ];

    const customCellClassNames = {
        status: [
            { value: "UP", className: "column-green" },
            { value: "DOWN", className: "column-red" },
        ],
    };

    return (
        <div className='reusable-test-container'>
            <TableDCIM
                header={header}
                body={body}
                actions={actions}
                selectable={false}
                onSelect={(selectedItem, index) => {
                    console.log(`Item-${index}:`);
                    console.log(selectedItem);
                }}
                customCellClassNames={customCellClassNames}
            />
            <Paging
                firstPage={() => {}}
                lastPage={() => {}}
                nextPage={() => {}}
                prevPage={() => {}}
                currentPageNumber={1}
                lastPageNumber={10}
            />
        </div>
    );
};

export default TableDCIMExample;
