package com.service;

import com.entity.CartItem;
import com.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    public void addItemToCart(CartItem cartItem) {
        Optional<CartItem> item = cartItemRepository.findCartItemByUserIdAndProductId(cartItem.getUserId(), cartItem.getProductId());
        if(item.isPresent()) {
            item.get().setQuantity(item.get().getQuantity() + cartItem.getQuantity());
            cartItemRepository.save(item.get());
            return;
        }
        cartItemRepository.save(cartItem);
    }
    public boolean updateCartItem(CartItem cartItem) {
        Optional<CartItem> item = cartItemRepository.findCartItemByUserIdAndProductId(cartItem.getUserId(), cartItem.getProductId());
        if(item.isPresent()) {
            item.get().setQuantity(item.get().getQuantity() + cartItem.getQuantity());
            cartItemRepository.save(item.get());
            return true;
        }
        return false;
    }

    public boolean removeCartItem(CartItem cartItem) {
        Optional<CartItem> item = cartItemRepository.findCartItemByUserIdAndProductId(cartItem.getUserId(), cartItem.getProductId());
        if(item.isPresent()) {
            cartItemRepository.delete(item.get());
            return true;
        }
        return false;
    }


}

