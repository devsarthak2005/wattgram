package com.example.wattram_backend.dto;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class BlogDto {
    private Long id;
    private String title;
    private String preview;
    private String content;
    private String category;
    private LocalDateTime date;
    private String authorName;
    private String image;
    private Boolean draft;
    private int likesCount;
    private boolean likedByCurrentUser;
}
