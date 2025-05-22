package com.controller;

import com.request.PaymentRequest;
import com.request.QueryRequest;
import com.response.UrlResponse;
import com.service.VnPayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vnpay")public class VnPayController {

    @Autowired
    private VnPayService vnPayService;

    @PostMapping("/query")
    public ResponseEntity<?> queryTransaction(@RequestBody QueryRequest request) {
        // Gọi hàm query trạng thái giao dịch từ service
        String response = vnPayService.queryTransaction(request);
        return ResponseEntity.ok(response);
    }

//    @PostMapping("/refund")
//    public ResponseEntity<?> refundTransaction(@RequestBody RefundRequest request) {
//        // Gọi hàm hoàn tiền từ service
//        String response = vnPayService.refundTransaction(request);
//        return ResponseEntity.ok(response);
//    }

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody PaymentRequest request) {
        try {
//            String ipAddr = httpServletRequest.getRemoteAddr();
//            String paymentUrl = vnPayService.createPaymentUrl(request, ipAddr);
            String paymentUrl = vnPayService.createPaymentUrl(request, "127.0.0.1");
            return ResponseEntity.ok(new UrlResponse("00", "success", paymentUrl));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}

