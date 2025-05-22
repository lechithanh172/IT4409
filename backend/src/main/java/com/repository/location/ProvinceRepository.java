package com.repository.location;

import com.entity.Province;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProvinceRepository extends JpaRepository<Province, String> {
    Province findByName(String name);
    Province findByNameEn(String name);
    Province findByFullName(String fullName);
    Province findProvinceByCode(String code);
}
