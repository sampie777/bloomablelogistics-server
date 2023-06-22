const mockFetch = jest.fn(() => Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({})
}))

jest.mock("bloomablelogistics-server/src/api", () => ({
    api: {
        fcm: {
            notification: {
                send: mockFetch
            }
        }
    }
}))
