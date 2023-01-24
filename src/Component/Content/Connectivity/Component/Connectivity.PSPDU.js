// System library imports
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

// Custom library imports
import { ReturnHostBackend } from "../../../BackendHost/BackendHost";
import { getToken } from "../../../TokenParse/TokenParse";

// Image imports
import psToPduUpperArrow from "../../../../svg/ps_to_pdu_upper_arrow.svg";
// import psToPduLowerArrow from "../../../../svg/ps_to_pdu_lower_arrow.svg";

const PSPDU = (props) => {
    // Destructure props
    let { rack, setIsLoading } = props;

    // States
    const [powerSources, setPowerSources] = useState({ a: null, b: null });
    const [pdus, setPdus] = useState({ a: null, b: null });

    // Side-effects
    // Get current rack's power sources and PDUs
    useEffect(() => {
        // Internal variable
        let mounted = true;

        // Internal functions
        const getPowerSourcesAndPdus = async (rack) => {
            if (rack) {
                // Destructure rack
                let { id: rackId } = rack;

                // Call JDBC query to get Power Sources of the selected rack
                let config = {
                    method: "post",
                    url:
                        ReturnHostBackend(process.env.REACT_APP_JDBC) +
                        process.env
                            .REACT_APP_CONNECTIVITY_GET_RACK_POWER_SOURCES,
                    headers: {
                        authorization: getToken(),
                    },
                    data: {
                        rack_id:
                            rackId === null || rackId === undefined
                                ? ""
                                : rackId,
                    },
                };

                try {
                    const result = await axios(config);

                    if (result.status === 200) {
                        let { data } = result;

                        if (data && data.length > 0) {
                            let psAData = data[0];
                            let psBData = data[1];

                            if (psAData.count > 0) {
                                let { data: queryData } = psAData;

                                queryData = queryData.map(
                                    (row) => row.asset_number
                                );

                                if (mounted) {
                                    setPowerSources((prevState) => ({
                                        ...prevState,
                                        a: queryData,
                                    }));
                                }
                            } else {
                                if (mounted) {
                                    setPowerSources((prevState) => ({
                                        ...prevState,
                                        a: null,
                                    }));
                                }
                            }

                            if (psBData.count > 0) {
                                let { data: queryData } = psBData;

                                queryData = queryData.map(
                                    (row) => row.asset_number
                                );

                                if (mounted) {
                                    setPowerSources((prevState) => ({
                                        ...prevState,
                                        b: queryData,
                                    }));
                                }
                            } else {
                                if (mounted) {
                                    setPowerSources((prevState) => ({
                                        ...prevState,
                                        b: null,
                                    }));
                                }
                            }
                        }
                    } else {
                        toast.error("Error getting rack power sources data", {
                            toastId: "error-get-ps",
                        });
                    }
                } catch (e) {
                    toast.error(
                        "Error calling API to get rack power sources data",
                        { toastId: "error-get-ps" }
                    );
                }

                // Call JDBC query to get PDUs of the selected rack
                config = {
                    method: "post",
                    url:
                        ReturnHostBackend(process.env.REACT_APP_JDBC) +
                        process.env.REACT_APP_CONNECTIVITY_GET_RACK_PDUS,
                    headers: {
                        authorization: getToken(),
                    },
                    data: {
                        rack_id:
                            rackId === null || rackId === undefined
                                ? ""
                                : rackId,
                    },
                };

                try {
                    const result = await axios(config);

                    if (result.status === 200) {
                        let { data } = result;

                        if (data && data.length > 0) {
                            let pduAData = data[0];
                            let pduBData = data[1];

                            if (pduAData.count > 0) {
                                let { data: queryData } = pduAData;

                                if (mounted) {
                                    setPdus((prevState) => ({
                                        ...prevState,
                                        a: queryData,
                                    }));
                                }
                            } else {
                                if (mounted) {
                                    setPdus((prevState) => ({
                                        ...prevState,
                                        a: null,
                                    }));
                                }
                            }

                            if (pduBData.count > 0) {
                                let { data: queryData } = pduBData;

                                if (mounted) {
                                    setPdus((prevState) => ({
                                        ...prevState,
                                        b: queryData,
                                    }));
                                }
                            } else {
                                if (mounted) {
                                    setPdus((prevState) => ({
                                        ...prevState,
                                        b: null,
                                    }));
                                }
                            }
                        }
                    } else {
                        toast.error("Error getting PDUs data", {
                            toastId: "error-get-pdu",
                        });
                    }
                } catch (e) {
                    toast.error("Error calling API to get PDUs data", {
                        toastId: "error-get-pdu",
                    });
                }
            } else {
                setPowerSources((prevState) => ({
                    ...prevState,
                    a: null,
                    b: null,
                }));
            }
        };

        (async () => {
            // Set isLoading to TRUE
            if (mounted) {
                setIsLoading((prevState) => {
                    return { ...prevState, PSPDU: true };
                });
            }

            // Call API to get current rack's power sources and PDUs
            await getPowerSourcesAndPdus(rack);
            // Set isLoading to FALSE
            if (mounted) {
                setIsLoading((prevState) => {
                    return { ...prevState, PSPDU: false };
                });
            }
        })();

        return () => {
            mounted = false;
        };
    }, [rack, setIsLoading]);

    return (
        <div className='connectivity-ps-pdu'>
            <span className='connectivity-ps-pdu__header'>{`Rack ${
                rack ? rack.name : "---"
            } Connectivity`}</span>
            <div className='connectivity-ps-pdu__content'>
                <div className='connectivity-ps-pdu__content__header-row'>
                    <div className='connectivity-ps-pdu__content__header-row__ps'>
                        Power Source
                    </div>
                    <div className='connectivity-ps-pdu__content__header-row__separator' />
                    <div className='connectivity-ps-pdu__content__header-row__pdu'>
                        Rack PDU
                    </div>
                </div>
                <div className='connectivity-ps-pdu__content__body'>
                    <div className='connectivity-ps-pdu__content__body-row'>
                        <div className='connectivity-ps-pdu__content__body-row__ps connectivity-ps-pdu__content__body-row__ps--up'>
                            <span className='connectivity-ps-pdu__content__body-row__ps__header'>
                                {"PDU A"}
                            </span>
                            <div className='connectivity-ps-pdu__content__body-row__ps__content'>
                                {powerSources &&
                                powerSources.a &&
                                powerSources.a.length > 0 ? (
                                    powerSources.a.map((ps) => (
                                        <span>{ps}</span>
                                    ))
                                ) : (
                                    <span>{"---"}</span>
                                )}
                            </div>
                        </div>
                        <div className='connectivity-ps-pdu__content__body-row__arrow connectivity-ps-pdu__content__body-row__arrow--up'>
                            <img
                                src={psToPduUpperArrow}
                                alt='ps-to-pdu-arrow'
                            />
                        </div>
                        <div className='connectivity-ps-pdu__content__body-row__pdu connectivity-ps-pdu__content__body-row__pdu--up'>
                            <span className='connectivity-ps-pdu__content__body-row__pdu__header'>
                                {"PDU A"}
                            </span>
                            <div className='connectivity-ps-pdu__content__body-row__pdu__content' />
                            <div className='connectivity-ps-pdu__content__body-row__pdu__item-numbers'>
                                {pdus && pdus.a && pdus.a.length > 0 ? (
                                    pdus.a.map((pdu) => (
                                        <span className='connectivity-ps-pdu__content__body-row__pdu__pdu-name'>
                                            {pdu.item_number}
                                        </span>
                                    ))
                                ) : (
                                    <span className='connectivity-ps-pdu__content__body-row__pdu__pdu-name'>
                                        {"---"}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className='connectivity-ps-pdu__content__body-row'>
                        <div className='connectivity-ps-pdu__content__body-row__ps connectivity-ps-pdu__content__body-row__ps--up'>
                            <span className='connectivity-ps-pdu__content__body-row__ps__header'>
                                {"PDU B"}
                            </span>
                            <div className='connectivity-ps-pdu__content__body-row__ps__content'>
                                {powerSources &&
                                powerSources.b &&
                                powerSources.b.length > 0 ? (
                                    powerSources.b.map((ps) => (
                                        <span>{ps}</span>
                                    ))
                                ) : (
                                    <span>{"---"}</span>
                                )}
                            </div>
                        </div>
                        <div className='connectivity-ps-pdu__content__body-row__arrow connectivity-ps-pdu__content__body-row__arrow--up'>
                            <img
                                src={psToPduUpperArrow}
                                alt='ps-to-pdu-arrow'
                            />
                        </div>
                        <div className='connectivity-ps-pdu__content__body-row__pdu connectivity-ps-pdu__content__body-row__pdu--up'>
                            <span className='connectivity-ps-pdu__content__body-row__pdu__header'>
                                {"PDU B"}
                            </span>
                            <div className='connectivity-ps-pdu__content__body-row__pdu__content' />
                            <div className='connectivity-ps-pdu__content__body-row__pdu__item-numbers'>
                                {pdus && pdus.b && pdus.b.length > 0 ? (
                                    pdus.b.map((pdu) => (
                                        <span className='connectivity-ps-pdu__content__body-row__pdu__pdu-name'>
                                            {pdu.item_number}
                                        </span>
                                    ))
                                ) : (
                                    <span className='connectivity-ps-pdu__content__body-row__pdu__pdu-name'>
                                        {"---"}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PSPDU;
