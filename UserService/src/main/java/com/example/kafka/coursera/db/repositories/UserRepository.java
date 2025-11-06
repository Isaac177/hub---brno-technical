package com.example.kafka.coursera.db.repositories;

import com.example.kafka.coursera.db.entities.User;
import com.example.kafka.coursera.db.enums.RoleEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    @Query(value = "SELECT * FROM user_coursera WHERE email = :email", nativeQuery = true)
    Optional<User> findByEmail(@Param("email") String email);
    
    boolean existsByEmail(String email);
    
    Page<User> findAll(Pageable pageable);
    
    void deleteByEmail(String email);

    @Query(value = "SELECT * FROM user_coursera WHERE email IN :emails", nativeQuery = true)
    List<User> findAllByEmailIn(@Param("emails") List<String> emails);

    @Query(value = "SELECT * FROM user_coursera WHERE role = CAST(:role AS text)", nativeQuery = true)
    List<User> findByRole(@Param("role") String role);
    
    // Helper method to find by role enum
    default List<User> findByRole(RoleEnum role) {
        return findByRole(role.name());
    }
}
