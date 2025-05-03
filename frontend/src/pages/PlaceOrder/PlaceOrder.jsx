import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './PlaceOrder.module.css'; // Sử dụng CSS Module đã được làm đẹp
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api'; // Đảm bảo apiService có hàm createOrder
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'; // Thêm icon Check

// --- GIẢ ĐỊNH CÁC HÀM FETCH ĐƠN VỊ HÀNH CHÍNH ---
// Thay thế bằng API thực tế của bạn hoặc API công cộng
const fetchCities = async () => {
    console.log("Fetching cities...");
    // Dữ liệu mẫu:
    await new Promise(resolve => setTimeout(resolve, 300)); // Giả lập độ trễ mạng
    try {
        // Thay thế bằng fetch API thật, ví dụ:
        // const response = await fetch('https://provinces.open-api.vn/api/p/');
        // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        // const data = await response.json();
        // return data.sort((a, b) => a.name.localeCompare(b.name)); // Sắp xếp theo tên
        return [
            { code: "79", name: "Thành phố Hồ Chí Minh" },
            { code: "01", name: "Thành phố Hà Nội" },
            { code: "48", name: "Thành phố Đà Nẵng" },
        ].sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error("Error fetching cities:", error);
        throw error; // Ném lỗi ra để xử lý bên ngoài nếu cần
    }
};
const fetchDistricts = async (cityCode) => {
    if (!cityCode) return [];
    console.log(`Fetching districts for city: ${cityCode}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
        // Thay thế bằng fetch API thật, ví dụ:
        // const response = await fetch(`https://provinces.open-api.vn/api/p/${cityCode}?depth=2`);
        // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        // const data = await response.json();
        // return data?.districts?.sort((a, b) => a.name.localeCompare(b.name)) || [];
        let districtsData = [];
        if (cityCode === "79") districtsData = [{ code: "769", name: "Quận 1" }, { code: "770", name: "Quận 3" }, { code: "778", name: "Thành phố Thủ Đức" }];
        else if (cityCode === "01") districtsData = [{ code: "001", name: "Ba Đình" }, { code: "002", name: "Hoàn Kiếm" }];
        else if (cityCode === "48") districtsData = [{ code: "490", name: "Liên Chiểu" }, { code: "491", name: "Thanh Khê" }];
        return districtsData.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error(`Error fetching districts for city ${cityCode}:`, error);
        throw error;
    }
};
const fetchWards = async (districtCode) => {
    if (!districtCode) return [];
    console.log(`Fetching wards for district: ${districtCode}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
        // Thay thế bằng fetch API thật, ví dụ:
        // const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        // const data = await response.json();
        // return data?.wards?.sort((a, b) => a.name.localeCompare(b.name)) || [];
        let wardsData = [];
        if (districtCode === "769") wardsData = [{ code: "27175", name: "Phường Bến Nghé" }, { code: "27178", name: "Phường Cầu Ông Lãnh" }];
        else if (districtCode === "770") wardsData = [{ code: "27181", name: "Phường 6" }, { code: "27184", name: "Phường Võ Thị Sáu" }];
        else if (districtCode === "001") wardsData = [{ code: "00001", name: "Phường Phúc Xá" }, { code: "00004", name: "Phường Trúc Bạch" }];
        return wardsData.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error(`Error fetching wards for district ${districtCode}:`, error);
        throw error;
    }
};
// -------------------------------------------------

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Hàm lấy giá variant (giữ nguyên)
const getVariantFinalPrice = (variant, mainProductPrice) => {
    if (typeof variant?.finalPrice === 'number') { return variant.finalPrice; }
    if (typeof variant?.price === 'number') { return variant.price; }
    if (typeof variant?.basePrice === 'number' && typeof variant?.discount === 'number' && variant.discount > 0) {
        return variant.basePrice * (1 - variant.discount / 100);
    }
    if (typeof variant?.basePrice === 'number') { return variant.basePrice; }
    console.warn(`Variant ${variant?.variantId} missing price, falling back to main price: ${mainProductPrice}`);
    return mainProductPrice ?? 0;
};
// -------------------------------------------------------------------

const PlaceOrder = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    // --- State cho Form Giao Hàng ---
    const [shippingInfo, setShippingInfo] = useState({
        cityCode: '',
        cityName: '',
        districtCode: '',
        districtName: '',
        wardCode: '',
        wardName: '',
        detailedAddress: '',
        phone: user?.phone || '',
        email: user?.email || '',
        shippingMethod: 'STANDARD',
        notes: ''
    });
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [isFetchingAddresses, setIsFetchingAddresses] = useState({ cities: false, districts: false, wards: false });

    // --- State cho Đơn Hàng ---
    const [orderItems, setOrderItems] = useState([]);
    const [orderTotal, setOrderTotal] = useState(0);
    const [shippingFee, setShippingFee] = useState(null);

    // --- State Trạng Thái ---
    const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
    const [isShippingInfoSaved, setIsShippingInfoSaved] = useState(false);
    const [isCalculatingFee, setIsCalculatingFee] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [error, setError] = useState(null);

    // --- Định nghĩa calculateShippingFee bằng useCallback ---
    const calculateShippingFee = useCallback((method, cityCode) => {
        if (!method || !cityCode) {
             setShippingFee(null);
             return;
        }
        console.log(`Calculating shipping fee for method: ${method}, city: ${cityCode}`);
        setIsCalculatingFee(true);
        setShippingFee(null);
        let fee = 0;
        if (method === 'EXPRESS') { fee = 40000; }
        else { // STANDARD
            fee = 20000;
            if (cityCode === '79' || cityCode === '01') { fee = 15000; }
            // if (orderTotal > 500000) { fee = 0; } // Logic free ship
        }
        setTimeout(() => { // Giả lập API call
            setShippingFee(fee);
            setIsCalculatingFee(false);
            console.log("Shipping fee calculated:", fee);
        }, 500);
    // Phụ thuộc vào orderTotal nếu logic tính phí cần đến nó
    }, [orderTotal]);

    // --- Load dữ liệu đơn hàng từ sessionStorage và Fetch Cities ---
    useEffect(() => {
        console.log("PlaceOrder: Component did mount. Loading initial data...");
        let dataLoaded = false;
        const savedOrderData = sessionStorage.getItem('pendingOrderData');

        if (savedOrderData) {
            try {
                const parsedData = JSON.parse(savedOrderData);
                if (parsedData?.items?.length > 0 && typeof parsedData.total === 'number') {
                    setOrderItems(parsedData.items);
                    setOrderTotal(parsedData.total);
                    dataLoaded = true;
                    console.log("Loaded order data:", parsedData);

                    const savedShipping = sessionStorage.getItem('savedShippingInfo');
                    if (savedShipping) {
                        try {
                           const parsedShipping = JSON.parse(savedShipping);
                           // Cập nhật state shippingInfo TRƯỚC khi gọi calculateShippingFee
                           setShippingInfo(prev => ({ ...prev, ...parsedShipping }));
                           setIsShippingInfoSaved(true);
                           // Gọi calculateShippingFee trực tiếp ở đây sau khi state đã cập nhật
                           calculateShippingFee(parsedShipping.shippingMethod, parsedShipping.cityCode);
                           console.log("Loaded saved shipping info:", parsedShipping);
                        } catch (e) {
                           console.error("Error parsing saved shipping info:", e);
                           sessionStorage.removeItem('savedShippingInfo');
                        }
                    }
                } else { console.error("Invalid order data format."); }
            } catch (e) { console.error("Error parsing order data:", e); }
        }

        if (!dataLoaded) {
            console.warn("No valid order data found, navigating back to cart.");
            setTimeout(() => navigate('/cart'), 0);
            return;
        }

        // Cập nhật thông tin user nếu chưa load từ session
        if (user && !sessionStorage.getItem('savedShippingInfo')) {
             setShippingInfo(prev => ({
                 ...prev,
                 email: prev.email || user.email || '',
                 phone: prev.phone || user.phone || '',
             }));
         }

        // Fetch Tỉnh/Thành phố
        const loadCities = async () => {
            setIsFetchingAddresses(prev => ({ ...prev, cities: true }));
            try {
                const cityData = await fetchCities();
                setCities(cityData || []);
                 const currentShippingInfo = JSON.parse(sessionStorage.getItem('savedShippingInfo') || '{}');
                 if (currentShippingInfo.cityCode && cityData?.some(c => c.code === currentShippingInfo.cityCode)) {
                     console.log("City code loaded from session, will trigger district fetch.");
                 }
            } catch (err) { console.error("Error fetching cities:", err); setError("Lỗi tải Tỉnh/Thành phố."); }
            finally { setIsFetchingAddresses(prev => ({ ...prev, cities: false })); }
        };

        loadCities();
        setIsInitialLoadComplete(true);

    // Loại bỏ calculateShippingFee khỏi deps, thêm user/isAuthenticated nếu cần
    }, [navigate, user, isAuthenticated]);


    // --- Fetch Districts khi City thay đổi ---
    useEffect(() => {
        const cityCode = shippingInfo.cityCode;
        if (cityCode && isInitialLoadComplete) {
            const loadDistricts = async () => {
                setDistricts([]); setWards([]);
                setShippingInfo(prev => ({...prev, districtCode: '', districtName: '', wardCode: '', wardName: ''}));
                setIsFetchingAddresses(prev => ({ ...prev, districts: true, wards: false }));
                try {
                    const districtData = await fetchDistricts(cityCode);
                    setDistricts(districtData || []);
                    const currentShippingInfo = JSON.parse(sessionStorage.getItem('savedShippingInfo') || '{}');
                     if (currentShippingInfo.districtCode && districtData?.some(d => d.code === currentShippingInfo.districtCode)) {
                          console.log("District code loaded from session, will trigger ward fetch.");
                     }
                } catch (err) { console.error(`Error fetching districts:`, err); }
                finally { setIsFetchingAddresses(prev => ({ ...prev, districts: false })); }
            };
            loadDistricts();
        } else if (!cityCode) { setDistricts([]); setWards([]); }
    }, [shippingInfo.cityCode, isInitialLoadComplete]);


    // --- Fetch Wards khi District thay đổi ---
    useEffect(() => {
        const districtCode = shippingInfo.districtCode;
        if (districtCode && isInitialLoadComplete && shippingInfo.cityCode) {
            const loadWards = async () => {
                setWards([]);
                setShippingInfo(prev => ({...prev, wardCode: '', wardName: ''}));
                setIsFetchingAddresses(prev => ({ ...prev, wards: true }));
                try {
                    const wardData = await fetchWards(districtCode);
                    setWards(wardData || []);
                } catch (err) { console.error(`Error fetching wards:`, err); }
                finally { setIsFetchingAddresses(prev => ({ ...prev, wards: false })); }
            };
            loadWards();
        } else if (!districtCode) { setWards([]); }
    }, [shippingInfo.districtCode, isInitialLoadComplete, shippingInfo.cityCode]);


    // --- Xử lý thay đổi input trong form ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let nameValue = '';
        let updatedShippingInfo = { ...shippingInfo, [name]: value };

        if (name === 'cityCode') {
            nameValue = cities.find(c => c.code === value)?.name || '';
            updatedShippingInfo = { ...updatedShippingInfo, cityName: nameValue, districtCode: '', districtName: '', wardCode: '', wardName: '' };
        } else if (name === 'districtCode') {
            nameValue = districts.find(d => d.code === value)?.name || '';
            updatedShippingInfo = { ...updatedShippingInfo, districtName: nameValue, wardCode: '', wardName: '' };
        } else if (name === 'wardCode') {
            nameValue = wards.find(w => w.code === value)?.name || '';
            updatedShippingInfo = { ...updatedShippingInfo, wardName: nameValue };
        }

        setShippingInfo(updatedShippingInfo);

        if (['cityCode', 'districtCode', 'wardCode', 'detailedAddress', 'shippingMethod'].includes(name)) {
            setIsShippingInfoSaved(false);
            setShippingFee(null);
        }
        setError(null);
    };

    // --- Xử lý lưu thông tin vận chuyển ---
    const handleSaveShippingInfo = (e) => {
        e.preventDefault();
        if (!shippingInfo.cityCode || !shippingInfo.districtCode || !shippingInfo.wardCode || !shippingInfo.detailedAddress.trim() || !shippingInfo.phone.trim() || !shippingInfo.email.trim()) {
            alert("Vui lòng điền đầy đủ thông tin địa chỉ, SĐT và Email.");
            return;
        }
        try {
            sessionStorage.setItem('savedShippingInfo', JSON.stringify(shippingInfo));
            setIsShippingInfoSaved(true);
            setError(null);
            console.log("Shipping info saved:", shippingInfo);
            calculateShippingFee(shippingInfo.shippingMethod, shippingInfo.cityCode);
        } catch (error) {
            console.error("Error saving shipping info:", error);
            alert("Lỗi khi lưu thông tin vận chuyển.");
            setIsShippingInfoSaved(false);
        }
    };

    // --- Xử lý xác nhận đặt hàng ---
    const handleConfirmOrder = async () => {
        if (!isShippingInfoSaved) { alert("Vui lòng lưu thông tin vận chuyển."); return; }
        if (!isAuthenticated || !user?.userId) { alert("Vui lòng đăng nhập."); navigate('/login'); return; }
        if (orderItems.length === 0) { alert("Đơn hàng trống."); navigate('/cart'); return; }

        setIsPlacingOrder(true); setError(null);

        const savedShipping = JSON.parse(sessionStorage.getItem('savedShippingInfo') || '{}');
        if (!savedShipping.cityName || !savedShipping.districtName || !savedShipping.wardName || !savedShipping.detailedAddress) {
             alert("Thông tin địa chỉ đã lưu không đầy đủ. Vui lòng lưu lại.");
             setIsPlacingOrder(false);
             return;
        }

        const fullAddress = `${savedShipping.detailedAddress}, ${savedShipping.wardName}, ${savedShipping.districtName}, ${savedShipping.cityName}`;
        const finalOrderData = {
            shippingAddress: fullAddress,
            paymentMethod: "CASH",
            deliveryMethod: savedShipping.shippingMethod,
            note: savedShipping.notes,
            items: orderItems.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity
            })),
        };
        console.log("Attempting final order creation with data:", finalOrderData);

        try {
            const response = await apiService.createOrder(finalOrderData);
            console.log("API Create Order Response:", response);
            sessionStorage.removeItem('pendingOrderData');
            sessionStorage.removeItem('savedShippingInfo');
            alert(`Đặt hàng thành công! Chúng tôi sẽ liên hệ sớm.`); // Thay đổi thông báo
            navigate('/order-success');
        } catch (err) {
            console.error("Lỗi khi xác nhận đặt hàng:", err);
            const errorMessage = err.response?.data?.message || err.message || "Đặt hàng không thành công.";
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    // --- Tính toán tổng tiền cuối cùng ---
     const totalAmount = useMemo(() => {
         return orderTotal + (shippingFee ?? 0);
     }, [orderTotal, shippingFee]);

    // --- Render Logic ---
    if (!isInitialLoadComplete && !orderItems.length) {
        return <div className={styles.placeOrderContainer} style={{minHeight: '60vh', display: 'flex', alignItems:'center', justifyContent:'center'}}><Spinner size="large" /></div>;
    }

    if (orderItems.length === 0 && isInitialLoadComplete) {
         return (
            <div className={styles.placeOrderContainer} style={{ textAlign: 'center', padding: '40px 20px' }}>
                <FaExclamationTriangle size={40} style={{ color: '#dc3545', marginBottom: '15px'}} />
                <h2>Không tìm thấy thông tin đơn hàng</h2>
                <p>Vui lòng quay lại giỏ hàng để chọn sản phẩm.</p>
                <Link to="/cart"><Button variant='secondary'>Quay lại giỏ hàng</Button></Link>
            </div>
        );
    }

    return (
        <div className={styles.placeOrderContainer}>
            <h1>Xác nhận đơn hàng</h1>
            <div className={styles.layoutWrapper}>

                {/* === CONTAINER THÔNG TIN GIAO HÀNG (TRÁI) === */}
                <div className={styles.shippingInfoContainer}>
                    <h2>Thông tin giao hàng</h2>
                    <div className={styles.shippingForm}>
                        {/* Tỉnh/Thành phố */}
                        <div className={styles.formGroup}>
                            <label htmlFor="cityCode">Tỉnh/Thành phố <span className={styles.required}>*</span></label>
                            <select id="cityCode" name="cityCode" value={shippingInfo.cityCode} onChange={handleInputChange} required disabled={isFetchingAddresses.cities || isPlacingOrder}>
                                <option value="">{isFetchingAddresses.cities ? 'Đang tải...' : '-- Chọn Tỉnh/Thành --'}</option>
                                {cities.map(city => <option key={city.code} value={city.code}>{city.name}</option>)}
                            </select>
                        </div>

                        {/* Quận/Huyện */}
                        <div className={styles.formGroup}>
                            <label htmlFor="districtCode">Quận/Huyện <span className={styles.required}>*</span></label>
                            <select id="districtCode" name="districtCode" value={shippingInfo.districtCode} onChange={handleInputChange} required disabled={!shippingInfo.cityCode || isFetchingAddresses.districts || isPlacingOrder}>
                                <option value="">{isFetchingAddresses.districts ? 'Đang tải...' : '-- Chọn Quận/Huyện --'}</option>
                                {districts.map(district => <option key={district.code} value={district.code}>{district.name}</option>)}
                            </select>
                        </div>

                        {/* Phường/Xã */}
                        <div className={styles.formGroup}>
                            <label htmlFor="wardCode">Phường/Xã <span className={styles.required}>*</span></label>
                            <select id="wardCode" name="wardCode" value={shippingInfo.wardCode} onChange={handleInputChange} required disabled={!shippingInfo.districtCode || isFetchingAddresses.wards || isPlacingOrder}>
                                <option value="">{isFetchingAddresses.wards ? 'Đang tải...' : '-- Chọn Phường/Xã --'}</option>
                                {wards.map(ward => <option key={ward.code} value={ward.code}>{ward.name}</option>)}
                            </select>
                        </div>

                        {/* Địa chỉ chi tiết */}
                        <div className={styles.formGroup}>
                            <label htmlFor="detailedAddress">Địa chỉ cụ thể (Số nhà, tên đường...) <span className={styles.required}>*</span></label>
                            <input type="text" id="detailedAddress" name="detailedAddress" value={shippingInfo.detailedAddress} onChange={handleInputChange} required placeholder="Ví dụ: 123 Đường ABC" disabled={isPlacingOrder}/>
                        </div>

                        {/* Số điện thoại */}
                        <div className={styles.formGroup}>
                            <label htmlFor="phone">Số điện thoại <span className={styles.required}>*</span></label>
                            <input type="tel" id="phone" name="phone" value={shippingInfo.phone} onChange={handleInputChange} required placeholder="Để shipper liên hệ" disabled={isPlacingOrder}/>
                        </div>

                        {/* Email */}
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email <span className={styles.required}>*</span></label>
                            <input type="email" id="email" name="email" value={shippingInfo.email} onChange={handleInputChange} required placeholder="Để nhận thông tin đơn hàng" disabled={isPlacingOrder}/>
                        </div>

                        {/* Phương thức vận chuyển */}
                        <div className={styles.formGroup}>
                            <label htmlFor="shippingMethod">Phương thức vận chuyển</label>
                            <select id="shippingMethod" name="shippingMethod" value={shippingInfo.shippingMethod} onChange={handleInputChange} disabled={isPlacingOrder}>
                                <option value="STANDARD">Giao hàng tiêu chuẩn</option>
                                <option value="EXPRESS">Giao hàng nhanh</option>
                            </select>
                        </div>

                        {/* Ghi chú */}
                        <div className={styles.formGroup}>
                            <label htmlFor="notes">Ghi chú</label>
                            <textarea id="notes" name="notes" value={shippingInfo.notes} onChange={handleInputChange} rows="3" placeholder="Ghi chú cho người giao hàng (tùy chọn)..." disabled={isPlacingOrder}/>
                        </div>

                         {/* Nút Lưu thông tin */}
                        <Button
                            onClick={handleSaveShippingInfo}
                            variant={isShippingInfoSaved ? "success" : "secondary"}
                            className={styles.saveShippingButton}
                            disabled={isCalculatingFee || isPlacingOrder}
                        >
                            {isCalculatingFee ? <Spinner size="small" /> : (isShippingInfoSaved ? <><FaCheckCircle /> Đã lưu</> : 'Lưu & Tính phí')}
                        </Button>
                    </div>
                </div>
                {/* === KẾT THÚC CONTAINER THÔNG TIN GIAO HÀNG === */}


                {/* === CONTAINER ĐƠN HÀNG (PHẢI) === */}
                <div className={styles.orderSummaryContainer}>
                    <h2>Đơn hàng của bạn ({orderItems.reduce((acc, item) => acc + item.quantity, 0)})</h2>
                    <div className={styles.orderItemsList}>
                        {orderItems.map(item => (
                            <div key={item.uniqueId} className={styles.orderItem}>
                                <img src={item.imageUrl || '/images/placeholder-image.png'} alt={item.name} className={styles.itemImage}/>
                                <div className={styles.itemDetails}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    {item.color && <span className={styles.itemColor}>Màu: {item.color}</span>}
                                    <span className={styles.itemQuantity}>SL: {item.quantity}</span>
                                </div>
                                <span className={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.orderSummary}>
                        <div className={styles.summaryRow}>
                            <span>Tạm tính:</span>
                            <span>{formatCurrency(orderTotal)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Phí vận chuyển:</span>
                            <span>
                                {isCalculatingFee ? <Spinner size="tiny" /> : (shippingFee !== null ? formatCurrency(shippingFee) : '...')}
                            </span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.grandTotal}`}>
                            <span>Tổng cộng:</span>
                            <span className={styles.totalAmountValue}>
                                {shippingFee !== null ? formatCurrency(totalAmount) : formatCurrency(orderTotal)}
                            </span>
                        </div>
                        <p className={styles.vatNote}>(Giá đã bao gồm VAT nếu có)</p>
                         {/* Hiển thị lỗi đặt hàng cuối cùng */}
                         {error && (<p className={styles.finalErrorMessage}>{error}</p>)}
                         {/* Nút Xác nhận cuối cùng */}
                         <Button
                            onClick={handleConfirmOrder}
                            variant="primary"
                            className={styles.confirmOrderButton}
                            disabled={!isShippingInfoSaved || isCalculatingFee || isPlacingOrder}
                        >
                            {isPlacingOrder ? <Spinner size="small" color="#fff"/> : 'Xác nhận & Thanh toán'}
                        </Button>
                    </div>
                </div>
                 {/* === KẾT THÚC CONTAINER ĐƠN HÀNG === */}

            </div>
            {/* --- Kết thúc Wrapper layout --- */}

             {/* Modal xác nhận xóa (Nếu bạn có nút xóa item trên trang này - hiện tại không có) */}
             {/* <ConfirmModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmRemove}
                title="Xác nhận thao tác"
                message={`Bạn có chắc chắn muốn xóa sản phẩm ... ?`}
                confirmText="Xóa sản phẩm"
                cancelText="Không xóa"
             /> */}
        </div>
    );
};

export default PlaceOrder;