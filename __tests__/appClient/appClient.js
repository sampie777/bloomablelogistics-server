import {AppClient} from "../../src/appClient";

describe("appClient", () => {
    it("converts usernames to valid topic names", () => {
        expect(AppClient.convertUsernameToTopicName("username")).toBe("username")
        expect(AppClient.convertUsernameToTopicName("  username  ")).toBe("username")
        expect(AppClient.convertUsernameToTopicName("user@email.com")).toBe("user-email.com")
        expect(AppClient.convertUsernameToTopicName("user/te,st;")).toBe("user-te-st-")
        expect(AppClient.convertUsernameToTopicName("user-te.st%")).toBe("user-te.st%")
    })
})
