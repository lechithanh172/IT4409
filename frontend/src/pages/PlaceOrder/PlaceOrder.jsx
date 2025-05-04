// src/pages/PlaceOrder/PlaceOrder.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './PlaceOrder.module.css'; // Ensure this path is correct
import Button from '../../components/Button/Button'; // Ensure this path is correct
import Spinner from '../../components/Spinner/Spinner'; // Ensure this path is correct
import { useAuth } from '../../contexts/AuthContext'; // Ensure this path is correct
import apiService from '../../services/api'; // Ensure this path is correct and includes necessary functions
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

// --- API Fetch Functions for Address Data ---
const fetchCities = async () => {
    console.log("Fetching cities from API...");
    try {
        const response = await apiService.getProvinces();
        const citiesData = response.data || [];
        if (!Array.isArray(citiesData)) { throw new Error("Dữ liệu Tỉnh/Thành phố không hợp lệ."); }
        return citiesData.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } catch (error) {
        console.error("Error fetching cities:", error.response?.data || error.message || error);
        const message = error.response?.data?.message || error.message || 'Không xác định';
        throw new Error(`Lỗi tải danh sách Tỉnh/Thành phố: ${message}`);
    }
};

const fetchDistricts = async (provinceCode) => {
    if (!provinceCode) return [];
    console.log(`Fetching districts for province code: ${provinceCode} from API...`);
    try {
        const response = await apiService.getDistricts(provinceCode);
        const districtsData = response.data || [];
        if (!Array.isArray(districtsData)) { throw new Error("Dữ liệu Quận/Huyện không hợp lệ."); }
        return districtsData.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } catch (error) {
        console.error(`Error fetching districts for province ${provinceCode}:`, error.response?.data || error.message || error);
        const message = error.response?.data?.message || error.message || 'Không xác định';
        throw new Error(`Lỗi tải danh sách Quận/Huyện: ${message}`);
    }
};

const fetchWards = async (districtCode) => {
    if (!districtCode) return [];
    console.log(`Fetching wards for district code: ${districtCode} from API...`);
    try {
        const response = await apiService.getWards(districtCode);
        const wardsData = response.data || [];
        if (!Array.isArray(wardsData)) { throw new Error("Dữ liệu Phường/Xã không hợp lệ."); }
        return wardsData.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } catch (error) {
        console.error(`Error fetching wards for district ${districtCode}:`, error.response?.data || error.message || error);
        const message = error.response?.data?.message || error.message || 'Không xác định';
        throw new Error(`Lỗi tải danh sách Phường/Xã: ${message}`);
    }
};
// -------------------------------------------------

// --- Helper Functions ---
const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Calculates subtotal from items array, using the pre-calculated 'price' field
const calculateTotalFromItems = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
        // Uses item.price which should be the final price calculated in CartPage
        const price = typeof item.price === 'number' ? item.price : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        return sum + (price * quantity);
    }, 0);
};
// -------------------------------------------------------------------

