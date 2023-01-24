// Discard changes when committing. Only for testing
import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
    ModalContainer,
    InputDropdownHorizontal,
    LoadingData,
} from "../../ComponentReuseable/index";
import { toast } from "react-toastify";
import "./style.scss";
import { ReturnHostBackend } from "../../BackendHost/BackendHost";

const DatasheetModal = (props) => {
    const { title, isShowing, hide, file, level } = props;

    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [noFile, setNoFile] = useState(false);
    const [datasheet, setDatasheet] = useState([]);
    const [selectedDatasheet, setSelectedDatasheet] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
        setNoFile(false);
    };

    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

    useEffect(() => {
        if (!isShowing) {
            setNumPages(null);
            setDatasheet([]);
            setSelectedDatasheet([]);
            setPageNumber(1);
        }
    }, [isShowing]);

    useEffect(() => {
        if (noFile) {
            toast.error("No data sheet available.", {
                toastId: "no-file",
            });
        }
    }, [noFile]);

    useEffect(() => {
        let datasheets = [];
        if (isShowing) {
            if (file && file.length !== 0) {
                file.map((fl) => {
                    if (fl) {
                        if (fl.name !== undefined) {
                            datasheets.push(fl);
                        } else {
                            datasheets.push({
                                link: fl,
                                filename: fl
                                    .split("/")
                                    [fl.split("/").length - 1].split(".")[0],
                            });
                        }
                    } else {
                        setDatasheet([]);
                        setSelectedDatasheet([]);
                        toast.error("No data sheet available.", {
                            toastId: "no-file",
                        });
                    }
                });
                setDatasheet(datasheets);
                setSelectedDatasheet(datasheets[0]);
            } else {
                setDatasheet([]);
                setSelectedDatasheet(null);
                toast.error("No data sheet available.", {
                    toastId: "no-file",
                });
            }
        }
    }, [isShowing, file]);

    return (
        <ModalContainer
            title={title}
            isShowing={isShowing}
            hide={hide}
            level={level}
            children={
                <div className='Datasheet-modal'>
                    <LoadingData
                        isLoading={isLoading}
                        useAltBackground={false}
                    />
                    <div className='dropdown'>
                        {datasheet.length <= 1 || noFile ? null : (
                            <InputDropdownHorizontal
                                label='Datasheet'
                                name='selectedDatasheet'
                                value={selectedDatasheet.filename}
                                onChange={(e) => {
                                    let getDatasheet = datasheet.find(
                                        (ds) => ds.filename === e.target.value
                                    );
                                    setSelectedDatasheet(getDatasheet);
                                    setNumPages(null);
                                }}
                                options={datasheet.map((data) => data.filename)}
                                noEmptyOption={true}
                            />
                        )}
                    </div>
                    <div className='datasheet'>
                        <FaChevronLeft
                            className={
                                noFile ||
                                datasheet.length === 0 ||
                                numPages === 1
                                    ? "paging-hidden"
                                    : "previous-page"
                            }
                            onClick={() =>
                                setPageNumber((prevPageNumber) =>
                                    prevPageNumber !== 1
                                        ? prevPageNumber - 1
                                        : prevPageNumber
                                )
                            }
                            size={30}
                        />
                        <Document
                            file={
                                selectedDatasheet
                                    ? selectedDatasheet.link !== undefined
                                        ? ReturnHostBackend(
                                              process.env
                                                  .REACT_APP_BACKEND_NODELINX
                                          ) + selectedDatasheet.link
                                        : selectedDatasheet
                                    : null
                            }
                            onLoadSuccess={onDocumentLoadSuccess}
                            options={{
                                cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`,
                                cMapPacked: true,
                            }}
                            error={"No data sheet available."}
                            onLoadError={() => {
                                setNoFile(true);
                            }}>
                            <Page pageNumber={pageNumber} />
                        </Document>
                        <FaChevronRight
                            className={
                                noFile ||
                                datasheet.length === 0 ||
                                numPages === 1
                                    ? "paging-hidden"
                                    : "next-page"
                            }
                            onClick={() =>
                                setPageNumber((prevPageNumber) =>
                                    prevPageNumber !== numPages
                                        ? prevPageNumber + 1
                                        : prevPageNumber
                                )
                            }
                            size={30}
                        />
                    </div>
                    <div className='paging'>
                        <span
                            className={
                                noFile || datasheet.length === 0
                                    ? "paging-hidden"
                                    : ""
                            }>
                            Page {pageNumber || (numPages ? 1 : "--")} of{" "}
                            {numPages || "--"}
                        </span>
                    </div>
                </div>
            }
        />
    );
};

export default DatasheetModal;
