package com.repository;

import com.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Integer> {

    public Optional<Category> findByCategoryId(Integer categoryId);

    public Optional<Category> findByCategoryNameIgnoreCase(String categoryName);
}
