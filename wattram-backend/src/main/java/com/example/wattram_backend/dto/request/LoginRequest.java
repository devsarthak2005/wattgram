package com.example.wattram_backend.dto.request;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class LoginRequest {
    private String usernameOrEmail;
    private String password;
}
