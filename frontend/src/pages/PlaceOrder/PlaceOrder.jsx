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
    useEffect(() => {
            document.title = "Đặt hàng | HustShop";
        }, []);
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
    const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Renamed from isProcessingPayment to clarify it's about *initiating* payment/order process
    const [error, setError] = useState(null);
    const [addressError, setAddressError] = useState(null);

    // --- Calculate Shipping Fee & Save State (Save to localStorage) ---
    const calculateShippingFeeAndSave = useCallback(async (deliveryMethod, currentShippingInfo, currentOrderItems, onSaveComplete) => {
        if (!deliveryMethod || !currentShippingInfo?.wardFullName || !currentShippingInfo?.districtFullName || !currentShippingInfo?.provinceName || !Array.isArray(currentOrderItems) || currentOrderItems.length === 0) {
            const missing = [!deliveryMethod&&"PTVC",!currentShippingInfo?.wardFullName&&"P/Xã",!currentShippingInfo?.districtFullName&&"Q/Huyện",!currentShippingInfo?.provinceName&&"T/Thành",(!currentOrderItems?.length)&&"S.Phẩm"].filter(Boolean);
            setError(`Thiếu thông tin tính phí: ${missing.join(', ')}.`); onSaveComplete(null, new Error("Missing info")); return;
        }
        setIsCalculatingFee(true); setShippingFee(null); setError(null);
        // Include detailed address for fee calc payload if needed by backend
        const addrStr = `${currentShippingInfo.detailedAddress}, ${currentShippingInfo.wardFullName}, ${currentShippingInfo.districtFullName}, ${currentShippingInfo.provinceName}`;
        const itemsPayload = currentOrderItems.map(i => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity }));
        const apiPayload = { shippingAddress: addrStr, items: itemsPayload, deliveryMethod: deliveryMethod }; // Adjust payload based on backend API
        try {
            const response = await apiService.calculateShippingFee(apiPayload);
            if (response && typeof response.data === 'number' && response.data >= 0) {
                const fee = response.data; setShippingFee(fee);
                const infoToSave = { ...currentShippingInfo, shippingFee: fee, orderItems: currentOrderItems };
                // --- SAVE TO LOCALSTORAGE ---
                localStorage.setItem('savedShippingInfo', JSON.stringify(infoToSave));
                setIsShippingInfoSaved(true); onSaveComplete(fee, null);
                console.log("Fee calculated and state saved to localStorage:", infoToSave);
            } else { throw new Error("Phí vận chuyển không hợp lệ."); }
        } catch (err) {
            console.error("Error calc/save fee:", err); setError(err.response?.data?.message || err.message || "Lỗi tính phí/lưu.");
            setShippingFee(null); setIsShippingInfoSaved(false); onSaveComplete(null, err);
        } finally { setIsCalculatingFee(false); }
    }, [setError, setShippingFee, setIsShippingInfoSaved, setIsCalculatingFee]);

    // --- Load Initial Data (From localStorage) ---
    useEffect(() => {
        console.log("[PlaceOrder useEffect] Mounting. Starting initial data load...");
        let itemsLoadedSuccessfully = false;
        let loadedItemsTemp = [];

        // STEP 1: Load and validate essential data from pendingOrderData (from localStorage)
        const savedOrderData = localStorage.getItem('pendingOrderData');
        console.log("[PlaceOrder useEffect] Raw pendingOrderData (from localStorage):", savedOrderData);

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
                    console.log("[PlaceOrder useEffect] Successfully loaded items from localStorage pendingOrderData.");
                    // Crucially, DO NOT remove pendingOrderData yet. Wait until order placement or full save.
                } else { console.warn("[PlaceOrder useEffect] Invalid items structure in localStorage pendingOrderData."); }
            } catch (e) { console.error("[PlaceOrder useEffect] Error parsing localStorage pendingOrderData:", e); localStorage.removeItem('pendingOrderData'); } // Clear bad data
        } else { console.warn("[PlaceOrder useEffect] No pendingOrderData found in localStorage."); }

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
        console.log("[PlaceOrder useEffect] Essential data OK. Loading optional saved info & addresses from localStorage.");

        // Load optional saved shipping info (from localStorage)
        const savedShippingString = localStorage.getItem('savedShippingInfo');
        if (savedShippingString) {
            try {
                const parsedSavedShipping = JSON.parse(savedShippingString);
                if (parsedSavedShipping && typeof parsedSavedShipping === 'object') {
                    console.log("[PlaceOrder useEffect] Restoring form state from localStorage savedShippingInfo.");
                    // Use functional update to ensure state consistency
                    setShippingInfo(prev => {
                         const updatedInfo = {
                             ...prev,
                             cityCode: parsedSavedShipping.cityCode || '',
                             provinceName: parsedSavedShipping.provinceName || '',
                             districtCode: parsedSavedShipping.districtCode || '',
                             districtFullName: parsedSavedShipping.districtFullName || '',
                             wardCode: parsedSavedShipping.wardCode || '',
                             wardFullName: parsedSavedShipping.wardFullName || '',
                             detailedAddress: parsedSavedShipping.detailedAddress || '',
                             phone: parsedSavedShipping.phone || prev.phone, // Keep prev if saved is empty
                             email: parsedSavedShipping.email || prev.email, // Keep prev if saved is empty
                             shippingMethod: parsedSavedShipping.shippingMethod || 'STANDARD',
                             notes: parsedSavedShipping.notes || ''
                         };
                         // Check if stored city/district/ward are still valid when city data loads later
                         // This check is actually better done *after* cities/districts/wards are loaded.
                         return updatedInfo;
                    });

                    if (typeof parsedSavedShipping.shippingFee === 'number') { setShippingFee(parsedSavedShipping.shippingFee); }
                    // Only set isShippingInfoSaved if enough data is present
                    if (parsedSavedShipping.cityCode && parsedSavedShipping.districtCode && parsedSavedShipping.wardCode && parsedSavedShipping.detailedAddress && typeof parsedSavedShipping.shippingFee === 'number') {
                        setIsShippingInfoSaved(true);
                    } else {
                         console.warn("[PlaceOrder useEffect] Saved shipping info incomplete, cannot set isShippingInfoSaved.");
                         setIsShippingInfoSaved(false);
                         setShippingFee(null); // Reset fee if info is incomplete
                    }
                } else {
                     console.warn("[PlaceOrder useEffect] Saved shipping info is not a valid object.");
                     localStorage.removeItem('savedShippingInfo'); // Clear invalid data
                     setIsShippingInfoSaved(false);
                     setShippingFee(null);
                }
            } catch (e) {
                console.error("[PlaceOrder useEffect] Error parsing localStorage savedShippingInfo:", e);
                localStorage.removeItem('savedShippingInfo'); // Clear bad data
                setIsShippingInfoSaved(false);
                setShippingFee(null);
            }
        } else if (user) { // Apply user details if no saved info AND user is available
             console.log("[PlaceOrder useEffect] No saved shipping info, applying user details.");
             setShippingInfo(prev => ({
                 ...prev,
                 email: prev.email || user.email || '',
                 phone: prev.phone || user.phone || ''
             }));
        }

        // STEP 4: Fetch Cities
        const loadCities = async () => {
            setIsFetchingAddresses(prev => ({ ...prev, cities: true })); setAddressError(null);
            try {
                const cityData = await fetchCities(); setCities(cityData || []);
                // After cities are loaded, check if the restored cityCode is valid
                const currentCityCode = JSON.parse(localStorage.getItem('savedShippingInfo') || '{}').cityCode; // Re-read from storage for current value
                 if (currentCityCode && cityData && !cityData.some(c => c.code === currentCityCode)) {
                     console.warn("[PlaceOrder useEffect] Loaded/Saved cityCode invalid based on fetched cities. Resetting address state related to city/district/ward.");
                     // Reset only address parts if city is invalid
                     setShippingInfo(prev => ({ ...prev, cityCode: '', provinceName: '', districtCode: '', districtFullName: '', wardCode: '', wardFullName: '' }));
                     // Invalid address means fee/saved status are also invalid
                     setIsShippingInfoSaved(false);
                     setShippingFee(null);
                 } else if (currentCityCode && cityData) {
                     // If city is valid, ensure provinceName is set correctly based on fetched data
                     const validCity = cityData.find(c => c.code === currentCityCode);
                      if(validCity) setShippingInfo(prev => ({...prev, provinceName: validCity.name}));
                 }

            } catch (err) { console.error("[PlaceOrder useEffect] Error in loadCities:", err); setAddressError(err.message || "Lỗi tải Tỉnh/Thành phố."); }
            finally { setIsFetchingAddresses(prev => ({ ...prev, cities: false })); setIsInitialLoadComplete(true); console.log("[PlaceOrder useEffect] Initial load cycle complete."); }
        };
        loadCities();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, user]); // Run only once on mount or user change

     // Effect to check if districts/wards need reloading when city changes or data becomes available
     useEffect(() => {
         // Check if districts need loading
         if (isDataLoadSuccessful && shippingInfo.cityCode && districts.length === 0 && !isFetchingAddresses.districts) {
             const loadDistricts = async () => {
                 setDistricts([]); setWards([]); setShippingInfo(prev => ({ ...prev, districtCode: '', districtFullName: '', wardCode: '', wardFullName: '' })); setIsFetchingAddresses(prev => ({ ...prev, districts: true, wards: false })); setAddressError(null);
                 try {
                     const d = await fetchDistricts(shippingInfo.cityCode); setDistricts(d || []);
                     // After districts load, check if restored districtCode is valid
                     const currentDistrictCode = JSON.parse(localStorage.getItem('savedShippingInfo') || '{}').districtCode;
                      if (currentDistrictCode && d && !d.some(dist => dist.code === currentDistrictCode)) {
                          console.warn("[PlaceOrder useEffect] Loaded/Saved districtCode invalid based on fetched districts. Resetting district/ward state.");
                           setShippingInfo(prev => ({ ...prev, districtCode: '', districtFullName: '', wardCode: '', wardFullName: '' }));
                           setIsShippingInfoSaved(false); setShippingFee(null);
                      } else if (currentDistrictCode && d) {
                           // If district is valid, ensure districtFullName is set correctly
                           const validDistrict = d.find(dist => dist.code === currentDistrictCode);
                           if(validDistrict) setShippingInfo(prev => ({...prev, districtFullName: validDistrict.fullName}));
                      }
                 } catch (err) { setAddressError(err.message || "Lỗi tải Q/Huyện."); }
                 finally { setIsFetchingAddresses(prev => ({ ...prev, districts: false })); }
             };
             loadDistricts();
         }
         // Check if wards need loading
         if (isDataLoadSuccessful && shippingInfo.districtCode && wards.length === 0 && !isFetchingAddresses.wards) {
             const loadWards = async () => {
                 setWards([]); setShippingInfo(prev => ({ ...prev, wardCode: '', wardFullName: '' })); setIsFetchingAddresses(prev => ({ ...prev, wards: true })); setAddressError(null);
                 try {
                     const d = await fetchWards(shippingInfo.districtCode); setWards(d || []);
                     // After wards load, check if restored wardCode is valid
                     const currentWardCode = JSON.parse(localStorage.getItem('savedShippingInfo') || '{}').wardCode;
                      if (currentWardCode && d && !d.some(ward => ward.code === currentWardCode)) {
                          console.warn("[PlaceOrder useEffect] Loaded/Saved wardCode invalid based on fetched wards. Resetting ward state.");
                           setShippingInfo(prev => ({ ...prev, wardCode: '', wardFullName: '' }));
                           setIsShippingInfoSaved(false); setShippingFee(null);
                      } else if (currentWardCode && d) {
                           // If ward is valid, ensure wardFullName is set correctly
                           const validWard = d.find(ward => ward.code === currentWardCode);
                           if(validWard) setShippingInfo(prev => ({...prev, wardFullName: validWard.fullName}));
                      }
                 } catch (err) { setAddressError(err.message || "Lỗi tải P/Xã."); }
                 finally { setIsFetchingAddresses(prev => ({ ...prev, wards: false })); }
             };
             loadWards();
         }
         // Re-check isShippingInfoSaved state after fetching addresses might validate loaded values
         const savedShippingString = localStorage.getItem('savedShippingInfo');
         if(savedShippingString && isDataLoadSuccessful){
             try {
                const parsedSavedShipping = JSON.parse(savedShippingString);
                 // Re-validate if enough info + a fee exists AND loaded addresses match saved codes
                const cityMatch = cities.some(c => c.code === parsedSavedShipping.cityCode);
                const districtMatch = districts.some(d => d.code === parsedSavedShipping.districtCode);
                const wardMatch = wards.some(w => w.code === parsedSavedShipping.wardCode);

                 if (parsedSavedShipping.cityCode && parsedSavedShipping.districtCode && parsedSavedShipping.wardCode && parsedSavedShipping.detailedAddress && typeof parsedSavedShipping.shippingFee === 'number' && cityMatch && districtMatch && wardMatch) {
                    setIsShippingInfoSaved(true);
                 } else {
                     // If info is incomplete or doesn't match fetched addresses, it's not saved
                     setIsShippingInfoSaved(false);
                     // Don't reset fee here unless the info was just reset above
                 }
             } catch (e) { /* Ignore parsing errors, already handled */ }
         } else {
            // If no saved string, or data not loaded, it's not saved
             setIsShippingInfoSaved(false);
         }


     }, [isDataLoadSuccessful, shippingInfo.cityCode, shippingInfo.districtCode, cities, districts, wards, isFetchingAddresses]); // Added dependencies


     // Recalculate subtotal if items were to change (unlikely on this page, but safe)
     useEffect(() => { const newTotal = calculateTotalFromItems(orderItems); setOrderTotal(newTotal); }, [orderItems]);

    // Handle Form Input Changes
    const handleInputChange = useCallback((e) => { const { name, value } = e.target; setShippingInfo(p => { let u = { ...p, [name]: value }; if (name === 'cityCode') { const s = cities.find(c => c.code === value); u.provinceName = s?.name||''; u.districtCode=''; u.districtFullName=''; u.wardCode=''; u.wardFullName=''; } else if (name === 'districtCode') { const s = districts.find(d => d.code === value); u.districtFullName = s?.fullName||''; u.wardCode=''; u.wardFullName=''; } else if (name === 'wardCode') { const s = wards.find(w => w.code === value); u.wardFullName = s?.fullName||''; } return u; }); if (['cityCode','districtCode','wardCode','detailedAddress','shippingMethod','phone','email','notes'].includes(name)) { setIsShippingInfoSaved(false); setShippingFee(null); } setError(null); setAddressError(null); }, [cities, districts, wards]);
    // Handle Save Shipping Info
    const handleSaveShippingInfo = useCallback((e) => { e.preventDefault(); setError(null); const { cityCode, districtCode, wardCode, detailedAddress, phone, email, shippingMethod, provinceName, districtFullName, wardFullName } = shippingInfo; if (!cityCode || !districtCode || !wardCode || !detailedAddress.trim() || !phone.trim() || !email.trim() || !provinceName || !districtFullName || !wardFullName || orderItems.length === 0) { setError("Vui lòng điền đầy đủ thông tin bắt buộc và chọn địa chỉ hợp lệ."); return; } if (!/\S+@\S+\.\S+/.test(email)) { setError("Email không hợp lệ."); return; } if (!/^0\d{9,10}$/.test(phone)) { setError("SĐT không hợp lệ."); return; } const currentDetails = { cityCode, provinceName, districtCode, districtFullName, wardCode, wardFullName, detailedAddress, phone, email, shippingMethod, notes: shippingInfo.notes }; calculateShippingFeeAndSave(shippingMethod, currentDetails, orderItems, (fee, err)=>{}); }, [shippingInfo, orderItems, calculateShippingFeeAndSave]);
    // Calculate VAT
    const vatAmount = useMemo(() => (typeof orderTotal === 'number' ? orderTotal : 0) * 0.10, [orderTotal]);
    // Calculate Grand Total (for display only)
    const finalTotalAmount = useMemo(() => (orderTotal || 0) + (shippingFee || 0) + (vatAmount || 0), [orderTotal, shippingFee, vatAmount]);

    // --- Navigate to Order Success Page for COD ---
    const handleConfirmOrderCOD = useCallback(async () => {
         setError(null);
         // Ensure data is saved before proceeding
         if (!isShippingInfoSaved) {
             setError("Thông tin đơn hàng/phí chưa được lưu hoặc đã thay đổi. Vui lòng 'Lưu & Tính phí' lại.");
             return;
         }
         if (!isAuthenticated || !user?.userId) {
             setError("Vui lòng đăng nhập để đặt hàng.");
             navigate('/login'); // Redirect to login if not authenticated
             return;
         }

         // Data validation is handled in calculateShippingFeeAndSave when saving.
         // Re-parse from localStorage to be absolutely sure we have the latest saved data
         const savedDataString = localStorage.getItem('savedShippingInfo');
         let savedData;
          try {
              savedData = JSON.parse(savedDataString || '{}');
              // Basic validation again
              if (!savedData || typeof savedData !== 'object' || !Array.isArray(savedData.orderItems) || savedData.orderItems.length === 0 || typeof savedData.shippingFee !== 'number' || !savedData.provinceName || !savedData.districtFullName || !savedData.wardFullName || !savedData.detailedAddress || !savedData.phone || !savedData.email || !savedData.shippingMethod) {
                   throw new Error("Dữ liệu lưu trong localStorage không hợp lệ.");
               }
               // Optionally re-validate the items list against the current orderItems state
               // (This is defensive, calculateShippingFeeAndSave should save the correct list)
               if(JSON.stringify(savedData.orderItems) !== JSON.stringify(orderItems.filter(item => item.is_selected && !item.error).map(item => ({ // Assuming savedData only includes selected/valid items
                    uniqueId: item.uniqueId, productId: item.productId, variantId: item.variantId,
                    name: item.name, color: item.color, imageUrl: item.imageUrl,
                    price: item.price, quantity: item.quantity,
                })))) {
                   console.warn("Saved items mismatch current selected items. Could indicate data discrepancy.");
                   // Decide if this should be an error or just a warning
                   // setError("Dữ liệu đơn hàng đã lưu không khớp. Vui lòng 'Lưu & Tính phí' lại.");
                   // return;
               }

          } catch (e) {
               console.error("Fatal Error validating saved data before COD navigation:", e);
               setError("Lỗi đọc dữ liệu đơn hàng. Vui lòng 'Lưu & Tính phí' lại.");
               setIsShippingInfoSaved(false); setShippingFee(null); // Invalidate state
               localStorage.removeItem('savedShippingInfo'); // Clear bad data
               return;
          }


         // Set processing state while navigating
         setIsProcessingPayment(true);

         // --- Navigate to the new Order Success Page for COD ---
         // The new page will read 'savedShippingInfo' from localStorage and make the API call
         navigate('/order-success-cod'); // Navigate to the new page
         console.log("Navigating to /order-success-cod to process order.");


         // IMPORTANT: DO NOT call createOrder API here.
         // IMPORTANT: DO NOT clear localStorage here. Clearing is done on the success page after API confirms success.

    }, [isShippingInfoSaved, isAuthenticated, user, navigate, orderItems]); // Added orderItems dependency for validation


    // --- FUNCTION TO HANDLE VNPAY PAYMENT INITIATION (Reads/Saves to localStorage) ---
    const handleVNPayPayment = useCallback(async () => {
       setError(null);
       if (!isShippingInfoSaved) { setError("Thông tin đơn hàng/phí chưa được lưu hoặc đã thay đổi. Vui lòng 'Lưu & Tính phí' lại."); return; }
       if (!isAuthenticated || !user?.userId) { setError("Vui lòng đăng nhập để thanh toán."); navigate('/login'); return; }
       setIsProcessingPayment(true);
       const savedDataString = localStorage.getItem('savedShippingInfo'); // Read from localStorage
       let savedData;
       try {
           savedData = JSON.parse(savedDataString || '{}');
           // Validate data loaded from localStorage
           if (!savedData || typeof savedData !== 'object' || !Array.isArray(savedData.orderItems) || savedData.orderItems.length === 0 || typeof savedData.shippingFee !== 'number' || !savedData.provinceName || !savedData.districtFullName || !savedData.wardFullName || !savedData.detailedAddress || !savedData.phone || !savedData.email || !savedData.shippingMethod) { throw new Error("Dữ liệu lưu trong localStorage không hợp lệ."); }
       } catch (e) {
           console.error("Fatal Error validating saved data for VNPAY from localStorage:", e);
           setError("Lỗi đọc dữ liệu đơn hàng. Vui lòng 'Lưu & Tính phí' lại.");
           setIsProcessingPayment(false); setIsShippingInfoSaved(false); setShippingFee(null);
           localStorage.removeItem('savedShippingInfo'); // Clear bad data from localStorage
           return;
       }

       // For VNPAY, calculate the *grand total* to send to VNPAY for payment amount
       const savedSubtotal = calculateTotalFromItems(savedData.orderItems);
       const savedVat = savedSubtotal * 0.10;
       const finalTotalForPayment = savedSubtotal + savedData.shippingFee + savedVat;

       // Amount sent to VNPAY should be in the smallest currency unit (dong),
       // and VNPAY usually expects an integer.
       const vnPayAmountInDong = Math.round(finalTotalForPayment);

       const vnPayPayload = { amount: vnPayAmountInDong, bankCode: '', language: 'vn' }; // bankCode empty lets user choose
       try {
           console.log("Calling VNPAY create payment API with payload:", vnPayPayload);
           const response = await apiService.vnPayCreate(vnPayPayload);
           console.log("VNPAY Create API Response Raw:", response);
           if (response && response.data && response.data.code === '00') {
               const paymentUrl = response.data.data;
               if (paymentUrl && typeof paymentUrl === 'string' && paymentUrl.startsWith('http')) {
                   // Data is already saved in localStorage by calculateShippingFeeAndSave
                   // Navigate user to VNPAY, VNPayReturn will handle callback and order creation
                   window.location.href = paymentUrl;
                   return; // Stop further execution
               }
               else { throw new Error("Không nhận được URL thanh toán hợp lệ từ VNPAY (dữ liệu không đúng)."); }
           } else { throw new Error(response?.data?.message || "Giao dịch VNPAY không thành công hoặc phản hồi không hợp lệ."); }
       } catch (err) {
           console.error("Lỗi khi tạo thanh toán VNPAY:", err.response?.data || err.message || err);
           const message = err.message || "Tạo thanh toán VNPAY thất bại."; setError(message);
           setIsProcessingPayment(false);
       }
    }, [isShippingInfoSaved, isAuthenticated, user, navigate, calculateTotalFromItems]);


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
                         {/* Button logic directs to appropriate handler */}
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