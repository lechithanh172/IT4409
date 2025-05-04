package com.controller;

import com.entity.User;
import com.request.LoginRequest;
import com.request.SignUpOTPRequest;
import com.request.SignUpRequest;
import com.response.StatusResponse;
import com.service.JwtService;
import com.service.OtpService;
import com.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.UnsupportedEncodingException;
import java.util.Optional;

@RequestMapping("/auth")
@RestController
public class AuthController {

    @Autowired
    private UserService userService;
    @Autowired
    private OtpService otpService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody SignUpRequest request) throws UnsupportedEncodingException {
        Optional<User> user = userService.findByUsername(request.getUsername());
        if (user.isPresent()) return ResponseEntity.status(409).body(new StatusResponse("Username already exists"));

        user = userService.findByEmail(request.getEmail());
        if (user.isPresent()) return ResponseEntity.status(409).body(new StatusResponse("Email already exists"));

        otpService.generateOtp(request.getEmail(), "Mã xác thực đăng ký.");
        return ResponseEntity.status(200).body(new StatusResponse("Otp was sent to your email"));
    }
    @PostMapping("/signup-otp")
    public ResponseEntity<?> signUpOtp(@RequestBody SignUpOTPRequest request) {
        if (otpService.validateOtp(request.getEmail(), request.getOtp())) {
            userService.createUser(request);
            return ResponseEntity.status(200).body(userService.findByUsername(request.getUsername()).get());
        } else {
            return ResponseEntity.status(400).body(new StatusResponse("Wrong OTP"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody LoginRequest request) {
        Optional<User> user;
        if (request.getUsername() != null) {
            user = userService.findByUsername(request.getUsername());
        } else {
            user = userService.findByEmail(request.getEmail());
        }
        if (user.isEmpty()) {
            return ResponseEntity.status(404).body(new StatusResponse("User not found"));
        }

        if (!passwordEncoder.matches(request.getPassword(), user.get().getPassword())) {
            return ResponseEntity.status(401).body(new StatusResponse("Wrong password"));
        }
        return ResponseEntity.status(200).body(jwtService.generateTokenWithUserDetails(user.get()));
    }
}
