package com.repository.location;

import com.entity.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DistrictRepository extends JpaRepository<District, String> {
    District findByCode(String code);
    District findByNameEn(String name);
    District findByFullName(String name);
    List<District> findDistrictByProvinceCode(String provinceCode);
}
