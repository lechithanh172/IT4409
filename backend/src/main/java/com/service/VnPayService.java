package com.service;

import com.config.VnPayConfig;
import com.request.PaymentRequest;
import com.request.QueryRequest;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VnPayService {

    public String queryTransaction(QueryRequest request) {
        try {
            Map<String, String> fields = new HashMap<>();
            fields.put("vnp_Version", "2.1.0");
            fields.put("vnp_Command", "querydr");
            fields.put("vnp_TmnCode", VnPayConfig.vnp_TmnCode);
            fields.put("vnp_TxnRef", request.getOrderId());
            fields.put("vnp_OrderInfo", "Truy van GD ma: " + request.getOrderId());
            fields.put("vnp_TransactionDate", request.getTransDate());
            fields.put("vnp_CreateDate", VnPayConfig.getCurrentDateTime());
            fields.put("vnp_IpAddr", "127.0.0.1");

            String hashData = VnPayConfig.hashAllFields(fields);
            String vnp_SecureHash = VnPayConfig.hmacSHA512(VnPayConfig.secretKey, hashData);
            fields.put("vnp_SecureHash", vnp_SecureHash);

            String response = sendPostRequest(VnPayConfig.vnp_ApiUrl, fields);
            return response;
        } catch (Exception e) {
            return e.getMessage();
        }
    }

//    public String refundTransaction(RefundRequest request) {
//        try {
//            Map<String, String> fields = new HashMap<>();
//            fields.put("vnp_Version", "2.1.0");
//            fields.put("vnp_Command", "refund");
//            fields.put("vnp_TmnCode", Config.vnp_TmnCode);
//            fields.put("vnp_TransactionType", request.getTranType());
//            fields.put("vnp_TxnRef", request.getOrderId());
//            fields.put("vnp_Amount", String.valueOf(request.getAmount() * 100));
//            fields.put("vnp_OrderInfo", "Hoan tien GD ma: " + request.getOrderId());
//            fields.put("vnp_TransactionDate", request.getTransDate());
//            fields.put("vnp_CreateBy", request.getUser());
//            fields.put("vnp_CreateDate", Config.getCurrentDateTime());
//            fields.put("vnp_IpAddr", "127.0.0.1");
//
//            String hashData = Config.hashAllFields(fields);
//            String vnp_SecureHash = Config.hmacSHA512(Config.secretKey, hashData);
//            fields.put("vnp_SecureHash", vnp_SecureHash);
//
//            String response = sendPostRequest(Config.vnp_ApiUrl, fields);
//            return response;
//        } catch (Exception e) {
//            return e.getMessage();
//        }
//    }

    private String sendPostRequest(String urlStr, Map<String, String> params) throws Exception {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        conn.setDoOutput(true);

        StringBuilder postData = new StringBuilder();
        for (Map.Entry<String, String> param : params.entrySet()) {
            if (postData.length() != 0) postData.append('&');
            postData.append(param.getKey());
            postData.append('=');
            postData.append(URLEncoder.encode(param.getValue(), StandardCharsets.UTF_8));
        }

        try (DataOutputStream wr = new DataOutputStream(conn.getOutputStream())) {
            wr.write(postData.toString().getBytes(StandardCharsets.UTF_8));
        }

        StringBuilder response = new StringBuilder();
        try (BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
            String inputLine;
            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
        }

        return response.toString();
    }



    public String createPaymentUrl(PaymentRequest request, String ipAddr) throws UnsupportedEncodingException {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String orderType = "other";
        long amount = request.getAmount() * 100L; // VNPAY expects amount * 100
        String bankCode = request.getBankCode();
        String vnp_TxnRef = VnPayConfig.getRandomNumber(8);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", VnPayConfig.vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");

        if (bankCode != null && !bankCode.isEmpty()) {
            vnp_Params.put("vnp_BankCode", bankCode);
        }

        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang: " + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", request.getLanguage() != null ? request.getLanguage() : "vn");
        vnp_Params.put("vnp_ReturnUrl", VnPayConfig.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", ipAddr);

        // Date formatting
        TimeZone tz = TimeZone.getTimeZone("Asia/Ho_Chi_Minh");

        Calendar calendar = Calendar.getInstance(tz);
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(tz);

        String createDate = formatter.format(calendar.getTime());
        vnp_Params.put("vnp_CreateDate", createDate);

        calendar.add(Calendar.MINUTE, 15);
        String expireDate = formatter.format(calendar.getTime());
        vnp_Params.put("vnp_ExpireDate", expireDate);

        // Build hash & query string
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                //Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                //Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String vnp_SecureHash = VnPayConfig.hmacSHA512(VnPayConfig.secretKey, hashData.toString());
        query.append("&vnp_SecureHash=").append(vnp_SecureHash);
        System.out.println(vnp_SecureHash);

        return VnPayConfig.vnp_PayUrl + "?" + query;
    }
}

