package com.autoglow.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        public SecurityConfig(
                        JwtAuthenticationFilter jwtAuthenticationFilter) {

                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        }

        // =========================================================
        // PASSWORD ENCODER
        // =========================================================

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        // =========================================================
        // SECURITY FILTER CHAIN
        // =========================================================

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http) throws Exception {

                http

                                // =====================================================
                                // CSRF
                                // =====================================================

                                .csrf(csrf -> csrf.disable())

                                // =====================================================
                                // CORS
                                // =====================================================
                                // CORS configuration is already provided by CorsConfig.java

                                .cors(cors -> {
                                })

                                // =====================================================
                                // SESSION
                                // =====================================================

                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

                                // =====================================================
                                // AUTHORIZATION
                                // =====================================================

                                .authorizeHttpRequests(auth -> auth

                                                // -------------------------------------------------
                                                // CORS PREFLIGHT
                                                // -------------------------------------------------

                                                .requestMatchers(
                                                                HttpMethod.OPTIONS,
                                                                "/**")
                                                .permitAll()

                                                // -------------------------------------------------
                                                // PUBLIC APIs + UPLOADED FILES
                                                // -------------------------------------------------

                                                .requestMatchers(
                                                                "/",
                                                                "/api/auth/**",
                                                                "/uploads/**")
                                                .permitAll()

                                                // -------------------------------------------------
                                                // ADMIN SERVICE MANAGEMENT
                                                // -------------------------------------------------

                                                .requestMatchers(
                                                                "/api/services/admin/**")
                                                .hasRole("ADMIN")

                                                // -------------------------------------------------
                                                // ADMIN APIs
                                                // -------------------------------------------------

                                                .requestMatchers(
                                                                "/api/admin/**")
                                                .hasRole("ADMIN")

                                                // -------------------------------------------------
                                                // WORKER APIs
                                                // -------------------------------------------------

                                                .requestMatchers(
                                                                "/api/worker/**")
                                                .hasRole("WORKER")

                                                // -------------------------------------------------
                                                // CUSTOMER APIs
                                                // -------------------------------------------------

                                                .requestMatchers(
                                                                "/api/customer/**")
                                                .hasRole("CUSTOMER")

                                                // -------------------------------------------------
                                                // EVERYTHING ELSE
                                                // -------------------------------------------------

                                                .anyRequest().authenticated())

                                // =====================================================
                                // DISABLE DEFAULT LOGIN
                                // =====================================================

                                .formLogin(form -> form.disable())

                                .httpBasic(basic -> basic.disable())

                                // =====================================================
                                // JWT FILTER
                                // =====================================================

                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}