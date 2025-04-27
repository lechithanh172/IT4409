package com.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {
    @Autowired
    JwtAuthenticationFilter jwtAuthenticationFilter;
    @Autowired
    CustomAccessDeniedHandler customAccessDeniedHandler;
    @Autowired
    CustomAuthenticationEntryPoint customAuthenticationEntryPoint;
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurer()))
                .csrf((AbstractHttpConfigurer::disable))
                .exceptionHandling(ex -> ex
                        .accessDeniedHandler(customAccessDeniedHandler)
                        .authenticationEntryPoint(customAuthenticationEntryPoint)
                )
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/user/forget-password").permitAll()
                        .requestMatchers("/user/reset-password").permitAll()
                        .requestMatchers("/user/**").authenticated()
                        .requestMatchers("/product/add").hasAnyRole("ADMIN", "PRODUCT_MANAGER")
                        .requestMatchers("/product/delete").hasAnyRole("ADMIN", "PRODUCT_MANAGER")
                        .requestMatchers("/product/update").hasAnyRole("ADMIN", "PRODUCT_MANAGER")
                        .requestMatchers("/product/**").permitAll()
                        .requestMatchers("/category").permitAll()
                        .requestMatchers("/category/").permitAll()
                        .requestMatchers("/category/**").hasAnyRole("ADMIN", "PRODUCT_MANAGER")
                        .requestMatchers("/brand/").permitAll()
                        .requestMatchers("/brand").permitAll()
                        .requestMatchers("/brand/**").hasAnyRole("ADMIN", "PRODUCT_MANAGER")
                        .requestMatchers("/order/status/**").hasAnyRole("ADMIN", "PRODUCT_MANAGER")
                        .requestMatchers("/order/approve/").hasAnyRole("ADMIN", "PRODUCT_MANAGER")
                        .requestMatchers("/order/**").authenticated()
                        .requestMatchers("/cart-item/check").permitAll()
                        .requestMatchers("/cart-item/**").authenticated()
                        .requestMatchers("/category/**").hasAnyRole("ADMIN", "PRODUCT_MANAGER")
                        .requestMatchers("/api/vnpay/**").authenticated()
                        .anyRequest().permitAll()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurer() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    @Bean
    public DaoAuthenticationProvider authenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http, AuthenticationProvider provider) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .authenticationProvider(provider)
                .build();
    }
}
