package com.example.wattram_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDto {
    private Long id;
    private String name;
    private String username;
    private String bio;
    private int followersCount;
    private int followingCount;
    private boolean isFollowing;
    private String profilePicture;
}
