// src/pages/PlaceOrder/PlaceOrder.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './PlaceOrder.module.css';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

// --- API Fetch Functions ---
const fetchCities = async () => {
    console.log("Fetching cities from API...");
    try { const response = await apiService.getProvinces(); const d = response.data || []; if (!Array.isArray(d)) throw new Error("Invalid city data"); return d.sort((a,b) => a.name.localeCompare(b.name,'vi')); }
    catch(e){ console.error("Error fetching cities:",e.response?.data||e.message||e); throw new Error(`Lỗi tải Tỉnh/Thành: ${e.response?.data?.message||e.message||'Unknown'}`); }
};
const fetchDistricts = async (provinceCode) => {
    if (!provinceCode) return []; console.log(`Fetching districts for province: ${provinceCode}...`);
    try { const response = await apiService.getDistricts(provinceCode); const d = response.data || []; if (!Array.isArray(d)) throw new Error("Invalid district data"); return d.sort((a,b) => a.name.localeCompare(b.name,'vi')); }
    catch(e){ console.error(`Error fetching districts ${provinceCode}:`,e.response?.data||e.message||e); throw new Error(`Lỗi tải Quận/Huyện: ${e.response?.data?.message||e.message||'Unknown'}`); }
};
const fetchWards = async (districtCode) => {
    if (!districtCode) return []; console.log(`Fetching wards for district: ${districtCode}...`);
    try { const response = await apiService.getWards(districtCode); const d = response.data || []; if (!Array.isArray(d)) throw new Error("Invalid ward data"); return d.sort((a,b) => a.name.localeCompare(b.name,'vi')); }
    catch(e){ console.error(`Error fetching wards ${districtCode}:`,e.response?.data||e.message||e); throw new Error(`Lỗi tải Phường/Xã: ${e.response?.data?.message||e.message||'Unknown'}`); }
};

// --- Helper Functions ---
const formatCurrency = (amount) => { if (typeof amount !== 'number' || isNaN(amount)) return 'N/A'; return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount); };
const calculateTotalFromItems = (items) => { if (!Array.isArray(items)) return 0; return items.reduce((sum, item) => { const p = typeof item.price === 'number' ? item.price : 0; const q = typeof item.quantity === 'number' ? item.quantity : 0; return sum + (p * q); }, 0); };
// -------------------------------------------------------------------

