package com.example.wattram_backend.controller;

import com.example.wattram_backend.dto.request.LoginRequest;
import com.example.wattram_backend.dto.request.SignupRequest;
import com.example.wattram_backend.dto.response.JwtAuthResponse;
import com.example.wattram_backend.service.AuthService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {

    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@RequestBody LoginRequest loginRequest){
        String token = authService.login(loginRequest);
        JwtAuthResponse jwtAuthResponse = new JwtAuthResponse(token);
        return ResponseEntity.ok(jwtAuthResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody SignupRequest signupRequest){
        String response = authService.register(signupRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
