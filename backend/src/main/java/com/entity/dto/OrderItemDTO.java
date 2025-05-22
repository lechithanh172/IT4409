package com.entity.dto;

import lombok.Data;

@Data
public class OrderItemDTO {

    private Integer productId;
    private Integer variantId;
    private String productName;
    private String description;
    private String specifications;
    private Double weight;
    private Long price;
    private String color;
    private String imageUrl;
    private Integer quantity;
}
