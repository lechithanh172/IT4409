package com.request;

import lombok.Data;

@Data
public class ProductVariantRequest {

    private String color;

    private Double discountPercentage;

    private Integer stockQuantity;

    private String imageUrl;
}
