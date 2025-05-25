import React from 'react';
import styles from './SortDropdown.module.css';

const SortDropdown = ({ currentSort, onSortChange }) => {
  const handleSelectChange = (e) => {
    onSortChange(e.target.value);
  };

  return (
    <div className={styles.sortContainer}>
      <label htmlFor="sort-select" className={styles.sortLabel}>Sắp xếp theo:</label>
      <select
        id="sort-select"
        value={currentSort}
        onChange={handleSelectChange}
        className={styles.sortSelect}
      >
        <option value="">Mặc định</option> {/* Hoặc 'featured' */}
        <option value="name_asc">Tên A-Z</option>
        <option value="name_desc">Tên Z-A</option>
        <option value="price_asc">Giá tăng dần</option>
        <option value="price_desc">Giá giảm dần</option>
        {/* Thêm các tiêu chí sắp xếp khác nếu cần */}
      </select>
    </div>
  );
};

export default SortDropdown;