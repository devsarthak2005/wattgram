package com.example.wattram_backend.service;

import com.example.wattram_backend.dto.BlogDto;
import java.util.List;

public interface BlogService {
    BlogDto createBlog(BlogDto blogDto, String username);
    List<BlogDto> getAllBlogs(String currentUsername);
    List<BlogDto> getDraftsByAuthor(String username);
    BlogDto getBlogById(Long id, String currentUsername);
    BlogDto updateBlog(BlogDto blogDto, Long id, String username);
    void deleteBlog(Long id, String username);
    void toggleLike(Long blogId, String username);
    List<BlogDto> getExploreBlogs(int limit, String currentUsername);
}
