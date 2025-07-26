import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "../routes/auth.routes";
import { createTestUser, generateTestTokens } from "./helpers/auth.helper";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);

describe("Authentication System", () => {
  describe("Local Authentication", () => {
    describe("Registration", () => {
      it("should register a new user successfully", async () => {
        const userData = {
          email: "newuser@example.com",
          password: "password123",
          name: "New User",
        };

        const response = await request(app)
          .post("/auth/register")
          .send(userData);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Registration successful");
        expect(response.body.user).toHaveProperty("id");
        expect(response.body.user.email).toBe(userData.email);
        expect(response.body.user.name).toBe(userData.name);
        expect(response.body.user.authProvider).toBe("local");

        // Check if cookies are set
        expect(response.headers["set-cookie"]).toBeDefined();
        expect(response.headers["set-cookie"]).toHaveLength(2);
      });

      it("should not register a user with existing email", async () => {
        const existingUser = await createTestUser();

        const response = await request(app).post("/auth/register").send({
          email: existingUser.email,
          password: "password123",
          name: "Another User",
        });

        expect(response.status).toBe(409);
        expect(response.body.message).toBe("User already exists");
      });
    });

    describe("Login", () => {
      it("should login successfully with correct credentials", async () => {
        const user = await createTestUser();

        const response = await request(app).post("/auth/login").send({
          email: user.email,
          password: "password123",
        });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Login successful");
        expect(response.body.user).toHaveProperty("id");
        expect(response.body.user.email).toBe(user.email);

        // Check if cookies are set
        expect(response.headers["set-cookie"]).toBeDefined();
        expect(response.headers["set-cookie"]).toHaveLength(2);
      });

      it("should not login with incorrect password", async () => {
        const user = await createTestUser();

        const response = await request(app).post("/auth/login").send({
          email: user.email,
          password: "wrongpassword",
        });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid credentials");
      });

      it("should not login with non-existent email", async () => {
        const response = await request(app).post("/auth/login").send({
          email: "nonexistent@example.com",
          password: "password123",
        });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid credentials");
      });
    });
  });

  describe("Token Management", () => {
    it("should refresh tokens successfully", async () => {
      const user = await createTestUser();
      const { accessToken } = generateTestTokens(user);

      const response = await request(app)
        .post("/auth/refresh-token")
        .set("Cookie", [`refreshToken=${accessToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Token refresh successful");
      expect(response.headers["set-cookie"]).toBeDefined();
      expect(response.headers["set-cookie"]).toHaveLength(2);
    });

    it("should not refresh tokens with invalid refresh token", async () => {
      const response = await request(app)
        .post("/auth/refresh-token")
        .set("Cookie", ["refreshToken=invalidtoken"]);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid refresh token");
    });
  });

  describe("Logout", () => {
    it("should logout successfully", async () => {
      const user = await createTestUser();
      const { accessToken } = generateTestTokens(user);

      const response = await request(app)
        .post("/auth/logout")
        .set("Cookie", [`accessToken=${accessToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Logout successful");

      // Check if cookies are cleared
      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies).toHaveLength(2);
      expect(cookies[0]).toMatch(/accessToken=;/);
      expect(cookies[1]).toMatch(/refreshToken=;/);
    });
  });
});
