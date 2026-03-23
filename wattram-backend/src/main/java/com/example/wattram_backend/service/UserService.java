package com.example.wattram_backend.service;

import com.example.wattram_backend.dto.UserDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Map;

public interface UserService {
    UserDto getCurrentUser(String currentUsername);
    UserDto updateUserProfile(String currentUsername, UserDto updateDto);
    UserDto getUserProfile(String targetUsername, String currentUsername);
    void followUser(String targetUsername, String currentUsername);
    void unfollowUser(String targetUsername, String currentUsername);
    List<UserDto> searchUsers(String query, String currentUsername);
    Page<UserDto> searchAndFilterUsers(String keyword, Map<String, String> filters, Pageable pageable, String currentUsername);
    List<UserDto> getFollowers(String targetUsername, String currentUsername);
    List<UserDto> getFollowing(String targetUsername, String currentUsername);
}
