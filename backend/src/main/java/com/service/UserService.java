package com.service;

import com.entity.User;
import com.repository.UserRepository;
import com.request.SignUpOTPRequest;
import com.request.SignUpRequest;
import com.request.UpdateInfoRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;

    public Optional<User> findByEmail(String email) {return userRepository.findByEmail(email);}

    public Optional<User> findByUsername(String username) {return userRepository.findByUsername(username);}

    public void createUser(SignUpOTPRequest request) {
        User user = new User(request.getUsername(), passwordEncoder.encode(request.getPassword()), request.getEmail(), request.getFirstName(), request.getLastName(), request.getPhoneNumber(), request.getAddress(), request.getRole());
        userRepository.save(user);
    }

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

    public Optional<User> getInfo(String token) {
        String username = jwtService.extractUsername(token);
        return userRepository.findByUsername(username);
    }

    public boolean updateUserInfo(String username, UpdateInfoRequest request) {
        Optional<User> optionalUser = userRepository.findByUsername(username);
        if (optionalUser.isEmpty()) {
            return false;
        }
        User user = optionalUser.get();
        if(request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if(request.getLastName() != null) user.setLastName(request.getLastName());
        if(request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if(request.getAddress() != null) user.setAddress(request.getAddress());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return true;
    }

    public boolean deleteUser(Integer  userId) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if(optionalUser.isPresent()) {
            userRepository.delete(optionalUser.get());
            return true;
        }
        else return false;
    }
}
