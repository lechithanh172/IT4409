import React from 'react';
import styles from './Pagination.module.css';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePageClick = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      onPageChange(pageNumber);
    }
  };


  const pageNumbers = [];
  const maxPagesToShow = 5;

  if (totalPages <= maxPagesToShow + 2) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {

    pageNumbers.push(1);
    let startPage = Math.max(2, currentPage - Math.floor((maxPagesToShow - 2) / 2));
    let endPage = Math.min(totalPages - 1, currentPage + Math.floor((maxPagesToShow - 1) / 2));


     if (currentPage - startPage < Math.floor((maxPagesToShow - 2) / 2)) {
         endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 3);
     }
      if (endPage - currentPage < Math.floor((maxPagesToShow - 1) / 2)) {
         startPage = Math.max(2, endPage - maxPagesToShow + 3);
     }


    if (startPage > 2) {
      pageNumbers.push('...');
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    if (endPage < totalPages - 1) {
      pageNumbers.push('...');
    }
    pageNumbers.push(totalPages);
  }


  return (
    <nav className={styles.paginationContainer} aria-label="Phân trang sản phẩm">
      <ul className={styles.paginationList}>
        {/* Nút Previous */}
        <li className={`${styles.pageItem} ${currentPage === 1 ? styles.disabled : ''}`}>
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.pageLink}
            aria-label="Trang trước"
          >
            <FiChevronLeft />
          </button>
        </li>

        {/* Các nút số trang */}
        {pageNumbers.map((number, index) => (
          <li
            key={index}
            className={`${styles.pageItem} ${number === currentPage ? styles.active : ''} ${number === '...' ? styles.disabled : ''}`}
          >
            {number === '...' ? (
              <span className={`${styles.pageLink} ${styles.ellipsis}`}>...</span>
            ) : (
              <button
                onClick={() => handlePageClick(number)}
                className={styles.pageLink}
                aria-current={number === currentPage ? 'page' : undefined}
              >
                {number}
              </button>
            )}
          </li>
        ))}

        {/* Nút Next */}
        <li className={`${styles.pageItem} ${currentPage === totalPages ? styles.disabled : ''}`}>
          <button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.pageLink}
            aria-label="Trang sau"
          >
            <FiChevronRight />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;