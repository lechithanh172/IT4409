package com.request;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class UpdateInfoRequest {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String address;

}
