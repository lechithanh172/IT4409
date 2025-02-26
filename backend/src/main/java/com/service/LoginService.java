package com.service;

import com.entity.User;
import com.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
@Service
public class LoginService {
    @Autowired
    UserRepository userRepository;

    public boolean login(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            if(password.equals(user.get().getPassword())) {
                return true;
            }
            else return false;
        }
        else return false;
    }
}
