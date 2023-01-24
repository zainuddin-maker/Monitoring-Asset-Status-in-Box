import { dateOption, enumFilterDate } from "./ComponentEnum";

const FilterDate = ({ filterDate, setFilterDate }) => {
    const option = dateOption;
    return (
        <div className='filter-date-container'>
            {Object.keys(option).map((key) => (
                <div
                    id={enumFilterDate[key] === filterDate && "active"}
                    onClick={() => setFilterDate(enumFilterDate[key])}>
                    {option[key]}
                </div>
            ))}
        </div>
    );
};

export default FilterDate;
