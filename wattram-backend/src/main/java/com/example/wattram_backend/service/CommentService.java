package com.example.wattram_backend.service;

import com.example.wattram_backend.dto.CommentDto;
import java.util.List;

public interface CommentService {
    CommentDto createComment(Long blogId, CommentDto commentDto, String username);
    List<CommentDto> getCommentsByBlogId(Long blogId);
    void deleteComment(Long blogId, Long commentId, String username);
}
