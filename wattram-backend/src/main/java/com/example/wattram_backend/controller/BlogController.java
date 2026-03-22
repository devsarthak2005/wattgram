package com.example.wattram_backend.controller;

import com.example.wattram_backend.dto.BlogDto;
import com.example.wattram_backend.service.BlogService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blogs")
@AllArgsConstructor
public class BlogController {

    private BlogService blogService;

    private String getCurrentUsername(Authentication authentication) {
        return authentication != null ? authentication.getName() : null;
    }

    @PostMapping
    public ResponseEntity<BlogDto> createBlog(@RequestBody BlogDto blogDto, Authentication authentication){
        return new ResponseEntity<>(blogService.createBlog(blogDto, authentication.getName()), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BlogDto>> getAllBlogs(Authentication authentication){
        return ResponseEntity.ok(blogService.getAllBlogs(getCurrentUsername(authentication)));
    }

    @GetMapping("/me/drafts")
    public ResponseEntity<List<BlogDto>> getMyDrafts(Authentication authentication){
        return ResponseEntity.ok(blogService.getDraftsByAuthor(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogDto> getBlogById(@PathVariable(name = "id") Long id, Authentication authentication){
        return ResponseEntity.ok(blogService.getBlogById(id, getCurrentUsername(authentication)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlogDto> updateBlog(@RequestBody BlogDto blogDto, @PathVariable(name = "id") Long id, Authentication authentication){
        BlogDto blogResponse = blogService.updateBlog(blogDto, id, authentication.getName());
        return new ResponseEntity<>(blogResponse, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBlog(@PathVariable(name = "id") Long id, Authentication authentication){
        blogService.deleteBlog(id, authentication.getName());
        return new ResponseEntity<>("Blog entity deleted successfully.", HttpStatus.OK);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<String> toggleLike(@PathVariable(name = "id") Long id, Authentication authentication){
        blogService.toggleLike(id, authentication.getName());
        return ResponseEntity.ok("Like toggled");
    }
}
