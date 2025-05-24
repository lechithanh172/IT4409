package com.service;

import com.entity.*;
import com.entity.dto.OrderItemDTO;
import com.enums.OrderStatus;
import com.repository.*;
import com.request.Item;
import com.request.OrderRequest;
import com.response.ShipperInfoResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private ProductVariantRepository productVariantRepository;
    @Autowired
    private CartService cartService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private UserRepository userRepository;

    public List<Order> getOrdersWithoutShipper() {
        return orderRepository.findOrdersByStatusAndShipperIdIsNull(OrderStatus.APPROVED);
    }
    public List<Order> getOrdersByShipperId(Integer shipperId) {
        return orderRepository.findOrdersByShipperId(shipperId);
    }

    public Integer createOrder(OrderRequest orderRequest, String token) {
        if(orderRequest.getItems().length == 0) return -1;
        User user = userService.getInfo(token).get();
        Order order = new Order(orderRequest, user.getUserId());
        Long totalAmount = 0L;
        for(Item item : orderRequest.getItems()) {
            ProductVariant productVariant = productVariantRepository.findById(item.getVariantId()).get();
            Product product = productRepository.findById(item.getProductId()).get();
            totalAmount += priceCalculate(product.getPrice(), productVariant.getDiscountPercentage()) * item.getQuantity();
        }
        order.setTotalAmount(totalAmount);
        order.setNote(orderRequest.getNote());
        order.setShippingFee(orderRequest.getShippingFee());
        orderRepository.save(order);


        for(Item item : orderRequest.getItems()) {
            Product product = productRepository.findById(item.getProductId()).get();
            ProductVariant productVariant = productVariantRepository.findById(item.getVariantId()).get();
            OrderItem orderItem = new OrderItem(order.getOrderId(), item.getProductId(), item.getVariantId(), item.getQuantity(), priceCalculate(product.getPrice(), productVariant.getDiscountPercentage()));
            orderItemRepository.save(orderItem);
            cartService.removeCartItemWhenCreateOrder(user.getUserId(), item.getProductId(), item.getVariantId());
        }

        // --- Gửi email xác nhận đơn hàng ---
        try {
            String to = user.getEmail();
            String subject = "Xác nhận đơn hàng #" + order.getOrderId();
            StringBuilder content = new StringBuilder();
            content.append("Chào ").append(user.getFullName()).append(",\n\n");
            content.append("Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi.\n");
            content.append("Thông tin đơn hàng:\n");
            content.append("Mã đơn hàng: ").append(order.getOrderId()).append("\n");
            content.append("Tổng tiền: ").append(totalAmount).append(" VND\n");
            content.append("Phí vận chuyển: ").append(order.getShippingFee()).append(" VND\n");
            content.append("Ghi chú: ").append(order.getNote() != null ? order.getNote() : "Không có").append("\n\n");
            content.append("Chúng tôi sẽ sớm xử lý đơn hàng của bạn.\n");
            content.append("Trân trọng,\nĐội ngũ cửa hàng");

            emailService.sendEmail(to, subject, content.toString());
        } catch (Exception e) {
            System.out.println("Gửi email thất bại: " + e.getMessage());
        }


        return order.getOrderId();
    }
    public Long priceCalculate(Long originalPrice, Integer discountPercentage) {
        return originalPrice * (100 - discountPercentage) / 100;
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
            if(status == OrderStatus.APPROVED) {
//                OrderItem item = new OrderItem(orderId, );
            }
            return order.get();
        }
        else {
            return null;
        }
    }
    public List<OrderItemDTO> getProductsByOrderId(Integer orderId) {
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        List<OrderItemDTO> orderItemDTOs = new ArrayList<>();
        for(OrderItem orderItem : orderItems) {
            OrderItemDTO item = new OrderItemDTO();
            Optional<Product> optionalProduct = productRepository.findByProductId(orderItem.getProductId());
            ProductVariant productVariant = productVariantRepository.findById(orderItem.getVariantId()).get();
            if(optionalProduct.isEmpty()) {
                item.setProductId(orderItem.getProductId());
            }
            else {
                Product product = optionalProduct.get();
                item.setProductId(product.getProductId());
                item.setProductName(product.getProductName());
                item.setDescription(product.getDescription());
                item.setSpecifications(product.getSpecifications());
                item.setWeight(product.getWeight());
                item.setQuantity(orderItem.getQuantity());
                item.setPrice(orderItem.getPrice());
                item.setVariantId(orderItem.getVariantId());
                item.setColor(productVariant.getColor());
                item.setImageUrl(productVariant.getImageUrl());
//                for(ProductVariant productVariant : product.getVariants()) {
//                    if(productVariant.getVariantId() == orderItem.getVariantId()) {
//                        item.setVariantId(productVariant.getVariantId());
//                        item.setPrice(priceCalculate(product.getPrice(), productVariant.getDiscountPercentage()));
//                        item.setColor(productVariant.getColor());
//                        item.setImageUrl(productVariant.getImageUrl());
//                        break;
//                    }
//                }

            }
            orderItemDTOs.add(item);
        }
        return orderItemDTOs;
    }

    public Order assignOrderToShipper(Integer orderId, Integer shipperId) {
        // Chỉ nhận đơn chưa được gán shipper
        Order order = orderRepository.findOrderByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found or already assigned"));

        // Gán shipper và cập nhật trạng thái (nếu cần)
        order.setShipperId(shipperId);
        order.setStatus(OrderStatus.SHIPPING); // hoặc DELIVERING tùy hệ thống

        return orderRepository.save(order);
    }

    public Order updateOrderStatus(Integer orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(newStatus);
        if(newStatus == OrderStatus.DELIVERED) order.setDeliveredAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    public ShipperInfoResponse getShipperInfo(Integer orderId) {
        Order order = orderRepository.findOrderByOrderId(orderId).get();
        Optional<User> optional = userRepository.findById(order.getShipperId());
        if(optional.isPresent()) {
            User shipper = optional.get();
            ShipperInfoResponse response = new ShipperInfoResponse();
            response.setShipperId(order.getShipperId());
            response.setFullName(shipper.getFirstName() + " " + shipper.getLastName());
            response.setPhoneNumber(shipper.getPhoneNumber());
            return response;
        }
        return null;
    }
}
