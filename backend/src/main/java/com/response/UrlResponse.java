package com.response;

import lombok.Data;
import lombok.Getter;

@Data
@Getter
public class UrlResponse {
    private String code;
    private String message;
    private String data;

    public UrlResponse(String code, String message, String data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }
}
