package com.repository.location;

import com.entity.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WardRepository extends JpaRepository<Ward, String> {
    Ward findByName(String name);
    Ward findByNameEn(String name);
    Ward findByCode(String code);
    List<Ward> findWardByDistrictCode(String districtCode);
}
