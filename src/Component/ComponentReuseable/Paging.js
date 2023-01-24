// System library imports
import React from "react";

// Image imports
import pagingFirst from "../../svg/paging_first.svg";
import pagingPrev from "../../svg/paging_prev.svg";
import pagingNext from "../../svg/paging_next.svg";
import pagingLast from "../../svg/paging_last.svg";

// Style imports
import "./style.scss";

const Paging = (props) => {
    // Destructure props
    let {
        firstPage,
        lastPage,
        nextPage,
        prevPage,
        currentPageNumber,
        lastPageNumber,
    } = props;

    return (
        <div className='reusable-paging'>
            <div
                className='reusable-paging__icon-container'
                onClick={() => firstPage()}>
                <img
                    className='reusable-paging__icon'
                    src={pagingFirst}
                    alt='paging-first'
                />
            </div>
            <div
                className='reusable-paging__icon-container'
                onClick={() => prevPage()}>
                <img
                    className='reusable-paging__icon'
                    src={pagingPrev}
                    alt='paging-prev'
                />
            </div>
            <div className='reusable-paging__number'>
                <span className='reusable-paging__number-value'>
                    {currentPageNumber}/{lastPageNumber}
                </span>
            </div>
            <div
                className='reusable-paging__icon-container'
                onClick={() => nextPage()}>
                <img
                    className='reusable-paging__icon'
                    src={pagingNext}
                    alt='paging-next'
                />
            </div>
            <div
                className='reusable-paging__icon-container'
                onClick={() => lastPage()}>
                <img
                    className='paging-icon'
                    src={pagingLast}
                    alt='paging-last'
                />
            </div>
        </div>
    );
};

export default Paging;
