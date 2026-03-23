package com.example.wattram_backend.service.impl;

import com.example.wattram_backend.dto.UserDto;
import com.example.wattram_backend.entity.User;
import com.example.wattram_backend.exception.APIException;
import com.example.wattram_backend.exception.ResourceNotFoundException;
import com.example.wattram_backend.repository.UserRepository;
import com.example.wattram_backend.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {

    private UserRepository userRepository;

    private UserDto mapToDto(User user, User currentUser) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setBio(user.getBio());
        dto.setFollowersCount(user.getFollowers().size());
        dto.setFollowingCount(user.getFollowing().size());
        dto.setProfilePicture(user.getProfilePicture());
        
        if (currentUser != null && !currentUser.equals(user)) {
            dto.setFollowing(user.getFollowers().contains(currentUser));
        } else {
            dto.setFollowing(false);
        }
        return dto;
    }

    @Override
    public UserDto getCurrentUser(String currentUsername) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUsername));
        return mapToDto(user, user);
    }

    @Override
    public UserDto updateUserProfile(String currentUsername, UserDto updateDto) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUsername));
        
        user.setName(updateDto.getName());
        user.setBio(updateDto.getBio());
        if (updateDto.getProfilePicture() != null) {
            user.setProfilePicture(updateDto.getProfilePicture());
        }
        User updated = userRepository.save(user);
        
        return mapToDto(updated, updated);
    }

    @Override
    public UserDto getUserProfile(String targetUsername, String currentUsername) {
        User target = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", targetUsername));
        
        User current = null;
        if (currentUsername != null && !currentUsername.equals("anonymousUser")) {
            current = userRepository.findByUsername(currentUsername).orElse(null);
        }
        
        return mapToDto(target, current);
    }

    @Override
    public void followUser(String targetUsername, String currentUsername) {
        User current = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUsername));
        
        User target = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", targetUsername));
        
        if(current.getId().equals(target.getId())){
            throw new APIException(HttpStatus.BAD_REQUEST, "You cannot follow yourself");
        }
        
        target.getFollowers().add(current);
        userRepository.save(target);
    }

    @Override
    public void unfollowUser(String targetUsername, String currentUsername) {
        User current = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUsername));
        
        User target = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", targetUsername));
        
        target.getFollowers().remove(current);
        userRepository.save(target);
    }

    @Override
    public List<UserDto> searchUsers(String query, String currentUsername) {
        User current = null;
        if (currentUsername != null && !currentUsername.equals("anonymousUser")) {
            current = userRepository.findByUsername(currentUsername).orElse(null);
        }
        User finalCurrent = current;
        
        // Find by username containing or name containing
        List<User> users = userRepository.findByUsernameContainingIgnoreCaseOrNameContainingIgnoreCase(query, query);
        
        return users.stream()
                .map(u -> mapToDto(u, finalCurrent))
                .collect(Collectors.toList());
    }

    @Override
    public org.springframework.data.domain.Page<UserDto> searchAndFilterUsers(String keyword, java.util.Map<String, String> filters, org.springframework.data.domain.Pageable pageable, String currentUsername) {
        User current = null;
        if (currentUsername != null && !currentUsername.equals("anonymousUser")) {
            current = userRepository.findByUsername(currentUsername).orElse(null);
        }
        User finalCurrent = current;

        org.springframework.data.jpa.domain.Specification<User> spec = com.example.wattram_backend.specification.UserSpecification.searchAndFilter(keyword, filters);
        org.springframework.data.domain.Page<User> userPage = userRepository.findAll(spec, pageable);

        return userPage.map(u -> mapToDto(u, finalCurrent));
    }

    @Override
    public List<UserDto> getFollowers(String targetUsername, String currentUsername) {
        User target = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", targetUsername));

        User current = null;
        if (currentUsername != null && !currentUsername.equals("anonymousUser")) {
            current = userRepository.findByUsername(currentUsername).orElse(null);
        }
        User finalCurrent = current;

        return target.getFollowers().stream()
                .map(u -> mapToDto(u, finalCurrent))
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDto> getFollowing(String targetUsername, String currentUsername) {
        User target = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", targetUsername));

        User current = null;
        if (currentUsername != null && !currentUsername.equals("anonymousUser")) {
            current = userRepository.findByUsername(currentUsername).orElse(null);
        }
        User finalCurrent = current;

        return target.getFollowing().stream()
                .map(u -> mapToDto(u, finalCurrent))
                .collect(Collectors.toList());
    }
}
