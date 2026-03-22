package com.example.wattram_backend.controller;

import com.example.wattram_backend.dto.CommentDto;
import com.example.wattram_backend.service.CommentService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
public class CommentController {

    private CommentService commentService;

    @PostMapping("/blogs/{blogId}/comments")
    public ResponseEntity<CommentDto> createComment(
            @PathVariable(value = "blogId") long blogId,
            @RequestBody CommentDto commentDto,
            Authentication authentication){
        return new ResponseEntity<>(commentService.createComment(blogId, commentDto, authentication.getName()), HttpStatus.CREATED);
    }

    @GetMapping("/blogs/{blogId}/comments")
    public List<CommentDto> getCommentsByBlogId(@PathVariable(value = "blogId") Long blogId){
        return commentService.getCommentsByBlogId(blogId);
    }

    @DeleteMapping("/blogs/{blogId}/comments/{id}")
    public ResponseEntity<String> deleteComment(
            @PathVariable(value = "blogId") Long blogId,
            @PathVariable(value = "id") Long commentId,
            Authentication authentication){
        commentService.deleteComment(blogId, commentId, authentication.getName());
        return new ResponseEntity<>("Comment deleted successfully", HttpStatus.OK);
    }
}
