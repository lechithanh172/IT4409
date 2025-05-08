package com.service;

import com.entity.RefreshToken;
import com.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class RefreshTokenService {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    public void saveToken(String token, String username, LocalDateTime expiryDate) {
        refreshTokenRepository.deleteByUsername(username);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(token);
        refreshToken.setUsername(username);
        refreshToken.setExpiryDate(expiryDate);

        refreshTokenRepository.save(refreshToken);
    }

    public boolean isValid(String token) {
        Optional<RefreshToken> found = refreshTokenRepository.findByToken(token);
        return found.isPresent() && found.get().getExpiryDate().isAfter(LocalDateTime.now());
    }

    public Optional<String> getUsernameFromToken(String token) {
        return refreshTokenRepository.findByToken(token).map(RefreshToken::getUsername);
    }

    public void revokeToken(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(refreshTokenRepository::delete);
    }
}

