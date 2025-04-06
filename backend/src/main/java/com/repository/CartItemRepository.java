package com.repository;

import com.entity.CartItem;
import com.entity.CartItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, CartItemId> {

    Optional<CartItem> findCartItemByUserIdAndProductId(Integer userId, Integer productId);
}
