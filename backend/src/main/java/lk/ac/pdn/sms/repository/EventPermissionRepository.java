package lk.ac.pdn.sms.repository;

import lk.ac.pdn.sms.entity.EventPermission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventPermissionRepository extends JpaRepository<EventPermission, Long> {
    
    List<EventPermission> findByStatus(EventPermission.EventStatus status);
    
    List<EventPermission> findBySocietyName(String societyName);
    
    @Query("SELECT e FROM EventPermission e WHERE e.eventDate >= :fromDate AND e.eventDate <= :toDate")
    List<EventPermission> findByEventDateBetween(@Param("fromDate") LocalDate fromDate, 
                                                @Param("toDate") LocalDate toDate);
    
    @Query("SELECT e FROM EventPermission e WHERE e.eventDate >= CURRENT_DATE AND e.status = 'APPROVED' ORDER BY e.eventDate ASC")
    List<EventPermission> findUpcomingApprovedEvents();
    
    @Query("SELECT e FROM EventPermission e WHERE e.eventDate < CURRENT_DATE ORDER BY e.eventDate DESC")
    Page<EventPermission> findPastEvents(Pageable pageable);
    
    @Query("SELECT COUNT(e) FROM EventPermission e WHERE e.status = :status")
    long countByStatus(@Param("status") EventPermission.EventStatus status);
    
    @Query("SELECT COUNT(e) FROM EventPermission e WHERE YEAR(e.eventDate) = :year")
    long countByYear(@Param("year") Integer year);
}