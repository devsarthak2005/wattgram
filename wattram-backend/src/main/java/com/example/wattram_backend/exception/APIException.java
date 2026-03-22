package com.example.wattram_backend.exception;
import org.springframework.http.HttpStatus;
import lombok.Getter;

@Getter
public class APIException extends RuntimeException {
    private HttpStatus status;
    private String message;

    public APIException(HttpStatus status, String message) {
        super(message);
        this.status = status;
        this.message = message;
    }
}
