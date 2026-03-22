package com.example.wattram_backend.dto.request;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class SignupRequest {
    private String name;
    private String username;
    private String email;
    private String password;
}
