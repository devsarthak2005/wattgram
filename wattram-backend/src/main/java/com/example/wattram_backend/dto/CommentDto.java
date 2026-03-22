package com.example.wattram_backend.dto;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class CommentDto {
    private Long id;
    private String content;
    private LocalDateTime date;
    private String authorName;
}
