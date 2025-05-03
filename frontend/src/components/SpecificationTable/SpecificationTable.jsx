import React from 'react';
import PropTypes from 'prop-types';
import styles from './SpecificationTable.module.css'; // Đảm bảo có file CSS này

const SpecificationTable = ({ specs }) => {
  let parsedSpecs = null;

  if (typeof specs === 'string') {
    try {
      parsedSpecs = JSON.parse(specs);
      if (!Array.isArray(parsedSpecs)) {
        console.error("Lỗi: Chuỗi JSON specifications sau khi parse không phải là một mảng.", parsedSpecs);
        parsedSpecs = null;
      } else {
        console.log("Đã parse specifications từ chuỗi JSON.");
      }
    } catch (error) {
      console.error("Lỗi khi parse chuỗi JSON specifications:", error, "Chuỗi gốc:", specs);
    }
  } else if (Array.isArray(specs)) {
    parsedSpecs = specs;
    console.log("Sử dụng specifications trực tiếp từ mảng prop.");
  } else {
    console.warn("Prop 'specs' không hợp lệ. Mong đợi chuỗi JSON hoặc mảng, nhận được:", typeof specs);
  }

  if (!parsedSpecs || parsedSpecs.length === 0) {
    return <p className={styles.noSpecs}>Không có thông số kỹ thuật chi tiết.</p>;
  }

  const groupedSpecs = parsedSpecs.reduce((groups, item) => {
    if (typeof item === 'object' && item !== null && item.group && typeof item.group === 'string' && item.title && typeof item.title === 'string' && item.content !== undefined) {
        const groupName = item.group.trim();
        const title = item.title.trim();
        if (!groupName || !title) {
            console.warn("Bỏ qua thông số có group hoặc title rỗng:", item);
            return groups;
        }
        if (!groups[groupName]) {
            groups[groupName] = [];
        }
        groups[groupName].push({ ...item, title: title, content: String(item.content) });
    } else {
        console.warn("Bỏ qua thông số kỹ thuật không hợp lệ:", item);
    }
    return groups;
  }, {});

  if (Object.keys(groupedSpecs).length === 0) {
    return <p className={styles.noSpecs}>Không có thông số kỹ thuật hợp lệ.</p>;
  }

  return (
    <div className={styles.specsContainer}>
      {Object.entries(groupedSpecs).map(([groupName, itemsInGroup], groupIndex) => (
        <div key={`${groupName}-${groupIndex}`} className={styles.specGroup}>
          <h4 className={styles.groupTitle}>{groupName}</h4>
          <table className={styles.specTable}>
            <tbody>
              {itemsInGroup.map((item, itemIndex) => (
                <tr key={`${groupName}-${item.title}-${itemIndex}`}>
                  <th>{item.title}</th>
                  <td>{item.content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

SpecificationTable.propTypes = {
  specs: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.shape({
      group: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      content: PropTypes.any.isRequired,
    }))
  ])
};

export default SpecificationTable;