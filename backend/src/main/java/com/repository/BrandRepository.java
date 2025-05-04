package com.repository;

import com.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Integer> {
    public Optional<Brand> findByBrandId(Integer brandId);

    public Optional<Brand> findByBrandNameIgnoreCase(String brandName);
}
