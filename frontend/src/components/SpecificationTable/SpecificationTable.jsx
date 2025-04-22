import React from 'react';
import styles from './SpecificationTable.module.css';

const SpecificationTable = ({ specs, type = 'full' }) => {
  if (!specs || (type === 'summary' && !specs.summary) || (type === 'full' && !specs.full)) {
    return <p>Không có thông số kỹ thuật.</p>;
  }

  if (type === 'summary') {
    return (
      <table className={`${styles.specTable} ${styles.summaryTable}`}>
        <tbody>
          {specs.summary.map((item, index) => (
            <tr key={index}>
              <th>{item.label}</th>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // type === 'full'
  return (
    <div className={styles.fullSpecsContainer}>
      {specs.full.map((group, groupIndex) => (
        <div key={groupIndex} className={styles.specGroup}>
          {group.group && <h4 className={styles.groupTitle}>{group.group}</h4>}
          <table className={styles.specTable}>
            <tbody>
              {group.items.map((item, itemIndex) => (
                <tr key={itemIndex}>
                  <th>{item.label}</th>
                  <td>{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default SpecificationTable;