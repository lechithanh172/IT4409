package com.repository;

import com.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Integer> {
    Optional<ProductVariant> findByVariantId(Integer variantId);

    List<ProductVariant> findByProduct_ProductId(Integer productId);

    Optional<ProductVariant> findByVariantIdAndProduct_ProductId(Integer variantId, Integer productId);

}
