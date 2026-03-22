package com.example.wattram_backend.service;

import com.example.wattram_backend.dto.request.LoginRequest;
import com.example.wattram_backend.dto.request.SignupRequest;

public interface AuthService {
    String login(LoginRequest loginRequest);
    String register(SignupRequest signupRequest);
}
