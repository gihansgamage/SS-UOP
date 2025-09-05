package lk.ac.pdn.sms.service;

import lk.ac.pdn.sms.entity.ActivityLog;
import lk.ac.pdn.sms.entity.AdminUser;
import lk.ac.pdn.sms.repository.ActivityLogRepository;
import lk.ac.pdn.sms.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private AdminUserRepository adminUserRepository;

    public void logActivity(String action, String target, String userName) {
        // Try to find admin user by name, otherwise create a generic log
        AdminUser user = adminUserRepository.findByEmail(userName + "@pdn.ac.lk").orElse(null);
        
        ActivityLog log = new ActivityLog();
        log.setUserId(user != null ? user.getId() : 0L);
        log.setUserName(userName);
        log.setAction(action);
        log.setTarget(target);
        
        activityLogRepository.save(log);
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