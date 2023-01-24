const RequestStatusSquare = ({ title, number, color }) => {
    return (
        <div className='change-request-status-square'>
            <span>{title}</span>
            <div className='change-request-status-number' id={color}>
                <span>{number}</span>
            </div>
        </div>
    );
};

export default RequestStatusSquare;
