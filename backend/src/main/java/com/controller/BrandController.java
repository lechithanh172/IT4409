package com.controller;

import com.entity.Brand;
import com.response.StatusResponse;
import com.service.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/brand")
public class BrandController {

    @Autowired
    private BrandService brandService;
    @GetMapping("/")
    public ResponseEntity<List<Brand>> getAll() {
        return ResponseEntity.status(200).body(brandService.getAll());
    }
    @GetMapping("")
    public ResponseEntity<?> getBrandByName(@RequestParam String brand) {
        Optional<Brand> brandOptional = brandService.getByName(brand);
        if (brandOptional.isPresent()) {
            return ResponseEntity.status(200).body(brandOptional.get());
        }
        return ResponseEntity.status(404).body(new StatusResponse("This brand does not exist"));
    }
    @PostMapping("/add")
    public ResponseEntity<?> addBrand(@RequestBody Brand request) {
        if(brandService.addBrand(request)) {
            return ResponseEntity.status(200).body(brandService.getByName(request.getBrandName()).get());
        }
        else return ResponseEntity.status(409).body(new StatusResponse("This brand already exists"));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<StatusResponse> deleteBrand(@RequestParam Integer brandId) {
        if(brandService.deleteBrand(brandId)) {
            return ResponseEntity.status(200).body(new StatusResponse("Brand deleted successfully"));
        }
        else return ResponseEntity.status(404).body(new StatusResponse("This brand does not exist"));
    }

    @PutMapping("/update")
    public ResponseEntity<StatusResponse> updateBrand(@RequestBody Brand request) {
        if(brandService.updateBrand(request)) {
            return ResponseEntity.status(200).body(new StatusResponse("Brand updated successfully"));
        }
        else return ResponseEntity.status(404).body(new StatusResponse("This brand does not exist"));
    }
}
