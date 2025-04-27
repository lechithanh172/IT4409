package com.controller;

import com.entity.Category;
import com.response.StatusResponse;
import com.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/category")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;
    @GetMapping("/")
    public ResponseEntity<List<Category>> getAll() {
        return ResponseEntity.status(200).body(categoryService.getAll());
    }
    @GetMapping("")
    public ResponseEntity<?> getCategoryByName(@RequestParam String category) {
        Optional<Category> categoryOptional = categoryService.getByName(category);
        if (categoryOptional.isPresent()) {
            return ResponseEntity.status(200).body(categoryOptional.get());
        }
        return ResponseEntity.status(404).body(new StatusResponse("This category does not exist"));
    }
    @PostMapping("/add")
    public ResponseEntity<?> addCategory(@RequestBody Category request) {
        if(categoryService.addCategory(request)) {
            return ResponseEntity.status(200).body(categoryService.getByName(request.getCategoryName()).get());
        }
        else return ResponseEntity.status(409).body(new StatusResponse("This category already exists"));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<StatusResponse> deleteCategory(@RequestParam Integer categoryId) {
        if(categoryService.deleteCategory(categoryId)) {
            return ResponseEntity.status(200).body(new StatusResponse("Category deleted successfully"));
        }
        else return ResponseEntity.status(404).body(new StatusResponse("This category does not exist"));
    }

    @PutMapping("/update")
    public ResponseEntity<StatusResponse> updateCategory(@RequestBody Category request) {
        if(categoryService.updateCategory(request)) {
            return ResponseEntity.status(200).body(new StatusResponse("Category updated successfully"));
        }
        else return ResponseEntity.status(404).body(new StatusResponse("This category does not exist"));
    }
}
