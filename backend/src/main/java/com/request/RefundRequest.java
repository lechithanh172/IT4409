package com.request;

public class RefundRequest {
    private String orderId;
    private String transDate;
    private String tranType; // 01: toàn phần, 02: một phần
    private Long amount;
    private String user;

}

