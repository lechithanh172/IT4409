package com.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@IdClass(RatingId.class)
@Table(name = "ratings")
@Entity
public class Rating {

    @Id
    private Integer userId;

    @Id
    private Integer productId;

    private String email;

    private Integer rating;

    @Column(name = "rate_comment")
    private String rateComment;

    @Column(name = "rating_date")
    private LocalDateTime ratingDate;

}
