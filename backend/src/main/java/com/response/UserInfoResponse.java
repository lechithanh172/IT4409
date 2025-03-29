package com.response;

import com.entity.Role;
import com.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
@AllArgsConstructor
public class UserInfoResponse {
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String address;
    public UserInfoResponse(User user) {
        this.email = user.getEmail();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.phoneNumber = user.getPhoneNumber();
        this.address = user.getAddress();
    }
}
