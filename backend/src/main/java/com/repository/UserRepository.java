package com.repository;

import com.entity.User;
import com.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUserId(Integer userId);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    List<User> findUsersByRole(Role role);
}