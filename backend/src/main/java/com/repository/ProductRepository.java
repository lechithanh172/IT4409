package com.repository;

import com.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer>, JpaSpecificationExecutor<Product> {

    Optional<Product> findByProductId(Integer productId);

    Optional<Product> findByProductName(String productName);

    List<Product> findByCategoryId(Integer categoryId);

    List<Product> findByBrandId(Integer brandId);

    List<Product> findByProductNameContainingIgnoreCase(String productName);

    List<Product> findProductsByCategoryIdAndBrandId(Integer categoryId, Integer brandId);

//    List<Product> findProductsByPriceInRange(Long lowerBound, Long upperBound);
}
