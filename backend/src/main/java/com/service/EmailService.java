package com.service;

import com.config.MailConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Autowired
    MailConfig mailConfig;

    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom("toilaatmin@gmail.com");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        try {
            mailConfig.javaMailSender().send(message);
        } catch (Exception e) {
            System.out.print("Error sending email" + e.getMessage());
        }
    }

}