package com.service;

import com.entity.User;
import com.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
@Service
public class CreateUserService {
    @Autowired
    UserRepository userRepository;

    public boolean createUser(User request) {
        Optional<User> user = userRepository.findByEmail(request.getEmail());
        if (user.isPresent()) {
            return false;
        }
        userRepository.save(request);
        return true;
    }
}
