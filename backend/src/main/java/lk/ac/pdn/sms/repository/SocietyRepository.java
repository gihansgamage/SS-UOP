package lk.ac.pdn.sms.repository;

import lk.ac.pdn.sms.entity.Society;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SocietyRepository extends JpaRepository<Society, Long> {
    
    List<Society> findByStatus(Society.SocietyStatus status);
    
    Page<Society> findByStatusAndYear(String status, Integer year, Pageable pageable);
    
    @Query("SELECT s FROM Society s WHERE " +
           "(:search IS NULL OR LOWER(s.societyName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR s.status = :status) AND " +
           "(:year IS NULL OR s.year = :year)")
    Page<Society> findBySearchCriteria(@Param("search") String search, 
                                     @Param("status") String status, 
                                     @Param("year") Integer year, 
                                     Pageable pageable);
    
    boolean existsBySocietyNameAndYear(String societyName, Integer year);
    
    Optional<Society> findBySocietyNameAndStatus(String societyName, Society.SocietyStatus status);
    
    long countByStatus(Society.SocietyStatus status);
    
    @Query("SELECT COUNT(s) FROM Society s WHERE s.year = :year")
    long countByYear(@Param("year") Integer year);
}