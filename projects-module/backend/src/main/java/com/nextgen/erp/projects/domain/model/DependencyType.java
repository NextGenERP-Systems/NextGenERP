package com.nextgen.erp.projects.domain.model;

public enum DependencyType {
    FINISH_TO_START,  // Task B cannot start until Task A finishes
    START_TO_START,   // Task B cannot start until Task A starts
    FINISH_TO_FINISH, // Task B cannot finish until Task A finishes
    START_TO_FINISH   // Task B cannot finish until Task A starts
}
