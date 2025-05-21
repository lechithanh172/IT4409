package com.controller;

import com.entity.Order;
import com.entity.User;
import com.enums.DeliveryMethod;
import com.enums.OrderStatus;
import com.enums.Role;
import com.request.ApplyStatusRequest;
import com.request.OrderRequest;
import com.request.ShippingRequest;
import com.response.StatusResponse;
import com.service.JwtService;
import com.service.OrderService;
import com.service.ShippingService;
import com.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/order")
public class OrderController {

    @Autowired
    private OrderService orderService;
    @Autowired
    private UserService userService;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private ShippingService shippingService;

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request, @RequestHeader("Authorization") String token) {
        Integer orderCodeReturn = orderService.createOrder(request, token);
        if(orderCodeReturn != -1) {
            System.out.println(orderCodeReturn);
            return ResponseEntity.status(200).body(orderService.getOrderById(orderCodeReturn));

        }
        else return ResponseEntity.status(400).body(new StatusResponse("Order creation failed"));
    }
    @GetMapping("/history/{username}")
    public ResponseEntity<?> viewOrderHistory(@PathVariable String username, @RequestHeader("Authorization") String token) {
        Optional<User> u = userService.getInfo(token);
        if(u.isPresent()) {
            if(u.get().getUsername().equals(username) || jwtService.extractRole(token).equals(Role.ADMIN)) {
                return ResponseEntity.status(200).body(orderService.getOrderHistory(u.get().getUserId()));
            }
            else return ResponseEntity.status(403).body(new StatusResponse("Access Denied"));
        }
        else return ResponseEntity.status(404).body(new StatusResponse("User not found"));
    }
    @GetMapping("view/all")
    public ResponseEntity<?> viewAllOrders() {
        return ResponseEntity.status(200).body(orderService.getAllOrders());
    }
    @GetMapping("/view/{orderId}")
    public ResponseEntity<?> viewOrders(@PathVariable Integer orderId, @RequestHeader("Authorization") String token) {
        Optional<User> u = userService.getInfo(token);
        Optional<Order> order = orderService.getOrderById(orderId);
        if(u.isPresent() && order.isPresent()) {
            if(u.get().getUserId().equals(order.get().getUserId()) || jwtService.extractRole(token).equals(Role.ADMIN)) {
                return ResponseEntity.status(200).body(order.get());
            }
            else return ResponseEntity.status(403).body(new StatusResponse("Access Denied"));
        }
        else return ResponseEntity.status(404).body(new StatusResponse("User not found"));

    }
    @GetMapping("/status/{status}")
    public ResponseEntity<?> viewOrders(@PathVariable("status") String status) {
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            List<Order> orders = orderService.getOrderByStatus(orderStatus);
            return ResponseEntity.status(200).body(orders);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(new StatusResponse("Invalid order status"));
        }
    }
    @PostMapping("/apply-status")
    public ResponseEntity<?> approveOrder(@RequestBody ApplyStatusRequest request) {
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(request.getStatus().toUpperCase());
            Order order = orderService.applyOrderStatus(request.getOrderId(), orderStatus);
            if(order != null) {
                return ResponseEntity.status(200).body(order);
            }
            else return ResponseEntity.status(404).body(new StatusResponse("Order not found"));
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(new StatusResponse("Invalid order status"));
        }
    }
    @GetMapping("/get-items/{orderId}")
    public ResponseEntity<?> getProductsByOrderId(@PathVariable Integer orderId) {
        return ResponseEntity.status(200).body(orderService.getProductsByOrderId(orderId));
    }
    @PostMapping("/shipping-fee")
    public ResponseEntity<?> shippingFeeCalculate(@RequestBody ShippingRequest request) {
        try {
            DeliveryMethod deliveryMethod = DeliveryMethod.valueOf(request.getDeliveryMethod().toUpperCase());
            Double weight = shippingService.totalWeightCalculate(request.getItems());
            if(weight == null) return ResponseEntity.status(404).body(new StatusResponse("Cannot find product(s)"));
            return ResponseEntity.status(200).body(shippingService.calculateShippingFee(request.getShippingAddress(), weight, deliveryMethod));
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(new StatusResponse("Invalid delivery method"));
        }
    }

    @GetMapping("/unassigned")
    public ResponseEntity<List<Order>> getOrdersWithoutShipper() {
        List<Order> orders = orderService.getOrdersWithoutShipper();
        return ResponseEntity.status(200).body(orders);
    }

    @GetMapping("/shipper/{shipperId}")
    public ResponseEntity<List<Order>> getOrdersByShipperId(@PathVariable Integer shipperId) {
        List<Order> orders = orderService.getOrdersByShipperId(shipperId);
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/assign/{orderId}")
    public ResponseEntity<?> assignOrderToShipper(@PathVariable Integer orderId,
                                                  @RequestParam Integer shipperId) {
        try {
            Order assignedOrder = orderService.assignOrderToShipper(orderId, shipperId);
            return ResponseEntity.status(200).body(assignedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(new StatusResponse("Order not found or already assigned"));
        }
    }

    @PostMapping("/status/{orderId}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Integer orderId,
                                               @RequestParam OrderStatus status) {
        try {
            Order updatedOrder = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.status(200).body(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body("Order not found");
        }
    }



}
