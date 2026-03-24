package com.example.wattram_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import java.io.Serializable;

@Getter
@Setter
public class UserDto implements Serializable {
    private Long id;
    private String name;
    private String username;
    private String bio;
    private int followersCount;
    private int followingCount;

    @JsonProperty("following")
    private boolean isFollowing;

    private String profilePicture;
}
