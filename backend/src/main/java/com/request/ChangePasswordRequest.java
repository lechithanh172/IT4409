package com.request;

public class ChangePasswordRequest {
    private String email;
    private String oldPassword;
    private String newPassword;

    public String getNewPassword() {
        return newPassword;
    }


    public String getEmail() {
        return email;
    }

    public String getOldPassword() {
        return oldPassword;
    }
}
