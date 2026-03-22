package com.example.wattram_backend.service.impl;

import com.example.wattram_backend.dto.BlogDto;
import com.example.wattram_backend.entity.Blog;
import com.example.wattram_backend.entity.User;
import com.example.wattram_backend.exception.APIException;
import com.example.wattram_backend.exception.ResourceNotFoundException;
import com.example.wattram_backend.repository.BlogRepository;
import com.example.wattram_backend.repository.UserRepository;
import com.example.wattram_backend.service.BlogService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class BlogServiceImpl implements BlogService {

    private BlogRepository blogRepository;
    private UserRepository userRepository;

    private BlogDto mapToDTO(Blog blog, String currentUsername) {
        BlogDto blogDto = new BlogDto();
        blogDto.setId(blog.getId());
        blogDto.setTitle(blog.getTitle());
        blogDto.setPreview(blog.getPreview());
        blogDto.setContent(blog.getContent());
        blogDto.setCategory(blog.getCategory());
        blogDto.setDate(blog.getDate());
        blogDto.setAuthorName(blog.getAuthor().getUsername());
        blogDto.setImage(blog.getImage());
        blogDto.setDraft(blog.getDraft());
        blogDto.setLikesCount(blog.getLikedBy().size());
        
        if (currentUsername != null && !currentUsername.equals("anonymousUser")) {
             User currentUser = userRepository.findByUsername(currentUsername).orElse(null);
             if (currentUser != null) {
                 blogDto.setLikedByCurrentUser(blog.getLikedBy().contains(currentUser));
             }
        }
        return blogDto;
    }

    private Blog mapToEntity(BlogDto blogDto) {
        Blog blog = new Blog();
        blog.setTitle(blogDto.getTitle());
        blog.setPreview(blogDto.getPreview());
        blog.setContent(blogDto.getContent());
        blog.setCategory(blogDto.getCategory());
        blog.setImage(blogDto.getImage());
        blog.setDraft(blogDto.getDraft());
        return blog;
    }

    @Override
    public BlogDto createBlog(BlogDto blogDto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Blog blog = mapToEntity(blogDto);
        blog.setAuthor(user);
        Blog newBlog = blogRepository.save(blog);
        return mapToDTO(newBlog, username);
    }

    @Override
    public List<BlogDto> getAllBlogs(String currentUsername) {
        List<Blog> blogs = blogRepository.findByDraftFalse();
        return blogs.stream().map(b -> mapToDTO(b, currentUsername)).collect(Collectors.toList());
    }

    @Override
    public List<BlogDto> getDraftsByAuthor(String username) {
        List<Blog> blogs = blogRepository.findByAuthorUsernameAndDraftTrue(username);
        return blogs.stream().map(b -> mapToDTO(b, username)).collect(Collectors.toList());
    }

    @Override
    public BlogDto getBlogById(Long id, String currentUsername) {
        Blog blog = blogRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Blog", "id", String.valueOf(id)));
        return mapToDTO(blog, currentUsername);
    }

    @Override
    public BlogDto updateBlog(BlogDto blogDto, Long id, String username) {
        Blog blog = blogRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Blog", "id", String.valueOf(id)));
        if(!blog.getAuthor().getUsername().equals(username)) {
             throw new APIException(HttpStatus.UNAUTHORIZED, "You don't have permission to update this blog");
        }
        blog.setTitle(blogDto.getTitle());
        blog.setPreview(blogDto.getPreview());
        blog.setContent(blogDto.getContent());
        blog.setCategory(blogDto.getCategory());
        blog.setImage(blogDto.getImage());
        blog.setDraft(blogDto.getDraft());

        Blog updatedBlog = blogRepository.save(blog);
        return mapToDTO(updatedBlog, username);
    }

    @Override
    public void deleteBlog(Long id, String username) {
        Blog blog = blogRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Blog", "id", String.valueOf(id)));
        if(!blog.getAuthor().getUsername().equals(username)) {
             throw new APIException(HttpStatus.UNAUTHORIZED, "You don't have permission to delete this blog");
        }
        blogRepository.delete(blog);
    }

    @Override
    public void toggleLike(Long blogId, String username) {
        Blog blog = blogRepository.findById(blogId).orElseThrow(() -> new ResourceNotFoundException("Blog", "id", String.valueOf(blogId)));
        User user = userRepository.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        
        if (blog.getLikedBy().contains(user)) {
            blog.getLikedBy().remove(user);
        } else {
            blog.getLikedBy().add(user);
        }
        blogRepository.save(blog);
    }
}
