package com.service;

import com.entity.User;
import com.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.Random;

@Service
public class UpdateUserInfoService {

    @Autowired
    UserRepository userRepository;

    public boolean updateUserInfo(User request) {
        Optional<User> user = userRepository.findByEmail(request.getEmail());
        if (!user.isPresent()) {
            return false;
        }
        userRepository.save(request);
        return true;
    }
}
