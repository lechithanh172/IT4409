package com.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRequest {
    private int amount;
    private String bankCode;
    private String language;
}
