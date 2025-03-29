package com.controller;

import com.entity.Product;
import com.response.StatusResponse;
import com.response.TokenResponse;
import com.service.JwtService;
import com.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;
    @Autowired
    private JwtService jwtService;

    @PostMapping("/add")
    public ResponseEntity<?> addProduct(@RequestBody Product request, @RequestHeader("Authorization") String token) {
        if(productService.addProduct(request)) {
            return ResponseEntity.status(200).body(new StatusResponse("Product added successfully"));
        }
        else return ResponseEntity.status(409).body(new StatusResponse("This product already exists"));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteProduct(@RequestParam Integer productId) {
        if(productService.deleteProduct(productId)) {
            return ResponseEntity.status(200).body(new StatusResponse("Product deleted successfully"));
        }
        else return ResponseEntity.status(404).body(new StatusResponse("This product does not exist"));
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProduct(@RequestBody Product request) {
        if(productService.updateProduct(request)) {
            return ResponseEntity.status(200).body(new StatusResponse("Product updated successfully"));
        }
        else return ResponseEntity.status(404).body(new StatusResponse("This product does not exist"));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<?> getProduct(@PathVariable Integer productId) {
        Optional<Product> product = productService.getProductById(productId);
        if(product.isPresent()) {
            return ResponseEntity.status(200).body(product.get());
        }
        else return ResponseEntity.status(404).body(new StatusResponse("This product does not exist"));
    }
    @GetMapping("/category={category}")
    public ResponseEntity<?> getProductsByCategory(@PathVariable String category) {
        List<Product> products = productService.getProductsByCategory(category);
        if(products == null) {
            return ResponseEntity.status(404).body(new StatusResponse("This category does not exist"));
        }
        if(products.isEmpty()) return ResponseEntity.status(200).body(new StatusResponse("This category does not have any products"));
        else return ResponseEntity.status(200).body(products);
    }

    @GetMapping("/search={search}")
    public ResponseEntity<?> searchProduct(@PathVariable String search) {
        List<Product> products = productService.searchProductByName(search);
        if(products.isEmpty()) {
            return ResponseEntity.status(200).body(new StatusResponse("No matching products found"));
        }
        else return ResponseEntity.status(200).body(products);
    }
}
