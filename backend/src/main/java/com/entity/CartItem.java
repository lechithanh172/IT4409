package com.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cart_items")
@IdClass(CartItemId.class)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CartItem {

    @Id
    private Integer userId;
    @Id
    private Integer productId;
    private boolean isSelected;
    private String status;
    private Integer quantity;
}
