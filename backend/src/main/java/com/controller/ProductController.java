package com.controller;

import com.entity.dto.ProductDTO;
import com.request.ProductRequest;
import com.request.SearchFilterRequest;
import com.response.StatusResponse;
import com.service.JwtService;
import com.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product")
public class ProductController {

    @Autowired
    private ProductService productService;
    @Autowired
    private JwtService jwtService;

    @PostMapping("/add")
    public ResponseEntity<?> addProduct(@RequestBody ProductRequest request) {
        if(productService.addProduct(request)) {
            return ResponseEntity.status(200).body(productService.getProductByProductName(request.getProductName()));
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
    public ResponseEntity<?> updateProduct(@RequestBody ProductRequest request) {
        productService.updateProduct(request);
        return ResponseEntity.status(200).body(productService.getProductByProductName(request.getProductName()));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<?> getProduct(@PathVariable Integer productId) {
        ProductDTO productDTO = productService.getProductById(productId);
        if(productDTO != null) {
            return ResponseEntity.status(200).body(productDTO);
        }
        else return ResponseEntity.status(404).body(new StatusResponse("This product does not exist"));
    }
    @GetMapping("/category={category}")
    public ResponseEntity<?> getProductsByCategory(@PathVariable String category) {
        List<ProductDTO> products = productService.getProductsByCategory(category);
        if(products == null)
            return ResponseEntity.status(404).body(new StatusResponse("This category does not exist"));

        if(products.isEmpty())
            return ResponseEntity.status(200).body(new StatusResponse("This category does not have any products"));

        return ResponseEntity.status(200).body(products);
    }

    @GetMapping("/{category}/{brand}")
    public ResponseEntity<?> getProductsByCategoryAndBrand(@PathVariable String category, @PathVariable String brand) {
        List<ProductDTO> products = productService.getProductByCategoryAndBrand(category, brand);
        if(products == null)
            return ResponseEntity.status(404).body(new StatusResponse("Not exist"));
        if(products.isEmpty()) {
            return ResponseEntity.status(404).body(new StatusResponse("No products found"));
        }
        return ResponseEntity.status(200).body(products);
    }

    @GetMapping("/search={search}")
    public ResponseEntity<?> searchProduct(@PathVariable String search) {
        List<ProductDTO> products = productService.searchProductsByName(search);
        if(products.isEmpty()) {
            return ResponseEntity.status(200).body(new StatusResponse("No matching products found"));
        }
        else return ResponseEntity.status(200).body(products);
    }
    @DeleteMapping("/variant/delete")
    public ResponseEntity<?> deleteVariant(@RequestParam Integer variantId) {
        if(productService.deleteVariant(variantId)) {
            return ResponseEntity.status(200).body(new StatusResponse("Variant deleted successfully"));
        }
        else return ResponseEntity.status(404).body(new StatusResponse("Variant does not exist"));
    }
    @GetMapping("/all")
    public ResponseEntity<?> getAllProducts() {
        return ResponseEntity.status(200).body(productService.getAllProducts());
    }

//    @PostMapping("/price-range")
//    public ResponseEntity<?> searchProductsInRange(@RequestBody SearchFilterRequest request) {
//        return ResponseEntity.status(200).body(productService.searchProductsByPriceRange(request.getLowerBound(), request.getUpperBound()));
//    }
    @PostMapping("/filter")
    public ResponseEntity<?> searchProductsInFilter(@RequestBody SearchFilterRequest request) {
        if(request.getType() == null) return ResponseEntity.status(400).body(new StatusResponse("Type is null"));
        request.setType(request.getType().toLowerCase());
        if(!request.getType().equalsIgnoreCase("smartphone") && !request.getType().equalsIgnoreCase("laptop"))
            return ResponseEntity.status(404).body(new StatusResponse("Type not supported"));

        return ResponseEntity.status(200).body(productService.searchProductsWithFilter(request));
    }

}
