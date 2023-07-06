import {getCookieValue} from "../../../src/bloomable/utils";

describe("getCookieValue", () => {
    it("extracts the correct key value pair", () => {
        const cookies = "XSRF-TOKEN=token%3D; expires=Mon, 03 Jul 2023 10:55:00 GMT; Max-Age=7200; path=/; samesite=lax, bloomable_session=session%3D; expires=Mon, 03 Jul 2023 10:55:00 GMT; Max-Age=7200; path=/; httponly; samesite=lax";
        expect(getCookieValue(cookies, "XSRF-TOKEN")).toBe("token%3D")
        expect(getCookieValue(cookies, "bloomable_session")).toBe("session%3D")
    })
})
