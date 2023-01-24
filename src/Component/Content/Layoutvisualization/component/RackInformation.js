function RackInfromation(props) {
    function ordinal_suffix_of(i) {
        var j = i % 10,
            k = i % 100;
        if (j === 1 && k !== 11) {
            return i + "st";
        }
        if (j === 2 && k !== 12) {
            return i + "nd";
        }
        if (j === 3 && k !== 13) {
            return i + "rd";
        }
        return i + "th";
    }

    let { data } = props;
    return (
        <div className="rack_information">
            <div className="rack_information_header">
                Rack Information
            </div>
            <div className="rack_information_racknumber_numberofu">
                <div  style={{ width: "200px" }} className="racknumber_numberofu">
                    <div >Rack Number</div>
                    <div
                        style={{
                           
                            fontWeight:"bold",
                        }}>
                        {data ? data.racknumber : ""}
                    </div>
                </div>
                <div className="racknumber_numberofu" >
                    <div >Number of U</div>
                    <div
                        style={{
                      
                            fontWeight: "bold",
                        }}>
                        {data ? data.numberOfU : ""}
                    </div>
                </div>
            </div>
            <div className="rack_information_location" style={{ paddingLeft: "10px" }}>
                <div >Location</div>
                
             
            </div>

            <div
                style={{
                    display: "flex",
                    width: "200px",
                    justifyContent: "space-between",
                    paddingLeft: "10px",
                    gap: "50px"
                }}>
                <div className="rack_information_location">
                    <div style={{
                      
                            fontWeight: "bold",
                        }} >Floor</div>
                    <div
                        style={{
                      
                            fontWeight: "bold",
                        }}>
                        {data ? ordinal_suffix_of(parseInt(data.floor)) : ""}
                    </div>
                </div>
                <div className="rack_information_location">
                    <div style={{
                          
                          fontWeight: "bold",
                      }} >Room</div>
                    <div
                        style={{
                          
                            fontWeight: "bold",
                        }}>
                        {/* {data ? listtounit(data.listitem) :"" }/{data ? data.countitem :""} */}
                        {data ? data.room : ""}
                   
                    </div>
                </div>
                <div className="rack_information_location">
                    <div style={{
                          
                          fontWeight: "bold",
                      }} >Area</div>
                    <div
                        style={{
                          
                            fontWeight: "bold",
                        }}>
                        {/* {data ? listtounit(data.listitem) :"" }/{data ? data.countitem :""} */}
                        {data ? data.area : ""}
                    </div>
                </div>
            </div>

            <div className="rack_information_location" style={{ paddingLeft: "10px" }}>
                <div >Client</div>
                <div
                    style={{
                        fontWeight: "bold"
                    }}>
                    {data ? data.client : ""}
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    width: " calc(100% - 20px) ",
                    justifyContent: "space-between",
                    paddingLeft: "10px",
                }}>
                <div className="rack_information_location">
                    <div >Total Item(s)</div>
                    <div
                        style={{
                      
                            fontWeight: "bold",
                        }}>
                        {data ? data.total_item : ""}
                    </div>
                </div>
                <div className="rack_information_location">
                    <div >U(s) Available</div>
                    <div
                        style={{
                          
                            fontWeight: "bold",
                        }}>
                        {/* {data ? listtounit(data.listitem) :"" }/{data ? data.countitem :""} */}
                        {data ? data.numberOfU - data.total_unit  : ""} /{" "}
                        {data ? data.numberOfU : ""}
                    </div>
                </div>

                <div className="rack_information_location">
                    <div >U(s) Used</div>
                    <div
                        style={{
                          
                            fontWeight: "bold",
                        }}>
                        {/* {data ? listtounit(data.listitem) :"" }/{data ? data.countitem :""} */}
                        {data ?data.total_unit : ""} /{" "}
                        {data ? data.numberOfU : ""}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RackInfromation;
