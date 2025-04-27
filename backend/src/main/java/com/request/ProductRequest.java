package com.request;

import lombok.Data;

import java.util.List;

@Data
public class ProductRequest {

    private String productName;

    private String description;

    private List<String> specifications;

    private Double weight;

    private Long price;

    private String categoryName;

    private String brandName;

    private Boolean supportRushOrder;

    private List<ProductVariantRequest> variants;

}
