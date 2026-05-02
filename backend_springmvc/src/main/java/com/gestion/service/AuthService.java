package com.gestion.service;

import com.gestion.dto.AuthRequest;
import com.gestion.dto.AuthResponse;

public interface AuthService {
    AuthResponse login(AuthRequest request);
}
