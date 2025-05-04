package com.service;

import com.entity.Order;
import com.entity.Product;
import com.entity.User;
import com.enums.DeliveryMethod;
import com.enums.OrderStatus;
import com.repository.OrderRepository;
import com.repository.ProductRepository;
import com.request.Item;
import com.request.OrderRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    UserService userService;
    @Autowired
    JwtService jwtService;

    public Integer createOrder(OrderRequest orderRequest, String token) {
        if(orderRequest.getItems().length == 0) return -1;
        User user = userService.getInfo(token).get();
        Order order = new Order(orderRequest, user.getUserId());
//        order.setShippingFee(shippingFeeCalculate(orderRequest));
        // tạm thời trước khi update địa chỉ
        order.setShippingFee(50000);

        Long totalAmount = 0L;
        for(Item item : orderRequest.getItems()) {
            Product product = productRepository.findById(item.getProductId()).get();
            totalAmount += product.getPrice() * item.getQuantity();
        }
        order.setTotalAmount(totalAmount);
        order.setNote(orderRequest.getNote());
        orderRepository.save(order);
        return order.getOrderId();
    }

    public Integer shippingFeeCalculate(OrderRequest orderRequest) {
        String shippingAddress = orderRequest.getShippingAddress().split(", ")[2];
        DeliveryMethod deliveryMethod = orderRequest.getDeliveryMethod();
        if(shippingAddress.equals("Hà Nội") || shippingAddress.equals("TP Hồ Chí Minh")) {
            if(deliveryMethod.equals(DeliveryMethod.STANDARD)) return 50 * 1000;
            else if(deliveryMethod.equals(DeliveryMethod.EXPRESS)) return 150 * 1000;
        }
        else {
            if(deliveryMethod.equals(DeliveryMethod.STANDARD)) return 100 * 1000;
            else if(deliveryMethod.equals(DeliveryMethod.EXPRESS)) return 200 * 1000;
        }
        return 100 * 1000;
    }
    public Optional<Order> getOrderById(Integer orderId) {
        return orderRepository.findOrderByOrderId(orderId);
    }

    public List<Order> getOrderHistory(Integer userId) {
        return orderRepository.findOrdersByUserId(userId);
    }

    public List<Order> getOrderByStatus(OrderStatus status) {
        return orderRepository.findOrdersByStatus(status);
    }
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    public Order applyOrderStatus(Integer orderId, OrderStatus status) {
        Optional<Order> order = orderRepository.findOrderByOrderId(orderId);
        if(order.isPresent()) {
            order.get().setStatus(status);
            orderRepository.save(order.get());
            return order.get();
        }
        else {
            return null;
        }
    }

}
