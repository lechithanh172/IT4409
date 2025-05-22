package com.request;

import lombok.Data;

@Data
public class RatingRequest {

    private Integer productId;

    private Integer rating;

    private String ratingComment;

}
