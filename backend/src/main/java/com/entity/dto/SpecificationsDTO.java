package com.entity.dto;

import lombok.Data;

@Data
public class SpecificationsDTO {

    private Long lowerBound;

    private Long upperBound;

    private String storage;

    private String cpu;

    private String memory;

    private String displaySize;

    private String displayResolution;

    private String battery;

    private String chargingCapacity;

    private String refreshRate;
}
