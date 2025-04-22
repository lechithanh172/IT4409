package com.controller;

import com.entity.CartItem;
import com.response.StatusResponse;
import com.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart-items")
public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<?> addCartItem(@RequestBody CartItem cartItem) {
        cartService.addItemToCart(cartItem);
        return ResponseEntity.status(200).body(new StatusResponse("Added cart item"));
    }
    @PutMapping("/update")
    public ResponseEntity<?> updateCartItem(@RequestBody CartItem cartItem) {
        if(cartService.updateCartItem(cartItem)) {
            return ResponseEntity.status(200).body(new StatusResponse("Updated cart item"));
        }
        return ResponseEntity.status(404).body(new StatusResponse("Not found cart item"));
    }

    @PostMapping("/remove")
    public ResponseEntity<?> removeCartItem(@RequestBody CartItem cartItem) {
        if(cartService.removeCartItem(cartItem)) {
            return ResponseEntity.status(200).body(new StatusResponse("Removed cart item"));
        }
        return ResponseEntity.status(404).body(new StatusResponse("Not found cart item"));
    }
}
