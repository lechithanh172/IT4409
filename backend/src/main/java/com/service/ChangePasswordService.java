package com.service;

import com.entity.User;
import com.repository.UserRepository;
import com.request.ChangePasswordRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Random;

@Service
public class ChangePasswordService {

    @Autowired
    UserRepository userRepository;
    @Autowired
    EmailService emailService;

    public boolean changePassword(ChangePasswordRequest request) {
        Optional<User> user = userRepository.findByEmail(request.getEmail());
        if (user.isPresent()) {
            User u = user.get();
            if(request.getOldPassword().equals(u.getPassword())) {
                u.setPassword(request.getNewPassword());
                userRepository.save(u);
                return true;
            }
            else {
                return false;
            }
        }
        return false;
    }

    public String generateRandomPassword() {
        StringBuilder password = new StringBuilder();
        Random random = new Random();
        for(int i = 0; i < 32; i++) {
            char c = (char)(random.nextInt(26));
            if(random.nextBoolean()) {
                c += 97;
            }
            else c += 65;
            password.append(c);
        }
        return password.toString();
    }

    public boolean forgetPassword(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if(user.isPresent()) {
            String randomPassword = generateRandomPassword();
            emailService.sendEmail(email, "Password reset", randomPassword);
            return true;
        }
        else return false;
    }
}
