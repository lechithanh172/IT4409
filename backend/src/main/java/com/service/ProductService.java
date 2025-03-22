package com.service;

import com.entity.Category;
import com.entity.Product;
import com.repository.CategoryRepository;
import com.repository.ProductRepository;
import com.request.NewProductRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    @Autowired
    ProductRepository productRepository;
    @Autowired
    CategoryRepository categoryRepository;

    public boolean addProduct(Product product) {
        if(productRepository.findByProductName(product.getProductName()).isPresent()) {
            return false;
        }
        else{
            productRepository.save(product);
            return true;
        }
    }

    public boolean deleteProduct(Long productId) {
        if(productRepository.findById(productId).isPresent()) {
            productRepository.deleteById(productId);
            return true;
        }
        return false;
    }

    public boolean updateProduct(Product product) {
        Optional<Product> productOptional = productRepository.findByProductId(product.getProductId());
        if(productOptional.isPresent()) {
            Product oldProduct = productOptional.get();
            if(product.getProductName() != null) oldProduct.setProductName(product.getProductName());
            if(product.getDescription() != null) oldProduct.setDescription(product.getDescription());
            if(product.getPrice() != null) oldProduct.setPrice(product.getPrice());
            if(product.getImageUrl() != null) oldProduct.setImageUrl(product.getImageUrl());
            if(product.getStockQuantity() != null) oldProduct.setStockQuantity(product.getStockQuantity());
            if(product.getCategoryId() != null) oldProduct.setCategoryId(product.getCategoryId());
            if(product.getBrandId() != null) oldProduct.setBrandId(product.getBrandId());
            if(product.getActive() != null) oldProduct.setActive(product.getActive());
            oldProduct.setUpdatedAt(LocalDateTime.now());

            productRepository.save(oldProduct);
            System.out.println("lolll");
            return true;
        }
        else return false;
    }

    public Optional<Product> getProductById(Long productId) {
        return productRepository.findById(productId);
    }

    public List<Product> getProductsByCategory(String categoryName) {
        Optional<Category> category = categoryRepository.findByCategoryNameIgnoreCase(categoryName);
        if(category.isPresent()) {
            return productRepository.findByCategoryId(category.get().getCategoryId());
        }
        else return null;

    }

    public List<Product> searchProductByName(String search) {
        return productRepository.findByProductNameContainingIgnoreCase(search);
    }






}
