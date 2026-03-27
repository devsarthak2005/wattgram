package com.example.wattram_backend.controller;

import com.example.wattram_backend.dto.ChatMessageDto;
import com.example.wattram_backend.dto.UserDto;
import com.example.wattram_backend.entity.User;
import com.example.wattram_backend.exception.ResourceNotFoundException;
import com.example.wattram_backend.repository.UserRepository;
import com.example.wattram_backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserRepository userRepository;

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessageDto chatMessageDto) {
        ChatMessageDto savedMsg = chatService.saveMessage(chatMessageDto);
        
        messagingTemplate.convertAndSend("/topic/messages/" + chatMessageDto.getReceiverId(), savedMsg);
    }

    @GetMapping("/api/chat/{userId1}/{userId2}")
    public ResponseEntity<List<ChatMessageDto>> getChatHistory(@PathVariable Long userId1, @PathVariable Long userId2) {
        List<ChatMessageDto> messages = chatService.getChatHistory(userId1, userId2);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/api/chat/contacts/{userId}")
    @Transactional(readOnly = true)
    public ResponseEntity<Set<UserDto>> getChatContacts(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", String.valueOf(userId)));
        
        Set<User> contacts = new HashSet<>();
        contacts.addAll(user.getFollowing());
        contacts.addAll(user.getFollowers());
        
        Set<UserDto> contactDtos = contacts.stream()
            .filter(c -> !user.getBlockedUsers().contains(c) && !c.getBlockedUsers().contains(user))
            .map(c -> {
            UserDto dto = new UserDto();
            dto.setId(c.getId());
            dto.setUsername(c.getUsername());
            dto.setName(c.getName());
            dto.setProfilePicture(c.getProfilePicture());
            return dto;
        }).collect(Collectors.toSet());
        
        return ResponseEntity.ok(contactDtos);
    }
}
