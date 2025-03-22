package com.controller;

import com.entity.Product;
import com.request.ChangePasswordRequest;
import com.request.LoginRequest;
import com.request.NewProductRequest;
import com.service.ChangePasswordService;
import com.entity.User;
import com.repository.UserRepository;
import com.service.ProductService;
import com.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RequestMapping("/api")
@Controller
public class DataController {

    @Autowired
    UserRepository userRepository;
    @Autowired
    UserService userService;
    @Autowired
    ChangePasswordService changePasswordService;
    @Autowired
    ProductService productService;

    // user
    @PostMapping("/signup")
    public ResponseEntity<?> createUser(@RequestBody User request) {
        if(userService.createUser(request)) {
            return ResponseEntity.status(200).body("Account created successfully");
        }
        else return ResponseEntity.status(400).body("Email already exists");
    }

    @GetMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if(userService.login(request.getEmail(), request.getPassword())) {
            return ResponseEntity.status(200).body("Login successful");
        }
        else return ResponseEntity.status(400).body("Invalid email or password");
    }
    @PostMapping("/update-user")
    public ResponseEntity<?> updateUserInfo(@RequestBody User request) {
        if(userService.updateUserInfo(request)) {
            return ResponseEntity.status(200).body("User information updated successfully");
        }
        else return ResponseEntity.status(400).body("Failed to update user information");
    }
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        if(changePasswordService.changePassword(request)) {
            return ResponseEntity.status(200).body("Change password successfully");
        }
        else return ResponseEntity.status(400).body("Failed to change password");
    }
    @PostMapping("/forget-password")
    public ResponseEntity<?> forgetPassword(@RequestParam String email) {
        if(changePasswordService.forgetPassword(email)) {
            return ResponseEntity.status(200).body("Send new password successfully");
        }
        else return ResponseEntity.status(400).body("Failed to send new password");
    }
    @GetMapping("/get-info")
    public ResponseEntity<?> getUserInfo(@RequestBody LoginRequest request) {
        if(userService.login(request.getEmail(), request.getPassword())) {
            return ResponseEntity.status(200).body(userRepository.findByEmail(request.getEmail()).get());
        }
        else return ResponseEntity.status(400).body("Failed to find user");
    }
    // product

    @PostMapping("/add-product")
    public ResponseEntity<?> addProduct(@RequestBody Product request) {
        if(productService.addProduct(request)) {
            return ResponseEntity.status(200).body("Product added successfully");
        }
        else return ResponseEntity.status(400).body("This product already exists");
    }

    @PostMapping("/delete-product")
    public ResponseEntity<?> deleteProduct(@RequestParam Long productId) {
        if(productService.deleteProduct(productId)) {
            return ResponseEntity.status(200).body("Product deleted successfully");
        }
        else return ResponseEntity.status(400).body("This product does not exist");
    }

    @PostMapping("/update-product")
    public ResponseEntity<?> updateProduct(@RequestBody Product request) {
        if(productService.updateProduct(request)) {
            return ResponseEntity.status(200).body("Product updated successfully");
        }
        else return ResponseEntity.status(400).body("This product does not exist");
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getProduct(@PathVariable Long productId) {
        Optional<Product> product = productService.getProductById(productId);
        if(product.isPresent()) {
            return ResponseEntity.status(200).body(product.get());
        }
        else return ResponseEntity.status(400).body("This product does not exist");
    }
    @GetMapping("/product/category={category}")
    public ResponseEntity<?> getProductsByCategory(@PathVariable String category) {
        List<Product> products = productService.getProductsByCategory(category);
        if(products == null) {
            return ResponseEntity.status(400).body("This category does not exist");
        }
        if(products.isEmpty()) return ResponseEntity.status(200).body("This category does not have any products");
        else return ResponseEntity.status(200).body(products);
    }

    @GetMapping("/product/search={search}")
    public ResponseEntity<?> searchProduct(@PathVariable String search) {
        List<Product> products = productService.searchProductByName(search);
        if(products.isEmpty()) {
            return ResponseEntity.status(200).body("No matching products found");
        }
        else return ResponseEntity.status(200).body(products);
    }

}
