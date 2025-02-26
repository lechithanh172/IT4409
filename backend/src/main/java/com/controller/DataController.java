package com.controller;

import com.service.CreateUserService;
import com.entity.User;
import com.repository.UserRepository;
import com.service.LoginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class DataController {

    @Autowired
    UserRepository userRepository;
    @Autowired
    CreateUserService createUserService;
    @Autowired
    LoginService loginService;

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User request) {
        if(createUserService.createUser(request)) {
            return ResponseEntity.status(400).body("Email already exists");
        }
        else return ResponseEntity.status(200).body("Account created successfully");
    }

    @GetMapping
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String password) {
        if(loginService.login(email, password)) {
            return ResponseEntity.status(200).body("Login successful");
        }
        else return ResponseEntity.status(400).body("Invalid email or password");
    }
}
