package com.example.wattram_backend.service;

import com.example.wattram_backend.dto.ChatMessageDto;
import java.util.List;

public interface ChatService {
    ChatMessageDto saveMessage(ChatMessageDto chatMessageDto);
    List<ChatMessageDto> getChatHistory(Long userId1, Long userId2);
    boolean isChatAllowed(Long userId1, Long userId2);
}
