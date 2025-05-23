import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CartItem.module.css';
import { FaTrashAlt, FaPlus, FaMinus, FaExclamationCircle } from 'react-icons/fa';

const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount) || amount === 0) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const DEFAULT_IMAGE_URL = '/images/placeholder-image.png';

const CartItem = ({ item, onRemove, onQuantityChange, onToggleSelect, isUpdating }) => {
    const itemKey = item.uniqueId;

    const handleIncreaseQuantity = () => {
        if (item.quantity >= item.stockQuantity) {
            alert(`Số lượng tồn kho của "${item.name} - ${item.color}" chỉ còn ${item.stockQuantity}.`);
            return;
        }
        onQuantityChange(itemKey, 1); 
    };

    const handleDecreaseQuantity = () => {
        if (item.quantity > 1) {
            onQuantityChange(itemKey, -1);
        }
    };

    const handleImageError = (e) => {
        if (e.target.src !== DEFAULT_IMAGE_URL) {
            e.target.onerror = null;
            e.target.src = DEFAULT_IMAGE_URL;
        }
    };

    const isDisabled = isUpdating || !!item.error;

    return (
        <tr className={`${styles.cartItemRow} ${item.error ? styles.itemWithError : ''}`}>
            <td className={styles.columnSelect}>
                <input
                    type="checkbox"
                    className={styles.itemSelectCheckbox}
                    checked={item.is_selected ?? true}
                    onChange={() => onToggleSelect(itemKey)}
                    disabled={isDisabled}
                    aria-label={`Chọn sản phẩm ${item.name} - ${item.color}`}
                />
            </td>
            <td className={styles.columnProduct}>
                <div className={styles.productInfo}>
                    <Link to={`/product/${item.productId}`} className={styles.productImageLink}>
                        <img
                            src={item.imageUrl || DEFAULT_IMAGE_URL}
                            alt={`${item.name} - ${item.color}`}
                            className={styles.productImage}
                            onError={handleImageError}
                            loading="lazy"
                        />
                    </Link>
                    <div className={styles.productDetails}>
                        <Link to={`/product/${item.productId}`} className={styles.productName}>
                            {item.name || 'Sản phẩm lỗi'}
                        </Link>
                        {item.color && (<p className={styles.variantName}>Màu: {item.color}</p>)}
                        {item.error && (<p className={styles.itemErrorMessage}><FaExclamationCircle /> {item.error}</p>)}
                    </div>
                </div>
            </td>
            <td className={styles.columnQuantity}>
                <div className={styles.quantityControl}>
                    <button
                        onClick={handleDecreaseQuantity} 
                        className={styles.quantityButton}
                        disabled={isDisabled || item.quantity <= 1}
                        aria-label="Giảm số lượng"
                    > <FaMinus /> </button>
                    <span className={styles.quantityDisplay}>{item.quantity}</span>
                    <button
                        onClick={handleIncreaseQuantity}
                        className={styles.quantityButton}
                        disabled={isDisabled || item.quantity >= item.stockQuantity}
                        aria-label="Tăng số lượng"
                    > <FaPlus /> </button>
                </div>
                {item.quantity >= item.stockQuantity && !item.error && !isUpdating && (
                     <span className={styles.maxQuantityNote}>Tối đa</span>
                )}
            </td>
            <td className={`${styles.columnPrice} ${styles.alignRight}`}> {formatCurrency(item.price)} </td>
            <td className={`${styles.columnTotal} ${styles.alignRight}`}> {formatCurrency(item.price * item.quantity)} </td>
            <td className={styles.columnActions}>
                <button
                    onClick={() => onRemove(itemKey)}
                    className={styles.removeButton}
                    title={`Xóa ${item.name} - ${item.color}`}
                    aria-label={`Xóa ${item.name} - ${item.color}`}
                    disabled={isUpdating}
                > <FaTrashAlt /> </button>
            </td>
        </tr>
    );
};

export default CartItem;