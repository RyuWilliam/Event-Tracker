package co.edu.uptc.EventTracker.web.dto;

public class AuthResponse {

    private String accessToken;

    public AuthResponse(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getAccessToken() {
        return accessToken;
    }
}