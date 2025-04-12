package com.repository;

import com.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {

    Optional<Category> findByCategoryId(Integer categoryId);

    Optional<Category> findByCategoryNameIgnoreCase(String categoryName);
}
