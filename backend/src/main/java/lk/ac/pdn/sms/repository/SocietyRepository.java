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

    // Updated Query to LEFT JOIN FETCH officials so they are available for the JSON Helpers
    @Query("SELECT DISTINCT s FROM Society s LEFT JOIN FETCH s.officials WHERE " +
            "(:search IS NULL OR LOWER(s.societyName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:status IS NULL OR s.status = :status) AND " +
            "(:year IS NULL OR s.year = :year)")
    Page<Society> searchSocieties(@Param("search") String search,
                                  @Param("status") Society.SocietyStatus status,
                                  @Param("year") Integer year,
                                  Pageable pageable);

    List<Society> findByStatus(Society.SocietyStatus status);

    long countByStatus(Society.SocietyStatus status);

    Optional<Society> findBySocietyName(String societyName);

    Optional<Society> findBySocietyNameAndStatus(String societyName, Society.SocietyStatus status);
}