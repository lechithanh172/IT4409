package com.service;

import com.entity.District;
import com.entity.Province;
import com.entity.Ward;
import com.repository.location.DistrictRepository;
import com.repository.location.ProvinceRepository;
import com.repository.location.WardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LocationService {
    @Autowired
    private ProvinceRepository provinceRepository;
    @Autowired
    private DistrictRepository districtRepository;
    @Autowired
    private WardRepository wardRepository;

    public List<Province> getProvinces() {
        return provinceRepository.findAll();
    }
    public List<District> getDistricts() {
        return districtRepository.findAll();
    }
    public List<Ward> getWards() {
        return wardRepository.findAll();
    }
    public List<District> getDistrictsByProvince(String provinceCode) {
        return districtRepository.findDistrictByProvinceCode(provinceCode);
    }
    public List<Ward> getWardsByDistrict(String districtCode) {
        return wardRepository.findWardByDistrictCode(districtCode);
    }
}
