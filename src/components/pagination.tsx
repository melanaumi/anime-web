// src/components/Pagination.tsx
import React from 'react';
import ReactPaginate from 'react-paginate';

interface PaginationProps {
    pageCount: number;
    onPageChange: (selectedPage: { selected: number }) => void;
}

const Pagination: React.FC<PaginationProps> = ({ pageCount, onPageChange }) => {
    return (
        <ReactPaginate
            pageCount={pageCount}
            onPageChange={onPageChange}
            containerClassName="pagination"
            activeClassName="active"
        />
    );
};

export default Pagination;
