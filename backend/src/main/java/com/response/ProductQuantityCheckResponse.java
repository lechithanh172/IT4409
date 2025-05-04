package com.response;

import lombok.Data;

@Data
public class ProductQuantityCheckResponse {
    private Integer productId;
    private Integer variantId;
    private Integer quantity;
}
