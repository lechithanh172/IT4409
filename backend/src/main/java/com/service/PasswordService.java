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
    UserRepository userRepository;
    @Autowired
    EmailService emailService;
    @Autowired
    PasswordEncoder passwordEncoder;

    public void changePassword(Integer userId, String newPassword) {
        Optional<User> user = userRepository.findByUserId(userId);
        user.get().setPassword(passwordEncoder.encode(newPassword));
    }

    public String generateRandomPassword() {
        StringBuilder password = new StringBuilder();
        Random random = new Random();
        for(int i = 0; i < 16; i++) {
            char c = (char)(random.nextInt(26));
            if(random.nextBoolean()) {
                c += 97;
            }
            else c += 65;
            password.append(c);
        }
        return password.toString();
    }

    public boolean forgetPassword(String email) throws UnsupportedEncodingException {
        Optional<User> user = userRepository.findByEmail(email);
        if(user.isPresent()) {
            String randomPassword = generateRandomPassword();
            emailService.sendEmail(email, "Cấp lại mật khẩu tài khoản", "Mật khẩu mới: " +randomPassword);
            return true;
        }
        else return false;
    }
}
