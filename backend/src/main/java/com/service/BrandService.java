package com.service;

import com.entity.Brand;
import com.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.PlaceholderConfigurerSupport;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BrandService {
    @Autowired
    private BrandRepository brandRepository;
    @Autowired
    private PlaceholderConfigurerSupport placeholderConfigurerSupport;

    public List<Brand> getAll() {
        return brandRepository.findAll();
    }

    public Optional<Brand> getByName(String brandName) {
        return brandRepository.findByBrandNameIgnoreCase(brandName);

    }
    public boolean addBrand(Brand brand) {
        if(brandRepository.findByBrandNameIgnoreCase(brand.getBrandName()).isPresent()) {
            return false;
        }
        else {
            brandRepository.save(brand);
            return true;
        }
    }

    public boolean deleteBrand(Integer brandId) {
        if(brandRepository.findById(brandId).isPresent()) {
            brandRepository.deleteById(brandId);
            return true;
        }
        return false;
    }

    public boolean updateBrand(Brand brand) {
        Optional<Brand> brandOptional = brandRepository.findByBrandId(brand.getBrandId() );
        if(brandOptional.isPresent()) {
            Brand oldBrand = brandOptional.get();
            if(brand.getBrandName() != null) {oldBrand.setBrandName(brand.getBrandName() );}
            if(brand.getLogoUrl() != null) {oldBrand.setLogoUrl(brand.getLogoUrl());}
            brandRepository.save(oldBrand);
            return true;
        }
        else return false;
    }
}
