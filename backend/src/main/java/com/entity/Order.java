package com.entity;

import com.enums.DeliveryMethod;
import com.enums.OrderStatus;
import com.enums.PaymentMethod;
import com.request.OrderRequest;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Setter
@Table(name = "orders")
@Entity
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer orderId;

    private Integer userId;

    private String shippingAddress;

    private Integer shippingFee;

    private Long totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private OrderStatus status = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_method")
    private DeliveryMethod deliveryMethod;

    private LocalDateTime createdAt = LocalDateTime.now();

    private String note;

    public Order(OrderRequest orderRequest, Integer userId) {
        this.userId = userId;
        shippingAddress = orderRequest.getShippingAddress();
        paymentMethod = orderRequest.getPaymentMethod();
        deliveryMethod = orderRequest.getDeliveryMethod();
        createdAt = LocalDateTime.now();
    }
}
