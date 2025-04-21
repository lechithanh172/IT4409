package com.repository;

import com.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    public Optional<Product> findByProductId(Integer productId);

    public Optional<Product> findByProductName(String productName);

    public List<Product> findByCategoryId(Integer categoryId);

    List<Product> findByProductNameContainingIgnoreCase(String productName);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.variants WHERE p.productId = :productId")
    Optional<Product> findByIdWithVariants(Integer productId);

    List<Product> findProductsByCategoryIdAndBrandId(Integer categoryId, Integer brandId);
}
