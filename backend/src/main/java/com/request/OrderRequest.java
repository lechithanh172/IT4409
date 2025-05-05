package com.request;

import com.enums.DeliveryMethod;
import com.enums.OrderStatus;
import com.enums.PaymentMethod;
import lombok.Data;

@Data
public class OrderRequest {

    private String shippingAddress;

    private OrderStatus status;

    private PaymentMethod paymentMethod;

    private DeliveryMethod deliveryMethod;

    private Integer shippingFee;

    private String note;

    private Item[] items;
}
