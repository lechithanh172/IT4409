package com.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.util.*;

@Service
public class OtpService {

    @Autowired
    private EmailService emailService;

    private final Map<String, String> otpStorage = new HashMap<>();
    private final Random random = new Random();

    public String generateOtp(String email, String subject) throws UnsupportedEncodingException {
        String otp = String.format("%06d", random.nextInt(999999));
        otpStorage.put(email, otp);

        emailService.sendEmail(email, subject, "Mã xác thực OTP: " + otp);
        new Timer().schedule(new TimerTask() {
            @Override
            public void run() {
                otpStorage.remove(email);
            }
        }, 5 * 60 * 1000);
        return otp;
    }

    public boolean validateOtp(String email, String otp) {
        String storedOtp = otpStorage.get(email);
        return storedOtp != null && storedOtp.equals(otp);
    }
}