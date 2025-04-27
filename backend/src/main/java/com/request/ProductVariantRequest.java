package com.request;

import lombok.Data;

@Data
public class ProductVariantRequest {

    private String color;

    private Integer discountPercentage;

    private Integer stockQuantity;

    private String imageUrl;
}
