package com.nextgen.erp.hrm.domain.model;

public class Enums {
    public enum EmployeeStatus {
        ACTIVE, PROBATION, SUSPENDED, LEFT
    }

    public enum GenderType {
        MALE, FEMALE, OTHER
    }

    public enum EmploymentType {
        FULL_TIME, PART_TIME, CONTRACT, INTERN
    }

    public enum AttendanceStatus {
        PRESENT, ABSENT, HALF_DAY, ON_LEAVE, WORK_FROM_HOME
    }

    public enum LeaveStatus {
        PENDING, APPROVED, REJECTED, CANCELLED
    }

    public enum ComponentType {
        EARNING, DEDUCTION
    }

    public enum SalarySlipStatus {
        DRAFT, SUBMITTED, PAID, CANCELLED
    }

    public enum JobStatus {
        OPEN, ON_HOLD, CLOSED
    }

    public enum ApplicantStage {
        APPLIED, SCREENING, TECH_INTERVIEW, HR_INTERVIEW, OFFER_MADE, HIRED, REJECTED
    }

    public enum AppraisalStatus {
        DRAFT, SELF_APPRAISAL_PENDING, MANAGER_REVIEW_PENDING, COMPLETED
    }

    public enum ExpenseStatus {
        DRAFT, SUBMITTED, APPROVED, REJECTED, PAID
    }
}
