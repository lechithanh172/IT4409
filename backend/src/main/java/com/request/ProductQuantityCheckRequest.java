package com.request;

import lombok.Data;

@Data
public class ProductQuantityCheckRequest {
    private Integer productId;
    private Integer variantId;
}
