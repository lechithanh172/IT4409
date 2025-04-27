package com.request;

import lombok.Data;

@Data
public class ProductVariantRequest {

    private Integer variantId;

    private Integer productId;

    private String color;

    private Integer discountPercentage;

    private Integer stockQuantity;

    private String imageUrl;
}
