import React from 'react'
interface IDates {
    startDate: string,
    endDate: string,
}

function formatDateRange(startDateStr: string, endDateStr: string) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    // console.log(start)
    // console.log(end)

    const sameMonth = start.getMonth() === end.getMonth();
    const sameYear = start.getFullYear() === end.getFullYear();

    const startMonth = start.toLocaleString('en-US', { month: 'short' });
    const endMonth = end.toLocaleString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    if (sameMonth && sameYear) {
        return `${startMonth} ${startDay} - ${endDay}, ${startYear}`;
    }

    if (!sameYear) {
        return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
    }

    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
}


const Dates = ({startDate, endDate}: IDates) => {
    return (
        <span className='text-sm font-medium'>
            {formatDateRange(startDate, endDate)}
        </span>
    )
}


export default Dates