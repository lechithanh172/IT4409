package com.controller;

import com.entity.Rating;
import com.request.RatingRequest;
import com.service.RatingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/rating")
public class RatingController {

    @Autowired
    RatingService ratingService;


    @GetMapping("/average/{productId}")
    public ResponseEntity<Double> getAverageRating(@PathVariable Integer productId) {
        Double average = ratingService.calculateRating(productId);
        return ResponseEntity.status(200).body(average);
    }

    @GetMapping("/list/{productId}")
    public ResponseEntity<List<Rating>> getRatingsByProduct(@PathVariable Integer productId) {
        List<Rating> ratings = ratingService.findByProductId(productId);
        return ResponseEntity.status(200).body(ratings);
    }

    @PostMapping("/submit")
    public ResponseEntity<Rating> submitRating(@RequestHeader("Authorization") String token, @RequestBody RatingRequest request) {
        Rating savedRating = ratingService.submitRating(token, request);
        return ResponseEntity.status(200).body(savedRating);
    }
}
