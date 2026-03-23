package com.example.wattram_backend.controller;

import com.example.wattram_backend.dto.UserDto;
import com.example.wattram_backend.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class UserController {

    private UserService userService;

    private String getCurrentUsername(Authentication authentication) {
        return authentication != null ? authentication.getName() : null;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(userService.getCurrentUser(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateProfile(@RequestBody UserDto userDto, Authentication authentication) {
        return ResponseEntity.ok(userService.updateUserProfile(authentication.getName(), userDto));
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserDto> getUserProfile(@PathVariable("username") String username, Authentication authentication) {
        return ResponseEntity.ok(userService.getUserProfile(username, getCurrentUsername(authentication)));
    }

    @PostMapping("/{username}/follow")
    public ResponseEntity<String> followUser(@PathVariable("username") String username, Authentication authentication) {
        userService.followUser(username, authentication.getName());
        return ResponseEntity.ok("Successfully followed " + username);
    }

    @DeleteMapping("/{username}/follow")
    public ResponseEntity<String> unfollowUser(@PathVariable("username") String username, Authentication authentication) {
        userService.unfollowUser(username, authentication.getName());
        return ResponseEntity.ok("Successfully unfollowed " + username);
    }

    @GetMapping("/{username}/followers")
    public ResponseEntity<List<UserDto>> getFollowers(@PathVariable("username") String username, Authentication authentication) {
        return ResponseEntity.ok(userService.getFollowers(username, getCurrentUsername(authentication)));
    }

    @GetMapping("/{username}/following")
    public ResponseEntity<List<UserDto>> getFollowing(@PathVariable("username") String username, Authentication authentication) {
        return ResponseEntity.ok(userService.getFollowing(username, getCurrentUsername(authentication)));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUsers(@RequestParam("query") String query, Authentication authentication) {
        return ResponseEntity.ok(userService.searchUsers(query, getCurrentUsername(authentication)));
    }

    @GetMapping
    public ResponseEntity<Page<UserDto>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam Map<String, String> filters,
            @PageableDefault(page = 0, size = 10) Pageable pageable,
            Authentication authentication) {
        return ResponseEntity.ok(userService.searchAndFilterUsers(keyword, filters, pageable, getCurrentUsername(authentication)));
    }
}
