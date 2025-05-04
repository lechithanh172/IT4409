package com.controller;

import com.entity.CartItem;
import com.entity.User;
import com.request.ProductQuantityCheckRequest;
import com.response.ProductQuantityCheckResponse;
import com.response.StatusResponse;
import com.service.CartService;
import com.service.ProductService;
import com.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/cart-item")
public class CartController {

    @Autowired
    private CartService cartService;
    @Autowired
    private UserService userService;
    @Autowired
    private ProductService productService;

    @PostMapping("/add")
    public ResponseEntity<?> addCartItem(@RequestBody CartItem cartItem) {
        cartService.addItemToCart(cartItem);
        return ResponseEntity.status(200).body(cartService.getCartItem(cartItem.getUserId(), cartItem.getProductId(), cartItem.getVariantId()).get());
    }
    @PutMapping("/update")
    public ResponseEntity<?> updateCartItem(@RequestBody CartItem cartItem) {
        if(cartService.updateCartItem(cartItem)) {
            return ResponseEntity.status(200).body(cartService.getCartItem(cartItem.getUserId(), cartItem.getProductId(), cartItem.getVariantId()).get());
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
    @GetMapping("/")
    public ResponseEntity<?> getCartItems(@RequestHeader("Authorization") String token) {
        Optional<User> user = userService.getInfo(token);
        return ResponseEntity.status(200).body(cartService.getCartItems(user.get().getUserId()));
    }
    @PostMapping("/check")
    public ResponseEntity<?> checkCartItem(@RequestBody ProductQuantityCheckRequest request) {
        ProductQuantityCheckResponse response = productService.checkProductQuantity(request);
        if(response != null) {
            return ResponseEntity.status(200).body(response);
        }
        return ResponseEntity.status(404).body(new StatusResponse("Not found product variant"));
    }
}
