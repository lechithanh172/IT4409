package com.controller;

import com.request.ChangePasswordRequest;
import com.request.LoginRequest;
import com.service.ChangePasswordService;
import com.service.CreateUserService;
import com.entity.User;
import com.repository.UserRepository;
import com.service.LoginService;
import com.service.UpdateUserInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api")
@Controller
public class DataController {

    @Autowired
    UserRepository userRepository;
    @Autowired
    CreateUserService createUserService;
    @Autowired
    LoginService loginService;
    @Autowired
    UpdateUserInfoService updateUserInfoService;
    @Autowired
    ChangePasswordService changePasswordService;

    @PostMapping("/register")
    public ResponseEntity<?> createUser(@RequestBody User request) {
        if(createUserService.createUser(request)) {
            return ResponseEntity.status(400).body("Email already exists");
        }
        else return ResponseEntity.status(200).body("Account created successfully");
    }

    @GetMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if(loginService.login(request.getEmail(), request.getPassword())) {
            return ResponseEntity.status(200).body("Login successful");
        }
        else return ResponseEntity.status(400).body("Invalid email or password");
    }
    @PostMapping("/update")
    public ResponseEntity<?> updateUserInfo(@RequestBody User request) {
        if(updateUserInfoService.updateUserInfo(request)) {
            return ResponseEntity.status(200).body("User information updated successfully");
        }
        else return ResponseEntity.status(400).body("Failed to update user information");
    }
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        if(changePasswordService.changePassword(request)) {
            return ResponseEntity.status(200).body("Change password successfully");
        }
        else return ResponseEntity.status(400).body("Failed to change password");
    }
    @PostMapping("/forget-password")
    public ResponseEntity<?> forgetPassword(@RequestParam String email) {
        if(changePasswordService.forgetPassword(email)) {
            return ResponseEntity.status(200).body("Send new password successfully");
        }
        else return ResponseEntity.status(400).body("Failed to send new password");
    }
    @GetMapping("/get-info")
    public ResponseEntity<?> getUserInfo(@RequestBody LoginRequest request) {
        if(loginService.login(request.getEmail(), request.getPassword())) {
            return ResponseEntity.status(200).body(userRepository.findByEmail(request.getEmail()).get());
        }
        else return ResponseEntity.status(400).body("Failed to find user");
    }

}
