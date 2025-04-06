package com.request;

import com.enums.Role;
import lombok.Getter;

@Getter
public class SignUpOTPRequest {
    private String username;
    private String password;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String address;
    private Role role;
    private String otp;
}
