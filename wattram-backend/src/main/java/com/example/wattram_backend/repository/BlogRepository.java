package com.example.wattram_backend.repository;
import com.example.wattram_backend.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface BlogRepository extends JpaRepository<Blog, Long> {
    List<Blog> findByDraftFalseOrderByDateDesc();
    
    @Query(value = "SELECT * FROM blogs WHERE draft = false ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Blog> findRandomBlogs(@Param("limit") int limit);

    List<Blog> findByAuthorUsernameAndDraftTrue(String username);
}
