package com.controller;

import com.entity.User;
import com.enums.Role;
import com.request.ChangePasswordRequest;
import com.request.ResetPasswordRequest;
import com.request.SetRoleRequest;
import com.request.UpdateInfoRequest;
import com.response.StatusResponse;
import com.response.UserInfoResponse;
import com.service.JwtService;
import com.service.OtpService;
import com.service.PasswordService;
import com.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private PasswordService passwordService;
    @Autowired
    private OtpService otpService;

    @GetMapping("/info/{username}")
    public ResponseEntity<?> getUserInfo(@PathVariable String username, @RequestHeader("Authorization") String token) {
        Optional<User> u = userService.getInfo(token);
        if(u.isPresent()) {
            if(u.get().getUsername().equals(username) || jwtService.extractRole(token).equals(Role.ADMIN)) {
                UserInfoResponse user = new UserInfoResponse(u.get());
                return ResponseEntity.status(200).body(user);
            }
            else return ResponseEntity.status(403).body(new StatusResponse("Access Denied"));
        }
        else return ResponseEntity.status(404).body(new StatusResponse("User not found"));
    }
    @PutMapping("/update")
    public ResponseEntity<?> updateUserInfo(@RequestBody UpdateInfoRequest request, @RequestHeader("Authorization") String token) {
        Optional<User> user = userService.getInfo(token);
        if(user.isPresent()) {
            if(userService.updateUserInfo(user.get().getUsername(), request)) {
                return ResponseEntity.status(200).body(new StatusResponse("User information updated successfully"));
            }
            else return ResponseEntity.status(404).body(new StatusResponse("User not found"));
        }
        else return ResponseEntity.status(404).body(new StatusResponse("User not found"));
    }
    @PostMapping("/delete")
    public ResponseEntity<?> deleteUser(@RequestParam Integer userId, @RequestHeader("Authorization") String token) {
        Optional<User> user = userService.getInfo(token);
        if(user.isPresent()) {
            if(user.get().getUserId().equals(userId) || jwtService.extractRole(token).equals(Role.ADMIN)) {
                if(userService.deleteUser(userId)) {
                    return ResponseEntity.status(200).body(new StatusResponse("User deleted successfully"));
                }
                else return ResponseEntity.status(404).body(new StatusResponse("User not found"));
            }
            else return ResponseEntity.status(403).body(new StatusResponse("Access Denied"));
        }
        else return ResponseEntity.status(404).body(new StatusResponse("User not found"));
    }
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request, @RequestHeader("Authorization") String token) {
        Optional<User> user = userService.getInfo(token);
        if(user.isPresent()) {
            if(user.get().getEmail().equals(request.getEmail()) && passwordEncoder.matches(request.getOldPassword(), user.get().getPassword())) {
                passwordService.changePassword(user.get().getUserId(), request.getNewPassword());
                return ResponseEntity.status(200).body(new StatusResponse("Password changed successfully"));
            }
            else return ResponseEntity.status(403).body(new StatusResponse("Access Denied"));
        }
        else return ResponseEntity.status(404).body(new StatusResponse("User not found"));
    }
    @PostMapping("/forget-password")
    public ResponseEntity<?> forgetPassword(@RequestParam String email) throws UnsupportedEncodingException {
        if(passwordService.forgetPassword(email)) {
            return ResponseEntity.status(200).body("Send OTP code successfully");
        }
        else return ResponseEntity.status(401).body("Email not found");
    }
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) throws UnsupportedEncodingException {
        if(otpService.validateOtp(request.getEmail(), request.getOtp())) {
            passwordService.resetPassword(request.getEmail(), request.getNewPassword());
            return ResponseEntity.status(200).body(new StatusResponse("Password reset successfully"));
        }
        else return ResponseEntity.status(403).body(new StatusResponse("Wrong OTP"));
    }
    @GetMapping("/{role}")
    public ResponseEntity<?> getAllUserByRole(@PathVariable String role) {
        try {
            role = role.toUpperCase();
            Role roleEnum = Role.valueOf(role);
            List<User> users = userService.getUserByRole(roleEnum);
            return ResponseEntity.status(200).body(users);
        }
        catch (Exception e) {
            return ResponseEntity.status(404).body(new StatusResponse("Role invalid"));
        }
    }
    @PostMapping("/set-role")
    public ResponseEntity<?> setRole(@RequestBody SetRoleRequest request) {
        try {
            Role role = Role.valueOf(request.getRole().toUpperCase());
            User user = userService.setRole(request.getUserId(), role);
            if(user != null) {
                return ResponseEntity.status(200).body(user);
            }
            else return ResponseEntity.status(404).body(new StatusResponse("User not found"));
        }
        catch(Exception e) {
            return ResponseEntity.status(404).body(new StatusResponse("Role not found"));
        }

    }
}