const PlaceOrder = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [shippingInfo, setShippingInfo] = useState({ cityCode: '', provinceName: '', districtCode: '', districtFullName: '', wardCode: '', wardFullName: '', detailedAddress: '', phone: '', email: '', shippingMethod: 'STANDARD', notes: '' });
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [orderItems, setOrderItems] = useState([]);
    const [orderTotal, setOrderTotal] = useState(0); // Subtotal
    const [shippingFee, setShippingFee] = useState(null);
    const [isFetchingAddresses, setIsFetchingAddresses] = useState({ cities: false, districts: false, wards: false });
    const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false); // Tracks overall cycle
    const [isDataLoadSuccessful, setIsDataLoadSuccessful] = useState(false); // Tracks essential item data load
    const [isShippingInfoSaved, setIsShippingInfoSaved] = useState(false);
    const [isCalculatingFee, setIsCalculatingFee] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [error, setError] = useState(null);
    const [addressError, setAddressError] = useState(null);

    // --- Calculate Shipping Fee & Save State ---
    const calculateShippingFeeAndSave = useCallback(async (deliveryMethod, currentShippingInfo, currentOrderItems, onSaveComplete) => {
        if (!deliveryMethod || !currentShippingInfo?.wardFullName || !currentShippingInfo?.districtFullName || !currentShippingInfo?.provinceName || !Array.isArray(currentOrderItems) || currentOrderItems.length === 0) {
            const missing = [!deliveryMethod&&"PTVC",!currentShippingInfo?.wardFullName&&"P/Xã",!currentShippingInfo?.districtFullName&&"Q/Huyện",!currentShippingInfo?.provinceName&&"T/Thành",(!currentOrderItems?.length)&&"S.Phẩm"].filter(Boolean);
            setError(`Thiếu thông tin tính phí: ${missing.join(', ')}.`); onSaveComplete(null, new Error("Missing info")); return;
        }
        setIsCalculatingFee(true); setShippingFee(null); setError(null);
        const addrStr = `${currentShippingInfo.wardFullName}, ${currentShippingInfo.districtFullName}, ${currentShippingInfo.provinceName}`;
        const itemsPayload = currentOrderItems.map(i => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity }));
        const apiPayload = { shippingAddress: addrStr, items: itemsPayload, deliveryMethod: deliveryMethod };
        try {
            const response = await apiService.calculateShippingFee(apiPayload);
            if (response && typeof response.data === 'number' && response.data >= 0) {
                const fee = response.data; setShippingFee(fee);
                const infoToSave = { ...currentShippingInfo, shippingFee: fee, orderItems: currentOrderItems };
                sessionStorage.setItem('savedShippingInfo', JSON.stringify(infoToSave));
                setIsShippingInfoSaved(true); onSaveComplete(fee, null);
                console.log("Fee calculated and state saved:", infoToSave);
            } else { throw new Error("Phí vận chuyển không hợp lệ."); }
        } catch (err) {
            console.error("Error calc/save fee:", err); setError(err.response?.data?.message || err.message || "Lỗi tính phí/lưu.");
            setShippingFee(null); setIsShippingInfoSaved(false); onSaveComplete(null, err);
        } finally { setIsCalculatingFee(false); }
    }, [setError, setShippingFee, setIsShippingInfoSaved, setIsCalculatingFee]);

    // --- Load Initial Data (Corrected Logic) ---
    useEffect(() => {
        console.log("[PlaceOrder useEffect] Mounting. Starting initial data load...");
        let itemsLoadedSuccessfully = false;
        let loadedItemsTemp = [];

        // STEP 1: Load and validate essential data from pendingOrderData
        const savedOrderData = sessionStorage.getItem('pendingOrderData');
        console.log("[PlaceOrder useEffect] Raw pendingOrderData:", savedOrderData);

        if (savedOrderData) {
            try {
                const parsedData = JSON.parse(savedOrderData);
                console.log("[PlaceOrder useEffect] Parsed pendingOrderData:", parsedData);
                if (parsedData && parsedData.items && Array.isArray(parsedData.items) && parsedData.items.length > 0 &&
                    parsedData.items.every(item => item && item.productId != null && item.variantId != null && item.quantity != null && item.price != null))
                {
                    loadedItemsTemp = parsedData.items.map((item, index) => ({ ...item, uniqueId: item.uniqueId || `${item.productId}-${item.variantId}-${index}` }));
                    setOrderItems(loadedItemsTemp);
                    setOrderTotal(calculateTotalFromItems(loadedItemsTemp)); // Set subtotal based on loaded items
                    itemsLoadedSuccessfully = true;
                    console.log("[PlaceOrder useEffect] Successfully loaded items from pendingOrderData.");
                    // Crucially, DO NOT remove pendingOrderData yet. Wait until order placement or full save.
                } else { console.warn("[PlaceOrder useEffect] Invalid items structure in pendingOrderData."); }
            } catch (e) { console.error("[PlaceOrder useEffect] Error parsing pendingOrderData:", e); sessionStorage.removeItem('pendingOrderData'); } // Clear bad data
        } else { console.warn("[PlaceOrder useEffect] No pendingOrderData found."); }

        // STEP 2: Check if essential items loaded successfully
        if (!itemsLoadedSuccessfully) {
            console.error("[PlaceOrder useEffect] Essential item data NOT loaded. Redirecting to cart.");
            setIsDataLoadSuccessful(false);
            setIsInitialLoadComplete(true); // Mark load attempt complete
            setTimeout(() => navigate('/cart', { replace: true }), 50); // Navigate back immediately after short delay
            return; // Stop this effect run
        }

        // STEP 3: Essential data IS loaded. Proceed.
        setIsDataLoadSuccessful(true);
        console.log("[PlaceOrder useEffect] Essential data OK. Loading optional saved info & addresses.");

        // Load optional saved shipping info
        const savedShippingString = sessionStorage.getItem('savedShippingInfo');
        if (savedShippingString) {
            try {
                const parsedSavedShipping = JSON.parse(savedShippingString);
                if (parsedSavedShipping && typeof parsedSavedShipping === 'object') {
                    console.log("[PlaceOrder useEffect] Restoring form state from savedShippingInfo.");
                    setShippingInfo(prev => ({ ...prev, cityCode: parsedSavedShipping.cityCode || '', provinceName: parsedSavedShipping.provinceName || '', districtCode: parsedSavedShipping.districtCode || '', districtFullName: parsedSavedShipping.districtFullName || '', wardCode: parsedSavedShipping.wardCode || '', wardFullName: parsedSavedShipping.wardFullName || '', detailedAddress: parsedSavedShipping.detailedAddress || '', phone: parsedSavedShipping.phone || prev.phone, email: parsedSavedShipping.email || prev.email, shippingMethod: parsedSavedShipping.shippingMethod || 'STANDARD', notes: parsedSavedShipping.notes || '' }));
                    if (typeof parsedSavedShipping.shippingFee === 'number') { setShippingFee(parsedSavedShipping.shippingFee); }
                    setIsShippingInfoSaved(true);
                } else { sessionStorage.removeItem('savedShippingInfo'); }
            } catch (e) { console.error("[PlaceOrder useEffect] Error parsing savedShippingInfo:", e); sessionStorage.removeItem('savedShippingInfo'); }
        } else if (user) { // Apply user details if no saved info
            setShippingInfo(prev => ({ ...prev, email: prev.email || user.email || '', phone: prev.phone || user.phone || '' }));
        }

        // STEP 4: Fetch Cities
        const loadCities = async () => {
            setIsFetchingAddresses(prev => ({ ...prev, cities: true })); setAddressError(null);
            try {
                const cityData = await fetchCities(); setCities(cityData || []);
                const currentCityCode = shippingInfo.cityCode || JSON.parse(sessionStorage.getItem('savedShippingInfo') || '{}').cityCode;
                if (currentCityCode && !cityData?.some(c => c.code === currentCityCode)) {
                     console.warn("[PlaceOrder useEffect] Loaded/Saved cityCode invalid. Resetting address state.");
                     setShippingInfo(prev => ({ ...prev, cityCode: '', provinceName: '', districtCode: '', districtFullName: '', wardCode: '', wardFullName: '' }));
                     setIsShippingInfoSaved(false); setShippingFee(null);
                 }
            } catch (err) { console.error("[PlaceOrder useEffect] Error in loadCities:", err); setAddressError(err.message || "Lỗi tải Tỉnh/Thành phố."); }
            finally { setIsFetchingAddresses(prev => ({ ...prev, cities: false })); setIsInitialLoadComplete(true); console.log("[PlaceOrder useEffect] Initial load cycle complete."); }
        };
        loadCities();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, user]); // Run only once on mount or user change

     // Recalculate subtotal if items were to change (unlikely on this page, but safe)
     useEffect(() => { const newTotal = calculateTotalFromItems(orderItems); setOrderTotal(newTotal); }, [orderItems]);

    // Fetch Districts Effect
    useEffect(() => { if (!isDataLoadSuccessful || !shippingInfo.cityCode) return; const loadDistricts = async () => { setDistricts([]); setWards([]); setShippingInfo(prev => ({ ...prev, districtCode: '', districtFullName: '', wardCode: '', wardFullName: '' })); setIsFetchingAddresses(prev => ({ ...prev, districts: true, wards: false })); setAddressError(null); try { const d = await fetchDistricts(shippingInfo.cityCode); setDistricts(d || []); } catch (err) { setAddressError(err.message || "Lỗi tải Q/Huyện."); } finally { setIsFetchingAddresses(prev => ({ ...prev, districts: false })); } }; loadDistricts(); }, [shippingInfo.cityCode, isDataLoadSuccessful]);
    // Fetch Wards Effect
    useEffect(() => { if (!isDataLoadSuccessful || !shippingInfo.districtCode || !shippingInfo.cityCode) return; const loadWards = async () => { setWards([]); setShippingInfo(prev => ({ ...prev, wardCode: '', wardFullName: '' })); setIsFetchingAddresses(prev => ({ ...prev, wards: true })); setAddressError(null); try { const d = await fetchWards(shippingInfo.districtCode); setWards(d || []); } catch (err) { setAddressError(err.message || "Lỗi tải P/Xã."); } finally { setIsFetchingAddresses(prev => ({ ...prev, wards: false })); } }; loadWards(); }, [shippingInfo.districtCode, shippingInfo.cityCode, isDataLoadSuccessful]);

    // Handle Form Input Changes
    const handleInputChange = useCallback((e) => { const { name, value } = e.target; setShippingInfo(p => { let u = { ...p, [name]: value }; if (name === 'cityCode') { const s = cities.find(c => c.code === value); u.provinceName = s?.name||''; u.districtCode=''; u.districtFullName=''; u.wardCode=''; u.wardFullName=''; } else if (name === 'districtCode') { const s = districts.find(d => d.code === value); u.districtFullName = s?.fullName||''; u.wardCode=''; u.wardFullName=''; } else if (name === 'wardCode') { const s = wards.find(w => w.code === value); u.wardFullName = s?.fullName||''; } return u; }); if (['cityCode','districtCode','wardCode','detailedAddress','shippingMethod','phone','email','notes'].includes(name)) { setIsShippingInfoSaved(false); setShippingFee(null); } setError(null); setAddressError(null); }, [cities, districts, wards]);
    // Handle Save Shipping Info
    const handleSaveShippingInfo = useCallback((e) => { e.preventDefault(); setError(null); const { cityCode, districtCode, wardCode, detailedAddress, phone, email, shippingMethod, provinceName, districtFullName, wardFullName } = shippingInfo; if (!cityCode || !districtCode || !wardCode || !detailedAddress.trim() || !phone.trim() || !email.trim() || !provinceName || !districtFullName || !wardFullName || orderItems.length === 0) { setError("Vui lòng điền đầy đủ thông tin bắt buộc và chọn địa chỉ hợp lệ."); return; } if (!/\S+@\S+\.\S+/.test(email)) { setError("Email không hợp lệ."); return; } if (!/^0\d{9,10}$/.test(phone)) { setError("SĐT không hợp lệ."); return; } const currentDetails = { cityCode, provinceName, districtCode, districtFullName, wardCode, wardFullName, detailedAddress, phone, email, shippingMethod, notes: shippingInfo.notes }; calculateShippingFeeAndSave(shippingMethod, currentDetails, orderItems, (fee, err)=>{}); }, [shippingInfo, orderItems, calculateShippingFeeAndSave]);
    // Calculate VAT
    const vatAmount = useMemo(() => (typeof orderTotal === 'number' ? orderTotal : 0) * 0.10, [orderTotal]);
    // Calculate Grand Total
    const finalTotalAmount = useMemo(() => (orderTotal || 0) + (shippingFee || 0) + (vatAmount || 0), [orderTotal, shippingFee, vatAmount]);

    const handleConfirmOrderCOD = useCallback(async () => {
        // (Keep existing implementation - unchanged)
         setError(null);
         if (!isShippingInfoSaved) { setError("Thông tin đơn hàng/phí chưa được lưu hoặc đã thay đổi. Vui lòng 'Lưu & Tính phí' lại."); return; }
         if (!isAuthenticated || !user?.userId) { setError("Vui lòng đăng nhập để đặt hàng."); navigate('/login'); return; }
         setIsProcessingPayment(true);
         const savedDataString = sessionStorage.getItem('savedShippingInfo');
         let savedData;
         try {
              savedData = JSON.parse(savedDataString || '{}');
              if (!savedData || typeof savedData !== 'object' || !Array.isArray(savedData.orderItems) || savedData.orderItems.length === 0 || typeof savedData.shippingFee !== 'number' || !savedData.provinceName || !savedData.districtFullName || !savedData.wardFullName || !savedData.detailedAddress || !savedData.phone || !savedData.email || !savedData.shippingMethod) { throw new Error("Dữ liệu lưu trong session không hợp lệ."); }
         } catch (e) {
              console.error("Fatal Error validating saved data on COD confirm:", e);
              setError("Lỗi đọc dữ liệu đơn hàng. Vui lòng 'Lưu & Tính phí' lại.");
              setIsProcessingPayment(false); setIsShippingInfoSaved(false); setShippingFee(null);
              sessionStorage.removeItem('savedShippingInfo'); return;
         }
         const savedSubtotal = calculateTotalFromItems(savedData.orderItems);
         const savedVat = savedSubtotal * 0.10;
         const finalTotalForAPI = savedSubtotal + savedData.shippingFee + savedVat;
         const fullAddressForFinalOrder = `${savedData.detailedAddress}, ${savedData.wardFullName}, ${savedData.districtFullName}, ${savedData.provinceName}`;
         const finalOrderDataPayload = { shippingAddress: fullAddressForFinalOrder, paymentMethod: "CASH", deliveryMethod: savedData.shippingMethod, note: savedData.notes || '', items: savedData.orderItems.map(item => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity })), /* Include other needed fields like userId, totalAmount etc. */ };
         console.log("Attempting COD order creation with payload:", finalOrderDataPayload);
         try {
             const response = await apiService.createOrder(finalOrderDataPayload);
             console.log("API Create Order Response (COD):", response);
             sessionStorage.removeItem('pendingOrderData'); sessionStorage.removeItem('savedShippingInfo');
             navigate('/order-success', { replace: true, state: { orderId: response.data?.orderId, orderCode: response.data?.orderCode, totalAmount: finalTotalForAPI } });
         } catch (err) {
             console.error("Lỗi khi xác nhận đặt hàng COD:", err.response?.data || err.message || err);
             const message = err.response?.data?.message || err.message || "Đặt hàng COD không thành công."; setError(message);
             setIsProcessingPayment(false);
         }
    }, [isShippingInfoSaved, isAuthenticated, user, navigate]);

    // --- FUNCTION TO HANDLE VNPAY PAYMENT INITIATION ---
    const handleVNPayPayment = useCallback(async () => {
       // (Keep existing implementation - unchanged)
       setError(null);
       if (!isShippingInfoSaved) { setError("Thông tin đơn hàng/phí chưa được lưu hoặc đã thay đổi. Vui lòng 'Lưu & Tính phí' lại."); return; }
       if (!isAuthenticated || !user?.userId) { setError("Vui lòng đăng nhập để thanh toán."); navigate('/login'); return; }
       setIsProcessingPayment(true);
       const savedDataString = sessionStorage.getItem('savedShippingInfo');
       let savedData;
       try {
           savedData = JSON.parse(savedDataString || '{}');
           if (!savedData || typeof savedData !== 'object' || !Array.isArray(savedData.orderItems) || savedData.orderItems.length === 0 || typeof savedData.shippingFee !== 'number' || !savedData.provinceName || !savedData.districtFullName || !savedData.wardFullName || !savedData.detailedAddress || !savedData.phone || !savedData.email || !savedData.shippingMethod) { throw new Error("Dữ liệu lưu trong session không hợp lệ."); }
       } catch (e) {
           console.error("Fatal Error validating saved data for VNPAY:", e);
           setError("Lỗi đọc dữ liệu đơn hàng. Vui lòng 'Lưu & Tính phí' lại.");
           setIsProcessingPayment(false); setIsShippingInfoSaved(false); setShippingFee(null);
           sessionStorage.removeItem('savedShippingInfo'); return;
       }
       const savedSubtotal = calculateTotalFromItems(savedData.orderItems);
       const savedVat = savedSubtotal * 0.10;
       const finalTotalForPayment = savedSubtotal + savedData.shippingFee + savedVat;
       const vnPayPayload = { amount: Math.round(finalTotalForPayment), bankCode: '', language: 'vn' };
       try {
           console.log("Calling VNPAY create payment API with payload:", vnPayPayload);
           const response = await apiService.vnPayCreate(vnPayPayload);
           console.log("VNPAY Create API Response Raw:", response);
           if (response && response.data && response.data.code === '00') {
               const paymentUrl = response.data.data;
               if (paymentUrl && typeof paymentUrl === 'string' && paymentUrl.startsWith('http')) { window.location.href = paymentUrl; return; }
               else { throw new Error("Không nhận được URL thanh toán hợp lệ từ VNPAY (dữ liệu không đúng)."); }
           } else { throw new Error(response?.data?.message || "Giao dịch VNPAY không thành công hoặc phản hồi không hợp lệ."); }
       } catch (err) {
           console.error("Lỗi khi tạo thanh toán VNPAY:", err.response?.data || err.message || err);
           const message = err.message || "Tạo thanh toán VNPAY thất bại."; setError(message);
           setIsProcessingPayment(false);
       }
    }, [isShippingInfoSaved, isAuthenticated, user, navigate]);
    // --- Render Loading/Empty States ---
    if (!isInitialLoadComplete) { return ( <div className={styles.placeOrderContainer} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner size="large" /><p>Đang tải...</p></div> ); }
    if (!isDataLoadSuccessful) { return ( <div className={styles.placeOrderContainer} style={{ textAlign: 'center', padding: '40px 20px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><FaExclamationTriangle size={40} style={{ color: '#dc3545', marginBottom: '15px'}} /><h2>Không có thông tin đơn hàng</h2><p>Không thể tải dữ liệu sản phẩm. Vui lòng quay lại giỏ hàng.</p><Link to="/cart"><Button variant='secondary'>Quay lại giỏ hàng</Button></Link></div> ); }

    // ---- RENDER MAIN COMPONENT ----
    return (
        <div className={styles.placeOrderContainer}>
            <h1>Xác nhận đơn hàng</h1>
            {error && <div className={styles.errorMessageCommon}><FaExclamationTriangle /> {error}</div>}
            <div className={styles.layoutWrapper}>
                {/* Shipping Info Form */}
                <div className={styles.shippingInfoContainer}>
                    <h2>Thông tin giao hàng</h2>
                    {addressError && <div className={styles.errorMessageAddress}><FaExclamationTriangle /> {addressError}</div>}
                    <form className={styles.shippingForm} onSubmit={handleSaveShippingInfo}>
                         <div className={styles.formGroup}><label htmlFor="cityCode">Tỉnh/Thành phố <span className={styles.required}>*</span></label><select id="cityCode" name="cityCode" value={shippingInfo.cityCode} onChange={handleInputChange} required disabled={isFetchingAddresses.cities || isProcessingPayment || isCalculatingFee} aria-busy={isFetchingAddresses.cities}><option value="">{isFetchingAddresses.cities ? 'Đang tải...' : '-- Chọn Tỉnh/Thành --'}</option>{cities.map(province => <option key={province.code} value={province.code}>{province.name}</option>)}</select>{isFetchingAddresses.cities && <Spinner size="tiny" style={{ marginLeft: '8px' }} />}</div>
                         <div className={styles.formGroup}><label htmlFor="districtCode">Quận/Huyện <span className={styles.required}>*</span></label><select id="districtCode" name="districtCode" value={shippingInfo.districtCode} onChange={handleInputChange} required disabled={!shippingInfo.cityCode || isFetchingAddresses.districts || isProcessingPayment || isCalculatingFee} aria-busy={isFetchingAddresses.districts}><option value="">{isFetchingAddresses.districts ? 'Đang tải...' : (!shippingInfo.cityCode ? 'Vui lòng chọn Tỉnh/Thành' : '-- Chọn Quận/Huyện --')}</option>{districts.map(district => <option key={district.code} value={district.code}>{district.name}</option>)}</select>{isFetchingAddresses.districts && <Spinner size="tiny" style={{ marginLeft: '8px' }} />}</div>
                         <div className={styles.formGroup}><label htmlFor="wardCode">Phường/Xã <span className={styles.required}>*</span></label><select id="wardCode" name="wardCode" value={shippingInfo.wardCode} onChange={handleInputChange} required disabled={!shippingInfo.districtCode || isFetchingAddresses.wards || isProcessingPayment || isCalculatingFee} aria-busy={isFetchingAddresses.wards}><option value="">{isFetchingAddresses.wards ? 'Đang tải...' : (!shippingInfo.districtCode ? 'Vui lòng chọn Quận/Huyện' : '-- Chọn Phường/Xã --')}</option>{wards.map(ward => <option key={ward.code} value={ward.code}>{ward.name}</option>)}</select>{isFetchingAddresses.wards && <Spinner size="tiny" style={{ marginLeft: '8px' }} />}</div>
                         <div className={styles.formGroup}><label htmlFor="detailedAddress">Địa chỉ cụ thể <span className={styles.required}>*</span></label><input type="text" id="detailedAddress" name="detailedAddress" value={shippingInfo.detailedAddress} onChange={handleInputChange} required placeholder="Số nhà, tên đường, tòa nhà..." disabled={isProcessingPayment || isCalculatingFee}/></div>
                         <div className={styles.formGroup}><label htmlFor="phone">Số điện thoại <span className={styles.required}>*</span></label><input type="tel" id="phone" name="phone" value={shippingInfo.phone} onChange={handleInputChange} required placeholder="Để shipper liên hệ" disabled={isProcessingPayment || isCalculatingFee} pattern="^0\d{9,10}$" title="Số điện thoại Việt Nam hợp lệ (10-11 số, bắt đầu bằng 0)"/></div>
                         <div className={styles.formGroup}><label htmlFor="email">Email <span className={styles.required}>*</span></label><input type="email" id="email" name="email" value={shippingInfo.email} onChange={handleInputChange} required placeholder="Để nhận xác nhận đơn hàng" disabled={isProcessingPayment || isCalculatingFee}/></div>
                         <div className={styles.formGroup}><label htmlFor="shippingMethod">Phương thức vận chuyển</label><select id="shippingMethod" name="shippingMethod" value={shippingInfo.shippingMethod} onChange={handleInputChange} disabled={isProcessingPayment || isCalculatingFee}><option value="STANDARD">Giao hàng tiêu chuẩn</option><option value="EXPRESS">Giao hàng nhanh</option></select></div>
                         <div className={styles.formGroup}><label htmlFor="notes">Ghi chú</label><textarea id="notes" name="notes" value={shippingInfo.notes} onChange={handleInputChange} rows="3" placeholder="Yêu cầu khác (tùy chọn)" disabled={isProcessingPayment || isCalculatingFee}/></div>
                         <Button type="submit" variant={isShippingInfoSaved ? "success" : "secondary"} className={styles.saveShippingButton} disabled={isProcessingPayment || isCalculatingFee || isFetchingAddresses.cities || isFetchingAddresses.districts || isFetchingAddresses.wards}>{isCalculatingFee ? <Spinner size="small" /> : (isShippingInfoSaved ? <><FaCheckCircle /> Đã lưu & Tính phí</> : 'Lưu & Tính phí')}</Button>
                    </form>
                </div>

                {/* Order Summary */}
                <div className={styles.orderSummaryContainer}>
                    <h2>Đơn hàng ({orderItems.reduce((acc, item) => acc + (item.quantity || 0), 0)} sp)</h2>
                    <div className={styles.orderItemsList}>
                        {orderItems.map(item => (
                            <div key={item.uniqueId} className={styles.orderItem}>
                                <img src={item.imageUrl || '/images/placeholder-image.png'} alt={item.name} className={styles.itemImage} onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder-image.png'; }}/>
                                <div className={styles.itemDetails}><span className={styles.itemName}>{item.name || 'N/A'}</span>{(item.color || item.size || item.variantName) && ( <span className={styles.itemVariantInfo}>{item.variantName ? item.variantName : `${item.color ? `Màu: ${item.color}` : ''}${item.color && item.size ? ', ' : ''}${item.size ? `Size: ${item.size}` : ''}`}</span> )} <span className={styles.itemQuantity}>SL: {item.quantity || 0}</span></div>
                                <span className={styles.itemPrice}>{formatCurrency((item.price || 0) * (item.quantity || 0))}</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.orderSummary}>
                        <div className={styles.summaryRow}><span>Tạm tính:</span><span>{formatCurrency(orderTotal)}</span></div>
                        <div className={styles.summaryRow}><span>Phí vận chuyển:</span><span>{isCalculatingFee ? <Spinner size="tiny" /> : (shippingFee !== null ? formatCurrency(shippingFee) : 'Vui lòng Lưu thông tin')}</span></div>
                        <div className={styles.summaryRow}><span>VAT (10%):</span><span>{formatCurrency(vatAmount)}</span></div>
                        <div className={`${styles.summaryRow} ${styles.grandTotal}`}><span>Tổng cộng:</span><span className={styles.totalAmountValue}>{formatCurrency(finalTotalAmount)}</span></div>
                        <div className={styles.paymentMethodSelector}>
                            <h4 className={styles.paymentMethodTitle}>Phương thức thanh toán</h4>
                            <div className={styles.paymentOption}><input type="radio" id="payment_cash" name="paymentMethod" value="CASH" checked={paymentMethod === 'CASH'} onChange={(e) => setPaymentMethod(e.target.value)} disabled={isProcessingPayment || isCalculatingFee} /><label htmlFor="payment_cash"> Thanh toán khi nhận hàng (COD)</label></div>
                            <div className={styles.paymentOption}><input type="radio" id="payment_vnpay" name="paymentMethod" value="VNPAY" checked={paymentMethod === 'VNPAY'} onChange={(e) => setPaymentMethod(e.target.value)} disabled={isProcessingPayment || isCalculatingFee} /><label htmlFor="payment_vnpay"> Thanh toán qua VNPAY</label></div>
                        </div>
                         <Button onClick={paymentMethod === 'VNPAY' ? handleVNPayPayment : handleConfirmOrderCOD} variant="primary" className={styles.confirmOrderButton} disabled={!isShippingInfoSaved || isProcessingPayment || isCalculatingFee}>
                            {isProcessingPayment ? <Spinner size="small" color="#fff"/> : (paymentMethod === 'VNPAY' ? 'Tiến hành thanh toán VNPAY' : 'Xác nhận đặt hàng (COD)')}
                         </Button>
                         {error && !isCalculatingFee && !isProcessingPayment && (<p className={styles.finalErrorMessage}>{error}</p>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrder;