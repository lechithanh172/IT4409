package com.repository;

import com.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    public Optional<Product> findByProductId(Integer productId);

    public Optional<Product> findByProductName(String productName);

    public List<Product> findByCategoryId(Integer categoryId);

    List<Product> findByProductNameContainingIgnoreCase(String productName);

    List<Product> findProductsByCategoryIdAndBrandId(Integer categoryId, Integer brandId);
}
