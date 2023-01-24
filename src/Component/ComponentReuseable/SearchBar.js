// System library imports
import React from "react";

// Image imports
import searchIcon from "../../svg/search_icon.svg";

// Style imports
import "./style.scss";

const SearchBar = (props) => {
    // Destructure props
    let { name, value, search, searchContent } = props;

    return (
        <div className='reusable-search'>
            <input
                className='reusable-search__bar'
                type='text'
                placeholder='Search'
                name={name}
                value={value}
                onChange={(e) => search(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        searchContent();
                    }
                }}
                onBlur={() => {
                    searchContent();
                }}
            />
            <img
                className='reusable-search__icon'
                src={searchIcon}
                alt='search-icon'
            />
        </div>
    );
};

export default SearchBar;
