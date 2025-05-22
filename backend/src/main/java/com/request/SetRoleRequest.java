package com.request;

import lombok.Data;

@Data
public class SetRoleRequest {

    private Integer userId;

    private String role;
}
