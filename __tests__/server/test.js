import request from "supertest";
import {Server} from "../../src/server";

describe("server", () => {
    it("test health check endpoint", () => {
        Server.setup()
        return request(Server.app)
            .get("/api/v1/health")
            .then(response => {
                expect(response.statusCode).toBe(200)
                expect(response.text).toBe("OK")
            })
    })
})
