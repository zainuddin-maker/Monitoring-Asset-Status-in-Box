const PowerCard = (props) => {
    const { title, value, unit } = props;
    return (
        <div className='power-card'>
            <span id='type'>{title}</span>
            <span id='value'>{value}</span>
            <span id='unit'>{unit}</span>
        </div>
    );
};

export default PowerCard;
