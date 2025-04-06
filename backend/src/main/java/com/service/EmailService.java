package com.service;

import com.config.MailConfig;
import jakarta.mail.internet.InternetAddress;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
public class EmailService {
    @Autowired
    private MailConfig mailConfig;
    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String text) throws UnsupportedEncodingException {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(String.valueOf(new InternetAddress("toilaatmin@gmail.com", "Át Min")));
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        try {
            mailConfig.javaMailSender().send(message);
            System.out.println("Sent message successfully");
        } catch (Exception e) {
            System.out.print("Error sending email" + e.getMessage());
        }
    }

}