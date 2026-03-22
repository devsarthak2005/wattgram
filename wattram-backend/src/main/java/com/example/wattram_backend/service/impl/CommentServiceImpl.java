package com.example.wattram_backend.service.impl;

import com.example.wattram_backend.dto.CommentDto;
import com.example.wattram_backend.entity.Blog;
import com.example.wattram_backend.entity.Comment;
import com.example.wattram_backend.entity.User;
import com.example.wattram_backend.exception.APIException;
import com.example.wattram_backend.exception.ResourceNotFoundException;
import com.example.wattram_backend.repository.BlogRepository;
import com.example.wattram_backend.repository.CommentRepository;
import com.example.wattram_backend.repository.UserRepository;
import com.example.wattram_backend.service.CommentService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class CommentServiceImpl implements CommentService {

    private CommentRepository commentRepository;
    private BlogRepository blogRepository;
    private UserRepository userRepository;

    private CommentDto mapToDTO(Comment comment) {
        CommentDto commentDto = new CommentDto();
        commentDto.setId(comment.getId());
        commentDto.setContent(comment.getContent());
        commentDto.setDate(comment.getDate());
        commentDto.setAuthorName(comment.getUser().getUsername());
        return commentDto;
    }

    private Comment mapToEntity(CommentDto commentDto) {
        Comment comment = new Comment();
        comment.setContent(commentDto.getContent());
        return comment;
    }

    @Override
    public CommentDto createComment(Long blogId, CommentDto commentDto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog", "id", String.valueOf(blogId)));

        Comment comment = mapToEntity(commentDto);
        comment.setBlog(blog);
        comment.setUser(user);

        Comment savedComment = commentRepository.save(comment);

        return mapToDTO(savedComment);
    }

    @Override
    public List<CommentDto> getCommentsByBlogId(Long blogId) {
        List<Comment> comments = commentRepository.findByBlogId(blogId);
        return comments.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public void deleteComment(Long blogId, Long commentId, String username) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog", "id", String.valueOf(blogId)));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", String.valueOf(commentId)));

        if(!comment.getBlog().getId().equals(blog.getId())){
            throw new APIException(HttpStatus.BAD_REQUEST, "Comment does not belong to blog");
        }

        if(!comment.getUser().getUsername().equals(username)){
             throw new APIException(HttpStatus.UNAUTHORIZED, "You don't have permission to delete this comment");
        }

        commentRepository.delete(comment);
    }
}
