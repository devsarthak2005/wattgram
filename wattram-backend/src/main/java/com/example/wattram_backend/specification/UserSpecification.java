package com.example.wattram_backend.specification;

import com.example.wattram_backend.entity.User;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class UserSpecification {

    public static Specification<User> searchAndFilter(String keyword, Map<String, String> filters) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Keyword search
            if (keyword != null && !keyword.trim().isEmpty()) {
                String searchPattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate nameLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchPattern);
                Predicate usernameLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("username")), searchPattern);
                Predicate bioLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("bio")), searchPattern);
                
                // (name LIKE %kw% OR username LIKE %kw% OR bio LIKE %kw%)
                predicates.add(criteriaBuilder.or(nameLike, usernameLike, bioLike));
            }

            // 2. Dynamic Filtering
            if (filters != null && !filters.isEmpty()) {
                // Remove pagination/search specific parameters so we don't treat them as column filters
                List<String> ignoredKeys = List.of("keyword", "page", "size", "sort", "query");

                for (Map.Entry<String, String> filter : filters.entrySet()) {
                    String key = filter.getKey();
                    String value = filter.getValue();

                    if (!ignoredKeys.contains(key) && value != null && !value.trim().isEmpty()) {
                        // Attempt to filter on valid attributes
                        try {
                            // verify that generic attribute exists
                            root.get(key); 
                            predicates.add(criteriaBuilder.equal(root.get(key), value));
                        } catch (IllegalArgumentException e) {
                            // Ignored if the field doesn't exist on User entity
                        }
                    }
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
