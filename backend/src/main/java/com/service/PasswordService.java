package com.service;

import com.entity.User;
import com.repository.UserRepository;
import com.request.ChangePasswordRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.util.Optional;
import java.util.Random;

@Service
public class PasswordService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private OtpService otpService;

    public void changePassword(Integer userId, String newPassword) {
        Optional<User> user = userRepository.findByUserId(userId);
        user.get().setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user.get());
    }

    public boolean forgetPassword(String email) throws UnsupportedEncodingException {
        Optional<User> user = userRepository.findByEmail(email);
        if(user.isPresent()) {
            String randomOTP = otpService.generateOtp(email, "Đặt lại mật khẩu");
            return true;
        }
        else return false;
    }
    public boolean resetPassword(String email, String newPassword) {
        Optional<User> user = userRepository.findByEmail(email);
        if(user.isPresent()) {
            user.get().setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user.get());
            return true;
        }
        else return false;
    }
}
