import SVG_export_button from "../../svg/export.svg";
import SVG_loading_button from "../../svg/loading_button.svg";

import { Tooltip } from "./index";

export const ExportButton = ({ isLoading, onClick }) => {
    return (
        <Tooltip
            tooltip={
                <span className='reusable-button--plus__tooltip'>
                    {isLoading ? "Exporting Data..." : "Export Data"}
                </span>
            }>
            <div style={{ height: "30px" }}>
                <img
                    className='export-button-img'
                    onClick={isLoading ? null : onClick}
                    src={isLoading ? SVG_loading_button : SVG_export_button}
                    style={{
                        cursor: isLoading ? "initial" : "pointer",
                    }}
                />
            </div>
        </Tooltip>
    );
};
