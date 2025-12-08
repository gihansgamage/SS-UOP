package lk.ac.pdn.sms.repository;

import lk.ac.pdn.sms.entity.EventPermission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventPermissionRepository extends JpaRepository<EventPermission, Long> {

    // List for specific Logic
    List<EventPermission> findByStatus(EventPermission.EventStatus status);

    // Page for Admin Table
    Page<EventPermission> findByStatus(EventPermission.EventStatus status, Pageable pageable);

    // Upcoming Approved Events (For Home Page)
    @Query("SELECT e FROM EventPermission e WHERE e.status = 'APPROVED' AND e.eventDate >= CURRENT_DATE ORDER BY e.eventDate ASC")
    List<EventPermission> findUpcomingApprovedEvents();
}