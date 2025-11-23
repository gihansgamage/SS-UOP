package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.entity.ActivityLog;
import lk.ac.pdn.sms.entity.AdminUser;
import lk.ac.pdn.sms.repository.ActivityLogRepository;
import lk.ac.pdn.sms.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private AdminUserRepository adminUserRepository;

    public void logActivity(String action, String target, String userName) {
        // Try to find if the user is an admin (e.g., Dean, AR)
        AdminUser user = adminUserRepository.findByEmail(userName + "@pdn.ac.lk").orElse(null);

        ActivityLog log = new ActivityLog();

        // FIX: If user is found, use their ID. If not (e.g. Applicant), set NULL.
        // Do NOT set 0L, as it violates the Foreign Key constraint.
        if (user != null) {
            log.setUserId(user.getId());
        } else {
            log.setUserId(null);
        }

        log.setUserName(userName);
        log.setAction(action);
        log.setTarget(target);

        activityLogRepository.save(log);
    }

    public void logActivity(String action, String target, String adminId, String userName) {
        ActivityLog log = new ActivityLog();
        try {
            // FIX: Try to parse ID, but if fails/invalid, use NULL
            log.setUserId(Long.valueOf(adminId));
        } catch (NumberFormatException | NullPointerException e) {
            log.setUserId(null);
        }

        log.setUserName(userName);
        log.setAction(action);
        log.setTarget(target);

        activityLogRepository.save(log);
    }

    public List<ActivityLog> getAllLogs() {
        return activityLogRepository.findAll();
    }

    public Page<ActivityLog> getActivityLogs(String userFilter, String actionFilter, Pageable pageable) {
        if (userFilter != null && !userFilter.isEmpty() && actionFilter != null && !actionFilter.isEmpty()) {
            return activityLogRepository.findByUserNameContainingAndActionContaining(userFilter, actionFilter, pageable);
        } else if (userFilter != null && !userFilter.isEmpty()) {
            return activityLogRepository.findByUserNameContaining(userFilter, pageable);
        } else if (actionFilter != null && !actionFilter.isEmpty()) {
            return activityLogRepository.findByActionContaining(actionFilter, pageable);
        }

        return activityLogRepository.findAll(pageable);
    }
}