package com.repository;

import com.entity.Order;
import com.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    Optional<Order> findOrderByOrderId(Integer id);

    List<Order> findOrdersByUserId(Integer userId);

    List<Order> findOrdersByStatus(OrderStatus status);


}
