package com.controller;

import com.entity.District;
import com.entity.Province;
import com.entity.Ward;
import com.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
@RequestMapping("/location")
@Controller
public class LocationController {
    @Autowired
    private LocationService locationService;

    @GetMapping("/province")
    public ResponseEntity<List<Province>> getProvinces() {
        return ResponseEntity.status(200).body(locationService.getProvinces());
    }
    @GetMapping("/district/all")
    public ResponseEntity<List<District>> getDistricts() {
        return ResponseEntity.status(200).body(locationService.getDistricts());
    }
    @GetMapping("/ward/all")
    public ResponseEntity<List<Ward>> getWards() {
        return ResponseEntity.status(200).body(locationService.getWards());
    }
    @GetMapping("/district/{provinceId}")
    public ResponseEntity<List<District>> getDistrictsByProvince(@PathVariable String provinceId) {
        return ResponseEntity.status(200).body(locationService.getDistrictsByProvince(provinceId));
    }
    @GetMapping("/ward/{districtId}")
    public ResponseEntity<List<Ward>> getWardsByDistrict(@PathVariable String districtId) {
        return ResponseEntity.status(200).body(locationService.getWardsByDistrict(districtId));
    }
}