const PlaceOrder = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    // --- State Variables ---
    const [shippingInfo, setShippingInfo] = useState({
        cityCode: '', provinceName: '', districtCode: '', districtFullName: '',
        wardCode: '', wardFullName: '', detailedAddress: '',
        phone: '', email: '', shippingMethod: 'STANDARD', notes: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [orderItems, setOrderItems] = useState([]); // Items loaded from session storage
    const [orderTotal, setOrderTotal] = useState(0); // Subtotal calculated from orderItems
    const [shippingFee, setShippingFee] = useState(null);
    const [isFetchingAddresses, setIsFetchingAddresses] = useState({ cities: false, districts: false, wards: false });
    const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
    const [isShippingInfoSaved, setIsShippingInfoSaved] = useState(false);
    const [isCalculatingFee, setIsCalculatingFee] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [error, setError] = useState(null);
    const [addressError, setAddressError] = useState(null);

    // --- Function to Calculate Shipping Fee via API & Save Complete State ---
    const calculateShippingFeeAndSave = useCallback(async (deliveryMethod, currentShippingInfo, currentOrderItems, onSaveComplete) => {
        if (!deliveryMethod || !currentShippingInfo?.wardFullName || !currentShippingInfo?.districtFullName || !currentShippingInfo?.provinceName || !Array.isArray(currentOrderItems) || currentOrderItems.length === 0) {
            const missingFields = [!deliveryMethod && "PTVC", !currentShippingInfo?.wardFullName && "P/Xã", !currentShippingInfo?.districtFullName && "Q/Huyện", !currentShippingInfo?.provinceName && "T/Thành", (!Array.isArray(currentOrderItems) || currentOrderItems.length === 0) && "S.Phẩm"].filter(Boolean);
            const errorMessage = `Thiếu thông tin tính phí: ${missingFields.join(', ')}.`;
            setError(errorMessage); onSaveComplete(null, new Error(errorMessage)); return;
        }

        console.log(`Calling API to calculate shipping fee. Method: ${deliveryMethod}`);
        setIsCalculatingFee(true); setShippingFee(null); setError(null);

        const shippingAddressStringForFeeApi = `${currentShippingInfo.wardFullName}, ${currentShippingInfo.districtFullName}, ${currentShippingInfo.provinceName}`;
        // Ensure items payload only contains necessary fields for fee calculation API
        const itemsPayloadForFee = currentOrderItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity
        }));
        const apiPayload = { shippingAddress: shippingAddressStringForFeeApi, items: itemsPayloadForFee, deliveryMethod: deliveryMethod };

        let calculatedFee = null;
        try {
            console.log("Sending payload to /order/shipping-fee:", JSON.stringify(apiPayload, null, 2));
            const response = await apiService.calculateShippingFee(apiPayload);
            console.log("API response from /order/shipping-fee:", response);

            if (response && typeof response.data === 'number' && response.data >= 0) {
                calculatedFee = response.data;
                console.log("Extracted shipping fee:", calculatedFee);
                setShippingFee(calculatedFee);

                // Save Complete State (incl. full shipping info, fee, and the original enriched items)
                const infoToSave = {
                     ...currentShippingInfo, // Contains detailedAddress, etc.
                     shippingFee: calculatedFee,
                     orderItems: currentOrderItems // Save the full items array as loaded
                };
                sessionStorage.setItem('savedShippingInfo', JSON.stringify(infoToSave));
                console.log("Complete info saved to SessionStorage:", infoToSave);
                setIsShippingInfoSaved(true);
                onSaveComplete(calculatedFee, null);

            } else {
                console.error("Invalid fee number in API response data:", response.data);
                throw new Error("Phí vận chuyển trả về không hợp lệ.");
            }
        } catch (apiError) {
            console.error("Error calculating fee or saving:", apiError.response?.data || apiError.message || apiError);
            const message = apiError.response?.data?.message || apiError.message || "Lỗi khi tính phí hoặc lưu thông tin.";
            setError(message); setShippingFee(null); setIsShippingInfoSaved(false);
            onSaveComplete(null, apiError);
        } finally {
            setIsCalculatingFee(false);
        }
    }, [setError, setShippingFee, setIsShippingInfoSaved, setIsCalculatingFee]);

    // --- Load Initial Data ---
    useEffect(() => {
        console.log("PlaceOrder: Component did mount. Loading initial data...");
        let dataLoaded = false; let loadedItems = []; let needsCityFetch = true;

        // 1. Try loading complete saved state ('savedShippingInfo')
        const savedShippingString = sessionStorage.getItem('savedShippingInfo');
        if (savedShippingString) {
            try {
                const parsedSavedData = JSON.parse(savedShippingString);
                // Check if the saved data looks valid (has items and fee)
                if (parsedSavedData && typeof parsedSavedData === 'object' && Array.isArray(parsedSavedData.orderItems) && typeof parsedSavedData.shippingFee === 'number') {
                    console.log("Found valid savedShippingInfo. Restoring state.");
                    setShippingInfo(prev => ({ ...prev, cityCode: parsedSavedData.cityCode || '', provinceName: parsedSavedData.provinceName || '', districtCode: parsedSavedData.districtCode || '', districtFullName: parsedSavedData.districtFullName || '', wardCode: parsedSavedData.wardCode || '', wardFullName: parsedSavedData.wardFullName || '', detailedAddress: parsedSavedData.detailedAddress || '', phone: parsedSavedData.phone || '', email: parsedSavedData.email || '', shippingMethod: parsedSavedData.shippingMethod || 'STANDARD', notes: parsedSavedData.notes || '' }));
                    // Ensure uniqueId exists on loaded items
                    loadedItems = parsedSavedData.orderItems.map((item, index) => ({ ...item, uniqueId: item.uniqueId || `${item.productId}-${item.variantId}-${index}` }));
                    setOrderItems(loadedItems); // **Items loaded here contain the final price**
                    setShippingFee(parsedSavedData.shippingFee);
                    setIsShippingInfoSaved(true); dataLoaded = true;
                } else { console.warn("Invalid structure in savedShippingInfo. Removing it."); sessionStorage.removeItem('savedShippingInfo'); }
            } catch (e) { console.error("Error parsing savedShippingInfo:", e); sessionStorage.removeItem('savedShippingInfo'); }
        }

        // 2. If not loaded from complete state, try 'pendingOrderData'
        if (!dataLoaded) {
            console.log("No valid savedShippingInfo. Trying pendingOrderData...");
            const savedOrderData = sessionStorage.getItem('pendingOrderData');
            if (savedOrderData) {
                try {
                    const parsedData = JSON.parse(savedOrderData);
                    // Check if pending data looks valid (has items and total - total might be redundant now)
                    if (parsedData?.items?.length > 0 /*&& typeof parsedData.total === 'number'*/) {
                        // Ensure uniqueId exists on loaded items
                        loadedItems = parsedData.items.map((item, index) => ({ ...item, uniqueId: item.uniqueId || `${item.productId}-${item.variantId}-${index}` }));
                        setOrderItems(loadedItems); // **Items loaded here contain the final price**
                        console.log("Loaded items from pendingOrderData."); dataLoaded = true;
                        // Apply user details if not loaded from saved state and user exists
                        if (user && !shippingInfo.phone && !shippingInfo.email) {
                           setShippingInfo(prev => ({ ...prev, email: prev.email || user.email || '', phone: prev.phone || user.phone || '' }));
                        }
                         // Clear pending data as it's now loaded into state (or will be saved fully later)
                         sessionStorage.removeItem('pendingOrderData');
                    } else { console.error("Invalid pendingOrderData format."); }
                } catch (e) { console.error("Error parsing pendingOrderData:", e); }
            }
        }

        // 3. Handle case where no data was loaded at all
        if (!dataLoaded) { console.warn("No valid order data found. Navigating back to cart."); setTimeout(() => navigate('/cart'), 0); return; }

        // 4. Derive orderTotal (subtotal) from the loaded items state
        const initialTotal = calculateTotalFromItems(loadedItems);
        setOrderTotal(initialTotal);
        console.log("Derived initial order total (subtotal):", initialTotal);

        // 5. Fetch Cities (Provinces)
        if (needsCityFetch) {
            const loadCities = async () => {
                setIsFetchingAddresses(prev => ({ ...prev, cities: true })); setAddressError(null);
                try {
                    const cityData = await fetchCities(); setCities(cityData || []);
                    if (shippingInfo.cityCode && !cityData?.some(c => c.code === shippingInfo.cityCode)) {
                         console.warn("Loaded cityCode invalid. Resetting address."); setShippingInfo(prev => ({ ...prev, cityCode: '', provinceName: '', districtCode: '', districtFullName: '', wardCode: '', wardFullName: '' }));
                         setIsShippingInfoSaved(false); setShippingFee(null);
                     }
                } catch (err) { console.error("Error in loadCities:", err); setAddressError(err.message || "Lỗi tải Tỉnh/Thành phố."); }
                finally { setIsFetchingAddresses(prev => ({ ...prev, cities: false })); setIsInitialLoadComplete(true); console.log("Initial city fetch complete."); }
            }; loadCities();
        } else { setIsInitialLoadComplete(true); }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, user]); // Only run on mount and user change

    // --- Effect to Recalculate orderTotal (Subtotal) when items change ---
    useEffect(() => {
        const newTotal = calculateTotalFromItems(orderItems);
        setOrderTotal(newTotal);
        console.log("Subtotal recalculated:", newTotal);
     }, [orderItems]);

    // --- Fetch Districts Effect ---
    useEffect(() => {
        const provinceCode = shippingInfo.cityCode;
        if (provinceCode && isInitialLoadComplete) {
            const loadDistricts = async () => {
                setDistricts([]); setWards([]); setShippingInfo(prev => ({ ...prev, districtCode: '', districtFullName: '', wardCode: '', wardFullName: '' }));
                setIsFetchingAddresses(prev => ({ ...prev, districts: true, wards: false })); setAddressError(null);
                try { const districtData = await fetchDistricts(provinceCode); setDistricts(districtData || []); }
                catch (err) { console.error(`Error fetching districts:`, err); setAddressError(err.message || "Lỗi tải Quận/Huyện."); }
                finally { setIsFetchingAddresses(prev => ({ ...prev, districts: false })); }
            }; loadDistricts();
        } else if (!provinceCode && isInitialLoadComplete) { setDistricts([]); setWards([]); setShippingInfo(prev => ({ ...prev, districtCode: '', districtFullName: '', wardCode: '', wardFullName: '' })); }
    }, [shippingInfo.cityCode, isInitialLoadComplete]);

    // --- Fetch Wards Effect ---
    useEffect(() => {
        const districtCode = shippingInfo.districtCode;
        if (districtCode && shippingInfo.cityCode && isInitialLoadComplete) {
            const loadWards = async () => {
                setWards([]); setShippingInfo(prev => ({ ...prev, wardCode: '', wardFullName: '' }));
                setIsFetchingAddresses(prev => ({ ...prev, wards: true })); setAddressError(null);
                try { const wardData = await fetchWards(districtCode); setWards(wardData || []); }
                catch (err) { console.error(`Error fetching wards:`, err); setAddressError(err.message || "Lỗi tải Phường/Xã."); }
                finally { setIsFetchingAddresses(prev => ({ ...prev, wards: false })); }
            }; loadWards();
        } else if (!districtCode && isInitialLoadComplete) { setWards([]); setShippingInfo(prev => ({ ...prev, wardCode: '', wardFullName: '' })); }
    }, [shippingInfo.districtCode, shippingInfo.cityCode, isInitialLoadComplete]);

    // --- Handle Form Input Changes ---
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setShippingInfo(prevShippingInfo => {
            let updatedInfo = { ...prevShippingInfo, [name]: value };
            if (name === 'cityCode') { const selectedCity = cities.find(c => c.code === value); updatedInfo.provinceName = selectedCity?.name || ''; updatedInfo.districtCode = ''; updatedInfo.districtFullName = ''; updatedInfo.wardCode = ''; updatedInfo.wardFullName = ''; }
            else if (name === 'districtCode') { const selectedDistrict = districts.find(d => d.code === value); updatedInfo.districtFullName = selectedDistrict?.fullName || ''; updatedInfo.wardCode = ''; updatedInfo.wardFullName = ''; }
            else if (name === 'wardCode') { const selectedWard = wards.find(w => w.code === value); updatedInfo.wardFullName = selectedWard?.fullName || ''; }
            return updatedInfo;
        });
        if (['cityCode', 'districtCode', 'wardCode', 'detailedAddress', 'shippingMethod', 'phone', 'email', 'notes'].includes(name)) { setIsShippingInfoSaved(false); setShippingFee(null); }
        setError(null); setAddressError(null);
    }, [cities, districts, wards]);

    // --- Handle Triggering the Save Process (Form Submission) ---
    const handleSaveShippingInfo = useCallback((e) => {
        e.preventDefault(); setError(null);
        const { cityCode, districtCode, wardCode, detailedAddress, phone, email, shippingMethod, provinceName, districtFullName, wardFullName } = shippingInfo;
        if (!cityCode || !districtCode || !wardCode || !detailedAddress.trim() || !phone.trim() || !email.trim()) { setError("Vui lòng điền đầy đủ thông tin địa chỉ bắt buộc (*), SĐT và Email."); return; }
        if (!/\S+@\S+\.\S+/.test(email)) { setError("Định dạng email không hợp lệ."); return; }
        if (!/^0\d{9,10}$/.test(phone)) { setError("Số điện thoại không hợp lệ (bắt đầu bằng 0, 10-11 chữ số)."); return; }
        if (!provinceName || !districtFullName || !wardFullName) { setError("Thông tin tên Tỉnh/Quận/Phường chưa được cập nhật."); return; }
        if (orderItems.length === 0) { setError("Không có sản phẩm trong đơn hàng để tính phí."); return; }
        // Pass the current orderItems state to the save function
        const currentShippingDetails = { cityCode, provinceName, districtCode, districtFullName, wardCode, wardFullName, detailedAddress, phone, email, shippingMethod, notes: shippingInfo.notes };
        const handleSaveCompletion = (fee, err) => { if (err) console.error("Save failed"); else console.log("Save success, fee:", fee); };
        calculateShippingFeeAndSave(shippingMethod, currentShippingDetails, orderItems, handleSaveCompletion);
    }, [shippingInfo, orderItems, calculateShippingFeeAndSave]);

    // --- Calculate VAT Amount ---
    const vatAmount = useMemo(() => (typeof orderTotal === 'number' ? orderTotal : 0) * 0.10, [orderTotal]);

    // --- Calculate Final Total Amount for Display ---
    const finalTotalAmount = useMemo(() => {
        const subtotal = typeof orderTotal === 'number' ? orderTotal : 0;
        const fee = typeof shippingFee === 'number' && !isNaN(shippingFee) ? shippingFee : 0;
        const vat = typeof vatAmount === 'number' && !isNaN(vatAmount) ? vatAmount : 0;
        return subtotal + fee + vat;
    }, [orderTotal, shippingFee, vatAmount]);

    // --- FUNCTION TO HANDLE COD ORDER CONFIRMATION ---
    const handleConfirmOrderCOD = useCallback(async () => {
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

        // Prepare only the fields needed by the /order/create API
        const finalOrderDataPayload = {
            shippingAddress: fullAddressForFinalOrder,
            paymentMethod: "CASH",
            deliveryMethod: savedData.shippingMethod,
            note: savedData.notes || '',
            items: savedData.orderItems.map(item => ({ // Ensure only required item fields are sent
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity
            })),
            // Include other fields if API requires them (like userId, totalAmount etc.)
            // userId: user.userId, // Example
            // totalAmount: finalTotalForAPI, // Example
            // shippingFee: savedData.shippingFee, // Example
            // vatAmount: savedVat, // Example
        };
        console.log("Attempting COD order creation with payload:", finalOrderDataPayload);

        try {
            const response = await apiService.createOrder(finalOrderDataPayload); // Send the cleaned payload
            console.log("API Create Order Response (COD):", response);
            // Navigate on success, pass necessary info
            sessionStorage.removeItem('pendingOrderData'); sessionStorage.removeItem('savedShippingInfo');
            navigate('/order-success', { replace: true, state: { orderId: response.data?.orderId, orderCode: response.data?.orderCode, totalAmount: finalTotalForAPI } });
        } catch (err) {
            console.error("Lỗi khi xác nhận đặt hàng COD:", err.response?.data || err.message || err);
            const message = err.response?.data?.message || err.message || "Đặt hàng COD không thành công.";
            setError(message);
            setIsProcessingPayment(false);
        }
    }, [isShippingInfoSaved, isAuthenticated, user, navigate]);

    // --- FUNCTION TO HANDLE VNPAY PAYMENT INITIATION ---
    const handleVNPayPayment = useCallback(async () => {
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

        const vnPayPayload = {
            amount: Math.round(finalTotalForPayment),
            bankCode: '', language: 'vn',
        };

        try {
            console.log("Calling VNPAY create payment API with payload:", vnPayPayload);
            const response = await apiService.vnPayCreate(vnPayPayload);
            console.log("VNPAY Create API Response Raw:", response);

            if (response && response.data && response.data.code === '00') {
                const paymentUrl = response.data.data;
                if (paymentUrl && typeof paymentUrl === 'string' && paymentUrl.startsWith('http')) {
                    console.log("Received VNPAY URL:", paymentUrl);
                    window.location.href = paymentUrl; return;
                } else { throw new Error("Không nhận được URL thanh toán hợp lệ từ VNPAY (dữ liệu không đúng)."); }
            } else { throw new Error(response?.data?.message || "Giao dịch VNPAY không thành công hoặc phản hồi không hợp lệ."); }
        } catch (err) {
            console.error("Lỗi khi tạo thanh toán VNPAY:", err.response?.data || err.message || err);
            const message = err.message || "Tạo thanh toán VNPAY thất bại."; setError(message);
            setIsProcessingPayment(false);
        }
    }, [isShippingInfoSaved, isAuthenticated, user, navigate]);


    // --- Render Loading/Empty States ---
    if (!isInitialLoadComplete) {
        return ( <div className={styles.placeOrderContainer} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner size="large" /></div> );
    }
    if (orderItems.length === 0 && isInitialLoadComplete) {
         return ( <div className={styles.placeOrderContainer} style={{ textAlign: 'center', padding: '40px 20px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><FaExclamationTriangle size={40} style={{ color: '#dc3545', marginBottom: '15px'}} /><h2>Đơn hàng trống</h2><p>Không tìm thấy sản phẩm nào. Vui lòng quay lại giỏ hàng.</p><Link to="/cart"><Button variant='secondary'>Quay lại giỏ hàng</Button></Link></div> );
     }

    // ---- RENDER MAIN COMPONENT ----
    return (
        <div className={styles.placeOrderContainer}>
            <h1>Xác nhận đơn hàng</h1>
            {error && <div className={styles.errorMessageCommon}><FaExclamationTriangle /> {error}</div>}
            <div className={styles.layoutWrapper}>
                {/* === SHIPPING INFO CONTAINER (LEFT) === */}
                <div className={styles.shippingInfoContainer}>
                    <h2>Thông tin giao hàng</h2>
                    {addressError && <div className={styles.errorMessageAddress}><FaExclamationTriangle /> {addressError}</div>}
                    <form className={styles.shippingForm} onSubmit={handleSaveShippingInfo}>
                         {/* Address Fields */}
                         <div className={styles.formGroup}><label htmlFor="cityCode">Tỉnh/Thành phố <span className={styles.required}>*</span></label><select id="cityCode" name="cityCode" value={shippingInfo.cityCode} onChange={handleInputChange} required disabled={isFetchingAddresses.cities || isProcessingPayment || isCalculatingFee} aria-busy={isFetchingAddresses.cities}><option value="">{isFetchingAddresses.cities ? 'Đang tải...' : '-- Chọn Tỉnh/Thành --'}</option>{cities.map(province => <option key={province.code} value={province.code}>{province.name}</option>)}</select>{isFetchingAddresses.cities && <Spinner size="tiny" style={{ marginLeft: '8px' }} />}</div>
                         <div className={styles.formGroup}><label htmlFor="districtCode">Quận/Huyện <span className={styles.required}>*</span></label><select id="districtCode" name="districtCode" value={shippingInfo.districtCode} onChange={handleInputChange} required disabled={!shippingInfo.cityCode || isFetchingAddresses.districts || isProcessingPayment || isCalculatingFee} aria-busy={isFetchingAddresses.districts}><option value="">{isFetchingAddresses.districts ? 'Đang tải...' : (!shippingInfo.cityCode ? 'Vui lòng chọn Tỉnh/Thành' : '-- Chọn Quận/Huyện --')}</option>{districts.map(district => <option key={district.code} value={district.code}>{district.name}</option>)}</select>{isFetchingAddresses.districts && <Spinner size="tiny" style={{ marginLeft: '8px' }} />}</div>
                         <div className={styles.formGroup}><label htmlFor="wardCode">Phường/Xã <span className={styles.required}>*</span></label><select id="wardCode" name="wardCode" value={shippingInfo.wardCode} onChange={handleInputChange} required disabled={!shippingInfo.districtCode || isFetchingAddresses.wards || isProcessingPayment || isCalculatingFee} aria-busy={isFetchingAddresses.wards}><option value="">{isFetchingAddresses.wards ? 'Đang tải...' : (!shippingInfo.districtCode ? 'Vui lòng chọn Quận/Huyện' : '-- Chọn Phường/Xã --')}</option>{wards.map(ward => <option key={ward.code} value={ward.code}>{ward.name}</option>)}</select>{isFetchingAddresses.wards && <Spinner size="tiny" style={{ marginLeft: '8px' }} />}</div>
                         <div className={styles.formGroup}><label htmlFor="detailedAddress">Địa chỉ cụ thể <span className={styles.required}>*</span></label><input type="text" id="detailedAddress" name="detailedAddress" value={shippingInfo.detailedAddress} onChange={handleInputChange} required placeholder="Số nhà, tên đường, tòa nhà..." disabled={isProcessingPayment || isCalculatingFee}/></div>
                         {/* Contact Fields */}
                         <div className={styles.formGroup}><label htmlFor="phone">Số điện thoại <span className={styles.required}>*</span></label><input type="tel" id="phone" name="phone" value={shippingInfo.phone} onChange={handleInputChange} required placeholder="Để shipper liên hệ" disabled={isProcessingPayment || isCalculatingFee} pattern="^0\d{9,10}$" title="Số điện thoại Việt Nam hợp lệ (10-11 số, bắt đầu bằng 0)"/></div>
                         <div className={styles.formGroup}><label htmlFor="email">Email <span className={styles.required}>*</span></label><input type="email" id="email" name="email" value={shippingInfo.email} onChange={handleInputChange} required placeholder="Để nhận xác nhận đơn hàng" disabled={isProcessingPayment || isCalculatingFee}/></div>
                         {/* Delivery/Notes */}
                         <div className={styles.formGroup}><label htmlFor="shippingMethod">Phương thức vận chuyển</label><select id="shippingMethod" name="shippingMethod" value={shippingInfo.shippingMethod} onChange={handleInputChange} disabled={isProcessingPayment || isCalculatingFee}><option value="STANDARD">Giao hàng tiêu chuẩn</option><option value="EXPRESS">Giao hàng nhanh</option></select></div>
                         <div className={styles.formGroup}><label htmlFor="notes">Ghi chú</label><textarea id="notes" name="notes" value={shippingInfo.notes} onChange={handleInputChange} rows="3" placeholder="Yêu cầu khác (tùy chọn)" disabled={isProcessingPayment || isCalculatingFee}/></div>
                         {/* Save Button */}
                         <Button type="submit" variant={isShippingInfoSaved ? "success" : "secondary"} className={styles.saveShippingButton} disabled={isProcessingPayment || isCalculatingFee || isFetchingAddresses.cities || isFetchingAddresses.districts || isFetchingAddresses.wards}>{isCalculatingFee ? <Spinner size="small" /> : (isShippingInfoSaved ? <><FaCheckCircle /> Đã lưu & Tính phí</> : 'Lưu & Tính phí')}</Button>
                    </form>
                </div>

                {/* === ORDER SUMMARY CONTAINER (RIGHT) === */}
                <div className={styles.orderSummaryContainer}>
                    <h2>Đơn hàng ({orderItems.reduce((acc, item) => acc + item.quantity, 0)} sp)</h2>
                    {/* Order Items List */}
                    <div className={styles.orderItemsList}>
                        {orderItems.map(item => (
                            <div key={item.uniqueId} className={styles.orderItem}>
                                <img src={item.imageUrl || '/images/placeholder-image.png'} alt={item.name} className={styles.itemImage} onError={(e) => { e.target.onerror = null; e.target.src='/images/placeholder-image.png'; }}/>
                                <div className={styles.itemDetails}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    {(item.color || item.size || item.variantName) && ( <span className={styles.itemVariantInfo}>{item.variantName ? item.variantName : `${item.color ? `Màu: ${item.color}` : ''}${item.color && item.size ? ', ' : ''}${item.size ? `Size: ${item.size}` : ''}`}</span> )}
                                    <span className={styles.itemQuantity}>SL: {item.quantity}</span>
                                </div>
                                {/* Display Price: Uses item.price which includes discount */}
                                <span className={styles.itemPrice}>{formatCurrency((item.price || 0) * (item.quantity || 0))}</span>
                            </div>
                        ))}
                    </div>
                    {/* Order Summary Calculation */}
                    <div className={styles.orderSummary}>
                        <div className={styles.summaryRow}><span>Tạm tính:</span><span>{formatCurrency(orderTotal)}</span></div>
                        <div className={styles.summaryRow}><span>Phí vận chuyển:</span><span>{isCalculatingFee ? <Spinner size="tiny" /> : (shippingFee !== null ? formatCurrency(shippingFee) : 'Vui lòng Lưu thông tin')}</span></div>
                        <div className={styles.summaryRow}><span>VAT (10%):</span><span>{formatCurrency(vatAmount)}</span></div>
                        <div className={`${styles.summaryRow} ${styles.grandTotal}`}><span>Tổng cộng:</span><span className={styles.totalAmountValue}>{formatCurrency(finalTotalAmount)}</span></div>

                        {/* Payment Method Selection */}
                        <div className={styles.paymentMethodSelector}>
                            <h4 className={styles.paymentMethodTitle}>Chọn phương thức thanh toán</h4>
                            <div className={styles.paymentOption}>
                                <input type="radio" id="payment_cash" name="paymentMethod" value="CASH" checked={paymentMethod === 'CASH'} onChange={(e) => setPaymentMethod(e.target.value)} disabled={isProcessingPayment || isCalculatingFee} />
                                <label htmlFor="payment_cash"> Thanh toán khi nhận hàng (COD)</label>
                            </div>
                            <div className={styles.paymentOption}>
                                <input type="radio" id="payment_vnpay" name="paymentMethod" value="VNPAY" checked={paymentMethod === 'VNPAY'} onChange={(e) => setPaymentMethod(e.target.value)} disabled={isProcessingPayment || isCalculatingFee} />
                                <label htmlFor="payment_vnpay"> Thanh toán qua VNPAY</label>
                            </div>
                        </div>

                         {/* Final Action Button */}
                         <Button onClick={paymentMethod === 'VNPAY' ? handleVNPayPayment : handleConfirmOrderCOD} variant="primary" className={styles.confirmOrderButton} disabled={!isShippingInfoSaved || isProcessingPayment || isCalculatingFee}>
                            {isProcessingPayment ? <Spinner size="small" color="#fff"/> : (paymentMethod === 'VNPAY' ? 'Tiến hành thanh toán VNPAY' : 'Xác nhận đặt hàng (COD)')}
                         </Button>
                         {/* Final Error Message */}
                         {error && !isCalculatingFee && !isProcessingPayment && (<p className={styles.finalErrorMessage}>{error}</p>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrder;