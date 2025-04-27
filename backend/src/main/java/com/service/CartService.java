package com.service;

import com.entity.CartItem;
import com.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;
    public Optional<CartItem> getCartItem(Integer userId, Integer productId, Integer variantId) {
        return cartItemRepository.findCartItemByUserIdAndProductIdAndVariantId(userId, productId, variantId);
    }
    public void addItemToCart(CartItem cartItem) {
        Optional<CartItem> item = cartItemRepository.findCartItemByUserIdAndProductIdAndVariantId(cartItem.getUserId(), cartItem.getProductId(), cartItem.getVariantId());
        if(item.isPresent()) {
            item.get().setQuantity(item.get().getQuantity() + cartItem.getQuantity());
            cartItemRepository.save(item.get());
            return;
        }
        cartItemRepository.save(cartItem);
    }
    public boolean updateCartItem(CartItem cartItem) {
        Optional<CartItem> item = cartItemRepository.findCartItemByUserIdAndProductIdAndVariantId(cartItem.getUserId(), cartItem.getProductId(), cartItem.getVariantId());
        if(item.isPresent()) {
            item.get().setQuantity(item.get().getQuantity() + cartItem.getQuantity());
            cartItemRepository.save(item.get());
            return true;
        }
        return false;
    }

    public boolean removeCartItem(CartItem cartItem) {
        Optional<CartItem> item = cartItemRepository.findCartItemByUserIdAndProductIdAndVariantId(cartItem.getUserId(), cartItem.getProductId(), cartItem.getVariantId());
        if(item.isPresent()) {
            cartItemRepository.delete(item.get());
            return true;
        }
        return false;
    }

    public List<CartItem> getCartItems(Integer userId) {
        return cartItemRepository.findCartItemsByUserId(userId);
    }


}

