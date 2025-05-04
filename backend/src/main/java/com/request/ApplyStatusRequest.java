package com.request;

import lombok.Data;

@Data
public class ApplyStatusRequest {

    private Integer orderId;

    private String status;
}
