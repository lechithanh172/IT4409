package com.entity.dto;

import lombok.Data;

@Data
public class ProductVariantDTO {
    private Integer variantId;
    private String color;
    private String imageUrl;
    private Integer stockQuantity;
    private Integer discount;
}
