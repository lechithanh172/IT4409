package com.entity.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProductDTO {
    private Integer productId;
    private String productName;
    private String description;
    private String specifications;
    private Double weight;
    private Long price;
    private Boolean supportRushOrder;
    private String categoryName;
    private String brandName;
    private List<ProductVariantDTO> variants;
}
