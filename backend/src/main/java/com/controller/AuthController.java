package com.controller;

import com.request.LoginRequest;
import com.request.SignUpOTPRequest;
import com.request.SignUpRequest;
import com.request.TokenRefreshRequest;
import com.response.StatusResponse;
import com.response.TokenResponse;
import com.service.*;
import com.entity.User;
import org.hibernate.Version;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.util.List;
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
    @PostMapping("refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshRequest request) {
        try {
            return ResponseEntity.status(200).body(jwtService.refreshToken(request.getRefreshToken()));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(new StatusResponse("Refresh token fail"));
        }
    }
}
