package com.request;

import lombok.Data;

@Data
public class SearchFilterRequest {
    private String type;

    private Long lowerBound;

    private Long upperBound;

    private String storage;

    private String cpu;

    private String memory;

//    private String displaySize;

//    private String displayResolution;

//    private String battery;

//    private String chargingCapacity;

    private String refreshRate;

//    private String graphicsCard;

//    private String operatingSystem;

//    private String weight;
}
