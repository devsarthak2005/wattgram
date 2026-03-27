package com.example.wattram_backend.service.impl;

import com.example.wattram_backend.dto.ChatMessageDto;
import com.example.wattram_backend.entity.ChatMessage;
import com.example.wattram_backend.entity.User;
import com.example.wattram_backend.exception.ResourceNotFoundException;
import com.example.wattram_backend.repository.ChatMessageRepository;
import com.example.wattram_backend.repository.UserRepository;
import com.example.wattram_backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatServiceImpl implements ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    @Transactional
    public ChatMessageDto saveMessage(ChatMessageDto chatMessageDto) {
        User sender = userRepository.findById(chatMessageDto.getSenderId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", String.valueOf(chatMessageDto.getSenderId())));
        User receiver = userRepository.findById(chatMessageDto.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", String.valueOf(chatMessageDto.getReceiverId())));

        if (!isChatAllowed(sender.getId(), receiver.getId())) {
            throw new RuntimeException("Users must follow each other to chat.");
        }

        ChatMessage message = new ChatMessage();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(chatMessageDto.getContent());
        message.setTimestamp(LocalDateTime.now());

        ChatMessage savedMessage = chatMessageRepository.save(message);

        ChatMessageDto savedDto = mapToDto(savedMessage);

        String cacheKey = getCacheKey(sender.getId(), receiver.getId());
        redisTemplate.opsForList().rightPush(cacheKey, savedDto);
        redisTemplate.opsForList().trim(cacheKey, -100, -1);

        return savedDto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getChatHistory(Long userId1, Long userId2) {
        String cacheKey = getCacheKey(userId1, userId2);
        
        List<Object> cachedMessages = redisTemplate.opsForList().range(cacheKey, 0, -1);
        if (cachedMessages != null && !cachedMessages.isEmpty()) {
            return cachedMessages.stream()
                .map(msg -> (ChatMessageDto) msg)
                .collect(Collectors.toList());
        }

        User user1 = userRepository.findById(userId1).orElseThrow(() -> new ResourceNotFoundException("User", "id", String.valueOf(userId1)));
        User user2 = userRepository.findById(userId2).orElseThrow(() -> new ResourceNotFoundException("User", "id", String.valueOf(userId2)));

        List<ChatMessage> dbMessages = chatMessageRepository.findChatHistory(user1, user2);
        List<ChatMessageDto> dtos = dbMessages.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        for (ChatMessageDto dto : dtos) {
            redisTemplate.opsForList().rightPush(cacheKey, dto);
        }
        
        return dtos;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isChatAllowed(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1).orElseThrow(() -> new ResourceNotFoundException("User", "id", String.valueOf(userId1)));
        User user2 = userRepository.findById(userId2).orElseThrow(() -> new ResourceNotFoundException("User", "id", String.valueOf(userId2)));
        
        boolean user1FollowsUser2 = user1.getFollowing().contains(user2);
        boolean user2FollowsUser1 = user2.getFollowing().contains(user1);

        if (user1.getBlockedUsers().contains(user2) || user2.getBlockedUsers().contains(user1)) {
            return false;
        }

        return user1FollowsUser2 || user2FollowsUser1;
    }

    private String getCacheKey(Long user1, Long user2) {
        Long minId = Math.min(user1, user2);
        Long maxId = Math.max(user1, user2);
        return "chat:" + minId + ":" + maxId;
    }

    private ChatMessageDto mapToDto(ChatMessage message) {
        ChatMessageDto dto = new ChatMessageDto();
        dto.setId(message.getId());
        dto.setSenderId(message.getSender().getId());
        dto.setReceiverId(message.getReceiver().getId());
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimestamp());
        return dto;
    }
}
