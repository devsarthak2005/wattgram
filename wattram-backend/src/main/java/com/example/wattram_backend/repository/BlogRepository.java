package com.example.wattram_backend.repository;
import com.example.wattram_backend.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BlogRepository extends JpaRepository<Blog, Long> {
    List<Blog> findByDraftFalse();
    List<Blog> findByAuthorUsernameAndDraftTrue(String username);
}
